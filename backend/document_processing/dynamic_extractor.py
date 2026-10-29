"""
Dynamic Semantic Field & Entity Extractor.
Discovers document schema, dynamic fields, tables, and entities from content.
Does NOT force documents into a fixed predefined list of fields.
"""

import re
import uuid
from typing import List, Dict, Any, Optional, Tuple
import dateutil.parser

from backend.document_processing.models import (
    ExtractedField, ExtractedTable, SourceEvidence, DynamicDocumentResponse
)

# Common ISO Currencies and Symbols
CURRENCY_SYMBOLS = {
    '$': 'USD', '€': 'EUR', '£': 'GBP', '¥': 'JPY', '₹': 'INR',
    'CHF': 'CHF', 'CAD': 'CAD', 'AUD': 'AUD', 'SGD': 'SGD', 'NZD': 'NZD'
}

class DynamicExtractor:
    @classmethod
    def extract(cls, raw_text: str, document_type: str = "unknown", domain: str = "general", page: int = 1) -> Tuple[List[ExtractedField], List[ExtractedTable], List[str]]:
        """
        Dynamically extracts fields, tables, and warnings from arbitrary document text.
        """
        fields: List[ExtractedField] = []
        tables: List[ExtractedTable] = []
        warnings: List[str] = []

        if not raw_text or not raw_text.strip():
            return fields, tables, warnings

        lines = [line.strip() for line in raw_text.splitlines() if line.strip()]
        discovered_labels = set()

        # 1. Detect Currency
        doc_currency = cls._detect_currency(raw_text)
        if doc_currency:
            fields.append(ExtractedField(
                id=f"field-curr-{uuid.uuid4().hex[:6]}",
                label="Currency",
                value=doc_currency,
                data_type="currency",
                semantic_category="currency",
                source_evidence=SourceEvidence(text=f"Detected currency {doc_currency}", page=page),
                confidence=0.98,
                verification_status="verified"
            ))
            discovered_labels.add("currency")

        # 2. Extract Document-Specific Key-Value Pairs
        cls._extract_dynamic_key_values(lines, fields, discovered_labels, page, doc_currency)

        # 3. Domain-Specific Robust Extraction (Financial, Academic, Identity)
        if domain == "finance" or document_type in ["receipt", "invoice"]:
            cls._extract_financial_entities(lines, fields, discovered_labels, warnings, page, doc_currency)
            # Extract line items table
            line_item_table = cls._extract_line_items_table(lines, page)
            if line_item_table and line_item_table.rows:
                tables.append(line_item_table)

        elif domain == "education" or document_type == "academic_record":
            cls._extract_academic_entities(lines, fields, discovered_labels, page)

        elif domain == "identity" or document_type == "identity_document":
            cls._extract_identity_entities(lines, fields, discovered_labels, page)

        # 4. Check for and normalize Merchant / Organization if not already discovered
        if not any(f.semantic_category in ["merchant", "organization", "institution"] for f in fields):
            merchant = cls._extract_top_header_entity(lines, page)
            if merchant:
                fields.insert(0, merchant)

        return fields, tables, warnings

    @staticmethod
    def _detect_currency(text: str) -> Optional[str]:
        """Detect currency from symbols or standard ISO codes."""
        iso_match = re.search(r'\b(USD|EUR|GBP|CHF|CAD|AUD|JPY|INR|SGD|NZD)\b', text, re.IGNORECASE)
        if iso_match:
            return iso_match.group(1).upper()
        for sym, code in CURRENCY_SYMBOLS.items():
            if sym in text:
                return code
        return None

    @classmethod
    def _extract_dynamic_key_values(cls, lines: List[str], fields: List[ExtractedField], discovered_labels: set, page: int, doc_currency: Optional[str]):
        """Discovers arbitrary key-value pairs formatted as 'Key: Value' or 'Key - Value'."""
        kv_regex = re.compile(r'^([A-Za-z0-9\s#\._\-/]{2,35})\s*[:\-=]\s+(.+)$')

        for line in lines:
            match = kv_regex.match(line)
            if not match:
                continue

            raw_key = match.group(1).strip()
            raw_val = match.group(2).strip()

            key_lower = raw_key.lower()
            if any(k in key_lower for k in ["http", "www", "page", "copyright", "all rights"]):
                continue
            if len(raw_val) == 0 or len(raw_key) < 2:
                continue
            if key_lower in discovered_labels:
                continue

            # Don't capture complex lines that contain multiple fields (e.g. Subtotal: ... Tax: ...)
            if any(k in raw_val.lower() for k in ["tax (", "payment method", "tax rate"]):
                continue

            typed_val, data_type, sem_cat = cls._infer_type_and_category(raw_key, raw_val)

            # Standardize label if it is a recognized financial field while preserving original_label
            label = raw_key
            if raw_key.lower() in ["total", "grand total", "total amount", "final total", "total due", "amount due"]:
                label = "Grand Total"
                sem_cat = "financial_total"
            elif raw_key.lower() in ["tax", "tax amount", "vat", "gst", "sales tax"]:
                label = "Tax Amount"
                sem_cat = "tax"
            elif raw_key.lower() in ["subtotal", "sub-total", "sub total", "net amount"]:
                label = "Subtotal"
                sem_cat = "subtotal"

            fields.append(ExtractedField(
                id=f"field-kv-{uuid.uuid4().hex[:6]}",
                label=label,
                value=typed_val,
                data_type=data_type,
                semantic_category=sem_cat,
                source_evidence=SourceEvidence(text=line, page=page),
                confidence=0.90,
                verification_status="pending",
                original_label=raw_key
            ))
            discovered_labels.add(key_lower)
            discovered_labels.add(label.lower())

    @classmethod
    def _infer_type_and_category(cls, label: str, value_str: str) -> Tuple[Any, str, str]:
        """Infers appropriate data type and semantic category for arbitrary fields."""
        lbl_lower = label.lower()
        val_clean = value_str.strip()

        # 1. Date Detection
        if any(k in lbl_lower for k in ["date", "dob", "birth", "expiry", "issued", "created", "txn date"]):
            # If line contains "Time: ...", split it
            date_candidate = re.split(r'(?i)\s+time:', val_clean)[0].strip()
            try:
                parsed_dt = dateutil.parser.parse(date_candidate, fuzzy=False)
                if 1900 <= parsed_dt.year <= 2050:
                    return parsed_dt.strftime('%Y-%m-%d'), "date", "date"
            except Exception:
                try:
                    parsed_dt = dateutil.parser.parse(val_clean, fuzzy=True)
                    if 1900 <= parsed_dt.year <= 2050:
                        return parsed_dt.strftime('%Y-%m-%d'), "date", "date"
                except Exception:
                    pass

        # 2. Subtotal vs Grand Total vs Tax
        if "subtotal" in lbl_lower or "sub-total" in lbl_lower or "sub total" in lbl_lower:
            num = cls._parse_flexible_amount(val_clean)
            if num is not None:
                return num, "currency", "subtotal"

        if any(k in lbl_lower for k in ["grand total", "total due", "amount due", "balance due", "total amount"]):
            num = cls._parse_flexible_amount(val_clean)
            if num is not None:
                return num, "currency", "financial_total"

        if lbl_lower == "total":
            num = cls._parse_flexible_amount(val_clean)
            if num is not None:
                return num, "currency", "financial_total"

        if "tax" in lbl_lower or "vat" in lbl_lower or "gst" in lbl_lower:
            num = cls._parse_flexible_amount(val_clean)
            if num is not None:
                return num, "currency", "tax"

        # 3. Numeric / Decimal / Integer
        if re.match(r'^-?\d+$', val_clean):
            return int(val_clean), "integer", "metric"
        if re.match(r'^-?\d+[.,]\d+$', val_clean):
            num = cls._parse_flexible_amount(val_clean)
            if num is not None:
                return num, "decimal", "metric"

        # 4. Boolean
        if val_clean.lower() in ["true", "yes", "paid", "verified", "active"]:
            return True, "boolean", "status"
        if val_clean.lower() in ["false", "no", "unpaid", "pending", "inactive"]:
            return False, "boolean", "status"

        # 5. Semantic Categories for Identifiers & Text
        if any(k in lbl_lower for k in ["invoice", "receipt #", "inv #", "order #"]):
            return val_clean, "text", "invoice_number"
        if any(k in lbl_lower for k in ["id", "number", "num", "no", "code", "reference", "ref"]):
            return val_clean, "text", "identifier"
        if any(k in lbl_lower for k in ["student", "enrollment", "course", "gpa", "grade", "faculty", "dean"]):
            return val_clean, "text", "education"
        if any(k in lbl_lower for k in ["patient", "doctor", "hospital", "clinic", "diagnosis"]):
            return val_clean, "text", "healthcare"
        if any(k in lbl_lower for k in ["vendor", "merchant", "store", "company", "organization"]):
            return val_clean, "text", "merchant"

        return val_clean, "text", "general"

    @staticmethod
    def _parse_flexible_amount(amount_str: str) -> Optional[float]:
        """
        Parses numbers with 0, 1, or 2 decimal places, commas, and currency signs.
        Correctly parses '16.5', '16.50', '16', '1,234.50', '1.234,56'.
        """
        if not amount_str:
            return None
        cleaned = re.sub(r'[^\d.,\-]', '', amount_str.strip())
        if not cleaned:
            return None

        # Handle European decimal: 1.234,56
        if ',' in cleaned and '.' in cleaned:
            if cleaned.rfind(',') > cleaned.rfind('.'):
                cleaned = cleaned.replace('.', '').replace(',', '.')
            else:
                cleaned = cleaned.replace(',', '')
        elif ',' in cleaned:
            parts = cleaned.split(',')
            if len(parts) == 2 and len(parts[1]) <= 2:
                cleaned = cleaned.replace(',', '.')
            else:
                cleaned = cleaned.replace(',', '')

        try:
            val = float(cleaned)
            return round(val, 2)
        except ValueError:
            return None

    @classmethod
    def _extract_financial_entities(cls, lines: List[str], fields: List[ExtractedField], discovered_labels: set, warnings: List[str], page: int, doc_currency: Optional[str]):
        """Extracts subtotal, tax, tax rate, grand total, and payment method with math reconciliation."""
        money_regex = re.compile(r'[\$€£¥₹]?\s*([0-9]{1,6}(?:[,\.][0-9]{3})*(?:[,\.][0-9]{1,2})?)\b')

        subtotal_val = None
        tax_val = None
        tax_rate_val = None
        total_val = None
        total_line_text = ""

        # Check existing fields first
        for f in fields:
            if f.semantic_category == "subtotal" and subtotal_val is None:
                try:
                    subtotal_val = float(f.value)
                except Exception:
                    pass
            elif f.semantic_category == "tax" and tax_val is None:
                try:
                    tax_val = float(f.value)
                except Exception:
                    pass
            elif f.semantic_category == "financial_total" and total_val is None:
                try:
                    total_val = float(f.value)
                except Exception:
                    pass

        # Scan lines for financial values
        for line in lines:
            line_clean = line.strip()
            lower = line_clean.lower()

            # Tax Rate (e.g. 8.0%, 8%)
            if tax_rate_val is None and "%" in line_clean:
                rate_m = re.search(r'\b([0-9]{1,2}(?:\.[0-9]{1,2})?)\s*%', line_clean)
                if rate_m and any(w in lower for w in ["tax", "vat", "gst"]):
                    tax_rate_val = f"{rate_m.group(1)}%"

            # Subtotal
            if subtotal_val is None and any(w in lower for w in ["subtotal", "sub-total", "sub total", "net amount"]):
                sub_m = re.search(r'(?i)(?:subtotal|sub-total|sub\s+total|net\s+amount)\s*[:\-]?\s*[\$€£¥₹]?\s*([0-9]+[.,]?[0-9]*)', line_clean)
                if sub_m:
                    subtotal_val = cls._parse_flexible_amount(sub_m.group(1))

            # Tax
            if tax_val is None and re.search(r'(?i)\b(?:tax|vat|gst|mwst)\b', lower) and not re.search(r'(?i)\b(?:subtotal|tax\s+invoice|tax\s+id)\b', lower):
                tax_m = re.search(r'(?i)(?:tax|vat|gst|mwst)(?:\s*\([0-9.]+%\))?\s*[:\-]?\s*[\$€£¥₹]?\s*([0-9]+[.,]?[0-9]*)', line_clean)
                if tax_m:
                    tax_val = cls._parse_flexible_amount(tax_m.group(1))

            # Explicit Grand Total
            if total_val is None and re.search(r'(?i)\b(?:grand\s+total|total\s+amount|total\s+due|amount\s+due|final\s+total)\b', lower):
                tot_m = re.search(r'(?i)(?:grand\s+total|total\s+amount|total\s+due|amount\s+due|final\s+total)\s*[:\-]?\s*[\$€£¥₹]?\s*([0-9]+[.,]?[0-9]*)', line_clean)
                if tot_m:
                    total_val = cls._parse_flexible_amount(tot_m.group(1))
                    total_line_text = line_clean

            # Standalone Total line (e.g. "Total: 16.5" or "TOTAL 16.50")
            if total_val is None and re.search(r'(?i)^total\s*[:\-]?\s*[\$€£¥₹]?\s*([0-9]+[.,]?[0-9]*)', lower):
                tot_m = re.search(r'(?i)^total\s*[:\-]?\s*[\$€£¥₹]?\s*([0-9]+[.,]?[0-9]*)', lower)
                if tot_m:
                    total_val = cls._parse_flexible_amount(tot_m.group(1))
                    total_line_text = line_clean

        # Fallback for Total:
        # Case A: If Subtotal and Tax were found, and line contains a remaining amount matching Subtotal + Tax
        if total_val is None and subtotal_val is not None and tax_val is not None:
            expected_tot = round(subtotal_val + tax_val, 2)
            # Search for expected_tot in the document text
            for line in lines:
                amounts = money_regex.findall(line)
                for a in amounts:
                    parsed = cls._parse_flexible_amount(a)
                    if parsed is not None and abs(parsed - expected_tot) < 0.05:
                        total_val = parsed
                        total_line_text = line
                        break
                if total_val is not None:
                    break

        # Case B: If line with Subtotal & Tax contains a 3rd number (e.g. "Subtotal: $25.49 Tax (8.0%): $2.04 $27.53")
        if total_val is None and subtotal_val is not None:
            for line in lines:
                if "subtotal" in line.lower():
                    amounts = money_regex.findall(line)
                    parsed_amounts = [cls._parse_flexible_amount(a) for a in amounts if cls._parse_flexible_amount(a) is not None]
                    # Filter out subtotal and tax
                    remaining = [p for p in parsed_amounts if p != subtotal_val and (tax_val is None or p != tax_val)]
                    if remaining:
                        total_val = remaining[-1]
                        total_line_text = line
                        break

        # Add Subtotal field if found
        if subtotal_val is not None and not any(f.semantic_category == "subtotal" for f in fields):
            fields.append(ExtractedField(
                id=f"field-subtotal-{uuid.uuid4().hex[:6]}",
                label="Subtotal",
                value=subtotal_val,
                data_type="currency",
                semantic_category="subtotal",
                source_evidence=SourceEvidence(text=f"Subtotal: {subtotal_val}", page=page),
                confidence=0.92,
                verification_status="verified"
            ))
            discovered_labels.add("subtotal")

        # Add Tax field if found
        if tax_val is not None and not any(f.semantic_category == "tax" for f in fields):
            fields.append(ExtractedField(
                id=f"field-tax-{uuid.uuid4().hex[:6]}",
                label="Tax Amount",
                value=tax_val,
                data_type="currency",
                semantic_category="tax",
                source_evidence=SourceEvidence(text=f"Tax: {tax_val}", page=page),
                confidence=0.90,
                verification_status="verified"
            ))
            discovered_labels.add("tax")

        # Add Tax Rate if found
        if tax_rate_val and not any(f.semantic_category == "tax_rate" for f in fields):
            fields.append(ExtractedField(
                id=f"field-taxrate-{uuid.uuid4().hex[:6]}",
                label="Tax Rate",
                value=tax_rate_val,
                data_type="text",
                semantic_category="tax_rate",
                source_evidence=SourceEvidence(text=f"Tax Rate: {tax_rate_val}", page=page),
                confidence=0.95,
                verification_status="verified"
            ))
            discovered_labels.add("tax_rate")

        # Add Grand Total field if found
        if total_val is not None and not any(f.semantic_category == "financial_total" for f in fields):
            fields.append(ExtractedField(
                id=f"field-total-{uuid.uuid4().hex[:6]}",
                label="Grand Total",
                value=total_val,
                data_type="currency",
                semantic_category="financial_total",
                source_evidence=SourceEvidence(text=total_line_text or f"Total {total_val}", page=page),
                confidence=0.95,
                verification_status="verified"
            ))
            discovered_labels.add("total")

        # Math consistency verification (Subtotal + Tax == Total)
        if subtotal_val is not None and tax_val is not None and total_val is not None:
            calc_total = round(subtotal_val + tax_val, 2)
            if abs(calc_total - total_val) > 0.05:
                warnings.append(
                    f"Mathematical discrepancy: Subtotal ({subtotal_val}) + Tax ({tax_val}) = {calc_total}, which does not match Grand Total ({total_val}). Source values preserved."
                )

        # 5. Payment Method: Requires explicit payment evidence (NEVER match word 'Cashier')
        cls._extract_payment_method(lines, fields, discovered_labels, page)

    @classmethod
    def _extract_payment_method(cls, lines: List[str], fields: List[ExtractedField], discovered_labels: set, page: int):
        """Extracts payment tender only when explicit payment evidence exists."""
        if any(f.semantic_category == "payment_method" for f in fields):
            return

        tender_patterns = [
            (r'(?i)\bpaid\s*by\s*[:\-]?\s*(visa|mastercard|amex|cash|card|debit|apple\s*pay|google\s*pay)', 1),
            (r'(?i)\bpayment\s*(?:method|type)?\s*[:\-]?\s*([A-Za-z\s]+)', 1),
            (r'(?i)\b(visa|mastercard|american\s*express|discover)\s+ending\s+in\s+\d{4}', 0),
            (r'(?i)\bcard\s*tendered\b', 0),
            (r'(?i)\bcash\s*tender(?:ed)?\b', 0),
            (r'(?i)\bcash\s+received\b', 0),
            (r'(?i)\bamount\s+tendered\s*[:\-]?\s*[\$€£¥₹]?\s*([0-9.]+)', 0)
        ]

        for line in lines:
            if re.search(r'(?i)\bcashier\b', line) and not re.search(r'(?i)\b(?:payment|tendered|card|paid)\b', line):
                continue

            for pattern, grp in tender_patterns:
                m = re.search(pattern, line)
                if m:
                    raw_method = m.group(grp).strip()
                    method_name = "Cash" if "cash" in raw_method.lower() else (
                        "Visa" if "visa" in raw_method.lower() else (
                            "MasterCard" if "master" in raw_method.lower() else (
                                "Apple Pay" if "apple" in raw_method.lower() else raw_method.title()
                            )
                        )
                    )
                    fields.append(ExtractedField(
                        id=f"field-pay-{uuid.uuid4().hex[:6]}",
                        label="Payment Method",
                        value=method_name,
                        data_type="text",
                        semantic_category="payment_method",
                        source_evidence=SourceEvidence(text=line, page=page),
                        confidence=0.92,
                        verification_status="verified"
                    ))
                    discovered_labels.add("payment_method")
                    return

    @classmethod
    def _extract_line_items_table(cls, lines: List[str], page: int) -> Optional[ExtractedTable]:
        """
        Discovers line items table rows.
        Supports:
        - 'Qty Description UnitPrice Total'
        - 'Description UnitPrice Total'
        - 'Qty Description Total'
        - Single-decimal prices (16.5, 3.5)
        - OCR token separation (e.g. '3.993.99' split into 3.99 and 3.99)
        """
        rows = []
        skip_words = {"subtotal", "total", "tax", "vat", "gst", "cashier", "date", "change", "auth", "balance"}

        # Pattern 1: Qty Desc UnitPrice Total (e.g. '2 Bread 4.50 9.00' or '1 Milk 3.99 3.99')
        p1 = re.compile(r'^(\d+)\s+([A-Za-z0-9\s\.\-_&/]{2,40})\s+[\$€£¥₹]?\s*([0-9]+[.,][0-9]{1,2})\s+[\$€£¥₹]?\s*([0-9]+[.,][0-9]{1,2})$')

        # Pattern 2: Concatenated OCR tokens like '1 Organic Whole Milk 3.993.99'
        p_concat = re.compile(r'^(\d+)\s+([A-Za-z0-9\s\.\-_&/]{2,40})\s+[\$€£¥₹]?\s*([0-9]+\.[0-9]{2})([0-9]+\.[0-9]{2})$')

        # Pattern 3: Description UnitPrice Total (e.g. 'Latte 4.50 4.50' or 'Sandwich 5.5 5.5')
        p2 = re.compile(r'^([A-Za-z0-9\s\.\-_&/]{2,40})\s+[\$€£¥₹]?\s*([0-9]+[.,][0-9]{1,2})\s+[\$€£¥₹]?\s*([0-9]+[.,][0-9]{1,2})$')

        # Pattern 4: Qty Description Total (e.g. '1 Coffee 4.50' or '2 Bagels 6.0')
        p3 = re.compile(r'^(\d+)\s+([A-Za-z0-9\s\.\-_&/]{2,40})\s+[\$€£¥₹]?\s*([0-9]+[.,][0-9]{1,2})$')

        for line in lines:
            line_clean = line.strip()
            lower = line_clean.lower()
            if any(sw in lower for sw in skip_words):
                continue

            # Try Concatenated pattern first (resolves RapidOCR 3.993.99 bug)
            m_concat = p_concat.match(line_clean)
            if m_concat:
                qty = int(m_concat.group(1))
                desc = m_concat.group(2).strip()
                unit_p = cls._parse_flexible_amount(m_concat.group(3))
                tot_p = cls._parse_flexible_amount(m_concat.group(4))
                rows.append([desc, qty, unit_p, tot_p])
                continue

            # Try Pattern 1
            m1 = p1.match(line_clean)
            if m1:
                qty = int(m1.group(1))
                desc = m1.group(2).strip()
                unit_p = cls._parse_flexible_amount(m1.group(3))
                tot_p = cls._parse_flexible_amount(m1.group(4))
                rows.append([desc, qty, unit_p, tot_p])
                continue

            # Try Pattern 2
            m2 = p2.match(line_clean)
            if m2 and not re.match(r'^\d+$', m2.group(1)):
                desc = m2.group(1).strip()
                unit_p = cls._parse_flexible_amount(m2.group(2))
                tot_p = cls._parse_flexible_amount(m2.group(3))
                rows.append([desc, 1, unit_p, tot_p])
                continue

            # Try Pattern 4
            m3 = p3.match(line_clean)
            if m3:
                qty = int(m3.group(1))
                desc = m3.group(2).strip()
                tot_p = cls._parse_flexible_amount(m3.group(3))
                unit_p = round(tot_p / qty, 2) if qty else tot_p
                rows.append([desc, qty, unit_p, tot_p])

        if rows:
            return ExtractedTable(
                id="table-line-items",
                title="Line Items",
                headers=["Description", "Quantity", "Unit Price", "Total"],
                rows=rows,
                source_evidence={"item_count": len(rows), "page": page}
            )
        return None

    @classmethod
    def _extract_academic_entities(cls, lines: List[str], fields: List[ExtractedField], discovered_labels: set, page: int):
        """Extracts academic records entities: Student Name, Enrollment ID, Course, GPA, Semester."""
        academic_patterns = [
            (r'(?i)(?:student\s*name|name\s*of\s*student)\s*[:\-]?\s*([A-Za-z\s\.\'-]{3,40})', "Student Name", "identity"),
            (r'(?i)(?:enrollment\s*(?:no|num|id|#)|roll\s*(?:no|num|id|#)|student\s*(?:id|#))\s*[:\-]?\s*([A-Za-z0-9\-_/]+)', "Enrollment Number", "identifier"),
            (r'(?i)(?:course|program|degree)\s*[:\-]?\s*([A-Za-z0-9\s\.\-_&]+)', "Course / Program", "education"),
            (r'(?i)(?:semester|term|session)\s*[:\-]?\s*([A-Za-z0-9\s]+)', "Semester", "education"),
            (r'(?i)(?:gpa|cgpa|grade\s*point)\s*[:\-]?\s*([0-9]+(?:\.[0-9]{1,3})?)', "GPA", "metric"),
            (r'(?i)(?:university|institution|college|school)\s*[:\-]?\s*([A-Za-z0-9\s\.\-_&]{3,60})', "Institution", "organization")
        ]

        for line in lines:
            for pat, label, sem_cat in academic_patterns:
                lbl_key = label.lower()
                if lbl_key in discovered_labels:
                    continue
                match = re.search(pat, line)
                if match:
                    val = match.group(1).strip()
                    dtype = "decimal" if label == "GPA" else "text"
                    fields.append(ExtractedField(
                        id=f"field-acad-{uuid.uuid4().hex[:6]}",
                        label=label,
                        value=float(val) if dtype == "decimal" else val,
                        data_type=dtype,
                        semantic_category=sem_cat,
                        source_evidence=SourceEvidence(text=line, page=page),
                        confidence=0.94,
                        verification_status="verified"
                    ))
                    discovered_labels.add(lbl_key)

    @classmethod
    def _extract_identity_entities(cls, lines: List[str], fields: List[ExtractedField], discovered_labels: set, page: int):
        """Extracts identity document attributes: Document Holder, Document No, Issue Date, Expiry Date."""
        identity_patterns = [
            (r'(?i)(?:document\s*holder|full\s*name|holder\s*name|name)\s*[:\-]?\s*([A-Za-z\s\.\'-]{3,40})', "Document Holder", "identity"),
            (r'(?i)(?:passport\s*no|license\s*no|id\s*(?:no|number)|document\s*no)\s*[:\-]?\s*([A-Za-z0-9\-_]{5,25})', "Document Number", "identifier"),
            (r'(?i)(?:date\s*of\s*birth|d\.o\.b)\s*[:\-]?\s*([0-9]{1,4}[\/\.\-][0-9]{1,2}[\/\.\-][0-9]{1,4})', "Date of Birth", "date"),
            (r'(?i)(?:expiry\s*date|expiration|expires)\s*[:\-]?\s*([0-9]{1,4}[\/\.\-][0-9]{1,2}[\/\.\-][0-9]{1,4})', "Expiry Date", "date"),
            (r'(?i)(?:nationality|citizenship)\s*[:\-]?\s*([A-Za-z\s]{3,30})', "Nationality", "identity"),
            (r'(?i)(?:issuing\s*authority|authority)\s*[:\-]?\s*([A-Za-z0-9\s\.\-_]{3,50})', "Issuing Authority", "organization")
        ]

        for line in lines:
            for pat, label, sem_cat in identity_patterns:
                lbl_key = label.lower()
                if lbl_key in discovered_labels:
                    continue
                match = re.search(pat, line)
                if match:
                    val = match.group(1).strip()
                    fields.append(ExtractedField(
                        id=f"field-id-{uuid.uuid4().hex[:6]}",
                        label=label,
                        value=val,
                        data_type="date" if "Date" in label else "text",
                        semantic_category=sem_cat,
                        source_evidence=SourceEvidence(text=line, page=page),
                        confidence=0.95,
                        verification_status="verified"
                    ))
                    discovered_labels.add(lbl_key)

    @classmethod
    def _extract_top_header_entity(cls, lines: List[str], page: int) -> Optional[ExtractedField]:
        """
        Discovers merchant, store, or organization from the top header lines.
        Includes word segmentation to resolve joined tokens (e.g. 'SHOPNAME' -> 'SHOP NAME').
        """
        non_vendor_words = {
            "receipt", "tax invoice", "invoice", "cash receipt", "bill",
            "welcome", "thank you", "customer copy", "terminal", "order"
        }

        for line in lines[:6]:
            clean = line.strip()
            if not clean or len(clean) < 2 or len(clean) > 50:
                continue

            lower = clean.lower()
            if any(w in lower for w in non_vendor_words):
                continue
            if re.search(r'(\.com|www\.|https?://|@|tel:|phone:)', lower):
                continue
            if not re.search(r'[A-Za-z]', clean):
                continue

            formatted_name = cls._segment_joined_name(clean)

            return ExtractedField(
                id=f"field-merchant-{uuid.uuid4().hex[:6]}",
                label="Merchant / Organization",
                value=formatted_name,
                data_type="text",
                semantic_category="merchant",
                source_evidence=SourceEvidence(text=clean, page=page),
                confidence=0.90,
                verification_status="verified"
            )

        return None

    @staticmethod
    def _segment_joined_name(name: str) -> str:
        """
        Splits CamelCase or common joined uppercase words when appropriate.
        e.g. 'ShopName' -> 'Shop Name', 'SHOPNAME' with recognized boundary -> 'SHOP NAME'.
        """
        # Split CamelCase: 'AcmeGroceries' -> 'Acme Groceries'
        segmented = re.sub(r'([a-z])([A-Z])', r'\1 \2', name)

        # Common known merchant compound suffixes
        compounds = ["STORE", "SHOP", "MARKET", "GROCERY", "CAFE", "BAKERY", "PHARMACY", "MART", "NAME"]
        for comp in compounds:
            if segmented.upper().endswith(comp) and len(segmented) > len(comp) + 2:
                idx = segmented.upper().rfind(comp)
                if idx > 0 and segmented[idx-1] != ' ':
                    segmented = segmented[:idx] + " " + segmented[idx:]
            if segmented.upper().startswith(comp) and len(segmented) > len(comp) + 2:
                idx = len(comp)
                if idx < len(segmented) and segmented[idx] != ' ':
                    segmented = segmented[:idx] + " " + segmented[idx:]

        return segmented.strip()
