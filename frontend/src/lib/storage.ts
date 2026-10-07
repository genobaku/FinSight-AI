import {
  Customer,
  Expense,
  Invoice,
  NotificationItem,
  Receipt,
  UserProfile,
  Vendor,
} from '../types';
import {
  INITIAL_CUSTOMERS,
  INITIAL_EXPENSES,
  INITIAL_INVOICES,
  INITIAL_NOTIFICATIONS,
  INITIAL_RECEIPTS,
  INITIAL_USER,
  INITIAL_VENDORS,
} from '../data/mockData';

const KEYS = {
  USER: 'finsight_user',
  INVOICES: 'finsight_invoices',
  RECEIPTS: 'finsight_receipts',
  CUSTOMERS: 'finsight_customers',
  VENDORS: 'finsight_vendors',
  EXPENSES: 'finsight_expenses',
  NOTIFICATIONS: 'finsight_notifications',
};

export const storage = {
  getUser: (): UserProfile => {
    try {
      const data = localStorage.getItem(KEYS.USER);
      return data ? JSON.parse(data) : INITIAL_USER;
    } catch {
      return INITIAL_USER;
    }
  },
  saveUser: (user: UserProfile) => {
    localStorage.setItem(KEYS.USER, JSON.stringify(user));
  },

  getInvoices: (): Invoice[] => {
    try {
      const data = localStorage.getItem(KEYS.INVOICES);
      return data ? JSON.parse(data) : INITIAL_INVOICES;
    } catch {
      return INITIAL_INVOICES;
    }
  },
  saveInvoices: (invoices: Invoice[]) => {
    localStorage.setItem(KEYS.INVOICES, JSON.stringify(invoices));
  },

  getReceipts: (): Receipt[] => {
    try {
      const data = localStorage.getItem(KEYS.RECEIPTS);
      return data ? JSON.parse(data) : INITIAL_RECEIPTS;
    } catch {
      return INITIAL_RECEIPTS;
    }
  },
  saveReceipts: (receipts: Receipt[]) => {
    localStorage.setItem(KEYS.RECEIPTS, JSON.stringify(receipts));
  },

  getCustomers: (): Customer[] => {
    try {
      const data = localStorage.getItem(KEYS.CUSTOMERS);
      return data ? JSON.parse(data) : INITIAL_CUSTOMERS;
    } catch {
      return INITIAL_CUSTOMERS;
    }
  },
  saveCustomers: (customers: Customer[]) => {
    localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify(customers));
  },

  getVendors: (): Vendor[] => {
    try {
      const data = localStorage.getItem(KEYS.VENDORS);
      return data ? JSON.parse(data) : INITIAL_VENDORS;
    } catch {
      return INITIAL_VENDORS;
    }
  },
  saveVendors: (vendors: Vendor[]) => {
    localStorage.setItem(KEYS.VENDORS, JSON.stringify(vendors));
  },

  getExpenses: (): Expense[] => {
    try {
      const data = localStorage.getItem(KEYS.EXPENSES);
      return data ? JSON.parse(data) : INITIAL_EXPENSES;
    } catch {
      return INITIAL_EXPENSES;
    }
  },
  saveExpenses: (expenses: Expense[]) => {
    localStorage.setItem(KEYS.EXPENSES, JSON.stringify(expenses));
  },

  getNotifications: (): NotificationItem[] => {
    try {
      const data = localStorage.getItem(KEYS.NOTIFICATIONS);
      return data ? JSON.parse(data) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  },
  saveNotifications: (notifications: NotificationItem[]) => {
    localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  },

  resetAllData: () => {
    localStorage.removeItem(KEYS.USER);
    localStorage.removeItem(KEYS.INVOICES);
    localStorage.removeItem(KEYS.RECEIPTS);
    localStorage.removeItem(KEYS.CUSTOMERS);
    localStorage.removeItem(KEYS.VENDORS);
    localStorage.removeItem(KEYS.EXPENSES);
    localStorage.removeItem(KEYS.NOTIFICATIONS);
  },
};
