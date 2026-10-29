import urllib.request
import json
import base64

raw_text = """COFFEE CORNER
123 Main St, Seattle
Date: 2026-08-15
Invoice #: INV-9901
1 Americano 4.50 4.50
1 Blueberry Scone 3.50 3.50
Subtotal: $8.00
Tax (8.0%): $0.64
Total: $8.64
Payment Method: Visa ending in 1234
"""

b64 = base64.b64encode(raw_text.encode('utf-8')).decode('utf-8')
payload = {
    "imageBase64": f"data:text/plain;base64,{b64}",
    "filename": "receipt_test.txt"
}

req = urllib.request.Request(
    "http://localhost:3000/api/classify-document",
    data=json.dumps(payload).encode('utf-8'),
    headers={"Content-Type": "application/json"}
)

try:
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode('utf-8'))
        print("Status:", resp.status)
        print("Success:", res.get("success"))
        print("Document Type:", res.get("document_type"))
        print("Domain:", res.get("domain"))
        print("Fields:")
        for f in res.get("fields", []):
            print(f"  - {f.get('label')} [{f.get('semantic_category')}]: {f.get('value')} (Status: {f.get('verification_status')})")
        print("Tables count:", len(res.get("tables", [])))
        if res.get("tables"):
            print("Table 0 headers:", res["tables"][0].get("headers"))
            print("Table 0 rows:", res["tables"][0].get("rows"))
        print("Legacy invoice dict:")
        inv = res.get("invoice", {})
        print(f"  vendor: {inv.get('vendor')}, total: {inv.get('total')}, subtotal: {inv.get('subtotal')}, tax: {inv.get('tax')}")

    # Test 2: Academic Record
    acad_text = """STANFORD UNIVERSITY - OFFICIAL TRANSCRIPT
Student Name: Jane Doe
Enrollment Number: ENR-2024-9021
Course / Program: Computer Science
Semester: Fall 2026
GPA: 3.85
Credits: 120
"""
    b64_acad = base64.b64encode(acad_text.encode('utf-8')).decode('utf-8')
    req2 = urllib.request.Request(
        "http://localhost:3000/api/classify-document",
        data=json.dumps({"imageBase64": f"data:text/plain;base64,{b64_acad}", "filename": "transcript.txt"}).encode('utf-8'),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req2) as resp:
        res2 = json.loads(resp.read().decode('utf-8'))
        print("\n--- Academic Record Test ---")
        print("Success:", res2.get("success"))
        print("Document Type:", res2.get("document_type"))
        print("Domain:", res2.get("domain"))
        for f in res2.get("fields", []):
            print(f"  - {f.get('label')}: {f.get('value')} ({f.get('data_type')})")

    # Test 3: CSV Spreadsheet
    csv_text = "PatientID,BloodPressure,CholesterolLevel,RiskScore\nP101,120/80,195,0.12\nP102,130/85,210,0.25\n"
    b64_csv = base64.b64encode(csv_text.encode('utf-8')).decode('utf-8')
    req3 = urllib.request.Request(
        "http://localhost:3000/api/classify-document",
        data=json.dumps({"imageBase64": f"data:text/csv;base64,{b64_csv}", "filename": "clinical_data.csv"}).encode('utf-8'),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req3) as resp:
        res3 = json.loads(resp.read().decode('utf-8'))
        print("\n--- CSV Spreadsheet Test ---")
        print("Success:", res3.get("success"))
        print("Document Type:", res3.get("document_type"))
        print("Domain:", res3.get("domain"))
        print("Tables:", len(res3.get("tables", [])))
        if res3.get("tables"):
            print("Headers:", res3["tables"][0].get("headers"))
            print("Rows:", res3["tables"][0].get("rows"))
except urllib.error.HTTPError as e:
    print("HTTP Error:", e.code)
    print("Error Body:", e.read().decode('utf-8'))
except Exception as e:
    print("General Error:", e)
