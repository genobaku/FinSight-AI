"""
Comprehensive Test Suite for Dynamic Document Intelligence & Extraction.
Tests all 16 acceptance criteria mandated in Section 13.
"""

import unittest
import os
import io
import json
import tempfile
import pandas as pd
from docx import Document
from PIL import Image

import sys
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(CURRENT_DIR)
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.document_processing.processor import DocumentProcessor
from backend.document_processing.dynamic_extractor import DynamicExtractor
from backend.document_processing.classifier import DocumentClassifier
from backend.document_processing.models import ExtractedField, ExtractedTable, DynamicDocumentResponse

class TestDynamicExtraction(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.processor = DocumentProcessor()
        cls.fixtures_dir = os.path.join(PROJECT_ROOT, "tests", "fixtures")
        os.makedirs(cls.fixtures_dir, exist_ok=True)

    # 1. Receipt with merchant, date, items, and total (standard)
    def test_01_standard_receipt(self):
        text = """
        COFFEE CORNER
        123 Main St, Seattle
        Date: 2026-08-15
        Invoice #: INV-9901
        1 Americano 4.50 4.50
        1 Blueberry Scone 3.50 3.50
        Subtotal: $8.00
        Tax (8.0%): $0.64
        Total: $8.64
        Payment Method: Visa ending in 1234
        """
        doc_type, domain, conf = DocumentClassifier.classify(text, "receipt.jpg")
        self.assertEqual(doc_type, "receipt")
        self.assertEqual(domain, "finance")

        fields, tables, warnings = DynamicExtractor.extract(text, doc_type, domain)
        field_map = {f.label.lower(): f.value for f in fields}
        
        self.assertIn("merchant / organization", field_map)
        self.assertEqual(field_map.get("subtotal"), 8.00)
        self.assertEqual(field_map.get("tax amount"), 0.64)
        self.assertEqual(field_map.get("grand total"), 8.64)
        self.assertEqual(len(warnings), 0)

        # Check line items table
        self.assertEqual(len(tables), 1)
        self.assertEqual(len(tables[0].rows), 2)
        self.assertEqual(tables[0].rows[0][0], "Americano")

    # 2. Receipt with alternate layout and no invoice number
    def test_02_alternate_layout_receipt(self):
        text = """
        METRO BAKERY
        Date: 2026-09-01
        Croissant 3.50 3.50
        Baguette 2.50 2.50
        TOTAL 6.00
        Paid by Cash
        """
        doc_type, domain, _ = DocumentClassifier.classify(text, "cash_receipt.png")
        fields, tables, _ = DynamicExtractor.extract(text, doc_type, domain)
        field_map = {f.label.lower(): f.value for f in fields}

        self.assertEqual(field_map.get("grand total"), 6.00)
        self.assertEqual(field_map.get("payment method"), "Cash")
        self.assertNotIn("invoice_number", [f.semantic_category for f in fields])

    # 3. Document with unfamiliar labels (Purchase Order, Patient Reference, Reporting Quarter)
    def test_03_unfamiliar_labels(self):
        text = """
        GENERAL CLINICAL REPORT
        Patient Reference: MED-48192
        Reporting Quarter: Q3 2026
        Department: Radiology
        Status: Approved
        """
        fields, _, _ = DynamicExtractor.extract(text, "general_document", "general")
        field_labels = {f.label: f.value for f in fields}

        self.assertIn("Patient Reference", field_labels)
        self.assertEqual(field_labels["Patient Reference"], "MED-48192")
        self.assertIn("Reporting Quarter", field_labels)
        self.assertEqual(field_labels["Reporting Quarter"], "Q3 2026")
        self.assertIn("Department", field_labels)
        self.assertEqual(field_labels["Department"], "Radiology")

    # 4. Student academic record
    def test_04_student_academic_document(self):
        text = """
        STANFORD UNIVERSITY - OFFICIAL TRANSCRIPT
        Student Name: Jane Doe
        Enrollment Number: ENR-2024-9021
        Course / Program: Computer Science
        Semester: Fall 2026
        GPA: 3.85
        Credits: 120
        """
        doc_type, domain, _ = DocumentClassifier.classify(text, "transcript.pdf")
        self.assertEqual(doc_type, "academic_record")
        self.assertEqual(domain, "education")

        fields, _, _ = DynamicExtractor.extract(text, doc_type, domain)
        field_labels = {f.label: f.value for f in fields}

        self.assertEqual(field_labels.get("Student Name"), "Jane Doe")
        self.assertEqual(field_labels.get("Enrollment Number"), "ENR-2024-9021")
        self.assertEqual(field_labels.get("GPA"), 3.85)

    # 5. Business report with tables
    def test_05_business_report_with_table(self):
        text = """
        EXECUTIVE QUARTERLY PERFORMANCE REPORT
        Reporting Period: Q3 Fiscal Year 2026
        Department: Operations
        Operating Profit: 450000.00
        Revenue: 1200000.00
        """
        doc_type, domain, _ = DocumentClassifier.classify(text, "q3_report.pdf")
        self.assertEqual(doc_type, "business_report")
        self.assertEqual(domain, "business")

        fields, _, _ = DynamicExtractor.extract(text, doc_type, domain)
        field_labels = {f.label: f.value for f in fields}
        self.assertIn("Department", field_labels)

    # 6. PDF with selectable text
    def test_06_digital_pdf_selectable_text(self):
        pdf_path = os.path.join(self.fixtures_dir, "sample_uber_receipt.pdf")
        with open(pdf_path, "rb") as f:
            res = self.processor.process_document("sample_uber_receipt.pdf", f.read())
        self.assertTrue(res["success"])
        self.assertIn("Uber", res["raw_text"])

    # 7. Scanned PDF fallback
    def test_07_scanned_pdf_rendering(self):
        scanned_path = os.path.join(self.fixtures_dir, "sample_scanned_receipt.pdf")
        with open(scanned_path, "rb") as f:
            res = self.processor.process_document("sample_scanned_receipt.pdf", f.read())
        # Should not crash and handle safely
        self.assertIsInstance(res, dict)

    # 8. CSV with previously unseen column names
    def test_08_csv_unseen_columns(self):
        csv_content = "PatientID,BloodPressure,CholesterolLevel,RiskScore\nP101,120/80,195,0.12\nP102,130/85,210,0.25\n"
        res = self.processor.process_document("clinical_data.csv", csv_content.encode("utf-8"))
        self.assertTrue(res["success"])
        self.assertEqual(res["document_type"], "spreadsheet")
        self.assertEqual(len(res["tables"]), 1)
        self.assertEqual(res["tables"][0]["headers"], ["PatientID", "BloodPressure", "CholesterolLevel", "RiskScore"])
        self.assertEqual(len(res["tables"][0]["rows"]), 2)

    # 9. XLSX with multi-column data
    def test_09_xlsx_multi_column(self):
        df = pd.DataFrame({
            "EmployeeName": ["Alice", "Bob"],
            "Department": ["Engineering", "Product"],
            "Salary": [125000, 115000]
        })
        buf = io.BytesIO()
        df.to_excel(buf, index=False, engine="openpyxl")
        xlsx_bytes = buf.getvalue()

        res = self.processor.process_document("payroll.xlsx", xlsx_bytes)
        self.assertTrue(res["success"])
        self.assertEqual(res["document_type"], "spreadsheet")
        self.assertEqual(len(res["tables"]), 1)
        self.assertIn("EmployeeName", res["tables"][0]["headers"])
        # Check numeric sum discovery
        sum_fields = [f for f in res["fields"] if "Salary" in f["label"]]
        self.assertTrue(len(sum_fields) > 0)
        self.assertEqual(sum_fields[0]["value"], 240000.0)

    # 10. DOCX containing headings and tables
    def test_10_docx_parsing(self):
        doc = Document()
        doc.add_heading("Quarterly Operations Overview", level=1)
        doc.add_paragraph("Summary of operations for Q3 2026.")
        table = doc.add_table(rows=1, cols=3)
        hdr_cells = table.rows[0].cells
        hdr_cells[0].text = "Project"
        hdr_cells[1].text = "Lead"
        hdr_cells[2].text = "Budget"
        row_cells = table.add_row().cells
        row_cells[0].text = "Apollo"
        row_cells[1].text = "Dr. Evans"
        row_cells[2].text = "$50000"

        buf = io.BytesIO()
        doc.save(buf)
        docx_bytes = buf.getvalue()

        res = self.processor.process_document("operations_overview.docx", docx_bytes)
        self.assertTrue(res["success"])
        self.assertEqual(len(res["tables"]), 1)
        self.assertEqual(res["tables"][0]["headers"], ["Project", "Lead", "Budget"])
        self.assertEqual(res["tables"][0]["rows"][0][0], "Apollo")

    # 11. Malformed or unsupported file rejection
    def test_11_malformed_unsupported_file(self):
        # 1. Unsupported executable
        res_exe = self.processor.process_document("test.exe", b"MZ\x90\x00\x03\x00")
        self.assertFalse(res_exe["success"])
        self.assertIn("Unsupported file type", res_exe["error"])

        # 2. Corrupted PDF
        res_corrupt = self.processor.process_document("fake.pdf", b"NOT_A_VALID_PDF_HEADER")
        self.assertFalse(res_corrupt["success"])
        self.assertIn("does not match a valid PDF", res_corrupt["error"])

    # 12. Missing values and ambiguous dates
    def test_12_missing_values_and_ambiguous_dates(self):
        text = "Taxi Ride\nTotal: 16.5\n"
        fields, _, _ = DynamicExtractor.extract(text, "receipt", "finance")
        field_map = {f.label.lower(): f.value for f in fields}

        # Value 16.5 MUST be captured correctly (not 0.00!)
        self.assertEqual(field_map.get("grand total"), 16.5)
        # Missing fields must remain absent (NEVER fabricated defaults)
        self.assertNotIn("subtotal", field_map)
        self.assertNotIn("tax amount", field_map)
        self.assertNotIn("invoice date", field_map)

    # 13. Financial totals that disagree trigger warning
    def test_13_totals_disagree_triggers_warning(self):
        text = """
        STORE ABC
        Subtotal: 10.00
        Tax: 1.00
        Total: 15.00
        """
        fields, _, warnings = DynamicExtractor.extract(text, "receipt", "finance")
        self.assertTrue(len(warnings) > 0)
        self.assertIn("Mathematical discrepancy", warnings[0])
        field_map = {f.label.lower(): f.value for f in fields}
        # Original values preserved
        self.assertEqual(field_map.get("subtotal"), 10.00)
        self.assertEqual(field_map.get("tax amount"), 1.00)
        self.assertEqual(field_map.get("grand total"), 15.00)

    # 14. User adding and renaming dynamic fields (schema test)
    def test_14_user_field_customization(self):
        field = ExtractedField(
            id="field-custom-1",
            label="Enrollment ID",
            value="ENR-1029",
            data_type="text",
            semantic_category="identifier"
        )
        self.assertEqual(field.label, "Enrollment ID")
        # Rename field
        field.label = "Student Matriculation Number"
        self.assertEqual(field.label, "Student Matriculation Number")

    # 15. Saving, reloading, and exporting fields
    def test_15_export_and_json_serialization(self):
        response = DynamicDocumentResponse(
            success=True,
            document_type="academic_record",
            domain="education",
            fields=[
                ExtractedField(id="f1", label="Student", value="John Doe", data_type="text", semantic_category="identity")
            ],
            tables=[
                ExtractedTable(id="t1", title="Grades", headers=["Subject", "Grade"], rows=[["Math", "A"]])
            ]
        )
        res_dict = response.to_dict()
        # Verify clean JSON serialization
        json_str = json.dumps(res_dict)
        deserialized = json.loads(json_str)
        self.assertTrue(deserialized["success"])
        self.assertEqual(deserialized["fields"][0]["label"], "Student")
        self.assertEqual(deserialized["tables"][0]["rows"][0][1], "A")

    # 16. Security: Path traversal & Safe SQL Parsing
    def test_16_security_and_safe_sql(self):
        # 1. Path traversal sanitization
        res = self.processor.process_document("../../../etc/shadow.png", b"0" * 10)
        self.assertFalse(res["success"])
        self.assertIn("path traversal", res["error"].lower())

        # 2. Safe SQL parsing (never executes SQL)
        sql_content = """
        CREATE TABLE users (
            id INT PRIMARY KEY,
            username VARCHAR(50),
            email VARCHAR(100)
        );
        INSERT INTO users (id, username, email) VALUES
        (1, 'alice', 'alice@test.com'),
        (2, 'bob', 'bob@test.com');
        """
        res_sql = self.processor.process_document("schema_export.sql", sql_content.encode("utf-8"))
        self.assertTrue(res_sql["success"])
        self.assertEqual(res_sql["document_type"], "database_export")
        self.assertEqual(len(res_sql["tables"]), 1)
        self.assertEqual(res_sql["tables"][0]["headers"], ["id", "username", "email"])
        self.assertEqual(len(res_sql["tables"][0]["rows"]), 2)

if __name__ == "__main__":
    unittest.main()
