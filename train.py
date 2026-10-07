import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, classification_report
import joblib

# Set random seed for reproducibility
np.random.seed(42)

# Define sample transaction descriptions per category
data_samples = {
    "Food": [
        "Starbucks coffee and bagel", "McDonalds burger meal", "Dominos pizza delivery",
        "Whole Foods grocery shopping", "Subway lunch combo", "Chipotle burrito bowl",
        "Dunkin Donuts morning coffee", "Taco Bell dinner", "Trader Joes organic vegetables",
        "Local supermarket snacks", "KFC fried chicken box", "Burger King meal deal",
        "Panera Bread soup and salad", "Pizza Hut pepperoni pizza", "Safeway food market",
        "Sushi restaurant dinner", "Bakery fresh bread", "Food truck lunch", "Ice cream parlor",
        "Thai restaurant takeaway", "Italian bistro dinner", "Cafe espresso and muffin",
        "Supermarket fruits and vegetables", "Ramen shop lunch", "Diner breakfast combo"
    ],
    "Transport": [
        "Uber ride to downtown office", "Lyft fare home from airport", "Shell gas station fuel filling",
        "Metro train card recharge", "City bus fare ticket", "Chevron petrol station fill up",
        "Parking garage fee downtown", "Highway toll plaza payment", "Car service station maintenance",
        "Taxi ride to station", "BP gas station station fill", "Electric vehicle charging station",
        "Train ticket intercity express", "Subway fare monthly pass", "Airport shuttle service",
        "Parking meter payment", "Car wash and valet service", "Exxon Mobil gas station",
        "Bike rental hourly pass", "Ferry boat passenger ticket", "Auto repair oil change",
        "Uber Eats driver tip", "Public transport bus pass", "Car insurance premium payment",
        "Speedway gas station refill"
    ],
    "Shopping": [
        "Amazon online purchase electronics", "Target department store clothes", "Walmart household items",
        "Nike store running shoes", "Zara apparel and jacket", "H&M fashion clothes",
        "Best Buy laptop accessory", "Apple Store iPad case", "IKEA furniture assembly items",
        "Sephora cosmetics and skincare", "Nordstrom designer shoes", "eBay online marketplace order",
        "Uniqlo casual wear t-shirts", "Foot Locker athletic shoes", "Home Depot hardware tools",
        "Lululemon workout apparel", "Barnes Noble books purchase", "Etsy handmade craft gift",
        "Gap store denim jeans", "Macy's department store sale", "Adidas sports shoes",
        "TJ Maxx discount clothing", "Micro Center computer parts", "Decathlon sports gear",
        "Urban Outfitters graphic tee"
    ],
    "Bills": [
        "Electricity bill monthly payment", "City water utility bill", "Natural gas heating bill",
        "Comcast internet bill subscription", "Verizon mobile phone bill", "AT&T wireless service bill",
        "Trash collection municipal service", "Apartment monthly rent payment", "Home insurance policy payment",
        "Property tax installment payment", "Sewer utility bill payment", "Solar panel monthly subscription",
        "Spectrum cable TV internet bill", "T-Mobile cell phone bill", "HOA monthly maintenance fee",
        "Mortgage interest installment", "Security system monthly subscription", "Cloud storage monthly plan",
        "Landline telephone service bill", "Health insurance monthly premium", "Dental insurance bill",
        "District heating utility bill", "Utilities electric and water combo", "Mobile data recharge plan",
        "Home broadband internet bill"
    ],
    "Entertainment": [
        "Netflix monthly movie subscription", "Spotify premium music streaming", "AMC Cinema movie tickets",
        "PlayStation Network game download", "Steam store PC game purchase", "YouTube Premium subscription",
        "Disney Plus streaming service", "Concert ticket venue entry", "Bowling alley game night",
        "Hulu streaming subscription", "Audible audiobook subscription", "Nintendo eShop game sale",
        "Xbox Game Pass monthly sub", "Theme park admission ticket", "Music festival ticket pass",
        "Live theater show ticket", "Standup comedy club entry", "Museum entrance ticket fee",
        "Escape room booking ticket", "Twitch channel subscription", "Apple Music monthly plan",
        "VR arcade game session", "Board game cafe bill", "Miniature golf entry fee",
        "IMAX movie tickets pop corn"
    ],
    "Healthcare": [
        "CVS Pharmacy prescription medicine", "Walgreens drug store health check", "Doctor consultation clinic fee",
        "Dental checkup and cleaning", "Eye clinic optometrist visit", "Hospital outpatient consultation",
        "Physical therapy rehab clinic", "Laboratory blood test lab fee", "Urgent care clinic visit",
        "Vision center contact lenses", "Dermatology clinic appointment", "Pharmacy vitamin supplements",
        "Chiropractic adjustment fee", "Orthopedic clinic consultation", "Mental health therapy session",
        "Diagnostic radiology X-ray scan", "Pediatric clinic doctor fee", "Prescription eyeglasses store",
        "First aid kit emergency supplies", "Cardiology specialist checkup", "Medical lab test report",
        "Vaccination clinic immunization", "Surgical clinic consultation", "Hearing aid battery replacement",
        "Wellness clinic wellness check"
    ],
    "Education": [
        "University semester tuition fee", "Coursera online course certificate", "Udemy programming course tutorial",
        "Campus bookstore textbooks purchase", "Student loan monthly payment", "School tuition fee installment",
        "LinkedIn Learning annual subscription", "Coding bootcamp tuition installment", "Language school tuition fee",
        "Academic journal subscription", "College exam fee registration", "Tutoring center monthly fee",
        "STEM workshop registration fee", "GRE test exam registration fee", "IELTS language test fee",
        "Online master degree tuition", "Educational software license", "Piano lessons monthly fee",
        "Art class materials and tuition", "Science lab lab manual textbook", "Library late fee fine",
        "Research paper publishing fee", "High school registration fee", "Certificate exam voucher",
        "Training seminar registration fee"
    ]
}

def generate_dataset():
    records = []
    for category, descriptions in data_samples.items():
        for desc in descriptions:
            records.append({"description": desc, "category": category})
    df = pd.DataFrame(records)
    # Shuffle dataset
    df = df.sample(frac=1, random_state=42).reset_index(drop=True)
    return df

def train_and_evaluate():
    print("Generating dataset...")
    df = generate_dataset()
    os.makedirs("data", exist_ok=True)
    dataset_path = os.path.join("data", "transaction_dataset.csv")
    df.to_csv(dataset_path, index=False)
    print(f"Dataset saved to {dataset_path}. Total records: {len(df)}")
    
    print("\nSplitting dataset into train and test sets (80/20)...")
    X = df["description"]
    y = df["category"]
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    print(f"Training samples: {len(X_train)}, Testing samples: {len(X_test)}")
    
    print("\nPreprocessing text with TF-IDF Vectorizer...")
    vectorizer = TfidfVectorizer(stop_words='english', lowercase=True, ngram_range=(1, 2))
    X_train_tfidf = vectorizer.fit_transform(X_train)
    X_test_tfidf = vectorizer.transform(X_test)
    
    print("\nTraining Logistic Regression model...")
    model = LogisticRegression(random_state=42, max_iter=1000)
    model.fit(X_train_tfidf, y_train)
    
    print("\nEvaluating model performance on test set...")
    y_pred = model.predict(X_test_tfidf)
    
    acc = accuracy_score(y_test, y_pred)
    precision, recall, f1, _ = precision_recall_fscore_support(y_test, y_pred, average='weighted')
    
    print(f"\n--- EVALUATION METRICS ---")
    print(f"Accuracy:  {acc * 100:.2f}% ({acc:.4f})")
    print(f"Precision: {precision:.4f}")
    print(f"Recall:    {recall:.4f}")
    print(f"F1-Score:  {f1:.4f}")
    
    print("\n--- CLASSIFICATION REPORT ---")
    print(classification_report(y_test, y_pred))
    
    # Save model artifacts
    os.makedirs("models", exist_ok=True)
    model_path = os.path.join("models", "transaction_classifier.joblib")
    vectorizer_path = os.path.join("models", "tfidf_vectorizer.joblib")
    
    joblib.dump(model, model_path)
    joblib.dump(vectorizer, vectorizer_path)
    print(f"Model saved to {model_path}")
    print(f"Vectorizer saved to {vectorizer_path}")

if __name__ == "__main__":
    train_and_evaluate()
