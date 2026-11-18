import React from 'react';
import {
  Search,
  Bell,
  Scan,
  Plus,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Sparkles,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const Navbar = ({
  currentTab,
  onSelectTab,
  onOpenSearch,
  onOpenNewInvoice,
  onOpenReceiptScan,
  onOpenProfileDrawer,
  unreadNotificationsCount,
  user
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-16 bg-white dark:bg-[#121824] border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20 transition-colors">
      {/* Left side: Search input */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center gap-3 px-4 py-2 rounded-full bg-slate-50 dark:bg-slate-800/70 hover:bg-slate-100/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-slate-500 dark:text-slate-400 text-xs font-normal transition-all cursor-pointer shadow-none focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-600"
        >
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
          <span className="flex-1 text-left truncate text-slate-500 dark:text-slate-400">
            Search invoices, receipts, metrics...
          </span>
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] bg-white dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-700 font-mono text-slate-400 dark:text-slate-500 shadow-2xs">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5 sm:gap-3 ml-4">
        {/* Theme Toggle Button (Light / Dark) */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={theme === 'dark' ? 'Switch to Light mode' : 'Switch to Dark mode'}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>

        {/* Quick action: Scan Receipt */}
        <button
          onClick={onOpenReceiptScan}
          className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium transition-all"
          title="Scan Receipt"
        >
          <Scan className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
          <span>Scan Receipt</span>
        </button>

        {/* Notification Bell */}
        <button
          onClick={() => onSelectTab('notifications')}
          className="relative p-2 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white dark:ring-slate-900" />
          )}
        </button>

        {/* Profile Avatar Button -> Triggers the Kaggle-style Right Drawer */}
        <button
          onClick={onOpenProfileDrawer}
          className="flex items-center gap-1.5 p-0.5 rounded-full hover:ring-2 hover:ring-slate-300 dark:hover:ring-slate-700 transition-all cursor-pointer"
          title="Open Profile Menu"
        >
          <div className="w-8 h-8 rounded-full bg-slate-900 dark:bg-slate-800 border border-slate-300/80 dark:border-slate-700 text-white font-bold flex items-center justify-center text-xs overflow-hidden">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <span>{user?.name ? user.name.split(' ').map((n) => n[0]).join('') : 'U'}</span>
            )}
          </div>
          <ChevronDown className="w-3 h-3 text-slate-400 dark:text-slate-500 hidden sm:block mr-1" />
        </button>
      </div>
    </header>
  );
};
