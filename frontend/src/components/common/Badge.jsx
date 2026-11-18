import React from 'react';

export const Badge = ({ status, className = '' }) => {
  const getColors = (val) => {
    const s = (val || '').toLowerCase();
    if (s === 'paid' || s === 'verified' || s === 'active' || s === 'approved' || s === 'success') {
      return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/50 ring-emerald-500/10';
    }
    if (s === 'pending' || s === 'pending review' || s === 'in review') {
      return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/50 ring-amber-500/10';
    }
    if (s === 'overdue' || s === 'flagged' || s === 'rejected' || s === 'high') {
      return 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200/60 dark:border-rose-800/50 ring-rose-500/10';
    }
    if (s === 'draft' || s === 'inactive' || s === 'medium') {
      return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 ring-slate-500/10';
    }
    return 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200/60 dark:border-blue-800/50 ring-blue-500/10';
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ring-1 ring-inset transition-colors ${getColors(
        status
      )} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
};
