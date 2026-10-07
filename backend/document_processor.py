import os
import io
import re
from PIL import Image, ImageDraw, ImageFont
from pypdf import PdfReader
import pytesseract
import joblib

# Optional: Set Tesseract cmd path if installed in common Windows paths
possible_tesseract_paths = [
    r"C:\Program Files\Tesseract-OCR\tesseract.exe",
    r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
    os.path.expanduser(r"~\AppData\Local\Programs\Tesseract-OCR\tesseract.exe")
]
for p in possible_tesseract_paths:
    if os.path.exists(p):
        pytesseract.pytesseract.tesseract_cmd = p
        break

class DocumentProcessor:
    def __init__(self, model_path=None, vectorizer_path=None):
        if model_path is None:
            model_path = os.path.join("models", "transaction_classifier.joblib")
        if vectorizer_path is None:
            vectorizer_path = os.path.join("models", "tfidf_vectorizer.joblib")
            
        if not os.path.exists(model_path) or not os.path.exists(vectorizer_path):
            raise FileNotFoundError("Model or Vectorizer file missing. Please ensure train.py was run.")
            
        self.model = joblib.load(model_path)
        self.vectorizer = joblib.load(vectorizer_path)

    def extract_text_from_pdf(self, file_bytes: bytes) -> str:
        text = ""
        try:
            pdf_file = io.BytesIO(file_bytes)
            reader = PdfReader(pdf_file)
            for page in reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
        except Exception as e:
            print(f"Error reading PDF text: {e}")
        return text.strip()

    def extract_text_from_image(self, file_bytes: bytes) -> str:
        text = ""
        try:
            img = Image.open(io.BytesIO(file_bytes))
            # Try OCR if Tesseract is available
            try:
                text = pytesseract.image_to_string(img)
            except Exception:
                # Fallback if tesseract binary is not installed: Pillow metadata or OCR unavailable notice
                text = ""
        except Exception as e:
            print(f"Error processing image: {e}")
        return text.strip()

    def process_document(self, filename: str, file_bytes: bytes):
        ext = os.path.splitext(filename)[1].lower()
        extracted_text = ""

        if ext == ".pdf":
            extracted_text = self.extract_text_from_pdf(file_bytes)
            # If direct PDF text is empty, try extracting images from PDF and running OCR if available
            if not extracted_text:
                try:
                    pdf_file = io.BytesIO(file_bytes)
                    reader = PdfReader(pdf_file)
                    for page in reader.pages:
                        for count, image_file_object in enumerate(page.images):
                            img_text = self.extract_text_from_image(image_file_object.data)
                            if img_text:
                                extracted_text += img_text + "\n"
                except Exception:
                    pass

        elif ext in [".png", ".jpg", ".jpeg"]:
            extracted_text = self.extract_text_from_image(file_bytes)
        else:
            return {
                "success": False,
                "error": f"Unsupported file type '{ext}'. Allowed extensions: .pdf, .png, .jpg, .jpeg"
            }

        # Clean up whitespace
        clean_text = " ".join(extracted_text.split())

        if not clean_text:
            return {
                "success": False,
                "error": "No text could be extracted from the document. Please ensure the document contains readable text."
            }

        # Predict using trained pipeline
        text_tfidf = self.vectorizer.transform([clean_text])
        predicted_category = self.model.predict(text_tfidf)[0]
        probabilities = self.model.predict_proba(text_tfidf)[0]
        confidence = float(max(probabilities))

        return {
            "success": True,
            "filename": filename,
            "extracted_text": clean_text[:300] + ("..." if len(clean_text) > 300 else ""),
            "full_extracted_text": clean_text,
            "category": predicted_category,
            "confidence": round(confidence, 4)
        }
