"""
Spreadsheet Parser for CSV, TSV, and XLSX documents.
Extracts structured tables, column schemas, types, and summary statistics.
"""

import io
import csv
from typing import Tuple, List, Dict, Any, Optional
import pandas as pd
from backend.document_processing.models import ExtractedTable, ExtractedField, SourceEvidence

class SpreadsheetParser:
    @staticmethod
    def parse(file_bytes: bytes, filename: str) -> Tuple[str, List[ExtractedTable], List[ExtractedField], Dict[str, Any]]:
        ext = filename.split(".")[-1].lower() if "." in filename else "csv"
        tables: List[ExtractedTable] = []
        fields: List[ExtractedField] = []
        metadata: Dict[str, Any] = {"format": ext}
        raw_text_parts: List[str] = []

        if ext in ["xlsx", "xls"]:
            # Parse Excel Workbook
            try:
                excel_file = io.BytesIO(file_bytes)
                xls = pd.ExcelFile(excel_file)
                metadata["sheet_names"] = xls.sheet_names

                for sheet_idx, sheet_name in enumerate(xls.sheet_names):
                    df = pd.read_excel(xls, sheet_name=sheet_name)
                    df = df.dropna(how="all")  # Drop completely empty rows
                    if df.empty:
                        continue

                    headers = [str(col).strip() for col in df.columns]
                    # Convert NaN to empty string and convert values to standard Python types
                    rows = []
                    for _, row in df.head(500).iterrows():
                        rows.append([None if pd.isna(v) else v for v in row.tolist()])

                    table_id = f"table-sheet-{sheet_idx+1}"
                    tables.append(ExtractedTable(
                        id=table_id,
                        title=f"Sheet: {sheet_name}",
                        headers=headers,
                        rows=rows,
                        source_evidence={"sheet": sheet_name, "total_rows": len(df)}
                    ))

                    raw_text_parts.append(f"--- Sheet: {sheet_name} ---")
                    raw_text_parts.append(" | ".join(headers))
                    for r in rows[:20]:
                        raw_text_parts.append(" | ".join(str(cell) for cell in r))

                    # Discover candidate fields from numeric column sums or single-row totals
                    for col in df.columns:
                        col_clean = str(col).strip()
                        if pd.api.types.is_numeric_dtype(df[col]):
                            total_sum = round(float(df[col].sum()), 2)
                            field_id = f"field-sum-{sheet_idx}-{col_clean.lower().replace(' ', '_')}"
                            fields.append(ExtractedField(
                                id=field_id,
                                label=f"Total {col_clean}",
                                value=total_sum,
                                data_type="decimal",
                                semantic_category="financial_total" if any(k in col_clean.lower() for k in ["price", "amount", "cost", "total", "fee", "revenue", "salary"]) else "metric",
                                source_evidence=SourceEvidence(text=f"Calculated sum of column '{col_clean}'", page=sheet_idx+1),
                                confidence=1.0,
                                verification_status="verified"
                            ))

            except Exception as e:
                raise ValueError(f"Failed to parse Excel file: {str(e)}")

        else:
            # Parse CSV or TSV
            try:
                # Attempt to decode text
                text_content = ""
                for enc in ["utf-8", "utf-8-sig", "latin1", "cp1252"]:
                    try:
                        text_content = file_bytes.decode(enc)
                        metadata["encoding"] = enc
                        break
                    except UnicodeDecodeError:
                        continue

                if not text_content:
                    raise ValueError("Could not decode CSV text with supported encodings (UTF-8, Latin-1, Windows-1252).")

                # Detect dialect / delimiter
                sample = text_content[:2048]
                try:
                    dialect = csv.Sniffer().sniff(sample)
                    delimiter = dialect.delimiter
                except Exception:
                    delimiter = "\t" if ext == "tsv" else ","
                metadata["delimiter"] = delimiter

                df = pd.read_csv(io.StringIO(text_content), sep=delimiter, on_bad_lines="skip")
                df = df.dropna(how="all")

                headers = [str(col).strip() for col in df.columns]
                rows = []
                for _, row in df.head(500).iterrows():
                    rows.append([None if pd.isna(v) else v for v in row.tolist()])

                tables.append(ExtractedTable(
                    id="table-csv-1",
                    title=filename,
                    headers=headers,
                    rows=rows,
                    source_evidence={"total_rows": len(df), "delimiter": delimiter}
                ))

                raw_text_parts.append(" | ".join(headers))
                for r in rows[:30]:
                    raw_text_parts.append(" | ".join(str(cell) for cell in r))

                # Identify aggregate candidate fields
                for col in df.columns:
                    col_clean = str(col).strip()
                    if pd.api.types.is_numeric_dtype(df[col]):
                        total_sum = round(float(df[col].sum()), 2)
                        fields.append(ExtractedField(
                            id=f"field-csv-{col_clean.lower().replace(' ', '_')}",
                            label=f"Total {col_clean}",
                            value=total_sum,
                            data_type="decimal",
                            semantic_category="financial_total" if any(k in col_clean.lower() for k in ["price", "amount", "cost", "total", "revenue"]) else "metric",
                            source_evidence=SourceEvidence(text=f"Sum of column '{col_clean}'", page=1),
                            confidence=1.0,
                            verification_status="verified"
                        ))

            except Exception as e:
                raise ValueError(f"Failed to parse CSV file: {str(e)}")

        full_raw_text = "\n".join(raw_text_parts)
        metadata["row_count"] = sum(len(t.rows) for t in tables)
        metadata["table_count"] = len(tables)

        return full_raw_text, tables, fields, metadata
