import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Menu,
  Plus,
  Globe,
  Trophy,
  BarChart3,
  Layers,
  Bot,
  Users,
  Building2,
  FileText,
  CreditCard,
  Scan,
  Bell,
  Settings,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const Sidebar = ({
  currentTab,
  onSelectTab,
  unreadNotificationsCount = 0,
  onOpenNewInvoice
}) => {
  const [isPinnedOpen, setIsPinnedOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isInitialTimedOpen, setIsInitialTimedOpen] = useState(true);
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialTimedOpen(false);
    }, 60000); // 60 seconds (1 min)

    return () => clearTimeout(timer);
  }, []);

  const isExpanded = isPinnedOpen || isHovered || isInitialTimedOpen;

  const handleToggleClick = () => {
    if (isInitialTimedOpen) {
      setIsInitialTimedOpen(false);
      setIsPinnedOpen(false);
    } else {
      setIsPinnedOpen((prev) => !prev);
    }
  };

  const primaryNavItems = [
    { id: 'dashboard', label: 'Home', icon: Globe },
    { id: 'invoices', label: 'Invoices', icon: Trophy },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'receipts', label: 'Receipt Scanner', icon: Layers },
    { id: 'copilot', label: 'AI Copilot', icon: Bot, badge: 'AI' },
    { id: 'expenses', label: 'Expenses', icon: CreditCard }
  ];

  const moreNavItems = [
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'vendors', label: 'Vendors', icon: Building2 },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      count: unreadNotificationsCount
    },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <motion.aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      animate={{ width: isExpanded ? 240 : 68 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="relative flex flex-col h-screen bg-white dark:bg-[#121824] text-slate-800 dark:text-slate-200 border-r border-slate-200/90 dark:border-slate-800/80 z-30 select-none flex-shrink-0 transition-colors"
    >
      {/* Top Header: Hamburger Button + finsight title */}
      <div className="flex items-center h-16 px-3.5 border-b border-transparent">
        <button
          onClick={handleToggleClick}
          className="w-10 h-10 rounded-full flex items-center justify-center text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex-shrink-0"
          title={isExpanded ? 'Collapse menu' : 'Expand menu'}
        >
          <Menu className="w-5 h-5 stroke-[2]" />
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.15 }}
              className="ml-3 flex items-center gap-1.5 overflow-hidden whitespace-nowrap cursor-pointer"
              onClick={() => onSelectTab('dashboard')}
            >
              <span className="font-bold text-xl text-slate-900 dark:text-white tracking-tight lowercase">
                finsight<span className="text-blue-600 dark:text-blue-400">.ai</span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* "+ Create" Action Button */}
      <div className="px-3 py-2">
        <button
          onClick={() => {
            if (onOpenNewInvoice) {
              onOpenNewInvoice();
            } else {
              onSelectTab('invoices');
            }
          }}
          className={`flex items-center justify-center gap-2 rounded-full bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-950 font-medium text-sm shadow-xs transition-all active:scale-[0.98] ${
            isExpanded ? 'w-full py-2.5 px-4' : 'w-10 h-10 mx-auto p-0'
          }`}
          title="Create"
        >
          <Plus className="w-4 h-4 stroke-[2.5] flex-shrink-0" />
          {isExpanded && (
            <span className="text-xs font-semibold tracking-wide">Create</span>
          )}
        </button>
      </div>

      {/* Main Navigation Items */}
      <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1 scrollbar-none">
        {primaryNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-full text-xs font-medium transition-all group relative ${
                isActive
                  ? 'bg-amber-50/90 dark:bg-amber-400/10 text-slate-950 dark:text-amber-200 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
              }`}
              title={!isExpanded ? item.label : undefined}
            >
              <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                <Icon
                  className={`w-[18px] h-[18px] transition-colors ${
                    isActive
                      ? 'text-slate-950 dark:text-amber-300 stroke-[2.2]'
                      : 'text-slate-600 dark:text-slate-400 group-hover:text-slate-950 dark:group-hover:text-white stroke-[1.8]'
                  }`}
                />
              </div>

              {isExpanded && (
                <span className="flex-1 text-left truncate text-xs font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-950 dark:group-hover:text-white">
                  {item.label}
                </span>
              )}

              {isExpanded && item.badge && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 uppercase">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* "More" Accordion Section */}
        <div className="pt-1">
          <button
            onClick={() => setIsMoreOpen((prev) => !prev)}
            className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-full text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/60 transition-all group"
            title={!isExpanded ? 'More options' : undefined}
          >
            <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
              <svg
                className="w-4 h-4 text-slate-600 dark:text-slate-400 group-hover:text-slate-950 dark:group-hover:text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="6" y1="12" x2="18" y2="12" />
                <line x1="9" y1="18" x2="15" y2="18" />
              </svg>
            </div>

            {isExpanded && (
              <>
                <span className="flex-1 text-left truncate text-xs font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-950 dark:group-hover:text-white">
                  More
                </span>
                {isMoreOpen ? (
                  <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                )}
              </>
            )}
          </button>

          {/* Expanded secondary menu items */}
          {isMoreOpen &&
            moreNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center gap-3.5 px-3 py-2 rounded-full text-xs font-medium transition-all group relative ${
                    isActive
                      ? 'bg-amber-50/90 dark:bg-amber-400/10 text-slate-950 dark:text-amber-200 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                  } ${isExpanded ? 'pl-5' : ''}`}
                  title={!isExpanded ? item.label : undefined}
                >
                  <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive
                          ? 'text-slate-950 dark:text-amber-300 stroke-[2.2]'
                          : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-950 dark:group-hover:text-white stroke-[1.8]'
                      }`}
                    />
                  </div>

                  {isExpanded && (
                    <span className="flex-1 text-left truncate text-xs text-slate-700 dark:text-slate-300 group-hover:text-slate-950 dark:group-hover:text-white">
                      {item.label}
                    </span>
                  )}

                  {item.count && item.count > 0 ? (
                    <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-blue-600 text-white">
                      {item.count}
                    </span>
                  ) : null}
                </button>
              );
            })}
        </div>
      </div>
    </motion.aside>
  );
};
