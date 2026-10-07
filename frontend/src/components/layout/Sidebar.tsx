import React from 'react';
import { motion } from 'motion/react';
import {
  LayoutDashboard,
  FileText,
  Scan,
  Users,
  Building2,
  CreditCard,
  BarChart3,
  Bot,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  LogOut,
  Globe,
  HelpCircle,
} from 'lucide-react';
import { TabType, UserProfile } from '../../types';

interface SidebarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  unreadNotificationsCount: number;
  user: UserProfile;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  unreadNotificationsCount,
  user,
}) => {
  const mainNavItems = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'invoices' as TabType, label: 'Invoices', icon: FileText },
    { id: 'expenses' as TabType, label: 'Expenses', icon: CreditCard },
    { id: 'receipts' as TabType, label: 'Receipt Scanner', icon: Scan },
  ];

  const intelNavItems = [
    { id: 'copilot' as TabType, label: 'AI Assistant', icon: Bot, badge: 'AI' },
    { id: 'analytics' as TabType, label: 'Analytics', icon: BarChart3 },
    { id: 'customers' as TabType, label: 'Customers', icon: Users },
    { id: 'vendors' as TabType, label: 'Vendors', icon: Building2 },
    {
      id: 'notifications' as TabType,
      label: 'Notifications',
      icon: Bell,
      count: unreadNotificationsCount,
    },
    { id: 'settings' as TabType, label: 'Settings', icon: Settings },
  ];

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 80 : 260 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="relative flex flex-col h-screen bg-white text-slate-700 border-r border-slate-200/90 z-30 select-none flex-shrink-0"
    >
      {/* Logo Header */}
      <div className="flex items-center justify-between h-[72px] px-5 border-b border-slate-200/80">
        <button
          onClick={() => onSelectTab('landing')}
          className="flex items-center gap-2.5 overflow-hidden text-left hover:opacity-90 transition-opacity"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-extrabold flex-shrink-0 shadow-xs">
            <Zap className="w-4 h-4 fill-white" />
          </div>
          {!isCollapsed && (
            <span className="font-extrabold text-lg text-blue-600 tracking-tight">
              FinSight <span className="text-slate-900">AI</span>
            </span>
          )}
        </button>

        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Navigation List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin scrollbar-thumb-slate-200">
        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-blue-50 text-blue-600 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon
                className={`w-4 h-4 flex-shrink-0 ${
                  isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                }`}
              />

              {!isCollapsed && <span className="flex-1 text-left truncate">{item.label}</span>}
            </button>
          );
        })}

        {/* Intelligence Section Header */}
        {!isCollapsed && (
          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold px-3 pt-5 pb-1.5">
            Financial Intelligence
          </div>
        )}

        {intelNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-blue-50 text-blue-600 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon
                className={`w-4 h-4 flex-shrink-0 ${
                  isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                }`}
              />

              {!isCollapsed && <span className="flex-1 text-left truncate">{item.label}</span>}

              {!isCollapsed && item.badge && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-blue-100 text-blue-700 uppercase">
                  {item.badge}
                </span>
              )}

              {item.count && item.count > 0 ? (
                <span
                  className={`px-2 py-0.5 text-[11px] font-bold rounded-full ${
                    isCollapsed ? 'absolute top-1 right-1' : ''
                  } ${isActive ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'}`}
                >
                  {item.count}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-slate-200/80 space-y-3">
        <button
          onClick={() => onSelectTab('landing')}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors"
        >
          <Globe className="w-4 h-4 flex-shrink-0 text-slate-400" />
          {!isCollapsed && <span>Public Landing Page</span>}
        </button>

        <div className="pt-2 border-t border-slate-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-xs shadow-xs">
            {user.name.split(' ').map((n) => n[0]).join('')}
          </div>

          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
              <p className="text-[11px] text-slate-500 truncate">{user.plan} Plan</p>
            </div>
          )}

          {!isCollapsed && (
            <button
              onClick={() => onSelectTab('login')}
              className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </motion.aside>
  );
};
