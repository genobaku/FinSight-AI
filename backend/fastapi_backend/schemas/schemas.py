from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional

class InvoiceItemSchema(BaseModel):
    name: str
    quantity: float = 1.0
    unit_price: float = 0.0
    total: float = 0.0

class ExtractedInvoiceSchema(BaseModel):
    vendor: Optional[str] = None
    invoice_number: Optional[str] = None
    invoice_date: Optional[str] = None
    currency: Optional[str] = "USD"
    subtotal: Optional[float] = 0.0
    tax: Optional[float] = 0.0
    tax_rate: Optional[str] = None
    total: Optional[float] = 0.0
    payment_method: Optional[str] = None
    category: Optional[str] = None
    confidence: float = 98.0
    items: List[InvoiceItemSchema] = []

class ExtractRequestSchema(BaseModel):
    imageBase64: str
    mimeType: Optional[str] = "image/jpeg"
    cloudinaryUrl: Optional[str] = None

class ExtractResponseSchema(BaseModel):
    success: bool
    message: Optional[str] = None
    reason: Optional[str] = None
    cloudinary_url: Optional[str] = None
    ocr_text: Optional[str] = ""
    invoice: Optional[ExtractedInvoiceSchema] = None

class CloudinaryUploadRequest(BaseModel):
    imageBase64: str

class CloudinaryUploadResponse(BaseModel):
    success: bool
    secure_url: str
    public_id: str
    format: str
    width: int
    height: int
    bytes: int
    original_filename: str
    isCloudinaryDirect: bool

class InvoiceCreateSchema(BaseModel):
    invoiceNumber: str
    customerId: Optional[str] = None
    customerName: str
    customerEmail: Optional[str] = None
    issueDate: str
    dueDate: str
    subtotal: float
    taxTotal: float
    discountTotal: float = 0.0
    total: float
    status: str = "Pending"
    currency: str = "USD"
    notes: Optional[str] = None
    paymentTerms: str = "Net 30"
    items: List[dict] = []

class VendorCreateSchema(BaseModel):
    name: str
    category: str
    contactEmail: Optional[str] = None
    contactPhone: Optional[str] = None

class CustomerCreateSchema(BaseModel):
    name: str
    company: str
    email: str
    phone: Optional[str] = None
    address: Optional[str] = None

class AIChatRequest(BaseModel):
    message: str
    context: Optional[dict] = None

class AIChatResponse(BaseModel):
    success: bool
    reply: str
