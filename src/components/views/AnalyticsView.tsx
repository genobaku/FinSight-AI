
import React from 'react';
import { BarChart3, Download, Calendar, TrendingUp, ReceiptText } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { MONTHLY_CASHFLOW_DATA, EXPENSE_CATEGORY_DATA } from '../../data/mockData';

export const AnalyticsView: React.FC = () => {
  const totalRevenue = MONTHLY_CASHFLOW_DATA.reduce(
    (sum, item) => sum + Number(item.revenue || 0),
    0
  );


  const totalExpenses = MONTHLY_CASHFLOW_DATA.reduce(
    (sum, item) => sum + Number(item.expenses || 0),
    0
  );

  const totalNet = MONTHLY_CASHFLOW_DATA.reduce(
    (sum, item) => sum + Number(item.net || 0),
    0
  );

  const netMargin = totalRevenue > 0 ? (totalNet / totalRevenue) * 100 : 0;

  const totalCategoryExpenses = EXPENSE_CATEGORY_DATA.reduce(
    (sum, item) => sum + Number(item.value || 0),
    0
  );
  const formatCurrency = (value: number) =>
    `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;

  return (
    <div className="space-y-6 pb-12">
      {/* Page header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            <BarChart3 className="w-4 h-4" />
            <span className="text-xs font-medium">Financial analytics</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Analytics
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Review revenue, spending and monthly cash flow in one place.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="h-10 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <Calendar className="w-4 h-4 text-slate-500" />
            <span>2026 YTD</span>
          </button>

          <button
            type="button"
            className="w-[145px] h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>
       {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-xs font-medium text-slate-500">Revenue</p>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {formatCurrency(totalRevenue)}
          </p>
          <p className="text-xs text-slate-400 mt-1">Year to date</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-xs font-medium text-slate-500">Expenses</p>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {formatCurrency(totalExpenses)}
          </p>
          <p className="text-xs text-slate-400 mt-1">Year to date</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500">Net income</p>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {formatCurrency(totalNet)}
          </p>
          <p className="text-xs text-slate-400 mt-1">Revenue minus expenses</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-xs font-medium text-slate-500">Net margin</p>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {netMargin.toFixed(1)}%
          </p>
          <p className="text-xs text-slate-400 mt-1">Based on available data</p>
        </div>
      </div>

 {/* Cash flow */}
      <div className="bg-white border border-slate-200 rounded-xl">
        <div className="px-6 py-5 border-b border-slate-100">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Monthly cash flow
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Revenue, expenses and net income by month.
              </p>
            </div>
          </div>
        </div>
        <div className="h-80 w-full p-5">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={MONTHLY_CASHFLOW_DATA}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              barGap={6}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#E2E8F0"
              />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: '#64748B' }}

/>
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: '#64748B' }}
              />
              <Tooltip
                cursor={{ fill: '#F8FAFC' }}
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '10px',
                  color: '#0F172A',
                  fontSize: '12px',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
                }}
              />
              <Bar
                dataKey="revenue"
                name="Revenue"
                fill="#334155"
                radius={[4, 4, 0, 0]}
                maxBarSize={28}
              />
            <Bar
                dataKey="expenses"
                name="Expenses"
                fill="#CBD5E1"
                radius={[4, 4, 0, 0]}
                maxBarSize={28}
              />
              <Bar
                dataKey="net"
                name="Net income"
                fill="#16A34A"
                radius={[4, 4, 0, 0]}
                maxBarSize={28}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="px-6 pb-5 flex flex-wrap items-center gap-5 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm bg-slate-700" />
            Revenue
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm bg-slate-300" />
            Expenses
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600" />
            Net income
          </div>
        </div>
      </div>

  {/* Expense breakdown + financial snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl">
          <div className="px-6 py-5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ReceiptText className="w-4 h-4 text-slate-500" />
              <h3 className="text-base font-semibold text-slate-900">
                Expense breakdown
              </h3>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Current spending by category.
            </p>
          </div>
        
          <div className="p-6 space-y-4">
            {EXPENSE_CATEGORY_DATA.map((item) => {
              const percentage =
                totalCategoryExpenses > 0
                  ? (Number(item.value || 0) / totalCategoryExpenses) * 100
                  : 0;

              return (
                <div key={item.name}>
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <span className="text-sm font-medium text-slate-700">
                      {item.name}
                    </span>
                    <span className="text-sm font-semibold text-slate-900">
                      {formatCurrency(Number(item.value || 0))}
                    </span>
                  </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(100, percentage)}%`,
                      backgroundColor: '#64748B',
                      }}
                    />
                  </div>

                  <p className="text-[11px] text-slate-400 mt-1">
                    {percentage.toFixed(0)}% of listed expenses
                  </p>
                </div>
              );
            })}
          </div>
        </div>
               <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Financial snapshot
          </p>

          <h3 className="text-xl font-semibold text-slate-900 mt-2">
            A clear view of your current position
          </h3>

          <p className="text-sm text-slate-500 leading-6 mt-2">
            Use the monthly figures and expense breakdown to understand where
            money is coming from and where it is being spent.
          </p>

<div className="mt-6 divide-y divide-slate-200 border-y border-slate-200">
            <div className="flex items-center justify-between py-4">
              <span className="text-sm text-slate-500">Total revenue</span>
              <span className="text-sm font-semibold text-slate-900">
                {formatCurrency(totalRevenue)}
              </span>
            </div>

            <div className="flex items-center justify-between py-4">
              <span className="text-sm text-slate-500">Total expenses</span>
              <span className="text-sm font-semibold text-slate-900">
                {formatCurrency(totalExpenses)}
              </span>
            </div>
           <div className="flex items-center justify-between py-4">
              <span className="text-sm text-slate-500">Net income</span>
              <span className="text-sm font-semibold text-emerald-700">
                {formatCurrency(totalNet)}
              </span>
            </div>

            <div className="flex items-center justify-between py-4">
              <span className="text-sm text-slate-500">Net margin</span>
              <span className="text-sm font-semibold text-slate-900">
                {netMargin.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};  








