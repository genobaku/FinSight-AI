import React from 'react';
import { Database, Image as ImageIcon, ExternalLink, CheckCircle2, AlertCircle } from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabase';
import { isCloudinaryConfigured } from '../../lib/cloudinary';
import { TabType } from '../../types';

interface IntegrationStatusHeaderProps {
  onSelectTab?: (tab: TabType) => void;
}

export const IntegrationStatusHeader: React.FC<IntegrationStatusHeaderProps> = ({ onSelectTab }) => {
  const supabaseActive = isSupabaseConfigured();
  const cloudinaryActive = isCloudinaryConfigured();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3 px-4 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-sm text-xs">
      <div className="flex flex-wrap items-center gap-4">
        {/* Supabase Indicator */}
        <div className="flex items-center gap-2">
          <Database className={`w-4 h-4 ${supabaseActive ? 'text-emerald-400' : 'text-amber-400'}`} />
          <span className="font-semibold text-slate-200">Supabase DB:</span>
          {supabaseActive ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-[11px]">
              <CheckCircle2 className="w-3 h-3" /> Live PostgreSQL
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold text-[11px]">
              <AlertCircle className="w-3 h-3" /> Local Mode (Add Env Key)
            </span>
          )}
        </div>

        {/* Cloudinary Indicator */}
        <div className="flex items-center gap-2 border-l border-slate-800 pl-4">
          <ImageIcon className={`w-4 h-4 ${cloudinaryActive ? 'text-emerald-400' : 'text-blue-400'}`} />
          <span className="font-semibold text-slate-200">Cloudinary CDN:</span>
          {cloudinaryActive ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-[11px]">
              <CheckCircle2 className="w-3 h-3" /> Direct Cloud Uploads
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold text-[11px]">
              Smart Fallback Active
            </span>
          )}
        </div>
      </div>

      {onSelectTab && (
        <button
          onClick={() => onSelectTab('settings')}
          className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-400 hover:text-blue-300 transition-colors"
        >
          <span>Configure Credentials</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};
