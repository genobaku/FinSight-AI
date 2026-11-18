import React from 'react';
import { Database, Image as ImageIcon, ExternalLink, CheckCircle2, AlertCircle } from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabase';
import { isCloudinaryConfigured } from '../../lib/cloudinary';

export const IntegrationStatusHeader = ({ onSelectTab }) => {
  const supabaseActive = isSupabaseConfigured();
  const cloudinaryActive = isCloudinaryConfigured();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3 px-4 bg-slate-100 dark:bg-[#121824] text-slate-800 dark:text-white rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-xs text-xs transition-colors">
      <div className="flex flex-wrap items-center gap-4">
        {/* Supabase Indicator */}
        <div className="flex items-center gap-2">
          <Database className={`w-4 h-4 ${supabaseActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`} />
          <span className="font-semibold text-slate-700 dark:text-slate-200">Supabase DB:</span>
          {supabaseActive ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30 font-bold text-[11px]">
              <CheckCircle2 className="w-3 h-3" /> Live PostgreSQL
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30 font-semibold text-[11px]">
              <AlertCircle className="w-3 h-3" /> Local Mode (Add Env Key)
            </span>
          )}
        </div>

        {/* Cloudinary Indicator */}
        <div className="flex items-center gap-2 border-l border-slate-300 dark:border-slate-800 pl-4">
          <ImageIcon className={`w-4 h-4 ${cloudinaryActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'}`} />
          <span className="font-semibold text-slate-700 dark:text-slate-200">Cloudinary CDN:</span>
          {cloudinaryActive ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30 font-bold text-[11px]">
              <CheckCircle2 className="w-3 h-3" /> Direct Cloud Uploads
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-500/30 font-semibold text-[11px]">
              Smart Fallback Active
            </span>
          )}
        </div>
      </div>

      {onSelectTab && (
        <button
          onClick={() => onSelectTab('settings')}
          className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
        >
          <span>Configure Credentials</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};
