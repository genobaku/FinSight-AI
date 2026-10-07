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
// // import { EXPENSE_CATEGORY_DATA, MONTHLY_CASHFLOW_DATA } from '../../data/mockData';

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
  TrendingUp,
  CreditCard,
  Plus,
  Scan,
  ArrowRight,
  Clock,
  Bot,
  ExternalLink,
  Sparkles,
  AlertCircle } from
'lucide-react';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell } from
'recharts';

import { StatCard } from '../common/StatCard';
import { Badge } from '../common/Badge';


import { computeRealAnalytics } from '../../lib/analyticsEngine';













export const DashboardView = ({
  user,
  invoices = [],
  expenses = [],
  receipts = [],
  aiInsights,
  onSelectTab,
  onOpenNewInvoice,
  onOpenReceiptScan,
  onSelectInvoice
}) => {
  const analytics = computeRealAnalytics(invoices, expenses, receipts);
  const { totalRevenue, totalExpenses, netProfit, profitMargin, cashFlow, expenseBreakdown } = analytics;

  const outstandingAmount = invoices.
  filter(
    (invoice) =>
    invoice.status === 'Pending' || invoice.status === 'Overdue'
  ).
  reduce((sum, invoice) => sum + (invoice.total || 0), 0);

  const margin = profitMargin.toFixed(1);

  const overdueInvoices = invoices.filter(
    (invoice) => invoice.status === 'Overdue'
  );

  const pendingInvoices = invoices.filter(
    (invoice) => invoice.status === 'Pending'
  );

  const recentInvoices = invoices.slice(0, 5);

  return (
    <div className="space-y-6 pb-10">

      {/* =====================================================
           PAGE HEADER
        ====================================================== */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div>
          <p className="text-sm text-slate-500">
            Financial dashboard
          </p>

          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            Welcome back, {user.name}
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Here's what's happening with your business today.
          </p>
        </div>

        <div className="flex items-center gap-2">

          <button
            onClick={onOpenReceiptScan}
            className="
              flex items-center gap-2
              px-4 py-2
              rounded-lg
              border border-slate-200
              bg-white
              text-sm font-medium text-slate-700
              hover:bg-slate-50
              transition-colors
            ">









            
            <Scan className="w-4 h-4" />
            Scan Receipt
          </button>

          <button
            onClick={onOpenNewInvoice}
            className="
              flex items-center gap-2
              px-4 py-2
              rounded-lg
              bg-slate-900
              text-white
              text-sm font-medium
              hover:bg-slate-800
              transition-colors
            ">









            
            <Plus className="w-4 h-4" />
            New Invoice
          </button>

        </div>
      </div>


      {/* =====================================================
           QUICK SUMMARY
        ====================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <div className="bg-white border border-slate-200 rounded-xl p-4">

          <p className="text-xs font-medium text-slate-500">
            Revenue
          </p>

          <p className="text-xl font-bold text-slate-900 mt-2">
            ${totalRevenue.toLocaleString()}
          </p>

          <p className="text-xs text-emerald-600 mt-1">
            Paid invoices
          </p>

        </div>


        <div className="bg-white border border-slate-200 rounded-xl p-4">

          <p className="text-xs font-medium text-slate-500">
            Expenses
          </p>

          <p className="text-xl font-bold text-slate-900 mt-2">
            ${totalExpenses.toLocaleString()}
          </p>

          <p className="text-xs text-slate-500 mt-1">
            Total recorded expenses
          </p>

        </div>


        <div className="bg-white border border-slate-200 rounded-xl p-4">

          <p className="text-xs font-medium text-slate-500">
            Receivables
          </p>

          <p className="text-xl font-bold text-slate-900 mt-2">
            ${outstandingAmount.toLocaleString()}
          </p>

          <p className="text-xs text-amber-600 mt-1">
            {pendingInvoices.length} pending invoices
          </p>

        </div>


        <div className="bg-white border border-slate-200 rounded-xl p-4">

          <p className="text-xs font-medium text-slate-500">
            Net Profit
          </p>

          <p className="text-xl font-bold text-slate-900 mt-2">
            ${netProfit.toLocaleString()}
          </p>

          <p className="text-xs text-blue-600 mt-1">
            {margin}% margin
          </p>

        </div>

      </div>


      {/* =====================================================
           KPI CARDS
        ====================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <StatCard
          title="Paid Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          trend={{
            value: '+18.4% vs last month',
            isPositive: true
          }}
          icon={DollarSign}
          iconBgColor="bg-emerald-50"
          iconTextColor="text-emerald-600" />
        


        <StatCard
          title="Total Expenses"
          value={`$${totalExpenses.toLocaleString()}`}
          trend={{
            value: '-4.2% optimized',
            isPositive: true
          }}
          icon={CreditCard}
          iconBgColor="bg-blue-50"
          iconTextColor="text-blue-600" />
        


        <StatCard
          title="Outstanding"
          value={`$${outstandingAmount.toLocaleString()}`}
          subtitle={`${invoices.filter(
            (invoice) =>
            invoice.status === 'Pending' ||
            invoice.status === 'Overdue'
          ).length} open invoices`}
          icon={Clock}
          iconBgColor="bg-amber-50"
          iconTextColor="text-amber-600" />
        


        <StatCard
          title="Profit Margin"
          value={`${margin}%`}
          trend={{
            value: 'Current margin',
            isPositive: true
          }}
          icon={TrendingUp}
          iconBgColor="bg-slate-100"
          iconTextColor="text-slate-700" />
        

      </div>


      {/* =====================================================
           MAIN CONTENT
        ====================================================== */}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* CASH FLOW */}

        <div className="xl:col-span-2 bg-white border border-slate-200 rounded-xl">

          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">

            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Cash Flow
              </h2>

              <p className="text-xs text-slate-500 mt-1">
                Revenue and expenses over time
              </p>
            </div>

            <button
              onClick={() => onSelectTab('analytics')}
              className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
              
              View analytics
              <ArrowRight className="w-3 h-3" />
            </button>

          </div>


          <div className="h-72 p-4">
            {cashFlow.length === 0 ?
            <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
                <AlertCircle className="w-8 h-8 text-slate-400 mb-2" />
                <p className="text-sm font-semibold text-slate-700">Not enough data to generate cash-flow analytics.</p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Create invoices or record expenses to automatically populate cash flow trends over time.
                </p>
              </div> :

            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                data={cashFlow}
                margin={{
                  top: 10,
                  right: 10,
                  left: -20,
                  bottom: 0
                }}>
                
                  <defs>
                    <linearGradient
                    id="revenueFill"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1">
                    
                      <stop
                      offset="0%"
                      stopColor="#2563EB"
                      stopOpacity={0.25} />
                    
                      <stop
                      offset="100%"
                      stopColor="#2563EB"
                      stopOpacity={0} />
                    
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E2E8F0" />
                

                  <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 11,
                    fill: '#64748B'
                  }} />
                

                  <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 11,
                    fill: '#64748B'
                  }} />
                

                  <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    fontSize: '12px'
                  }}
                  formatter={(val) => [`$${Number(val).toLocaleString()}`, '']} />
                

                  <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="#2563EB"
                  strokeWidth={2}
                  fill="url(#revenueFill)" />
                

                  <Area
                  type="monotone"
                  dataKey="expenses"
                  name="Expenses"
                  stroke="#94A3B8"
                  strokeWidth={2}
                  fill="transparent" />
                
                </AreaChart>
              </ResponsiveContainer>
            }
          </div>

        </div>


        {/* EXPENSE BREAKDOWN */}

        <div className="bg-white border border-slate-200 rounded-xl">

          <div className="px-5 py-4 border-b border-slate-100">

            <h2 className="text-sm font-semibold text-slate-900">
              Expense Breakdown
            </h2>

            <p className="text-xs text-slate-500 mt-1">
              Where your money is going
            </p>

          </div>


          <div className="p-4">

            {expenseBreakdown.length === 0 ?
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
                <AlertCircle className="w-8 h-8 text-slate-400 mb-2" />
                <p className="text-sm font-semibold text-slate-700">No expense data available.</p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Scan receipts or log vendor expenses to generate category breakdowns.
                </p>
              </div> :

            <>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                      data={expenseBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={72}
                      paddingAngle={3}
                      dataKey="value">
                      
                        {expenseBreakdown.map(
                        (entry, index) =>
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color} />


                      )}
                      </Pie>

                      <Tooltip formatter={(val) => [`$${Number(val).toLocaleString()}`, 'Amount']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-2 mt-2">
                  {expenseBreakdown.
                slice(0, 4).
                map((item, index) =>
                <div
                  key={index}
                  className="flex items-center justify-between text-xs">
                  
                        <div className="flex items-center gap-2">
                          <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{
                        backgroundColor: item.color
                      }} />
                    

                          <span className="text-slate-600">
                            {item.name}
                          </span>
                        </div>

                        <span className="font-semibold text-slate-900">
                          ${item.value.toLocaleString()}
                        </span>
                      </div>
                )}
                </div>
              </>
            }

          </div>

        </div>

      </div>


      {/* =====================================================
           RECENT INVOICES
        ====================================================== */}

      <div className="bg-white border border-slate-200 rounded-xl">

        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">

          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Recent Invoices
            </h2>

            <p className="text-xs text-slate-500 mt-1">
              Latest invoice activity
            </p>
          </div>

          <button
            onClick={() => onSelectTab('invoices')}
            className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
            
            View all
            <ArrowRight className="w-3 h-3" />
          </button>

        </div>


        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>

              <tr className="border-b border-slate-100">

                <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Invoice
                </th>

                <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Customer
                </th>

                <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Due Date
                </th>

                <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Amount
                </th>

                <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Status
                </th>

                <th className="px-5 py-3"></th>

              </tr>

            </thead>


            <tbody>

              {recentInvoices.map((invoice) =>

              <tr
                key={invoice.id}
                className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                

                  <td className="px-5 py-4 text-sm font-semibold text-slate-900">
                    {invoice.invoiceNumber}
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-600">
                    {invoice.customerName}
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-500">
                    {invoice.dueDate}
                  </td>

                  <td className="px-5 py-4 text-sm font-semibold text-slate-900">
                    ${invoice.total.toLocaleString()}
                  </td>

                  <td className="px-5 py-4">
                    <Badge status={invoice.status} />
                  </td>

                  <td className="px-5 py-4 text-right">

                    <button
                    onClick={() =>
                    onSelectInvoice(invoice)
                    }
                    className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-900"
                    title="View invoice">
                    
                      <ExternalLink className="w-4 h-4" />
                    </button>

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>


      {/* =====================================================
           BOTTOM INFORMATION
        ====================================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* INVOICE STATUS */}

        <div className="bg-white border border-slate-200 rounded-xl p-5">

          <div className="flex items-center justify-between">

            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Invoice Status
              </h2>

              <p className="text-xs text-slate-500 mt-1">
                Current receivables overview
              </p>
            </div>

            <FileTextIcon />

          </div>


          <div className="grid grid-cols-3 gap-3 mt-5">

            <div className="bg-emerald-50 rounded-lg p-3">

              <p className="text-xs text-emerald-700">
                Paid
              </p>

              <p className="text-lg font-bold text-emerald-900 mt-1">
                {invoices.filter(
                  (invoice) => invoice.status === 'Paid'
                ).length}
              </p>

            </div>


            <div className="bg-amber-50 rounded-lg p-3">

              <p className="text-xs text-amber-700">
                Pending
              </p>

              <p className="text-lg font-bold text-amber-900 mt-1">
                {pendingInvoices.length}
              </p>

            </div>


            <div className="bg-red-50 rounded-lg p-3">

              <p className="text-xs text-red-700">
                Overdue
              </p>

              <p className="text-lg font-bold text-red-900 mt-1">
                {overdueInvoices.length}
              </p>

            </div>

          </div>

        </div>


        {/* AI INSIGHTS */}

        <div className="bg-white border border-slate-200 rounded-xl p-5">

          <div className="flex items-center justify-between">

            <div>

              <div className="flex items-center gap-2">

                <Bot className="w-4 h-4 text-blue-600" />

                <h2 className="text-sm font-semibold text-slate-900">
                  Financial Insights
                </h2>

              </div>

              <p className="text-xs text-slate-500 mt-1">
                Suggestions based on your financial activity
              </p>

            </div>

            <button
              onClick={() => onSelectTab('copilot')}
              className="text-xs font-medium text-blue-600 hover:text-blue-700">
              
              Open Copilot
            </button>

          </div>


          <div className="mt-4 space-y-3">

            {aiInsights.slice(0, 3).map((insight) =>

            <div
              key={insight.id}
              className="flex gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
              

                <div className="mt-0.5">

                  <Sparkles className="w-4 h-4 text-blue-600" />

                </div>

                <div className="min-w-0">

                  <div className="flex items-center justify-between gap-2">

                    <p className="text-xs font-semibold text-slate-900">
                      {insight.title}
                    </p>

                    <span className="text-[10px] font-semibold text-emerald-600 whitespace-nowrap">
                      {insight.impact}
                    </span>

                  </div>

                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {insight.description}
                  </p>

                </div>

              </div>

            )}

          </div>

        </div>

      </div>

    </div>);

};


/* Small local icon component */

const FileTextIcon = () =>
<div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
    <svg
    className="w-4 h-4 text-slate-600"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2">
    
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  </div>;