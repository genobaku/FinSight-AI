# 🧠 FinSight AI Machine Learning Pipeline & Benchmark

## 📌 ML Task Overview
The current Machine Learning module performs **Transaction Category Classification** from extracted document text strings (e.g., `"Starbucks iced mocha coffee"`, `"Uber ride to downtown airport"`).

---

## 📊 Empirical Model Benchmark Results

Experiment conducted on **175 prototype transaction records** across 7 categories using an **80/20 stratified train/test split** (`random_state=42`) and **TF-IDF vectorization** (`ngram_range=(1, 2)`):

| Algorithm | Accuracy | Weighted Precision | Weighted Recall | Weighted F1-Score | Status |
|---|---|---|---|---|---|
| **Logistic Regression** | **77.14%** | `0.8198` | `0.7714` | `0.7643` | Baseline |
| **Multinomial Naive Bayes** | **80.00%** | `0.8524` | `0.8000` | **`0.7975`** | **Best F1** |
| **Linear SVM** | **80.00%** | **`0.8603`** | `0.8000` | `0.7918` | Top Precision |

---

## ⚠️ Scope & Limitation Statement
- **Prototype Dataset Notice**: The current model was trained on a 175-sample custom prototype transaction dataset for initial proof-of-concept validation, not a production benchmark.
- **Pipeline Scope**: The pipeline demonstrates `DOCUMENT ➔ TEXT EXTRACTION ➔ ML TRANSACTION CATEGORY CLASSIFICATION`. It does not claim full computer-vision document layout understanding.
