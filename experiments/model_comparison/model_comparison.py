import os
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import MultinomialNB
from sklearn.svm import LinearSVC
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, confusion_matrix

def run_model_comparison():
    # Ensure experiments directory exists
    os.makedirs("experiments", exist_ok=True)
    
    # Load dataset
    dataset_path = os.path.join("data", "transaction_dataset.csv")
    if not os.path.exists(dataset_path):
        raise FileNotFoundError(f"Dataset not found at {dataset_path}. Please run train.py first.")
        
    df = pd.read_csv(dataset_path)
    print(f"Loaded prototype dataset with {len(df)} records.")
    
    # Split into train/test using exact same parameters (80/20, random_state=42, stratify=y)
    X = df["description"]
    y = df["category"]
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    
    # Vectorize text using exact same TF-IDF vectorizer configuration
    vectorizer = TfidfVectorizer(stop_words='english', lowercase=True, ngram_range=(1, 2))
    X_train_tfidf = vectorizer.fit_transform(X_train)
    X_test_tfidf = vectorizer.transform(X_test)
    
    # Define models to compare
    models = {
        "Logistic Regression": LogisticRegression(random_state=42, max_iter=1000),
        "Multinomial Naive Bayes": MultinomialNB(),
        "Linear SVM": LinearSVC(random_state=42, max_iter=1000)
    }
    
    results = []
    confusion_matrices = {}
    labels = sorted(y.unique())
    
    print("\n--- RUNNING MODEL COMPARISON EXPERIMENT ---")
    for name, clf in models.items():
        print(f"\nTraining {name}...")
        clf.fit(X_train_tfidf, y_train)
        y_pred = clf.predict(X_test_tfidf)
        
        acc = accuracy_score(y_test, y_pred)
        precision, recall, f1, _ = precision_recall_fscore_support(y_test, y_pred, average='weighted')
        cm = confusion_matrix(y_test, y_pred, labels=labels)
        
        results.append({
            "Model": name,
            "Accuracy": acc,
            "Precision": precision,
            "Recall": recall,
            "F1-Score": f1
        })
        confusion_matrices[name] = cm
        
        print(f"  Accuracy:  {acc * 100:.2f}% ({acc:.4f})")
        print(f"  Precision: {precision:.4f}")
        print(f"  Recall:    {recall:.4f}")
        print(f"  F1-Score:  {f1:.4f}")

    # Convert results to DataFrame
    results_df = pd.DataFrame(results)
    csv_path = os.path.join("experiments", "model_comparison_results.csv")
    results_df.to_csv(csv_path, index=False)
    print(f"\nSaved empirical comparison results to {csv_path}")
    
    # Generate Comparison Plot & Confusion Matrices Image
    sns.set_theme(style="whitegrid")
    fig, axes = plt.subplots(2, 2, figsize=(14, 12))
    
    # 1. Performance Metrics Bar Chart
    results_melted = pd.melt(results_df, id_vars=["Model"], var_name="Metric", value_name="Score")
    sns.barplot(ax=axes[0, 0], data=results_melted, x="Metric", y="Score", hue="Model", palette="viridis")
    axes[0, 0].set_title("Model Comparison across Metrics", fontsize=14, fontweight="bold")
    axes[0, 0].set_ylim(0, 1.05)
    axes[0, 0].legend(loc="lower right")
    for p in axes[0, 0].patches:
        height = p.get_height()
        if height > 0:
            axes[0, 0].annotate(f"{height:.2f}",
                                (p.get_x() + p.get_width() / 2., height),
                                ha='center', va='bottom', fontsize=9, xytext=(0, 3),
                                textcoords='offset points')
                                
    # 2. Confusion Matrices for each algorithm
    axes_cm = [axes[0, 1], axes[1, 0], axes[1, 1]]
    for idx, (name, cm) in enumerate(confusion_matrices.items()):
        ax = axes_cm[idx]
        sns.heatmap(cm, annot=True, fmt="d", cmap="Blues", xticklabels=labels, yticklabels=labels, ax=ax)
        ax.set_title(f"Confusion Matrix: {name}", fontsize=12, fontweight="bold")
        ax.set_xlabel("Predicted")
        ax.set_ylabel("Actual")
        ax.set_xticklabels(labels, rotation=35, ha="right", fontsize=9)
        ax.set_yticklabels(labels, rotation=0, fontsize=9)
        
    plt.tight_layout()
    plot_path = os.path.join("experiments", "model_comparison.png")
    plt.savefig(plot_path, dpi=300)
    plt.close()
    print(f"Saved comparative visual chart to {plot_path}")

if __name__ == "__main__":
    run_model_comparison()
