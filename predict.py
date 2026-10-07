import os
import joblib

def predict_transaction(description: str):
    model_path = os.path.join("models", "transaction_classifier.joblib")
    vectorizer_path = os.path.join("models", "tfidf_vectorizer.joblib")
    
    if not os.path.exists(model_path) or not os.path.exists(vectorizer_path):
        print("Model or Vectorizer file not found! Please run train.py first.")
        return
    
    # Load vectorizer and model
    vectorizer = joblib.load(vectorizer_path)
    model = joblib.load(model_path)
    
    # Preprocess and vectorise input
    desc_tfidf = vectorizer.transform([description])
    
    # Predict category and confidence probability
    predicted_category = model.predict(desc_tfidf)[0]
    probabilities = model.predict_proba(desc_tfidf)[0]
    confidence = max(probabilities) * 100
    
    print(f"\nTransaction: '{description}'")
    print(f"Predicted Category: {predicted_category}")
    print(f"Confidence Score:   {confidence:.2f}%\n")
    
    # Show breakdown of probabilities per category
    print("Class Probabilities Breakdown:")
    for cat, prob in sorted(zip(model.classes_, probabilities), key=lambda x: x[1], reverse=True):
        print(f"  - {cat:<15}: {prob * 100:6.2f}%")
        
    return predicted_category

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        input_desc = " ".join(sys.argv[1:])
    else:
        # Prompt for interactive input or use sample
        input_desc = input("Enter a transaction description (or press Enter for default 'Starbucks double espresso'): ")
        if not input_desc.strip():
            input_desc = "Starbucks double espresso"
            
    predict_transaction(input_desc)
