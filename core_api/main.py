"""
Finsight AI Core API Application Entrypoint
Mounts /v1 core routes, establishes CORS middleware, initializes database tables,
and maintains backward-compatible /api/classify-document compatibility.
"""

import os
import sys
import time
import base64
from contextlib import asynccontextmanager

# Ensure project root is in sys.path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(BASE_DIR)
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from fastapi import FastAPI, Request, Response, status, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from core_api.core.config import settings
from core_api.db.database import init_db
from core_api.routers.v1_router import router as v1_router
from core_api.services.extraction_service import get_processor

# Ensure database and tables are created immediately
init_db()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize Database and Warm ML Models
    init_db()
    try:
        proc = get_processor()
        print("FinSight AI Core: DocumentProcessor & Models initialized successfully.")
    except Exception as e:
        print(f"FinSight AI Core Warning: Processor initialization: {e}")
    yield
    # Shutdown
    print("FinSight AI Core API shutdown completed.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Private Modular Document Intelligence & Structured Extraction API",
    openapi_url="/v1/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# 1. CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# 2. Request Timing & Tracing Middleware
@app.middleware("http")
async def add_process_time_and_tracing(request: Request, call_next):
    start_time = time.time()
    response: Response = await call_next(request)
    process_time = (time.time() - start_time) * 1000
    response.headers["X-Process-Time-Ms"] = f"{process_time:.2f}"
    response.headers["X-API-Version"] = settings.VERSION
    return response

# 3. Mount Versioned v1 Router
app.include_router(v1_router)

# -------------------------------------------------------------
# 4. Backward Compatibility Routes for Existing Demos & Tests
# -------------------------------------------------------------
@app.get("/api/health")
def legacy_health():
    """Backward compatibility health check for existing frontend/test runners."""
    processor = get_processor()
    return {
        "status": "ok",
        "service": "FinSight AI Core Unified Service",
        "ml_loaded": processor.model is not None
    }

@app.post("/api/classify-document")
async def legacy_classify_document(request: Request):
    """
    Backward-compatibility route accepting legacy multipart or base64 JSON payload.
    Directly connects to DocumentProcessor without requiring client redesign.
    """
    processor = get_processor()
    content_type = request.headers.get("content-type", "")
    filename = "document.bin"
    file_bytes = b""

    if "multipart/form-data" in content_type:
        form = await request.form()
        uploaded_file = form.get("file")
        if not uploaded_file:
            return JSONResponse(status_code=400, content={"success": False, "error": "No file field found in form."})
        filename = uploaded_file.filename or "document.bin"
        file_bytes = await uploaded_file.read()

    elif "application/json" in content_type:
        body = await request.json()
        b64_payload = body.get("imageBase64", "")
        filename = body.get("filename", "document.txt")
        if not b64_payload:
            return JSONResponse(status_code=400, content={"success": False, "error": "Missing imageBase64 in JSON payload."})
        if "," in b64_payload:
            b64_payload = b64_payload.split(",", 1)[1]
        try:
            file_bytes = base64.b64decode(b64_payload)
        except Exception as e:
            return JSONResponse(status_code=400, content={"success": False, "error": f"Invalid base64 payload: {str(e)}"})
    else:
        return JSONResponse(
            status_code=400,
            content={"success": False, "error": "Request must be multipart/form-data with 'file' or JSON with 'imageBase64'."}
        )

    if not file_bytes:
        return JSONResponse(status_code=400, content={"success": False, "error": "Document payload is empty."})

    result = processor.process_document(filename, file_bytes)
    status_code = 200 if result.get("success") else 400
    return JSONResponse(status_code=status_code, content=result)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("core_api.main:app", host=settings.HOST, port=settings.PORT, reload=False)
