// import React, { useState } from 'react';
// import { Building2, Plus, Search, Mail, Phone, ShieldCheck, AlertTriangle } from 'lucide-react';
// import { Vendor } from '../../types';
// import { Badge } from '../common/Badge';

// interface VendorsViewProps {
//   vendors: Vendor[];
//   onAddVendor: (vendor: Omit<Vendor, 'id' | 'createdAt'>) => void;
// }

// export const VendorsView: React.FC<VendorsViewProps> = ({ vendors, onAddVendor }) => {
//   const [searchTerm, setSearchTerm] = useState('');
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [duplicateError, setDuplicateError] = useState<string | null>(null);

//   const [name, setName] = useState('');
//   const [category, setCategory] = useState('Cloud Infrastructure');
//   const [contactEmail, setContactEmail] = useState('');
//   const [contactPhone, setContactPhone] = useState('');

//   const filteredVendors = vendors.filter(
//     (v) =>
//       v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       v.category.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();

//     const isDuplicate = vendors.some(
//       (v) =>
//         v.name.toLowerCase().trim() === name.toLowerCase().trim() ||
//         (contactEmail && v.contactEmail.toLowerCase().trim() === contactEmail.toLowerCase().trim())
//     );

//     if (isDuplicate) {
//       setDuplicateError('This data already exists! A vendor with this name or email is already registered.');
//       return;
//     }

//     setDuplicateError(null);
//     onAddVendor({
//       name,
//       category,
//       contactEmail,
//       contactPhone,
//       totalSpent: 0,
//       pendingPayables: 0,
//       riskScore: 'Low',
//       status: 'Verified',
//     });
//     setShowAddModal(false);
//     setName('');
//   };

//   return (
//     <div className="space-y-6 pb-12">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white rounded-2xl border border-slate-200/90 shadow-xs">
//         <div>
//           <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Vendors & Supplier Management</h2>
//           <p className="text-xs text-slate-500 mt-1">
//             Track key vendors, payables, spending limits, and automated supplier risk profiles.
//           </p>
//         </div>

//         <button
//           onClick={() => setShowAddModal(true)}
         
//           className="w-[145px] h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold shadow-sm transition-all flex items-center justify-center gap-2"
//         >
//           <Plus className="w-4 h-4" />
//           <span>Add Vendor</span>
//         </button>
//       </div>

//       {/* Search */}
//       <div className="relative w-full sm:w-80">
//         <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
//         <input
//           type="text"
//           placeholder="Search vendors or service category..."
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
//         />
//       </div>

//       {/* Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {filteredVendors.map((v) => (
//           <div
//             key={v.id}
//             className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4 hover:border-blue-300 transition-colors"
//           >
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-3">
//                 <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold">
//                   <Building2 className="w-5 h-5" />
//                 </div>
//                 <div>
//                   <h3 className="text-sm font-extrabold text-slate-900">{v.name}</h3>
//                   <p className="text-xs text-slate-500">{v.category}</p>
//                 </div>
//               </div>
//               <Badge status={v.status} />
//             </div>

//             <div className="space-y-1 text-xs text-slate-600 border-t border-slate-100 pt-3">
//               <p className="flex items-center gap-2 truncate">
//                 <Mail className="w-3.5 h-3.5 text-slate-400" /> {v.contactEmail}
//               </p>
//               <p className="flex items-center gap-2">
//                 <Phone className="w-3.5 h-3.5 text-slate-400" /> {v.contactPhone}
//               </p>
//             </div>

//             <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
//               <div className="p-2 rounded-xl bg-slate-50">
//                 <p className="text-[10px] text-slate-400 font-bold uppercase">Total Spent</p>
//                 <p className="font-bold text-slate-900">${v.totalSpent.toLocaleString()}</p>
//               </div>
//               <div className="p-2 rounded-xl bg-slate-50">
//                 <p className="text-[10px] text-slate-400 font-bold uppercase">Risk Score</p>
//                 <p className={`font-bold flex items-center gap-1 ${v.riskScore === 'Low' ? 'text-emerald-600' : 'text-amber-600'}`}>
//                   {v.riskScore === 'Low' ? <ShieldCheck className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
//                   {v.riskScore} Risk
//                 </p>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Add Vendor Modal */}
//       {showAddModal && (
//         <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
//           <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-xl">
//             <h3 className="text-lg font-extrabold text-slate-900">Add New Vendor</h3>

//             {duplicateError && (
//               <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-700 flex items-center justify-between">
//                 <span>{duplicateError}</span>
//                 <button
//                   type="button"
//                   onClick={() => setDuplicateError(null)}
//                   className="text-red-500 hover:text-red-800 font-bold ml-2"
//                 >
//                   ✕
//                 </button>
//               </div>
//             )}

//             <form onSubmit={handleSubmit} className="space-y-3">
//               <div>
//                 <label className="text-xs font-semibold text-slate-700">Vendor Name</label>
//                 <input
//                   type="text"
//                   required
//                   value={name}
//                   onChange={(e) => setName(e.target.value)}
//                   placeholder="AWS or Google Cloud"
//                   className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-xs"
//                 />
//               </div>

//               <div>
//                 <label className="text-xs font-semibold text-slate-700">Category</label>
//                 <input
//                   type="text"
//                   required
//                   value={category}
//                   onChange={(e) => setCategory(e.target.value)}
//                   placeholder="Cloud Infrastructure"
//                   className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-xs"
//                 />
//               </div>

//               <div>
//                 <label className="text-xs font-semibold text-slate-700">Contact Email</label>
//                 <input
//                   type="email"
//                   required
//                   value={contactEmail}
//                   onChange={(e) => setContactEmail(e.target.value)}
//                   placeholder="billing@vendor.com"
//                   className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-xs"
//                 />
//               </div>

//               <div className="flex gap-2 pt-3 justify-end">
//                 <button
//                   type="button"
//                   onClick={() => setShowAddModal(false)}
//                   className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700"
//                 >
//                   Save Vendor
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };




















import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Search,
  Mail,
  Phone,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { Vendor } from '../../types';
import { Badge } from '../common/Badge';

interface VendorsViewProps {
  vendors: Vendor[];
  onAddVendor: (vendor: Omit<Vendor, 'id' | 'createdAt'>) => void;
}

export const VendorsView: React.FC<VendorsViewProps> = ({
  vendors,
  onAddVendor,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [duplicateError, setDuplicateError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Cloud Infrastructure');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  const filteredVendors = vendors.filter(
    (vendor) =>
      vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.contactEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const isDuplicate = vendors.some(
      (vendor) =>
        vendor.name.toLowerCase().trim() === name.toLowerCase().trim() ||
        (contactEmail &&
          vendor.contactEmail.toLowerCase().trim() ===
            contactEmail.toLowerCase().trim())
    );

    if (isDuplicate) {
      setDuplicateError(
        'This vendor already exists with the same name or email.'
      );
      return;
    }

    setDuplicateError(null);

    onAddVendor({
      name,
      category,
      contactEmail,
      contactPhone,
      totalSpent: 0,
      pendingPayables: 0,
      riskScore: 'Low',
      status: 'Verified',
    });

    setShowAddModal(false);

    setName('');
    setCategory('Cloud Infrastructure');
    setContactEmail('');
    setContactPhone('');
  };

  return (
    <div className="space-y-6 pb-12">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white rounded-2xl border border-slate-200/90 shadow-xs">

        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Vendors
          </h2>

          <p className="text-xs text-slate-500 mt-1">
            Manage suppliers, vendor contacts, spending, and risk information.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="w-[145px] h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold shadow-sm transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Vendor</span>
        </button>

      </div>

      {/* Search */}
      <div className="relative w-full sm:w-80">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />

        <input
          type="text"
          placeholder="Search by vendor or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Vendor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {filteredVendors.length === 0 ? (

          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-200">

            <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-3" />

            <p className="text-sm font-semibold text-slate-700">
              No vendors found
            </p>

            <p className="text-xs text-slate-400 mt-1">
              Try changing your search or add a new vendor.
            </p>

          </div>

        ) : (

          filteredVendors.map((vendor) => (

            <div
              key={vendor.id}
              className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4 hover:border-blue-300 transition-colors"
            >

              {/* Vendor Header */}
              <div className="flex items-center gap-3">

                <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-slate-600" />
                </div>

                <div className="min-w-0 flex-1">

                  <h3 className="text-sm font-extrabold text-slate-900 truncate">
                    {vendor.name}
                  </h3>

                  <p className="text-xs text-slate-500 truncate">
                    {vendor.category}
                  </p>

                </div>

                <Badge status={vendor.status} />

              </div>

              {/* Contact Details */}
              <div className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3">

                <div className="flex items-center gap-2 truncate">

                  <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />

                  <span className="truncate">
                    {vendor.contactEmail}
                  </span>

                </div>

                <div className="flex items-center gap-2">

                  <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />

                  <span>
                    {vendor.contactPhone}
                  </span>

                </div>

              </div>

              {/* Vendor Information */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">

                <div className="p-2.5 rounded-xl bg-slate-50">

                  <p className="text-[10px] text-slate-400 font-bold uppercase">
                    Total Spent
                  </p>

                  <p className="font-bold text-slate-900 mt-0.5">
                    ${vendor.totalSpent.toLocaleString()}
                  </p>

                </div>

                <div className="p-2.5 rounded-xl bg-slate-50">

                  <p className="text-[10px] text-slate-400 font-bold uppercase">
                    Risk
                  </p>

                  <p
                    className={`font-bold flex items-center gap-1 mt-0.5 ${
                      vendor.riskScore === 'Low'
                        ? 'text-emerald-600'
                        : 'text-amber-600'
                    }`}
                  >

                    {vendor.riskScore === 'Low' ? (
                      <ShieldCheck className="w-3.5 h-3.5" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5" />
                    )}

                    {vendor.riskScore}

                  </p>

                </div>

              </div>

              {/* Pending Payables */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">

                <span className="text-[10px] text-slate-400 font-bold uppercase">
                  Pending Payables
                </span>

                <span
                  className={`text-sm font-extrabold ${
                    vendor.pendingPayables > 0
                      ? 'text-amber-600'
                      : 'text-emerald-600'
                  }`}
                >
                  ${vendor.pendingPayables.toLocaleString()}
                </span>

              </div>

            </div>

          ))

        )}

      </div>

      {/* Add Vendor Modal */}
      {showAddModal && (

        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">

          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-xl">

            <div>
              <h3 className="text-lg font-extrabold text-slate-900">
                Add New Vendor
              </h3>

              <p className="text-xs text-slate-500 mt-1">
                Enter the basic details of your supplier.
              </p>
            </div>

            {/* Duplicate Error */}
            {duplicateError && (

              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-700 flex items-center justify-between">

                <span>
                  {duplicateError}
                </span>

                <button
                  type="button"
                  onClick={() => setDuplicateError(null)}
                  className="text-red-500 hover:text-red-800 font-bold ml-2"
                >
                  ✕
                </button>

              </div>

            )}

            <form
              onSubmit={handleSubmit}
              className="space-y-3"
            >

              {/* Vendor Name */}
              <div>

                <label className="text-xs font-semibold text-slate-700">
                  Vendor Name
                </label>

                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="AWS or Google Cloud"
                  className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

              </div>

              {/* Category */}
              <div>

                <label className="text-xs font-semibold text-slate-700">
                  Category
                </label>

                <input
                  type="text"
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Cloud Infrastructure"
                  className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

              </div>

              {/* Email */}
              <div>

                <label className="text-xs font-semibold text-slate-700">
                  Contact Email
                </label>

                <input
                  type="email"
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="billing@vendor.com"
                  className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

              </div>

              {/* Phone */}
              <div>

                <label className="text-xs font-semibold text-slate-700">
                  Contact Phone
                </label>

                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+1 555 123 4567"
                  className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

              </div>

              {/* Buttons */}
              <div className="flex gap-2 pt-3 justify-end">

                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setDuplicateError(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="w-[145px] h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold shadow-sm transition-all"
                >
                  Save Vendor
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
};

