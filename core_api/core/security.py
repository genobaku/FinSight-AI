"""
Finsight AI Core API Security & Authentication
Handles API key validation, JWT claims, file validation, and path traversal protection.
"""

import os
import re
import io
import hmac
import hashlib
import time
from typing import Optional, Dict, Any, Tuple
from fastapi import Request, HTTPException, Security, status, Depends
from fastapi.security import APIKeyHeader, HTTPBearer, HTTPAuthorizationCredentials
import jwt
from PIL import Image

from core_api.core.config import settings

api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)
http_bearer = HTTPBearer(auto_error=False)

# In-memory sliding window rate limiter
_request_records: Dict[str, list] = {}

class SecurityContext:
    def __init__(self, client_id: str, client_type: str = "api_key", owner_id: Optional[str] = None):
        self.client_id = client_id
        self.client_type = client_type
        self.owner_id = owner_id or client_id

def get_authorized_keys() -> set:
    keys = {k.strip() for k in settings.API_KEYS.split(",") if k.strip()}
    return keys

def verify_authentication(
    api_key: Optional[str] = Security(api_key_header),
    bearer_creds: Optional[HTTPAuthorizationCredentials] = Security(http_bearer)
) -> SecurityContext:
    """
    Validates either X-API-Key header or Bearer JWT token.
    Raises HTTP 401 if unauthorized.
    """
    authorized_keys = get_authorized_keys()

    # 1. Check API Key
    if api_key:
        clean_key = api_key.strip()
        # Constant time comparison across valid keys
        for valid_key in authorized_keys:
            if hmac.compare_digest(clean_key.encode("utf-8"), valid_key.encode("utf-8")):
                # Generate stable client id from key prefix
                client_id = f"client_{hashlib.sha256(clean_key.encode()).hexdigest()[:12]}"
                return SecurityContext(client_id=client_id, client_type="api_key", owner_id=client_id)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or unauthorized X-API-Key provided."
        )

    # 2. Check Bearer JWT Token
    if bearer_creds and bearer_creds.credentials:
        token = bearer_creds.credentials
        try:
            payload = jwt.decode(
                token,
                settings.JWT_SECRET,
                algorithms=[settings.JWT_ALGORITHM]
            )
            sub = payload.get("sub")
            if not sub:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token: missing subject.")
            return SecurityContext(client_id=sub, client_type="jwt", owner_id=payload.get("owner_id", sub))
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Bearer token has expired.")
        except jwt.PyJWTError as e:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"JWT validation failure: {str(e)}")

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Authentication required. Provide an authorized 'X-API-Key' header or 'Bearer' JWT token."
    )

def check_rate_limit(request: Request, client_context: SecurityContext = Depends(verify_authentication)):
    """Simple sliding-window per-client rate limiter."""
    now = time.time()
    client_id = client_context.client_id
    window = 60.0
    limit = settings.RATE_LIMIT_PER_MINUTE

    records = _request_records.get(client_id, [])
    # Filter out entries older than 60s
    records = [t for t in records if now - t < window]
    if len(records) >= limit:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Rate limit exceeded. Maximum {limit} requests per minute allowed."
        )
    records.append(now)
    _request_records[client_id] = records
    return True

def sanitize_safe_filename(filename: str) -> str:
    """Sanitizes filename and strips all directory traversal attempts."""
    base = os.path.basename(filename)
    safe = re.sub(r'[^a-zA-Z0-9._-]', '_', base)
    if not safe or safe in [".", ".."]:
        safe = "document.bin"
    return safe

def validate_uploaded_bytes(filename: str, file_bytes: bytes) -> Tuple[str, str]:
    """
    Validates file size, extensions, magic header bytes, and rejects malicious executables.
    Returns (safe_filename, lowercase_extension).
    """
    if len(file_bytes) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file payload is empty (0 bytes)."
        )

    if len(file_bytes) > settings.MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Uploaded file exceeds maximum limit of {settings.MAX_FILE_SIZE_BYTES // (1024 * 1024)} MB."
        )

    ext = os.path.splitext(filename)[1].lower()
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported file extension '{ext}'. Allowed extensions: {', '.join(sorted(settings.ALLOWED_EXTENSIONS))}"
        )

    # Reject executable headers immediately
    if file_bytes.startswith(b"MZ") or file_bytes.startswith(b"\x7fELF"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Executable binary uploads are strictly prohibited."
        )

    # Magic-byte format checks
    if ext == ".pdf":
        if not file_bytes.startswith(b"%PDF"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid file header. Does not match a valid PDF document."
            )
    elif ext in [".png", ".jpg", ".jpeg", ".webp"]:
        try:
            img = Image.open(io.BytesIO(file_bytes))
            img.verify()
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Uploaded image is corrupt or formatted incorrectly: {str(e)}"
            )
    elif ext in [".docx", ".xlsx"]:
        if not (file_bytes.startswith(b"PK\x03\x04") or file_bytes.startswith(b"PK\x05\x06")):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid file header. File does not match {ext.upper()} archive format."
            )

    safe_name = sanitize_safe_filename(filename)
    return safe_name, ext
