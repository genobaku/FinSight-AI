# ARCHITECTURE AUDIT REPORT: FINSIGHT AI REPOSITORY

**Author:** Principal AI Systems Architect & Application Security Engineer  
**Date:** October 30, 2026  
**System:** FinSight AI Core Infrastructure  
**Target:** Private Modular Document Extraction Core API (`finsight-core-api`)  

---

## 1. EXECUTIVE SUMMARY & REPOSITORY OVERVIEW

An exhaustive forensic inspection of the repository (`d:\Programming\2026\Project\Finsight`) was conducted across backend services, machine learning modules, frontend clients, integration fixtures, and configuration templates.

The codebase currently spans:
1. **Flask Service (`backend/app.py`, port 5000):** Serves `/api/health` and `/api/classify-document`. Backed by `backend.document_processing.processor.DocumentProcessor`.
2. **FastAPI Microservice (`backend/fastapi_backend/main.py`, port 8000):** Early scaffold with partial endpoints for `/api/invoices/extract` (calls external Google Gemini API via `gemini_ocr.py`), `/api/cloudinary/upload`, and database CRUD stub tables.
3. **Express Node Server (`frontend/server.ts`, port 3000):** Serves as an orchestration layer / backend-for-frontend (BFF) proxying `/api/classify-document` to the Python Flask service (`localhost:5000`), maintaining in-memory mock stores, and invoking Google Gemini via `@google/genai`.
4. **React + TypeScript + Vite SPA (`frontend/src`):** Single-page application calling Express proxy endpoints.
5. **Document Processing Core Engine (`backend/document_processing/`):** A robust local Python pipeline featuring `RapidOCR` with OnnxRuntime, `PdfReader` & `pypdfium2`, multi-format parsers (`SpreadsheetParser`, `DocxParser`, `TextParser`, `SqlParser`), Scikit-learn transaction classification (`transaction_classifier.joblib`), dynamic key-value extraction (`dynamic_extractor.py`), and document/domain classification (`classifier.py`).

All 36 existing unit, parser, and pipeline tests in `tests/` pass with 100% success (`Ran 36 tests in 11.775s, OK`).

---

## 2. COMPONENT RESPONSIBILITIES & OVERLAPS

| Service / Layer | Technology | Primary Responsibilities | Overlaps & Deficiencies |
|---|---|---|---|
| **Flask API** (`backend/app.py`) | Flask 3.1, CORS, Port 5000 | `/api/classify-document` endpoint accepting multipart file or base64 JSON payload. Invokes `DocumentProcessor`. | Synchronous processing only. Lacks token authentication, job tracking, async queuing, and persistence. |
| **FastAPI Microservice** (`backend/fastapi_backend`) | FastAPI 0.142, SQLAlchemy, Pydantic, Port 8000 | `/api/invoices`, `/api/invoices/extract`, `/api/cloudinary/upload`. | Duplicates extraction logic by calling Gemini cloud directly instead of the local RapidOCR/ML processor. Lacks connection to `DocumentProcessor`. |
| **Express BFF** (`frontend/server.ts`) | Express 4, Node.js, Port 3000 | Proxies `/api/classify-document` to Flask; embeds in-memory stores; embeds direct Gemini client. | Unnecessary middle-man for a pure core API. Mixes UI concerns with extraction orchestration. |
| **Document Processing Engine** (`backend/document_processing`) | Python (RapidOCR, pypdfium2, sklearn, pandas, docx) | Format detection, OCR, text extraction, layout grouping, classification, dynamic extraction, safe SQL parsing. | High-quality baseline logic, but currently tied to synchronous execution and lacks persistent job/storage abstraction. |

---

## 3. MODEL INVENTORY & TRAINING VALIDATION

### Model Artifacts
- `models/production/transaction_classifier.joblib` (41,071 bytes)
- `models/production/tfidf_vectorizer.joblib` (17,711 bytes)
- Duplicated in `models/` root directory.

### Training Source Inspection (`train.py`)
- **Dataset:** Synthetic dataset of 25 transaction descriptions across 8 categories: `Food`, `Transport`, `Shopping`, `Bills`, `Entertainment`, `Healthcare`, `Education`, `Salary`. (Total: 200 samples).
- **Vectorizer:** `TfidfVectorizer(max_features=1000, ngram_range=(1,2))`.
- **Classifier:** `LogisticRegression(C=1.0, max_iter=200)`.
- **Critical Finding:** The transaction classifier is strictly a transaction categorization model. It is **not** a general document layout or token-level entity extractor. The codebase appropriately uses `DocumentClassifier` for document type/domain detection, and `DynamicExtractor` for entity and table extraction. The transaction classifier must remain restricted to transaction classification.

---

## 4. OCR AND EXTRACTION PIPELINE AUDIT

1. **Digital PDF vs. Scanned PDF:**
   - `DocumentProcessor.extract_text_from_pdf` uses `PdfReader` first to extract digital font streams. If extracted text is under 30 characters, it seamlessly renders PDF pages using `pypdfium2` at `scale=2.0` and runs RapidOCR on the rendered images.
2. **Local OCR Engine:**
   - RapidOCR with `onnxruntime` is loaded locally.
   - Text bounding boxes are sorted into natural reading order (`y`, `x`) with dynamic line clustering (`format_rapidocr_result`).
   - PyTesseract is available as an optional secondary fallback.
3. **Format Parsers:**
   - `SpreadsheetParser`: Safely parses `.csv`, `.tsv`, `.xlsx`, `.xls` via pandas/openpyxl, extracting multi-column tables and key-value fields.
   - `DocxParser`: Extracts paragraphs and structured docx tables via `python-docx`.
   - `TextParser`: Extracts structured `.txt` and arbitrary `.json` files.
   - `SqlParser`: Uses regex lexical parsing to extract `CREATE TABLE` and `INSERT INTO` statements into structured schemas and rows. **Never executes SQL**.
4. **Dynamic Entity Extractor:**
   - Discovers arbitrary `Key: Value` pairs.
   - Detects currency codes (`USD`, `EUR`, `GBP`, `CAD`, `AUD`, `INR`, etc.).
   - Computes tax, subtotal, and total consistency.
   - Preserves unknown labels without forcing them into rigid predefined schemas.

---

## 5. HARDCODED FIELD MAPPINGS & FABRICATION CHECK

1. **Missing Fields:**
   - In `backend/document_processing/dynamic_extractor.py`, missing values remain strictly `None` or are flagged as missing. They are **never** fabricated or substituted with zeros/empty strings.
2. **Confidence Scores:**
   - Dynamically discovered key-values have uncalibrated confidence (or conservative defaults like `0.85`), but OCR and regex checks do not invent fake 99.9% scores.
3. **Discrepancy Flags:**
   - If `subtotal + tax != total` beyond a $0.05 tolerance, a warning `Financial Discrepancy: Subtotal (...) + Tax (...) does not equal Total (...)` is appended to `warnings`. Conflicting values are preserved for human review rather than silently overwritten.
4. **FastAPI Mock Endpoint Check:**
   - In `backend/fastapi_backend/routers/invoices.py`, the Gemini OCR fallback schema had `confidence: float = 98.0` hardcoded. This will be replaced by the calibrated confidence from the core dynamic extraction contract.

---

## 6. SECURITY & VULNERABILITY AUDIT

| Vulnerability Category | Current State & Findings | Required Hardening for Finsight Core API |
|---|---|---|
| **Authentication & Access Control** | The Flask `/api/classify-document` endpoint is completely unauthenticated. Anyone with network access can post files. | Implement Bearer API Token & JWT authentication with document owner isolation. |
| **Path Traversal & Filenames** | `validate_file_security()` strips path traversal (`..`, `/`, `\`) and sanitizes filenames using regex `[^a-zA-Z0-9._-]`. | Maintain and enforce random UUID storage keys on disk / S3 / Supabase to eliminate collisions and traversal. |
| **Executable & File Header Spoofing** | Checks for `MZ` (Windows PE) and `\x7fELF`, plus PDF `%PDF` and ZIP `PK` headers. | Add strict magic-byte validation and enforce 20MB payload ceiling. |
| **SQL Execution** | `SqlParser` is strictly lexical regex and does not execute SQL against any database. | Maintain strict lexical-only parsing with timeouts. |
| **Exposed Secrets & CORS** | `CORS(app, origins=["*"])` in FastAPI; `.env.example` has placeholder keys. | Restrict CORS to authorized client domains. Do not expose private model weights, keys, or internal training code to external callers. |
| **Database RLS Policies** | `migration.sql` in `backend/supabase` currently contains `USING (true)` public policies for demo ease. | Design tenant-isolated RLS schemas with `owner_id = auth.uid()` for production isolation. |

---

## 7. MIGRATION PLAN: FINSIGHT AI CORE API

To eliminate service duplication while preserving 100% of the verified extraction capabilities:

1. **Unify on FastAPI as the Core API (`core_api`):**
   - Consolidate all document processing, OCR, classification, and dynamic extraction into a production-grade FastAPI application.
   - Keep Flask `/api/classify-document` routing intact as a backward-compatible adapter so no existing tests or clients break.
2. **Core API Architecture:**
   - `core_api/main.py`: Main FastAPI entrypoint with OpenAPI docs, CORS, rate limiting, and request tracing.
   - `core_api/v1/routers/`: Versioned endpoints (`/v1/health`, `/v1/documents`, `/v1/documents/{id}/extract`, `/v1/jobs/{id}`, `/v1/documents/{id}/results`, `/v1/documents/{id}/fields/{id}`, `/v1/documents/{id}/verify`, `/v1/models`).
   - `core_api/core/`: Security, auth tokens, rate limiter, config management.
   - `core_api/schemas/`: Strictly validated versioned Pydantic v2 contracts.
   - `core_api/services/`: Asynchronous job worker queue, storage provider, document processor adapter.
   - `core_api/db/`: SQLAlchemy & PostgreSQL / SQLite / Supabase compatible persistence for documents, jobs, fields, tables, and audit logs.
3. **Asynchronous Long-Running Processing:**
   - Large PDFs / multi-page documents are processed via background job execution, returning `202 Accepted` with a `job_id` and tracking status (`queued`, `processing`, `completed`, `failed`).
   - Synchronous extraction remains available for lightweight or instant single-document inspection.
4. **Separate Client / Demo Contract:**
   - The demo application (`finsight-ai-demo`) communicates exclusively through the `/v1` REST contract with API Key or JWT authentication. Model weights and extraction source code remain completely private on the server.
