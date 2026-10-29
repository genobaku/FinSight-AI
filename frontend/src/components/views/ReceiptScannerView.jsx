import React, { useState, useRef } from 'react';
import {
  Upload,
  Sparkles,
  CheckCircle,
  RefreshCw,
  Image as ImageIcon,
  ExternalLink,
  AlertTriangle,
  Plus,
  Trash2,
  Save,
  Check,
  Eye,
  EyeOff,
  RotateCcw,
  Building2,
  Calendar,
  CreditCard,
  Tag,
  DollarSign,
  FileCheck,
  AlertCircle,
  FileText,
  Download,
  Layers,
  Table as TableIcon,
  Hash,
  Type,
  CheckSquare,
  XCircle,
  Edit3
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { isSupabaseConfigured } from '../../lib/supabase';
import { saveSupabaseReceipt } from '../../lib/supabaseService';

const ALLOWED_EXTENSIONS = [
  '.pdf', '.png', '.jpg', '.jpeg', '.webp',
  '.docx', '.csv', '.tsv', '.xlsx', '.xls',
  '.txt', '.json', '.sql'
];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

const DATA_TYPES = ['text', 'currency', 'decimal', 'integer', 'date', 'boolean'];
const SEMANTIC_CATEGORIES = [
  'merchant', 'financial_total', 'subtotal', 'tax', 'tax_rate',
  'date', 'identifier', 'identity', 'education', 'healthcare',
  'metric', 'status', 'currency', 'general'
];

export const ReceiptScannerView = ({
  receipts = [],
  onAddReceipt
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);

  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState(null);
  const [uploadedFileType, setUploadedFileType] = useState(null);
  const [ocrText, setOcrText] = useState(null);

  // Dynamic Document Intelligence State
  const [dynamicDoc, setDynamicDoc] = useState(null);
  const [extractionSuccess, setExtractionSuccess] = useState(false);
  const [activeEvidenceFieldId, setActiveEvidenceFieldId] = useState(null);
  const [saveFeedback, setSaveFeedback] = useState(null);
  const [duplicateError, setDuplicateError] = useState(null);

  const fileInputRef = useRef(null);

  const processFile = async (file) => {
    // 1. Client-Side Validation
    setErrorMessage(null);
    setDuplicateError(null);
    setSaveFeedback(null);
    setActiveEvidenceFieldId(null);

    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setErrorMessage(`Unsupported file format '${ext}'. Allowed formats: PDF, PNG, JPG, JPEG, WEBP, DOCX, CSV, XLSX, TXT, JSON, SQL.`);
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMessage('File size exceeds maximum allowed limit of 10 MB.');
      return;
    }

    setIsScanning(true);
    setStatusMessage('Reading file and preparing for universal document understanding...');
    setDynamicDoc(null);
    setExtractionSuccess(false);
    setUploadedFileName(file.name);
    setUploadedFileType(ext.slice(1));

    // Create local object URL for preview if image or PDF
    if (['.png', '.jpg', '.jpeg', '.webp'].includes(ext)) {
      const localPreviewUrl = URL.createObjectURL(file);
      setUploadedImageUrl(localPreviewUrl);
    } else {
      setUploadedImageUrl(null);
    }

    try {
      // 2. Read File as Base64 Data URL
      const base64Str = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      setStatusMessage('Analyzing document structure, discovering dynamic fields & extracting content...');

      // 3. Send to Backend Endpoint POST /api/classify-document
      const response = await fetch('/api/classify-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Str,
          filename: file.name
        })
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        throw new Error(resData.error || resData.message || `Document processing failed (HTTP ${response.status})`);
      }

      // 4. Successful Backend Extraction: Populate dynamic schema
      setExtractionSuccess(true);
      setOcrText(resData.full_extracted_text || resData.raw_text || resData.extracted_text || '');

      // Normalize dynamic fields with local editing attributes
      const rawFields = Array.isArray(resData.fields) ? resData.fields : [];
      const normalizedFields = rawFields.map((f, idx) => ({
        id: f.id || `field-${idx + 1}`,
        label: f.label || `Field ${idx + 1}`,
        value: f.value !== undefined ? f.value : '',
        original_value: f.value !== undefined ? f.value : '',
        data_type: f.data_type || 'text',
        semantic_category: f.semantic_category || 'general',
        source_evidence: f.source_evidence || null,
        confidence: f.confidence !== undefined ? f.confidence : null,
        verification_status: f.verification_status || 'pending',
        is_user_modified: false
      }));

      // Normalize tables
      const rawTables = Array.isArray(resData.tables) ? resData.tables : [];
      const normalizedTables = rawTables.map((t, tIdx) => ({
        id: t.id || `table-${tIdx + 1}`,
        title: t.title || `Table ${tIdx + 1}`,
        headers: Array.isArray(t.headers) ? t.headers : [],
        rows: Array.isArray(t.rows) ? t.rows : [],
        source_evidence: t.source_evidence || null
      }));

      setDynamicDoc({
        document_type: resData.document_type || 'general_document',
        domain: resData.domain || 'general',
        fields: normalizedFields,
        tables: normalizedTables,
        warnings: Array.isArray(resData.warnings) ? resData.warnings : [],
        extraction_status: resData.extraction_status || 'needs_review',
        metadata: resData.metadata || {},
        raw_text: resData.raw_text || resData.full_extracted_text || '',
        confidence: resData.confidence != null ? resData.confidence : null
      });

      // Background upload to Cloudinary if image
      if (['.png', '.jpg', '.jpeg', '.webp'].includes(ext)) {
        uploadToCloudinary(file).then((cloudResult) => {
          if (cloudResult && cloudResult.secure_url) {
            setUploadedImageUrl(cloudResult.secure_url);
          }
        }).catch(() => {});
      }

    } catch (err) {
      console.error('Document processing error:', err);
      setErrorMessage(err.message || 'An unexpected error occurred while processing the document.');
      setExtractionSuccess(false);
      setDynamicDoc(null);
    } finally {
      setIsScanning(false);
      setStatusMessage('');
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const triggerUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // ==========================================
  // DYNAMIC FIELD HANDLERS
  // ==========================================

  const handleFieldLabelChange = (fieldId, newLabel) => {
    if (!dynamicDoc) return;
    setDynamicDoc({
      ...dynamicDoc,
      fields: dynamicDoc.fields.map((f) =>
        f.id === fieldId ? { ...f, label: newLabel, is_user_modified: true } : f
      )
    });
  };

  const handleFieldValueChange = (fieldId, newValue) => {
    if (!dynamicDoc) return;
    setDynamicDoc({
      ...dynamicDoc,
      fields: dynamicDoc.fields.map((f) => {
        if (f.id === fieldId) {
          return {
            ...f,
            value: newValue,
            is_user_modified: true,
            verification_status: 'user_modified'
          };
        }
        return f;
      })
    });
  };

  const handleFieldTypeChange = (fieldId, newType) => {
    if (!dynamicDoc) return;
    setDynamicDoc({
      ...dynamicDoc,
      fields: dynamicDoc.fields.map((f) =>
        f.id === fieldId ? { ...f, data_type: newType, is_user_modified: true } : f
      )
    });
  };

  const handleFieldCategoryChange = (fieldId, newCat) => {
    if (!dynamicDoc) return;
    setDynamicDoc({
      ...dynamicDoc,
      fields: dynamicDoc.fields.map((f) =>
        f.id === fieldId ? { ...f, semantic_category: newCat, is_user_modified: true } : f
      )
    });
  };

  const handleFieldStatusToggle = (fieldId) => {
    if (!dynamicDoc) return;
    setDynamicDoc({
      ...dynamicDoc,
      fields: dynamicDoc.fields.map((f) => {
        if (f.id === fieldId) {
          const nextStatus =
            f.verification_status === 'verified'
              ? 'rejected'
              : f.verification_status === 'rejected'
              ? 'pending'
              : 'verified';
          return { ...f, verification_status: nextStatus };
        }
        return f;
      })
    });
  };

  const handleFieldRevert = (fieldId) => {
    if (!dynamicDoc) return;
    setDynamicDoc({
      ...dynamicDoc,
      fields: dynamicDoc.fields.map((f) =>
        f.id === fieldId
          ? {
              ...f,
              value: f.original_value,
              is_user_modified: false,
              verification_status: 'pending'
            }
          : f
      )
    });
  };

  const handleFieldDelete = (fieldId) => {
    if (!dynamicDoc) return;
    setDynamicDoc({
      ...dynamicDoc,
      fields: dynamicDoc.fields.filter((f) => f.id !== fieldId)
    });
    if (activeEvidenceFieldId === fieldId) {
      setActiveEvidenceFieldId(null);
    }
  };

  const handleAddCustomField = () => {
    if (!dynamicDoc) return;
    const newId = `field-user-${Date.now()}`;
    const newField = {
      id: newId,
      label: 'New Field',
      value: '',
      original_value: '',
      data_type: 'text',
      semantic_category: 'general',
      source_evidence: null,
      confidence: 1.0,
      verification_status: 'verified',
      is_user_modified: true
    };
    setDynamicDoc({
      ...dynamicDoc,
      fields: [...dynamicDoc.fields, newField]
    });
  };

  // ==========================================
  // DYNAMIC TABLE HANDLERS
  // ==========================================

  const handleTableCellChange = (tableId, rowIndex, colIndex, value) => {
    if (!dynamicDoc) return;
    setDynamicDoc({
      ...dynamicDoc,
      tables: dynamicDoc.tables.map((t) => {
        if (t.id === tableId) {
          const newRows = t.rows.map((row, rIdx) => {
            if (rIdx === rowIndex) {
              const updatedRow = [...row];
              updatedRow[colIndex] = value;
              return updatedRow;
            }
            return row;
          });
          return { ...t, rows: newRows };
        }
        return t;
      })
    });
  };

  const handleAddTableRow = (tableId) => {
    if (!dynamicDoc) return;
    setDynamicDoc({
      ...dynamicDoc,
      tables: dynamicDoc.tables.map((t) => {
        if (t.id === tableId) {
          const emptyRow = new Array(t.headers.length).fill('');
          return { ...t, rows: [...t.rows, emptyRow] };
        }
        return t;
      })
    });
  };

  const handleDeleteTableRow = (tableId, rowIndex) => {
    if (!dynamicDoc) return;
    setDynamicDoc({
      ...dynamicDoc,
      tables: dynamicDoc.tables.map((t) => {
        if (t.id === tableId) {
          return { ...t, rows: t.rows.filter((_, idx) => idx !== rowIndex) };
        }
        return t;
      })
    });
  };

  // ==========================================
  // EXPORT HANDLERS (JSON, CSV, XLSX)
  // ==========================================

  const handleExportJSON = () => {
    if (!dynamicDoc) return;
    const exportData = {
      document_type: dynamicDoc.document_type,
      domain: dynamicDoc.domain,
      extraction_status: dynamicDoc.extraction_status,
      fields: dynamicDoc.fields.map((f) => ({
        id: f.id,
        label: f.label,
        value: f.value,
        data_type: f.data_type,
        semantic_category: f.semantic_category,
        verification_status: f.verification_status,
        confidence: f.confidence
      })),
      tables: dynamicDoc.tables,
      warnings: dynamicDoc.warnings,
      metadata: dynamicDoc.metadata,
      exported_at: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${uploadedFileName || 'document'}_extracted.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    if (!dynamicDoc) return;
    let csvContent = 'data:text/csv;charset=utf-8,';

    // 1. Export Fields Section
    csvContent += '=== DOCUMENT FIELDS ===\r\n';
    csvContent += 'Label,Value,Type,Category,Status\r\n';
    dynamicDoc.fields.forEach((f) => {
      const valStr = typeof f.value === 'object' ? JSON.stringify(f.value) : String(f.value || '');
      csvContent += `"${f.label}","${valStr.replace(/"/g, '""')}","${f.data_type}","${f.semantic_category}","${f.verification_status}"\r\n`;
    });

    // 2. Export Tables Section
    dynamicDoc.tables.forEach((t) => {
      csvContent += `\r\n=== TABLE: ${t.title} ===\r\n`;
      csvContent += t.headers.map((h) => `"${h}"`).join(',') + '\r\n';
      t.rows.forEach((row) => {
        csvContent += row.map((cell) => `"${String(cell || '').replace(/"/g, '""')}"`).join(',') + '\r\n';
      });
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${uploadedFileName || 'document'}_extracted.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ==========================================
  // SAVE TO LEDGER & SUPABASE
  // ==========================================

  const handleConfirmSave = async () => {
    if (!dynamicDoc) return;

    // Discover values for backwards-compatible ledger storage
    const getFieldVal = (predicate) => {
      const match = dynamicDoc.fields.find(predicate);
      return match ? match.value : null;
    };

    const vendorName =
      getFieldVal((f) => f.semantic_category === 'merchant') ||
      getFieldVal((f) => ['merchant', 'vendor', 'store', 'company', 'organization'].includes(f.label.toLowerCase())) ||
      'Unknown Entity';

    const invoiceNumber =
      getFieldVal((f) => f.semantic_category === 'invoice_number' || f.semantic_category === 'identifier') ||
      getFieldVal((f) => f.label.toLowerCase().includes('invoice') || f.label.toLowerCase().includes('ref')) ||
      `DOC-${Math.floor(1000 + Math.random() * 9000)}`;

    const dateVal =
      getFieldVal((f) => f.semantic_category === 'date') ||
      new Date().toISOString().split('T')[0];

    const totalVal =
      Number(getFieldVal((f) => f.semantic_category === 'financial_total')) ||
      Number(getFieldVal((f) => f.label.toLowerCase().includes('total'))) ||
      0;

    const subtotalVal =
      Number(getFieldVal((f) => f.semantic_category === 'subtotal')) || 0;

    const taxVal =
      Number(getFieldVal((f) => f.semantic_category === 'tax')) || 0;

    // Check duplicate in ledger
    const isDuplicate = receipts.some((r) => {
      const matchInv =
        invoiceNumber &&
        r.invoiceNumber &&
        r.invoiceNumber.toLowerCase().trim() === String(invoiceNumber).toLowerCase().trim();
      const matchDetails =
        r.vendorName &&
        r.vendorName.toLowerCase().trim() === String(vendorName).toLowerCase().trim() &&
        r.total === totalVal &&
        r.date === dateVal;
      return matchInv || matchDetails;
    });

    if (isDuplicate) {
      setDuplicateError('A record with identical reference number or merchant/date/total already exists in your ledger.');
      return;
    }
    setDuplicateError(null);

    // Build items from first table if available
    const items = [];
    if (dynamicDoc.tables.length > 0) {
      const t = dynamicDoc.tables[0];
      t.rows.forEach((row) => {
        items.push({
          description: String(row[0] || 'Item'),
          quantity: Number(row[1]) || 1,
          price: Number(row[2]) || 0,
          total: Number(row[3]) || (Number(row[1]) || 1) * (Number(row[2]) || 0)
        });
      });
    }

    const newRecord = {
      id: `doc-${Date.now()}`,
      vendorName: String(vendorName),
      invoiceNumber: String(invoiceNumber),
      date: String(dateVal),
      category: dynamicDoc.domain.charAt(0).toUpperCase() + dynamicDoc.domain.slice(1),
      subtotal: subtotalVal,
      taxTotal: taxVal,
      total: totalVal,
      confidenceScore: dynamicDoc.confidence != null ? Math.round(dynamicDoc.confidence * 100) : 85,
      status: 'Verified',
      items: items,
      imageUrl: uploadedImageUrl || undefined,
      createdAt: new Date().toISOString().split('T')[0],
      // Store complete dynamic fields schema to prevent loss of custom/unfamiliar attributes
      dynamic_data: {
        document_type: dynamicDoc.document_type,
        domain: dynamicDoc.domain,
        fields: dynamicDoc.fields,
        tables: dynamicDoc.tables,
        warnings: dynamicDoc.warnings,
        metadata: dynamicDoc.metadata
      }
    };

    onAddReceipt(newRecord);

    // Persist to Supabase if configured
    if (isSupabaseConfigured()) {
      try {
        const saved = await saveSupabaseReceipt(newRecord);
        if (saved) {
          setSaveFeedback({
            type: 'success',
            message: 'Document record & dynamic fields successfully saved to Supabase cloud database!'
          });
        } else {
          setSaveFeedback({
            type: 'warning',
            message: 'Record saved to local session ledger, but Supabase persistence failed. Data preserved locally.'
          });
        }
      } catch (dbErr) {
        setSaveFeedback({
          type: 'warning',
          message: `Saved locally. Cloud persistence note: ${dbErr.message}`
        });
      }
    } else {
      setSaveFeedback({
        type: 'success',
        message: 'Document record & discovered fields verified and saved to local session ledger.'
      });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={ALLOWED_EXTENSIONS.join(',')}
        className="hidden"
      />

      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            <span>Universal Document Intelligence & Dynamic Extraction</span>
          </h2>
          <p className="text-xs text-slate-500">
            Ingest receipts, invoices, academic records, reports, spreadsheets, and Word documents. Schemas and fields are discovered dynamically.
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
              <span>Analyzing Document...</span>
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              <span>Upload Document</span>
            </>
          )}
        </button>
      </div>

      {/* Scanning status banner */}
      {isScanning && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-center gap-3 text-xs text-blue-800 font-semibold animate-pulse">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
          <span>{statusMessage || 'Processing document with universal intelligence engine...'}</span>
        </div>
      )}

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl shadow-xs flex items-center justify-between gap-4 text-xs font-bold animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-red-700 hover:text-red-900 font-bold underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Save Feedback Banner */}
      {saveFeedback && (
        <div
          className={`p-4 rounded-2xl shadow-xs flex items-center justify-between gap-4 text-xs font-bold animate-in fade-in border ${
            saveFeedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-amber-50 text-amber-800 border-amber-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {saveFeedback.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            )}
            <span>{saveFeedback.message}</span>
          </div>
          <button
            onClick={() => setSaveFeedback(null)}
            className="font-bold underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Duplicate Error Banner */}
      {duplicateError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl shadow-xs flex items-center justify-between gap-4 text-xs font-bold animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <span>{duplicateError}</span>
          </div>
          <button
            onClick={() => setDuplicateError(null)}
            className="text-red-700 hover:text-red-900 font-bold underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Empty State Drag & Drop Box */}
      {!dynamicDoc && !isScanning && (
        <div
          onClick={triggerUpload}
          className="p-12 border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-3xl bg-white text-center cursor-pointer transition-all space-y-3 group shadow-xs"
        >
          <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mx-auto group-hover:scale-110 transition-transform">
            <Upload className="w-8 h-8" />
          </div>
          <p className="text-base font-bold text-slate-900">Upload any document for dynamic schema extraction</p>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Supports PDF, PNG, JPG, JPEG, WEBP, Word (.docx), Excel (.xlsx), CSV, Text, JSON, and SQL files up to 10 MB.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-[11px] font-mono">Receipts & Invoices</span>
            <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-[11px] font-mono">Academic Records</span>
            <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-[11px] font-mono">Business Reports</span>
            <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-[11px] font-mono">Spreadsheets</span>
            <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-[11px] font-mono">Identity IDs</span>
          </div>
        </div>
      )}

      {/* MAIN REVIEW INTERFACE: Renders when backend dynamicDoc is loaded */}
      {dynamicDoc && extractionSuccess && (
        <div className="space-y-5">
          {/* Top Classification & Quality Bar */}
          <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                Discovered Schema
              </span>

              {/* Document Type Badge */}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 text-blue-700 font-extrabold text-xs border border-blue-200 uppercase tracking-wide">
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                Type: {dynamicDoc.document_type.replace('_', ' ')}
              </span>

              {/* Domain Badge */}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-50 text-purple-700 font-extrabold text-xs border border-purple-200 uppercase tracking-wide">
                <Tag className="w-3.5 h-3.5 text-purple-600" />
                Domain: {dynamicDoc.domain}
              </span>

              {/* Fields Count Badge */}
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
                <Hash className="w-3.5 h-3.5 text-slate-500" />
                {dynamicDoc.fields.length} Fields Discovered
              </span>
            </div>

            {/* Export Actions Bar */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportJSON}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Download full validated dynamic JSON schema"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </button>

              <button
                onClick={handleExportCSV}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Download extracted data as CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Warnings Alert Box */}
          {dynamicDoc.warnings && dynamicDoc.warnings.length > 0 && (
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl shadow-xs space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-extrabold text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Document Warnings & Reconciliation Notes</span>
              </div>
              <ul className="text-xs text-amber-800 space-y-1 pl-6 list-disc">
                {dynamicDoc.warnings.map((warn, wIdx) => (
                  <li key={wIdx}>{warn}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Side by Side Grid: Preview (Left) & Dynamic Form (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT SIDE: Document Preview & Metadata */}
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-slate-500" />
                  <span>Document Source</span>
                </span>
                <span className="text-[11px] font-mono text-slate-400 truncate max-w-[200px]" title={uploadedFileName}>
                  {uploadedFileName}
                </span>
              </div>

              {/* Preview Rendering */}
              <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center min-h-[300px]">
                {uploadedImageUrl ? (
                  <img
                    src={uploadedImageUrl}
                    alt="Document Preview"
                    className="w-full h-auto max-h-[500px] object-contain rounded-xl"
                  />
                ) : (
                  <div className="p-8 text-center space-y-2">
                    <FileText className="w-12 h-12 text-slate-400 mx-auto" />
                    <p className="text-xs font-bold text-slate-700">{uploadedFileName}</p>
                    <p className="text-[11px] text-slate-400 uppercase font-mono">
                      {uploadedFileType || 'Document'} Format Parsed
                    </p>
                  </div>
                )}
              </div>

              {/* Raw OCR Text Collapsible Drawer */}
              {ocrText && (
                <details className="text-xs group border border-slate-200 rounded-xl p-3 bg-slate-50">
                  <summary className="font-bold text-slate-700 cursor-pointer list-none flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      View Raw Document Text
                    </span>
                    <span className="text-blue-600 text-[11px]">Toggle</span>
                  </summary>
                  <pre className="mt-2 p-2.5 bg-white border border-slate-200 rounded-lg text-[11px] font-mono text-slate-700 whitespace-pre-wrap max-h-48 overflow-y-auto">
                    {ocrText}
                  </pre>
                </details>
              )}
            </div>

            {/* RIGHT SIDE: Dynamic Semantic Fields & Tables Editor */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-6">
              {/* Dynamic Fields Section Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span>Discovered Dynamic Fields</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">All fields are editable, renamable, and extensible.</p>
                </div>

                <button
                  onClick={handleAddCustomField}
                  className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Field</span>
                </button>
              </div>

              {/* Dynamic Fields List */}
              <div className="space-y-3">
                {dynamicDoc.fields.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-4 text-center">
                    No discrete key-value fields detected. Click "Add Field" to add custom attributes.
                  </p>
                ) : (
                  dynamicDoc.fields.map((f) => {
                    const isEvidenceOpen = activeEvidenceFieldId === f.id;
                    const hasSourceEvidence = f.source_evidence && f.source_evidence.text;

                    return (
                      <div
                        key={f.id}
                        className={`p-3.5 rounded-xl border transition-all ${
                          f.verification_status === 'verified'
                            ? 'bg-white border-slate-200 hover:border-slate-300'
                            : f.verification_status === 'rejected'
                            ? 'bg-red-50/40 border-red-200'
                            : f.is_user_modified
                            ? 'bg-blue-50/30 border-blue-200'
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        {/* Top Metadata Row: Label, Type, Category, Actions */}
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          {/* Editable Label */}
                          <div className="flex items-center gap-1.5 flex-1 min-w-[140px]">
                            <Edit3 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <input
                              type="text"
                              value={f.label}
                              onChange={(e) => handleFieldLabelChange(f.id, e.target.value)}
                              className="font-bold text-xs text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none w-full"
                              placeholder="Field Label"
                            />
                          </div>

                          {/* Controls & Badges */}
                          <div className="flex items-center gap-2">
                            {/* Semantic Category Selector */}
                            <select
                              value={f.semantic_category}
                              onChange={(e) => handleFieldCategoryChange(f.id, e.target.value)}
                              className="text-[11px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 border-none rounded-md px-2 py-0.5 focus:outline-none cursor-pointer"
                            >
                              {SEMANTIC_CATEGORIES.map((cat) => (
                                <option key={cat} value={cat}>
                                  {cat.replace('_', ' ')}
                                </option>
                              ))}
                            </select>

                            {/* Data Type Selector */}
                            <select
                              value={f.data_type}
                              onChange={(e) => handleFieldTypeChange(f.id, e.target.value)}
                              className="text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border-none rounded-md px-2 py-0.5 focus:outline-none cursor-pointer"
                            >
                              {DATA_TYPES.map((dt) => (
                                <option key={dt} value={dt}>
                                  {dt}
                                </option>
                              ))}
                            </select>

                            {/* Verification Status Badge (Click to toggle) */}
                            <button
                              onClick={() => handleFieldStatusToggle(f.id)}
                              className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md cursor-pointer transition-colors ${
                                f.verification_status === 'verified'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : f.verification_status === 'rejected'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                              title="Click to toggle status: Verified / Rejected / Pending"
                            >
                              {f.verification_status}
                            </button>

                            {/* View Source Evidence Toggle */}
                            {hasSourceEvidence && (
                              <button
                                onClick={() => setActiveEvidenceFieldId(isEvidenceOpen ? null : f.id)}
                                className={`p-1 rounded-md transition-colors cursor-pointer ${
                                  isEvidenceOpen ? 'bg-blue-100 text-blue-700' : 'text-slate-400 hover:text-slate-600'
                                }`}
                                title="Inspect extracted source text snippet"
                              >
                                {isEvidenceOpen ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                            )}

                            {/* Revert Value Button (if modified) */}
                            {f.is_user_modified && (
                              <button
                                onClick={() => handleFieldRevert(f.id)}
                                className="p-1 text-slate-400 hover:text-amber-600 rounded-md transition-colors cursor-pointer"
                                title={`Revert to source value: ${String(f.original_value)}`}
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Delete Field Button */}
                            <button
                              onClick={() => handleFieldDelete(f.id)}
                              className="p-1 text-slate-400 hover:text-red-600 rounded-md transition-colors cursor-pointer"
                              title="Remove field"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Field Value Input */}
                        <div>
                          {f.data_type === 'boolean' ? (
                            <div className="flex items-center gap-3 py-1">
                              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                                <input
                                  type="radio"
                                  name={`bool-${f.id}`}
                                  checked={Boolean(f.value) === true}
                                  onChange={() => handleFieldValueChange(f.id, true)}
                                  className="text-blue-600"
                                />
                                <span>Yes / True</span>
                              </label>
                              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                                <input
                                  type="radio"
                                  name={`bool-${f.id}`}
                                  checked={Boolean(f.value) === false}
                                  onChange={() => handleFieldValueChange(f.id, false)}
                                  className="text-blue-600"
                                />
                                <span>No / False</span>
                              </label>
                            </div>
                          ) : (
                            <input
                              type={f.data_type === 'date' ? 'date' : f.data_type === 'integer' || f.data_type === 'decimal' || f.data_type === 'currency' ? 'number' : 'text'}
                              step={f.data_type === 'integer' ? '1' : '0.01'}
                              value={f.value !== null && f.value !== undefined ? f.value : ''}
                              onChange={(e) => handleFieldValueChange(f.id, e.target.value)}
                              placeholder="Not detected - click to enter value"
                              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500 bg-white placeholder:text-slate-300 placeholder:font-normal"
                            />
                          )}
                        </div>

                        {/* Collapsible Source Evidence Drawer */}
                        {isEvidenceOpen && hasSourceEvidence && (
                          <div className="mt-2 p-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-mono text-slate-600 flex items-start gap-2">
                            <span className="font-bold text-blue-600 flex-shrink-0">Source Snippet:</span>
                            <span className="truncate">{f.source_evidence.text}</span>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Dynamic Tables Section */}
              {dynamicDoc.tables && dynamicDoc.tables.length > 0 && (
                <div className="space-y-4 pt-3 border-t border-slate-100">
                  {dynamicDoc.tables.map((t) => (
                    <div key={t.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                          <TableIcon className="w-4 h-4 text-purple-600" />
                          <span>{t.title}</span>
                          <span className="text-[11px] font-normal text-slate-400">({t.rows.length} rows)</span>
                        </h4>

                        <button
                          onClick={() => handleAddTableRow(t.id)}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Row</span>
                        </button>
                      </div>

                      <div className="overflow-x-auto border border-slate-200 rounded-xl">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                              {t.headers.map((h, hIdx) => (
                                <th key={hIdx} className="py-2 px-3">
                                  {h}
                                </th>
                              ))}
                              <th className="py-2 px-2 w-10 text-center"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {t.rows.map((row, rIdx) => (
                              <tr key={rIdx} className="hover:bg-slate-50/70 transition-colors">
                                {row.map((cell, cIdx) => (
                                  <td key={cIdx} className="py-1.5 px-2">
                                    <input
                                      type="text"
                                      value={cell !== null && cell !== undefined ? cell : ''}
                                      onChange={(e) => handleTableCellChange(t.id, rIdx, cIdx, e.target.value)}
                                      className="w-full px-2 py-1 border border-slate-200 rounded text-xs font-medium text-slate-900 bg-white"
                                    />
                                  </td>
                                ))}
                                <td className="py-1.5 px-2 text-center">
                                  <button
                                    onClick={() => handleDeleteTableRow(t.id, rIdx)}
                                    className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors cursor-pointer"
                                    title="Delete row"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Confirm / Save Button */}
              <div className="pt-4 flex justify-end">
                <button
                  onClick={handleConfirmSave}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Verify & Save Document Record</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scanned Receipts & Invoices Ledger Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs space-y-3 p-5">
        <h3 className="text-sm font-extrabold text-slate-900">Scanned Documents & Verified Invoices Ledger</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-3">Merchant / Entity</th>
                <th className="py-3 px-3">Reference #</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Confidence</th>
                <th className="py-3 px-3">Total Amount</th>
                <th className="py-3 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {receipts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-400 italic">
                    No documents recorded yet. Upload a document above to begin dynamic extraction.
                  </td>
                </tr>
              ) : (
                receipts.map((rcpt) => (
                  <tr key={rcpt.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-3 font-bold text-slate-900">{rcpt.vendorName}</td>
                    <td className="py-3.5 px-3 text-slate-600">{rcpt.invoiceNumber}</td>
                    <td className="py-3.5 px-3 text-slate-500">{rcpt.date}</td>
                    <td className="py-3.5 px-3 text-slate-600">{rcpt.category}</td>
                    <td className="py-3.5 px-3 text-emerald-600 font-bold">
                      {rcpt.confidenceScore != null ? `${rcpt.confidenceScore}%` : 'N/A'}
                    </td>
                    <td className="py-3.5 px-3 font-extrabold text-slate-900">
                      ${Number(rcpt.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-3">
                      <Badge status={rcpt.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};