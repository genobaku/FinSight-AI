
import React, { useState } from 'react';
import {
  Search,
  Plus,
  Download,
  FileText,
  Eye,
  Edit2,
  Trash2,
  Copy,
  CheckCircle,
  MoreHorizontal,
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
  onDuplicateInvoice,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const filteredInvoices = invoices.filter((inv) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(search) ||
      inv.customerName.toLowerCase().includes(search) ||
      inv.customerEmail.toLowerCase().includes(search);

    const matchesStatus =
      selectedStatus === 'All' ||
      inv.status.toLowerCase() === selectedStatus.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const exportCSV = () => {
    const headers =
      'Invoice Number,Customer,Issue Date,Due Date,Total,Status\n';

    const rows = filteredInvoices.map(
      (i) =>
        `"${i.invoiceNumber}","${i.customerName}","${i.issueDate}","${i.dueDate}",${i.total},"${i.status}"`
    );

    const blob = new Blob([headers, rows.join('\n')], {
      type: 'text/csv',
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.href = url;
    a.download = `FinSight_Invoices_${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    a.click();
    URL.revokeObjectURL(url);
  };

  const totalInvoices = invoices.length;

  const paidInvoices = invoices.filter(
    (invoice) => invoice.status === 'Paid'
  ).length;

  const pendingInvoices = invoices.filter(
    (invoice) => invoice.status === 'Pending'
  ).length;

  const overdueInvoices = invoices.filter(
    (invoice) => invoice.status === 'Overdue'
  ).length;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-14">

      {/* ------------------------------------------------
          HEADER
      ------------------------------------------------ */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
        <div>
          

          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            Invoices
          </h1>

          <p className="mt-2 text-sm text-slate-500 max-w-xl">
            Create invoices, follow payment status, and keep your billing
            organized in one place.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-2 h-10 px-4
              rounded-lg border border-slate-200
              bg-white text-sm font-medium text-slate-700
              hover:bg-slate-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>

          <button
            onClick={onOpenCreateModal}
            className="inline-flex items-center gap-2 h-10 px-4
              rounded-lg bg-slate-900 text-white
              text-sm font-medium
              hover:bg-slate-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New invoice
          </button>
        </div>
      </div>

     
{/* ------------------------------------------------
    QUICK SUMMARY
------------------------------------------------ */}
<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

  {/* Total */}
  <div className="bg-white border border-slate-200 rounded-xl p-5">
    <div className="flex items-center justify-between">
      <p className="text-sm font-medium text-slate-500">
        Total invoices
      </p>

      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
        <FileText className="w-4 h-4 text-slate-500" />
      </div>
    </div>

    <div className="mt-4 flex items-end justify-between">
      <p className="text-2xl font-semibold text-slate-900">
        {totalInvoices}
      </p>

      <span className="text-xs text-slate-400 pb-1">
        All invoices
      </span>
    </div>
  </div>


  {/* Paid */}
  <div className="bg-white border border-slate-200 rounded-xl p-5">
    <div className="flex items-center justify-between">
      <p className="text-sm font-medium text-slate-500">
        Paid
      </p>

      <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
        <CheckCircle className="w-4 h-4 text-emerald-600" />
      </div>
    </div>

    <div className="mt-4 flex items-end justify-between">
      <p className="text-2xl font-semibold text-slate-900">
        {paidInvoices}
      </p>

      <span className="text-xs text-emerald-600 pb-1">
        Completed
      </span>
    </div>
  </div>


  {/* Pending */}
  <div className="bg-white border border-slate-200 rounded-xl p-5">
    <div className="flex items-center justify-between">
      <p className="text-sm font-medium text-slate-500">
        Pending
      </p>

      <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
        <FileText className="w-4 h-4 text-amber-600" />
      </div>
    </div>

    <div className="mt-4 flex items-end justify-between">
      <p className="text-2xl font-semibold text-slate-900">
        {pendingInvoices}
      </p>

      <span className="text-xs text-amber-600 pb-1">
        Awaiting payment
      </span>
    </div>
  </div>


  {/* Overdue */}
  <div className="bg-white border border-slate-200 rounded-xl p-5">
    <div className="flex items-center justify-between">
      <p className="text-sm font-medium text-slate-500">
        Overdue
      </p>

      <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center">
        <FileText className="w-4 h-4 text-rose-600" />
      </div>
    </div>

    <div className="mt-4 flex items-end justify-between">
      <p className="text-2xl font-semibold text-slate-900">
        {overdueInvoices}
      </p>

      <span className="text-xs text-rose-600 pb-1">
        Needs follow-up
      </span>
    </div>
  </div>

</div>


      {/* ------------------------------------------------
          SEARCH + FILTER
      ------------------------------------------------ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

        <div className="relative w-full md:max-w-md">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2
              w-4 h-4 text-slate-400"
          />

          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search invoice or customer"
            className="w-full h-11 pl-10 pr-4
              bg-white border border-slate-200 rounded-lg
              text-sm text-slate-900
              placeholder:text-slate-400
              focus:outline-none focus:border-slate-400
              focus:ring-2 focus:ring-slate-100"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto">
          {['All', 'Paid', 'Pending', 'Overdue', 'Draft'].map(
            (status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-3.5 py-2 rounded-md text-sm
                  font-medium whitespace-nowrap transition-colors ${
                    selectedStatus === status
                      ? 'bg-slate-100 text-slate-900'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
              >
                {status}
              </button>
            )
          )}
        </div>
      </div>

      {/* ------------------------------------------------
          INVOICE LIST
      ------------------------------------------------ */}
      <div className="space-y-3">

        {filteredInvoices.length === 0 ? (
          <div className="border border-dashed border-slate-300 rounded-xl py-16 text-center bg-white">
            <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
              <FileText className="w-5 h-5 text-slate-400" />
            </div>

            <h3 className="mt-4 text-sm font-semibold text-slate-800">
              No invoices found
            </h3>

            <p className="mt-1 text-xs text-slate-400">
              Try another search or change the selected status.
            </p>
          </div>
        ) : (
          filteredInvoices.map((inv) => (
            <div
              key={inv.id}
              className="group bg-white border border-slate-200
                rounded-xl px-5 py-4
                hover:border-slate-300
                transition-all"
            >
              <div className="flex flex-col xl:flex-row xl:items-center gap-5">

                {/* Invoice identity */}
                <div className="flex items-center gap-4 xl:w-[27%]">

                  <div className="w-10 h-10 shrink-0 rounded-lg
                    bg-slate-50 border border-slate-200
                    flex items-center justify-center">
                    <FileText className="w-4 h-4 text-slate-500" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900">
                      {inv.invoiceNumber}
                    </p>

                    <p className="mt-1 text-xs text-slate-400 truncate">
                      Issued {inv.issueDate}
                    </p>
                  </div>
                </div>

                {/* Customer */}
                <div className="xl:w-[24%] min-w-0">
                  <p className="text-xs text-slate-400 mb-1">
                    Customer
                  </p>

                  <p className="text-sm font-medium text-slate-800 truncate">
                    {inv.customerName}
                  </p>

                  <p className="text-xs text-slate-400 truncate mt-0.5">
                    {inv.customerEmail}
                  </p>
                </div>

                {/* Due */}
                <div className="xl:w-[15%]">
                  <p className="text-xs text-slate-400 mb-1">
                    Due
                  </p>

                  <p className="text-sm text-slate-700">
                    {inv.dueDate}
                  </p>

                  <p className="text-xs text-slate-400 mt-0.5">
                    {inv.paymentTerms}
                  </p>
                </div>

                {/* Status */}
                <div className="xl:w-[13%]">
                  <p className="text-xs text-slate-400 mb-1.5">
                    Status
                  </p>

                  <Badge status={inv.status} />
                </div>

                {/* Amount */}
                <div className="xl:w-[13%] xl:text-right">
                  <p className="text-xs text-slate-400 mb-1">
                    Amount
                  </p>

                  <p className="text-base font-semibold text-slate-900">
                    {inv.currency}
                    {inv.total.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>

                {/* Actions */}
                <div className="xl:ml-auto relative">

                  <div className="flex items-center justify-end gap-1">

                    <button
                      onClick={() => onOpenPreviewModal(inv)}
                      className="p-2 rounded-md text-slate-400
                        hover:text-slate-800 hover:bg-slate-100
                        transition-colors"
                      title="Preview"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onOpenEditModal(inv)}
                      className="p-2 rounded-md text-slate-400
                        hover:text-slate-800 hover:bg-slate-100
                        transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() =>
                        setActiveMenuId(
                          activeMenuId === inv.id ? null : inv.id
                        )
                      }
                      className="p-2 rounded-md text-slate-400
                        hover:text-slate-800 hover:bg-slate-100
                        transition-colors"
                      title="More"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>

                  {/* More menu */}
                  {activeMenuId === inv.id && (
                    <div className="absolute right-0 top-10 z-20
                      w-44 bg-white border border-slate-200
                      rounded-lg shadow-lg py-1">

                      {inv.status !== 'Paid' && (
                        <button
                          onClick={() => {
                            onUpdateStatus(inv.id, 'Paid');
                            setActiveMenuId(null);
                          }}
                          className="w-full px-3 py-2.5
                            flex items-center gap-2.5
                            text-left text-sm text-slate-700
                            hover:bg-slate-50"
                        >
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                          Mark as paid
                        </button>
                      )}

                      <button
                        onClick={() => {
                          onDuplicateInvoice(inv);
                          setActiveMenuId(null);
                        }}
                        className="w-full px-3 py-2.5
                          flex items-center gap-2.5
                          text-left text-sm text-slate-700
                          hover:bg-slate-50"
                      >
                        <Copy className="w-4 h-4 text-slate-400" />
                        Duplicate
                      </button>

                      <div className="my-1 border-t border-slate-100" />

                      <button
                        onClick={() => {
                          onDeleteInvoice(inv.id);
                          setActiveMenuId(null);
                        }}
                        className="w-full px-3 py-2.5
                          flex items-center gap-2.5
                          text-left text-sm text-rose-600
                          hover:bg-rose-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>

              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {filteredInvoices.length > 0 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-slate-400">
            Showing {filteredInvoices.length} of {invoices.length} invoices
          </p>

          <p className="text-xs text-slate-400">
            FinSight billing
          </p>
        </div>
      )}
    </div>
  );
};

