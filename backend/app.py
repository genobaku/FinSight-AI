import os
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

    if "file" not in request.files:
        return jsonify({
            "success": False,
            "error": "No file payload found in upload request."
        }), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({
            "success": False,
            "error": "Filename cannot be empty."
        }), 400

    filename = file.filename
    file_bytes = file.read()

    result = doc_processor.process_document(filename, file_bytes)
    
    if not result["success"]:
        return jsonify(result), 400
        
    return jsonify(result), 200

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    print(f"Starting Finsight AI Document API backend on http://localhost:{port}")
    app.run(host="0.0.0.0", port=port, debug=False)
