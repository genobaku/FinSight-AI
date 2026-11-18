import React, { useState } from 'react';
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
  AlertCircle,
  FileText,
  FileSpreadsheet,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

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
  Cell
} from 'recharts';

import { Badge } from '../common/Badge';
import { computeRealAnalytics } from '../../lib/analyticsEngine';
import { useTheme } from '../../context/ThemeContext';

export const DashboardView = ({
  user,
  invoices = [],
  expenses = [],
  receipts = [],
  aiInsights = [],
  onSelectTab,
  onOpenNewInvoice,
  onOpenReceiptScan,
  onSelectInvoice
}) => {
  const [showStats, setShowStats] = useState(true);
  const [isFocusDismissed, setIsFocusDismissed] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const analytics = computeRealAnalytics(invoices, expenses, receipts);
  const { totalRevenue, totalExpenses, netProfit, profitMargin, cashFlow, expenseBreakdown } = analytics;

  const outstandingAmount = invoices
    .filter((invoice) => invoice.status === 'Pending' || invoice.status === 'Overdue')
    .reduce((sum, invoice) => sum + (invoice.total || 0), 0);

  const margin = profitMargin.toFixed(1);

  const overdueInvoices = invoices.filter((invoice) => invoice.status === 'Overdue');
  const pendingInvoices = invoices.filter((invoice) => invoice.status === 'Pending');
  const paidInvoices = invoices.filter((invoice) => invoice.status === 'Paid');
  const recentInvoices = invoices.slice(0, 5);

  const healthScore = totalRevenue > 0
    ? Math.min(100, Math.max(0, Math.round(((totalRevenue - totalExpenses) / totalRevenue) * 100) + 50))
    : 85;

  return (
    <div className="space-y-7 pb-12 font-sans text-slate-900 dark:text-slate-100 max-w-7xl mx-auto transition-colors">
      {/* =====================================================
           HERO SECTION (Welcome + Quick Streaks)
        ====================================================== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pt-2">
        {/* Left: Heading & Context Subtitle */}
        <div className="space-y-1.5">
          <h1 className="text-3xl sm:text-4xl font-normal tracking-tight text-slate-900 dark:text-white">
            Welcome, {user?.name || 'Explorer'}!
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-normal">
            You're on a roll! Jump back in, or start something new.
          </p>
        </div>

        {/* Right: Metrics Strip */}
        <div className="flex items-center gap-6 sm:gap-10 border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-200 dark:border-slate-800">
          {/* Streak Indicator */}
          <div className="text-center sm:text-left">
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Active streak</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">1</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">day (on track)</p>
          </div>

          {/* Tier Progress / Health Progress Ring */}
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-200 dark:text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-slate-900 dark:text-blue-500"
                  strokeDasharray={`${healthScore}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-[11px] font-bold text-slate-900 dark:text-white">{healthScore}%</span>
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Liquidity status</p>
              <p className="text-xs font-semibold text-slate-900 dark:text-white">Optimal</p>
            </div>
          </div>

          {/* Mini Activity Matrix (M T W T F S S) */}
          <div className="hidden md:block">
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Weekly activity</p>
            <div className="flex items-center gap-1.5 text-[9px] font-semibold text-slate-400 dark:text-slate-500">
              <span>M</span>
              <span>T</span>
              <span>W</span>
              <span>T</span>
              <span>F</span>
              <span>S</span>
              <span>S</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-slate-900 dark:bg-blue-500" />
              <span className="w-2 h-2 rounded-full bg-slate-900 dark:bg-blue-500" />
              <span className="w-2 h-2 rounded-full bg-slate-900 dark:bg-blue-500" />
              <span className="w-2 h-2 rounded-full bg-slate-900 dark:bg-blue-500" />
              <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700" />
              <span className="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-800" />
              <span className="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-800" />
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
           HORIZONTAL STATS ROW + HIDE STATS TOGGLE
        ====================================================== */}
      <div className="space-y-2">
        {showStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-3 border-y border-slate-200 dark:border-slate-800/80">
            {/* Stat 1: Revenue */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <FileText className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                <span>Paid Revenue</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  ${totalRevenue.toLocaleString()}
                </span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  {paidInvoices.length} paid
                </span>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">Total settled incoming</p>
            </div>

            {/* Stat 2: Total Expenses */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <CreditCard className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                <span>Total Expenses</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  ${totalExpenses.toLocaleString()}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {expenses.length} logs
                </span>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">Recorded operational costs</p>
            </div>

            {/* Stat 3: Receivables */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                <span>Receivables</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  ${outstandingAmount.toLocaleString()}
                </span>
                <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                  {pendingInvoices.length} pending
                </span>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">Active open invoices</p>
            </div>

            {/* Stat 4: Net Margin */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <TrendingUp className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                <span>Net Profit</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  ${netProfit.toLocaleString()}
                </span>
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                  {margin}%
                </span>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">Net operating margin</p>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={() => setShowStats(!showStats)}
            className="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 py-1"
          >
            <span>{showStats ? 'Hide stats' : 'Show stats'}</span>
            {showStats ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* =====================================================
           "CHOOSE A FOCUS FOR TODAY" CARDS
        ====================================================== */}
      {!isFocusDismissed && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                How to start: Choose a focus for today
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Help us make relevant suggestions for your financial workflow
              </p>
            </div>
            <button
              onClick={() => setIsFocusDismissed(true)}
              className="p-1 rounded-full text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Dismiss suggestions"
            >
              <span className="text-sm font-bold">✕</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Card 1 */}
            <div
              onClick={onOpenReceiptScan}
              className="group cursor-pointer rounded-2xl border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-[#121824] overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="h-32 bg-gradient-to-br from-amber-100/60 via-amber-50 to-orange-50 dark:from-amber-950/40 dark:via-slate-900 dark:to-orange-950/30 relative flex items-center justify-center p-4">
                <div className="w-14 h-14 rounded-full bg-white dark:bg-[#1a2234] shadow-xs border border-slate-200/60 dark:border-slate-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Scan className="w-6 h-6 text-slate-900 dark:text-amber-300" />
                </div>
              </div>
              <div className="p-4 bg-white dark:bg-[#121824] border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    AI Receipt & OCR Extraction
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Parse line-items and taxes automatically</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>

            {/* Card 2 */}
            <div
              onClick={onOpenNewInvoice}
              className="group cursor-pointer rounded-2xl border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-[#121824] overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="h-32 bg-gradient-to-br from-sky-100/60 via-sky-50 to-blue-50 dark:from-blue-950/40 dark:via-slate-900 dark:to-sky-950/30 relative flex items-center justify-center p-4">
                <div className="w-14 h-14 rounded-full bg-white dark:bg-[#1a2234] shadow-xs border border-slate-200/60 dark:border-slate-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Plus className="w-6 h-6 text-slate-900 dark:text-blue-400" />
                </div>
              </div>
              <div className="p-4 bg-white dark:bg-[#121824] border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    Draft & Send Invoices
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Generate compliant PDF bills with tax totals</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>

            {/* Card 3 */}
            <div
              onClick={() => onSelectTab('copilot')}
              className="group cursor-pointer rounded-2xl border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-[#121824] overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="h-32 bg-gradient-to-br from-emerald-100/60 via-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:via-slate-900 dark:to-teal-950/30 relative flex items-center justify-center p-4">
                <div className="w-14 h-14 rounded-full bg-white dark:bg-[#1a2234] shadow-xs border border-slate-200/60 dark:border-slate-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Bot className="w-6 h-6 text-slate-900 dark:text-emerald-400" />
                </div>
              </div>
              <div className="p-4 bg-white dark:bg-[#121824] border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    Ask Finsight Copilot
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Get real-time insights on your financial health</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
           CHARTS ROW (Cash Flow & Expense Breakdown)
        ====================================================== */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* CASH FLOW CHART */}
        <div className="xl:col-span-2 bg-white dark:bg-[#121824] border border-slate-200/90 dark:border-slate-800/80 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Cash Flow Trends
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Monthly revenue vs. recorded expenses in USD
              </p>
            </div>

            <button
              onClick={() => onSelectTab('analytics')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"
            >
              <span>View full analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 pt-2">
            {cashFlow.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-slate-50/60 dark:bg-slate-900/60 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                <AlertCircle className="w-8 h-8 text-slate-400 dark:text-slate-500 mb-2" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Not enough data for cash-flow analytics.</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                  Create invoices or record expenses to automatically populate cash flow trends over time.
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={cashFlow}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={isDark ? '#3b82f6' : '#2563EB'} stopOpacity={0.25} />
                      <stop offset="100%" stopColor={isDark ? '#3b82f6' : '#2563EB'} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#1e293b' : '#F1F5F9'} />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748B' }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748B' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#1e293b' : '#0F172A',
                      borderRadius: '8px',
                      border: 'none',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                    formatter={(val) => [`$${Number(val).toLocaleString()}`, '']}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke={isDark ? '#3b82f6' : '#2563EB'}
                    strokeWidth={2}
                    fill="url(#revenueFill)"
                  />
                  <Area
                    type="monotone"
                    dataKey="expenses"
                    name="Expenses"
                    stroke="#94A3B8"
                    strokeWidth={1.5}
                    fill="transparent"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* EXPENSE BREAKDOWN PIE */}
        <div className="bg-white dark:bg-[#121824] border border-slate-200/90 dark:border-slate-800/80 rounded-2xl p-5 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800/80">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Expense Breakdown
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Distribution across operational cost categories
            </p>
          </div>

          <div className="p-1">
            {expenseBreakdown.length === 0 ? (
              <div className="h-52 flex flex-col items-center justify-center text-center p-6 bg-slate-50/60 dark:bg-slate-900/60 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                <AlertCircle className="w-8 h-8 text-slate-400 dark:text-slate-500 mb-2" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No expense data available.</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                  Scan receipts or log vendor expenses to generate category breakdowns.
                </p>
              </div>
            ) : (
              <>
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expenseBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={68}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {expenseBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: isDark ? '#1e293b' : '#0F172A',
                          borderRadius: '8px',
                          border: 'none',
                          color: '#fff',
                          fontSize: '12px'
                        }}
                        formatter={(val) => [`$${Number(val).toLocaleString()}`, 'Amount']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-1.5 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                  {expenseBreakdown.slice(0, 4).map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="text-slate-600 dark:text-slate-300 truncate">{item.name}</span>
                      </div>
                      <span className="font-semibold text-slate-900 dark:text-white">${item.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* =====================================================
           RECENT INVOICES TABLE
        ====================================================== */}
      <div className="bg-white dark:bg-[#121824] border border-slate-200/90 dark:border-slate-800/80 rounded-2xl shadow-2xs overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800/80">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Recent Invoices
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Latest invoice activity & status
            </p>
          </div>

          <button
            onClick={() => onSelectTab('invoices')}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"
          >
            <span>View all ({invoices.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800/80 text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider bg-slate-50/50 dark:bg-slate-900/50">
                <th className="py-3 px-6">Invoice #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {recentInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 dark:text-slate-400">
                    No invoices created yet. Click "Create" in the sidebar or top banner to get started.
                  </td>
                </tr>
              ) : (
                recentInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-850/60 transition-colors">
                    <td className="py-3.5 px-6 font-semibold text-slate-900 dark:text-white">
                      {invoice.invoiceNumber}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                      {invoice.customerName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                      {invoice.dueDate}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                      ${invoice.total.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge status={invoice.status} />
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <button
                        onClick={() => onSelectInvoice(invoice)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="View invoice"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =====================================================
           BOTTOM ROW: INVOICE BREAKDOWN & AI INSIGHTS
        ====================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* INVOICE STATUS OVERVIEW */}
        <div className="bg-white dark:bg-[#121824] border border-slate-200/90 dark:border-slate-800/80 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Invoice Status
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Current receivables overview
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-emerald-50/80 dark:bg-emerald-950/20 border border-emerald-100/80 dark:border-emerald-900/30 rounded-xl p-3.5">
              <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">Paid</p>
              <p className="text-xl font-bold text-emerald-950 dark:text-emerald-100 mt-1">{paidInvoices.length}</p>
              <p className="text-[10px] text-emerald-700/80 dark:text-emerald-400/80 mt-0.5">Settled invoices</p>
            </div>

            <div className="bg-amber-50/80 dark:bg-amber-950/20 border border-amber-100/80 dark:border-amber-900/30 rounded-xl p-3.5">
              <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">Pending</p>
              <p className="text-xl font-bold text-amber-950 dark:text-amber-100 mt-1">{pendingInvoices.length}</p>
              <p className="text-[10px] text-amber-700/80 dark:text-amber-400/80 mt-0.5">Awaiting payment</p>
            </div>

            <div className="bg-red-50/80 dark:bg-red-950/20 border border-red-100/80 dark:border-red-900/30 rounded-xl p-3.5">
              <p className="text-xs font-semibold text-red-800 dark:text-red-300">Overdue</p>
              <p className="text-xl font-bold text-red-950 dark:text-red-100 mt-1">{overdueInvoices.length}</p>
              <p className="text-[10px] text-red-700/80 dark:text-red-400/80 mt-0.5">Action required</p>
            </div>
          </div>
        </div>

        {/* AI FINANCIAL COPILOT INSIGHTS */}
        <div className="bg-white dark:bg-[#121824] border border-slate-200/90 dark:border-slate-800/80 rounded-2xl p-5 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-slate-900 dark:text-white" />
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Financial Insights
                </h2>
              </div>

              <button
                onClick={() => onSelectTab('copilot')}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              >
                Open Copilot
              </button>
            </div>

            <div className="mt-3 space-y-2.5">
              {aiInsights.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                  No automated insights yet. As you process invoices and receipts, AI recommendations will automatically appear here.
                </div>
              ) : (
                aiInsights.slice(0, 3).map((insight) => (
                  <div
                    key={insight.id}
                    className="flex gap-3 p-3 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800"
                  >
                    <div className="mt-0.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-slate-900 dark:text-white">{insight.title}</p>
                        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                          {insight.impact}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                        {insight.description}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={() => onSelectTab('copilot')}
            className="w-full mt-3 py-2.5 rounded-full bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-950 font-medium text-xs transition-colors flex items-center justify-center gap-2"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Chat with FinSight Copilot</span>
          </button>
        </div>
      </div>
    </div>
  );
};
