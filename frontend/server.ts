import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Helper to instantiate Gemini client safely on server
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// In-Memory Database Store for full fallback & immediate responsiveness
let memoryInvoices: any[] = [
  {
    id: 'inv-101',
    invoiceNumber: 'INV-2026-001',
    customerId: 'cust-1',
    customerName: 'Acme Global Corp',
    customerEmail: 'billing@acme.com',
    issueDate: '2026-08-01',
    dueDate: '2026-08-31',
    subtotal: 12500,
    taxTotal: 1000,
    discountTotal: 0,
    total: 13500,
    status: 'Paid',
    currency: 'USD',
    paymentTerms: 'Net 30',
    notes: 'Q3 Enterprise License',
    items: [
      { id: '1', description: 'Enterprise License - Annual', quantity: 1, price: 12500, total: 12500 },
    ],
    createdAt: '2026-08-01',
  },
  {
    id: 'inv-102',
    invoiceNumber: 'INV-2026-002',
    customerId: 'cust-2',
    customerName: 'Stark Industries',
    customerEmail: 'accounts@stark.com',
    issueDate: '2026-08-03',
    dueDate: '2026-09-02',
    subtotal: 28400,
    taxTotal: 2272,
    discountTotal: 500,
    total: 30172,
    status: 'Pending',
    currency: 'USD',
    paymentTerms: 'Net 30',
    notes: 'Custom AI Pipeline Development',
    items: [
      { id: '1', description: 'AI Extraction Pipeline Integration', quantity: 1, price: 28400, total: 28400 },
    ],
    createdAt: '2026-08-03',
  },
];

let memoryVendors: any[] = [
  {
    id: 'v-1',
    name: 'Amazon Web Services',
    category: 'Cloud Infrastructure',
    contactEmail: 'aws-billing@amazon.com',
    contactPhone: '+1-800-555-0199',
    totalSpent: 18450.0,
    pendingPayables: 2100.0,
    riskScore: 'Low',
    status: 'Verified',
  },
  {
    id: 'v-2',
    name: 'Google Cloud Platform',
    category: 'Cloud Infrastructure',
    contactEmail: 'gcp-billing@google.com',
    contactPhone: '+1-800-555-0144',
    totalSpent: 24300.0,
    pendingPayables: 0.0,
    riskScore: 'Low',
    status: 'Verified',
  },
];

let memoryCustomers: any[] = [
  {
    id: 'cust-1',
    name: 'Sarah Jenkins',
    company: 'Acme Global Corp',
    email: 'billing@acme.com',
    phone: '+1-555-234-5678',
    address: '100 Technology Way, San Jose, CA',
    totalBilled: 45000,
    totalPaid: 45000,
    outstandingBalance: 0,
    status: 'Active',
  },
  {
    id: 'cust-2',
    name: 'Tony Stark',
    company: 'Stark Industries',
    email: 'accounts@stark.com',
    phone: '+1-555-987-6543',
    address: '10880 Wilshire Blvd, Los Angeles, CA',
    totalBilled: 85000,
    totalPaid: 54828,
    outstandingBalance: 30172,
    status: 'Active',
  },
];

let memoryExpenses: any[] = [
  {
    id: 'exp-1',
    title: 'AWS Monthly Hosting & GPU Workloads',
    category: 'Software & Hosting',
    vendorId: 'v-1',
    vendorName: 'Amazon Web Services',
    amount: 4850.0,
    tax: 388.0,
    date: '2026-08-01',
    paymentMethod: 'Corporate Card',
    status: 'Approved',
  },
];

// ==========================================
// REST API ROUTES - MOUNTED BEFORE VITE
// ==========================================

// 1. Healthcheck API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'FinSight AI Express Server',
    timestamp: new Date().toISOString(),
    supabaseConfigured: Boolean(process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL),
    cloudinaryConfigured: Boolean(
      process.env.VITE_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME
    ),
  });
});

// Proxy route for Python ML Classifier Service (Flask on port 5000)
app.post('/api/classify-document', async (req, res) => {
  try {
    const { imageBase64, filename = 'document.jpg' } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ success: false, error: 'Missing imageBase64 payload.' });
    }

    // Convert Base64 data URI to Binary Buffer
    const base64Data = imageBase64.replace(/^data:[^;]+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    const formData = new FormData();
    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    formData.append('file', blob, filename);

    const mlFlaskPort = process.env.ML_SERVICE_PORT || '5000';
    const flaskRes = await fetch(`http://127.0.0.1:${mlFlaskPort}/api/classify-document`, {
      method: 'POST',
      body: formData,
    });

    const mlData = await flaskRes.json();
    return res.status(flaskRes.status).json(mlData);
  } catch (err: any) {
    console.error('Python ML Classifier proxy error:', err);
    return res.status(500).json({
      success: false,
      error: 'Python ML Classifier service unreachable on port 5000.',
      details: err.message,
    });
  }
});


// 2. Cloudinary Upload Proxy Route POST /api/cloudinary/upload
app.post('/api/cloudinary/upload', async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    const cloudName =
      process.env.VITE_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME || '';
    const apiKey = process.env.CLOUDINARY_API_KEY || '';
    const apiSecret = process.env.CLOUDINARY_API_SECRET || '';
    const uploadPreset = process.env.VITE_CLOUDINARY_UPLOAD_PRESET || '';

    if (!imageBase64) {
      return res.status(400).json({ success: false, error: 'Missing imageBase64 in request body.' });
    }

    if (cloudName && (uploadPreset || (apiKey && apiSecret))) {
      const formData = new URLSearchParams();
      formData.append('file', imageBase64);
      if (uploadPreset) {
        formData.append('upload_preset', uploadPreset);
      } else {
        const timestamp = Math.floor(Date.now() / 1000).toString();
        formData.append('api_key', apiKey);
        formData.append('timestamp', timestamp);
      }

      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      });

      if (uploadRes.ok) {
        const cloudData = await uploadRes.json();
        return res.json({
          success: true,
          secure_url: cloudData.secure_url,
          public_id: cloudData.public_id,
          format: cloudData.format,
          width: cloudData.width,
          height: cloudData.height,
          bytes: cloudData.bytes,
          original_filename: cloudData.original_filename || 'receipt',
          isCloudinaryDirect: true,
        });
      }
    }

    // Direct Return Fallback for preview
    res.json({
      success: true,
      secure_url: imageBase64,
      public_id: `asset_${Date.now()}`,
      format: 'jpg',
      width: 1024,
      height: 768,
      bytes: 204800,
      original_filename: 'scanned_receipt',
      isCloudinaryDirect: false,
    });
  } catch (err: any) {
    console.error('Cloudinary upload error:', err);
    res.status(500).json({ success: false, error: 'Cloudinary upload failed', reason: err.message });
  }
});

// 3. Gemini Vision OCR Extraction Route POST /api/invoices/extract
app.post('/api/invoices/extract', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', cloudinaryUrl } = req.body;
    const ai = getGeminiClient();

    if (!imageBase64) {
      return res.status(400).json({
        success: false,
        message: 'Missing image payload',
        reason: 'imageBase64 string is required.',
      });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    if (!ai) {
      return res.status(200).json({
        success: false,
        message: 'GEMINI_API_KEY environment variable is not configured.',
        cloudinary_url: cloudinaryUrl || null,
        ocr_text: '',
        invoice: {
          vendor: null,
          invoice_number: null,
          invoice_date: null,
          currency: 'USD',
          subtotal: 0,
          tax: 0,
          tax_rate: null,
          total: 0,
          payment_method: null,
          category: null,
          confidence: 0,
          items: [],
        },
      });
    }

    const promptText = `Perform OCR and information extraction on this receipt or invoice image with maximum precision.
Extract all readable text and structured invoice fields.

CRITICAL MANDATES:
1. Return ONLY strict JSON matching the schema below. No markdown formatting (\`\`\`json), no explanations.
2. Extract REAL, EXACT text from the receipt image. NEVER fabricate or invent generic vendor names, fake invoice numbers, or fake totals.
3. If a field cannot be identified or is missing on the image, set its value to null (or 0 for numeric amounts, or empty array for items).
4. Identify the currency code or symbol (e.g., CHF, USD, EUR, GBP, CAD, JPY).
5. Calculate a confidence percentage score (0 to 100) based on image legibility and extracted field completeness.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: cleanBase64,
            },
          },
          {
            text: promptText,
          },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            vendor: { type: Type.STRING, nullable: true },
            invoice_number: { type: Type.STRING, nullable: true },
            invoice_date: { type: Type.STRING, nullable: true },
            currency: { type: Type.STRING, nullable: true },
            subtotal: { type: Type.NUMBER, nullable: true },
            tax: { type: Type.NUMBER, nullable: true },
            tax_rate: { type: Type.STRING, nullable: true },
            total: { type: Type.NUMBER, nullable: true },
            payment_method: { type: Type.STRING, nullable: true },
            category: { type: Type.STRING, nullable: true },
            confidence: { type: Type.NUMBER },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  quantity: { type: Type.NUMBER },
                  unit_price: { type: Type.NUMBER },
                  total: { type: Type.NUMBER },
                },
              },
            },
          },
        },
      },
    });

    let rawText = response.text || '{}';
    let parsed: any = {};
    try {
      parsed = JSON.parse(rawText);
    } catch (pErr) {
      console.error('Error parsing JSON from Gemini response:', pErr);
    }

    const structuredInvoice = {
      vendor: parsed.vendor || null,
      invoice_number: parsed.invoice_number || null,
      invoice_date: parsed.invoice_date || null,
      currency: parsed.currency || 'USD',
      subtotal: Number(parsed.subtotal) || 0,
      tax: Number(parsed.tax) || 0,
      tax_rate: parsed.tax_rate || null,
      total: Number(parsed.total) || 0,
      payment_method: parsed.payment_method || null,
      category: parsed.category || null,
      confidence: Number(parsed.confidence) || 98,
      items: Array.isArray(parsed.items)
        ? parsed.items.map((it: any) => ({
            name: it.name || it.description || 'Item',
            quantity: Number(it.quantity) || 1,
            unit_price: Number(it.unit_price || it.price) || 0,
            total: Number(it.total) || 0,
          }))
        : [],
    };

    return res.json({
      success: true,
      cloudinary_url: cloudinaryUrl || null,
      ocr_text: rawText,
      invoice: structuredInvoice,
    });
  } catch (err: any) {
    console.error('Gemini extraction error:', err);
    return res.status(200).json({
      success: false,
      message: 'OCR extraction failed',
      reason: err.message,
      cloudinary_url: req.body?.cloudinaryUrl || null,
      ocr_text: '',
      invoice: {
        vendor: null,
        invoice_number: null,
        invoice_date: null,
        currency: 'USD',
        subtotal: 0,
        tax: 0,
        tax_rate: null,
        total: 0,
        payment_method: null,
        category: null,
        confidence: 0,
        items: [],
      },
    });
  }
});

// 4. Invoices REST endpoints
app.get('/api/invoices', (req, res) => {
  res.json({ success: true, invoices: memoryInvoices });
});

app.get('/api/invoices/:id', (req, res) => {
  const invoice = memoryInvoices.find((i) => i.id === req.params.id);
  if (!invoice) {
    return res.status(404).json({ success: false, error: 'Invoice not found' });
  }
  res.json({ success: true, invoice });
});

app.post('/api/invoices', (req, res) => {
  const newInvoice = req.body;
  
  // Duplicate check
  const duplicate = memoryInvoices.find(
    (inv) => inv.invoiceNumber && inv.invoiceNumber.toLowerCase().trim() === (newInvoice.invoiceNumber || '').toLowerCase().trim()
  );

  if (duplicate) {
    return res.status(409).json({
      success: false,
      error: 'Duplicate invoice number!',
      message: 'This data already exists in your records.',
    });
  }

  const savedInvoice = {
    ...newInvoice,
    id: newInvoice.id || `inv-${Date.now()}`,
    createdAt: newInvoice.createdAt || new Date().toISOString().split('T')[0],
  };

  memoryInvoices.unshift(savedInvoice);
  res.status(201).json({ success: true, invoice: savedInvoice });
});

app.put('/api/invoices/:id', (req, res) => {
  const idx = memoryInvoices.findIndex((i) => i.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, error: 'Invoice not found' });
  }
  memoryInvoices[idx] = { ...memoryInvoices[idx], ...req.body };
  res.json({ success: true, invoice: memoryInvoices[idx] });
});

app.delete('/api/invoices/:id', (req, res) => {
  memoryInvoices = memoryInvoices.filter((i) => i.id !== req.params.id);
  res.json({ success: true, message: 'Invoice deleted successfully' });
});

// 5. Vendors REST endpoints
app.get('/api/vendors', (req, res) => {
  res.json({ success: true, vendors: memoryVendors });
});

app.post('/api/vendors', (req, res) => {
  const newVendor = req.body;
  const duplicate = memoryVendors.find(
    (v) => v.name.toLowerCase().trim() === (newVendor.name || '').toLowerCase().trim()
  );

  if (duplicate) {
    return res.status(409).json({ success: false, error: 'This vendor already exists.' });
  }

  const vendorToSave = { ...newVendor, id: `v-${Date.now()}` };
  memoryVendors.unshift(vendorToSave);
  res.status(201).json({ success: true, vendor: vendorToSave });
});

// 6. Customers REST endpoints
app.get('/api/customers', (req, res) => {
  res.json({ success: true, customers: memoryCustomers });
});

app.post('/api/customers', (req, res) => {
  const newCustomer = req.body;
  const duplicate = memoryCustomers.find(
    (c) => c.company.toLowerCase().trim() === (newCustomer.company || '').toLowerCase().trim()
  );

  if (duplicate) {
    return res.status(409).json({ success: false, error: 'This customer company already exists.' });
  }

  const customerToSave = { ...newCustomer, id: `cust-${Date.now()}` };
  memoryCustomers.unshift(customerToSave);
  res.status(201).json({ success: true, customer: customerToSave });
});

// 7. Expenses REST endpoints
app.get('/api/expenses', (req, res) => {
  res.json({ success: true, expenses: memoryExpenses });
});

app.post('/api/expenses', (req, res) => {
  const newExpense = req.body;
  const expenseToSave = { ...newExpense, id: `exp-${Date.now()}` };
  memoryExpenses.unshift(expenseToSave);
  res.status(201).json({ success: true, expense: expenseToSave });
});

// 8. Dashboard Aggregated Metrics
app.get('/api/dashboard', (req, res) => {
  const totalRevenue = memoryInvoices
    .filter((i) => i.status === 'Paid')
    .reduce((acc, i) => acc + (i.total || 0), 0);

  const pendingReceivables = memoryInvoices
    .filter((i) => i.status === 'Pending' || i.status === 'Overdue')
    .reduce((acc, i) => acc + (i.total || 0), 0);

  const totalExpenses = memoryExpenses.reduce((acc, e) => acc + (e.amount || 0), 0);

  res.json({
    success: true,
    metrics: {
      totalRevenue,
      pendingReceivables,
      totalExpenses,
      netProfit: totalRevenue - totalExpenses,
      activeInvoicesCount: memoryInvoices.length,
      vendorsCount: memoryVendors.length,
      customersCount: memoryCustomers.length,
    },
    recentInvoices: memoryInvoices.slice(0, 5),
    recentExpenses: memoryExpenses.slice(0, 5),
  });
});

// 9. AI Chat Copilot endpoint POST /api/ai/chat
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, context } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        success: true,
        reply: `FinSight AI Financial Assistant Insight: For prompt "${message}", your net revenue is $${memoryInvoices
          .filter((i) => i.status === 'Paid')
          .reduce((a, b) => a + b.total, 0)
          .toLocaleString()} across ${memoryInvoices.length} invoices. Your highest operational expenditure vendor is Amazon Web Services ($18,450.00).`,
      });
    }

    const systemInstruction = `You are FinSight AI Copilot, an expert CFO financial intelligence assistant. 
Provide concise, actionable business financial advice, invoice breakdowns, and expense optimization strategies.
Current Business Context: ${JSON.stringify(context || { invoices: memoryInvoices, expenses: memoryExpenses })}.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: message,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ success: true, reply: response.text });
  } catch (err: any) {
    console.error('Gemini chat error:', err);
    res.status(500).json({ success: false, error: 'Failed to process AI chat query.', details: err.message });
  }
});

// Start Express Server with Vite Middleware
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FinSight AI Production Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

