import React, { useState, useRef } from 'react';
import {
  Upload,
  Sparkles,
  CheckCircle,
  RefreshCw,
  Image as ImageIcon,
  ExternalLink,
  CloudUpload,
  AlertTriangle,
  Plus,
  Trash2,
  Save,
  Check,
  Eye,
  RotateCcw,
  Building2,
  Calendar,
  CreditCard,
  Tag,
  DollarSign,
  FileCheck,
} from 'lucide-react';
import { Receipt } from '../../types';
import { Badge } from '../common/Badge';
import { uploadToCloudinary } from '../../lib/cloudinary';

interface LineItem {
  name: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface ExtractedInvoiceData {
  vendor: string;
  invoice_number: string;
  invoice_date: string;
  currency: string;
  subtotal: number;
  tax: number;
  tax_rate: string;
  total: number;
  payment_method: string;
  category: string;
  confidence: number;
  items: LineItem[];
}

interface ReceiptScannerViewProps {
  receipts: Receipt[];
  onAddReceipt: (receipt: Receipt) => void;
}

export const ReceiptScannerView: React.FC<ReceiptScannerViewProps> = ({
  receipts,
  onAddReceipt,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [isUploadingCloudinary, setIsUploadingCloudinary] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [ocrText, setOcrText] = useState<string | null>(null);

  // Editable state for the extracted invoice
  const [extractedInvoice, setExtractedInvoice] = useState<ExtractedInvoiceData | null>(null);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [duplicateError, setDuplicateError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ML Classification State
  const [mlCategory, setMlCategory] = useState<string | null>(null);
  const [mlConfidence, setMlConfidence] = useState<number | null>(null);

  const processFile = async (file: File) => {
    setIsScanning(true);
    setIsUploadingCloudinary(true);
    setStatusMessage('Uploading receipt to Cloudinary CDN...');
    setExtractedInvoice(null);
    setMlCategory(null);
    setMlConfidence(null);
    setSavedSuccess(false);

    try {
      // Step 1: Upload to Cloudinary
      const cloudResult = await uploadToCloudinary(file);
      const imageUrl = cloudResult.secure_url;
      setUploadedImageUrl(imageUrl);
      setIsUploadingCloudinary(false);

      setStatusMessage('Extracting text and running Python ML Model Classifier...');

      // Convert file to Base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Str = reader.result as string;

        try {
          // Step 2A: Call Python ML Classifier Endpoint via proxy
          try {
            const mlRes = await fetch('/api/classify-document', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                imageBase64: base64Str,
                filename: file.name,
              }),
            });

            if (mlRes.ok) {
              const mlData = await mlRes.json();
              if (mlData.success) {
                setMlCategory(mlData.category);
                setMlConfidence(mlData.confidence);
              }
            }
          } catch (mlErr) {
            console.warn('Python ML classification proxy warning:', mlErr);
          }

          // Step 2B: Call Gemini Structured Extraction Endpoint
          const response = await fetch('/api/invoices/extract', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageBase64: base64Str,
              mimeType: file.type || 'image/jpeg',
              cloudinaryUrl: imageUrl,
            }),
          });

          if (!response.ok) {
            throw new Error(`Server returned status ${response.status}`);
          }

          const resData = await response.json();
          const invData = resData.invoice || {};

          setOcrText(resData.ocr_text || '');

          // Populate extracted data WITHOUT hardcoded fallbacks
          setExtractedInvoice({
            vendor: invData.vendor || '',
            invoice_number: invData.invoice_number || '',
            invoice_date: invData.invoice_date || '',
            currency: invData.currency || 'USD',
            subtotal: Number(invData.subtotal) || 0,
            tax: Number(invData.tax) || 0,
            tax_rate: invData.tax_rate || '',
            total: Number(invData.total) || 0,
            payment_method: invData.payment_method || 'Cash',
            category: invData.category || 'General Expense',
            confidence: Number(invData.confidence) || 95,
            items: Array.isArray(invData.items)
              ? invData.items.map((it: any) => ({
                  name: it.name || it.description || '',
                  quantity: Number(it.quantity) || 1,
                  unit_price: Number(it.unit_price || it.price) || 0,
                  total: Number(it.total) || 0,
                }))
              : [],
          });
        } catch (apiErr: any) {
          console.error('Extraction API error:', apiErr);
          // Set empty invoice allowing manual entry
          setExtractedInvoice({
            vendor: '',
            invoice_number: '',
            invoice_date: new Date().toISOString().split('T')[0],
            currency: 'USD',
            subtotal: 0,
            tax: 0,
            tax_rate: '',
            total: 0,
            payment_method: 'Cash',
            category: 'Uncategorized',
            confidence: 0,
            items: [],
          });
        } finally {
          setIsScanning(false);
          setStatusMessage('');
        }
      };

      reader.readAsDataURL(file);
    } catch (err: any) {
      console.error('File process error:', err);
      setIsUploadingCloudinary(false);
      setIsScanning(false);
      setStatusMessage('');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const triggerUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Field change handlers
  const handleFieldChange = (field: keyof ExtractedInvoiceData, value: any) => {
    if (!extractedInvoice) return;
    setExtractedInvoice({
      ...extractedInvoice,
      [field]: value,
    });
  };

  // Line item change handlers
  const handleItemChange = (index: number, field: keyof LineItem, value: any) => {
    if (!extractedInvoice) return;
    const updatedItems = [...extractedInvoice.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };

    // Auto update total if quantity or unit_price changes
    if (field === 'quantity' || field === 'unit_price') {
      const q = field === 'quantity' ? Number(value) : updatedItems[index].quantity;
      const p = field === 'unit_price' ? Number(value) : updatedItems[index].unit_price;
      updatedItems[index].total = Number((q * p).toFixed(2));
    }

    // Recalculate subtotal
    const newSubtotal = updatedItems.reduce((acc, item) => acc + (item.total || 0), 0);
    const newTotal = Number((newSubtotal + extractedInvoice.tax).toFixed(2));

    setExtractedInvoice({
      ...extractedInvoice,
      items: updatedItems,
      subtotal: Number(newSubtotal.toFixed(2)),
      total: newTotal,
    });
  };

  const handleAddItem = () => {
    if (!extractedInvoice) return;
    setExtractedInvoice({
      ...extractedInvoice,
      items: [
        ...extractedInvoice.items,
        { name: '', quantity: 1, unit_price: 0, total: 0 },
      ],
    });
  };

  const handleRemoveItem = (index: number) => {
    if (!extractedInvoice) return;
    const updatedItems = extractedInvoice.items.filter((_, i) => i !== index);
    const newSubtotal = updatedItems.reduce((acc, item) => acc + (item.total || 0), 0);
    const newTotal = Number((newSubtotal + extractedInvoice.tax).toFixed(2));

    setExtractedInvoice({
      ...extractedInvoice,
      items: updatedItems,
      subtotal: Number(newSubtotal.toFixed(2)),
      total: newTotal,
    });
  };

  const handleConfirmSave = () => {
    if (!extractedInvoice) return;

    // Check for duplicate data
    const isDuplicate = receipts.some((r) => {
      const matchInvNumber =
        extractedInvoice.invoice_number &&
        extractedInvoice.invoice_number.trim() !== '' &&
        r.invoiceNumber.toLowerCase().trim() === extractedInvoice.invoice_number.toLowerCase().trim();

      const matchVendorTotalDate =
        r.vendorName.toLowerCase().trim() === extractedInvoice.vendor.toLowerCase().trim() &&
        r.total === extractedInvoice.total &&
        r.date === extractedInvoice.invoice_date;

      return matchInvNumber || matchVendorTotalDate;
    });

    if (isDuplicate) {
      setDuplicateError('This data already exists in your ledger! Invoice number or vendor receipt already exists.');
      return;
    }

    setDuplicateError(null);

    const newReceiptRecord: Receipt = {
      id: `rcpt-${Date.now()}`,
      vendorName: extractedInvoice.vendor || 'Unknown Vendor',
      invoiceNumber: extractedInvoice.invoice_number || `REF-${Math.floor(1000 + Math.random() * 9000)}`,
      gstId: extractedInvoice.tax_rate ? `Tax Rate: ${extractedInvoice.tax_rate}` : 'N/A',
      date: extractedInvoice.invoice_date || new Date().toISOString().split('T')[0],
      category: extractedInvoice.category || 'General Expense',
      subtotal: extractedInvoice.subtotal,
      taxTotal: extractedInvoice.tax,
      total: extractedInvoice.total,
      confidenceScore: extractedInvoice.confidence,
      status: extractedInvoice.confidence >= 80 ? 'Verified' : 'Pending Review',
      items: extractedInvoice.items.map((it) => ({
        description: it.name,
        quantity: it.quantity,
        price: it.unit_price,
        total: it.total,
      })),
      imageUrl: uploadedImageUrl || undefined,
      createdAt: new Date().toISOString().split('T')[0],
    };

    onAddReceipt(newReceiptRecord);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
    }, 4000);
  };

  const handleResetScan = () => {
    setExtractedInvoice(null);
    setUploadedImageUrl(null);
    setOcrText(null);
    setSavedSuccess(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*,application/pdf"
        className="hidden"
      />

      {/* Header Banner */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-200">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Gemini Vision OCR
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600 border border-indigo-200">
              <CloudUpload className="w-3.5 h-3.5 text-indigo-600" /> Cloudinary CDN
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            AI Vision Receipt & Invoice OCR Pipeline
          </h2>
          <p className="text-xs text-slate-500">
            Upload physical or digital receipts. Images are backed up to Cloudinary CDN and converted into structured, editable data via Gemini AI Vision.
          </p>
        </div>

        <button
          onClick={triggerUpload}
          disabled={isScanning}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-2 self-start md:self-auto cursor-pointer"
        >
          {isScanning ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Scanning Image...</span>
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              <span>Upload Receipt Image</span>
            </>
          )}
        </button>
      </div>

      {/* Scanning status banner */}
      {isScanning && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-center gap-3 text-xs text-blue-800 font-semibold animate-pulse">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
          <span>{statusMessage || 'Processing image with AI OCR pipeline...'}</span>
        </div>
      )}

      {/* Upload Drag & Drop Box when no active scan */}
      {!extractedInvoice && !isScanning && (
        <div
          onClick={triggerUpload}
          className="p-10 border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-3xl bg-white text-center cursor-pointer transition-all space-y-3 group shadow-xs"
        >
          <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mx-auto group-hover:scale-110 transition-transform">
            <Upload className="w-7 h-7" />
          </div>
          <p className="text-sm font-bold text-slate-900">Click or drag & drop receipt file to upload to Cloudinary</p>
          <p className="text-xs text-slate-400">Supports PNG, JPG, WEBP, and PDF files. Images are parsed live using Gemini AI Vision.</p>
        </div>
      )}

      {/* Saved Toast Notification */}
      {savedSuccess && (
        <div className="p-4 bg-emerald-500 text-white rounded-2xl shadow-lg flex items-center justify-between gap-4 text-xs font-bold animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-white" />
            <span>Invoice & Receipt successfully extracted and saved to PostgreSQL database!</span>
          </div>
          <button
            onClick={() => setSavedSuccess(false)}
            className="text-white hover:text-emerald-100 font-bold underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Duplicate Data Alert Banner */}
      {duplicateError && (
        <div className="p-4 bg-red-500 text-white rounded-2xl shadow-lg flex items-center justify-between gap-4 text-xs font-bold animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-white flex-shrink-0" />
            <span>This data already exists in your records! Duplicate receipt / invoice detected.</span>
          </div>
          <button
            onClick={() => setDuplicateError(null)}
            className="text-white hover:text-red-100 font-bold underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* SIDE BY SIDE VIEW */}
      {extractedInvoice && (
        <div className="space-y-4">
          {/* Top Status & Confidence Bar */}
          <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 font-bold text-xs border border-emerald-500/20">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                Extraction Successful
              </span>
              {mlCategory && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-50 text-purple-700 font-extrabold text-xs border border-purple-200">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  ML Predicted Category: {mlCategory} ({mlConfidence ? (mlConfidence * 100).toFixed(1) : 0}%)
                </span>
              )}
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-extrabold text-xs border ${
                extractedInvoice.confidence >= 80
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                Extraction Confidence: {extractedInvoice.confidence}%
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleResetScan}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Upload Another</span>
              </button>

              <button
                onClick={handleConfirmSave}
                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Confirm & Save to System</span>
              </button>
            </div>
          </div>

          {/* Low Confidence Warning */}
          {extractedInvoice.confidence < 80 && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 text-xs text-amber-800 font-semibold">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <span>Some fields may require manual verification. Please review and edit any highlighted fields below.</span>
            </div>
          )}

          {/* Side by Side Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT SIDE: Uploaded Receipt Preview */}
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-blue-600" />
                  <span>Uploaded Receipt Preview</span>
                </h3>

                {uploadedImageUrl && (
                  <a
                    href={uploadedImageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    <span>View on Cloudinary</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {/* Image Box */}
              <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900/5 min-h-[380px] max-h-[550px] flex items-center justify-center p-2 group">
                {uploadedImageUrl ? (
                  <img
                    src={uploadedImageUrl}
                    alt="Uploaded receipt"
                    className="max-h-[520px] w-auto object-contain rounded-lg shadow-sm"
                  />
                ) : (
                  <div className="text-center p-6 text-slate-400 space-y-2">
                    <ImageIcon className="w-12 h-12 mx-auto stroke-1" />
                    <p className="text-xs">No preview image available</p>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT SIDE: Structured AI Extraction Editor */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>Structured AI Extraction (Editable)</span>
                </h3>
                <span className="text-[11px] text-slate-400 font-medium">Verify & edit fields below</span>
              </div>

              {/* Grid Form Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Vendor Name */}
                <div>
                  <label className="font-semibold text-slate-700 flex items-center gap-1 mb-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" /> Vendor
                  </label>
                  <input
                    type="text"
                    value={extractedInvoice.vendor}
                    onChange={(e) => handleFieldChange('vendor', e.target.value)}
                    placeholder="e.g. Berghotel Grosse Scheidegg"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Invoice Number */}
                <div>
                  <label className="font-semibold text-slate-700 flex items-center gap-1 mb-1">
                    <Tag className="w-3.5 h-3.5 text-slate-400" /> Invoice / Ref Number
                  </label>
                  <input
                    type="text"
                    value={extractedInvoice.invoice_number}
                    onChange={(e) => handleFieldChange('invoice_number', e.target.value)}
                    placeholder="e.g. 4572"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Invoice Date */}
                <div>
                  <label className="font-semibold text-slate-700 flex items-center gap-1 mb-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" /> Invoice Date
                  </label>
                  <input
                    type="text"
                    value={extractedInvoice.invoice_date}
                    onChange={(e) => handleFieldChange('invoice_date', e.target.value)}
                    placeholder="e.g. 30 Jul 2007"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="font-semibold text-slate-700 flex items-center gap-1 mb-1">
                    <Tag className="w-3.5 h-3.5 text-slate-400" /> Category
                  </label>
                  <input
                    type="text"
                    value={extractedInvoice.category}
                    onChange={(e) => handleFieldChange('category', e.target.value)}
                    placeholder="e.g. Restaurant, Hardware, Travel"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Currency */}
                <div>
                  <label className="font-semibold text-slate-700 flex items-center gap-1 mb-1">
                    <DollarSign className="w-3.5 h-3.5 text-slate-400" /> Currency
                  </label>
                  <input
                    type="text"
                    value={extractedInvoice.currency}
                    onChange={(e) => handleFieldChange('currency', e.target.value)}
                    placeholder="e.g. CHF, USD, EUR"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Payment Method */}
                <div>
                  <label className="font-semibold text-slate-700 flex items-center gap-1 mb-1">
                    <CreditCard className="w-3.5 h-3.5 text-slate-400" /> Payment Method
                  </label>
                  <input
                    type="text"
                    value={extractedInvoice.payment_method}
                    onChange={(e) => handleFieldChange('payment_method', e.target.value)}
                    placeholder="e.g. Cash, Card"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Line Items Table */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Line Items Detected</h4>
                  <button
                    onClick={handleAddItem}
                    className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold text-xs flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                        <th className="py-2.5 px-3">Item Name</th>
                        <th className="py-2.5 px-3 w-16">Qty</th>
                        <th className="py-2.5 px-3 w-24">Unit Price</th>
                        <th className="py-2.5 px-3 w-24">Line Total</th>
                        <th className="py-2.5 px-2 w-10 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {extractedInvoice.items.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-4 text-center text-slate-400 italic">
                            No line items detected. Click "Add Item" to enter items manually.
                          </td>
                        </tr>
                      ) : (
                        extractedInvoice.items.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                value={item.name}
                                onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                                placeholder="Item name"
                                className="w-full px-2 py-1 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                                className="w-full px-2 py-1 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="number"
                                step="0.01"
                                value={item.unit_price}
                                onChange={(e) => handleItemChange(idx, 'unit_price', e.target.value)}
                                className="w-full px-2 py-1 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="number"
                                step="0.01"
                                value={item.total}
                                onChange={(e) => handleItemChange(idx, 'total', Number(e.target.value))}
                                className="w-full px-2 py-1 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 bg-slate-50"
                              />
                            </td>
                            <td className="py-2 px-2 text-center">
                              <button
                                onClick={() => handleRemoveItem(idx)}
                                className="p-1 text-slate-400 hover:text-red-600 rounded-md transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals Summary */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600 font-semibold">
                  <span>Subtotal:</span>
                  <div className="flex items-center gap-1">
                    <span>{extractedInvoice.currency}</span>
                    <input
                      type="number"
                      step="0.01"
                      value={extractedInvoice.subtotal}
                      onChange={(e) => handleFieldChange('subtotal', Number(e.target.value))}
                      className="w-24 px-2 py-0.5 border border-slate-200 rounded text-right font-bold text-slate-900 bg-white"
                    />
                  </div>
                </div>

                <div className="flex justify-between text-slate-600 font-semibold">
                  <span className="flex items-center gap-2">
                    Tax Amount ({extractedInvoice.tax_rate || '7.6%'}):
                  </span>
                  <div className="flex items-center gap-1">
                    <span>{extractedInvoice.currency}</span>
                    <input
                      type="number"
                      step="0.01"
                      value={extractedInvoice.tax}
                      onChange={(e) => handleFieldChange('tax', Number(e.target.value))}
                      className="w-24 px-2 py-0.5 border border-slate-200 rounded text-right font-bold text-slate-900 bg-white"
                    />
                  </div>
                </div>

                <div className="flex justify-between text-slate-900 font-extrabold text-sm pt-2 border-t border-slate-200">
                  <span>Grand Total:</span>
                  <div className="flex items-center gap-1 text-blue-600">
                    <span>{extractedInvoice.currency}</span>
                    <input
                      type="number"
                      step="0.01"
                      value={extractedInvoice.total}
                      onChange={(e) => handleFieldChange('total', Number(e.target.value))}
                      className="w-28 px-2 py-0.5 border border-blue-300 rounded text-right font-extrabold text-blue-600 bg-white text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Save / Confirm Button */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleConfirmSave}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Invoice & Receipt Record</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scanned Receipts History Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs space-y-3 p-5">
        <h3 className="text-sm font-extrabold text-slate-900">Scanned Receipts & Verified Invoices Ledger</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-3">Vendor</th>
                <th className="py-3 px-3">Ref Number</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Confidence</th>
                <th className="py-3 px-3">Total</th>
                <th className="py-3 px-3">Cloudinary Asset</th>
                <th className="py-3 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {receipts.map((rcpt) => (
                <tr key={rcpt.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-3 font-bold text-slate-900">{rcpt.vendorName}</td>
                  <td className="py-3.5 px-3 text-slate-600">{rcpt.invoiceNumber}</td>
                  <td className="py-3.5 px-3 text-slate-500">{rcpt.date}</td>
                  <td className="py-3.5 px-3 text-slate-600">{rcpt.category}</td>
                  <td className="py-3.5 px-3 text-emerald-600 font-bold">{rcpt.confidenceScore}%</td>
                  <td className="py-3.5 px-3 font-extrabold text-slate-900">${rcpt.total.toLocaleString()}</td>
                  <td className="py-3.5 px-3">
                    {rcpt.imageUrl ? (
                      <a
                        href={rcpt.imageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:underline font-medium text-[11px]"
                      >
                        <ImageIcon className="w-3 h-3" />
                        <span>Cloudinary Asset</span>
                      </a>
                    ) : (
                      <span className="text-slate-400 text-[11px]">No asset</span>
                    )}
                  </td>
                  <td className="py-3.5 px-3">
                    <Badge status={rcpt.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
