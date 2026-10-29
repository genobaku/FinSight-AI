"""
Safe SQL Parser.
Inspects database export scripts (.sql) for schema definitions and data rows.
SECURITY MANDATE: Strictly lexical parsing only. NEVER executes any SQL.
"""

import re
from typing import Tuple, List, Dict, Any
from backend.document_processing.models import ExtractedTable, ExtractedField, SourceEvidence

class SqlParser:
    @staticmethod
    def parse(file_bytes: bytes, filename: str) -> Tuple[str, List[ExtractedTable], List[ExtractedField], Dict[str, Any]]:
        tables: List[ExtractedTable] = []
        fields: List[ExtractedField] = []
        metadata: Dict[str, Any] = {"format": "sql", "safe_parsed": True}

        text_content = ""
        for enc in ["utf-8", "utf-8-sig", "latin1", "cp1252"]:
            try:
                text_content = file_bytes.decode(enc)
                break
            except UnicodeDecodeError:
                continue

        if not text_content:
            raise ValueError("Could not decode SQL script content with supported encodings.")

        # 1. Detect CREATE TABLE statements
        create_table_matches = re.finditer(
            r'CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:[`"\[]?(\w+)[`"\]]?\.)?[`"\[]?(\w+)[`"\]]?\s*\((.*?)\);',
            text_content,
            re.IGNORECASE | re.DOTALL
        )

        table_schemas = {}
        for match in create_table_matches:
            tbl_name = match.group(2)
            col_block = match.group(3)
            cols = []
            for line in col_block.splitlines():
                line_clean = line.strip().rstrip(",")
                if not line_clean or line_clean.upper().startswith(("PRIMARY KEY", "FOREIGN KEY", "CONSTRAINT", "INDEX", "KEY", "UNIQUE", "CHECK")):
                    continue
                parts = line_clean.split()
                if parts:
                    col_name = re.sub(r'[`"\[\]]', '', parts[0])
                    col_type = parts[1] if len(parts) > 1 else "TEXT"
                    cols.append(f"{col_name} ({col_type})")
            table_schemas[tbl_name] = cols

        # 2. Detect INSERT INTO rows
        insert_matches = re.finditer(
            r'INSERT\s+INTO\s+[`"\[]?(\w+)[`"\]]?\s*(?:\((.*?)\))?\s*VALUES\s*(.*?);',
            text_content,
            re.IGNORECASE | re.DOTALL
        )

        for match in insert_matches:
            tbl_name = match.group(1)
            raw_cols = match.group(2)
            raw_values = match.group(3)

            headers = []
            if raw_cols:
                headers = [re.sub(r'[`"\[\]\s]', '', c) for c in raw_cols.split(",")]
            elif tbl_name in table_schemas:
                headers = [c.split()[0] for c in table_schemas[tbl_name]]
            else:
                headers = ["Column 1", "Column 2", "Column 3"]

            # Parse value tuples: (val1, val2), (val3, val4)
            tuples = re.findall(r'\((.*?)\)', raw_values)
            rows = []
            for tup in tuples[:50]:
                cell_vals = [c.strip().strip("'\"") for c in tup.split(",")]
                rows.append(cell_vals)

            if rows:
                tables.append(ExtractedTable(
                    id=f"table-sql-{tbl_name.lower()}",
                    title=f"SQL Table: {tbl_name}",
                    headers=headers,
                    rows=rows,
                    source_evidence={"table_name": tbl_name, "sample_rows": len(rows)}
                ))

        # If CREATE TABLE statements exist without INSERTs, create schema table
        for tbl_name, cols in table_schemas.items():
            if not any(t.title == f"SQL Table: {tbl_name}" for t in tables):
                tables.append(ExtractedTable(
                    id=f"table-sql-schema-{tbl_name.lower()}",
                    title=f"Schema: {tbl_name}",
                    headers=["Column Name", "Type & Constraints"],
                    rows=[[c.split()[0], " ".join(c.split()[1:])] for c in cols],
                    source_evidence={"schema_table": tbl_name}
                ))

        metadata["tables_detected"] = list(table_schemas.keys())
        metadata["table_count"] = len(tables)

        return text_content, tables, fields, metadata
