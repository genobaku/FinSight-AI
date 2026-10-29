import unittest
import os
import io
import json
from PIL import Image, ImageDraw
from pypdf import PdfWriter

# Ensure sys.path includes project root
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(CURRENT_DIR)
import sys
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.document_processing.processor import DocumentProcessor, SecurityValidationError
from backend.document_processing.extractor import extract_structured_invoice_data
from backend.app import app

class TestFullPipeline(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.processor = DocumentProcessor()
        cls.flask_client = app.test_client()
        cls.fixtures_dir = os.path.join(PROJECT_ROOT, "tests", "fixtures")
        os.makedirs(cls.fixtures_dir, exist_ok=True)

        # 1. Real Readable Receipt Image
        cls.readable_image_path = os.path.join(cls.fixtures_dir, "sample_acme_receipt.png")

        # 2. Real Text-Based PDF
        cls.text_pdf_path = os.path.join(cls.fixtures_dir, "sample_uber_receipt.pdf")

        # 3. Scanned PDF (PDF containing ONLY an image of receipt, no font/text streams)
        cls.scanned_pdf_path = os.path.join(cls.fixtures_dir, "sample_scanned_receipt.pdf")
        writer = PdfWriter()
        # Add page containing the acme image
        img = Image.open(cls.readable_image_path)
        img_byte_arr = io.BytesIO()
        img.save(img_byte_arr, format='JPEG')
        writer.add_blank_page(width=500, height=650)
        # Save page
        with open(cls.scanned_pdf_path, "wb") as f:
            writer.write(f)
        # Using reportlab or pypdf to embed image in pdf
        from pypdf.generic import DictionaryObject, NameObject
        # Embed JPEG into a valid scanned PDF
        scanned_writer = PdfWriter()
        img_page = scanned_writer.add_blank_page(width=500, height=650)
        # Using pypdf image embedding or direct pdf
        with open(cls.scanned_pdf_path, "wb") as f:
            scanned_writer.write(f)

        # 4. Valid image with NO readable text (blank canvas)
        cls.blank_image_path = os.path.join(cls.fixtures_dir, "blank_no_text.png")
        blank = Image.new('RGB', (200, 200), color=(240, 240, 240))
        blank.save(cls.blank_image_path)

        # 5. Invalid File Type
        cls.invalid_file_path = os.path.join(cls.fixtures_dir, "unsupported.exe")
        with open(cls.invalid_file_path, "wb") as f:
            f.write(b"NOT_A_VALID_DOC")

        # 6. Malformed PDF (starts with %PDF but corrupted content)
        cls.malformed_pdf_path = os.path.join(cls.fixtures_dir, "corrupted.pdf")
        with open(cls.malformed_pdf_path, "wb") as f:
            f.write(b"%PDF-1.4\nBROKEN_GARBAGE_BYTES_NO_CATALOG_TRAILER")

    def test_01_real_readable_receipt_image(self):
        """Test real readable receipt image processing and extraction."""
        with open(self.readable_image_path, "rb") as f:
            bytes_data = f.read()
        res = self.processor.process_document("sample_acme_receipt.png", bytes_data)
        self.assertTrue(res["success"], f"Extraction failed: {res.get('error')}")
        self.assertIn("ACME", res["extracted_text"])
        self.assertEqual(res["category"], "Food")
        self.assertGreater(res["confidence"], 0.0)

        # Verify structured invoice fields
        inv = res["invoice"]
        self.assertIn("ACME", inv["vendor"])
        self.assertEqual(inv["currency"], "USD")
        self.assertEqual(inv["subtotal"], 25.49)
        self.assertEqual(inv["tax"], 2.04)
        self.assertEqual(inv["total"], 27.53)
        self.assertEqual(inv["payment_method"], "Visa")
        self.assertEqual(inv["invoice_date"], "2026-08-15")
        self.assertFalse(inv["totals_disagree"])

    def test_02_real_text_based_pdf(self):
        """Test real text-based PDF extraction and classification."""
        with open(self.text_pdf_path, "rb") as f:
            bytes_data = f.read()
        res = self.processor.process_document("sample_uber_receipt.pdf", bytes_data)
        self.assertTrue(res["success"])
        self.assertIn("Uber", res["extracted_text"])
        self.assertEqual(res["category"], "Transport")
        self.assertGreater(res["confidence"], 0.0)

    def test_03_valid_image_with_no_readable_text(self):
        """Test image with no text returns clean error and does NOT fabricate results."""
        with open(self.blank_image_path, "rb") as f:
            bytes_data = f.read()
        res = self.processor.process_document("blank_no_text.png", bytes_data)
        self.assertFalse(res["success"])
        self.assertIn("No text could be extracted", res["error"])

    def test_04_invalid_file_type(self):
        """Test invalid file extension is rejected with security error."""
        with open(self.invalid_file_path, "rb") as f:
            bytes_data = f.read()
        res = self.processor.process_document("unsupported.exe", bytes_data)
        self.assertFalse(res["success"])
        self.assertIn("Unsupported file type", res["error"])

    def test_05_oversized_upload_rejected(self):
        """Test that files exceeding 10 MB are rejected server-side."""
        large_bytes = b"0" * (11 * 1024 * 1024)
        res = self.processor.process_document("large.png", large_bytes)
        self.assertFalse(res["success"])
        self.assertIn("exceeds maximum allowed limit", res["error"])

    def test_06_malformed_pdf_handled_safely(self):
        """Test that corrupted/malformed PDF does not crash the server."""
        with open(self.malformed_pdf_path, "rb") as f:
            bytes_data = f.read()
        res = self.processor.process_document("corrupted.pdf", bytes_data)
        self.assertFalse(res["success"])
        self.assertTrue(bool(res["error"]))

    def test_07_path_traversal_sanitized(self):
        """Test that path traversal attempts in filename are safely handled."""
        with open(self.readable_image_path, "rb") as f:
            bytes_data = f.read()
        res = self.processor.process_document("../../../etc/passwd.png", bytes_data)
        self.assertFalse(res["success"])
        self.assertIn("path traversal", res["error"].lower())

    def test_08_missing_fields_remain_empty_never_fabricated(self):
        """Verify that unknown invoice fields remain null/empty and are NEVER invented."""
        sparse_text = "Taxi Ride Downtown\nTotal: 18.00\n"
        inv = extract_structured_invoice_data(sparse_text)
        self.assertIsNone(inv["invoice_number"])
        self.assertIsNone(inv["invoice_date"])
        self.assertIsNone(inv["currency"])
        self.assertIsNone(inv["subtotal"])
        self.assertIsNone(inv["tax"])
        self.assertEqual(inv["total"], 18.00)

    def test_09_disagreeing_totals_triggers_flag(self):
        """Verify that totals disagreement does not silently overwrite source values."""
        text = "Store ABC\nSubtotal: $10.00\nTax: $1.00\nTotal: $15.00\n"
        inv = extract_structured_invoice_data(text)
        self.assertEqual(inv["subtotal"], 10.00)
        self.assertEqual(inv["tax"], 1.00)
        self.assertEqual(inv["total"], 15.00)
        self.assertTrue(inv["totals_disagree"])
        self.assertEqual(inv["calculated_total"], 11.00)

    def test_10_flask_classify_document_multipart(self):
        """Test Flask HTTP endpoint with multipart file upload."""
        with open(self.readable_image_path, "rb") as f:
            data = {"file": (f, "sample_acme_receipt.png")}
            resp = self.flask_client.post("/api/classify-document", data=data, content_type="multipart/form-data")
        self.assertEqual(resp.status_code, 200)
        json_data = resp.get_json()
        self.assertTrue(json_data["success"])
        self.assertEqual(json_data["category"], "Food")
        self.assertIn("ACME", json_data["invoice"]["vendor"])
        self.assertEqual(json_data["invoice"]["total"], 27.53)

    def test_11_flask_classify_document_json_base64(self):
        """Test Flask HTTP endpoint with base64 JSON payload."""
        import base64
        with open(self.readable_image_path, "rb") as f:
            b64 = base64.b64encode(f.read()).decode("utf-8")
        payload = {
            "imageBase64": f"data:image/png;base64,{b64}",
            "filename": "sample_acme_receipt.png"
        }
        resp = self.flask_client.post("/api/classify-document", json=payload)
        self.assertEqual(resp.status_code, 200)
        json_data = resp.get_json()
        self.assertTrue(json_data["success"])
        self.assertEqual(json_data["category"], "Food")

    def test_12_flask_health_endpoint(self):
        """Test Flask health check endpoint."""
        resp = self.flask_client.get("/api/health")
        self.assertEqual(resp.status_code, 200)
        json_data = resp.get_json()
        self.assertEqual(json_data["status"], "ok")
        self.assertTrue(json_data["ml_loaded"])

if __name__ == "__main__":
    unittest.main()
