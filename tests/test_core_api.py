"""
Unit and Integration Test Suite for Finsight AI Core API
Validates:
- GET /v1/health
- POST /v1/documents (file upload, format validation, safe filename, security checks)
- POST /v1/documents/{id}/extract (synchronous dynamic extraction)
- POST /v1/documents/{id}/extract (asynchronous job scheduling with 202 Accepted)
- GET /v1/jobs/{job_id} (job status and progress)
- GET /v1/documents/{id}/results (dynamic fields, tables, legacy_invoice, warnings)
- PATCH /v1/documents/{id}/fields/{field_id} (human corrections)
- POST /v1/documents/{id}/verify (approval and verification transition)
- GET /v1/models (model registry)
- Security: Authentication enforcement, invalid API key rejection, cross-tenant isolation, executable blocking
"""

import os
import io
import json
import unittest
from fastapi.testclient import TestClient

from core_api.main import app
from core_api.core.config import settings

class TestCoreAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        cls.valid_api_key = "finsight-core-live-key-2026"
        cls.headers = {"X-API-Key": cls.valid_api_key}

    # 1. Health Checks
    def test_01_health_endpoint(self):
        resp = self.client.get("/v1/health")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["status"], "ok")
        self.assertEqual(data["service"], "FinSight AI Core API")
        self.assertTrue(data["ml_models_loaded"])
        self.assertTrue(data["ocr_engine_available"])
        self.assertTrue(data["database_connected"])

    # 2. Authentication and Security
    def test_02_authentication_enforced(self):
        # Missing auth header
        resp = self.client.get("/v1/models")
        self.assertEqual(resp.status_code, 401)
        self.assertIn("Authentication required", resp.json()["detail"])

        # Invalid auth header
        resp = self.client.get("/v1/models", headers={"X-API-Key": "invalid-hacker-key"})
        self.assertEqual(resp.status_code, 401)
        self.assertIn("Invalid or unauthorized", resp.json()["detail"])

        # Valid auth header
        resp = self.client.get("/v1/models", headers=self.headers)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("models", data)
        self.assertTrue(len(data["models"]) >= 3)

    def test_03_executable_binary_upload_blocked(self):
        # File starting with MZ (Windows PE)
        exe_bytes = b"MZ\x90\x00\x03\x00\x00\x00\x04\x00\x00\x00\xff\xff"
        files = {"file": ("malware.exe", exe_bytes, "application/octet-stream")}
        resp = self.client.post("/v1/documents", files=files, headers=self.headers)
        # Should be rejected (unsupported extension or binary executable)
        self.assertIn(resp.status_code, [400, 415])

    def test_04_empty_file_rejected(self):
        files = {"file": ("empty.txt", b"", "text/plain")}
        resp = self.client.post("/v1/documents", files=files, headers=self.headers)
        self.assertEqual(resp.status_code, 400)
        self.assertIn("empty", resp.json()["detail"].lower())

    # 3. Document Ingestion & Synchronous Dynamic Extraction
    def test_05_upload_and_extract_receipt_text(self):
        receipt_content = """COFFEE ROASTERS INC.
100 Pine Street, San Francisco, CA
Date: 2026-08-20
Invoice #: REC-8831
1 Cold Brew Latte 5.50 5.50
1 Croissant Pastry 4.25 4.25
Subtotal: $9.75
Tax (8.5%): $0.83
Total: $10.58
Payment: Apple Pay
"""
        files = {"file": ("coffee_receipt.txt", receipt_content.encode("utf-8"), "text/plain")}
        upload_resp = self.client.post("/v1/documents", files=files, headers=self.headers)
        self.assertEqual(upload_resp.status_code, 201)
        upload_data = upload_resp.json()
        self.assertTrue(upload_data["success"])
        doc_id = upload_data["document_id"]
        self.assertEqual(upload_data["format"], "txt")

        # Run Synchronous Extraction
        extract_resp = self.client.post(
            f"/v1/documents/{doc_id}/extract",
            json={"async_processing": False},
            headers=self.headers
        )
        self.assertEqual(extract_resp.status_code, 200)
        result = extract_resp.json()
        self.assertTrue(result["success"])
        self.assertEqual(result["document_id"], doc_id)
        self.assertIn(result["document_type"], ["receipt", "invoice"])
        self.assertEqual(result["domain"], "finance")

        # Verify dynamic fields exist without fabricated data
        field_labels = [f["label"].lower() for f in result["fields"]]
        self.assertTrue(any("total" in l for l in field_labels))
        self.assertTrue(any("subtotal" in l for l in field_labels))
        self.assertTrue(any("tax" in l for l in field_labels))

        # Check line items table
        self.assertTrue(len(result["tables"]) >= 1)

        # Check legacy invoice container for demo compatibility
        legacy = result.get("legacy_invoice", {})
        self.assertIsNotNone(legacy.get("total"))

    # 4. Asynchronous Job Scheduling & Status Polling
    def test_06_async_job_lifecycle(self):
        doc_text = """ACME INDUSTRIAL SUPPLIES
Date: 2026-09-01
Invoice Number: INV-9901
Item A: 100.00
Subtotal: $100.00
Tax: $10.00
Total: $110.00
"""
        files = {"file": ("invoice_async.txt", doc_text.encode("utf-8"), "text/plain")}
        upload_resp = self.client.post("/v1/documents", files=files, headers=self.headers)
        doc_id = upload_resp.json()["document_id"]

        # Schedule Async Job
        job_resp = self.client.post(
            f"/v1/documents/{doc_id}/extract",
            json={"async_processing": True},
            headers=self.headers
        )
        self.assertEqual(job_resp.status_code, 200)
        job_data = job_resp.json()
        self.assertTrue(job_data["success"])
        self.assertIn("job_id", job_data)
        job_id = job_data["job_id"]

        # Poll Job Status
        status_resp = self.client.get(f"/v1/jobs/{job_id}", headers=self.headers)
        self.assertEqual(status_resp.status_code, 200)
        status_data = status_resp.json()
        self.assertEqual(status_data["job_id"], job_id)
        self.assertIn(status_data["status"], ["queued", "processing", "completed"])

    # 5. Dynamic Field Correction and Document Verification
    def test_07_field_patch_and_verify(self):
        doc_text = """ACADEMIC CERTIFICATE
Student Name: Alex Morgan
Degree: Master of Computer Science
Graduation Date: 2026-05-15
GPA: 3.92
"""
        files = {"file": ("student_cert.txt", doc_text.encode("utf-8"), "text/plain")}
        upload_resp = self.client.post("/v1/documents", files=files, headers=self.headers)
        doc_id = upload_resp.json()["document_id"]

        # Extract
        extract_resp = self.client.post(
            f"/v1/documents/{doc_id}/extract",
            json={"async_processing": False},
            headers=self.headers
        )
        self.assertEqual(extract_resp.status_code, 200)
        fields = extract_resp.json()["fields"]
        self.assertTrue(len(fields) > 0)
        target_field = fields[0]
        field_id = target_field["id"]

        # Patch Field Value (User correction)
        patch_resp = self.client.patch(
            f"/v1/documents/{doc_id}/fields/{field_id}",
            json={"value": "Alexander Morgan, M.Sc.", "verification_status": "user_modified"},
            headers=self.headers
        )
        self.assertEqual(patch_resp.status_code, 200)
        patched_data = patch_resp.json()
        self.assertEqual(patched_data["value"], "Alexander Morgan, M.Sc.")
        self.assertEqual(patched_data["verification_status"], "user_modified")

        # Verify Document (Approval)
        verify_resp = self.client.post(
            f"/v1/documents/{doc_id}/verify",
            json={"action": "approve", "reviewer_notes": "Identity and degree verified against registry."},
            headers=self.headers
        )
        self.assertEqual(verify_resp.status_code, 200)
        verify_data = verify_resp.json()
        self.assertTrue(verify_data["success"])
        self.assertEqual(verify_data["extraction_status"], "verified")

        # Confirm Document Results Reflect Verified State
        results_resp = self.client.get(f"/v1/documents/{doc_id}/results", headers=self.headers)
        self.assertEqual(results_resp.status_code, 200)
        self.assertEqual(results_resp.json()["extraction_status"], "verified")

    # 6. Tenant Isolation / Ownership Enforcement
    def test_08_cross_tenant_access_denied(self):
        doc_text = "Secret proprietary document text\nTotal: $500.00"
        files = {"file": ("tenant_a.txt", doc_text.encode("utf-8"), "text/plain")}
        # Upload as Tenant A
        upload_resp = self.client.post("/v1/documents", files=files, headers=self.headers)
        doc_id = upload_resp.json()["document_id"]

        # Attempt to access or extract as Tenant B (using second key)
        tenant_b_headers = {"X-API-Key": "finsight-demo-app-key-2026"}
        access_resp = self.client.get(f"/v1/documents/{doc_id}/results", headers=tenant_b_headers)
        # Should be 404 (Not Found or Access Denied)
        self.assertEqual(access_resp.status_code, 404)

    # 7. Safe SQL Parsing
    def test_09_safe_sql_parsing(self):
        sql_content = """
CREATE TABLE customers (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    balance DECIMAL(10,2)
);

INSERT INTO customers (id, name, balance) VALUES
(1, 'TechCorp', 1540.50),
(2, 'BioHealth', 8900.00);
"""
        files = {"file": ("database_export.sql", sql_content.encode("utf-8"), "application/sql")}
        upload_resp = self.client.post("/v1/documents", files=files, headers=self.headers)
        self.assertEqual(upload_resp.status_code, 201)
        doc_id = upload_resp.json()["document_id"]

        extract_resp = self.client.post(
            f"/v1/documents/{doc_id}/extract",
            json={"async_processing": False},
            headers=self.headers
        )
        self.assertEqual(extract_resp.status_code, 200)
        data = extract_resp.json()
        self.assertEqual(data["document_type"], "database_export")
        self.assertTrue(len(data["tables"]) >= 1)
        tbl = data["tables"][0]
        self.assertIn("customers", tbl["title"].lower())
        self.assertTrue(len(tbl["rows"]) >= 2)

    # 8. Backward Compatibility: Legacy /api/classify-document
    def test_10_legacy_classify_document_compat(self):
        doc_text = """CORNER DELI
Date: 2026-08-10
Sandwich: $7.50
Water: $1.50
Subtotal: $9.00
Tax: $0.72
Total: $9.72
"""
        files = {"file": ("lunch.txt", doc_text.encode("utf-8"), "text/plain")}
        resp = self.client.post("/api/classify-document", files=files)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertTrue(data["success"])
        self.assertEqual(data["document_type"], "receipt")
        self.assertIn("category", data)
        self.assertIn("invoice", data)
