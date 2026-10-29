"""
Text & JSON Document Parser.
Handles plain text files (.txt) and structured JSON data (.json).
"""

import json
from typing import Tuple, List, Dict, Any
from backend.document_processing.models import ExtractedTable, ExtractedField, SourceEvidence

class TextParser:
    @staticmethod
    def parse(file_bytes: bytes, filename: str) -> Tuple[str, List[ExtractedTable], List[ExtractedField], Dict[str, Any]]:
        tables: List[ExtractedTable] = []
        fields: List[ExtractedField] = []
        metadata: Dict[str, Any] = {}
        ext = filename.split(".")[-1].lower() if "." in filename else "txt"

        # Decode file bytes
        text_content = ""
        for enc in ["utf-8", "utf-8-sig", "latin1", "cp1252"]:
            try:
                text_content = file_bytes.decode(enc)
                metadata["encoding"] = enc
                break
            except UnicodeDecodeError:
                continue

        if not text_content:
            raise ValueError("Could not decode text file content with supported encodings.")

        if ext == "json":
            try:
                parsed_json = json.loads(text_content)
                metadata["format"] = "json"

                if isinstance(parsed_json, list):
                    # List of objects -> ExtractedTable
                    if parsed_json and isinstance(parsed_json[0], dict):
                        headers = list(parsed_json[0].keys())
                        rows = [[item.get(h) for h in headers] for item in parsed_json[:500]]
                        tables.append(ExtractedTable(
                            id="table-json-1",
                            title="JSON Array Records",
                            headers=headers,
                            rows=rows,
                            source_evidence={"total_records": len(parsed_json)}
                        ))
                elif isinstance(parsed_json, dict):
                    # Key-value dictionary
                    for idx, (k, v) in enumerate(parsed_json.items()):
                        if isinstance(v, (str, int, float, bool)) or v is None:
                            dtype = "text"
                            if isinstance(v, bool):
                                dtype = "boolean"
                            elif isinstance(v, int):
                                dtype = "integer"
                            elif isinstance(v, float):
                                dtype = "decimal"

                            fields.append(ExtractedField(
                                id=f"field-json-{idx+1}",
                                label=str(k).replace("_", " ").title(),
                                value=v,
                                data_type=dtype,
                                semantic_category="general",
                                source_evidence=SourceEvidence(text=f'"{k}": {json.dumps(v)}', page=1),
                                confidence=1.0,
                                verification_status="verified"
                            ))
                        elif isinstance(v, list) and v and isinstance(v[0], dict):
                            # Nested list of objects -> Table
                            headers = list(v[0].keys())
                            rows = [[item.get(h) for h in headers] for item in v[:500]]
                            tables.append(ExtractedTable(
                                id=f"table-json-{k}",
                                title=str(k).replace("_", " ").title(),
                                headers=headers,
                                rows=rows,
                                source_evidence={"parent_key": k, "total_records": len(v)}
                            ))

            except Exception as e:
                raise ValueError(f"Failed to parse JSON document: {str(e)}")

        else:
            metadata["format"] = "txt"
            metadata["line_count"] = len(text_content.splitlines())

        return text_content, tables, fields, metadata
