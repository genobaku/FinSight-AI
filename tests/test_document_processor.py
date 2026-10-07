import unittest
import os
import io
from PIL import Image, ImageDraw, ImageFont
from pypdf import PdfWriter
from backend.document_processor import DocumentProcessor

class TestDocumentProcessor(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.processor = DocumentProcessor()
        cls.test_dir = os.path.join("tests", "fixtures")
        os.makedirs(cls.test_dir, exist_ok=True)
        
        # 1. Create valid text PDF fixture
        cls.valid_pdf_path = os.path.join(cls.test_dir, "sample_uber_receipt.pdf")
        writer = PdfWriter()
        page = writer.add_blank_page(width=612, height=792)
        # Using pypdf annotations or simple text page
        with open(cls.valid_pdf_path, "wb") as f:
            # We can write simple PDF bytes with text
            writer.write(f)
            
        # Create a text PDF using reportlab or basic pdf writing
        with open(cls.valid_pdf_path, "wb") as f:
            # Simple text PDF structure
            pdf_content = (
                b"%PDF-1.4\n"
                b"1 0 obj <</Type /Catalog /Pages 2 0 R>> endobj\n"
                b"2 0 obj <</Type /Pages /Kids [3 0 R] /Count 1>> endobj\n"
                b"3 0 obj <</Type /Page /Parent 2 0 R /Resources <</Font <</F1 4 0 R>>>> /Contents 5 0 R>> endobj\n"
                b"4 0 obj <</Type /Font /Subtype /Type1 /BaseFont /Helvetica>> endobj\n"
                b"5 0 obj <</Length 68>> stream\n"
                b"BT /F1 12 Tf 72 712 Td (Uber ride fare from downtown airport office) Tj ET\n"
                b"endstream endobj\n"
                b"xref\n0 6\n0000000000 65535 f\n0000000009 00000 n\n0000000056 00000 n\n0000000111 00000 n\n0000000212 00000 n\n0000000283 00000 n\n"
                b"trailer <</Size 6 /Root 1 0 R>>\nstartxref\n401\n%%EOF"
            )
            f.write(pdf_content)

        # 2. Create valid image fixture
        cls.valid_img_path = os.path.join(cls.test_dir, "sample_starbucks.png")
        img = Image.new('RGB', (400, 100), color=(255, 255, 255))
        d = ImageDraw.Draw(img)
        d.text((10, 10), "Starbucks coffee and morning bagel breakfast", fill=(0, 0, 0))
        img.save(cls.valid_img_path)

        # 3. Create invalid extension file fixture
        cls.invalid_file_path = os.path.join(cls.test_dir, "unsupported.exe")
        with open(cls.invalid_file_path, "wb") as f:
            f.write(b"BINARY_CONTENT")

    def test_valid_text_pdf(self):
        with open(self.valid_pdf_path, "rb") as f:
            content = f.read()
        res = self.processor.process_document("sample_uber_receipt.pdf", content)
        self.assertTrue(res["success"])
        self.assertIn("Uber", res["extracted_text"])
        self.assertIn(res["category"], ["Transport", "Food", "Shopping", "Bills", "Entertainment", "Healthcare", "Education"])

    def test_valid_image(self):
        with open(self.valid_img_path, "rb") as f:
            content = f.read()
        res = self.processor.process_document("sample_starbucks.png", content)
        # Even if Tesseract is not installed, image file processing returns a response
        if res["success"]:
            self.assertIsNotNone(res["category"])
        else:
            self.assertEqual(res["error"], "No text could be extracted from the document. Please ensure the document contains readable text.")

    def test_invalid_file_extension(self):
        with open(self.invalid_file_path, "rb") as f:
            content = f.read()
        res = self.processor.process_document("unsupported.exe", content)
        self.assertFalse(res["success"])
        self.assertIn("Unsupported file type", res["error"])

    def test_empty_ocr_result(self):
        # Blank image with no text
        blank_img = Image.new('RGB', (100, 100), color=(255, 255, 255))
        img_byte_arr = io.BytesIO()
        blank_img.save(img_byte_arr, format='PNG')
        res = self.processor.process_document("blank.png", img_byte_arr.getvalue())
        self.assertFalse(res["success"])
        self.assertIn("No text could be extracted", res["error"])

if __name__ == "__main__":
    unittest.main()
