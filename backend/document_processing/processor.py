import os
import io
import re
from PIL import Image, ImageDraw
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

ALLOWED_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg"}
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB limit

class SecurityValidationError(Exception):
    pass

class DocumentProcessor:
    def __init__(self, model_path=None, vectorizer_path=None):
        if model_path is None:
            model_path = os.getenv("MODEL_PATH", os.path.join("models", "production", "transaction_classifier.joblib"))
        if vectorizer_path is None:
            vectorizer_path = os.getenv("VECTORIZER_PATH", os.path.join("models", "production", "tfidf_vectorizer.joblib"))
            
        # Fallback search if path relative from root or backend
        if not os.path.exists(model_path):
            alt_path = os.path.join("models", "transaction_classifier.joblib")
            if os.path.exists(alt_path):
                model_path = alt_path

        if not os.path.exists(vectorizer_path):
            alt_vec = os.path.join("models", "tfidf_vectorizer.joblib")
            if os.path.exists(alt_vec):
                vectorizer_path = alt_vec
                
        if not os.path.exists(model_path) or not os.path.exists(vectorizer_path):
            raise FileNotFoundError("Production ML Model or Vectorizer file missing.")
            
        self.model = joblib.load(model_path)
        self.vectorizer = joblib.load(vectorizer_path)

    def validate_file_security(self, filename: str, file_bytes: bytes):
        # 1. File Size Check
        if len(file_bytes) > MAX_FILE_SIZE_BYTES:
            raise SecurityValidationError("File size exceeds maximum allowed limit of 10 MB.")
            
        if len(file_bytes) == 0:
            raise SecurityValidationError("Uploaded file is empty.")

        # 2. Extension Check
        ext = os.path.splitext(filename)[1].lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise SecurityValidationError(f"Invalid file extension '{ext}'. Allowed: PDF, PNG, JPG, JPEG.")

        # 3. Path Traversal & Filename Sanitization Check
        safe_filename = os.path.basename(filename)
        if re.search(r"[/\\]|\.\.", filename):
            raise SecurityValidationError("Malicious filename pattern or path traversal attempt detected.")

        # 4. MIME / Header Magic Byte Verification
        if ext == ".pdf" and not file_bytes.startswith(b"%PDF"):
            raise SecurityValidationError("File header does not match a valid PDF document.")
        elif ext in [".png", ".jpg", ".jpeg"]:
            try:
                img = Image.open(io.BytesIO(file_bytes))
                img.verify()
            except Exception:
                raise SecurityValidationError("Uploaded image is corrupted or contains invalid image data.")

        return safe_filename, ext

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
            try:
                text = pytesseract.image_to_string(img)
            except Exception:
                text = ""
        except Exception as e:
            print(f"Error processing image: {e}")
        return text.strip()

    def process_document(self, filename: str, file_bytes: bytes):
        try:
            safe_filename, ext = self.validate_file_security(filename, file_bytes)
        except SecurityValidationError as sve:
            return {
                "success": False,
                "error": str(sve)
            }

        extracted_text = ""

        if ext == ".pdf":
            extracted_text = self.extract_text_from_pdf(file_bytes)
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

        clean_text = " ".join(extracted_text.split())

        if not clean_text:
            return {
                "success": False,
                "error": "No readable text could be extracted from the document."
            }

        text_tfidf = self.vectorizer.transform([clean_text])
        predicted_category = self.model.predict(text_tfidf)[0]
        probabilities = self.model.predict_proba(text_tfidf)[0]
        confidence = float(max(probabilities))

        return {
            "success": True,
            "filename": safe_filename,
            "extracted_text": clean_text[:300] + ("..." if len(clean_text) > 300 else ""),
            "full_extracted_text": clean_text,
            "category": predicted_category,
            "confidence": round(confidence, 4)
        }
