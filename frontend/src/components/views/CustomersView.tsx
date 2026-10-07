import React, { useState } from 'react';
import { Users, Plus, Search, Mail, Phone, MapPin, ExternalLink } from 'lucide-react';
import { Customer } from '../../types';
import { Badge } from '../common/Badge';

interface CustomersViewProps {
  customers: Customer[];
  onAddCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({ customers, onAddCustomer }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [duplicateError, setDuplicateError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const isDuplicate = customers.some(
      (c) =>
        c.company.toLowerCase().trim() === company.toLowerCase().trim() ||
        c.email.toLowerCase().trim() === email.toLowerCase().trim()
    );

    if (isDuplicate) {
      setDuplicateError('This data already exists! A customer with this company or email is already registered.');
      return;
    }

    setDuplicateError(null);
    onAddCustomer({
      name,
      company,
      email,
      phone,
      address,
      totalBilled: 0,
      totalPaid: 0,
      outstandingBalance: 0,
      status: 'Active',
      avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80`,
    });
    setShowAddModal(false);
    setName('');
    setCompany('');
    setEmail('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Customer Directory</h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage client profiles, total billed history, and outstanding accounts receivables.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Customer</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative w-full sm:w-80">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
        <input
          type="text"
          placeholder="Search by client name, company, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map((c) => (
          <div
            key={c.id}
            className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4 hover:border-blue-300 transition-colors"
          >
            <div className="flex items-center gap-3">
              <img
                src={c.avatarUrl}
                alt={c.name}
                className="w-11 h-11 rounded-xl object-cover border border-slate-200"
              />
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-extrabold text-slate-900 truncate">{c.company}</h3>
                <p className="text-xs text-slate-500 truncate">{c.name}</p>
              </div>
              <Badge status={c.status} />
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
              <div className="flex items-center gap-2 truncate">
                <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span className="truncate">{c.email}</span>
              </div>
              <div className="flex items-center gap-2 truncate">
                <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span>{c.phone}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
              <div className="p-2 rounded-xl bg-slate-50">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Total Billed</p>
                <p className="font-bold text-slate-900">${c.totalBilled.toLocaleString()}</p>
              </div>
              <div className="p-2 rounded-xl bg-slate-50">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Outstanding</p>
                <p
                  className={`font-bold ${
                    c.outstandingBalance > 0 ? 'text-amber-600' : 'text-emerald-600'
                  }`}
                >
                  ${c.outstandingBalance.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-xl">
            <h3 className="text-lg font-extrabold text-slate-900">Add New Customer</h3>

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

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">Company Name</label>
                <input
                  type="text"
                  required
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Acme Corp"
                  className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Primary Contact Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@acme.com"
                  className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex gap-2 pt-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
