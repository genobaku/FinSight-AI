import { Invoice, Expense, Receipt } from '../types';

export interface MonthlyCashFlowPoint {
  month: string;
  yearMonth: string; // "2026-01"
  revenue: number;
  expenses: number;
  net: number;
}

export interface CategoryBreakdownPoint {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

export interface RealAnalyticsData {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  cashFlow: MonthlyCashFlowPoint[];
  expenseBreakdown: CategoryBreakdownPoint[];
  hasData: boolean;
  hasExpenses: boolean;
  hasRevenue: boolean;
  recordCount: {
    invoices: number;
    expenses: number;
    receipts: number;
  };
}

const CATEGORY_COLORS = [
  '#2563EB', // Blue
  '#3B82F6', // Light Blue
  '#60A5FA', // Lighter Blue
  '#93C5FD', // Soft Blue
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#64748B', // Slate
];

export function computeRealAnalytics(
  invoices: Invoice[] = [],
  expenses: Expense[] = [],
  receipts: Receipt[] = [],
  timeframeMonths: number = 12
): RealAnalyticsData {
  // 1. Filter valid invoices (Paid or all non-draft for cashflow)
  // For revenue recognition: Paid invoices contribute to cash flow revenue.
  const paidInvoices = invoices.filter((inv) => inv.status === 'Paid');
  const totalRevenue = paidInvoices.reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);

  // 2. Combine expenses & verified receipts for total operating expenses
  const validExpenses = expenses.filter((exp) => exp.status !== 'Rejected');
  const expenseSum = validExpenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
  
  // Receipts that are not linked to an existing expense item to avoid double-counting
  const unlinkedReceipts = receipts.filter(
    (rcpt) => !expenses.some((exp) => exp.receiptId === rcpt.id)
  );
  const receiptSum = unlinkedReceipts.reduce((sum, r) => sum + (Number(r.total) || 0), 0);

  const totalExpenses = expenseSum + receiptSum;
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  // 3. Build Date-Aggregated Monthly Cashflow
  const monthlyMap = new Map<string, { revenue: number; expenses: number }>();

  // Helper to add to monthly bucket "YYYY-MM"
  const addMonthData = (dateStr: string, rev: number, exp: number) => {
    if (!dateStr) return;
    const yearMonth = dateStr.substring(0, 7); // "2026-08"
    if (!/^\d{4}-\d{2}$/.test(yearMonth)) return;

    const current = monthlyMap.get(yearMonth) || { revenue: 0, expenses: 0 };
    monthlyMap.set(yearMonth, {
      revenue: current.revenue + rev,
      expenses: current.expenses + exp,
    });
  };

  // Add revenue records
  paidInvoices.forEach((inv) => {
    const date = inv.issueDate || inv.createdAt;
    addMonthData(date, Number(inv.total) || 0, 0);
  });

  // Add expense records
  validExpenses.forEach((exp) => {
    const date = exp.date || exp.id;
    addMonthData(date, 0, Number(exp.amount) || 0);
  });

  // Add standalone receipt records
  unlinkedReceipts.forEach((rcpt) => {
    const date = rcpt.date || rcpt.createdAt;
    addMonthData(date, 0, Number(rcpt.total) || 0);
  });

  // Sort monthly keys chronologically
  const sortedMonths = Array.from(monthlyMap.keys()).sort();

  const cashFlow: MonthlyCashFlowPoint[] = sortedMonths.map((ym) => {
    const [year, monthNum] = ym.split('-');
    const dateObj = new Date(parseInt(year, 10), parseInt(monthNum, 10) - 1, 1);
    const monthLabel = dateObj.toLocaleString('en-US', { month: 'short' });
    const data = monthlyMap.get(ym)!;
    const net = data.revenue - data.expenses;

    return {
      month: `${monthLabel} ${year.substring(2)}`,
      yearMonth: ym,
      revenue: data.revenue,
      expenses: data.expenses,
      net: net,
    };
  });

  // 4. Build Expense Category Breakdown from actual data
  const categoryMap = new Map<string, number>();

  validExpenses.forEach((exp) => {
    const cat = exp.category ? exp.category.trim() : 'Uncategorized';
    const current = categoryMap.get(cat) || 0;
    categoryMap.set(cat, current + (Number(exp.amount) || 0));
  });

  unlinkedReceipts.forEach((rcpt) => {
    const cat = rcpt.category ? rcpt.category.trim() : 'Uncategorized';
    const current = categoryMap.get(cat) || 0;
    categoryMap.set(cat, current + (Number(rcpt.total) || 0));
  });

  const expenseBreakdown: CategoryBreakdownPoint[] = Array.from(categoryMap.entries())
    .map(([name, value], index) => ({
      name,
      value,
      color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
      percentage: totalExpenses > 0 ? (value / totalExpenses) * 100 : 0,
    }))
    .sort((a, b) => b.value - a.value);

  const hasRevenue = totalRevenue > 0;
  const hasExpenses = totalExpenses > 0;
  const hasData = invoices.length > 0 || expenses.length > 0 || receipts.length > 0;

  return {
    totalRevenue,
    totalExpenses,
    netProfit,
    profitMargin,
    cashFlow,
    expenseBreakdown,
    hasData,
    hasExpenses,
    hasRevenue,
    recordCount: {
      invoices: invoices.length,
      expenses: expenses.length,
      receipts: receipts.length,
    },
  };
}
