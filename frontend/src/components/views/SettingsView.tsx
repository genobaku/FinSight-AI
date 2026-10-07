import React, { useState } from 'react';
import { UserProfile } from '../../types';
import {
  User,
  Building2,
  Database,
  Image as ImageIcon,
  CheckCircle2,
  Save,
  Copy,
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
  const [taxRegistrationNumber, setTaxRegistrationNumber] = useState(user.taxRegistrationNumber);
  const [currency, setCurrency] = useState(user.defaultCurrency);
  const [isSaved, setIsSaved] = useState(false);

  // Supabase & Cloudinary state
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

  const handleTestCloudinaryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-xs">
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Account & Infrastructure Settings</h2>
        <p className="text-xs text-slate-500 mt-1">
          Manage business identity, tax settings, Supabase PostgreSQL database connections, and Cloudinary image upload services.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Profile */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
            <User className="w-4 h-4 text-blue-600" />
            <span>Personal Profile</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>
        </div>

        {/* Company Identity */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>Company & Invoicing Identity</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700">Company Legal Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700">Company Registered Address</label>
              <input
                type="text"
                value={companyAddress}
                onChange={(e) => setCompanyAddress(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-700">Tax Registration Number (EIN / GST)</label>
                <input
                  type="text"
                  value={taxRegistrationNumber}
                  onChange={(e) => setTaxRegistrationNumber(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Default Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-xs"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CAD">CAD ($)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Supabase Database Storage Section */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
              <Database className="w-4 h-4 text-emerald-600" />
              <span>Supabase PostgreSQL Data Store</span>
            </div>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                supabaseConfigured
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              {supabaseConfigured ? 'Connected & Active' : 'Fallback Local Mode'}
            </span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            FinSight AI integrates with Supabase for persistent financial storage (invoices, receipts, expenses, customers, vendors).
            Configure <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">VITE_SUPABASE_URL</code> and <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">VITE_SUPABASE_ANON_KEY</code> in environment variables or UI Secrets panel.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleCopySql}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              {copiedSchema ? <Check className="w-4 h-4 text-emerald-600" /> : <Code2 className="w-4 h-4 text-slate-600" />}
              <span>{copiedSchema ? 'SQL Schema Copied!' : 'Copy Supabase SQL Schema'}</span>
            </button>

            {onSyncSupabase && (
              <button
                type="button"
                onClick={handleSyncData}
                disabled={isSyncing}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all"
              >
                {isSyncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
                <span>Sync Data to Supabase</span>
              </button>
            )}
          </div>

          {syncStatus && (
            <p className="text-xs font-semibold text-emerald-700 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
              {syncStatus}
            </p>
          )}
        </div>

        {/* Cloudinary CDN Image Upload Section */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
              <ImageIcon className="w-4 h-4 text-blue-600" />
              <span>Cloudinary CDN Image Upload Service</span>
            </div>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                cloudinaryConfigured
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}
            >
              {cloudinaryConfigured ? 'Direct Cloudinary Active' : 'Smart API Proxy Active'}
            </span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            All scanned receipt images and invoice attachments are uploaded directly to Cloudinary. Configure <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">VITE_CLOUDINARY_CLOUD_NAME</code> and <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">VITE_CLOUDINARY_UPLOAD_PRESET</code> for custom unsigned cloud uploads.
          </p>

          <div className="space-y-3 pt-2">
            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 font-bold text-xs cursor-pointer transition-colors">
              <Upload className="w-4 h-4" />
              <span>{isUploadingTest ? 'Uploading to Cloudinary...' : 'Test Cloudinary Image Upload'}</span>
              <input type="file" accept="image/*" onChange={handleTestCloudinaryUpload} className="hidden" />
            </label>

            {testImageResult && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Upload Test Passed!
                </p>
                <a
                  href={testImageResult}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-blue-600 font-medium underline flex items-center gap-1 truncate"
                >
                  <span>{testImageResult}</span>
                  <ExternalLink className="w-3 h-3 flex-shrink-0" />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between">
          {isSaved && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Settings updated successfully!
            </span>
          )}

          <button
            type="submit"
            className="ml-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
