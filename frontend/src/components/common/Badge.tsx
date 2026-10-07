import React from 'react';

interface BadgeProps {
  status: string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, className = '' }) => {
  const getColors = (val: string) => {
    const s = val.toLowerCase();
    if (s === 'paid' || s === 'verified' || s === 'active' || s === 'approved' || s === 'success') {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200/60 ring-emerald-500/10';
    }
    if (s === 'pending' || s === 'pending review' || s === 'in review') {
      return 'bg-amber-50 text-amber-700 border-amber-200/60 ring-amber-500/10';
    }
    if (s === 'overdue' || s === 'flagged' || s === 'rejected' || s === 'high') {
      return 'bg-rose-50 text-rose-700 border-rose-200/60 ring-rose-500/10';
    }
    if (s === 'draft' || s === 'inactive' || s === 'medium') {
      return 'bg-slate-100 text-slate-700 border-slate-200 ring-slate-500/10';
    }
    return 'bg-blue-50 text-blue-700 border-blue-200/60 ring-blue-500/10';
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
