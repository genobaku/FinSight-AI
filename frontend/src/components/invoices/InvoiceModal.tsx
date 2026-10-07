import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calculator } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Customer, Invoice, InvoiceItem, InvoiceStatus } from '../../types';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (invoice: Invoice) => void;
  onSaveInvoice?: (invoice: Invoice) => void;
  invoices?: Invoice[];
  customers: Customer[];
  initialInvoice?: Invoice | null;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onSaveInvoice,
  invoices = [],
  customers,
  initialInvoice,
}) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [duplicateError, setDuplicateError] = useState<string | null>(null);
  const [issueDate, setIssueDate] = useState(new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [currency, setCurrency] = useState('$');
  const [paymentTerms, setPaymentTerms] = useState('Net 30');
  const [status, setStatus] = useState<InvoiceStatus>('Pending');
  const [notes, setNotes] = useState('Thank you for your business. Please remit payment promptly.');
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: 'item-1',
      description: 'Software Engineering Services',
      quantity: 1,
      unitPrice: 2500,
      taxRate: 10,
      amount: 2500,
    },
  ]);

  useEffect(() => {
    setDuplicateError(null);
    if (initialInvoice) {
      setSelectedCustomerId(initialInvoice.customerId);
      setCustomerName(initialInvoice.customerName);
      setCustomerEmail(initialInvoice.customerEmail);
      setInvoiceNumber(initialInvoice.invoiceNumber);
      setIssueDate(initialInvoice.issueDate);
      setDueDate(initialInvoice.dueDate);
      setCurrency(initialInvoice.currency || '$');
      setPaymentTerms(initialInvoice.paymentTerms || 'Net 30');
      setStatus(initialInvoice.status);
      setNotes(initialInvoice.notes || '');
      setItems(initialInvoice.items.length > 0 ? initialInvoice.items : []);
    } else {
      setInvoiceNumber(`FIN-2026-${Math.floor(100 + Math.random() * 900)}`);
      if (customers.length > 0) {
        setSelectedCustomerId(customers[0].id);
        setCustomerName(customers[0].company);
        setCustomerEmail(customers[0].email);
      }
    }
  }, [initialInvoice, customers, isOpen]);

  const handleCustomerSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedCustomerId(id);
    const found = customers.find((c) => c.id === id);
    if (found) {
      setCustomerName(found.company);
      setCustomerEmail(found.email);
    }
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items];
    const item = { ...newItems[index], [field]: value };

    if (field === 'quantity' || field === 'unitPrice') {
      item.amount = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
    }

    newItems[index] = item;
    setItems(newItems);
  };

  const addItemRow = () => {
    setItems([
      ...items,
      {
        id: `item-${Date.now()}`,
        description: '',
        quantity: 1,
        unitPrice: 0,
        taxRate: 10,
        amount: 0,
      },
    ]);
  };

  const removeItemRow = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);
  const taxTotal = items.reduce(
    (sum, item) => sum + ((item.amount || 0) * (item.taxRate || 0)) / 100,
    0
  );
  const grandTotal = subtotal + taxTotal;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Duplicate check for Invoice Number
    const existingInv = invoices.find(
      (inv) =>
        inv.invoiceNumber.toLowerCase().trim() === invoiceNumber.toLowerCase().trim() &&
        inv.id !== initialInvoice?.id
    );

    if (existingInv) {
      setDuplicateError('This data already exists! An invoice with this invoice number is already recorded.');
      return;
    }

    const invoiceToSave: Invoice = {
      id: initialInvoice?.id || `inv-${Date.now()}`,
      invoiceNumber: invoiceNumber || `FIN-2026-${Math.floor(100 + Math.random() * 900)}`,
      customerId: selectedCustomerId || 'custom',
      customerName: customerName || 'Valued Customer',
      customerEmail,
      issueDate,
      dueDate,
      items,
      subtotal,
      taxTotal,
      discountTotal: 0,
      total: grandTotal,
      status,
      currency,
      paymentTerms,
      notes,
      createdAt: initialInvoice?.createdAt || new Date().toISOString().slice(0, 10),
    };

    if (onSave) onSave(invoiceToSave);
    if (onSaveInvoice) onSaveInvoice(invoiceToSave);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialInvoice ? 'Edit Invoice' : 'Create New Invoice'}
      maxWidth="max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {duplicateError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-700 flex items-center justify-between">
            <span>{duplicateError}</span>
            <button
              type="button"
              onClick={() => setDuplicateError(null)}
              className="text-red-500 hover:text-red-800 font-bold ml-2"
            >
              ✕
            </button>
          </div>
        )}
        {/* Customer & Invoice Header Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Customer
            </label>
            <select
              value={selectedCustomerId}
              onChange={handleCustomerSelect}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.company} ({c.name})
                </option>
              ))}
              <option value="custom">Custom Client...</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Invoice Number
            </label>
            <input
              type="text"
              required
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Client Company Name
            </label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Client Email Address
            </label>
            <input
              type="email"
              required
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Issue Date
            </label>
            <input
              type="date"
              required
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Due Date
            </label>
            <input
              type="date"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="$">USD ($)</option>
              <option value="€">EUR (€)</option>
              <option value="£">GBP (£)</option>
              <option value="CAD$">CAD ($)</option>
              <option value="A$">AUD ($)</option>
              <option value="₹">INR (₹)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Payment Terms & Status
            </label>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className="w-full px-2 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-900"
              >
                <option value="Due on Receipt">Due on Receipt</option>
                <option value="Net 15">Net 15</option>
                <option value="Net 30">Net 30</option>
                <option value="Net 60">Net 60</option>
              </select>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as InvoiceStatus)}
                className="w-full px-2 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900"
              >
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
                <option value="Overdue">Overdue</option>
                <option value="Draft">Draft</option>
              </select>
            </div>
          </div>
        </div>

        {/* Itemized Services / Products Table */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Itemized Invoice Items
            </h4>
            <button
              type="button"
              onClick={addItemRow}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Line Item</span>
            </button>
          </div>

          <div className="space-y-2">
            {items.map((item, idx) => (
              <div
                key={item.id}
                className="grid grid-cols-12 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200/80 items-center"
              >
                <div className="col-span-5">
                  <input
                    type="text"
                    placeholder="Description of item or service..."
                    value={item.description}
                    onChange={(e) => updateItem(idx, 'description', e.target.value)}
                    required
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="col-span-2">
                  <input
                    type="number"
                    min="1"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => updateItem(idx, 'quantity', Number(e.target.value))}
                    required
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-900"
                  />
                </div>

                <div className="col-span-2">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Price"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(idx, 'unitPrice', Number(e.target.value))}
                    required
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-900"
                  />
                </div>

                <div className="col-span-2 font-bold text-xs text-slate-900 text-right pr-2">
                  {currency}
                  {item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>

                <div className="col-span-1 text-right">
                  <button
                    type="button"
                    onClick={() => removeItemRow(idx)}
                    className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Totals Summary Card */}
        <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-300 space-y-1 w-full sm:w-auto">
            <p className="flex justify-between sm:justify-start gap-6">
              <span>Subtotal:</span>
              <span className="font-bold text-white">
                {currency}
                {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </p>
            <p className="flex justify-between sm:justify-start gap-6">
              <span>Estimated Tax (10%):</span>
              <span className="font-bold text-white">
                {currency}
                {taxTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </p>
          </div>

          <div className="text-right w-full sm:w-auto">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Total Invoice Amount
            </p>
            <p className="text-2xl font-extrabold text-blue-400">
              {currency}
              {grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Notes / Payment Instructions
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all"
          >
            Save & Issue Invoice
          </button>
        </div>
      </form>
    </Modal>
  );
};
