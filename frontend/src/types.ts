export type InvoiceStatus = 'Paid' | 'Pending' | 'Overdue' | 'Draft';

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  total: number;
  status: InvoiceStatus;
  currency: string;
  notes?: string;
  paymentTerms: string; // e.g. 'Net 30', 'Net 15', 'Due on Receipt'
  createdAt: string;
}

export interface Receipt {
  id: string;
  vendorName: string;
  invoiceNumber: string;
  gstId: string;
  date: string;
  category: string;
  subtotal: number;
  taxTotal: number;
  total: number;
  confidenceScore: number; // e.g. 98.5
  status: 'Verified' | 'Pending Review' | 'Flagged';
  items: { description: string; quantity: number; price: number; total: number }[];
  imageUrl?: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  title: string;
  category: string;
  vendorId?: string;
  vendorName: string;
  amount: number;
  tax: number;
  date: string;
  paymentMethod: 'Corporate Card' | 'ACH Transfer' | 'Wire' | 'Reimbursement';
  status: 'Approved' | 'Pending' | 'Rejected';
  receiptId?: string;
}

export interface Customer {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  totalBilled: number;
  totalPaid: number;
  outstandingBalance: number;
  status: 'Active' | 'Inactive';
  avatarUrl?: string;
  createdAt: string;
}

export interface Vendor {
  id: string;
  name: string;
  category: string;
  contactEmail: string;
  contactPhone: string;
  totalSpent: number;
  pendingPayables: number;
  riskScore: 'Low' | 'Medium' | 'High';
  status: 'Verified' | 'Pending Review';
  logoUrl?: string;
  createdAt: string;
}

export interface FinancialMetric {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  outstandingAmount: number;
  paidInvoicesCount: number;
  pendingInvoicesCount: number;
  overdueInvoicesCount: number;
  profitMarginPercentage: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'invoice' | 'receipt' | 'insight' | 'security' | 'system';
  linkTab?: TabType;
}

export interface AiInsight {
  id: string;
  type: 'opportunity' | 'warning' | 'success';
  title: string;
  description: string;
  impact: string;
  date: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  chartData?: {
    title: string;
    type: 'bar' | 'line' | 'pie';
    data: { name: string; value: number; secondary?: number }[];
  };
}

export type TabType =
  | 'landing'
  | 'dashboard'
  | 'invoices'
  | 'receipts'
  | 'customers'
  | 'vendors'
  | 'expenses'
  | 'analytics'
  | 'copilot'
  | 'notifications'
  | 'settings'
  | 'login';

export interface UserProfile {
  name: string;
  email: string;
  companyName: string;
  companyAddress: string;
  taxRegistrationNumber: string;
  defaultCurrency: string;
  avatarUrl: string;
  plan: 'Starter' | 'Pro Business' | 'Enterprise';
}
