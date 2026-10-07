import React from 'react';
import { Printer, Download, CheckCircle, Copy, Mail, Building, FileText, Zap } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { Invoice, InvoiceStatus, UserProfile } from '../../types';

interface InvoicePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  user: UserProfile;
  onMarkPaid: (id: string) => void;
  onDuplicate: (invoice: Invoice) => void;
}

export const InvoicePreviewModal: React.FC<InvoicePreviewModalProps> = ({
  isOpen,
  onClose,
  invoice,
  user,
  onMarkPaid,
  onDuplicate,
}) => {
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // Generate text/blob download simulation
    const content = `==================================================
INVOICE ${invoice.invoiceNumber}
Issuer: ${user.companyName}
Customer: ${invoice.customerName} (${invoice.customerEmail})
Issue Date: ${invoice.issueDate}
Due Date: ${invoice.dueDate}
Status: ${invoice.status}
--------------------------------------------------
ITEMS:
${invoice.items.map((i) => `- ${i.description} | Qty: ${i.quantity} | Amount: ${invoice.currency}${i.amount}`).join('\n')}
--------------------------------------------------
Subtotal: ${invoice.currency}${invoice.subtotal}
Tax: ${invoice.currency}${invoice.taxTotal}
TOTAL DUE: ${invoice.currency}${invoice.total}
==================================================`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${invoice.invoiceNumber}_Document.txt`;
    a.click();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Invoice Document: ${invoice.invoiceNumber}`} maxWidth="max-w-3xl">
      <div className="space-y-6">
        {/* Action Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
          <div className="flex items-center gap-2">
            <Badge status={invoice.status} />
            <span className="text-xs font-semibold text-slate-500">
              Created {invoice.createdAt}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {invoice.status !== 'Paid' && (
              <button
                onClick={() => onMarkPaid(invoice.id)}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Mark Paid</span>
              </button>
            )}

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Document</span>
            </button>
          </div>
        </div>

        {/* Printable Commercial Invoice Paper Card */}
        <div className="p-8 bg-white border border-slate-200/90 rounded-2xl shadow-sm space-y-8 text-slate-900 font-sans print:p-0 print:border-none print:shadow-none">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                  <Zap className="w-4 h-4 fill-white" />
                </div>
                <span className="font-extrabold text-xl text-slate-900">{user.companyName}</span>
              </div>
              <p className="text-xs text-slate-500">{user.companyAddress}</p>
              <p className="text-xs text-slate-500">Tax Registration: {user.taxRegistrationNumber}</p>
            </div>

            <div className="text-right space-y-1">
              <h2 className="text-2xl font-extrabold text-slate-900 uppercase tracking-tight">
                INVOICE
              </h2>
              <p className="text-sm font-bold text-blue-600">{invoice.invoiceNumber}</p>
              <p className="text-xs text-slate-500">Issue Date: {invoice.issueDate}</p>
              <p className="text-xs font-semibold text-rose-600">Due Date: {invoice.dueDate}</p>
            </div>
          </div>

          {/* Billed To / Terms */}
          <div className="grid grid-cols-2 gap-6 text-xs">
            <div className="space-y-1">
              <span className="font-bold text-slate-400 uppercase tracking-wider">Billed To</span>
              <p className="text-sm font-bold text-slate-900">{invoice.customerName}</p>
              <p className="text-slate-600">{invoice.customerEmail}</p>
            </div>

            <div className="text-right space-y-1">
              <span className="font-bold text-slate-400 uppercase tracking-wider">Payment Terms</span>
              <p className="text-sm font-bold text-slate-900">{invoice.paymentTerms}</p>
              <p className="text-slate-600">Currency: {invoice.currency} (USD)</p>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600">
                  <th className="p-3">Item Description</th>
                  <th className="p-3 text-center">Qty</th>
                  <th className="p-3 text-right">Unit Price</th>
                  <th className="p-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {invoice.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="p-3 font-semibold">{item.description}</td>
                    <td className="p-3 text-center">{item.quantity}</td>
                    <td className="p-3 text-right">
                      {invoice.currency}
                      {item.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-right font-bold text-slate-900">
                      {invoice.currency}
                      {item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Calculations Summary */}
          <div className="flex justify-end pt-2">
            <div className="w-64 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-bold text-slate-900">
                  {invoice.currency}
                  {invoice.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Tax (GST/VAT):</span>
                <span className="font-bold text-slate-900">
                  {invoice.currency}
                  {invoice.taxTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between text-base font-extrabold text-blue-600 border-t border-slate-200 pt-2">
                <span>Total Amount Due:</span>
                <span>
                  {invoice.currency}
                  {invoice.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="pt-4 border-t border-slate-100 text-xs text-slate-500 italic">
              Note: {invoice.notes}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
