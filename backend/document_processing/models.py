"""
Dynamic Document Intelligence Models & Schemas
Defines the validated extraction contract for heterogeneous documents.
"""

from typing import List, Dict, Any, Optional, Union
from dataclasses import dataclass, field
import uuid

@dataclass
class SourceEvidence:
    text: str
    page: int = 1
    bounding_box: Optional[List[float]] = None  # [x_min, y_min, x_max, y_max]

    def to_dict(self) -> Dict[str, Any]:
        return {
            "text": self.text,
            "page": self.page,
            "bounding_box": self.bounding_box
        }

@dataclass
class ExtractedField:
    id: str
    label: str
    value: Any
    data_type: str = "text"  # text, integer, decimal, currency, date, boolean, array, object
    semantic_category: str = "general"  # merchant, financial_total, tax, subtotal, date, identity, education, metric, general
    source_evidence: Optional[SourceEvidence] = None
    confidence: Optional[float] = None  # None if not calibrated; never artificial
    verification_status: str = "pending"  # pending, verified, user_modified, rejected
    original_label: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "label": self.label,
            "original_label": self.original_label or self.label,
            "value": self.value,
            "data_type": self.data_type,
            "semantic_category": self.semantic_category,
            "source_evidence": self.source_evidence.to_dict() if self.source_evidence else None,
            "confidence": self.confidence,
            "verification_status": self.verification_status
        }

@dataclass
class ExtractedTable:
    id: str
    title: str
    headers: List[str]
    rows: List[List[Any]]
    source_evidence: Optional[Dict[str, Any]] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "title": self.title,
            "headers": self.headers,
            "rows": self.rows,
            "source_evidence": self.source_evidence
        }

@dataclass
class DynamicDocumentResponse:
    success: bool
    document_type: str = "unknown"  # receipt, invoice, academic_record, business_report, identity_document, contract, spreadsheet, database_export, general_document, unknown
    domain: str = "general"  # finance, education, identity, business, healthcare, legal, general
    fields: List[ExtractedField] = field(default_factory=list)
    tables: List[ExtractedTable] = field(default_factory=list)
    warnings: List[str] = field(default_factory=list)
    extraction_status: str = "needs_review"  # needs_review, verified, incomplete
    metadata: Dict[str, Any] = field(default_factory=dict)
    raw_text: str = ""
    error: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        fields_dicts = [f.to_dict() for f in self.fields]
        tables_dicts = [t.to_dict() for t in self.tables]

        # Build backward-compatible legacy invoice dictionary
        legacy_invoice = self._build_legacy_invoice_dict(fields_dicts, tables_dicts)

        # Build backward-compatible category & confidence
        category = self.domain.capitalize() if self.domain != "general" else "General Document"
        if self.document_type in ["receipt", "invoice"]:
            category = "Finance"

        confidence_val = None
        confidences = [f.confidence for f in self.fields if f.confidence is not None]
        if confidences:
            confidence_val = round(sum(confidences) / len(confidences), 4)

        return {
            "success": self.success,
            "document_type": self.document_type,
            "domain": self.domain,
            "fields": fields_dicts,
            "tables": tables_dicts,
            "warnings": self.warnings,
            "extraction_status": self.extraction_status,
            "metadata": self.metadata,
            "raw_text": self.raw_text,
            "extracted_text": self.raw_text[:300] + ("..." if len(self.raw_text) > 300 else ""),
            "full_extracted_text": self.raw_text,
            "error": self.error,
            # Backward compatibility keys for existing frontend
            "category": category,
            "confidence": confidence_val,
            "classification": {
                "category": category,
                "confidence": confidence_val
            },
            "invoice": legacy_invoice
        }

    def _build_legacy_invoice_dict(self, fields_dicts: List[Dict[str, Any]], tables_dicts: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Constructs a legacy invoice dictionary so existing frontend components remain functional."""
        # Look through fields explicitly by semantic category and priority
        vendor = next((f["value"] for f in fields_dicts if f.get("semantic_category") in ["merchant", "organization", "institution"]), None)
        invoice_number = next((f["value"] for f in fields_dicts if f.get("semantic_category") == "invoice_number" or any(k in f.get("label", "").lower() for k in ["invoice", "inv #", "receipt #", "order #"])), None)
        invoice_date = next((f["value"] for f in fields_dicts if f.get("semantic_category") == "date"), None)
        currency = next((f["value"] for f in fields_dicts if f.get("semantic_category") == "currency"), None)
        subtotal = next((f["value"] for f in fields_dicts if f.get("semantic_category") == "subtotal"), None)
        tax = next((f["value"] for f in fields_dicts if f.get("semantic_category") == "tax"), None)
        tax_rate = next((f["value"] for f in fields_dicts if f.get("semantic_category") == "tax_rate"), None)
        total = next((f["value"] for f in fields_dicts if f.get("semantic_category") == "financial_total"), None)
        payment_method = next((f["value"] for f in fields_dicts if f.get("semantic_category") == "payment_method"), None)

        # Build items from detected tables
        items = []
        if tables_dicts:
            first_table = tables_dicts[0]
            headers = [h.lower() for h in first_table.get("headers", [])]
            name_idx = next((i for i, h in enumerate(headers) if any(k in h for k in ["item", "desc", "name", "product"])), 0)
            qty_idx = next((i for i, h in enumerate(headers) if any(k in h for k in ["qty", "quantity", "count"])), None)
            price_idx = next((i for i, h in enumerate(headers) if any(k in h for k in ["unit", "rate", "price"])), None)
            total_idx = next((i for i, h in enumerate(headers) if any(k in h for k in ["total", "amount"])), None)

            for row in first_table.get("rows", []):
                if len(row) > name_idx:
                    desc = str(row[name_idx])
                    q = 1
                    if qty_idx is not None and len(row) > qty_idx:
                        try:
                            q = float(row[qty_idx])
                        except Exception:
                            q = 1
                    u_price = None
                    if price_idx is not None and len(row) > price_idx:
                        try:
                            u_price = float(str(row[price_idx]).replace("$", "").replace("€", "").replace("£", "").strip())
                        except Exception:
                            pass
                    row_tot = None
                    if total_idx is not None and len(row) > total_idx:
                        try:
                            row_tot = float(str(row[total_idx]).replace("$", "").replace("€", "").replace("£", "").strip())
                        except Exception:
                            pass

                    items.append({
                        "name": desc,
                        "description": desc,
                        "quantity": q,
                        "unit_price": u_price,
                        "total": row_tot if row_tot is not None else (u_price * q if u_price is not None else None)
                    })

        # Math discrepancy check
        totals_disagree = False
        calculated_total = None
        if subtotal is not None and tax is not None:
            try:
                calculated_total = round(float(subtotal) + float(tax), 2)
                if total is not None and abs(calculated_total - float(total)) > 0.05:
                    totals_disagree = True
            except Exception:
                pass

        return {
            "vendor": vendor,
            "invoice_number": invoice_number,
            "invoice_date": invoice_date,
            "currency": currency,
            "subtotal": subtotal,
            "tax": tax,
            "tax_rate": tax_rate,
            "total": total,
            "payment_method": payment_method,
            "items": items,
            "totals_disagree": totals_disagree,
            "calculated_total": calculated_total,
            "category": self.domain.capitalize()
        }
