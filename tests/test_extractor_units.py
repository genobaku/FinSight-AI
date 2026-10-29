import unittest
from backend.document_processing.extractor import extract_structured_invoice_data

class TestExtractorUnits(unittest.TestCase):
    def test_starbucks_receipt(self):
        text = (
            "STARBUCKS STORE #10423\n"
            "450 Main Street, Seattle WA\n"
            "Date: 2026-08-14  Time: 08:32 AM\n"
            "Invoice #: INV-2026-9812\n"
            "\n"
            "1 Grande Caffe Latte 4.75 4.75\n"
            "1 Blueberry Muffin 3.25 3.25\n"
            "1 Breakfast Sandwich 5.50 5.50\n"
            "\n"
            "Subtotal: $13.50\n"
            "Tax (8.5%): $1.15\n"
            "Total: $14.65\n"
            "\n"
            "Payment Method: Visa ending in 4812\n"
            "Thank you for visiting!"
        )
        res = extract_structured_invoice_data(text)
        self.assertEqual(res["vendor"], "STARBUCKS STORE #10423")
        self.assertEqual(res["invoice_number"], "INV-2026-9812")
        self.assertEqual(res["invoice_date"], "2026-08-14")
        self.assertEqual(res["currency"], "USD")
        self.assertEqual(res["subtotal"], 13.50)
        self.assertEqual(res["tax"], 1.15)
        self.assertEqual(res["tax_rate"], "8.5%")
        self.assertEqual(res["total"], 14.65)
        self.assertEqual(res["payment_method"], "Visa")
        self.assertEqual(len(res["items"]), 3)
        self.assertFalse(res["totals_disagree"])
        self.assertEqual(res["calculated_total"], 14.65)

    def test_uber_receipt(self):
        text = (
            "Uber Technologies, Inc.\n"
            "Receipt / Tax Invoice\n"
            "Invoice Number: UB-8472910\n"
            "Date: 22 Jul 2026\n"
            "1 UberX Airport Trip 32.50 32.50\n"
            "Subtotal: $32.50\n"
            "Taxes: $3.10\n"
            "Total: $35.60\n"
            "Paid with MasterCard"
        )
        res = extract_structured_invoice_data(text)
        self.assertEqual(res["vendor"], "Uber Technologies, Inc.")
        self.assertEqual(res["invoice_number"], "UB-8472910")
        self.assertEqual(res["invoice_date"], "2026-07-22")
        self.assertEqual(res["currency"], "USD")
        self.assertEqual(res["subtotal"], 32.50)
        self.assertEqual(res["tax"], 3.10)
        self.assertEqual(res["total"], 35.60)
        self.assertEqual(res["payment_method"], "MasterCard")

    def test_missing_fields_remain_none(self):
        # Receipt with only merchant, total, and cash
        text = (
            "City Cab Taxi\n"
            "Total: 24.50\n"
            "Cash payment\n"
        )
        res = extract_structured_invoice_data(text)
        self.assertEqual(res["vendor"], "City Cab Taxi")
        self.assertIsNone(res["invoice_number"])
        self.assertIsNone(res["invoice_date"])
        self.assertIsNone(res["currency"])
        self.assertIsNone(res["subtotal"])
        self.assertIsNone(res["tax"])
        self.assertEqual(res["total"], 24.50)
        self.assertEqual(res["payment_method"], "Cash")
        self.assertEqual(res["items"], [])

    def test_disagreeing_totals(self):
        # Document total is $20.00 but subtotal + tax = $15.00
        text = (
            "Acme Hardware\n"
            "Subtotal: $13.00\n"
            "Tax: $2.00\n"
            "Total: $20.00\n"
        )
        res = extract_structured_invoice_data(text)
        self.assertEqual(res["total"], 20.00)
        self.assertTrue(res["totals_disagree"])
        self.assertEqual(res["calculated_total"], 15.00)

if __name__ == "__main__":
    unittest.main()
