import React, { useState, useEffect } from 'react';
import {
  INITIAL_AI_INSIGHTS,
  INITIAL_CUSTOMERS,
  INITIAL_EXPENSES,
  INITIAL_INVOICES,
  INITIAL_NOTIFICATIONS,
  INITIAL_RECEIPTS,
  INITIAL_USER,
  INITIAL_VENDORS
} from './data/mockData';

// Layout
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { GlobalSearchModal } from './components/layout/GlobalSearchModal';
import { IntegrationStatusHeader } from './components/common/IntegrationStatusHeader';
import { ProfileDrawer } from './components/profile/ProfileDrawer';

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
import { ProfileView } from './components/profile/ProfileView';

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
  fetchSupabaseUserProfile,
  syncAllToSupabase
} from './lib/supabaseService';

export function App() {
  const [currentTab, setCurrentTab] = useState('landing');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);

  // Core Datasets initialized with Persistent LocalStorage Fallback or Mock Data
  const [user, setUser] = useState(() => {
    try {
      const cached = localStorage.getItem('finsight_user_profile');
      return cached ? { ...INITIAL_USER, ...JSON.parse(cached) } : INITIAL_USER;
    } catch (e) {
      return INITIAL_USER;
    }
  });

  const [invoices, setInvoices] = useState(() => {
    try {
      const cached = localStorage.getItem('finsight_invoices');
      return cached ? JSON.parse(cached) : INITIAL_INVOICES;
    } catch (e) {
      return INITIAL_INVOICES;
    }
  });

  const [customers, setCustomers] = useState(() => {
    try {
      const cached = localStorage.getItem('finsight_customers');
      return cached ? JSON.parse(cached) : INITIAL_CUSTOMERS;
    } catch (e) {
      return INITIAL_CUSTOMERS;
    }
  });

  const [vendors, setVendors] = useState(() => {
    try {
      const cached = localStorage.getItem('finsight_vendors');
      return cached ? JSON.parse(cached) : INITIAL_VENDORS;
    } catch (e) {
      return INITIAL_VENDORS;
    }
  });

  const [expenses, setExpenses] = useState(() => {
    try {
      const cached = localStorage.getItem('finsight_expenses');
      return cached ? JSON.parse(cached) : INITIAL_EXPENSES;
    } catch (e) {
      return INITIAL_EXPENSES;
    }
  });

  const [receipts, setReceipts] = useState(() => {
    try {
      const cached = localStorage.getItem('finsight_receipts');
      return cached ? JSON.parse(cached) : INITIAL_RECEIPTS;
    } catch (e) {
      return INITIAL_RECEIPTS;
    }
  });

  const [notifications, setNotifications] = useState(() => {
    try {
      const cached = localStorage.getItem('finsight_notifications');
      return cached ? JSON.parse(cached) : INITIAL_NOTIFICATIONS;
    } catch (e) {
      return INITIAL_NOTIFICATIONS;
    }
  });

  const [aiInsights, setAiInsights] = useState(INITIAL_AI_INSIGHTS);

  // Sync state changes to localStorage whenever they mutate
  useEffect(() => {
    try {
      localStorage.setItem('finsight_invoices', JSON.stringify(invoices));
    } catch (e) {}
  }, [invoices]);

  useEffect(() => {
    try {
      localStorage.setItem('finsight_expenses', JSON.stringify(expenses));
    } catch (e) {}
  }, [expenses]);

  useEffect(() => {
    try {
      localStorage.setItem('finsight_receipts', JSON.stringify(receipts));
    } catch (e) {}
  }, [receipts]);

  useEffect(() => {
    try {
      localStorage.setItem('finsight_customers', JSON.stringify(customers));
    } catch (e) {}
  }, [customers]);

  useEffect(() => {
    try {
      localStorage.setItem('finsight_vendors', JSON.stringify(vendors));
    } catch (e) {}
  }, [vendors]);

  useEffect(() => {
    try {
      localStorage.setItem('finsight_notifications', JSON.stringify(notifications));
    } catch (e) {}
  }, [notifications]);

  // Modals & Active Selections
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [selectedInvoiceForEdit, setSelectedInvoiceForEdit] = useState(undefined);
  const [selectedInvoiceForPreview, setSelectedInvoiceForPreview] = useState(null);

  // Fetch initial records from Supabase on mount if configured
  useEffect(() => {
    // Check localStorage cache first
    const cachedProfile = localStorage.getItem('finsight_user_profile');
    if (cachedProfile) {
      try {
        setUser((prev) => ({ ...prev, ...JSON.parse(cachedProfile) }));
      } catch (e) {}
    }

    if (!isSupabaseConfigured()) return;

    async function loadFromSupabase() {
      const dbUser = await fetchSupabaseUserProfile();
      if (dbUser) setUser(dbUser);

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
  const handleSaveInvoice = (invoiceData) => {
    let savedInvoice;
    if (selectedInvoiceForEdit) {
      savedInvoice = { ...selectedInvoiceForEdit, ...invoiceData };
      setInvoices((prev) =>
        prev.map((i) => (i.id === selectedInvoiceForEdit.id ? savedInvoice : i))
      );
    } else {
      savedInvoice = {
        ...invoiceData,
        id: `inv-${Date.now()}`,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setInvoices((prev) => [savedInvoice, ...prev]);
    }

    saveSupabaseInvoice(savedInvoice);
    setIsInvoiceModalOpen(false);
    setSelectedInvoiceForEdit(undefined);
  };

  const handleDeleteInvoice = (id) => {
    setInvoices((prev) => prev.filter((i) => i.id !== id));
    deleteSupabaseInvoice(id);
  };

  const handleUpdateStatus = (id, status) => {
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
  const handleAddExpense = (newExp) => {
    const expenseWithId = {
      ...newExp,
      id: `exp-${Date.now()}`
    };
    setExpenses((prev) => [expenseWithId, ...prev]);
    saveSupabaseExpense(expenseWithId);
  };

  const handleAddReceipt = (newRcpt) => {
    const receiptWithId = {
      ...newRcpt,
      id: `rcpt-${Date.now()}`
    };
    setReceipts((prev) => [receiptWithId, ...prev]);
    saveSupabaseReceipt(receiptWithId);
  };

  // Handlers for Customers & Vendors
  const handleAddCustomer = (newCust) => {
    const custWithId = {
      ...newCust,
      id: `cust-${Date.now()}`
    };
    setCustomers((prev) => [custWithId, ...prev]);
  };

  const handleAddVendor = (newVend) => {
    const vendWithId = {
      ...newVend,
      id: `vend-${Date.now()}`
    };
    setVendors((prev) => [vendWithId, ...prev]);
  };

  // Handlers for Notifications
  const handleMarkNotificationRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  // Sync state to Supabase
  const handleSyncToSupabase = async () => {
    return await syncAllToSupabase(invoices, expenses, receipts);
  };

  if (currentTab === 'landing') {
    return (
      <LandingPage
        onLaunchApp={() => setCurrentTab('dashboard')}
        onLogin={() => setCurrentTab('login')}
        onGetStarted={() => setCurrentTab('dashboard')}
        onSignIn={() => setCurrentTab('login')}
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

  const isCopilotTab = currentTab === 'copilot';

  return (
    <div className="flex h-screen w-screen bg-slate-50 dark:bg-[#0b0f17] overflow-hidden font-sans antialiased text-slate-900 dark:text-slate-100 transition-colors">
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        unreadNotificationsCount={unreadNotificationsCount}
        user={user}
        onOpenNewInvoice={() => {
          setSelectedInvoiceForEdit(undefined);
          setIsInvoiceModalOpen(true);
        }}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Navbar */}
        {!isCopilotTab && (
          <Navbar
            currentTab={currentTab}
            onSelectTab={setCurrentTab}
            onOpenSearch={() => setIsSearchOpen(true)}
            onOpenNewInvoice={() => {
              setSelectedInvoiceForEdit(undefined);
              setIsInvoiceModalOpen(true);
            }}
            onOpenReceiptScan={() => setCurrentTab('receipts')}
            onOpenProfileDrawer={() => setIsProfileDrawerOpen(true)}
            unreadNotificationsCount={unreadNotificationsCount}
            user={user}
          />
        )}

        <main
          className={`flex-1 overflow-hidden transition-colors ${
            isCopilotTab
              ? 'p-0 flex flex-col h-full w-full'
              : 'overflow-y-auto px-6 py-6 sm:px-8 bg-slate-50 dark:bg-[#0b0f17] text-slate-900 dark:text-slate-100 space-y-6'
          }`}
        >
          {/* Integration Status Header ONLY on Home / Dashboard view */}
          {currentTab === 'dashboard' && (
            <IntegrationStatusHeader onSelectTab={setCurrentTab} />
          )}

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
              customers={customers}
              onOpenCreateModal={() => {
                setSelectedInvoiceForEdit(undefined);
                setIsInvoiceModalOpen(true);
              }}
              onOpenEditModal={(inv) => {
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

          {currentTab === 'analytics' && (
            <AnalyticsView
              invoices={invoices}
              expenses={expenses}
              receipts={receipts}
            />
          )}

          {currentTab === 'copilot' && (
            <CopilotView invoices={invoices} expenses={expenses} />
          )}

          {currentTab === 'profile' && (
            <ProfileView
              user={user}
              onUpdateUser={(updated) => setUser({ ...user, ...updated })}
              onSelectTab={setCurrentTab}
            />
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

      {/* Kaggle-style Profile Slidebar Drawer (Right Side) */}
      <ProfileDrawer
        isOpen={isProfileDrawerOpen}
        onClose={() => setIsProfileDrawerOpen(false)}
        user={user}
        onSelectTab={setCurrentTab}
        onSignOut={() => setCurrentTab('login')}
        unreadNotificationsCount={unreadNotificationsCount}
      />

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
