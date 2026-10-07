import { getSupabaseClient, isSupabaseConfigured } from './supabase';
import { Customer, Expense, Invoice, Receipt, UserProfile, Vendor } from '../types';

export const SUPABASE_SQL_SCHEMA_SCRIPT = `-- FinSight AI Supabase Database Schema
-- Run this script in your Supabase SQL Editor (https://app.supabase.com) to create required tables

-- 1. Invoices Table
CREATE TABLE IF NOT EXISTS public.invoices (
  id TEXT PRIMARY KEY,
  invoice_number TEXT NOT NULL,
  customer_id TEXT,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  issue_date TEXT NOT NULL,
  due_date TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  tax_total NUMERIC NOT NULL DEFAULT 0,
  discount_total NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Pending',
  currency TEXT NOT NULL DEFAULT 'USD',
  notes TEXT,
  payment_terms TEXT NOT NULL DEFAULT 'Net 30',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Expenses Table
CREATE TABLE IF NOT EXISTS public.expenses (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  vendor_id TEXT,
  vendor_name TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  tax NUMERIC NOT NULL DEFAULT 0,
  date TEXT NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'Corporate Card',
  status TEXT NOT NULL DEFAULT 'Approved',
  receipt_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Receipts Table
CREATE TABLE IF NOT EXISTS public.receipts (
  id TEXT PRIMARY KEY,
  vendor_name TEXT NOT NULL,
  invoice_number TEXT,
  gst_id TEXT,
  date TEXT NOT NULL,
  category TEXT NOT NULL,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  tax_total NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  confidence_score NUMERIC NOT NULL DEFAULT 95,
  status TEXT NOT NULL DEFAULT 'Verified',
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Customers Table
CREATE TABLE IF NOT EXISTS public.customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  company TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  total_billed NUMERIC NOT NULL DEFAULT 0,
  total_paid NUMERIC NOT NULL DEFAULT 0,
  outstanding_balance NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Active',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Vendors Table
CREATE TABLE IF NOT EXISTS public.vendors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  total_spent NUMERIC NOT NULL DEFAULT 0,
  pending_payables NUMERIC NOT NULL DEFAULT 0,
  risk_score TEXT NOT NULL DEFAULT 'Low',
  status TEXT NOT NULL DEFAULT 'Verified',
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. User Profile Table
CREATE TABLE IF NOT EXISTS public.user_profile (
  id TEXT PRIMARY KEY DEFAULT 'primary',
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company_name TEXT NOT NULL,
  company_address TEXT,
  tax_registration_number TEXT,
  default_currency TEXT NOT NULL DEFAULT 'USD',
  avatar_url TEXT,
  plan TEXT NOT NULL DEFAULT 'Pro Business',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) or public access for demo
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profile ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select on invoices" ON public.invoices FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update on invoices" ON public.invoices FOR ALL USING (true);

CREATE POLICY "Allow public select on expenses" ON public.expenses FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update on expenses" ON public.expenses FOR ALL USING (true);

CREATE POLICY "Allow public select on receipts" ON public.receipts FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update on receipts" ON public.receipts FOR ALL USING (true);

CREATE POLICY "Allow public select on customers" ON public.customers FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update on customers" ON public.customers FOR ALL USING (true);

CREATE POLICY "Allow public select on vendors" ON public.vendors FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update on vendors" ON public.vendors FOR ALL USING (true);

CREATE POLICY "Allow public select on user_profile" ON public.user_profile FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update on user_profile" ON public.user_profile FOR ALL USING (true);
`;

// Fetch Invoices from Supabase
export async function fetchSupabaseInvoices(): Promise<Invoice[] | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase.from('invoices').select('*').order('created_at', { ascending: false });
    if (error) {
      console.warn('Supabase invoice fetch warning:', error.message);
      return null;
    }
    if (!data || data.length === 0) return null;

    return data.map((row) => ({
      id: row.id,
      invoiceNumber: row.invoice_number,
      customerId: row.customer_id || '',
      customerName: row.customer_name,
      customerEmail: row.customer_email || '',
      issueDate: row.issue_date,
      dueDate: row.due_date,
      items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items || [],
      subtotal: Number(row.subtotal || 0),
      taxTotal: Number(row.tax_total || 0),
      discountTotal: Number(row.discount_total || 0),
      total: Number(row.total || 0),
      status: row.status,
      currency: row.currency || 'USD',
      notes: row.notes || '',
      paymentTerms: row.payment_terms || 'Net 30',
      createdAt: row.created_at || new Date().toISOString().split('T')[0],
    }));
  } catch (err) {
    console.error('Error fetching invoices from Supabase:', err);
    return null;
  }
}

// Upsert Invoice to Supabase
export async function saveSupabaseInvoice(invoice: Invoice): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('invoices').upsert({
      id: invoice.id,
      invoice_number: invoice.invoiceNumber,
      customer_id: invoice.customerId,
      customer_name: invoice.customerName,
      customer_email: invoice.customerEmail,
      issue_date: invoice.issueDate,
      due_date: invoice.dueDate,
      items: invoice.items,
      subtotal: invoice.subtotal,
      tax_total: invoice.taxTotal,
      discount_total: invoice.discountTotal,
      total: invoice.total,
      status: invoice.status,
      currency: invoice.currency,
      notes: invoice.notes,
      payment_terms: invoice.paymentTerms,
    });

    if (error) {
      console.error('Supabase save invoice error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error saving invoice to Supabase:', err);
    return false;
  }
}

// Delete Invoice from Supabase
export async function deleteSupabaseInvoice(id: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('invoices').delete().eq('id', id);
    if (error) console.error('Supabase delete invoice error:', error.message);
    return !error;
  } catch (err) {
    console.error('Error deleting invoice from Supabase:', err);
    return false;
  }
}

// Fetch Expenses from Supabase
export async function fetchSupabaseExpenses(): Promise<Expense[] | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase.from('expenses').select('*').order('created_at', { ascending: false });
    if (error || !data || data.length === 0) return null;

    return data.map((row) => ({
      id: row.id,
      title: row.title,
      category: row.category,
      vendorId: row.vendor_id,
      vendorName: row.vendor_name,
      amount: Number(row.amount || 0),
      tax: Number(row.tax || 0),
      date: row.date,
      paymentMethod: row.payment_method,
      status: row.status,
      receiptId: row.receipt_id,
    }));
  } catch (err) {
    return null;
  }
}

// Save Expense
export async function saveSupabaseExpense(expense: Expense): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('expenses').upsert({
      id: expense.id,
      title: expense.title,
      category: expense.category,
      vendor_id: expense.vendorId,
      vendor_name: expense.vendorName,
      amount: expense.amount,
      tax: expense.tax,
      date: expense.date,
      payment_method: expense.paymentMethod,
      status: expense.status,
      receipt_id: expense.receiptId,
    });
    return !error;
  } catch (err) {
    return false;
  }
}

// Fetch Receipts
export async function fetchSupabaseReceipts(): Promise<Receipt[] | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase.from('receipts').select('*').order('created_at', { ascending: false });
    if (error || !data || data.length === 0) return null;

    return data.map((row) => ({
      id: row.id,
      vendorName: row.vendor_name,
      invoiceNumber: row.invoice_number,
      gstId: row.gst_id,
      date: row.date,
      category: row.category,
      subtotal: Number(row.subtotal || 0),
      taxTotal: Number(row.tax_total || 0),
      total: Number(row.total || 0),
      confidenceScore: Number(row.confidence_score || 95),
      status: row.status,
      items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items || [],
      imageUrl: row.image_url,
      createdAt: row.created_at || row.date,
    }));
  } catch (err) {
    return null;
  }
}

// Save Receipt
export async function saveSupabaseReceipt(receipt: Receipt): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('receipts').upsert({
      id: receipt.id,
      vendor_name: receipt.vendorName,
      invoice_number: receipt.invoiceNumber,
      gst_id: receipt.gstId,
      date: receipt.date,
      category: receipt.category,
      subtotal: receipt.subtotal,
      tax_total: receipt.taxTotal,
      total: receipt.total,
      confidence_score: receipt.confidenceScore,
      status: receipt.status,
      items: receipt.items,
      image_url: receipt.imageUrl,
    });
    return !error;
  } catch (err) {
    return false;
  }
}

// Bulk Sync initial demo data to Supabase
export async function syncAllToSupabase(payload: {
  invoices: Invoice[];
  expenses: Expense[];
  receipts: Receipt[];
  customers: Customer[];
  vendors: Vendor[];
  user: UserProfile;
}): Promise<{ success: boolean; message: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, message: 'Supabase credentials not configured.' };
  }

  try {
    // 1. Sync User
    await supabase.from('user_profile').upsert({
      id: 'primary',
      name: payload.user.name,
      email: payload.user.email,
      company_name: payload.user.companyName,
      company_address: payload.user.companyAddress,
      tax_registration_number: payload.user.taxRegistrationNumber,
      default_currency: payload.user.defaultCurrency,
      avatar_url: payload.user.avatarUrl,
      plan: payload.user.plan,
    });

    // 2. Sync Customers
    if (payload.customers.length > 0) {
      await supabase.from('customers').upsert(
        payload.customers.map((c) => ({
          id: c.id,
          name: c.name,
          company: c.company,
          email: c.email,
          phone: c.phone,
          address: c.address,
          total_billed: c.totalBilled,
          total_paid: c.totalPaid,
          outstanding_balance: c.outstandingBalance,
          status: c.status,
          avatar_url: c.avatarUrl,
        }))
      );
    }

    // 3. Sync Vendors
    if (payload.vendors.length > 0) {
      await supabase.from('vendors').upsert(
        payload.vendors.map((v) => ({
          id: v.id,
          name: v.name,
          category: v.category,
          contact_email: v.contactEmail,
          contact_phone: v.contactPhone,
          total_spent: v.totalSpent,
          pending_payables: v.pendingPayables,
          risk_score: v.riskScore,
          status: v.status,
          logo_url: v.logoUrl,
        }))
      );
    }

    // 4. Sync Invoices
    if (payload.invoices.length > 0) {
      await supabase.from('invoices').upsert(
        payload.invoices.map((inv) => ({
          id: inv.id,
          invoice_number: inv.invoiceNumber,
          customer_id: inv.customerId,
          customer_name: inv.customerName,
          customer_email: inv.customerEmail,
          issue_date: inv.issueDate,
          due_date: inv.dueDate,
          items: inv.items,
          subtotal: inv.subtotal,
          tax_total: inv.taxTotal,
          discount_total: inv.discountTotal,
          total: inv.total,
          status: inv.status,
          currency: inv.currency,
          notes: inv.notes,
          payment_terms: inv.paymentTerms,
        }))
      );
    }

    // 5. Sync Expenses
    if (payload.expenses.length > 0) {
      await supabase.from('expenses').upsert(
        payload.expenses.map((exp) => ({
          id: exp.id,
          title: exp.title,
          category: exp.category,
          vendor_id: exp.vendorId,
          vendor_name: exp.vendorName,
          amount: exp.amount,
          tax: exp.tax,
          date: exp.date,
          payment_method: exp.paymentMethod,
          status: exp.status,
          receipt_id: exp.receiptId,
        }))
      );
    }

    // 6. Sync Receipts
    if (payload.receipts.length > 0) {
      await supabase.from('receipts').upsert(
        payload.receipts.map((rcpt) => ({
          id: rcpt.id,
          vendor_name: rcpt.vendorName,
          invoice_number: rcpt.invoiceNumber,
          gst_id: rcpt.gstId,
          date: rcpt.date,
          category: rcpt.category,
          subtotal: rcpt.subtotal,
          tax_total: rcpt.taxTotal,
          total: rcpt.total,
          confidence_score: rcpt.confidenceScore,
          status: rcpt.status,
          items: rcpt.items,
          image_url: rcpt.imageUrl,
        }))
      );
    }

    return { success: true, message: 'All financial data synced to Supabase PostgreSQL successfully!' };
  } catch (err: any) {
    return { success: false, message: `Sync failed: ${err.message}` };
  }
}
