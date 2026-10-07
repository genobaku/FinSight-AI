import React from 'react';
import { Bell, CheckCircle2, AlertCircle, Sparkles, FileText, ArrowRight } from 'lucide-react';
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
  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Notification Center</h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time alerts on overdue invoices, AI financial insights, and OCR scan confirmations.
          </p>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {notifications.map((n) => (
          <div
            key={n.id}
            onClick={() => {
              onMarkAsRead(n.id);
              if (n.linkTab) onSelectTab(n.linkTab);
            }}
            className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
              n.read
                ? 'bg-white border-slate-200 opacity-80'
                : 'bg-blue-50/40 border-blue-200 shadow-xs'
            }`}
          >
            <div className="p-2.5 rounded-xl bg-blue-100 text-blue-600 flex-shrink-0">
              {n.type === 'invoice' ? (
                <FileText className="w-5 h-5" />
              ) : n.type === 'insight' ? (
                <Sparkles className="w-5 h-5" />
              ) : (
                <Bell className="w-5 h-5" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 truncate">{n.title}</h3>
                <span className="text-[11px] text-slate-400 font-medium">{n.timestamp}</span>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
            </div>

            <ArrowRight className="w-4 h-4 text-slate-400 self-center" />
          </div>
        ))}
      </div>
    </div>
  );
};
