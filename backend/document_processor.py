# Re-export DocumentProcessor from backend.document_processing.processor for backward compatibility
from backend.document_processing.processor import DocumentProcessor, SecurityValidationError

__all__ = ["DocumentProcessor", "SecurityValidationError"]
