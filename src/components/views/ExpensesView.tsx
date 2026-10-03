// import React, { useState } from 'react';
// import { CreditCard, Plus, Filter, Search, Download, Trash2, CheckCircle2, DollarSign } from 'lucide-react';
// import { Expense, Vendor } from '../../types';
// import { Badge } from '../common/Badge';

// interface ExpensesViewProps {
//   expenses: Expense[];
//   vendors: Vendor[];
//   onAddExpense: (expense: Omit<Expense, 'id'>) => void;
// }

// export const ExpensesView: React.FC<ExpensesViewProps> = ({
//   expenses,
//   vendors,
//   onAddExpense,
// }) => {
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedCategory, setSelectedCategory] = useState<string>('All');
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [duplicateError, setDuplicateError] = useState<string | null>(null);

//   const [title, setTitle] = useState('');
//   const [category, setCategory] = useState('Cloud Infrastructure');
//   const [vendorName, setVendorName] = useState('Amazon Web Services (AWS)');
//   const [amount, setAmount] = useState<number>(150);
//   const [date, setDate] = useState('2026-08-06');
//   const [paymentMethod, setPaymentMethod] = useState('Corporate Card');

//   const categories = ['All', 'Cloud Infrastructure', 'SaaS Software', 'Travel & Fuel', 'Hardware & Equipment'];

//   const filteredExpenses = expenses.filter((e) => {
//     const matchesSearch =
//       e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       e.vendorName.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesCategory = selectedCategory === 'All' || e.category === selectedCategory;
//     return matchesSearch && matchesCategory;
//   });

//   const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();

//     const isDuplicate = expenses.some(
//       (exp) =>
//         exp.title.toLowerCase().trim() === title.toLowerCase().trim() &&
//         exp.vendorName.toLowerCase().trim() === vendorName.toLowerCase().trim() &&
//         exp.amount === amount &&
//         exp.date === date
//     );

//     if (isDuplicate) {
//       setDuplicateError('This data already exists! An expense record with matching details is already logged.');
//       return;
//     }

//     setDuplicateError(null);
//     onAddExpense({
//       title,
//       category,
//       vendorName,
//       amount,
//       tax: Math.round(amount * 0.08 * 100) / 100,
//       date,
//       paymentMethod,
//       status: 'Approved',
//     });
//     setShowAddModal(false);
//     setTitle('');
//   };

//   return (
//     <div className="space-y-6 pb-12">
//       {/* Header Banner */}
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white rounded-2xl border border-slate-200/90 shadow-xs">
//         <div>
//           <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Expenses & Operating Outflows</h2>
//           <p className="text-xs text-slate-500 mt-1">
//             Track business spending, subscription payables, and corporate card statements.
//           </p>
//         </div>

//         <div className="flex items-center gap-3">
//           <div className="text-right mr-2 hidden sm:block">
//             <span className="text-[11px] uppercase font-bold text-slate-400">Total Tracked</span>
//             <p className="text-lg font-bold text-slate-900">${totalSpent.toLocaleString()}</p>
//           </div>

//           <button
//             onClick={() => setShowAddModal(true)}
//             className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-2"
//           >
//             <Plus className="w-4 h-4" />
//             <span>Log Expense</span>
//           </button>
//         </div>
//       </div>

//       {/* Filter and Search */}
//       <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
//         <div className="relative w-full sm:w-80">
//           <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
//           <input
//             type="text"
//             placeholder="Filter expenses by vendor or title..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//         </div>

//         <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
//           {categories.map((cat) => (
//             <button
//               key={cat}
//               onClick={() => setSelectedCategory(cat)}
//               className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
//                 selectedCategory === cat
//                   ? 'bg-blue-600 text-white shadow-xs'
//                   : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
//               }`}
//             >
//               {cat}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Table */}
//       <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
//         <div className="overflow-x-auto">
//           <table className="w-full text-left text-xs border-collapse">
//             <thead>
//               <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
//                 <th className="py-3.5 px-4">Expense Title</th>
//                 <th className="py-3.5 px-4">Vendor</th>
//                 <th className="py-3.5 px-4">Category</th>
//                 <th className="py-3.5 px-4">Date</th>
//                 <th className="py-3.5 px-4">Payment Method</th>
//                 <th className="py-3.5 px-4">Amount</th>
//                 <th className="py-3.5 px-4">Status</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-slate-100 font-medium">
//               {filteredExpenses.map((exp) => (
//                 <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
//                   <td className="py-3.5 px-4 font-bold text-slate-900">{exp.title}</td>
//                   <td className="py-3.5 px-4 text-slate-700">{exp.vendorName}</td>
//                   <td className="py-3.5 px-4 text-slate-500">{exp.category}</td>
//                   <td className="py-3.5 px-4 text-slate-500">{exp.date}</td>
//                   <td className="py-3.5 px-4 text-slate-600">{exp.paymentMethod}</td>
//                   <td className="py-3.5 px-4 font-extrabold text-slate-900">${exp.amount.toLocaleString()}</td>
//                   <td className="py-3.5 px-4">
//                     <Badge status={exp.status} />
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Modal to log expense */}
//       {showAddModal && (
//         <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
//           <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-xl">
//             <h3 className="text-lg font-extrabold text-slate-900">Log New Expense</h3>

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
//                 <label className="text-xs font-semibold text-slate-700">Expense Title</label>
//                 <input
//                   type="text"
//                   required
//                   value={title}
//                   onChange={(e) => setTitle(e.target.value)}
//                   placeholder="e.g. Server hosting upgrade"
//                   className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-xs"
//                 />
//               </div>

//               <div>
//                 <label className="text-xs font-semibold text-slate-700">Vendor</label>
//                 <select
//                   value={vendorName}
//                   onChange={(e) => setVendorName(e.target.value)}
//                   className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-xs"
//                 >
//                   {vendors.map((v) => (
//                     <option key={v.id} value={v.name}>
//                       {v.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div>
//                 <label className="text-xs font-semibold text-slate-700">Amount ($)</label>
//                 <input
//                   type="number"
//                   required
//                   value={amount}
//                   onChange={(e) => setAmount(parseFloat(e.target.value))}
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
//                   Save Expense
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
import { CreditCard, Plus, Search, CalendarDays } from 'lucide-react';
import { Expense, Vendor } from '../../types';
import { Badge } from '../common/Badge';

interface ExpensesViewProps {
  expenses: Expense[];
  vendors: Vendor[];
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  expenses,
  vendors,
  onAddExpense,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [duplicateError, setDuplicateError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Cloud Infrastructure');
  const [vendorName, setVendorName] = useState(
    'Amazon Web Services (AWS)'
  );
  const [amount, setAmount] = useState<number>(150);
  const [date, setDate] = useState('2026-08-06');
  const [paymentMethod, setPaymentMethod] = useState('Corporate Card');

  const categories = [
    'All',
    'Cloud Infrastructure',
    'SaaS Software',
    'Travel & Fuel',
    'Hardware & Equipment',
  ];

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch =
      expense.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.vendorName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' ||
      expense.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const isDuplicate = expenses.some(
      (expense) =>
        expense.title.toLowerCase().trim() === title.toLowerCase().trim() &&
        expense.vendorName.toLowerCase().trim() ===
          vendorName.toLowerCase().trim() &&
        expense.amount === amount &&
        expense.date === date
    );

    if (isDuplicate) {
      setDuplicateError(
        'This expense already exists with the same details.'
      );
      return;
    }

    setDuplicateError(null);

    onAddExpense({
      title,
      category,
      vendorName,
      amount,
      tax: Math.round(amount * 0.08 * 100) / 100,
      date,
      paymentMethod,
      status: 'Approved',
    });

    setShowAddModal(false);
    setTitle('');
  };

  return (
    <div className="space-y-6 pb-12">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white rounded-2xl border border-slate-200/90 shadow-xs">

        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Expenses
          </h2>

          <p className="text-xs text-slate-500 mt-1">
            Track business spending, vendor payments, and operating expenses.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          //className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-2"
         className="w-[145px] h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold shadow-sm transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Log Expense</span>
        </button>

      </div>

      {/* Search */}
      <div className="relative w-full sm:w-80">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />

        <input
          type="text"
          placeholder="Search by expense or vendor..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Category Filters */}
      <div className="flex items-center gap-2 w-full overflow-x-auto pb-1">

        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}

      </div>

      {/* Expense Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {filteredExpenses.length === 0 ? (

          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-200">
            <CreditCard className="w-8 h-8 text-slate-300 mx-auto mb-3" />

            <p className="text-sm font-semibold text-slate-700">
              No expenses found
            </p>

            <p className="text-xs text-slate-400 mt-1">
              Try changing your search or category filter.
            </p>
          </div>

        ) : (

          filteredExpenses.map((expense) => (

            <div
              key={expense.id}
              className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4 hover:border-blue-300 transition-colors"
            >

              {/* Card Header */}
              <div className="flex items-center gap-3">

                <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200">
                  <CreditCard className="w-5 h-5 text-slate-600" />
                </div>

                <div className="min-w-0 flex-1">

                  <h3 className="text-sm font-extrabold text-slate-900 truncate">
                    {expense.title}
                  </h3>

                  <p className="text-xs text-slate-500 truncate">
                    {expense.vendorName}
                  </p>

                </div>

                <Badge status={expense.status} />

              </div>

              {/* Expense Details */}
              <div className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3">

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">
                    Category
                  </span>

                  <span className="font-medium text-slate-700">
                    {expense.category}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <CalendarDays className="w-3.5 h-3.5" />
                    Date
                  </span>

                  <span className="font-medium text-slate-700">
                    {expense.date}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">
                    Payment
                  </span>

                  <span className="font-medium text-slate-700">
                    {expense.paymentMethod}
                  </span>
                </div>

              </div>

              {/* Amount */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">

                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">
                    Amount
                  </p>

                  <p className="text-lg font-extrabold text-slate-900">
                    ${expense.amount.toLocaleString()}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">
                    Tax
                  </p>

                  <p className="text-xs font-semibold text-slate-600">
                    ${expense.tax.toLocaleString()}
                  </p>
                </div>

              </div>

            </div>

          ))

        )}

      </div>

      {/* Add Expense Modal */}
      {showAddModal && (

        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">

          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-xl">

            <h3 className="text-lg font-extrabold text-slate-900">
              Log New Expense
            </h3>

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

            <form
              onSubmit={handleSubmit}
              className="space-y-3"
            >

              {/* Expense Title */}
              <div>
                <label className="text-xs font-semibold text-slate-700">
                  Expense Title
                </label>

                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Server hosting upgrade"
                  className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Vendor */}
              <div>
                <label className="text-xs font-semibold text-slate-700">
                  Vendor
                </label>

                <select
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {vendors.map((vendor) => (
                    <option
                      key={vendor.id}
                      value={vendor.name}
                    >
                      {vendor.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="text-xs font-semibold text-slate-700">
                  Category
                </label>

                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories
                    .filter((cat) => cat !== 'All')
                    .map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="text-xs font-semibold text-slate-700">
                  Amount ($)
                </label>

                <input
                  type="number"
                  required
                  min="0"
                  value={amount}
                  onChange={(e) =>
                    setAmount(parseFloat(e.target.value))
                  }
                  className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Date */}
              <div>
                <label className="text-xs font-semibold text-slate-700">
                  Date
                </label>

                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="text-xs font-semibold text-slate-700">
                  Payment Method
                </label>

                <select
                  value={paymentMethod}
                  onChange={(e) =>
                    setPaymentMethod(e.target.value)
                  }
                  className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>Corporate Card</option>
                  <option>Bank Transfer</option>
                  <option>Credit Card</option>
                  <option>Cash</option>
                </select>
              </div>

              {/* Buttons */}
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
                  Save Expense
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
};

