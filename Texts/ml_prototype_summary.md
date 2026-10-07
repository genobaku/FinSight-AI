# Finsight AI – ML Prototype Progress & Architecture Summary

## 📌 Project Milestones Completed

```text
                    FINSIGHT AI
                         │
                 ML PROTOTYPE
                         │
                         ▼
              Transaction Classification
                         │
              ┌──────────┴──────────┐
              │                     │
           Dataset              ML Models
              │                     │
       175 labeled rows             │
       7 categories                │
              │             ┌───────┼────────┐
              ▼             ▼       ▼        ▼
         80/20 split      LR      NB       SVM
                            │       │        │
                            ▼       ▼        ▼
                         77.14%   80%      80%
```

---

### 1. Prototype Dataset ✅
We built a prototype dataset containing **175 transaction descriptions** categorized across **7 core domains**:
- **Food**
- **Transport**
- **Shopping**
- **Bills**
- **Entertainment**
- **Healthcare**
- **Education**

**Examples**:
- `"Swiggy dinner"` → `Food`
- `"Uber ride"` → `Transport`
- `"Amazon headphones"` → `Shopping`

> ⚠️ *Note*: This is a custom prototype dataset designed for initial validation and proof-of-concept development, not a production benchmark.

---

### 2. Data Preprocessing & Stratified Splitting ✅
We created an **80/20 stratified train-test split**:
- **Training set**: ~140 samples
- **Testing set**: ~35 samples

Stratification ensures equal class representation in both sets, and test examples remain completely unseen during training.

---

### 3. Feature Extraction (TF-IDF) ✅
We implemented **TF-IDF (Term Frequency – Inverse Document Frequency)** vectorization with unigrams and bigrams (`ngram_range=(1, 2)`).

```text
"Uber ride to airport"  ──►  TF-IDF  ──►  [0.00, 0.24, 0.71, ...]
```

---

### 4. Baseline Classifier ✅
We trained a **Logistic Regression** baseline classifier.
- **Accuracy**: **77.14%**
- **Weighted F1-Score**: **76.43%**

---

### 5. Multi-Model Experiment & Benchmarking ✅
We trained two additional models under identical data splits and preprocessing conditions:

| Model | Accuracy | Weighted Precision | Weighted Recall | Weighted F1-Score |
|---|---:|---:|---:|---:|
| **Logistic Regression** (Baseline) | 77.14% | 81.98% | 77.14% | 76.43% |
| **Multinomial Naive Bayes** | **80.00%** | 85.24% | 80.00% | **79.75%** |
| **Linear SVM** | **80.00%** | **86.03%** | 80.00% | 79.18% |

**Generated Artifacts**:
- Empirical results exported to [`experiments/model_comparison_results.csv`](file:///d:/Programming/2026/Project/Finsight%20ai/experiments/model_comparison_results.csv)
- Comparative visualization chart & confusion matrices saved to [`experiments/model_comparison.png`](file:///d:/Programming/2026/Project/Finsight%20ai/experiments/model_comparison.png)

---

### 6. Real-Time Inference System ✅
Created [`predict.py`](file:///d:/Programming/2026/Project/Finsight%20ai/predict.py) for real-time model inference:
- `"Starbucks double espresso coffee"` → **Predicted: `Food`**
- `"Uber ride to downtown airport"` → **Predicted: `Transport`**

---

### 7. Model Serialization & Persistence ✅
Saved trained models using `joblib`:
- Model: [`models/transaction_classifier.joblib`](file:///d:/Programming/2026/Project/Finsight%20ai/models/transaction_classifier.joblib)
- Vectorizer: [`models/tfidf_vectorizer.joblib`](file:///d:/Programming/2026/Project/Finsight%20ai/models/tfidf_vectorizer.joblib)

---

### 8. Interactive Notebook & Documentation ✅
- **Interactive Walkthrough**: [`notebooks/finsight_ml_prototype.ipynb`](file:///d:/Programming/2026/Project/Finsight%20ai/notebooks/finsight_ml_prototype.ipynb)
- **Documentation**: [`README.md`](file:///d:/Programming/2026/Project/Finsight%20ai/README.md)

---

## 🗺️ Finsight AI System Architecture & Roadmap Status

```text
Finsight AI
│
├── Data ingestion                  ⏳
├── Document OCR                    ⏳
├── Document understanding          ⏳
├── Information extraction          ⏳
├── Domain classification           ⏳
│
├── ML experimentation              ✅ ← WE ARE HERE
│   ├── Dataset                     ✅
│   ├── Preprocessing               ✅
│   ├── Baseline model              ✅
│   ├── Model comparison            ✅
│   └── Evaluation                  ✅
│
├── Structured database             ⏳
├── User review/editing             ⏳
├── Analytics                       ⏳
├── AI insights                     ⏳
└── Reports/exports                 ⏳
```

---

## 🚀 Next Milestone: Document Classification

Moving beyond transaction categorization, the next core ML milestone for Finsight AI is **Document Type Classification**:

```text
invoice.pdf           ──►  ML Model  ──►  Financial
student_record.pdf    ──►  ML Model  ──►  Student
business_report.pdf   ──►  ML Model  ──►  Business
```
