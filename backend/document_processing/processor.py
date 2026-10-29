import os
import io
import re
from typing import Optional, Tuple, List, Dict, Any
from PIL import Image, ImageOps
import numpy as np
from pypdf import PdfReader
import joblib

# Determine project root dynamically
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(os.path.dirname(CURRENT_DIR))

# Import dynamic intelligence models & parsers
from backend.document_processing.models import (
    DynamicDocumentResponse, ExtractedField, ExtractedTable, SourceEvidence
)
from backend.document_processing.classifier import DocumentClassifier
from backend.document_processing.dynamic_extractor import DynamicExtractor
from backend.document_processing.parsers.spreadsheet_parser import SpreadsheetParser
from backend.document_processing.parsers.docx_parser import DocxParser
from backend.document_processing.parsers.text_parser import TextParser
from backend.document_processing.parsers.sql_parser import SqlParser

# Import legacy invoice extractor for fallback
try:
    from backend.document_processing.extractor import extract_structured_invoice_data
except ImportError:
    from document_processing.extractor import extract_structured_invoice_data

ALLOWED_EXTENSIONS = {
    ".pdf", ".png", ".jpg", ".jpeg", ".webp",
    ".docx", ".csv", ".tsv", ".xlsx", ".xls",
    ".txt", ".json", ".sql"
}
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB limit

class SecurityValidationError(Exception):
    pass

class DocumentProcessor:
    def __init__(self, model_path=None, vectorizer_path=None):
        # 1. Resolve ML Model Path
        if model_path is None:
            model_path = os.getenv("MODEL_PATH", os.path.join(PROJECT_ROOT, "models", "production", "transaction_classifier.joblib"))
            
        candidate_model_paths = [
            model_path,
            os.path.join(PROJECT_ROOT, model_path),
            os.path.join(PROJECT_ROOT, "models", "production", "transaction_classifier.joblib"),
            os.path.join(PROJECT_ROOT, "models", "transaction_classifier.joblib"),
            os.path.join("models", "production", "transaction_classifier.joblib"),
            os.path.join("models", "transaction_classifier.joblib")
        ]
        resolved_model_path = None
        for p in candidate_model_paths:
            if p and os.path.exists(p):
                resolved_model_path = p
                break

        # 2. Resolve TF-IDF Vectorizer Path
        if vectorizer_path is None:
            vectorizer_path = os.getenv("VECTORIZER_PATH", os.path.join(PROJECT_ROOT, "models", "production", "tfidf_vectorizer.joblib"))
            
        candidate_vec_paths = [
            vectorizer_path,
            os.path.join(PROJECT_ROOT, vectorizer_path),
            os.path.join(PROJECT_ROOT, "models", "production", "tfidf_vectorizer.joblib"),
            os.path.join(PROJECT_ROOT, "models", "tfidf_vectorizer.joblib"),
            os.path.join("models", "production", "tfidf_vectorizer.joblib"),
            os.path.join("models", "tfidf_vectorizer.joblib")
        ]
        resolved_vec_path = None
        for p in candidate_vec_paths:
            if p and os.path.exists(p):
                resolved_vec_path = p
                break

        if not resolved_model_path or not resolved_vec_path:
            raise FileNotFoundError(
                f"Production ML Model or Vectorizer file missing. Checked model: {resolved_model_path}, vec: {resolved_vec_path}"
            )

        self.model = joblib.load(resolved_model_path)
        self.vectorizer = joblib.load(resolved_vec_path)

        # 3. Initialize Local OCR Engine (RapidOCR with OnnxRuntime)
        self.rapid_ocr = None
        try:
            from rapidocr_onnxruntime import RapidOCR
            self.rapid_ocr = RapidOCR()
        except Exception as e:
            print(f"Notice: RapidOCR initialization note: {e}")

        # 4. Check PyTesseract Availability
        self.has_pytesseract = False
        try:
            import pytesseract
            possible_tesseract_paths = [
                r"C:\Program Files\Tesseract-OCR\tesseract.exe",
                r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
                os.path.expanduser(r"~\AppData\Local\Programs\Tesseract-OCR\tesseract.exe")
            ]
            for p in possible_tesseract_paths:
                if os.path.exists(p):
                    pytesseract.pytesseract.tesseract_cmd = p
                    break
            pytesseract.get_tesseract_version()
            self.has_pytesseract = True
            self.pytesseract = pytesseract
        except Exception:
            self.has_pytesseract = False
            self.pytesseract = None

    def validate_file_security(self, filename: str, file_bytes: bytes) -> Tuple[str, str]:
        """Validate file size, extension, safety, and header bytes."""
        if len(file_bytes) > MAX_FILE_SIZE_BYTES:
            raise SecurityValidationError("File size exceeds maximum allowed limit of 10 MB.")

        if len(file_bytes) == 0:
            raise SecurityValidationError("Uploaded file is empty.")

        ext = os.path.splitext(filename)[1].lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise SecurityValidationError(f"Unsupported file type '{ext}'. Allowed extensions: {', '.join(sorted(ALLOWED_EXTENSIONS))}")

        # Path Traversal & Filename Sanitization Check
        safe_filename = os.path.basename(filename)
        safe_filename = re.sub(r'[^a-zA-Z0-9._-]', '_', safe_filename)
        if re.search(r"[/\\]|\.\.", filename):
            raise SecurityValidationError("Malicious filename pattern or path traversal attempt detected.")

        # Reject binary executables (e.g. Windows PE 'MZ' header)
        if file_bytes.startswith(b"MZ") or file_bytes.startswith(b"\x7fELF"):
            raise SecurityValidationError("Executable binary upload detected and blocked.")

        # MIME / Header Magic Byte Verification
        if ext == ".pdf":
            if not file_bytes.startswith(b"%PDF"):
                raise SecurityValidationError("File header does not match a valid PDF document.")
        elif ext in [".png", ".jpg", ".jpeg", ".webp"]:
            try:
                img = Image.open(io.BytesIO(file_bytes))
                img.verify()
                if ext == ".png" and img.format != "PNG":
                    raise SecurityValidationError("File content does not match PNG format.")
                elif ext in [".jpg", ".jpeg"] and img.format != "JPEG":
                    raise SecurityValidationError("File content does not match JPEG format.")
            except Exception as e:
                raise SecurityValidationError(f"Uploaded image is corrupted or contains invalid image data: {str(e)}")
        elif ext in [".docx", ".xlsx"]:
            # Word and Excel files are ZIP archives starting with PK
            if not (file_bytes.startswith(b"PK\x03\x04") or file_bytes.startswith(b"PK\x05\x06")):
                raise SecurityValidationError(f"File header does not match a valid {ext.upper()} document.")

        return safe_filename, ext

    def format_rapidocr_result(self, ocr_result) -> str:
        """Format RapidOCR boxes into naturally ordered, readable text lines with spacing."""
        if not ocr_result:
            return ""

        boxes_with_text = []
        for item in ocr_result:
            if not item or len(item) < 3:
                continue
            box, text, score = item[0], item[1], item[2]
            if text and text.strip():
                try:
                    y_top = float(box[0][1])
                    x_left = float(box[0][0])
                    y_bottom = float(box[2][1])
                    height = max(10.0, y_bottom - y_top)
                    boxes_with_text.append({
                        "y": y_top,
                        "x": x_left,
                        "h": height,
                        "text": text.strip()
                    })
                except Exception:
                    continue

        if not boxes_with_text:
            return ""

        boxes_with_text.sort(key=lambda b: (b["y"], b["x"]))

        lines = []
        current_line = [boxes_with_text[0]]
        for b in boxes_with_text[1:]:
            prev = current_line[-1]
            threshold = max(prev["h"], b["h"]) * 0.6
            if abs(b["y"] - prev["y"]) < threshold:
                current_line.append(b)
            else:
                current_line.sort(key=lambda item: item["x"])
                lines.append(" ".join(item["text"] for item in current_line))
                current_line = [b]

        if current_line:
            current_line.sort(key=lambda item: item["x"])
            lines.append(" ".join(item["text"] for item in current_line))

        return "\n".join(lines)

    def extract_text_from_image_pil(self, img: Image.Image) -> str:
        """Extract text from a PIL Image using available OCR engines."""
        try:
            img = ImageOps.exif_transpose(img)
        except Exception:
            pass

        if img.mode not in ("RGB", "L"):
            img = img.convert("RGB")

        # 1. Try RapidOCR first
        if self.rapid_ocr is not None:
            try:
                np_img = np.array(img)
                res, _ = self.rapid_ocr(np_img)
                formatted = self.format_rapidocr_result(res)
                if formatted.strip():
                    return formatted.strip()
            except Exception as e:
                print(f"RapidOCR processing error: {e}")

        # 2. Fallback to pytesseract if installed
        if self.has_pytesseract and self.pytesseract is not None:
            try:
                text = self.pytesseract.image_to_string(img)
                if text.strip():
                    return text.strip()
            except Exception as e:
                print(f"PyTesseract fallback error: {e}")

        return ""

    def extract_text_from_image(self, image_bytes: bytes) -> str:
        """Extract text from raw image bytes."""
        try:
            img = Image.open(io.BytesIO(image_bytes))
            return self.extract_text_from_image_pil(img)
        except Exception as e:
            raise SecurityValidationError(f"Could not open image file: {str(e)}")

    def extract_text_from_pdf(self, file_bytes: bytes) -> str:
        """Extract text from PDF using digital font streams or OCR rendering."""
        text = ""

        # 1. Direct text extraction
        try:
            pdf_file = io.BytesIO(file_bytes)
            reader = PdfReader(pdf_file)
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        except Exception as e:
            print(f"PDF direct text extraction notice: {e}")

        # 2. Fallback to PDF page rendering for scanned/image PDFs
        if len(text.strip()) < 30:
            rendered_pages_text = []
            try:
                import pypdfium2 as pdfium
                pdf = pdfium.PdfDocument(file_bytes)
                for page_index in range(len(pdf)):
                    page = pdf[page_index]
                    pil_image = page.render(scale=2.0).to_pil()
                    page_ocr_text = self.extract_text_from_image_pil(pil_image)
                    if page_ocr_text.strip():
                        rendered_pages_text.append(page_ocr_text.strip())
            except Exception as pe:
                print(f"PDF page rendering with pypdfium2: {pe}")

            if rendered_pages_text:
                text = "\n".join(rendered_pages_text)
            else:
                try:
                    pdf_file = io.BytesIO(file_bytes)
                    reader = PdfReader(pdf_file)
                    for page in reader.pages:
                        for img_obj in page.images:
                            img_text = self.extract_text_from_image(img_obj.data)
                            if img_text:
                                text += img_text + "\n"
                except Exception as ie:
                    print(f"PDF embedded images extraction notice: {ie}")

        return text.strip()

    def process_document(self, filename: str, file_bytes: bytes) -> dict:
        """
        Validate, extract readable content across all formats, classify document type & domain,
        and dynamically extract fields, tables, and entities without schema constraints.
        """
        try:
            safe_filename, ext = self.validate_file_security(filename, file_bytes)
        except SecurityValidationError as sve:
            return {"success": False, "error": str(sve)}
        except Exception as e:
            return {"success": False, "error": f"Security validation failed: {str(e)}"}

        extracted_text = ""
        tables: List[ExtractedTable] = []
        fields: List[ExtractedField] = []
        metadata: Dict[str, Any] = {"filename": safe_filename, "file_size": len(file_bytes), "format": ext[1:]}

        # Format-specific ingestion routing
        try:
            if ext in [".csv", ".tsv", ".xlsx", ".xls"]:
                extracted_text, tables, fields, meta = SpreadsheetParser.parse(file_bytes, safe_filename)
                metadata.update(meta)

            elif ext == ".docx":
                extracted_text, tables, fields, meta = DocxParser.parse(file_bytes, safe_filename)
                metadata.update(meta)

            elif ext in [".txt", ".json"]:
                extracted_text, tables, fields, meta = TextParser.parse(file_bytes, safe_filename)
                metadata.update(meta)

            elif ext == ".sql":
                extracted_text, tables, fields, meta = SqlParser.parse(file_bytes, safe_filename)
                metadata.update(meta)

            elif ext == ".pdf":
                extracted_text = self.extract_text_from_pdf(file_bytes)
                metadata["parser"] = "pdf_hybrid"

            elif ext in [".png", ".jpg", ".jpeg", ".webp"]:
                extracted_text = self.extract_text_from_image(file_bytes)
                metadata["parser"] = "rapidocr"

        except SecurityValidationError as sve:
            return {"success": False, "error": str(sve)}
        except Exception as e:
            return {"success": False, "error": f"Failed to extract document contents: {str(e)}"}

        clean_text = " ".join(extracted_text.split())

        if not clean_text:
            return {
                "success": False,
                "error": "No text could be extracted from the document. Please ensure the document contains readable text."
            }

        # 1. Document Type and Domain Classification
        doc_type, domain, class_conf = DocumentClassifier.classify(
            extracted_text, filename=safe_filename, metadata=metadata
        )

        # 2. Backward compatibility: Transaction category prediction via Scikit-learn
        try:
            text_tfidf = self.vectorizer.transform([clean_text])
            predicted_transaction_category = self.model.predict(text_tfidf)[0]
            probabilities = self.model.predict_proba(text_tfidf)[0]
            trans_confidence = float(max(probabilities))
        except Exception:
            predicted_transaction_category = "General Expense"
            trans_confidence = 0.50

        # 3. Dynamic Semantic Extraction (Discovers arbitrary fields and tables)
        dyn_fields, dyn_tables, warnings = DynamicExtractor.extract(
            extracted_text, document_type=doc_type, domain=domain
        )

        # Merge format parser fields and tables with dynamically discovered ones
        for f in fields:
            if not any(df.label.lower() == f.label.lower() for df in dyn_fields):
                dyn_fields.append(f)
        for t in tables:
            if not any(dt.title.lower() == t.title.lower() for dt in dyn_tables):
                dyn_tables.append(t)

        # 4. Construct Dynamic Document Response
        response = DynamicDocumentResponse(
            success=True,
            document_type=doc_type,
            domain=domain,
            fields=dyn_fields,
            tables=dyn_tables,
            warnings=warnings,
            extraction_status="needs_review" if warnings else "verified",
            metadata=metadata,
            raw_text=extracted_text
        )

        res_dict = response.to_dict()

        # Preserve legacy transaction category for existing unit tests
        res_dict["category"] = predicted_transaction_category
        res_dict["confidence"] = round(trans_confidence, 4)
        res_dict["classification"] = {
            "category": predicted_transaction_category,
            "confidence": round(trans_confidence, 4)
        }
        res_dict["invoice"]["category"] = predicted_transaction_category

        return res_dict
