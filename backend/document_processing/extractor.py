import re
from datetime import datetime
from typing import Optional, List, Dict, Any, Tuple
import dateutil.parser

CURRENCY_MAP = {
    '$': 'USD',
    '€': 'EUR',
    '£': 'GBP',
    '¥': 'JPY',
    '₹': 'INR',
    'CHF': 'CHF',
    'CAD': 'CAD',
    'AUD': 'AUD',
    'SGD': 'SGD',
    'NZD': 'NZD',
    'EUR': 'EUR',
    'USD': 'USD',
    'GBP': 'GBP',
    'JPY': 'JPY',
    'INR': 'INR'
}

NON_VENDOR_KEYWORDS = [
    r'receipt', r'tax\s*invoice', r'invoice', r'cash\s*receipt', r'sales\s*receipt',
    r'bill', r'order', r'statement', r'customer\s*copy', r'merchant\s*copy',
    r'welcome', r'thank\s*you', r'cashier', r'server', r'terminal',
    r'register', r'table', r'guest', r'subtotal', r'total',
    r'payment', r'change', r'auth'
]

def parse_float_amount(amount_str: str) -> Optional[float]:
    """Parse a string into a float, handling commas and periods."""
    if not amount_str:
        return None
    cleaned = re.sub(r'[^\d.,]', '', amount_str.strip())
    if not cleaned:
        return None
    # Handle European format 1.234,56 or 1234,56
    if ',' in cleaned and '.' in cleaned:
        if cleaned.rfind(',') > cleaned.rfind('.'):
            # Comma is decimal separator: 1.234,56 -> 1234.56
            cleaned = cleaned.replace('.', '').replace(',', '.')
        else:
            # Period is decimal separator: 1,234.56 -> 1234.56
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

def detect_currency(text: str) -> Optional[str]:
    """Detect currency symbol or code from document text."""
    # Explicit ISO currency words
    iso_match = re.search(r'\b(USD|EUR|GBP|CHF|CAD|AUD|JPY|INR|SGD|NZD)\b', text, re.IGNORECASE)
    if iso_match:
        return iso_match.group(1).upper()
    
    # Currency symbols
    for sym, code in [('$', 'USD'), ('€', 'EUR'), ('£', 'GBP'), ('¥', 'JPY'), ('₹', 'INR')]:
        if sym in text:
            return code
    return None

def extract_vendor(lines: List[str]) -> Optional[str]:
    """Extract vendor/merchant name from the top header lines of the document."""
    for line in lines[:8]:
        s = line.strip()
        if not s or len(s) < 2 or len(s) > 60:
            continue
        
        lower = s.lower()
        if any(re.search(r'\b' + kw + r'\b', lower) for kw in NON_VENDOR_KEYWORDS):
            continue
        # Skip web addresses, email, phone numbers
        if re.search(r'(\.com|\.org|\.net|www\.|https?://|@|tel:|phone:|\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b)', lower):
            continue
        # Skip if purely numeric / date / symbols
        if not re.search(r'[A-Za-z]', s):
            continue
        
        # Clean up vendor name but preserve legal abbreviations like Inc. or Ltd.
        cleaned_vendor = re.sub(r'^[^\w]+|[^\w.]+$', '', s).strip()
        if len(cleaned_vendor) >= 2:
            return cleaned_vendor
    return None

def extract_invoice_number(text: str) -> Optional[str]:
    """Extract invoice or receipt reference number."""
    patterns = [
        r'(?i)(?:invoice\s*(?:#|no\.?|num(?:ber)?)|inv\s*(?:#|no\.?)|receipt\s*(?:#|no\.?)|order\s*(?:#|no\.?)|ref\s*(?:#|no\.?)|reference\s*(?:#|no\.?)|bill\s*(?:#|no\.?)|check\s*(?:#|no\.?))\s*[:\-]?\s*([A-Za-z0-9\-]{3,35})',
        r'(?i)\b(?:INV|RCPT|REF|ORD)-[A-Za-z0-9\-]{3,20}\b'
    ]
    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            inv_num = match.group(1) if match.lastindex else match.group(0)
            cleaned = inv_num.strip(' :#-')
            if cleaned and len(cleaned) >= 2:
                return cleaned
    return None

def extract_date(text: str) -> Optional[str]:
    """Extract invoice or receipt date."""
    labeled_patterns = [
        r'(?i)(?:date|dated|issue\s*date|invoice\s*date|txn\s*date)\s*[:\-]?\s*([0-9]{1,4}[\/\.\-][0-9]{1,2}[\/\.\-][0-9]{1,4})',
        r'(?i)(?:date|dated|issue\s*date|invoice\s*date|txn\s*date)\s*[:\-]?\s*([0-9]{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+[0-9]{2,4})',
        r'(?i)(?:date|dated|issue\s*date|invoice\s*date|txn\s*date)\s*[:\-]?\s*((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+[0-9]{1,2},?\s+[0-9]{2,4})'
    ]
    for pat in labeled_patterns:
        match = re.search(pat, text)
        if match:
            candidate = match.group(1).strip()
            try:
                dt = dateutil.parser.parse(candidate, fuzzy=False)
                if 2000 <= dt.year <= 2035:
                    return dt.strftime('%Y-%m-%d')
            except Exception:
                pass

    # Generic date patterns
    generic_patterns = [
        r'\b(20[12]\d[\/\.\-][01]?\d[\/\.\-][0-3]?\d)\b',
        r'\b([0-3]?\d[\/\.\-][01]?\d[\/\.\-]20[12]\d)\b',
        r'\b([0-3]?\d\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+20[12]\d)\b',
        r'\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+[0-3]?\d,?\s+20[12]\d\b'
    ]
    for pat in generic_patterns:
        match = re.search(pat, text, re.IGNORECASE)
        if match:
            candidate = match.group(0).strip()
            try:
                dt = dateutil.parser.parse(candidate, fuzzy=True)
                if 2000 <= dt.year <= 2035:
                    return dt.strftime('%Y-%m-%d')
            except Exception:
                pass
    return None

def extract_amounts(lines: List[str]) -> Tuple[Optional[float], Optional[float], Optional[float], Optional[str]]:
    """Extract total, subtotal, tax, and tax_rate from lines."""
    total = None
    subtotal = None
    tax = None
    tax_rate = None

    money_pattern = r'[\$€£¥₹]?\s*([0-9]{1,6}(?:[,\.][0-9]{3})*[,\.][0-9]{2})\b'

    for i, line in enumerate(lines):
        line_clean = line.strip()
        lower = line_clean.lower()

        # 1. Tax Rate (e.g. 8.5%, 7.6%)
        if not tax_rate:
            rate_match = re.search(r'\b([0-9]{1,2}(?:\.[0-9]{1,2})?)\s*%', line_clean)
            if rate_match and any(w in lower for w in ['tax', 'vat', 'gst', 'mwst']):
                tax_rate = f"{rate_match.group(1)}%"

        # 2. Subtotal
        if subtotal is None and re.search(r'\b(?:subtotal|sub-total|sub\s+total|net\s+amount|net\s+total)\b', lower):
            amounts = re.findall(money_pattern, line_clean)
            if amounts:
                subtotal = parse_float_amount(amounts[-1])
            elif i + 1 < len(lines):
                next_amounts = re.findall(money_pattern, lines[i+1])
                if next_amounts:
                    subtotal = parse_float_amount(next_amounts[-1])

        # 3. Tax
        if tax is None and re.search(r'\b(?:tax(?:es)?|vat|gst|mwst|tva|sales\s+tax)\b', lower) and not re.search(r'\b(?:subtotal|tax\s+invoice|tax\s+id)\b', lower):
            amounts = re.findall(money_pattern, line_clean)
            if amounts:
                tax = parse_float_amount(amounts[-1])
            elif i + 1 < len(lines):
                next_amounts = re.findall(money_pattern, lines[i+1])
                if next_amounts:
                    tax = parse_float_amount(next_amounts[-1])

        # 4. Total Amount
        if re.search(r'\b(?:grand\s+total|total\s+amount|total\s+due|amount\s+due|balance\s+due|total\s+payable|final\s+total|total)\b', lower) and not re.search(r'\b(?:subtotal|sub\s+total|items)\b', lower):
            amounts = re.findall(money_pattern, line_clean)
            if amounts:
                parsed_tot = parse_float_amount(amounts[-1])
                if parsed_tot is not None:
                    total = parsed_tot
            elif i + 1 < len(lines):
                next_amounts = re.findall(money_pattern, lines[i+1])
                if next_amounts:
                    parsed_tot = parse_float_amount(next_amounts[-1])
                    if parsed_tot is not None:
                        total = parsed_tot

    # Fallback for total: If total was not explicitly found with keyword, but a standalone amount matches subtotal + tax
    if total is None and subtotal is not None and tax is not None:
        expected = round(subtotal + tax, 2)
        for line in lines:
            amounts = re.findall(money_pattern, line)
            for a in amounts:
                parsed = parse_float_amount(a)
                if parsed is not None and abs(parsed - expected) < 0.05:
                    total = parsed
                    break
            if total is not None:
                break

    return total, subtotal, tax, tax_rate

def extract_payment_method(text: str) -> Optional[str]:
    """Detect payment method from receipt text."""
    lower = text.lower()
    if re.search(r'\bvisa\b', lower):
        return 'Visa'
    if re.search(r'\b(?:mastercard|master\s*card)\b', lower):
        return 'MasterCard'
    if re.search(r'\b(?:amex|american\s*express)\b', lower):
        return 'American Express'
    if re.search(r'\bdiscover\b', lower):
        return 'Discover'
    if re.search(r'\bcredit\s*card\b', lower):
        return 'Credit Card'
    if re.search(r'\bdebit\s*card\b', lower):
        return 'Debit Card'
    if re.search(r'\b(?:cash|barzahlung)\b', lower):
        return 'Cash'
    if re.search(r'\bapple\s*pay\b', lower):
        return 'Apple Pay'
    if re.search(r'\bgoogle\s*pay\b', lower):
        return 'Google Pay'
    if re.search(r'\bpaypal\b', lower):
        return 'PayPal'
    if re.search(r'\b(?:bank\s*transfer|wire)\b', lower):
        return 'Bank Transfer'
    if re.search(r'\b(?:check|cheque)\b', lower):
        return 'Check'
    return None

def extract_line_items(lines: List[str]) -> List[Dict[str, Any]]:
    """Extract line items (description, quantity, unit price, line total) when recoverable."""
    items = []
    
    # Pattern 1: Qty Description UnitPrice LineTotal (e.g. "1 Grande Caffe Latte 4.75 4.75")
    p1 = re.compile(r'^(\d+)\s+([A-Za-z0-9\s\.\-&/]{2,40})\s+[\$€£¥₹]?\s*(\d+[.,]\d{2})\s+[\$€£¥₹]?\s*(\d+[.,]\d{2})$')
    
    # Pattern 2: Description UnitPrice LineTotal (e.g. "Blueberry Muffin 3.25 3.25")
    p2 = re.compile(r'^([A-Za-z0-9\s\.\-&/]{2,40})\s+[\$€£¥₹]?\s*(\d+[.,]\d{2})\s+[\$€£¥₹]?\s*(\d+[.,]\d{2})$')
    
    # Pattern 3: Qty Description LineTotal (e.g. "1 Breakfast Sandwich $5.50")
    p3 = re.compile(r'^(\d+)\s+([A-Za-z0-9\s\.\-&/]{2,40})\s+[\$€£¥₹]?\s*(\d+[.,]\d{2})$')

    skip_words = {'subtotal', 'total', 'tax', 'vat', 'gst', 'cash', 'card', 'change', 'balance', 'due', 'date', 'server', 'table', 'auth'}

    for line in lines:
        s = line.strip()
        lower = s.lower()
        if any(w in lower for w in skip_words):
            continue

        m1 = p1.match(s)
        if m1:
            qty = int(m1.group(1))
            name = m1.group(2).strip()
            unit_p = parse_float_amount(m1.group(3)) or 0.0
            tot = parse_float_amount(m1.group(4)) or round(qty * unit_p, 2)
            if name and tot > 0:
                items.append({"name": name, "quantity": qty, "unit_price": unit_p, "total": tot})
            continue

        m2 = p2.match(s)
        if m2:
            name = m2.group(1).strip()
            unit_p = parse_float_amount(m2.group(2)) or 0.0
            tot = parse_float_amount(m2.group(3)) or unit_p
            if name and tot > 0:
                items.append({"name": name, "quantity": 1, "unit_price": unit_p, "total": tot})
            continue

        m3 = p3.match(s)
        if m3:
            qty = int(m3.group(1))
            name = m3.group(2).strip()
            tot = parse_float_amount(m3.group(3)) or 0.0
            unit_p = round(tot / qty, 2) if qty > 0 else tot
            if name and tot > 0:
                items.append({"name": name, "quantity": qty, "unit_price": unit_p, "total": tot})
            continue

    return items

def extract_structured_invoice_data(raw_text: str) -> Dict[str, Any]:
    """Main deterministic extractor function from raw document text."""
    if not raw_text or not raw_text.strip():
        return {
            "vendor": None,
            "invoice_number": None,
            "invoice_date": None,
            "currency": None,
            "subtotal": None,
            "tax": None,
            "tax_rate": None,
            "total": None,
            "payment_method": None,
            "items": [],
            "totals_disagree": False,
            "calculated_total": None
        }

    lines = [line.strip() for line in raw_text.splitlines() if line.strip()]

    vendor = extract_vendor(lines)
    invoice_number = extract_invoice_number(raw_text)
    invoice_date = extract_date(raw_text)
    currency = detect_currency(raw_text)
    total, subtotal, tax, tax_rate = extract_amounts(lines)
    payment_method = extract_payment_method(raw_text)
    items = extract_line_items(lines)

    # Cross-check calculations: do subtotal + tax disagree with total?
    totals_disagree = False
    calculated_total = None
    if subtotal is not None and tax is not None and total is not None:
        calc = round(subtotal + tax, 2)
        if abs(calc - total) > 0.05:
            totals_disagree = True
            calculated_total = calc
        else:
            totals_disagree = False
            calculated_total = calc

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
        "calculated_total": calculated_total
    }
