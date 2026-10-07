import React, { useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  Download,
  FileText,
  Eye,
  Edit2,
  Trash2,
  Copy,
  CheckCircle,
  Clock,
  AlertCircle,
  MoreVertical,
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { Invoice, InvoiceStatus, Customer } from '../../types';

interface InvoiceListViewProps {
  invoices: Invoice[];
  customers: Customer[];
  onOpenCreateModal: () => void;
  onOpenEditModal: (invoice: Invoice) => void;
  onOpenPreviewModal: (invoice: Invoice) => void;
  onDeleteInvoice: (id: string) => void;
  onUpdateStatus: (id: string, status: InvoiceStatus) => void;
  onDuplicateInvoice: (invoice: Invoice) => void;
}

export const InvoiceListView: React.FC<InvoiceListViewProps> = ({
  invoices,
  customers,
  onOpenCreateModal,
  onOpenEditModal,
  onOpenPreviewModal,
  onDeleteInvoice,
  onUpdateStatus,
  onDuplicateInvoice, }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedStatus === 'All' || inv.status.toLowerCase() === selectedStatus.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const exportCSV = () => {
    const headers = ['Invoice Number,Customer,Issue Date,Due Date,Total,Status\n'];
    const rows = filteredInvoices.map(
      (i) => `"${i.invoiceNumber}","${i.customerName}","${i.issueDate}","${i.dueDate}",${i.total},"${i.status}"`
    );
    const blob = new Blob([...headers, ...rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FinSight_Invoices_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Invoice Directory</h2>
          <p className="text-xs text-slate-500">
            Create, manage, track, and export commercial client invoices.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors flex items-center gap-2"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onOpenCreateModal}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Invoice</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by invoice # or customer..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['All', 'Paid', 'Pending', 'Overdue', 'Draft'].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex-shrink-0 ${
                selectedStatus === status
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">Invoice #</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Issue Date</th>
                <th className="py-3.5 px-4">Due Date</th>
                <th className="py-3.5 px-4">Terms</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No invoices match your query. Try resetting filters.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="py-4 px-4 font-bold text-slate-900 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span>{inv.invoiceNumber}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-bold text-slate-900">{inv.customerName}</p>
                        <p className="text-[11px] text-slate-400">{inv.customerEmail}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-500">{inv.issueDate}</td>
                    <td className="py-4 px-4 text-slate-500">{inv.dueDate}</td>
                    <td className="py-4 px-4 text-slate-500">{inv.paymentTerms}</td>
                    <td className="py-4 px-4 font-bold text-slate-900 text-sm">
                      {inv.currency}
                      {inv.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-4">
                      <Badge status={inv.status} />
                    </td>
                    <td className="py-4 px-4 text-right relative">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onOpenPreviewModal(inv)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Preview & Print"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onOpenEditModal(inv)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                          title="Edit Invoice"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {inv.status !== 'Paid' && (
                          <button
                            onClick={() => onUpdateStatus(inv.id, 'Paid')}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                            title="Mark as Paid"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => onDuplicateInvoice(inv)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          title="Duplicate Invoice"
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onDeleteInvoice(inv.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Invoice"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
