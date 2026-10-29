"""
Document Type and Domain Classifier.
Categorizes documents based on structural features, semantic keywords, and document layout.
Separates document classification from transaction classification.
"""

import re
from typing import Tuple, Dict, Any

class DocumentClassifier:
    """Classifies document type and domain without false categorization."""

    DOMAINS = ["finance", "education", "identity", "business", "healthcare", "legal", "operations", "general"]
    DOCUMENT_TYPES = [
        "receipt", "invoice", "academic_record", "business_report",
        "identity_document", "contract", "spreadsheet", "database_export",
        "general_document", "unknown"
    ]

    @classmethod
    def classify(cls, text: str, filename: str = "", metadata: Dict[str, Any] = None) -> Tuple[str, str, float]:
        """
        Returns (document_type, domain, confidence).
        Returns ("unknown", "general", 0.0) when evidence is insufficient.
        """
        metadata = metadata or {}
        fmt = metadata.get("format", "").lower()
        lower_text = text.lower()
        filename_lower = filename.lower()

        # 1. Format-based direct hints
        if fmt in ["csv", "tsv", "xlsx", "xls"]:
            if any(k in lower_text for k in ["price", "amount", "revenue", "expense", "cost", "invoice", "payment", "subtotal", "total"]):
                return "spreadsheet", "finance", 0.95
            if any(k in lower_text for k in ["student", "grade", "gpa", "course", "semester", "enrollment", "score"]):
                return "spreadsheet", "education", 0.95
            return "spreadsheet", "business", 0.85

        if fmt == "sql":
            return "database_export", "operations", 0.95

        # 2. Structural & Semantic keyword scoring
        scores = {
            "academic_record": 0,
            "identity_document": 0,
            "business_report": 0,
            "invoice": 0,
            "receipt": 0,
            "contract": 0
        }

        # Academic indicators
        academic_keywords = [
            r'\bstudent\b', r'\benrollment\b', r'\btranscript\b', r'\bcourse\b',
            r'\bsemester\b', r'\bgpa\b', r'\bgrade[s]?\b', r'\bcredits\b',
            r'\buniversity\b', r'\bcollege\b', r'\bschool\b', r'\bdegree\b',
            r'\bacademic\b', r'\bfaculty\b', r'\bexamination\b', r'\bmarks\b'
        ]
        for kw in academic_keywords:
            if re.search(kw, lower_text):
                scores["academic_record"] += 1

        # Identity indicators
        identity_keywords = [
            r'\bpassport\b', r'\bdriving\s*licen[sc]e\b', r'\bnational\s*id\b',
            r'\bidentity\s*card\b', r'\bdate\s*of\s*birth\b', r'\bd\.o\.b\b',
            r'\bexpiry\s*date\b', r'\bissuing\s*authority\b', r'\bnationality\b',
            r'\bcitizenship\b', r'\bdocument\s*no\b', r'\bholder\b'
        ]
        for kw in identity_keywords:
            if re.search(kw, lower_text):
                scores["identity_document"] += 1.5

        # Business Report indicators
        business_keywords = [
            r'\bexecutive\s*summary\b', r'\brevenue\b', r'\bexpenditure\b',
            r'\bfiscal\s*year\b', r'\bquarter\b', r'\bq[1-4]\b',
            r'\boperating\s*profit\b', r'\bebitda\b', r'\bbalance\s*sheet\b',
            r'\bdepartment\b', r'\bperformance\s*report\b', r'\bkey\s*metrics\b'
        ]
        for kw in business_keywords:
            if re.search(kw, lower_text):
                scores["business_report"] += 1

        # Contract indicators
        contract_keywords = [
            r'\bagreement\b', r'\bbetween\s+the\s+parties\b', r'\bwhereas\b',
            r'\bindemnif(?:y|ication)\b', r'\bjurisdiction\b', r'\bgoverning\s*law\b',
            r'\bconfidentiality\b', r'\bin\s+witness\s+whereof\b', r'\btermination\s*clause\b'
        ]
        for kw in contract_keywords:
            if re.search(kw, lower_text):
                scores["contract"] += 1.5

        # Invoice indicators
        invoice_keywords = [
            r'\binvoice\b', r'\btax\s*invoice\b', r'\bbill\s*to\b', r'\bship\s*to\b',
            r'\bdue\s*date\b', r'\bpayment\s*terms\b', r'\bnet\s*(?:30|60|15)\b',
            r'\bpo\s*(?:#|number|num)\b', r'\binvoice\s*(?:#|no|num)\b'
        ]
        for kw in invoice_keywords:
            if re.search(kw, lower_text):
                scores["invoice"] += 1.2

        # Receipt indicators
        receipt_keywords = [
            r'\breceipt\b', r'\bcashier\b', r'\bserver\b', r'\btable\b',
            r'\bsubtotal\b', r'\bgrand\s*total\b', r'\bchange\s*due\b',
            r'\btax\s*(?:\([0-9.]+%\))?\b', r'\bauth(?:orization)?\b',
            r'\bthank\s*you\s*for\s*shopping\b', r'\bterminal\b', r'\bmerchant\b',
            r'\btotal\s+[0-9]+[.,]?[0-9]*\b', r'\bpaid\s+by\b', r'\bcash\b',
            r'\bbakery\b', r'\bcafe\b', r'\bstore\b', r'\bmarket\b'
        ]
        for kw in receipt_keywords:
            if re.search(kw, lower_text):
                scores["receipt"] += 1

        # Filename hints
        if any(k in filename_lower for k in ["invoice", "inv", "bill"]):
            scores["invoice"] += 2.0
        elif any(k in filename_lower for k in ["receipt", "rcpt", "ticket"]):
            scores["receipt"] += 2.0
        elif any(k in filename_lower for k in ["transcript", "grade", "student"]):
            scores["academic_record"] += 2.0
        elif any(k in filename_lower for k in ["passport", "id_card", "license"]):
            scores["identity_document"] += 2.0
        elif any(k in filename_lower for k in ["report", "quarterly", "q1", "q2", "q3", "q4", "annual"]):
            scores["business_report"] += 2.0

        # Find best candidate
        best_type = max(scores, key=scores.get)
        best_score = scores[best_type]

        # Minimum evidence threshold to avoid false categorization
        if best_score < 2.0:
            if len(text.strip().split()) > 20:
                return "general_document", "general", 0.50
            return "unknown", "general", 0.0

        total_score = sum(scores.values()) or 1.0
        confidence = min(0.98, max(0.55, round(best_score / (total_score * 0.7 + 1.0), 2)))

        domain_mapping = {
            "academic_record": "education",
            "identity_document": "identity",
            "business_report": "business",
            "contract": "legal",
            "invoice": "finance",
            "receipt": "finance"
        }
        domain = domain_mapping.get(best_type, "general")

        return best_type, domain, confidence
