import os
import sys
import base64

# Ensure both project root and backend dir are in sys.path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(BASE_DIR)
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from flask import Flask, request, jsonify
from flask_cors import CORS
from backend.document_processing.processor import DocumentProcessor

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000"])

try:
    doc_processor = DocumentProcessor()
    print("Finsight Production ML Document Processor loaded successfully!")
except Exception as e:
    print(f"Error loading DocumentProcessor: {e}")
    doc_processor = None

@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "ok",
        "service": "FinSight AI Flask Document Classification Service",
        "ml_loaded": doc_processor is not None
    }), 200

@app.route("/api/classify-document", methods=["POST"])
def classify_document():
    if doc_processor is None:
        return jsonify({
            "success": False,
            "error": "Production ML Model is unavailable."
        }), 500

    filename = ""
    file_bytes = b""

    # 1. Handle multipart/form-data upload
    if "file" in request.files:
        file = request.files["file"]
        if file.filename == "":
            return jsonify({
                "success": False,
                "error": "Filename cannot be empty."
            }), 400
        filename = file.filename
        file_bytes = file.read()

    # 2. Handle JSON payload with imageBase64
    elif request.is_json:
        data = request.get_json(silent=True) or {}
        image_base64 = data.get("imageBase64")
        filename = data.get("filename", "document.jpg")
        if not image_base64:
            return jsonify({
                "success": False,
                "error": "No file or imageBase64 payload found in request."
            }), 400
        try:
            # Strip data URI header if present
            if "," in image_base64:
                image_base64 = image_base64.split(",", 1)[1]
            file_bytes = base64.b64decode(image_base64)
        except Exception as b_err:
            return jsonify({
                "success": False,
                "error": f"Invalid base64 payload: {str(b_err)}"
            }), 400

    else:
        return jsonify({
            "success": False,
            "error": "Request must be multipart/form-data with 'file' or JSON with 'imageBase64'."
        }), 400

    if not file_bytes:
        return jsonify({
            "success": False,
            "error": "Uploaded document payload is empty."
        }), 400

    result = doc_processor.process_document(filename, file_bytes)
    
    if not result.get("success"):
        return jsonify(result), 400
        
    return jsonify(result), 200

if __name__ == "__main__":
    port = int(os.getenv("PORT", os.getenv("ML_SERVICE_PORT", 5000)))
    print(f"Starting Finsight AI Document API backend on http://localhost:{port}")
    app.run(host="0.0.0.0", port=port, debug=False)
