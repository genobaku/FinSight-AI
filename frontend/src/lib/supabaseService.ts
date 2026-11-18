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
  username TEXT NOT NULL DEFAULT 'anugaur',
  email TEXT NOT NULL,
  pronouns TEXT,
  tagline TEXT,
  occupation TEXT,
  company_name TEXT NOT NULL,
  company_address TEXT,
  city TEXT,
  location TEXT,
  tax_registration_number TEXT,
  default_currency TEXT NOT NULL DEFAULT 'USD',
  avatar_url TEXT,
  plan TEXT NOT NULL DEFAULT 'Pro Business',
  custom_supabase_url TEXT,
  custom_supabase_anon_key TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
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
    if (error) throw error;
    if (!data) return [];

    return data.map((row: any) => ({
      id: row.id,
      invoiceNumber: row.invoice_number,
      customerId: row.customer_id,
      customerName: row.customer_name,
      customerEmail: row.customer_email || '',
      issueDate: row.issue_date,
      dueDate: row.due_date,
      items: row.items || [],
      subtotal: Number(row.subtotal),
      taxTotal: Number(row.tax_total),
      discountTotal: Number(row.discount_total),
      total: Number(row.total),
      status: row.status,
      currency: row.currency,
      notes: row.notes,
      paymentTerms: row.payment_terms,
      createdAt: row.created_at,
    }));
  } catch (err) {
    console.warn('Failed to fetch invoices from Supabase:', err);
    return null;
  }
}

// Save/Update Single Invoice in Supabase
export async function saveSupabaseInvoice(invoice: Invoice): Promise<boolean> {
  // Always update local persistent fallback
  try {
    const cached = localStorage.getItem('finsight_invoices');
    const list = cached ? JSON.parse(cached) : [];
    const index = list.findIndex((i: Invoice) => i.id === invoice.id);
    if (index >= 0) {
      list[index] = invoice;
    } else {
      list.unshift(invoice);
    }
    localStorage.setItem('finsight_invoices', JSON.stringify(list));
  } catch (e) {
    console.warn('LocalStorage invoice save error', e);
  }

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
    if (error) throw error;
    return true;
  } catch (err) {
    console.warn('Failed to save invoice in Supabase:', err);
    return false;
  }
}

// Delete Invoice from Supabase
export async function deleteSupabaseInvoice(id: string): Promise<boolean> {
  try {
    const cached = localStorage.getItem('finsight_invoices');
    if (cached) {
      const list = JSON.parse(cached).filter((i: Invoice) => i.id !== id);
      localStorage.setItem('finsight_invoices', JSON.stringify(list));
    }
  } catch (e) {
    console.warn('LocalStorage invoice delete error', e);
  }

  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('invoices').delete().eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.warn('Failed to delete invoice from Supabase:', err);
    return false;
  }
}

// Fetch Expenses from Supabase
export async function fetchSupabaseExpenses(): Promise<Expense[] | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase.from('expenses').select('*').order('date', { ascending: false });
    if (error) throw error;
    if (!data) return [];

    return data.map((row: any) => ({
      id: row.id,
      title: row.title,
      category: row.category,
      vendorId: row.vendor_id,
      vendorName: row.vendor_name,
      amount: Number(row.amount),
      tax: Number(row.tax),
      date: row.date,
      paymentMethod: row.payment_method,
      status: row.status,
      receiptId: row.receipt_id,
    }));
  } catch (err) {
    console.warn('Failed to fetch expenses from Supabase:', err);
    return null;
  }
}

// Save/Update Single Expense in Supabase
export async function saveSupabaseExpense(expense: Expense): Promise<boolean> {
  // Always update local persistent fallback
  try {
    const cached = localStorage.getItem('finsight_expenses');
    const list = cached ? JSON.parse(cached) : [];
    const index = list.findIndex((e: Expense) => e.id === expense.id);
    if (index >= 0) {
      list[index] = expense;
    } else {
      list.unshift(expense);
    }
    localStorage.setItem('finsight_expenses', JSON.stringify(list));
  } catch (e) {
    console.warn('LocalStorage expense save error', e);
  }

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
    if (error) throw error;
    return true;
  } catch (err) {
    console.warn('Failed to save expense in Supabase:', err);
    return false;
  }
}

// Fetch Receipts from Supabase
export async function fetchSupabaseReceipts(): Promise<Receipt[] | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase.from('receipts').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    if (!data) return [];

    return data.map((row: any) => ({
      id: row.id,
      vendorName: row.vendor_name,
      invoiceNumber: row.invoice_number,
      gstId: row.gst_id,
      date: row.date,
      category: row.category,
      subtotal: Number(row.subtotal),
      taxTotal: Number(row.tax_total),
      total: Number(row.total),
      confidenceScore: Number(row.confidence_score),
      status: row.status,
      items: row.items || [],
      imageUrl: row.image_url,
      createdAt: row.created_at,
    }));
  } catch (err) {
    console.warn('Failed to fetch receipts from Supabase:', err);
    return null;
  }
}

// Save/Update Single Receipt in Supabase
export async function saveSupabaseReceipt(receipt: Receipt): Promise<boolean> {
  // Always update local persistent fallback
  try {
    const cached = localStorage.getItem('finsight_receipts');
    const list = cached ? JSON.parse(cached) : [];
    const index = list.findIndex((r: Receipt) => r.id === receipt.id);
    if (index >= 0) {
      list[index] = receipt;
    } else {
      list.unshift(receipt);
    }
    localStorage.setItem('finsight_receipts', JSON.stringify(list));
  } catch (e) {
    console.warn('LocalStorage receipt save error', e);
  }

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
    if (error) throw error;
    return true;
  } catch (err) {
    console.warn('Failed to save receipt in Supabase:', err);
    return false;
  }
}

// Fetch User Profile from Supabase
export async function fetchSupabaseUserProfile(): Promise<UserProfile | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase.from('user_profile').select('*').eq('id', 'primary').single();
    if (error) throw error;
    if (!data) return null;

    return {
      name: data.name,
      username: data.username || 'anugaur',
      email: data.email,
      pronouns: data.pronouns,
      tagline: data.tagline,
      occupation: data.occupation,
      companyName: data.company_name,
      companyAddress: data.company_address || '',
      city: data.city || '',
      location: data.location || '',
      taxRegistrationNumber: data.tax_registration_number || '',
      defaultCurrency: data.default_currency || 'USD',
      avatarUrl: data.avatar_url || '',
      plan: data.plan || 'Pro Business',
      customSupabaseUrl: data.custom_supabase_url || '',
      customSupabaseAnonKey: data.custom_supabase_anon_key || '',
    };
  } catch (err) {
    console.warn('Failed to fetch user profile from Supabase:', err);
    return null;
  }
}

// Save/Update User Profile in Supabase
export async function saveSupabaseUserProfile(user: UserProfile): Promise<{ success: boolean; message?: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    // Also save in localStorage as fallback
    localStorage.setItem('finsight_user_profile', JSON.stringify(user));
    return { success: true, message: 'Saved locally' };
  }

  try {
    const { error } = await supabase.from('user_profile').upsert({
      id: 'primary',
      name: user.name,
      username: user.username,
      email: user.email,
      pronouns: user.pronouns,
      tagline: user.tagline,
      occupation: user.occupation,
      company_name: user.companyName,
      company_address: user.companyAddress,
      city: user.city,
      location: user.location,
      tax_registration_number: user.taxRegistrationNumber,
      default_currency: user.defaultCurrency,
      avatar_url: user.avatarUrl,
      plan: user.plan,
      custom_supabase_url: user.customSupabaseUrl,
      custom_supabase_anon_key: user.customSupabaseAnonKey,
      updated_at: new Date().toISOString(),
    });
    if (error) throw error;
    localStorage.setItem('finsight_user_profile', JSON.stringify(user));
    return { success: true, message: 'Saved to Supabase database!' };
  } catch (err: any) {
    console.warn('Failed to save user profile in Supabase:', err);
    localStorage.setItem('finsight_user_profile', JSON.stringify(user));
    return { success: false, message: err.message };
  }
}

// Bulk Sync Function
export async function syncAllToSupabase(
  invoices: Invoice[],
  expenses: Expense[],
  receipts: Receipt[]
): Promise<{ success: boolean; message: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, message: 'Supabase credentials missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env' };
  }

  try {
    if (invoices.length > 0) {
      await supabase.from('invoices').upsert(
        invoices.map((inv) => ({
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

    if (expenses.length > 0) {
      await supabase.from('expenses').upsert(
        expenses.map((exp) => ({
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

    if (receipts.length > 0) {
      await supabase.from('receipts').upsert(
        receipts.map((rcpt) => ({
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
