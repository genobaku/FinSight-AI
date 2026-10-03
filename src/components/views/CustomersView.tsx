
import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Mail,
  Phone,
  MapPin,
  MoreHorizontal,
  UserCheck,
} from 'lucide-react';
import { Customer } from '../../types';
import { Badge } from '../common/Badge';

interface CustomersViewProps {
  customers: Customer[];
  onAddCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
  onAddCustomer,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [duplicateError, setDuplicateError] = useState<string | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const filteredCustomers = customers.filter((c) => {
    const search = searchTerm.toLowerCase();

    return (
      c.name.toLowerCase().includes(search) ||
      c.company.toLowerCase().includes(search) ||
      c.email.toLowerCase().includes(search)
    );
  });

  const activeCustomers = customers.filter(
    (c) => c.status === 'Active'
  ).length;

  const totalOutstanding = customers.reduce(
    (sum, customer) => sum + customer.outstandingBalance,
    0
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const isDuplicate = customers.some(
      (c) =>
        c.company.toLowerCase().trim() === company.toLowerCase().trim() ||
        c.email.toLowerCase().trim() === email.toLowerCase().trim()
    );

    if (isDuplicate) {
      setDuplicateError(
        'This company or email is already registered.'
      );
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
      avatarUrl:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    });

    setShowAddModal(false);

    setName('');
    setCompany('');
    setEmail('');
    setPhone('');
    setAddress('');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-14">

      {/* ---------------------------------------------
          HEADER
      --------------------------------------------- */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">

        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            Customers
          </h1>

          <p className="mt-2 text-sm text-slate-500 max-w-xl">
            Manage your clients and keep track of billing relationships.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          // className="inline-flex items-center justify-center gap-2
          //   h-10 px-4 rounded-lg
          //   bg-slate-900 text-white
          //   text-sm font-medium
          //   hover:bg-slate-800 transition-colors"
          className="w-[145px] h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold shadow-sm transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add customer
        </button>
      </div>


      {/* ---------------------------------------------
          SUMMARY
      --------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        {/* Total */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between">

            <p className="text-sm font-medium text-slate-500">
              Total customers
            </p>

            <div className="w-8 h-8 rounded-lg bg-slate-100
              flex items-center justify-center">
              <Users className="w-4 h-4 text-slate-500" />
            </div>

          </div>

          <p className="mt-4 text-2xl font-semibold text-slate-900">
            {customers.length}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            All customer accounts
          </p>
        </div>


        {/* Active */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between">

            <p className="text-sm font-medium text-slate-500">
              Active
            </p>

            <div className="w-8 h-8 rounded-lg bg-emerald-50
              flex items-center justify-center">
              <UserCheck className="w-4 h-4 text-emerald-600" />
            </div>

          </div>

          <p className="mt-4 text-2xl font-semibold text-slate-900">
            {activeCustomers}
          </p>

          <p className="mt-1 text-xs text-emerald-600">
            Currently active
          </p>
        </div>


        {/* Outstanding */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between">

            <p className="text-sm font-medium text-slate-500">
              Outstanding
            </p>

            <div className="w-8 h-8 rounded-lg bg-amber-50
              flex items-center justify-center">
              <span className="text-sm font-semibold text-amber-600">
                $
              </span>
            </div>

          </div>

          <p className="mt-4 text-2xl font-semibold text-slate-900">
            ${totalOutstanding.toLocaleString()}
          </p>

          <p className="mt-1 text-xs text-amber-600">
            Awaiting payment
          </p>
        </div>

      </div>


      {/* ---------------------------------------------
          SEARCH
      --------------------------------------------- */}
      <div className="relative w-full md:max-w-md">

        <Search
          className="absolute left-3.5 top-1/2
            -translate-y-1/2 w-4 h-4 text-slate-400"
        />

        <input
          type="text"
          placeholder="Search customers"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full h-11 pl-10 pr-4
            bg-white border border-slate-200 rounded-lg
            text-sm text-slate-900
            placeholder:text-slate-400
            focus:outline-none
            focus:border-slate-400
            focus:ring-2 focus:ring-slate-100"
        />

      </div>


      {/* ---------------------------------------------
          CUSTOMER LIST
      --------------------------------------------- */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-visible">

        {/* List header */}
        <div className="hidden lg:grid grid-cols-[2fr_2fr_1.2fr_1fr_50px]
          items-center gap-4 px-5 py-3
          border-b border-slate-100
          bg-slate-50/60
          text-[11px] font-semibold uppercase
          tracking-wide text-slate-400">

          <span>Customer</span>
          <span>Contact</span>
          <span>Billing</span>
          <span>Status</span>
          <span />
        </div>


        {filteredCustomers.length === 0 ? (

          <div className="py-16 text-center">

            <div className="mx-auto w-12 h-12 rounded-full
              bg-slate-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-slate-400" />
            </div>

            <h3 className="mt-4 text-sm font-semibold text-slate-800">
              No customers found
            </h3>

            <p className="mt-1 text-xs text-slate-400">
              Try searching with another name, company, or email.
            </p>

          </div>

        ) : (

          <div className="divide-y divide-slate-100">

            {filteredCustomers.map((customer) => (

              <div
                key={customer.id}
                className="relative px-5 py-4
                  hover:bg-slate-50/60 transition-colors"
              >

                <div className="grid grid-cols-1 lg:grid-cols-[2fr_2fr_1.2fr_1fr_50px]
                  items-center gap-4">

                  {/* Customer */}
                  <div className="flex items-center gap-3 min-w-0">

                    {customer.avatarUrl ? (
                      <img
                        src={customer.avatarUrl}
                        alt={customer.name}
                        className="w-10 h-10 rounded-lg
                          object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg
                        bg-slate-100 flex items-center justify-center">
                        <Users className="w-4 h-4 text-slate-400" />
                      </div>
                    )}

                    <div className="min-w-0">

                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {customer.company}
                      </p>

                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {customer.name}
                      </p>

                    </div>

                  </div>


                  {/* Contact */}
                  <div className="space-y-1 min-w-0">

                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">
                        {customer.email}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Phone className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        {customer.phone || 'No phone added'}
                      </span>
                    </div>

                  </div>


                  {/* Billing */}
                  <div>

                    <p className="text-sm font-semibold text-slate-800">
                      ${customer.totalBilled.toLocaleString()}
                    </p>

                    <p className="text-xs mt-1">
                      <span className="text-slate-400">
                        Outstanding{' '}
                      </span>

                      <span
                        className={
                          customer.outstandingBalance > 0
                            ? 'text-amber-600'
                            : 'text-emerald-600'
                        }
                      >
                        ${customer.outstandingBalance.toLocaleString()}
                      </span>
                    </p>

                  </div>


                  {/* Status */}
                  <div>
                    <Badge status={customer.status} />
                  </div>


                  {/* Actions */}
                  <div className="relative flex justify-end">

                    <button
                      onClick={() =>
                        setActiveMenuId(
                          activeMenuId === customer.id
                            ? null
                            : customer.id
                        )
                      }
                      className="p-2 rounded-md
                        text-slate-400
                        hover:text-slate-800
                        hover:bg-slate-100
                        transition-colors"
                      title="More"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>


                    {activeMenuId === customer.id && (
                      <div className="absolute right-0 top-9 z-30
                        w-40 bg-white
                        border border-slate-200
                        rounded-lg shadow-lg py-1">

                        <button
                          onClick={() => {
                            setActiveMenuId(null);
                          }}
                          className="w-full px-3 py-2.5
                            text-left text-sm
                            text-slate-700
                            hover:bg-slate-50"
                        >
                          View customer
                        </button>

                        <button
                          onClick={() => {
                            setActiveMenuId(null);
                          }}
                          className="w-full px-3 py-2.5
                            text-left text-sm
                            text-slate-700
                            hover:bg-slate-50"
                        >
                          Edit customer
                        </button>

                      </div>
                    )}

                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>


      {/* ---------------------------------------------
          ADD CUSTOMER MODAL
      --------------------------------------------- */}
      {showAddModal && (

        <div
          className="fixed inset-0 z-50
            bg-slate-900/40
            flex items-center justify-center
            p-4"
          onClick={() => setShowAddModal(false)}
        >

          <div
            className="bg-white w-full max-w-md
              rounded-xl border border-slate-200
              shadow-xl p-6"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="mb-5">

              <h3 className="text-lg font-semibold text-slate-900">
                Add customer
              </h3>

              <p className="text-xs text-slate-400 mt-1">
                Add the customer's basic billing information.
              </p>

            </div>


            {duplicateError && (

              <div className="mb-4 p-3
                bg-rose-50 border border-rose-200
                rounded-lg text-xs text-rose-700">

                {duplicateError}

              </div>

            )}


            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Company */}
              <div>

                <label className="block text-xs font-medium text-slate-700">
                  Company name
                </label>

                <input
                  type="text"
                  required
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Acme Corp"
                  className="w-full mt-1.5 h-10 px-3
                    border border-slate-200 rounded-lg
                    text-sm
                    focus:outline-none
                    focus:border-slate-400
                    focus:ring-2 focus:ring-slate-100"
                />

              </div>


              {/* Contact name */}
              <div>

                <label className="block text-xs font-medium text-slate-700">
                  Contact name
                </label>

                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  className="w-full mt-1.5 h-10 px-3
                    border border-slate-200 rounded-lg
                    text-sm
                    focus:outline-none
                    focus:border-slate-400
                    focus:ring-2 focus:ring-slate-100"
                />

              </div>


              {/* Email */}
              <div>

                <label className="block text-xs font-medium text-slate-700">
                  Email address
                </label>

                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@acme.com"
                  className="w-full mt-1.5 h-10 px-3
                    border border-slate-200 rounded-lg
                    text-sm
                    focus:outline-none
                    focus:border-slate-400
                    focus:ring-2 focus:ring-slate-100"
                />

              </div>


              {/* Phone */}
              <div>

                <label className="block text-xs font-medium text-slate-700">
                  Phone
                </label>

                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full mt-1.5 h-10 px-3
                    border border-slate-200 rounded-lg
                    text-sm
                    focus:outline-none
                    focus:border-slate-400
                    focus:ring-2 focus:ring-slate-100"
                />

              </div>


              {/* Address */}
              <div>

                <label className="block text-xs font-medium text-slate-700">
                  Address
                </label>

                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Customer address"
                  className="w-full mt-1.5 h-10 px-3
                    border border-slate-200 rounded-lg
                    text-sm
                    focus:outline-none
                    focus:border-slate-400
                    focus:ring-2 focus:ring-slate-100"
                />

              </div>


              {/* Buttons */}
              <div className="flex justify-end gap-2 pt-3">

                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setDuplicateError(null);
                  }}
                  className="h-10 px-4 rounded-lg
                    text-sm font-medium
                    text-slate-600
                    hover:bg-slate-100"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="h-10 px-4 rounded-lg
                    text-sm font-medium
                    bg-slate-900 text-white
                    hover:bg-slate-800"
                >
                  Save customer
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
};

