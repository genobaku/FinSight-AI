import os
from PIL import Image, ImageDraw, ImageFont

def create_receipt_image(filepath: str):
    # Create white canvas 500x650
    img = Image.new('RGB', (500, 650), color=(255, 255, 255))
    d = ImageDraw.Draw(img)

    # Use default bitmap font
    lines = [
        "========================================",
        "          ACME METRO GROCERY            ",
        "         123 Market St, Suite 4         ",
        "========================================",
        "Date: 2026-08-15        Time: 14:22     ",
        "Invoice #: INV-2026-8841                ",
        "Cashier: Jordan                         ",
        "----------------------------------------",
        "ITEMS                                   ",
        "1 Organic Whole Milk        3.99    3.99",
        "2 Sourdough Bread Loaf      4.50    9.00",
        "1 Colombian Coffee Beans   12.50   12.50",
        "----------------------------------------",
        "Subtotal:                         $25.49",
        "Tax (8.0%):                        $2.04",
        "Total:                            $27.53",
        "----------------------------------------",
        "Payment Method: Visa ending in 4102     ",
        "Auth: 088412    Status: Approved        ",
        "========================================",
        "       THANK YOU FOR SHOPPING!          ",
        "========================================"
    ]

    y = 20
    for line in lines:
        d.text((30, y), line, fill=(0, 0, 0))
        y += 26

    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    img.save(filepath)
    print(f"Saved rich receipt fixture to {filepath}")

if __name__ == "__main__":
    create_receipt_image("tests/fixtures/sample_acme_receipt.png")
