import React from 'react';
import { BarChart3, TrendingUp, DollarSign, Download, Calendar, AlertCircle } from 'lucide-react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar } from
'recharts';
import { computeRealAnalytics } from '../../lib/analyticsEngine';







export const AnalyticsView = ({
  invoices = [],
  expenses = [],
  receipts = []
}) => {
  const analytics = computeRealAnalytics(invoices, expenses, receipts);
  const {
    totalRevenue,
    totalExpenses,
    netProfit,
    profitMargin,
    cashFlow,
    expenseBreakdown,
    hasData
  } = analytics;

  const maxExpenseCategoryVal = expenseBreakdown.reduce((max, c) => Math.max(max, c.value), 1);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Financial Intelligence & Analytics</h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time P&L reporting, cash flow aggregation, and category breakdown calculated from actual database records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-500" />
            <span>Actual Records ({invoices.length + expenses.length + receipts.length})</span>
          </button>
        </div>
      </div>

      {/* Primary Revenue vs Expense Chart */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-extrabold text-slate-900">Monthly Net Income & Cash Flow Cushion ($)</h3>

        <div className="h-80 w-full pt-2">
          {cashFlow.length === 0 ?
          <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
              <AlertCircle className="w-10 h-10 text-slate-400 mb-3" />
              <p className="text-base font-semibold text-slate-800">Not enough data to generate cash-flow analytics.</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Add invoices or log expense receipts to view real revenue vs. expense trends over time.
              </p>
            </div> :

          <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashFlow} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <Tooltip
                contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                formatter={(val) => [`$${Number(val).toLocaleString()}`, '']} />
              
                <Bar dataKey="revenue" name="Revenue" fill="#2563EB" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#94A3B8" radius={[6, 6, 0, 0]} />
                <Bar dataKey="net" name="Net Profit" fill="#16A34A" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          }
        </div>
      </div>

      {/* Grid for Expense Breakdown & P&L Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900">Operating Cost Category Allocations</h3>
          
          {expenseBreakdown.length === 0 ?
          <div className="py-12 flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
              <AlertCircle className="w-8 h-8 text-slate-400 mb-2" />
              <p className="text-sm font-semibold text-slate-700">No expense data available.</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Scan receipts or log vendor expenses to generate category breakdowns.
              </p>
            </div> :

          <div className="space-y-3">
              {expenseBreakdown.map((item) =>
            <div key={item.name} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>{item.name}</span>
                    <span>${item.value.toLocaleString()} ({item.percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(100, item.value / maxExpenseCategoryVal * 100)}%`,
                    backgroundColor: item.color
                  }} />
                
                  </div>
                </div>
            )}
            </div>
          }
        </div>

        <div className="p-6 bg-slate-900 text-white rounded-2xl shadow-md space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <span className="text-[11px] uppercase font-bold text-blue-400">P&L High-Level Summary</span>
            <h3 className="text-2xl font-extrabold">${totalRevenue.toLocaleString()} Total Revenue</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Calculated dynamically from {invoices.length} stored invoice records and {expenses.length + receipts.length} total expense/receipt logs in your database.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-800 text-xs">
            <div>
              <p className="text-slate-400">Total Expenses</p>
              <p className="font-bold text-white text-base">${totalExpenses.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-slate-400">Net Profit Margin</p>
              <p className={`font-bold text-base ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {profitMargin.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>);

};