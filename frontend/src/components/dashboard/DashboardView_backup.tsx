// import React from 'react';
// import { motion } from 'motion/react';
// import {
//   DollarSign,
//   TrendingUp,
//   CreditCard,
//   FileText,
//   Plus,
//   Scan,
//   Sparkles,
//   ArrowRight,
//   AlertCircle,
//   Clock,
//   CheckCircle,
//   ExternalLink,
//   Bot,
// } from 'lucide-react';
// import {
//   AreaChart,
//   Area,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
//   PieChart,
//   Pie,
//   Cell,
// } from 'recharts';
// import { StatCard } from '../common/StatCard';
// import { Badge } from '../common/Badge';
// import {
//   AiInsight,
//   Expense,
//   FinancialMetric,
//   Invoice,
//   Receipt,
//   TabType,
//   UserProfile,
// } from '../../types';
// import { EXPENSE_CATEGORY_DATA, MONTHLY_CASHFLOW_DATA } from '../../data/mockData';

// interface DashboardViewProps {
//   user: UserProfile;
//   invoices: Invoice[];
//   expenses: Expense[];
//   receipts: Receipt[];
//   aiInsights: AiInsight[];
//   onSelectTab: (tab: TabType) => void;
//   onOpenNewInvoice: () => void;
//   onOpenReceiptScan: () => void;
//   onSelectInvoice: (invoice: Invoice) => void;
// }

// export const DashboardView: React.FC<DashboardViewProps> = ({
//   user,
//   invoices,
//   expenses,
//   receipts,
//   aiInsights,
//   onSelectTab,
//   onOpenNewInvoice,
//   onOpenReceiptScan,
//   onSelectInvoice,
// }) => {
//   // Compute KPI metrics dynamically
//   const totalRevenue = invoices
//     .filter((i) => i.status === 'Paid')
//     .reduce((sum, i) => sum + i.total, 0);

//   const outstandingAmount = invoices
//     .filter((i) => i.status === 'Pending' || i.status === 'Overdue')
//     .reduce((sum, i) => sum + i.total, 0);

//   const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
//   const netProfit = totalRevenue - totalExpenses;
//   const margin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;

//   const overdueInvoices = invoices.filter((i) => i.status === 'Overdue');
//   const recentInvoices = invoices.slice(0, 5);

//   return (
//     <div className="space-y-6 pb-12">
//       {/* Welcome Hero Banner */}
//       {/* <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-900 text-white shadow-xl relative overflow-hidden"> */}
//            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white shadow-xl relative overflow-hidden">
//         <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-blue-500/10 blur-3xl pointer-events-none" />

//         <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
//           <div className="space-y-2">
//             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-semibold">
//               <Sparkles className="w-3.5 h-3.5" />
//               <span>Smart Financial Summary</span>
//             </div>
//             <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
//               Welcome back, {user.name} 👋
//             </h2>
//             <p className="text-slate-300 text-sm max-w-xl">
//               Your business liquidity is strong. You have{' '}
//               <span className="font-bold text-white">${outstandingAmount.toLocaleString()}</span> in pending receivables across {invoices.filter((i) => i.status === 'Pending').length} active invoices.
//             </p>
//           </div>

//           {/* Quick Action Button Group */}
//           <div className="flex flex-wrap items-center gap-3">
//             <button
//               onClick={onOpenReceiptScan}
//               className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-xs font-semibold border border-white/20 transition-all active:scale-95 flex items-center gap-2"
//             >
//               <Scan className="w-4 h-4 text-blue-300" />
//               <span>Scan Receipt</span>
//             </button>

//             <button
//               onClick={onOpenNewInvoice}
//               className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all active:scale-95 flex items-center gap-2"
//             >
//               <Plus className="w-4 h-4" />
//               <span>New Invoice</span>
//             </button>

//             <button
//               onClick={() => onSelectTab('copilot')}
//               className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all active:scale-95 flex items-center gap-2"
//             >
//               <Bot className="w-4 h-4" />
//               <span>Ask AI Copilot</span>
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* KPI Cards Grid */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
//         <StatCard
//           title="Total Paid Revenue"
//           value={`$${totalRevenue.toLocaleString()}`}
//           trend={{ value: '+18.4% vs last mo', isPositive: true }}
//           icon={DollarSign}
//           iconBgColor="bg-emerald-50"
//           iconTextColor="text-emerald-600"
//         />

//         <StatCard
//           title="Total Expenses"
//           value={`$${totalExpenses.toLocaleString()}`}
//           trend={{ value: '-4.2% optimized', isPositive: true }}
//           icon={CreditCard}
//           iconBgColor="bg-blue-50"
//           iconTextColor="text-blue-600"
//         />

//         <StatCard
//           title="Outstanding Receivables"
//           value={`$${outstandingAmount.toLocaleString()}`}
//           subtitle={`${invoices.filter((i) => i.status === 'Pending' || i.status === 'Overdue').length} open invoices`}
//           icon={Clock}
//           iconBgColor="bg-amber-50"
//           iconTextColor="text-amber-600"
//         />

//         <StatCard
//           title="Net Profit Margin"
//           value={`${margin}%`}
//           trend={{ value: 'Healthy liquidity', isPositive: true }}
//           icon={TrendingUp}
//           iconBgColor="bg-indigo-50"
//           iconTextColor="text-indigo-600"
//         />
//       </div>

//       {/* Main Charts Section */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Cash Flow Graph */}
//         <div className="lg:col-span-2 p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
//           <div className="flex items-center justify-between">
//             <div>
//               <h3 className="text-base font-bold text-slate-900 tracking-tight">
//                 Cash Flow Trends (Revenue vs Expenses)
//               </h3>
//               <p className="text-xs text-slate-500">Monthly financial momentum in USD</p>
//             </div>
//             <button
//               onClick={() => onSelectTab('analytics')}
//               className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
//             >
//               <span>Full Analytics</span>
//               <ArrowRight className="w-3.5 h-3.5" />
//             </button>
//           </div>

//           <div className="h-72 w-full pt-2">
//             <ResponsiveContainer width="100%" height="100%">
//               <AreaChart data={MONTHLY_CASHFLOW_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
//                 <defs>
//                   <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
//                     <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
//                     <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
//                   </linearGradient>
//                   <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
//                     <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.2} />
//                     <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
//                   </linearGradient>
//                 </defs>
//                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
//                 <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
//                 <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
//                 <Tooltip
//                   contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
//                 />
//                 <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
//                 <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#F59E0B" strokeWidth={2} fillOpacity={1} fill="url(#colorExp)" />
//               </AreaChart>
//             </ResponsiveContainer>
//           </div>
//         </div>

//         {/* Expense Category Pie Chart */}
//         <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
//           <div>
//             <h3 className="text-base font-bold text-slate-900 tracking-tight">
//               Expense Category Breakdown
//             </h3>
//             <p className="text-xs text-slate-500">Distribution across operational costs</p>
//           </div>

//           <div className="h-52 w-full relative flex items-center justify-center">
//             <ResponsiveContainer width="100%" height="100%">
//               <PieChart>
//                 <Pie
//                   data={EXPENSE_CATEGORY_DATA}
//                   cx="50%"
//                   cy="50%"
//                   innerRadius={55}
//                   outerRadius={80}
//                   paddingAngle={4}
//                   dataKey="value"
//                 >
//                   {EXPENSE_CATEGORY_DATA.map((entry, index) => (
//                     <Cell key={`cell-${index}`} fill={entry.color} />
//                   ))}
//                 </Pie>
//                 <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
//               </PieChart>
//             </ResponsiveContainer>
//           </div>

//           <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
//             {EXPENSE_CATEGORY_DATA.slice(0, 3).map((item, idx) => (
//               <div key={idx} className="flex items-center justify-between text-slate-600">
//                 <span className="flex items-center gap-2">
//                   <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
//                   {item.name}
//                 </span>
//                 <span className="font-bold text-slate-900">${item.value.toLocaleString()}</span>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* AI Insights & Recent Invoices Section */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Recent Invoices Table */}
//         <div className="lg:col-span-2 p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
//           <div className="flex items-center justify-between">
//             <h3 className="text-base font-bold text-slate-900 tracking-tight">
//               Recent Invoices
//             </h3>
//             <button
//               onClick={() => onSelectTab('invoices')}
//               className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
//             >
//               <span>View All ({invoices.length})</span>
//               <ArrowRight className="w-3.5 h-3.5" />
//             </button>
//           </div>

//           <div className="overflow-x-auto">
//             <table className="w-full text-left text-xs border-collapse">
//               <thead>
//                 <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
//                   <th className="py-3 px-2">Invoice #</th>
//                   <th className="py-3 px-2">Customer</th>
//                   <th className="py-3 px-2">Due Date</th>
//                   <th className="py-3 px-2">Amount</th>
//                   <th className="py-3 px-2">Status</th>
//                   <th className="py-3 px-2 text-right">Action</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-slate-100 font-medium">
//                 {recentInvoices.map((inv) => (
//                   <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
//                     <td className="py-3.5 px-2 font-bold text-slate-900">{inv.invoiceNumber}</td>
//                     <td className="py-3.5 px-2 text-slate-700">{inv.customerName}</td>
//                     <td className="py-3.5 px-2 text-slate-500">{inv.dueDate}</td>
//                     <td className="py-3.5 px-2 font-bold text-slate-900">
//                       ${inv.total.toLocaleString()}
//                     </td>
//                     <td className="py-3.5 px-2">
//                       <Badge status={inv.status} />
//                     </td>
//                     <td className="py-3.5 px-2 text-right">
//                       <button
//                         onClick={() => onSelectInvoice(inv)}
//                         className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
//                         title="View Invoice Details"
//                       >
//                         <ExternalLink className="w-4 h-4" />
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         {/* AI Financial Insights Column */}
//         <div className="p-6 bg-slate-900 text-white rounded-3xl shadow-xl space-y-4 flex flex-col justify-between">
//           <div>
//             <div className="flex items-center justify-between pb-3 border-b border-slate-800">
//               <span className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
//                 <Sparkles className="w-4 h-4 text-blue-400" /> AI Strategic Insights
//               </span>
//               <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-semibold">
//                 Updated Live
//               </span>
//             </div>

//             <div className="mt-4 space-y-3">
//               {aiInsights.map((insight) => (
//                 <div
//                   key={insight.id}
//                   className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-1.5"
//                 >
//                   <div className="flex items-center justify-between">
//                     <span className="text-xs font-bold text-white">{insight.title}</span>
//                     <span className="text-[11px] font-bold text-emerald-400">{insight.impact}</span>
//                   </div>
//                   <p className="text-xs text-slate-300 leading-relaxed">{insight.description}</p>
//                 </div>
//               ))}
//             </div>
//           </div>

//           <button
//             onClick={() => onSelectTab('copilot')}
//             className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
//           >
//             <Bot className="w-4 h-4" />
//             <span>Chat with FinSight Copilot</span>
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };












import React from 'react';
import {
  DollarSign,
  CreditCard,
  TrendingUp,
  Clock,
  ArrowRight,
  Bot,
  Plus,
  Scan,
  ExternalLink,
} from 'lucide-react';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

import { StatCard } from '../common/StatCard';
import { Badge } from '../common/Badge';
import {
  UserProfile,
  Invoice,
  Expense,
  Receipt,
  AiInsight,
  TabType,
} from '../../types';

import {
  MONTHLY_CASHFLOW_DATA,
  EXPENSE_CATEGORY_DATA,
} from '../../data/mockData';

interface DashboardViewProps {
  user: UserProfile;
  invoices: Invoice[];
  expenses: Expense[];
  receipts: Receipt[];
  aiInsights: AiInsight[];
  onSelectTab: (tab: TabType) => void;
  onOpenNewInvoice: () => void;
  onOpenReceiptScan: () => void;
  onSelectInvoice: (invoice: Invoice) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  invoices,
  expenses,
  receipts,
  aiInsights,
  onSelectTab,
  onOpenNewInvoice,
  onOpenReceiptScan,
  onSelectInvoice,
}) => {
  const totalRevenue = invoices
    .filter((i) => i.status === 'Paid')
    .reduce((sum, i) => sum + i.total, 0);

  const outstandingAmount = invoices
    .filter((i) => i.status === 'Pending' || i.status === 'Overdue')
    .reduce((sum, i) => sum + i.total, 0);

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  const netProfit = totalRevenue - totalExpenses;

  const margin =
    totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;

  const overdueInvoices = invoices.filter((i) => i.status === 'Overdue');

  const recentInvoices = invoices.slice(0, 5);

  return (
    <div className="space-y-6 pb-10 bg-slate-50 min-h-screen">

      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="p-6">

          <div className="flex flex-col lg:flex-row lg:justify-between gap-6">

            <div>
              <p className="text-xs uppercase tracking-[0.15em] text-slate-500 font-semibold">
                Financial Overview
              </p>

              <h1 className="mt-2 text-3xl font-bold text-slate-900">
                Welcome back, {user.name}
              </h1>

              <p className="mt-3 text-slate-600 max-w-2xl">
                Monitor revenue, expenses, invoices and business performance from one dashboard.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">

              <button
                onClick={onOpenReceiptScan}
                className="px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 flex items-center gap-2"
              >
                <Scan size={16} />
                Scan
              </button>

              <button
                onClick={onOpenNewInvoice}
                className="px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 flex items-center gap-2"
              >
                <Plus size={16} />
                New Invoice
              </button>

              <button
                onClick={() => onSelectTab('copilot')}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
              >
                <Bot size={16} />
                AI Copilot
              </button>

            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 border-t pt-5">

            <div>
              <p className="text-xs text-slate-500">Revenue</p>
              <h3 className="text-xl font-bold">${totalRevenue.toLocaleString()}</h3>
            </div>

            <div>
              <p className="text-xs text-slate-500">Expenses</p>
              <h3 className="text-xl font-bold">${totalExpenses.toLocaleString()}</h3>
            </div>

            <div>
              <p className="text-xs text-slate-500">Outstanding</p>
              <h3 className="text-xl font-bold">${outstandingAmount.toLocaleString()}</h3>
            </div>

            <div>
              <p className="text-xs text-slate-500">Profit Margin</p>
              <h3 className="text-xl font-bold">{margin}%</h3>
            </div>

          </div>

        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

        <StatCard
          title="Paid Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          trend={{ value: '18% growth', isPositive: true }}
          icon={DollarSign}
          iconBgColor="bg-emerald-100"
          iconTextColor="text-emerald-700"
        />

        <StatCard
          title="Business Expenses"
          value={`$${totalExpenses.toLocaleString()}`}
          trend={{ value: 'Cost Optimized', isPositive: true }}
          icon={CreditCard}
          iconBgColor="bg-blue-100"
          iconTextColor="text-blue-700"
        />

        <StatCard
          title="Outstanding"
          value={`$${outstandingAmount.toLocaleString()}`}
          subtitle={`${overdueInvoices.length} overdue invoices`}
          icon={Clock}
          iconBgColor="bg-amber-100"
          iconTextColor="text-amber-700"
        />

        <StatCard
          title="Net Margin"
          value={`${margin}%`}
          trend={{ value: 'Healthy', isPositive: true }}
          icon={TrendingUp}
          iconBgColor="bg-indigo-100"
          iconTextColor="text-indigo-700"
        />

      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-6">

        <div className="lg:col-span-2 bg-white rounded-2xl border p-5 shadow-sm">

          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-bold text-lg">Cash Flow</h3>
              <p className="text-sm text-slate-500">
                Monthly revenue vs expenses
              </p>
            </div>

            <button
              onClick={() => onSelectTab('analytics')}
              className="text-blue-600 text-sm flex items-center gap-1"
            >
              Analytics
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MONTHLY_CASHFLOW_DATA}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity={0.3}/>
                    <stop offset="100%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3"/>
                <XAxis dataKey="month"/>
                <YAxis/>
                <Tooltip/>

                <Area
                  dataKey="revenue"
                  stroke="#2563eb"
                  fill="url(#rev)"
                />

                <Area
                  dataKey="expenses"
                  stroke="#f59e0b"
                  fillOpacity={0}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl border p-5 shadow-sm">

          <h3 className="font-bold text-lg">Expense Split</h3>
          <p className="text-sm text-slate-500 mb-4">
            Category distribution
          </p>

          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={EXPENSE_CATEGORY_DATA}
                  dataKey="value"
                  innerRadius={50}
                  outerRadius={75}
                >
                  {EXPENSE_CATEGORY_DATA.map((item, i) => (
                    <Cell key={i} fill={item.color}/>
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 mt-3">
            {EXPENSE_CATEGORY_DATA.map((item, i) => (
              <div
                key={i}
                className="flex justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ background: item.color }}
                  />
                  {item.name}
                </div>

                <span className="font-semibold">
                  ${item.value}
                </span>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Bottom */}
      <div className="grid lg:grid-cols-3 gap-6">

        <div className="lg:col-span-2 bg-white rounded-2xl border p-5 shadow-sm">

          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">Recent Invoices</h3>

            <button
              onClick={() => onSelectTab('invoices')}
              className="text-blue-600 text-sm"
            >
              View All
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">

              <thead className="text-slate-500 border-b">
                <tr>
                  <th className="text-left py-2">Invoice</th>
                  <th className="text-left">Customer</th>
                  <th className="text-left">Amount</th>
                  <th className="text-left">Status</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {recentInvoices.map((inv) => (
                  <tr key={inv.id} className="border-b hover:bg-slate-50">

                    <td className="py-3 font-semibold">
                      {inv.invoiceNumber}
                    </td>

                    <td>{inv.customerName}</td>

                    <td>${inv.total.toLocaleString()}</td>

                    <td>
                      <Badge status={inv.status}/>
                    </td>

                    <td className="text-right">
                      <button
                        onClick={() => onSelectInvoice(inv)}
                        className="p-2 hover:bg-slate-100 rounded-lg"
                      >
                        <ExternalLink size={16}/>
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>
          </div>

        </div>

        <div className="bg-slate-900 rounded-2xl p-5 text-white">

          <div className="flex items-center gap-2 mb-4">
            <Bot size={18}/>
            <h3 className="font-bold">AI Business Insights</h3>
          </div>

          <div className="space-y-3">
            {aiInsights.map((item) => (
              <div
                key={item.id}
                className="bg-slate-800 rounded-xl p-3"
              >
                <div className="flex justify-between">
                  <h4 className="font-semibold text-sm">
                    {item.title}
                  </h4>

                  <span className="text-emerald-400 text-xs">
                    {item.impact}
                  </span>
                </div>

                <p className="text-xs text-slate-300 mt-1">
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          <button
            onClick={() => onSelectTab('copilot')}
            className="w-full mt-5 bg-blue-600 hover:bg-blue-700 rounded-xl py-3 font-semibold"
          >
            Open AI Copilot
          </button>

        </div>

      </div>

    </div>
  );
};
