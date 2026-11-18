"""
Core Extraction & Pipeline Service Adapter
Encapsulates DocumentProcessor execution, safe file storage, and database persistence.
"""

import os
import io
import json
import uuid
from datetime import datetime
from typing import Dict, Any, Optional, Tuple, List
from sqlalchemy.orm import Session

from core_api.core.config import settings
from core_api.db.database import DocumentRecord, FieldRecord, TableRecord, JobRecord, AuditLogRecord
from backend.document_processing.processor import DocumentProcessor
from core_api.schemas.v1_schemas import (
    ExtractedFieldSchema, ExtractedTableSchema, SourceEvidenceSchema,
    DocumentResultResponse
)

# Global singleton instance of DocumentProcessor
_processor_instance: Optional[DocumentProcessor] = None

def get_processor() -> DocumentProcessor:
    global _processor_instance
    if _processor_instance is None:
        _processor_instance = DocumentProcessor(
            model_path=settings.MODEL_PATH,
            vectorizer_path=settings.VECTORIZER_PATH
        )
    return _processor_instance

def save_uploaded_file(file_bytes: bytes, safe_filename: str) -> Tuple[str, str]:
    """
    Saves document in private storage vault with UUID-keyed path to prevent overwrites & traversal.
    Returns (vault_id, absolute_file_path).
    """
    vault_id = str(uuid.uuid4())
    _, ext = os.path.splitext(safe_filename)
    stored_name = f"{vault_id}{ext}"
    vault_path = os.path.join(settings.STORAGE_DIR, stored_name)

    os.makedirs(settings.STORAGE_DIR, exist_ok=True)
    with open(vault_path, "wb") as f:
        f.write(file_bytes)

    return vault_id, vault_path

def execute_document_extraction(
    document_id: str,
    db: Session,
    job_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Executes DocumentProcessor on the stored document file, persists fields and tables in DB,
    and updates Job status if applicable.
    """
    doc_rec = db.query(DocumentRecord).filter(DocumentRecord.id == document_id).first()
    if not doc_rec:
        raise ValueError(f"Document with ID '{document_id}' not found.")

    job_rec = None
    if job_id:
        job_rec = db.query(JobRecord).filter(JobRecord.id == job_id).first()
        if job_rec:
            job_rec.status = "processing"
            job_rec.progress = 20
            db.commit()

    if not os.path.exists(doc_rec.stored_path):
        err_msg = f"Document payload missing in storage vault: {doc_rec.stored_path}"
        if job_rec:
            job_rec.status = "failed"
            job_rec.error_message = err_msg
            db.commit()
        raise FileNotFoundError(err_msg)

    with open(doc_rec.stored_path, "rb") as f:
        file_bytes = f.read()

    # Update job progress
    if job_rec:
        job_rec.progress = 40
        db.commit()

    # Run extraction pipeline
    processor = get_processor()
    extraction_output = processor.process_document(doc_rec.filename, file_bytes)

    if not extraction_output.get("success"):
        err_msg = extraction_output.get("error", "Document extraction failed")
        doc_rec.status = "failed"
        doc_rec.warnings_json = json.dumps([err_msg])
        if job_rec:
            job_rec.status = "failed"
            job_rec.error_message = err_msg
            job_rec.completed_at = datetime.utcnow()
        db.commit()
        return extraction_output

    if job_rec:
        job_rec.progress = 75
        db.commit()

    # Clear prior fields and tables if re-extracting
    db.query(FieldRecord).filter(FieldRecord.document_id == document_id).delete()
    db.query(TableRecord).filter(TableRecord.document_id == document_id).delete()

    # Update DocumentRecord
    doc_rec.status = "completed"
    doc_rec.document_type = extraction_output.get("document_type", "unknown")
    doc_rec.domain = extraction_output.get("domain", "general")
    doc_rec.extraction_status = extraction_output.get("extraction_status", "needs_review")
    doc_rec.raw_text = extraction_output.get("raw_text", "")
    doc_rec.metadata_json = json.dumps(extraction_output.get("metadata", {}))
    doc_rec.warnings_json = json.dumps(extraction_output.get("warnings", []))
    doc_rec.transaction_category = extraction_output.get("category")
    doc_rec.transaction_confidence = extraction_output.get("confidence")

    # Persist extracted fields
    raw_fields = extraction_output.get("fields", [])
    for f in raw_fields:
        f_base_id = f.get("id") or "field"
        # Prefix with document_id or uuid to guarantee table-wide uniqueness
        f_id = f"{document_id}_{f_base_id}" if not f_base_id.startswith(document_id) else f_base_id
        ev = f.get("source_evidence") or {}
        bbox = ev.get("bounding_box") if isinstance(ev, dict) else None

        field_rec = FieldRecord(
            id=f_id,
            document_id=document_id,
            label=f.get("label", "Unknown Field"),
            original_label=f.get("original_label"),
            value_json=json.dumps(f.get("value")),
            data_type=f.get("data_type", "text"),
            semantic_category=f.get("semantic_category", "general"),
            confidence=f.get("confidence"),
            verification_status=f.get("verification_status", "pending"),
            evidence_text=ev.get("text") if isinstance(ev, dict) else None,
            evidence_page=ev.get("page", 1) if isinstance(ev, dict) else 1,
            bounding_box_json=json.dumps(bbox) if bbox else None
        )
        db.add(field_rec)

    # Persist extracted tables
    raw_tables = extraction_output.get("tables", [])
    for t in raw_tables:
        t_base_id = t.get("id") or "table"
        t_id = f"{document_id}_{t_base_id}" if not t_base_id.startswith(document_id) else t_base_id
        table_rec = TableRecord(
            id=t_id,
            document_id=document_id,
            title=t.get("title", "Extracted Table"),
            headers_json=json.dumps(t.get("headers", [])),
            rows_json=json.dumps(t.get("rows", [])),
            evidence_json=json.dumps(t.get("source_evidence")) if t.get("source_evidence") else None
        )
        db.add(table_rec)

    # Log audit entry
    audit = AuditLogRecord(
        document_id=document_id,
        actor_id=doc_rec.owner_id,
        action="extract",
        details_json=json.dumps({
            "fields_count": len(raw_fields),
            "tables_count": len(raw_tables),
            "document_type": doc_rec.document_type
        })
    )
    db.add(audit)

    if job_rec:
        job_rec.status = "completed"
        job_rec.progress = 100
        job_rec.completed_at = datetime.utcnow()

    db.commit()
    db.refresh(doc_rec)

    return extraction_output

def build_document_result_response(doc_rec: DocumentRecord, db: Session) -> DocumentResultResponse:
    """Builds a strongly-typed DocumentResultResponse from database records."""
    fields_list = []
    for f in doc_rec.fields:
        val = json.loads(f.value_json)
        ev = None
        if f.evidence_text:
            bbox = json.loads(f.bounding_box_json) if f.bounding_box_json else None
            ev = SourceEvidenceSchema(
                text=f.evidence_text,
                page=f.evidence_page,
                bounding_box=bbox
            )
        fields_list.append(ExtractedFieldSchema(
            id=f.id,
            label=f.label,
            original_label=f.original_label,
            value=val,
            data_type=f.data_type,
            semantic_category=f.semantic_category,
            source_evidence=ev,
            confidence=f.confidence,
            verification_status=f.verification_status
        ))

    tables_list = []
    for t in doc_rec.tables:
        tables_list.append(ExtractedTableSchema(
            id=t.id,
            title=t.title,
            headers=json.loads(t.headers_json),
            rows=json.loads(t.rows_json),
            source_evidence=json.loads(t.evidence_json) if t.evidence_json else None
        ))

    warnings = json.loads(doc_rec.warnings_json) if doc_rec.warnings_json else []
    metadata = json.loads(doc_rec.metadata_json) if doc_rec.metadata_json else {}

    # Build backward-compatible legacy invoice object for demo UI
    legacy_invoice = {
        "vendor": next((f.value for f in fields_list if f.semantic_category in ["merchant", "organization"]), None),
        "invoice_number": next((f.value for f in fields_list if f.semantic_category == "invoice_number" or "invoice" in f.label.lower()), None),
        "invoice_date": next((f.value for f in fields_list if f.semantic_category == "date"), None),
        "currency": next((f.value for f in fields_list if f.semantic_category == "currency"), "USD"),
        "subtotal": next((f.value for f in fields_list if f.semantic_category == "subtotal"), None),
        "tax": next((f.value for f in fields_list if f.semantic_category == "tax"), None),
        "total": next((f.value for f in fields_list if f.semantic_category == "financial_total"), None),
        "category": doc_rec.transaction_category or "General Expense",
        "items": []
    }
    if tables_list and tables_list[0].rows:
        for row in tables_list[0].rows:
            legacy_invoice["items"].append({
                "description": str(row[0]) if len(row) > 0 else "Item",
                "quantity": 1,
                "price": row[-1] if len(row) > 1 else 0.0,
                "total": row[-1] if len(row) > 1 else 0.0
            })

    return DocumentResultResponse(
        success=True,
        document_id=doc_rec.id,
        document_type=doc_rec.document_type,
        domain=doc_rec.domain,
        extraction_status=doc_rec.extraction_status,
        fields=fields_list,
        tables=tables_list,
        warnings=warnings,
        metadata=metadata,
        raw_text=doc_rec.raw_text,
        processed_at=doc_rec.updated_at.isoformat(),
        transaction_category=doc_rec.transaction_category,
        transaction_confidence=doc_rec.transaction_confidence,
        legacy_invoice=legacy_invoice
    )
