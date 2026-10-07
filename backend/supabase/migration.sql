-- ====================================================================
-- FinSight AI Complete Supabase PostgreSQL Schema & Migration Script
-- Production-Ready SQL Migration for Supabase SQL Editor
-- ====================================================================

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Businesses Table
CREATE TABLE IF NOT EXISTS public.businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  tax_registration_number TEXT,
  company_address TEXT,
  phone TEXT,
  website TEXT,
  default_currency TEXT NOT NULL DEFAULT 'USD',
  logo_url TEXT,
  plan TEXT NOT NULL DEFAULT 'Pro Business',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'expense', -- 'income' or 'expense'
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Customers Table
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  company TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  total_billed NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  total_paid NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  outstanding_balance NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  status TEXT NOT NULL DEFAULT 'Active',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Vendors Table
CREATE TABLE IF NOT EXISTS public.vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General Vendor',
  contact_email TEXT,
  contact_phone TEXT,
  total_spent NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  pending_payables NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  risk_score TEXT NOT NULL DEFAULT 'Low',
  status TEXT NOT NULL DEFAULT 'Verified',
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Invoices Table
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  subtotal NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  tax_total NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  discount_total NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  total NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  status TEXT NOT NULL DEFAULT 'Pending', -- 'Paid', 'Pending', 'Overdue', 'Draft'
  currency TEXT NOT NULL DEFAULT 'USD',
  notes TEXT,
  payment_terms TEXT NOT NULL DEFAULT 'Net 30',
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_invoice_num_per_business UNIQUE(business_id, invoice_number)
);

-- 7. Invoice Items Table
CREATE TABLE IF NOT EXISTS public.invoice_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
  unit_price NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  total NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Receipts Table
CREATE TABLE IF NOT EXISTS public.receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  vendor_name TEXT NOT NULL,
  invoice_number TEXT,
  gst_id TEXT,
  date DATE NOT NULL,
  category TEXT NOT NULL DEFAULT 'General Expense',
  subtotal NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  tax_total NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  total NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  confidence_score NUMERIC(5,2) NOT NULL DEFAULT 95.00,
  status TEXT NOT NULL DEFAULT 'Verified',
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Expenses Table
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL,
  vendor_name TEXT NOT NULL,
  amount NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  tax NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  date DATE NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'Corporate Card',
  status TEXT NOT NULL DEFAULT 'Approved',
  receipt_id UUID REFERENCES public.receipts(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Payments Table
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE,
  amount NUMERIC(15,2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'Bank Transfer',
  transaction_reference TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. AI Extractions Table
CREATE TABLE IF NOT EXISTS public.ai_extractions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  vendor_detected TEXT,
  invoice_number_detected TEXT,
  amount_detected NUMERIC(15,2),
  confidence_score NUMERIC(5,2),
  raw_gemini_json JSONB,
  status TEXT NOT NULL DEFAULT 'Completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. OCR Logs Table
CREATE TABLE IF NOT EXISTS public.ocr_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_name TEXT NOT NULL,
  file_size_bytes INT,
  processing_time_ms INT,
  model_used TEXT DEFAULT 'gemini-3.6-flash',
  status TEXT NOT NULL DEFAULT 'Success',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. Activity Logs Table
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info', -- 'info', 'warning', 'success'
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 15. Settings Table
CREATE TABLE IF NOT EXISTS public.settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE UNIQUE,
  ai_auto_approve_threshold NUMERIC(5,2) DEFAULT 90.00,
  email_notifications BOOLEAN DEFAULT TRUE,
  dark_mode_preference BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- INDEXES & PERFORMANCE OPTIMIZATION
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_invoices_business ON public.invoices(business_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON public.invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_expenses_business ON public.expenses(business_id);
CREATE INDEX IF NOT EXISTS idx_expenses_vendor ON public.expenses(vendor_id);
CREATE INDEX IF NOT EXISTS idx_receipts_vendor ON public.receipts(vendor_name);
CREATE INDEX IF NOT EXISTS idx_customers_company ON public.customers(company);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;

-- Permissive policies for client access / demo authentication
CREATE POLICY "Public Read/Write Users" ON public.users FOR ALL USING (true);
CREATE POLICY "Public Read/Write Businesses" ON public.businesses FOR ALL USING (true);
CREATE POLICY "Public Read/Write Customers" ON public.customers FOR ALL USING (true);
CREATE POLICY "Public Read/Write Vendors" ON public.vendors FOR ALL USING (true);
CREATE POLICY "Public Read/Write Invoices" ON public.invoices FOR ALL USING (true);
CREATE POLICY "Public Read/Write Expenses" ON public.expenses FOR ALL USING (true);
CREATE POLICY "Public Read/Write Receipts" ON public.receipts FOR ALL USING (true);

-- ====================================================================
-- SUPABASE STORAGE BUCKETS CONFIGURATION
-- ====================================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('receipt-images', 'receipt-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('invoice-pdfs', 'invoice-pdfs', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Security Policies
CREATE POLICY "Public Storage Select" ON storage.objects FOR SELECT USING (true);
CREATE POLICY "Public Storage Insert" ON storage.objects FOR INSERT WITH CHECK (true);

-- ====================================================================
-- INITIAL SEED DATA
-- ====================================================================
INSERT INTO public.users (id, email, full_name, role)
VALUES ('00000000-0000-0000-0000-000000000001', 'admin@finsight.ai', 'FinSight Admin', 'admin')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.businesses (id, owner_id, company_name, tax_registration_number, default_currency)
VALUES ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'FinSight Enterprise Inc', 'TAX-88942-AI', 'USD')
ON CONFLICT (id) DO NOTHING;
