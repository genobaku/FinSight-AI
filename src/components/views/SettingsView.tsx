






import React, { useState } from 'react';
import { UserProfile } from '../../types';
import {
  User,
  Building2,
  Database,
  Image as ImageIcon,
  CheckCircle2,
  Save,
  Check,
  RefreshCw,
  Upload,
  ExternalLink,
  Code2,
} from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabase';
import { isCloudinaryConfigured, uploadToCloudinary } from '../../lib/cloudinary';
import { SUPABASE_SQL_SCHEMA_SCRIPT } from '../../lib/supabaseService';

interface SettingsViewProps {
  user: UserProfile;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  onSyncSupabase?: () => Promise<{ success: boolean; message: string }>;
}


export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  onUpdateUser,
  onSyncSupabase,
}) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [companyName, setCompanyName] = useState(user.companyName);
  const [companyAddress, setCompanyAddress] = useState(user.companyAddress);
  const [taxRegistrationNumber, setTaxRegistrationNumber] = useState(
    user.taxRegistrationNumber
  );
  const [currency, setCurrency] = useState(user.defaultCurrency);
  const [isSaved, setIsSaved] = useState(false);

  const [copiedSchema, setCopiedSchema] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const [testImageResult, setTestImageResult] = useState<string | null>(null);
  const [isUploadingTest, setIsUploadingTest] = useState(false);

  const supabaseConfigured = isSupabaseConfigured();
  const cloudinaryConfigured = isCloudinaryConfigured();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onUpdateUser({
      name,
      email,
      companyName,
      companyAddress,
      taxRegistrationNumber,
      defaultCurrency: currency,
    });

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA_SCRIPT);
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2000);
  };

  const handleSyncData = async () => {
    if (!onSyncSupabase) return;

    setIsSyncing(true);
    setSyncStatus(null);

    const result = await onSyncSupabase();

    setSyncStatus(result.message);
    setIsSyncing(false);
  };

  const handleTestCloudinaryUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploadingTest(true);

      try {
        const res = await uploadToCloudinary(e.target.files[0]);
        setTestImageResult(res.secure_url);
      } catch (err) {
        console.error('Test upload error:', err);
      } finally {
        setIsUploadingTest(false);
      }
    }
  };

  const inputClass =
    'w-full mt-1.5 px-3.5 py-2.5 border border-slate-200 rounded-lg bg-white text-sm text-slate-900 outline-none transition-colors focus:border-slate-400 focus:ring-2 focus:ring-slate-100';
   return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      <div>
        <div className="flex items-center gap-2 text-slate-500 mb-2">
          <User className="w-4 h-4" />
          <span className="text-xs font-medium">Account & application</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Settings
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Manage your profile, company details and connected services.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="bg-white border border-slate-200 rounded-xl">
          <div className="px-6 py-5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-slate-500" />
              <h3 className="text-sm font-semibold text-slate-900">
                Personal profile
              </h3>
            </div>
          <p className="text-xs text-slate-500 mt-1">
              Update the account information used in your workspace.
            </p>
          </div>

          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-medium text-slate-700">
                Full name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        </section>

   <section className="bg-white border border-slate-200 rounded-xl">
          <div className="px-6 py-5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-500" />
              <h3 className="text-sm font-semibold text-slate-900">
                Company details
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              These details can be used across invoices and financial records.
            </p>
          </div>

          <div className="p-6 space-y-5">
            <div>
              <label className="text-xs font-medium text-slate-700">
                Company legal name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700">
                Registered address
              </label>
              <input
                type="text"
                value={companyAddress}
                onChange={(e) => setCompanyAddress(e.target.value)}
                className={inputClass}
              />
            </div>

<div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-xs font-medium text-slate-700">
                  Tax registration number
                </label>
                <input
                  type="text"
                  value={taxRegistrationNumber}
                  onChange={(e) => setTaxRegistrationNumber(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700">
                  Default currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className={inputClass}
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CAD">CAD ($)</option>
                </select>
              </div>
            </div>
          </div>
        </section>

<section className="bg-white border border-slate-200 rounded-xl">
          <div className="px-6 py-5 border-b border-slate-100">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-slate-500" />
                  <h3 className="text-sm font-semibold text-slate-900">
                    Supabase database
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Persistent storage for financial records and workspace data.
                </p>
              </div>

              <span
                className={`shrink-0 px-2.5 py-1 rounded-md text-[11px] font-semibold border ${
                  supabaseConfigured
                    ? 'bg-slate-50 text-slate-700 border-slate-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                {supabaseConfigured ? 'Connected' : 'Local mode'}
              </span>
            </div>
          </div>

<div className="p-6 space-y-4">
            <p className="text-sm text-slate-500 leading-relaxed">
              FinSight AI uses Supabase for persistent financial storage. The
              connection is controlled through the application environment
              variables.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleCopySql}
                className="h-10 px-4 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium flex items-center gap-2 transition-colors"
              >
                {copiedSchema ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Code2 className="w-4 h-4" />
                )}
                {copiedSchema ? 'Schema copied' : 'Copy SQL schema'}
              </button>

              {onSyncSupabase && (
                <button
                  type="button"
                  onClick={handleSyncData}
                  disabled={isSyncing}
                  className="h-10 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-sm font-semibold flex items-center gap-2 transition-colors"
                >
                  {isSyncing ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Database className="w-4 h-4" />
                  )}
                  {isSyncing ? 'Syncing...' : 'Sync data'}
                </button>
              )}
            </div>

            {syncStatus && (
              <p className="text-sm text-emerald-700 bg-emerald-50 px-3.5 py-3 rounded-lg border border-emerald-200">
                {syncStatus}
              </p>
            )}
          </div>
        </section>

<section className="bg-white border border-slate-200 rounded-xl">
          <div className="px-6 py-5 border-b border-slate-100">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-slate-500" />
                  <h3 className="text-sm font-semibold text-slate-900">
                    Cloudinary uploads
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Image storage for receipts and invoice attachments.
                </p>
              </div>

              <span
                className={`shrink-0 px-2.5 py-1 rounded-md text-[11px] font-semibold border ${
                  cloudinaryConfigured
                    ? 'bg-slate-50 text-slate-700 border-slate-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                {cloudinaryConfigured ? 'Connected' : 'Proxy mode'}
              </span>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <p className="text-sm text-slate-500 leading-relaxed">
              Test an image upload without changing your existing application
              configuration.
            </p>
          <label className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium cursor-pointer transition-colors">
              <Upload className="w-4 h-4" />
              {isUploadingTest ? 'Uploading...' : 'Test image upload'}
              <input
                type="file"
                accept="image/*"
                onChange={handleTestCloudinaryUpload}
                className="hidden"
              />
            </label>

            {testImageResult && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <p className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Upload test passed
                </p>

                <a
                  href={testImageResult}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 text-xs text-slate-600 hover:text-slate-900 underline flex items-center gap-1 truncate"
                >
                  <span>{testImageResult}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              </div>
            )}
          </div>
        </section>

        <div className="flex items-center justify-end gap-4 pt-1">
          {isSaved && (
            <span className="text-sm font-medium text-emerald-700 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Settings saved
            </span>
          )}

          <button
            type="submit"
            className="w-[145px] h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save settings
          </button>
        </div>
      </form>
    </div>
  );
};  