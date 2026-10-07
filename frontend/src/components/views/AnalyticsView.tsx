import React from 'react';
import { BarChart3, TrendingUp, DollarSign, Download, Calendar } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { MONTHLY_CASHFLOW_DATA, EXPENSE_CATEGORY_DATA } from '../../data/mockData';

export const AnalyticsView: React.FC = () => {
  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Financial Intelligence & Analytics</h2>
          <p className="text-xs text-slate-500 mt-1">
            Deep P&L reporting, quarterly cash flow momentum, and vendor spending velocity charts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-500" />
            <span>2026 Year-to-Date</span>
          </button>
          <button className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs">
            <Download className="w-4 h-4" />
            <span>Export Financial PDF</span>
          </button>
        </div>
      </div>

      {/* Primary Revenue vs Expense Chart */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-extrabold text-slate-900">Monthly Net Income & Cash Cushion ($)</h3>

        <div className="h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={MONTHLY_CASHFLOW_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
              />
              <Bar dataKey="revenue" name="Revenue" fill="#2563EB" radius={[6, 6, 0, 0]} />
              <Bar dataKey="expenses" name="Expenses" fill="#94A3B8" radius={[6, 6, 0, 0]} />
              <Bar dataKey="net" name="Net Profit" fill="#16A34A" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid for Expense Velocity & Revenue Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900">Operating Cost Category Allocations</h3>
          <div className="space-y-3">
            {EXPENSE_CATEGORY_DATA.map((item) => (
              <div key={item.name} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>{item.name}</span>
                  <span>${item.value.toLocaleString()}</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(100, (item.value / 15000) * 100)}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 bg-slate-900 text-white rounded-2xl shadow-md space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <span className="text-[11px] uppercase font-bold text-blue-400">P&L High-Level Summary</span>
            <h3 className="text-2xl font-extrabold">$372,000 YTD Gross Revenue</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Based on present client retainers and recurring cloud expenses, your projected annual runway exceeds 18 months with zero debt financing required.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-800 text-xs">
            <div>
              <p className="text-slate-400">Total YTD Expenses</p>
              <p className="font-bold text-white text-base">$206,000</p>
            </div>
            <div>
              <p className="text-slate-400">Average Net Margin</p>
              <p className="font-bold text-emerald-400 text-base">44.6%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
