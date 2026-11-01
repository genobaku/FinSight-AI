import React, { useState } from 'react';
import {
  Search,
  Plus,
  Bell,
  Scan,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Sparkles,
  Menu,
} from 'lucide-react';
import { TabType, UserProfile } from '../../types';

interface NavbarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onOpenSearch: () => void;
  onOpenNewInvoice: () => void;
  onOpenReceiptScan: () => void;
  unreadNotificationsCount: number;
  user: UserProfile;
  onOpenMobileMenu: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenSearch,
  onOpenNewInvoice,
  onOpenReceiptScan,
  unreadNotificationsCount,
  user,
  onOpenMobileMenu,
}) => {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const getPageTitle = (tab: TabType) => {
    switch (tab) {
      case 'dashboard':
        return 'Financial Overview';
      case 'invoices':
        return 'Invoices & Billing';
      case 'receipts':
        return 'AI Receipt Scanner & OCR';
      case 'expenses':
        return 'Expenses & Subscriptions';
      case 'customers':
        return 'Customer Directory';
      case 'vendors':
        return 'Vendors & Payables';
      case 'analytics':
        return 'Financial Intelligence & Reports';
      case 'copilot':
        return 'FinSight AI Copilot';
      case 'notifications':
        return 'Notification Center';
      case 'settings':
        return 'Account & Organization Settings';
      default:
        return 'Dashboard';
    }
  };

  return (
    <header className="h-[72px] bg-white border-b border-slate-200/90 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-20 gap-3">
      {/* Left: Hamburger (mobile) + Title */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Hamburger - only on mobile */}
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors flex-shrink-0"
          title="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 min-w-0">
          <h1 className="text-base sm:text-xl font-extrabold text-slate-900 tracking-tight truncate">
            {getPageTitle(currentTab)}
          </h1>
          {currentTab === 'copilot' && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-200 flex-shrink-0">
              <Sparkles className="w-3 h-3 text-blue-600" /> Powered by Gemini
            </span>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {/* Search Bar Trigger - hidden on small mobile */}
        <button
          onClick={onOpenSearch}
          className="hidden md:flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-100/90 hover:bg-slate-200/70 border border-transparent text-slate-500 text-xs font-medium transition-all cursor-pointer w-48 lg:w-72 xl:w-80 justify-between"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span className="truncate hidden lg:inline">Search invoices, vendors or AI reports...</span>
            <span className="truncate lg:hidden">Search...</span>
          </div>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-white rounded-md border border-slate-200 font-mono text-slate-400">
            ⌘K
          </kbd>
        </button>

        {/* Search icon only on small screens */}
        <button
          onClick={onOpenSearch}
          className="md:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
          title="Search"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenReceiptScan}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all active:scale-95"
          >
            <Scan className="w-4 h-4 text-blue-600" />
            <span className="hidden lg:inline">Scan Receipt</span>
          </button>

          <button
            onClick={onOpenNewInvoice}
            className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Create Invoice</span>
          </button>
        </div>

        {/* Notification Bell */}
        <button
          onClick={() => onSelectTab('notifications')}
          className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
          )}
        </button>

        {/* Profile Avatar Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-extrabold flex items-center justify-center text-xs">
              {user.name.split(' ').map((n) => n[0]).join('')}
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {showProfileDropdown && (
            <div
              className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2"
              onClick={() => setShowProfileDropdown(false)}
            >
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
              </div>

              <button
                onClick={() => onSelectTab('settings')}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <User className="w-4 h-4 text-slate-400" />
                Profile & Company
              </button>

              <button
                onClick={() => onSelectTab('settings')}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                Settings & Billing
              </button>

              <div className="border-t border-slate-100 my-1" />

              <button
                onClick={() => onSelectTab('login')}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
