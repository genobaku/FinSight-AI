"""
Versioned Pydantic V2 Schemas for Finsight AI Core API Contract (v1).
Exposes comprehensive, dynamic semantic extraction metadata without fabrication.
"""

from typing import List, Dict, Any, Optional, Union
from datetime import datetime
from pydantic import BaseModel, Field

# -------------------------------------------------------------
# 1. Base Metadata & Evidence Models
# -------------------------------------------------------------

class SourceEvidenceSchema(BaseModel):
    text: str = Field(..., description="Verbatim raw text snippet from which the value was extracted")
    page: int = Field(default=1, description="1-indexed document page number")
    bounding_box: Optional[List[float]] = Field(
        default=None,
        description="Bounding box [x_min, y_min, x_max, y_max] normalized or pixel coordinate if available"
    )

class ExtractedFieldSchema(BaseModel):
    id: str = Field(..., description="Unique immutable field identifier")
    label: str = Field(..., description="Canonical or dynamically discovered field label")
    original_label: Optional[str] = Field(None, description="Original source label verbatim from document")
    value: Any = Field(..., description="Extracted and normalized field value")
    data_type: str = Field(
        default="text",
        description="Data type: text, integer, decimal, currency, date, boolean, array, object"
    )
    semantic_category: str = Field(
        default="general",
        description="Semantic category: merchant, financial_total, tax, subtotal, date, identity, education, metric, general"
    )
    source_evidence: Optional[SourceEvidenceSchema] = Field(None, description="Verifiable source text and location")
    confidence: Optional[float] = Field(
        default=None,
        description="Calibrated confidence score between 0.0 and 1.0; null when uncalibrated"
    )
    verification_status: str = Field(
        default="pending",
        description="Verification lifecycle status: pending, verified, user_modified, rejected"
    )

class ExtractedTableSchema(BaseModel):
    id: str = Field(..., description="Unique table identifier")
    title: str = Field(default="Table", description="Table title or context")
    headers: List[str] = Field(default_factory=list, description="Column headers list")
    rows: List[List[Any]] = Field(default_factory=list, description="Structured 2D matrix of row cells")
    source_evidence: Optional[Dict[str, Any]] = Field(None, description="Table localization evidence")

# -------------------------------------------------------------
# 2. Document Ingestion & Job Models
# -------------------------------------------------------------

class DocumentUploadResponse(BaseModel):
    success: bool = True
    document_id: str
    filename: str
    file_size_bytes: int
    format: str
    owner_id: str
    status: str = Field(default="uploaded", description="uploaded, processing, completed, failed")
    created_at: str

class DocumentSummarySchema(BaseModel):
    document_id: str
    filename: str
    format: str
    status: str
    created_at: str
    document_type: Optional[str] = "unknown"
    domain: Optional[str] = "general"
    field_count: int = 0
    table_count: int = 0
    is_verified: bool = False

class JobStatusResponse(BaseModel):
    job_id: str
    document_id: str
    status: str = Field(..., description="queued, processing, completed, failed")
    progress_percentage: int = Field(default=0, ge=0, le=100)
    created_at: str
    completed_at: Optional[str] = None
    error_message: Optional[str] = None

# -------------------------------------------------------------
# 3. Extraction Request & Result Contract
# -------------------------------------------------------------

class ExtractionOptions(BaseModel):
    async_processing: bool = Field(
        default=False,
        description="Set to true for long multi-page documents to return 202 Accepted with job_id"
    )
    include_raw_text: bool = Field(default=True, description="Whether to include full extracted raw text")
    run_transaction_classification: bool = Field(
        default=True,
        description="Whether to run the Scikit-learn transaction categorizer for financial documents"
    )

class DocumentResultResponse(BaseModel):
    success: bool = True
    document_id: str
    document_type: str = Field(default="unknown", description="receipt, invoice, academic_record, business_report, etc.")
    domain: str = Field(default="general", description="finance, education, identity, business, healthcare, etc.")
    extraction_status: str = Field(default="needs_review", description="needs_review, verified, incomplete")
    fields: List[ExtractedFieldSchema] = Field(default_factory=list)
    tables: List[ExtractedTableSchema] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    raw_text: Optional[str] = None
    processed_at: str
    # Transaction categorization metadata
    transaction_category: Optional[str] = None
    transaction_confidence: Optional[float] = None
    # Backward compatibility container for demo application
    legacy_invoice: Optional[Dict[str, Any]] = None

# -------------------------------------------------------------
# 4. User Correction & Verification Contract
# -------------------------------------------------------------

class FieldPatchRequest(BaseModel):
    value: Any = Field(..., description="Updated user-corrected value")
    label: Optional[str] = Field(None, description="Optional updated label")
    verification_status: Optional[str] = Field(
        default="user_modified",
        description="New verification status: user_modified, verified, rejected"
    )

class DocumentVerifyRequest(BaseModel):
    action: str = Field(default="approve", description="approve or reject")
    reviewer_notes: Optional[str] = None

class DocumentVerifyResponse(BaseModel):
    success: bool = True
    document_id: str
    extraction_status: str
    verified_at: str
    verified_fields_count: int
    message: str

# -------------------------------------------------------------
# 5. Model Registry & Health Contract
# -------------------------------------------------------------

class ModelInfo(BaseModel):
    model_id: str
    name: str
    task: str
    architecture: str
    status: str
    parameters_or_classes: Optional[Union[int, List[str]]] = None
    notes: str

class ModelRegistryResponse(BaseModel):
    active_ocr_engine: str
    models: List[ModelInfo]

class HealthResponse(BaseModel):
    status: str = "ok"
    service: str = "FinSight AI Core API"
    version: str = "1.0.0"
    ml_models_loaded: bool
    ocr_engine_available: bool
    storage_vault_ready: bool
    database_connected: bool
    timestamp: str
