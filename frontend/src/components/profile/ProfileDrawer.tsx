import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  FileText,
  User,
  Users,
  Key,
  Settings,
  LogOut,
  Bell,
  MoreHorizontal,
  ChevronRight,
  Database
} from 'lucide-react';
import { UserProfile, TabType } from '../../types';

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onSelectTab: (tab: TabType) => void;
  onSignOut: () => void;
  unreadNotificationsCount?: number;
}

export const ProfileDrawer: React.FC<ProfileDrawerProps> = ({
  isOpen,
  onClose,
  user,
  onSelectTab,
  onSignOut,
  unreadNotificationsCount = 0
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-2xs z-50 transition-opacity"
          />

          {/* Drawer Container (Right side) */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-white dark:bg-[#121824] shadow-2xl z-50 flex flex-col border-l border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 select-none overflow-hidden"
          >
            {/* Header: User Avatar + Name + Close Button */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
              <div
                onClick={() => {
                  onSelectTab('profile');
                  onClose();
                }}
                className="flex items-center gap-3 cursor-pointer group flex-1 min-w-0"
              >
                <div className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center flex-shrink-0">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {user.name.split(' ').map((n) => n[0]).join('')}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-sm text-slate-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">
                    {user.name}
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                    @{user.username || 'user'}
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Close drawer"
              >
                <X className="w-5 h-5 stroke-[2]" />
              </button>
            </div>

            {/* Scrollable Navigation Body */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              {/* 1. Your Work */}
              <button
                onClick={() => {
                  onSelectTab('invoices');
                  onClose();
                }}
                className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors text-left"
              >
                <FileText className="w-4 h-4 text-slate-500" />
                <span className="flex-1">Your Work</span>
              </button>

              {/* 2. Your Profile */}
              <button
                onClick={() => {
                  onSelectTab('profile');
                  onClose();
                }}
                className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors text-left"
              >
                <User className="w-4 h-4 text-slate-500" />
                <span className="flex-1">Your Profile</span>
              </button>

              {/* 3. Your Groups / Customers */}
              <button
                onClick={() => {
                  onSelectTab('customers');
                  onClose();
                }}
                className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors text-left"
              >
                <Users className="w-4 h-4 text-slate-500" />
                <span className="flex-1">Your Groups</span>
              </button>

              {/* 4. Your API tokens / Database Connectivity */}
              <button
                onClick={() => {
                  onSelectTab('settings');
                  onClose();
                }}
                className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors text-left"
              >
                <Key className="w-4 h-4 text-slate-500" />
                <span className="flex-1">Your API tokens</span>
              </button>

              {/* 5. Settings */}
              <button
                onClick={() => {
                  onSelectTab('settings');
                  onClose();
                }}
                className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors text-left"
              >
                <Settings className="w-4 h-4 text-slate-500" />
                <span className="flex-1">Settings</span>
              </button>

              {/* Section Divider */}
              <div className="pt-2 pb-1">
                <div className="border-t border-slate-100 dark:border-slate-800" />
              </div>

              {/* Notifications Header */}
              <div className="pt-1">
                <div className="border-t border-slate-100 dark:border-slate-800" />
                <div className="flex items-center justify-between px-3.5 pt-3 pb-1">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-white">
                    <Bell className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    <span>Your notifications</span>
                  </div>
                  <MoreHorizontal className="w-4 h-4 text-slate-400 cursor-pointer" />
                </div>
                <p className="px-3.5 py-2 text-xs text-slate-400 dark:text-slate-500 italic">
                  {unreadNotificationsCount > 0 ? `${unreadNotificationsCount} unread notifications` : 'No notifications to display'}
                </p>
              </div>
            </div>

            {/* Bottom: Sign Out in Red with Rounded Corner Border */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-[#121824]">
              <button
                onClick={() => {
                  onClose();
                  onSignOut();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-rose-300 dark:border-rose-900/60 bg-rose-50/60 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 font-semibold text-xs hover:bg-rose-100 dark:hover:bg-rose-950/40 transition-colors shadow-2xs"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
