import React, { useState, useEffect } from 'react';
import {
  INITIAL_AI_INSIGHTS,
  INITIAL_CUSTOMERS,
  INITIAL_EXPENSES,
  INITIAL_INVOICES,
  INITIAL_NOTIFICATIONS,
  INITIAL_RECEIPTS,
  INITIAL_USER,
  INITIAL_VENDORS,
} from './data/mockData';
import {
  Customer,
  Expense,
  Invoice,
  NotificationItem,
  Receipt,
  TabType,
  UserProfile,
  Vendor,
} from './types';

// Layout
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { GlobalSearchModal } from './components/layout/GlobalSearchModal';
import { IntegrationStatusHeader } from './components/common/IntegrationStatusHeader';

// Views
import { LandingPage } from './components/landing/LandingPage';
import { LoginPage } from './components/auth/LoginPage';
import { DashboardView } from './components/dashboard/DashboardView';
import { InvoiceListView } from './components/invoices/InvoiceListView';
import { InvoiceModal } from './components/invoices/InvoiceModal';
import { InvoicePreviewModal } from './components/invoices/InvoicePreviewModal';
import { ExpensesView } from './components/views/ExpensesView';
import { ReceiptScannerView } from './components/views/ReceiptScannerView';
import { CustomersView } from './components/views/CustomersView';
import { VendorsView } from './components/views/VendorsView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { CopilotView } from './components/views/CopilotView';
import { NotificationsView } from './components/views/NotificationsView';
import { SettingsView } from './components/views/SettingsView';

// Supabase Service Integration
import { isSupabaseConfigured } from './lib/supabase';
import {
  fetchSupabaseInvoices,
  saveSupabaseInvoice,
  deleteSupabaseInvoice,
  fetchSupabaseExpenses,
  saveSupabaseExpense,
  fetchSupabaseReceipts,
  saveSupabaseReceipt,
  syncAllToSupabase,
} from './lib/supabaseService';

export function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Core Datasets (Default to empty arrays; populated via user uploads or Supabase sync)
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [aiInsights, setAiInsights] = useState<any[]>([]);

  // Modals & Active Selections
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [selectedInvoiceForEdit, setSelectedInvoiceForEdit] = useState<Invoice | undefined>(undefined);
  const [selectedInvoiceForPreview, setSelectedInvoiceForPreview] = useState<Invoice | null>(null);

  // Fetch initial records from Supabase on mount if configured
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    async function loadFromSupabase() {
      const dbInvoices = await fetchSupabaseInvoices();
      if (dbInvoices) setInvoices(dbInvoices);

      const dbExpenses = await fetchSupabaseExpenses();
      if (dbExpenses) setExpenses(dbExpenses);

      const dbReceipts = await fetchSupabaseReceipts();
      if (dbReceipts) setReceipts(dbReceipts);
    }

    loadFromSupabase();
  }, []);

  // Unread notifications count
  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  // Handlers for Invoices
  const handleSaveInvoice = (invoiceData: Omit<Invoice, 'id' | 'createdAt'>) => {
    let savedInvoice: Invoice;
    if (selectedInvoiceForEdit) {
      savedInvoice = { ...selectedInvoiceForEdit, ...invoiceData };
      setInvoices((prev) =>
        prev.map((i) => (i.id === selectedInvoiceForEdit.id ? savedInvoice : i))
      );
    } else {
      savedInvoice = {
        ...invoiceData,
        id: `inv-${Date.now()}`,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setInvoices((prev) => [savedInvoice, ...prev]);
    }

    saveSupabaseInvoice(savedInvoice);
    setIsInvoiceModalOpen(false);
    setSelectedInvoiceForEdit(undefined);
  };

  const handleDeleteInvoice = (id: string) => {
    setInvoices((prev) => prev.filter((i) => i.id !== id));
    deleteSupabaseInvoice(id);
  };

  const handleUpdateStatus = (id: string, status: Invoice['status']) => {
    setInvoices((prev) =>
      prev.map((i) => {
        if (i.id === id) {
          const updated = { ...i, status };
          saveSupabaseInvoice(updated);
          return updated;
        }
        return i;
      })
    );
  };

  // Handlers for Expenses & Receipts
  const handleAddExpense = (newExp: Omit<Expense, 'id'>) => {
    const expenseWithId: Expense = {
      ...newExp,
      id: `exp-${Date.now()}`,
    };
    setExpenses((prev) => [expenseWithId, ...prev]);
    saveSupabaseExpense(expenseWithId);
  };

  const handleAddReceipt = (newRcpt: Receipt) => {
    setReceipts((prev) => [newRcpt, ...prev]);
    saveSupabaseReceipt(newRcpt);
  };

  // Handlers for Customers & Vendors
  const handleAddCustomer = (newCust: Omit<Customer, 'id' | 'createdAt'>) => {
    const customerWithId: Customer = {
      ...newCust,
      id: `cust-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setCustomers((prev) => [customerWithId, ...prev]);
  };

  const handleAddVendor = (newVen: Omit<Vendor, 'id' | 'createdAt'>) => {
    const vendorWithId: Vendor = {
      ...newVen,
      id: `ven-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setVendors((prev) => [vendorWithId, ...prev]);
  };

  const handleMarkNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleSyncToSupabase = async () => {
    return await syncAllToSupabase({
      invoices,
      expenses,
      receipts,
      customers,
      vendors,
      user,
    });
  };

  // Render standalone views (Landing & Login)
  if (currentTab === 'landing') {
    return (
      <LandingPage
        onLaunchApp={() => setCurrentTab('dashboard')}
        onLogin={() => setCurrentTab('login')}
      />
    );
  }

  if (currentTab === 'login') {
    return (
      <LoginPage
        onSuccess={() => setCurrentTab('dashboard')}
        onLoginSuccess={() => setCurrentTab('dashboard')}
        onBackToLanding={() => setCurrentTab('landing')}
      />
    );
  }

  return (
    <div className="flex h-screen w-screen bg-slate-50 overflow-hidden font-sans antialiased text-slate-900">
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        unreadNotificationsCount={unreadNotificationsCount}
        user={user}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Navbar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenNewInvoice={() => {
            setSelectedInvoiceForEdit(undefined);
            setIsInvoiceModalOpen(true);
          }}
          onOpenReceiptScan={() => setCurrentTab('receipts')}
          unreadNotificationsCount={unreadNotificationsCount}
          user={user}
        />

        <main className="flex-1 overflow-y-auto px-6 py-6 sm:px-8 bg-slate-50 space-y-6">
          <IntegrationStatusHeader onSelectTab={setCurrentTab} />

          {currentTab === 'dashboard' && (
            <DashboardView
              user={user}
              invoices={invoices}
              expenses={expenses}
              receipts={receipts}
              aiInsights={aiInsights}
              onSelectTab={setCurrentTab}
              onOpenNewInvoice={() => {
                setSelectedInvoiceForEdit(undefined);
                setIsInvoiceModalOpen(true);
              }}
              onOpenReceiptScan={() => setCurrentTab('receipts')}
              onSelectInvoice={(inv) => setSelectedInvoiceForPreview(inv)}
            />
          )}

          {currentTab === 'invoices' && (
            <InvoiceListView
              invoices={invoices}
              onOpenNewModal={() => {
                setSelectedInvoiceForEdit(undefined);
                setIsInvoiceModalOpen(true);
              }}
              onEditInvoice={(inv) => {
                setSelectedInvoiceForEdit(inv);
                setIsInvoiceModalOpen(true);
              }}
              onPreviewInvoice={(inv) => setSelectedInvoiceForPreview(inv)}
              onDeleteInvoice={handleDeleteInvoice}
              onUpdateStatus={handleUpdateStatus}
            />
          )}

          {currentTab === 'expenses' && (
            <ExpensesView
              expenses={expenses}
              vendors={vendors}
              onAddExpense={handleAddExpense}
            />
          )}

          {currentTab === 'receipts' && (
            <ReceiptScannerView
              receipts={receipts}
              onAddReceipt={handleAddReceipt}
            />
          )}

          {currentTab === 'customers' && (
            <CustomersView
              customers={customers}
              onAddCustomer={handleAddCustomer}
            />
          )}

          {currentTab === 'vendors' && (
            <VendorsView
              vendors={vendors}
              onAddVendor={handleAddVendor}
            />
          )}

          {currentTab === 'analytics' && <AnalyticsView />}

          {currentTab === 'copilot' && (
            <CopilotView invoices={invoices} expenses={expenses} />
          )}

          {currentTab === 'notifications' && (
            <NotificationsView
              notifications={notifications}
              onMarkAsRead={handleMarkNotificationRead}
              onSelectTab={setCurrentTab}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              user={user}
              onUpdateUser={(updated) => setUser({ ...user, ...updated })}
              onSyncSupabase={handleSyncToSupabase}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        invoices={invoices}
        customers={customers}
        vendors={vendors}
        expenses={expenses}
        onSelectTab={setCurrentTab}
        onSelectInvoice={(inv) => setSelectedInvoiceForPreview(inv)}
      />

      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => {
          setIsInvoiceModalOpen(false);
          setSelectedInvoiceForEdit(undefined);
        }}
        onSaveInvoice={handleSaveInvoice}
        invoices={invoices}
        customers={customers}
        initialInvoice={selectedInvoiceForEdit}
      />

      <InvoicePreviewModal
        isOpen={!!selectedInvoiceForPreview}
        onClose={() => setSelectedInvoiceForPreview(null)}
        invoice={selectedInvoiceForPreview}
        user={user}
      />
    </div>
  );
}

export default App;
