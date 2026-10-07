from fastapi import APIRouter, HTTPException, Depends, status
from typing import List
from schemas.schemas import (
    ExtractRequestSchema,
    ExtractResponseSchema,
    InvoiceCreateSchema,
    CloudinaryUploadRequest,
    CloudinaryUploadResponse
)
from services.gemini_ocr import extract_invoice_with_gemini
from services.cloudinary_service import upload_image_to_cloudinary

router = APIRouter(prefix="/api", tags=["Invoices & OCR"])

@router.post("/cloudinary/upload", response_model=CloudinaryUploadResponse)
def upload_to_cloudinary(payload: CloudinaryUploadRequest):
    if not payload.imageBase64:
        raise HTTPException(status_code=400, detail="Missing imageBase64 payload")
    return upload_image_to_cloudinary(payload.imageBase64)

@router.post("/invoices/extract", response_model=ExtractResponseSchema)
def extract_invoice(payload: ExtractRequestSchema):
    if not payload.imageBase64:
        return ExtractResponseSchema(
            success=False,
            message="OCR extraction failed",
            reason="Missing imageBase64 payload"
        )

    try:
        extracted = extract_invoice_with_gemini(payload.imageBase64, payload.mimeType or "image/jpeg")
        return ExtractResponseSchema(
            success=True,
            cloudinary_url=payload.cloudinaryUrl,
            invoice=extracted
        )
    except Exception as err:
        return ExtractResponseSchema(
            success=False,
            message="OCR extraction failed",
            reason=str(err)
        )

@router.get("/invoices")
def list_invoices():
    return {"success": True, "invoices": []}

@router.post("/invoices", status_code=status.HTTP_201_CREATED)
def create_invoice(invoice: InvoiceCreateSchema):
    return {"success": True, "invoice": invoice}
