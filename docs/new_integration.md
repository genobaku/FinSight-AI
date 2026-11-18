# FINSIGHT AI CORE — PRIVATE AI EXTRACTION API
### System Architecture Transformation & Final Delivery Report

---

## 1. EXECUTIVE SUMMARY & REPOSITORY AUDIT

An exhaustive audit of the existing repository was conducted across backend services, machine learning models, training scripts, parsers, and test suites.

### Audit Findings & Service Boundaries
1. **Flask API (`backend/app.py`, port 5000):** Synchronous HTTP wrapper exposing `/api/classify-document` and `/api/health`. Provided direct linkage to [processor.py](file:///d:/Programming/2026/Project/Finsight/backend/document_processing/processor.py), but lacked API authentication, async job scheduling, database persistence, and lifecycle verification.
2. **FastAPI Microservice (`backend/fastapi_backend`):** Early prototype with basic invoice/vendor schemas, but duplicated OCR by calling Gemini directly rather than leveraging the local RapidOCR/ML extraction engine.
3. **Express Node Server (`frontend/server.ts`, port 3000):** Proxy/BFF layer routing client calls to Flask, maintaining mock in-memory stores and a direct Gemini client.
4. **Machine Learning Model Inspection:**
   - Model artifacts: `models/production/transaction_classifier.joblib` and `models/production/tfidf_vectorizer.joblib`.
   - Inspection of [train.py](file:///d:/Programming/2026/Project/Finsight/train.py) revealed that the classifier is a TF-IDF + Logistic Regression model trained on 200 synthetic transaction strings across 8 expense categories (`Food`, `Transport`, `Shopping`, `Bills`, `Entertainment`, `Healthcare`, `Education`, `Salary`).
   - **Critical Architectural Boundary:** The transaction classifier is strictly a transaction categorization model. It is **not** a general document layout or token-level entity extractor. The repository's [classifier.py](file:///d:/Programming/2026/Project/Finsight/backend/document_processing/classifier.py) and [dynamic_extractor.py](file:///d:/Programming/2026/Project/Finsight/backend/document_processing/dynamic_extractor.py) handle document domain classification and dynamic schema extraction, preserving model separation.
5. **Security & Data Integrity:**
   - Existing parsers (`SpreadsheetParser`, `DocxParser`, `TextParser`, `SqlParser`) safely parse files. Specifically, [sql_parser.py](file:///d:/Programming/2026/Project/Finsight/backend/document_processing/parsers/sql_parser.py) performs lexical regex parsing and **never executes uploaded SQL**.
   - Missing fields are strictly kept as `None` without fabricating values or confidence scores. Conflicting totals (`subtotal + tax != total`) trigger explicit warning flags rather than silent overwriting.

The full forensic audit is documented in [architecture_audit_report.md](file:///d:/Programming/2026/Project/Finsight/docs/architecture_audit_report.md).

---

## 2. FINAL REPOSITORY STRUCTURE

```
d:\Programming\2026\Project\Finsight
├── core_api/                              # FINSIGHT AI CORE PRIVATE API
│   ├── __init__.py
│   ├── main.py                            # FastAPI app, CORS, tracing middleware, lifespan
│   ├── core/
│   │   ├── config.py                      # Pydantic BaseSettings, env vars, token constraints
│   │   └── security.py                    # API key auth, Bearer JWT, sliding-window rate limit, magic bytes
│   ├── db/
│   │   └── database.py                    # SQLAlchemy ORM (PostgreSQL/Supabase & SQLite hybrid)
│   ├── routers/
│   │   └── v1_router.py                   # /v1 versioned endpoints (health, documents, jobs, fields, verify, models)
│   ├── schemas/
│   │   └── v1_schemas.py                  # Versioned Pydantic v2 dynamic extraction schemas
│   ├── services/
│   │   └── extraction_service.py          # DocumentProcessor orchestration, UUID storage vault, DB sync
│   └── storage_vault/                     # Private, UUID-keyed raw file storage
├── backend/
│   ├── app.py                             # Preserved Flask API (backward compatibility)
│   └── document_processing/               # Preserved Core Extraction Engine
│       ├── processor.py                   # RapidOCR, pypdfium2 digital/scanned PDF handling
│       ├── classifier.py                  # Document & domain classifier
│       ├── dynamic_extractor.py           # Dynamic key-value, table & discrepancy extraction
│       ├── extractor.py                   # Legacy rule-based invoice extractor
│       ├── models.py                      # Internal dataclass contracts
│       └── parsers/                       # Format parsers: CSV/XLSX, DOCX, TXT/JSON, Safe SQL
├── models/
│   └── production/                        # Trained Scikit-learn model & vectorizer
├── tests/
│   ├── test_core_api.py                   # 10 integration & security tests for Core API
│   ├── test_dynamic_extraction.py         # 16 dynamic extraction & format parser tests
│   ├── test_full_pipeline.py              # 12 end-to-end pipeline & security tests
│   ├── test_document_processor.py         # 4 OCR & processor unit tests
│   └── test_extractor_units.py            # 4 extraction unit tests
├── Dockerfile.core                        # Hardened multi-stage container for Core API
├── docker-compose.core.yml                # Docker Compose with PostgreSQL & Core API
├── requirements.txt                       # Unified Python dependency specification
├── .env.core.example                      # Production environment template
└── docs/
    ├── architecture_audit_report.md       # Comprehensive repository audit
    └── api_integration_guide.md           # API reference & Demo integration contract
```

---

## 3. ARCHITECTURE & SECURITY DESIGN

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

### Security Measures Implemented
- **Authentication:** Dual-mode authentication via `X-API-Key` (constant-time HMAC comparison) or `Bearer <JWT>` tokens.
- **Tenant Isolation:** All document operations query against `owner_id`. Cross-tenant requests return `HTTP 404 Not Found`.
- **Payload Sanitization & Magic Bytes:** Strips path traversal attempts (`..`, `/`, `\`); validates magic header bytes (`%PDF`, PNG, JPEG, ZIP); immediately blocks executable binaries (`MZ`, `\x7fELF`).
- **Safe SQL Ingestion:** SQL exports are lexically parsed into structured table definitions and rows without executing SQL against any database.
- **Rate Limiting:** Enforces an in-memory sliding-window rate limit (120 requests/minute per client).

---

## 4. API SPECIFICATION & PYDANTIC CONTRACT

### Implemented Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/v1/health` | Service health, ML model readiness, OCR availability, DB connectivity |
| `POST` | `/v1/documents` | Ingests document into private vault; returns `document_id` and metadata |
| `GET` | `/v1/documents/{document_id}` | Retrieves document metadata and extracted records |
| `POST` | `/v1/documents/{document_id}/extract` | Runs extraction synchronously or schedules background job (`async_processing: true`) |
| `GET` | `/v1/jobs/{job_id}` | Polls async job processing status and completion percentage |
| `GET` | `/v1/documents/{document_id}/results` | Retrieves dynamic fields, tables, warnings, evidence, and legacy invoice fallback |
| `PATCH` | `/v1/documents/{document_id}/fields/{field_id}` | Applies human correction to extracted values; logs audit trail |
| `POST` | `/v1/documents/{document_id}/verify` | Submits human approval or rejection; transitions document status |
| `GET` | `/v1/models` | Reports active OCR engine and model specifications without leaking source code |

### Dynamic Extraction Contract ([v1_schemas.py](file:///d:/Programming/2026/Project/Finsight/core_api/schemas/v1_schemas.py))
Every extracted field adheres to the validated Pydantic schema:
- `id`: Document-scoped immutable ID.
- `label`: Canonical or dynamically discovered field label.
- `original_label`: Exact label as seen in document.
- `value`: Normalized value (string, float, date, boolean, array, or object).
- `data_type`: Explicit typing (`text`, `integer`, `decimal`, `currency`, `date`, etc.).
- `semantic_category`: Category (`merchant`, `financial_total`, `tax`, `subtotal`, `date`, `identity`, `general`).
- `source_evidence`: Verifiable text snippet, page number, and bounding box `[x_min, y_min, x_max, y_max]`.
- `confidence`: Calibrated score (or `null` when uncalibrated; never fabricated).
- `verification_status`: Lifecycle state (`pending`, `user_modified`, `verified`, `rejected`).

---

## 5. TEST VERIFICATION RESULTS

Automated tests were executed across the entire repository. **100% of the 46 test cases passed successfully.**

```text
Ran 46 tests in 16.029s

OK
- test_core_api.py (10/10 PASSED):
  ✓ test_01_health_endpoint
  ✓ test_02_authentication_enforced (rejection of unauthenticated & invalid keys)
  ✓ test_03_executable_binary_upload_blocked (PE/MZ blocked)
  ✓ test_04_empty_file_rejected (400 Bad Request)
  ✓ test_05_upload_and_extract_receipt_text (Synchronous dynamic extraction)
  ✓ test_06_async_job_lifecycle (202 Accepted, job status polling)
  ✓ test_07_field_patch_and_verify (User correction & approval lifecycle)
  ✓ test_08_cross_tenant_access_denied (Tenant isolation verified)
  ✓ test_09_safe_sql_parsing (Lexical SQL parsing without execution)
  ✓ test_10_legacy_classify_document_compat (Backward compatibility verified)

- test_dynamic_extraction.py (16/16 PASSED):
  ✓ Standard receipts, alternate layouts, unfamiliar labels, academic records,
    business reports with tables, digital PDFs, scanned PDFs, CSVs, XLSX, DOCX,
    discrepancy warnings, user field edits, safe SQL.

- test_full_pipeline.py (12/12 PASSED):
  ✓ Real receipt images, text PDFs, blank image detection (no fabrication),
    file type validation, 10MB limits, malformed PDF safety, path traversal sanitization.

- test_document_processor.py & test_extractor_units.py (8/8 PASSED):
  ✓ Unit tests for OCR extraction, currency detection, and totals reconciliation.
```

In addition, [test_e2e.py](file:///d:/Programming/2026/Project/Finsight/test_e2e.py) was executed against the live services and confirmed full end-to-end functionality across receipt, academic record, and CSV spreadsheet payloads.

---

## 6. LOCAL AND CLOUD DEPLOYMENT INSTRUCTIONS

### Local Development (Windows / Linux / macOS)
1. Ensure Python 3.12+ is active and dependencies are installed:
   ```powershell
   pip install -r requirements.txt
   ```
2. Start the Finsight AI Core API:
   ```powershell
   python -m uvicorn core_api.main:app --host 0.0.0.0 --port 8000 --reload
   ```
3. Verify the service:
   ```powershell
   curl http://localhost:8000/v1/health
   ```
4. Access interactive API documentation at `http://localhost:8000/docs`.

### Docker Deployment
1. Build and run using Docker Compose:
   ```powershell
   docker compose -f docker-compose.core.yml up --build -d
   ```
2. View container logs:
   ```powershell
   docker compose -f docker-compose.core.yml logs -f finsight-core-api
   ```

---

## 7. DEMO INTEGRATION GUIDE (`finsight-ai-demo`)

The separate collaborative application `finsight-ai-demo` communicates exclusively with the Core API via a backend-for-frontend proxy:
1. Store `CORE_API_KEY` on the demo server; never expose it in client-side bundles.
2. Ingest documents by posting multipart files to `POST /v1/documents`.
3. Trigger extraction with `POST /v1/documents/{id}/extract`.
4. Allow users to correct extracted values via `PATCH /v1/documents/{id}/fields/{field_id}` and submit approvals via `POST /v1/documents/{id}/verify`.
5. Full integration code examples are provided in [api_integration_guide.md](file:///d:/Programming/2026/Project/Finsight/docs/api_integration_guide.md).