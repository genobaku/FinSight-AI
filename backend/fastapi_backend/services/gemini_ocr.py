import json
import base64
from google import genai
from google.genai import types
from config import settings
from schemas.schemas import ExtractedInvoiceSchema, InvoiceItemSchema

def extract_invoice_with_gemini(image_base64: str, mime_type: str = "image/jpeg") -> ExtractedInvoiceSchema:
    if not settings.GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY environment variable is not set")

    client = genai.Client(api_key=settings.GEMINI_API_KEY)

    clean_base64 = image_base64.replace("data:image/jpeg;base64,", "").replace("data:image/png;base64,", "")
    image_bytes = base64.b64decode(clean_base64)

    prompt_text = """Perform OCR and information extraction on this receipt or invoice image with maximum precision.
Extract all readable text and structured invoice fields.

CRITICAL MANDATES:
1. Return ONLY strict JSON matching the requested schema.
2. Extract REAL, EXACT text from the image. NEVER fabricate vendor names, invoice numbers, or totals.
3. If a field cannot be identified, set its value to null or 0.
4. Identify currency (e.g. USD, EUR, GBP, CHF).
5. Calculate confidence percentage (0 to 100)."""

    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=[
            types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
            prompt_text
        ],
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            temperature=0.1
        )
    )

    try:
        raw_text = response.text or "{}"
        parsed = json.loads(raw_text)
        
        items = []
        if "items" in parsed and isinstance(parsed["items"], list):
            for item in parsed["items"]:
                items.append(
                    InvoiceItemSchema(
                        name=item.get("name") or item.get("description") or "Item",
                        quantity=float(item.get("quantity", 1)),
                        unit_price=float(item.get("unit_price") or item.get("price") or 0.0),
                        total=float(item.get("total", 0.0))
                    )
                )

        return ExtractedInvoiceSchema(
            vendor=parsed.get("vendor"),
            invoice_number=parsed.get("invoice_number"),
            invoice_date=parsed.get("invoice_date"),
            currency=parsed.get("currency", "USD"),
            subtotal=float(parsed.get("subtotal", 0.0)),
            tax=float(parsed.get("tax", 0.0)),
            tax_rate=parsed.get("tax_rate"),
            total=float(parsed.get("total", 0.0)),
            payment_method=parsed.get("payment_method"),
            category=parsed.get("category"),
            confidence=float(parsed.get("confidence", 98.0)),
            items=items
        )
    except Exception as err:
        raise ValueError(f"Failed to parse Gemini response: {str(err)}")
