import {
  Customer,
  Expense,
  Invoice,
  NotificationItem,
  Receipt,
  UserProfile,
  Vendor,
  AiInsight,
} from '../types';

export const INITIAL_USER: UserProfile = {
  name: '',
  username: '',
  email: '',
  pronouns: '',
  tagline: '',
  occupation: '',
  companyName: '',
  companyAddress: '',
  city: '',
  location: '',
  taxRegistrationNumber: '',
  defaultCurrency: 'USD',
  avatarUrl: '',
  plan: 'Starter Free',
  customSupabaseUrl: '',
  customSupabaseAnonKey: ''
};

export const INITIAL_CUSTOMERS: Customer[] = [];

export const INITIAL_VENDORS: Vendor[] = [];

export const INITIAL_INVOICES: Invoice[] = [];

export const INITIAL_EXPENSES: Expense[] = [];

export const INITIAL_RECEIPTS: Receipt[] = [];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];

export const INITIAL_AI_INSIGHTS: AiInsight[] = [];
