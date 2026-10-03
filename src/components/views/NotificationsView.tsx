
import React from 'react';
import {
  Bell,
  CheckCircle2,
  Sparkles,
  FileText,
  ArrowRight,
} from 'lucide-react';
import { NotificationItem, TabType } from '../../types';

interface NotificationsViewProps {
  notifications: NotificationItem[];
  onMarkAsRead: (id: string) => void;
  onSelectTab: (tab: TabType) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  notifications,
  onMarkAsRead,
  onSelectTab,
}) => {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">

     {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            <Bell className="w-4 h-4" />
            <span className="text-xs font-medium">Updates & alerts</span>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Notifications
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Stay up to date with invoices, insights and document activity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 h-9 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold flex items-center">
            {unreadCount} unread
          </span>
        </div>
      </div>

      {/* Notification list */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Recent notifications
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Select a notification to open the related section.
            </p>
          </div>
        </div>

        {notifications.length === 0 ? (
          <div className="py-16 px-6 text-center">
            <div className="w-10 h-10 mx-auto rounded-full bg-slate-100 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-slate-500" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 mt-4">
              You're all caught up
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              There are no new notifications right now.
              </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  onMarkAsRead(n.id);
                  if (n.linkTab) onSelectTab(n.linkTab);
                }}
                className={`px-5 py-4 flex items-start gap-4 cursor-pointer transition-colors hover:bg-slate-50 ${
                  !n.read ? 'bg-slate-50/60' : 'bg-white'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    !n.read
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {n.type === 'invoice' ? (
                    <FileText className="w-4 h-4" />
                  ) : n.type === 'insight' ? (
                    <Sparkles className="w-4 h-4" />
                  ) : (
                    <Bell className="w-4 h-4" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <h3
                        className={`text-sm truncate ${
                          n.read
                            ? 'font-medium text-slate-700'
                            : 'font-semibold text-slate-900'
                        }`}
                      >
                        {n.title}
                      </h3>
                      {!n.read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-900 flex-shrink-0" />
                      )}
                    </div>

                    <span className="text-[11px] text-slate-400 flex-shrink-0">
                      {n.timestamp}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mt-1.5 leading-5">
                    {n.message}
                  </p>
                </div>

                <ArrowRight className="w-4 h-4 text-slate-300 self-center flex-shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};







