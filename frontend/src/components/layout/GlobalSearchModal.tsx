import React, { useState, useEffect } from 'react';
import { Search, FileText, Users, Building2, CreditCard, ArrowRight } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Customer, Expense, Invoice, TabType, Vendor } from '../../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoices: Invoice[];
  customers: Customer[];
  vendors: Vendor[];
  expenses: Expense[];
  onSelectTab: (tab: TabType) => void;
  onSelectInvoice: (invoice: Invoice) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  invoices,
  customers,
  vendors,
  expenses,
  onSelectTab,
  onSelectInvoice,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open search modal trigger handled by parent or toggle
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const cleanQuery = query.toLowerCase().trim();

  const filteredInvoices = cleanQuery
    ? invoices.filter(
        (i) =>
          i.invoiceNumber.toLowerCase().includes(cleanQuery) ||
          i.customerName.toLowerCase().includes(cleanQuery)
      )
    : invoices.slice(0, 3);

  const filteredCustomers = cleanQuery
    ? customers.filter(
        (c) =>
          c.name.toLowerCase().includes(cleanQuery) ||
          c.company.toLowerCase().includes(cleanQuery)
      )
    : customers.slice(0, 2);

  const filteredVendors = cleanQuery
    ? vendors.filter((v) => v.name.toLowerCase().includes(cleanQuery))
    : vendors.slice(0, 2);

  const filteredExpenses = cleanQuery
    ? expenses.filter(
        (e) =>
          e.title.toLowerCase().includes(cleanQuery) ||
          e.vendorName.toLowerCase().includes(cleanQuery)
      )
    : expenses.slice(0, 2);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Global FinSight Search" maxWidth="max-w-xl">
      <div className="space-y-4">
        {/* Search Input Box */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type to search invoices, customers, vendors, expenses..."
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium text-slate-900 placeholder:text-slate-400"
          />
        </div>

        {/* Results Sections */}
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {/* Invoices */}
          {filteredInvoices.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> Invoices ({filteredInvoices.length})
                </span>
                <button
                  onClick={() => {
                    onClose();
                    onSelectTab('invoices');
                  }}
                  className="text-blue-600 hover:underline capitalize"
                >
                  View All
                </button>
              </div>

              <div className="space-y-1.5">
                {filteredInvoices.map((inv) => (
                  <div
                    key={inv.id}
                    onClick={() => {
                      onClose();
                      onSelectInvoice(inv);
                    }}
                    className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-blue-50/60 hover:border-blue-200 flex items-center justify-between cursor-pointer transition-colors group"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900 flex items-center gap-2">
                        {inv.invoiceNumber}
                        <span className="font-normal text-slate-500">• {inv.customerName}</span>
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Due {inv.dueDate} • Status: {inv.status}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                      <span>${inv.total.toLocaleString()}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Customers */}
          {filteredCustomers.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" /> Customers
                </span>
                <button
                  onClick={() => {
                    onClose();
                    onSelectTab('customers');
                  }}
                  className="text-blue-600 hover:underline capitalize"
                >
                  View All
                </button>
              </div>

              <div className="space-y-1.5">
                {filteredCustomers.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      onClose();
                      onSelectTab('customers');
                    }}
                    className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-blue-50/60 hover:border-blue-200 flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900">{c.company}</p>
                      <p className="text-[11px] text-slate-500">{c.name} ({c.email})</p>
                    </div>
                    <span className="text-xs font-medium text-slate-600">
                      Billed: ${c.totalBilled.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Vendors */}
          {filteredVendors.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" /> Vendors
                </span>
                <button
                  onClick={() => {
                    onClose();
                    onSelectTab('vendors');
                  }}
                  className="text-blue-600 hover:underline capitalize"
                >
                  View All
                </button>
              </div>

              <div className="space-y-1.5">
                {filteredVendors.map((v) => (
                  <div
                    key={v.id}
                    onClick={() => {
                      onClose();
                      onSelectTab('vendors');
                    }}
                    className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-blue-50/60 hover:border-blue-200 flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900">{v.name}</p>
                      <p className="text-[11px] text-slate-500">{v.category}</p>
                    </div>
                    <span className="text-xs font-medium text-slate-600">
                      Spent: ${v.totalSpent.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Expenses */}
          {filteredExpenses.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5" /> Expenses
                </span>
                <button
                  onClick={() => {
                    onClose();
                    onSelectTab('expenses');
                  }}
                  className="text-blue-600 hover:underline capitalize"
                >
                  View All
                </button>
              </div>

              <div className="space-y-1.5">
                {filteredExpenses.map((exp) => (
                  <div
                    key={exp.id}
                    onClick={() => {
                      onClose();
                      onSelectTab('expenses');
                    }}
                    className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-blue-50/60 hover:border-blue-200 flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900">{exp.title}</p>
                      <p className="text-[11px] text-slate-500">Vendor: {exp.vendorName}</p>
                    </div>
                    <span className="text-xs font-bold text-slate-900">
                      ${exp.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
