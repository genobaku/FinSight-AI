# 💳 FinSight AI - Document Understanding & Financial Intelligence System

> **Disclaimer**: The dataset included in this project (`data/raw/transaction_dataset.csv`) is a **prototype dataset intended for initial validation and proof-of-concept development only**, not a production benchmark.

---

## 📌 Project Overview
**FinSight AI** is a unified document understanding and financial intelligence platform. It processes financial receipts and transaction documents (PDFs, PNGs, JPGs), extracts text via OCR & parsing pipelines, and classifies budget categories using machine learning.

---

## 🏗️ Reorganized Repository Structure

```
Finsight ai/
├── backend/
│   ├── app.py                         # Flask REST API endpoint (/api/classify-document)
│   ├── document_processing/
│   │   └── processor.py               # Document processing engine & security validator
│   └── fastapi_backend/               # FastAPI microservice & REST endpoints
├── frontend/
│   ├── index.html                     # Clean document upload interface
│   └── src/                           # React + TypeScript frontend application
├── models/
│   ├── production/                    # Verified production model artifacts (.joblib)
│   └── research/                      # Experimental model checkpoints
├── data/
│   ├── raw/                           # Raw prototype datasets (.csv)
│   └── processed/                     # Preprocessed feature vectors
├── experiments/
│   ├── model_comparison/              # Algorithm comparison experiment scripts
│   ├── notebooks/                     # Step-by-step Jupyter notebooks (.ipynb)
│   └── results/                       # Empirical benchmark results & charts (.csv, .png)
├── tests/
│   ├── test_document_processor.py     # Document processor unit & security tests
│   └── test_api.py                    # REST API integration tests
├── docs/
│   ├── architecture/                  # System architecture diagrams & design docs
│   ├── ml/                            # Machine learning pipeline documentation
│   └── security/                      # Security hardening & credential isolation policy
├── .env.example                       # Environment variable template with placeholders
├── .gitignore                         # Git ignore rules for secrets and build files
└── README.md                          # Project documentation
```

---

## 🧪 Machine Learning Benchmark Results

Evaluated on **175 prototype transaction records** across 7 categories using an **80/20 stratified train/test split**:

| Algorithm | Accuracy | Weighted Precision | Weighted Recall | Weighted F1-Score | Status |
|---|---|---|---|---|---|
| **Logistic Regression** | **77.14%** | `0.8198` | `0.7714` | `0.7643` | Baseline |
| **Multinomial Naive Bayes** | **80.00%** | `0.8524` | `0.8000` | **`0.7975`** | **Best F1** |
| **Linear SVM** | **80.00%** | **`0.8603`** | `0.8000` | `79.18%` | Top Precision |

---

## ⚡ How to Run Locally

### 1. Install Dependencies
```bash
pip install pandas scikit-learn joblib matplotlib seaborn pypdf pytesseract pillow flask flask-cors
```

### 2. Run Automated Test Suite
```bash
python -m unittest tests/test_document_processor.py
```

### 3. Start Document Classifier Backend Service
```bash
python -m backend.app
```
*Runs on `http://localhost:5000`.*

### 4. Open Document Upload Frontend
Open [`frontend/index.html`](file:///d:/Programming/2026/Project/Finsight%20ai/frontend/index.html) in any web browser to test drag-and-drop receipt classification.

---

## ⚠️ Scope & Limitation Statement

> **Scope Notice**: The current model was trained on text-based transaction descriptions (e.g., *"Starbucks coffee"*, *"Uber ride to airport"*), **not a large document-image or computer-vision dataset**.
> 
> The document upload pipeline demonstrates:
> `DOCUMENT ➔ TEXT EXTRACTION ➔ TRANSACTION CATEGORY CLASSIFICATION`
> 
> It validates full-stack software architecture integration without claiming full multi-modal document layout understanding.
