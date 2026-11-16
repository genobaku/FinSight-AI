
import { Invoice, Expense, Receipt } from '../types';

export interface MonthlyCashFlowPoint {
  month: string;
  yearMonth: string;
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
  '#2563EB', '#3B82F6', '#60A5FA', '#93C5FD',
  '#F59E0B', '#10B981', '#8B5CF6', '#EC4899', '#64748B'
];

const getYearMonth = (dateStr?: string): string | null => {
  if (!dateStr) return null;

  const match = dateStr.match(/^(\d{4})-(\d{2})/);
  if (!match) return null;

  const month = Number(match[2]);

  if (month < 1 || month > 12) return null;

  return `${match[1]}-${match[2]}`;
};

export function computeRealAnalytics(
  invoices: Invoice[] = [],
  expenses: Expense[] = [],
  receipts: Receipt[] = [],
  timeframeMonths?: number
): RealAnalyticsData {

  // Calculate the selected calendar-month range.
  const currentDate = new Date();
  const currentMonthDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );

  const currentMonthKey = getYearMonth(
    `${currentMonthDate.getFullYear()}-${String(
      currentMonthDate.getMonth() + 1
    ).padStart(2, '0')}`
  )!;

  const startDate = timeframeMonths
    ? new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - timeframeMonths + 1,
        1
      )
    : null;

  const startMonthKey = startDate
    ? `${startDate.getFullYear()}-${String(
        startDate.getMonth() + 1
      ).padStart(2, '0')}`
    : null;

  const isInSelectedPeriod = (dateStr?: string): boolean => {
    if (!timeframeMonths) return true;

    const monthKey = getYearMonth(dateStr);

    return Boolean(
      monthKey &&
      startMonthKey &&
      monthKey >= startMonthKey &&
      monthKey <= currentMonthKey
    );
  };

  // Include paid invoices only.
  const paidInvoices = invoices.filter(
    (inv) =>
      inv.status === 'Paid' &&
      isInSelectedPeriod(inv.issueDate || inv.createdAt)
  );

  // Exclude rejected expenses.
  const validExpenses = expenses.filter(
    (exp) =>
      exp.status !== 'Rejected' &&
      isInSelectedPeriod(exp.date)
  );

  // Avoid counting a receipt twice if it is already linked to an expense.
  const unlinkedReceipts = receipts.filter(
    (rcpt) =>
      !expenses.some((exp) => exp.receiptId === rcpt.id) &&
      isInSelectedPeriod(rcpt.date || rcpt.createdAt)
  );

  const totalRevenue = paidInvoices.reduce(
    (sum, inv) => sum + (Number(inv.total) || 0),
    0
  );

  const expenseSum = validExpenses.reduce(
    (sum, exp) => sum + (Number(exp.amount) || 0),
    0
  );

  const receiptSum = unlinkedReceipts.reduce(
    (sum, rcpt) => sum + (Number(rcpt.total) || 0),
    0
  );

  const totalExpenses = expenseSum + receiptSum;
  const netProfit = totalRevenue - totalExpenses;

  const profitMargin =
    totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  // Prepare monthly cash-flow data.
  const monthlyMap = new Map<
    string,
    { revenue: number; expenses: number }
  >();

  const addMonthData = (
    dateStr: string,
    revenue: number,
    expense: number
  ) => {
    const yearMonth = getYearMonth(dateStr);
    if (!yearMonth) return;

    const current = monthlyMap.get(yearMonth) || {
      revenue: 0,
      expenses: 0
    };

    monthlyMap.set(yearMonth, {
      revenue: current.revenue + revenue,
      expenses: current.expenses + expense
    });
  };

  paidInvoices.forEach((inv) => {
    addMonthData(
      inv.issueDate || inv.createdAt,
      Number(inv.total) || 0,
      0
    );
  });

  validExpenses.forEach((exp) => {
    if (exp.date) {
      addMonthData(exp.date, 0, Number(exp.amount) || 0);
    }
  });

  unlinkedReceipts.forEach((rcpt) => {
    addMonthData(
      rcpt.date || rcpt.createdAt,
      0,
      Number(rcpt.total) || 0
    );
  });

  const sortedMonths = Array.from(monthlyMap.keys()).sort();

  const cashFlow: MonthlyCashFlowPoint[] = sortedMonths.map((ym) => {
    const [year, monthNum] = ym.split('-');

    const dateObj = new Date(
      Number(year),
      Number(monthNum) - 1,
      1
    );

    const monthLabel = dateObj.toLocaleString('en-US', {
      month: 'short'
    });

    const data = monthlyMap.get(ym)!;
    const net = data.revenue - data.expenses;

    return {
      month: `${monthLabel} ${year.substring(2)}`,
      yearMonth: ym,
      revenue: data.revenue,
      expenses: data.expenses,
      net
    };
  });

  // Prepare expense category breakdown.
  const categoryMap = new Map<string, number>();

  validExpenses.forEach((exp) => {
    const category = exp.category?.trim() || 'Uncategorized';

    categoryMap.set(
      category,
      (categoryMap.get(category) || 0) + (Number(exp.amount) || 0)
    );
  });

  unlinkedReceipts.forEach((rcpt) => {
    const category = rcpt.category?.trim() || 'Uncategorized';

    categoryMap.set(
      category,
      (categoryMap.get(category) || 0) + (Number(rcpt.total) || 0)
    );
  });

  const expenseBreakdown: CategoryBreakdownPoint[] =
    Array.from(categoryMap.entries())
      .map(([name, value], index) => ({
        name,
        value,
        color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
        percentage:
          totalExpenses > 0 ? (value / totalExpenses) * 100 : 0
      }))
      .sort((a, b) => b.value - a.value);

  const hasRevenue = totalRevenue > 0;
  const hasExpenses = totalExpenses > 0;
  const hasData =
    paidInvoices.length > 0 ||
    validExpenses.length > 0 ||
    unlinkedReceipts.length > 0;

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
      invoices: paidInvoices.length,
      expenses: validExpenses.length,
      receipts: unlinkedReceipts.length
    }
  };
}
