# 🏗️ FinSight AI System Architecture

## Overview
FinSight AI is an end-to-end intelligent document understanding and financial intelligence platform designed for business receipt, invoice, and expense management.

---

## 🏛️ System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Web Frontend (React / Vite)                    │
│   Dashboard │ Receipts Scanner │ Invoices │ Expenses │ AI Copilot UI   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                  ┌─────────────────┴─────────────────┐
                  │                                   │
                  ▼                                   ▼
┌───────────────────────────────────┐    ┌──────────────────────────────────┐
│  Express API & Vite Middleware    │    ┌──► Document Classifier Service  │
│  (Port 3000 / Node.js & TypeScript)│    │   (Port 5000 / Python Flask)     │
└─────────────────┬─────────────────┘    │  - PDF Text Parsing (pypdf)      │
                  │                      │  - Image OCR (pytesseract)      │
                  ├──────────────────────┘  - TF-IDF + Classifier Pipeline│
                  │                         └──────────────────────────────────┘
                  ▼
┌───────────────────────────────────┐    ┌──────────────────────────────────┐
│  FastAPI Backend (Port 8000)      │    │  Cloud Infrastructure            │
│  - RESTful Business Resources     │    │  - Supabase PostgreSQL Database │
│  - Gemini AI Vision Extraction    ├────┼──► Cloudinary Asset Storage      │
│  - JWT & Security Middleware      │    │  - Google Gemini 3.6 Flash API   │
└───────────────────────────────────┘    └──────────────────────────────────┘
```

---

## 🔒 Security Architecture

### 1. Secret & Key Isolation
- All sensitive API keys (`GEMINI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `CLOUDINARY_API_SECRET`, `JWT_SECRET`) are stored strictly in server-side environment variables (`.env`).
- Client-side code accesses **only** non-sensitive public keys prefixed with `VITE_` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).

### 2. Document Upload Hardening
- **File Extension & MIME Type Check**: Uploads strictly limited to `.pdf`, `.png`, `.jpg`, `.jpeg`.
- **Magic Byte Inspection**: Verifies binary headers (`%PDF`, PNG/JPEG signatures).
- **Path Traversal Protection**: Sanitizes filenames using `os.path.basename` and strips directory separators (`/`, `\`, `..`).
- **File Size Caps**: 10 MB strict file size limit enforced prior to memory buffer allocation.

### 3. Database Security
- Supabase PostgreSQL utilizes Row Level Security (RLS) policies to isolate user tenant data.
- Service role keys are restricted to backend microservices.
