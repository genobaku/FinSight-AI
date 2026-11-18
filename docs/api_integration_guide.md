# FINSIGHT AI CORE API — INTEGRATION & ARCHITECTURE SPECIFICATION

**System:** Finsight AI Core API (`finsight-core-api`)  
**Version:** 1.0.0  
**Target Consumers:** `finsight-ai-demo`, Internal Microservices, Enterprise Clients  

---

## 1. SYSTEM ARCHITECTURE & ISOLATION DESIGN

```
+--------------------------------------------------------------------------------+
|                         DEMO / CLIENT APPLICATION                              |
|                            (finsight-ai-demo)                                  |
|   - Browser Frontend (React SPA)                                              |
|   - Server Proxy / BFF (Express / Next.js)                                     |
|   * Holds client API Key strictly server-side (NEVER exposes in VITE/frontend) |
+--------------------------------------------------------------------------------+
                                       |
                                       | HTTPS + X-API-Key / Bearer JWT
                                       v
+--------------------------------------------------------------------------------+
|                           FINSIGHT AI CORE API                                 |
|               (FastAPI / Pydantic v2 / SQLAlchemy / Python 3.12)               |
|                                                                                |
|  [Security & Rate Limiting Gate]                                              |
|    - Sliding window rate limiter (120 req/min)                                 |
|    - Constant-time HMAC API Key matching                                       |
|    - Tenant Isolation & Ownership Enforcement                                  |
|    - File-Size & Magic-Byte Validation (Blocks PE/ELF executables)             |
|                                                                                |
|  [Versioned Routes /v1]                                                        |
|    - GET  /v1/health                                                           |
|    - POST /v1/documents                                                        |
|    - GET  /v1/documents/{document_id}                                         |
|    - POST /v1/documents/{document_id}/extract (sync or async job)              |
|    - GET  /v1/jobs/{job_id}                                                    |
|    - GET  /v1/documents/{document_id}/results                                 |
|    - PATCH/v1/documents/{document_id}/fields/{field_id}                        |
|    - POST /v1/documents/{document_id}/verify                                  |
|    - GET  /v1/models                                                           |
|                                                                                |
|  [Modular Extraction Pipeline]                                                 |
|    1. File Ingestion & Format Detection (PDF, PNG, JPG, DOCX, CSV, XLSX, SQL)  |
|    2. Digital PDF Font Stream & pypdfium2 Fallback Rendering                   |
|    3. Local OCR: RapidOCR (OnnxRuntime) + Natural Reading Line Clustering      |
|    4. Document & Domain Classifier (Multi-keyword structural heuristic)        |
|    5. Dynamic Semantic Extractor (Arbitrary key-value discovery)               |
|    6. Financial Discrepancy Reconciliation (Subtotal + Tax vs. Total)          |
|    7. Scikit-learn Transaction Categorizer (Restricted to financial lines)     |
|                                                                                |
|  [Storage Vault & Persistence Layer]                                           |
|    - UUID-keyed private file storage (Path traversal immune)                   |
|    - PostgreSQL (Supabase) / SQLite hybrid compatibility                       |
|    - Complete Audit Logging of all uploads, extractions, edits, and approvals  |
+--------------------------------------------------------------------------------+
```

---

## 2. API ENDPOINT REFERENCE

All endpoints except `/v1/health` require the `X-API-Key: <key>` header or a valid `Authorization: Bearer <jwt>` token.

### 2.1 Health Check
- **Endpoint:** `GET /v1/health`
- **Auth:** Public
- **Response:**
```json
{
  "status": "ok",
  "service": "FinSight AI Core API",
  "version": "1.0.0",
  "ml_models_loaded": true,
  "ocr_engine_available": true,
  "storage_vault_ready": true,
  "database_connected": true,
  "timestamp": "2026-10-30T08:33:00.000000"
}
```

### 2.2 Upload Document
- **Endpoint:** `POST /v1/documents`
- **Content-Type:** `multipart/form-data`
- **Payload:** `file: <binary>`
- **Response:** `HTTP 201 Created`
```json
{
  "success": true,
  "document_id": "82438014-c555-4bd5-a5b8-dc441332b2ff",
  "filename": "invoice_sample.pdf",
  "file_size_bytes": 104250,
  "format": "pdf",
  "owner_id": "client_ebd80b569222",
  "status": "uploaded",
  "created_at": "2026-10-30T08:33:05.120000"
}
```

### 2.3 Run Extraction
- **Endpoint:** `POST /v1/documents/{document_id}/extract`
- **Payload (Optional):**
```json
{
  "async_processing": false,
  "include_raw_text": true,
  "run_transaction_classification": true
}
```
- **Synchronous Response (200 OK):**
```json
{
  "success": true,
  "document_id": "82438014-c555-4bd5-a5b8-dc441332b2ff",
  "document_type": "receipt",
  "domain": "finance",
  "extraction_status": "needs_review",
  "fields": [
    {
      "id": "82438014-c555_field-merchant-8df9e4",
      "label": "Merchant / Organization",
      "original_label": "Merchant / Organization",
      "value": "Starbucks Coffee",
      "data_type": "text",
      "semantic_category": "merchant",
      "source_evidence": {
        "text": "Starbucks Coffee",
        "page": 1,
        "bounding_box": null
      },
      "confidence": 0.90,
      "verification_status": "pending"
    },
    {
      "id": "82438014-c555_field-total-1b5489",
      "label": "Grand Total",
      "original_label": "Total",
      "value": 10.58,
      "data_type": "currency",
      "semantic_category": "financial_total",
      "source_evidence": {
        "text": "Total: $10.58",
        "page": 1,
        "bounding_box": null
      },
      "confidence": 0.95,
      "verification_status": "pending"
    }
  ],
  "tables": [
    {
      "id": "82438014-c555_table-line-items",
      "title": "Line Items",
      "headers": ["Description", "Quantity", "Unit Price", "Total"],
      "rows": [
        ["Cold Brew Latte", 1, 5.50, 5.50],
        ["Croissant Pastry", 1, 4.25, 4.25]
      ]
    }
  ],
  "warnings": [],
  "metadata": {
    "filename": "invoice_sample.pdf",
    "parser": "pdf_hybrid"
  },
  "raw_text": "...",
  "processed_at": "2026-10-30T08:33:06.120000",
  "transaction_category": "Food",
  "transaction_confidence": 0.9850,
  "legacy_invoice": {
    "vendor": "Starbucks Coffee",
    "total": 10.58,
    "category": "Food"
  }
}
```
- **Asynchronous Response (202 Accepted):**
```json
{
  "success": true,
  "message": "Document extraction job scheduled successfully.",
  "document_id": "82438014-c555-4bd5-a5b8-dc441332b2ff",
  "job_id": "f5838014-d666-4ad5-beef-ec441332a1bb",
  "status": "queued",
  "poll_url": "/v1/jobs/f5838014-d666-4ad5-beef-ec441332a1bb"
}
```

### 2.4 Poll Job Status
- **Endpoint:** `GET /v1/jobs/{job_id}`
- **Response:**
```json
{
  "job_id": "f5838014-d666-4ad5-beef-ec441332a1bb",
  "document_id": "82438014-c555-4bd5-a5b8-dc441332b2ff",
  "status": "completed",
  "progress_percentage": 100,
  "created_at": "2026-10-30T08:33:05.000000",
  "completed_at": "2026-10-30T08:33:07.000000",
  "error_message": null
}
```

### 2.5 User Field Correction
- **Endpoint:** `PATCH /v1/documents/{document_id}/fields/{field_id}`
- **Payload:**
```json
{
  "value": 11.00,
  "label": "Grand Total",
  "verification_status": "user_modified"
}
```
- **Response:** `HTTP 200 OK` (returns updated `ExtractedFieldSchema` and records an immutable audit log entry).

### 2.6 Verify Document
- **Endpoint:** `POST /v1/documents/{document_id}/verify`
- **Payload:**
```json
{
  "action": "approve",
  "reviewer_notes": "Reviewed and reconciled by auditor."
}
```
- **Response:**
```json
{
  "success": true,
  "document_id": "82438014-c555-4bd5-a5b8-dc441332b2ff",
  "extraction_status": "verified",
  "verified_at": "2026-10-30T08:33:10.000000",
  "verified_fields_count": 8,
  "message": "Document extraction marked as 'verified' successfully."
}
```

### 2.7 Model Registry
- **Endpoint:** `GET /v1/models`
- **Response:** Lists active local models (`RapidOCR`, `Scikit-Learn Transaction Categorizer`, `Dynamic Semantic Layout Extractor`) and operational parameters without disclosing source code or proprietary weights.

---

## 3. DEMO APPLICATION INTEGRATION GUIDE (`finsight-ai-demo`)

The collaborative demo application consumes the API via a server-side proxy pattern:

1. **Proxy Endpoint in Demo Backend (`server.ts` or Node BFF):**
```typescript
import express from 'express';
import fetch from 'node-fetch';
import FormData from 'form-data';

const router = express.Router();
const CORE_API_URL = process.env.CORE_API_URL || 'http://localhost:8000';
const CORE_API_KEY = process.env.CORE_API_KEY; // Never expose in browser

// 1. Upload & Extract Document
router.post('/api/demo/process-document', async (req, res) => {
  try {
    const formData = new FormData();
    // Forward uploaded file stream
    formData.append('file', req.file.buffer, req.file.originalname);

    // Step A: Upload to Core API
    const uploadRes = await fetch(`${CORE_API_URL}/v1/documents`, {
      method: 'POST',
      headers: { 'X-API-Key': CORE_API_KEY, ...formData.getHeaders() },
      body: formData
    });
    const uploadData = await uploadRes.json();
    if (!uploadRes.ok) return res.status(uploadRes.status).json(uploadData);

    // Step B: Extract Document
    const extractRes = await fetch(`${CORE_API_URL}/v1/documents/${uploadData.document_id}/extract`, {
      method: 'POST',
      headers: { 'X-API-Key': CORE_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ async_processing: false })
    });
    const extractData = await extractRes.json();
    return res.status(extractRes.status).json(extractData);
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});
```

2. **Client Isolation:**
   - Each demo user or tenant can be provisioned a dedicated API key or JWT token.
   - The Core API strictly enforces document ownership: any attempt by Client B to access Client A's document returns `HTTP 404 Not Found`.
