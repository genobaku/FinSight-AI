# 💳 FinSight AI - AI-First Financial Data Intelligence Platform

> **Team Hydra** | Project Portfolio & Architecture Documentation

---

## 👥 Team Hydra & Project Attribution

| Student Name | Roll No. | Sec | Class Roll | Primary Role & Contributions |
| :--- | :--- | :---: | :---: | :--- |
| **Anu Gaur** *(Team Leader)* | **12584200038** | **A** | **10** | **Project Lead & AI/ML Systems Architect**<br>• Lead architectural design and machine learning pipeline implementation.<br>• Designed the ML OCR extraction engine, TF-IDF vectorizer, Naive Bayes classifier, and backend Flask APIs.<br>• Architected hybrid frontend/backend data contracts, Supabase PostgreSQL schema, and cloud deployment pipelines. |
| **Anubhav Dubey** | **12584200039** | **A** | **11** | **Backend Developer & Database Engineer** |
| **Bhumika Goyal** | **12584200056** | **A** | **17** | **Frontend Developer & QA Bug Tester**<br>• Developed core React presentational views, dark/light theme switching, and responsive layouts.<br>• Performed cross-browser testing, UI verification, and user workflow regression testing. |
| **Shradha Sharma** | **12584200181** | **A** | **57** | **Documentation & UI Design Specialist** |
| **Vanshika Sengar** | **12584200204** | **A** | **69** | **Data Analyst & Testing Engineer** |

---

## 📌 Executive Summary

**FinSight AI** is a unified document understanding and financial intelligence platform designed to convert unstructured financial receipts, invoices, and transaction documents (PDFs, PNGs, JPGs) into structured, actionable enterprise data. 

Rather than relying on static, generic SaaS invoicing templates, FinSight AI leverages machine learning classification, automated OCR text extraction, dynamic P&L calculation engines, and real-time database synchronization.

---

## 🚀 Key Features & Capabilities

1. **OCR Document Classification & Machine Learning Pipeline**:
   - Accepts receipt and invoice uploads (`.pdf`, `.png`, `.jpg`).
   - Validates file security (magic-byte signatures, path traversal protection, 10MB upload limits).
   - Extracts text using PyTesseract & PyPDF, followed by TF-IDF vectorization and Multinomial Naive Bayes classification into 7 budget categories.
2. **Production-Quality Dark & Light Theme System**:
   - Complete semantic token system (`--background`, `--surface`, `--card`, `--border`, `--muted`, `--primary`, etc.).
   - Dark mode features a deep navy AI aesthetic; Light mode features a clean, high-contrast finance interface.
   - Theme choice persists across sessions via `localStorage`.
3. **Hybrid Frontend Architecture (JSX + TypeScript)**:
   - **React UI Layer (`.jsx`)**: Presentational views, modals, forms, and pages converted to JSX so frontend team members can develop UI without TypeScript friction.
   - **Core Business & Data Layer (`.ts`)**: Database models, API contracts, Supabase client services, and analytics calculation engines preserved in strict TypeScript for type safety.
4. **Real Data Analytics Engine**:
   - Zero hardcoded mock numbers in production analytics views.
   - Dynamic real-time calculation of Gross Revenue, Operating Expenses, Net Profit, and cash flow trends calculated directly from real database records.
5. **Supabase & Cloudinary Cloud Integration**:
   - Integrated PostgreSQL database persistence via Supabase.
   - Cloudinary CDN integration for receipt document image storage and previewing.

---

## 🏗️ Repository Directory Structure

```
Finsight ai/
├── backend/
│   ├── app.py                         # Flask REST API server (/api/classify-document)
│   ├── document_processing/
│   │   └── processor.py               # Document processing engine & security validator
│   └── fastapi_backend/               # FastAPI microservice & REST endpoints
├── frontend/
│   ├── index.html                     # Application HTML root
│   └── src/                           # React Frontend Application
│       ├── components/                # React UI Components (.jsx)
│       │   ├── auth/                  # Login & Signup pages (.jsx)
│       │   ├── common/                # Shared UI controls (Badge, StatCard, Modal) (.jsx)
│       │   ├── dashboard/             # Main Financial Overview Dashboard (.jsx)
│       │   ├── invoices/              # Invoice list, creation modal, preview modal (.jsx)
│       │   ├── landing/               # Public AI-First Landing Page (.jsx)
│       │   ├── layout/                # Sidebar, Navbar, Global Search Modal (.jsx)
│       │   └── views/                 # Analytics, Copilot, Receipts, Customers, Vendors (.jsx)
│       ├── lib/                       # Core Services & Analytics Engine (.ts)
│       │   ├── analyticsEngine.ts     # P&L and Cash Flow mathematical engine (.ts)
│       │   ├── supabaseService.ts     # Supabase CRUD data layer (.ts)
│       │   ├── supabase.ts            # Supabase connection setup (.ts)
│       │   └── cloudinary.ts          # Cloudinary storage helper (.ts)
│       ├── data/                      # Initial seed datasets (.ts)
│       ├── types.ts                   # Core domain TypeScript interfaces (.ts)
│       └── App.jsx                    # Primary application router & state (.jsx)
├── models/
│   ├── production/                    # Production ML model artifacts (.joblib)
│   └── research/                      # Experimental model checkpoints
├── data/
│   ├── raw/                           # Prototype transaction dataset (.csv)
│   └── processed/                     # Preprocessed feature vectors
├── experiments/
│   ├── model_comparison/              # ML benchmark comparison scripts
│   ├── notebooks/                     # Jupyter exploration notebooks (.ipynb)
│   └── results/                       # Accuracy benchmarks & confusion matrices (.png)
├── tests/
│   ├── test_document_processor.py     # Document processor unit tests
│   └── test_api.py                    # REST API integration tests
├── docs/
│   ├── architecture/                  # Architecture diagrams & design docs
│   ├── session_changes_and_audit.md   # Comprehensive development session log
│   └── How_to_run                     # Step-by-step local setup guide
├── vercel.json                        # Production deployment configuration
└── README.md                          # Main project documentation
```

---

## 🧪 Machine Learning Benchmark Results

Evaluated on **175 transaction records** across 7 categories using an **80/20 stratified train/test split**:

| Algorithm | Accuracy | Weighted Precision | Weighted Recall | Weighted F1-Score | Status |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Logistic Regression** | **77.14%** | `0.8198` | `0.7714` | `0.7643` | Baseline |
| **Multinomial Naive Bayes** | **80.00%** | `0.8524` | `0.8000` | **`0.7975`** | **Production Selected (Best F1)** |
| **Linear SVM** | **80.00%** | **`0.8603`** | `0.8000` | `0.7918` | Top Precision |

---

## ⚡ How to Run Locally

### 1. Install Backend Dependencies
```bash
pip install pandas scikit-learn joblib matplotlib seaborn pypdf pytesseract pillow flask flask-cors
```

### 2. Run Python ML Backend
```bash
python -m backend.app
```
*Runs on `http://localhost:5000`.*

### 3. Install & Start React Frontend
```bash
cd frontend
npm install
npm run dev
```
*Runs on `http://localhost:3000`.*

### 4. Build Production Bundle
```bash
cd frontend
npm run build
```

---

## 📜 Complete Summary of Session Changes

1. **Theme System Overhaul**:
   - Created a centralized CSS design token architecture (`index.css`) for both Light mode and Dark mode.
   - Converted all components, tables, modals, cards, badges, and Recharts graph tools to respond dynamically to global theme switching.
2. **Hybrid JSX Conversion**:
   - Converted 23 presentational UI component files from `.tsx` to `.jsx` to streamline frontend development for JavaScript/React developers.
   - Preserved type safety in business services (`analyticsEngine.ts`, `supabaseService.ts`, `types.ts`).
3. **Public Landing Page & Logout Flow**:
   - Configured logout action to clear active session state and redirect visitors directly to the public Landing Page.
   - Added author attribution and AI pipeline walkthrough.
4. **Production Build & Vercel Fixes**:
   - Resolved module resolution issues and configured Vercel deployment scripts to build the hybrid JSX/TS bundle cleanly.
