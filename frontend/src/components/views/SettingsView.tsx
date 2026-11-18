import React, { useState } from 'react';
import {
  User,
  Mail,
  Smartphone,
  ShieldCheck,
  Sun,
  Moon,
  ChevronDown,
  Info,
  ChevronRight,
  ExternalLink,
  Trash2,
  Key,
  Database,
  Check,
  Copy,
  AlertTriangle,
  RefreshCw,
  FolderPlus,
  Radio
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { UserProfile, TabType } from '../../types';
import { isSupabaseConfigured } from '../../lib/supabase';
import { SUPABASE_SQL_SCHEMA_SCRIPT } from '../../lib/supabaseService';

interface SettingsViewProps {
  user: UserProfile;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  onSelectTab?: (tab: TabType) => void;
  onSyncSupabase?: () => Promise<{ success: boolean; message: string }>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  onUpdateUser,
  onSelectTab,
  onSyncSupabase
}) => {
  const { theme, setTheme } = useTheme();

  // Active top tab in Settings: 'account' | 'api-tokens' | 'notifications'
  const [activeTab, setActiveTab] = useState<'account' | 'api-tokens' | 'notifications'>('account');

  // Account Settings state
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [emailInput, setEmailInput] = useState(user.email || 'user@example.com');
  const [phoneVerified, setPhoneVerified] = useState(true);
  const [identityVerified, setIdentityVerified] = useState(false);
  const [isVerifyingIdentity, setIsVerifyingIdentity] = useState(false);

  // Progression & Upvote toggles
  const [displayProgression, setDisplayProgression] = useState(true);
  const [autoUpvoteFork, setAutoUpvoteFork] = useState(true);
  const [upvoteReminders, setUpvoteReminders] = useState(true);

  // Quotas expansion states
  const [expandedQuota, setExpandedQuota] = useState<string | null>(null);

  // Notifications tab state
  const [allowSiteAndEmail, setAllowSiteAndEmail] = useState(true);
  const [allowNewsAndTips, setAllowNewsAndTips] = useState(false);

  // Expandable dropdowns for Notification sections
  const [expandedNotificationRow, setExpandedNotificationRow] = useState<string | null>(null);
  const [notificationPreferences, setNotificationPreferences] = useState<Record<string, string>>({
    statusAlerts: 'Email, Site',
    achievements: 'None',
    contentFollow: 'Email, Site',
    mentions: 'Email, Site',
    directMessages: 'Email',
    commentsTopics: 'Email, Site',
    newFollower: 'Site',
    groups: 'Email, Site'
  });

  // API Tokens tab state
  const [apiTokens, setApiTokens] = useState([
    {
      id: 'tok-1',
      name: 'Primary CLI Token',
      prefix: 'fsh_live_9a48',
      created: 'October 12, 2026',
      lastUsed: '2 hours ago'
    }
  ]);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [newKeyGenerated, setNewKeyGenerated] = useState<string | null>(null);
  const [showSqlCopied, setShowSqlCopied] = useState(false);

  // Handlers
  const handleSaveEmail = () => {
    onUpdateUser({ email: emailInput });
    setIsEditingEmail(false);
  };

  const handleCreateNewToken = () => {
    const rawKey = `fsh_live_${Math.random().toString(36).substring(2, 12)}_${Date.now().toString(36)}`;
    const prefix = `${rawKey.substring(0, 12)}...`;
    const newToken = {
      id: `tok-${Date.now()}`,
      name: `Token ${apiTokens.length + 1}`,
      prefix,
      created: 'Just now',
      lastUsed: 'Never'
    };
    setApiTokens([newToken, ...apiTokens]);
    setNewKeyGenerated(rawKey);
  };

  const handleDeleteToken = (id: string) => {
    setApiTokens(apiTokens.filter((t) => t.id !== id));
  };

  const handleCopySchema = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA_SCRIPT);
    setShowSqlCopied(true);
    setTimeout(() => setShowSqlCopied(false), 2000);
  };

  const toggleNotificationChoice = (key: string, option: string) => {
    setNotificationPreferences((prev) => ({
      ...prev,
      [key]: option
    }));
  };

  return (
    <div className="max-w-5xl mx-auto pb-24 text-slate-900 dark:text-slate-100 font-sans select-none">
      {/* Top Breadcrumb Links matching Kaggle screenshot: Your Work | Your Profile | Progression */}
      <div className="flex items-center justify-between pb-6 pt-2">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
            Settings
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Control over your Finsight account and all communications
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-5 text-xs font-medium text-slate-600 dark:text-slate-400">
          <button
            onClick={() => onSelectTab && onSelectTab('invoices')}
            className="flex items-center gap-1.5 hover:text-slate-950 dark:hover:text-white transition-colors cursor-pointer"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>Your Work</span>
          </button>
          <button
            onClick={() => onSelectTab && onSelectTab('profile')}
            className="flex items-center gap-1.5 hover:text-slate-950 dark:hover:text-white transition-colors cursor-pointer"
          >
            <User className="w-3.5 h-3.5" />
            <span>Your profile</span>
          </button>
          <button
            onClick={() => onSelectTab && onSelectTab('analytics')}
            className="flex items-center gap-1.5 hover:text-slate-950 dark:hover:text-white transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Progression</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation (Account | API Tokens | Notifications) */}
      <div className="flex items-center gap-6 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('account')}
          className={`pb-3 relative transition-colors ${
            activeTab === 'account'
              ? 'text-slate-950 dark:text-white'
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Account
          {activeTab === 'account' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-950 dark:bg-white rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('api-tokens')}
          className={`pb-3 relative transition-colors ${
            activeTab === 'api-tokens'
              ? 'text-slate-950 dark:text-white'
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          API Tokens
          {activeTab === 'api-tokens' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-950 dark:bg-white rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`pb-3 relative transition-colors ${
            activeTab === 'notifications'
              ? 'text-slate-950 dark:text-white'
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Notifications
          {activeTab === 'notifications' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-950 dark:bg-white rounded-full" />
          )}
        </button>
      </div>

      {/* TAB 1: ACCOUNT SETTINGS (Matches Image 2) */}
      {activeTab === 'account' && (
        <div className="pt-8 space-y-9 max-w-3xl">
          {/* Row 1: Email + Username & Account number on right */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            <div className="space-y-1.5 flex-1">
              <h2 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                Your email address
              </h2>
              {isEditingEmail ? (
                <div className="flex items-center gap-2 pt-1 max-w-sm">
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-900 dark:focus:ring-white"
                  />
                  <button
                    onClick={handleSaveEmail}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold hover:opacity-90"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEmailInput(user.email || '');
                      setIsEditingEmail(false);
                    }}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-500"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {user.email || 'user@finsight.local'}
                  </p>
                  <button
                    onClick={() => setIsEditingEmail(true)}
                    className="mt-1 inline-block px-3 py-1 rounded-full border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    Change email
                  </button>
                </>
              )}
            </div>

            <div className="sm:text-right space-y-3">
              <div>
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  Your username
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {user.username || 'anugaur'} <span className="text-[11px]">(not editable)</span>
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  Your account number
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  32384325
                </p>
              </div>
            </div>
          </div>

          {/* Row 2: Phone verification */}
          <div className="space-y-1">
            <h2 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              Phone verification
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {phoneVerified ? 'Verified' : 'Not verified'}
            </p>
          </div>

          {/* Row 3: Identity verification */}
          <div className="space-y-1.5">
            <h2 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              Identity verification
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">
              You have not verified your identity using Persona, a trusted 3rd-party service. Verifying your identity allows you to join financial benchmarks and publish enterprise models.{' '}
              <span className="underline cursor-pointer hover:text-slate-800 dark:hover:text-slate-200">
                Learn More
              </span>
            </p>
            <div className="pt-1">
              <button
                disabled={isVerifyingIdentity || identityVerified}
                onClick={() => {
                  setIsVerifyingIdentity(true);
                  setTimeout(() => {
                    setIsVerifyingIdentity(false);
                    setIdentityVerified(true);
                  }, 1200);
                }}
                className="px-3.5 py-1.5 rounded-full border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200 transition-colors"
              >
                {identityVerified
                  ? 'Identity Verified'
                  : isVerifyingIdentity
                  ? 'Connecting to Persona...'
                  : 'Verify my account'}
              </button>
            </div>
          </div>

          {/* Row 4: Theme */}
          <div className="space-y-2">
            <h2 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              Theme
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Choose your Finsight UI theme below.
            </p>
            <div className="relative inline-block w-48 pt-1">
              <label className="text-[10px] text-slate-400 dark:text-slate-500 block mb-0.5">
                Theme
              </label>
              <div className="relative">
                <select
                  value={theme === 'dark' ? 'dark' : 'light'}
                  onChange={(e) => setTheme(e.target.value as 'dark' | 'light')}
                  className="w-full appearance-none px-3 py-2 pr-8 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-slate-900 dark:focus:ring-white"
                >
                  <option value="light">Light theme</option>
                  <option value="dark">Dark theme</option>
                </select>
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <ChevronDown className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>

          {/* Row 5: Progression */}
          <div className="space-y-2">
            <h2 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              Progression
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">
              We recognize user achievements through the systems of Tiers, Medals, and Rankings. If you prefer not to have these displayed publicly on your profile and elsewhere, you can opt out.{' '}
              <span className="underline cursor-pointer hover:text-slate-800 dark:hover:text-slate-200">
                Learn more about progression
              </span>
            </p>
            <div className="flex items-center gap-3 pt-1">
              {/* Toggle switch */}
              <button
                type="button"
                onClick={() => setDisplayProgression(!displayProgression)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  displayProgression ? 'bg-slate-900 dark:bg-white' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white dark:bg-slate-900 shadow-sm ring-0 transition duration-200 ease-in-out ${
                    displayProgression ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                Display your Finsight Tier, Medals and Ranking publicly
              </span>
            </div>
          </div>

          {/* Row 6: Automatic Upvote when forking a Notebook */}
          <div className="space-y-2">
            <h2 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              Automatic Upvote when forking a Notebook
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">
              When you copy and edit someone else&apos;s Notebook, if you haven&apos;t already upvoted the Notebook, it will be upvoted automatically. When an upvote is given this way, we will remind you the first time you edit your copied version of the Notebook.
            </p>
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setAutoUpvoteFork(!autoUpvoteFork)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                    autoUpvoteFork ? 'bg-slate-900 dark:bg-white' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white dark:bg-slate-900 shadow-sm ring-0 transition duration-200 ease-in-out ${
                      autoUpvoteFork ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
                <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                  Upvote a Notebook when you copy and edit
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setUpvoteReminders(!upvoteReminders)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                    upvoteReminders ? 'bg-slate-900 dark:bg-white' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white dark:bg-slate-900 shadow-sm ring-0 transition duration-200 ease-in-out ${
                      upvoteReminders ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
                <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                  See upvote reminders when you copy and edit a Notebook
                </span>
              </div>
            </div>
          </div>

          {/* Row 7: Quotas List matching Image 2 */}
          <div className="space-y-3">
            <h2 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              Quotas
            </h2>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 border-t border-b border-slate-100 dark:border-slate-800">
              {/* Private Datasets */}
              <div className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">Private Datasets</p>
                  <p className="text-[11px] text-slate-500">0 B / 214.75 GB</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-32 sm:w-64 h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-900 dark:bg-white" style={{ width: '0%' }} />
                  </div>
                  <Info className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
                </div>
              </div>

              {/* Private Models */}
              <div className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">Private Models</p>
                  <p className="text-[11px] text-slate-500">0 B / 214.75 GB</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-32 sm:w-64 h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-900 dark:bg-white" style={{ width: '0%' }} />
                  </div>
                  <Info className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
                </div>
              </div>

              {/* Kaggle / Finsight GPU */}
              <div className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">Finsight GPU</p>
                  <p className="text-[11px] text-slate-500">00:13 / 30 hrs</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-32 sm:w-64 h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500" style={{ width: '2%' }} />
                  </div>
                  <Info className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
                </div>
              </div>

              {/* Kaggle / Finsight TPU */}
              <div className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">Finsight TPU</p>
                  <p className="text-[11px] text-slate-500">00:00 / 20 hrs</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-32 sm:w-64 h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-900 dark:bg-white" style={{ width: '0%' }} />
                  </div>
                  <Info className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
                </div>
              </div>

              {/* Daily AI Models */}
              <div className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">Daily AI Models</p>
                  <p className="text-[11px] text-slate-500">$0.00 / $10.00</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-32 sm:w-64 h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: '0%' }} />
                  </div>
                  <Info className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
                </div>
              </div>

              {/* Monthly AI Models */}
              <div className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">Monthly AI Models</p>
                  <p className="text-[11px] text-slate-500">$0.00 / $100.00</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-32 sm:w-64 h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: '0%' }} />
                  </div>
                  <Info className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
                </div>
              </div>
            </div>
          </div>

          {/* Row 8: Active logins */}
          <div className="space-y-1">
            <h2 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              Active logins
            </h2>
            <div className="pt-1">
              <p className="text-[11px] font-semibold text-slate-500">Google email</p>
              <p className="text-xs text-slate-800 dark:text-slate-200">
                {user.email || 'user@gmail.com'}
              </p>
            </div>
          </div>

          {/* Row 9: Your linked accounts */}
          <div className="space-y-2">
            <h2 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              Your linked accounts
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">
              Linked accounts allow you to access Google Cloud and GitHub services in Notebooks.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">
              To get started with Google Cloud Services, open a Notebook in the editor and click on Add-ons &gt; Google Cloud Services under the top menu. Then, follow the instructions in the model to link your Google Cloud account to Finsight.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">
              If you do not have Google Cloud services enabled for your Google account, please{' '}
              <span className="underline cursor-pointer hover:text-slate-800 dark:hover:text-slate-200">
                visit the Google Cloud Platform page
              </span>{' '}
              to get help setting it up.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">
              You can link your GitHub account from the Finsight notebook editor: Click on File &gt; Open Upload Notebook &gt; GitHub. Then, you can check the &ldquo;Include Private Repositories&rdquo; checkbox to link your GitHub account.
            </p>
          </div>

          {/* Row 10: Delete account */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <h2 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              Delete Finsight account
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Permanently delete your Finsight account
            </p>
            <div className="pt-1">
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                    if (onSelectTab) onSelectTab('login');
                  }
                }}
                className="px-3.5 py-1.5 rounded-full border border-slate-300 dark:border-slate-700 hover:border-rose-300 dark:hover:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
              >
                Delete account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: API TOKENS */}
      {activeTab === 'api-tokens' && (
        <div className="pt-8 space-y-8 max-w-3xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                Finsight API Credentials
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Use your API tokens to interact with the Finsight SDK, CLI, and automate financial workflows.
              </p>
            </div>
            <button
              onClick={handleCreateNewToken}
              className="px-3.5 py-1.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold hover:opacity-90 transition-opacity"
            >
              Create New Token
            </button>
          </div>

          {/* New Token Banner if created */}
          {newKeyGenerated && (
            <div className="p-4 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/20 space-y-2">
              <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                New token created! Copy it now as it will not be shown again.
              </p>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={newKeyGenerated}
                  className="flex-1 font-mono text-xs px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(newKeyGenerated);
                    setCopiedToken(newKeyGenerated);
                    setTimeout(() => setCopiedToken(null), 2000);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700"
                >
                  {copiedToken === newKeyGenerated ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          )}

          {/* Active Tokens Table */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {apiTokens.map((token) => (
              <div key={token.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{token.name}</p>
                  <p className="text-[11px] font-mono text-slate-500 mt-0.5">{token.prefix}</p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Created: {token.created} · Last used: {token.lastUsed}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteToken(token.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  title="Revoke token"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Central Supabase SQL Schema helper */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-600" />
                Central PostgreSQL Schema &amp; Storage Script
              </span>
              <button
                onClick={handleCopySchema}
                className="px-3 py-1 rounded-full border border-slate-300 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300"
              >
                {showSqlCopied ? 'Schema Copied!' : 'Copy SQL Schema'}
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Run this SQL script in Supabase SQL Editor if you are provisioning a custom database table cluster.
            </p>
          </div>
        </div>
      )}

      {/* TAB 3: NOTIFICATIONS (Matches Image 3) */}
      {activeTab === 'notifications' && (
        <div className="pt-8 space-y-9 max-w-4xl">
          {/* Top Row: Master Toggles + Email on Right */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            <div className="space-y-4 flex-1">
              {/* Toggle 1: Allow site and email notifications */}
              <div className="flex items-center justify-between max-w-md">
                <div>
                  <h2 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    Allow site and email notifications
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Updates on your work or things you follow
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAllowSiteAndEmail(!allowSiteAndEmail)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                      allowSiteAndEmail ? 'bg-slate-900 dark:bg-white' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white dark:bg-slate-900 shadow-sm ring-0 transition duration-200 ease-in-out ${
                        allowSiteAndEmail ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span className="text-xs text-slate-500 w-6">
                    {allowSiteAndEmail ? 'On' : 'Off'}
                  </span>
                </div>
              </div>

              {/* Toggle 2: Allow news and tips emails */}
              <div className="flex items-center justify-between max-w-md">
                <div>
                  <h2 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    Allow news and tips emails
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Updates from Finsight like new benchmarks, courses and features
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAllowNewsAndTips(!allowNewsAndTips)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                      allowNewsAndTips ? 'bg-slate-900 dark:bg-white' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white dark:bg-slate-900 shadow-sm ring-0 transition duration-200 ease-in-out ${
                        allowNewsAndTips ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span className="text-xs text-slate-500 w-6">
                    {allowNewsAndTips ? 'On' : 'Off'}
                  </span>
                </div>
              </div>
            </div>

            {/* Email column on the right side */}
            <div className="sm:text-right space-y-1">
              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                Your email
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {user.email || 'user@example.com'}
              </p>
              <button
                onClick={() => {
                  setActiveTab('account');
                  setIsEditingEmail(true);
                }}
                className="text-xs text-slate-600 dark:text-slate-400 underline hover:text-slate-900 dark:hover:text-white pt-0.5 inline-block"
              >
                Change email
              </button>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800" />

          {/* SECTION A: Alerts About Your Work */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-slate-100">
              <Info className="w-4 h-4 text-slate-400" />
              <span>Alerts About Your Work</span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 border-t border-b border-slate-100 dark:border-slate-800">
              {/* Row 1: Status Alerts */}
              <div className="py-3">
                <div
                  onClick={() =>
                    setExpandedNotificationRow(
                      expandedNotificationRow === 'statusAlerts' ? null : 'statusAlerts'
                    )
                  }
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Status Alerts
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {notificationPreferences.statusAlerts}
                    </p>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      expandedNotificationRow === 'statusAlerts' ? 'rotate-180' : ''
                    }`}
                  />
                </div>

                {expandedNotificationRow === 'statusAlerts' && (
                  <div className="pt-2 pl-2 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                    {['Email, Site', 'Email only', 'Site only', 'None'].map((opt) => (
                      <label key={opt} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="statusAlerts"
                          checked={notificationPreferences.statusAlerts === opt}
                          onChange={() => toggleNotificationChoice('statusAlerts', opt)}
                          className="text-slate-900"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Row 2: Your Kaggle / Finsight Achievements */}
              <div className="py-3">
                <div
                  onClick={() =>
                    setExpandedNotificationRow(
                      expandedNotificationRow === 'achievements' ? null : 'achievements'
                    )
                  }
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Your Finsight Achievements
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {notificationPreferences.achievements}
                    </p>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      expandedNotificationRow === 'achievements' ? 'rotate-180' : ''
                    }`}
                  />
                </div>

                {expandedNotificationRow === 'achievements' && (
                  <div className="pt-2 pl-2 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                    {['Email, Site', 'Email only', 'Site only', 'None'].map((opt) => (
                      <label key={opt} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="achievements"
                          checked={notificationPreferences.achievements === opt}
                          onChange={() => toggleNotificationChoice('achievements', opt)}
                          className="text-slate-900"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Row 3: Content you follow */}
              <div className="py-3">
                <div
                  onClick={() =>
                    setExpandedNotificationRow(
                      expandedNotificationRow === 'contentFollow' ? null : 'contentFollow'
                    )
                  }
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Content you follow
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {notificationPreferences.contentFollow}
                    </p>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      expandedNotificationRow === 'contentFollow' ? 'rotate-180' : ''
                    }`}
                  />
                </div>

                {expandedNotificationRow === 'contentFollow' && (
                  <div className="pt-2 pl-2 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                    {['Email, Site', 'Email only', 'Site only', 'None'].map((opt) => (
                      <label key={opt} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="contentFollow"
                          checked={notificationPreferences.contentFollow === opt}
                          onChange={() => toggleNotificationChoice('contentFollow', opt)}
                          className="text-slate-900"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SECTION B: Discussions with Finsight users */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-slate-100">
              <Mail className="w-4 h-4 text-slate-400" />
              <span>Discussions with Finsight users</span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 border-t border-b border-slate-100 dark:border-slate-800">
              {/* Row 1: Mentions */}
              <div className="py-3">
                <div
                  onClick={() =>
                    setExpandedNotificationRow(
                      expandedNotificationRow === 'mentions' ? null : 'mentions'
                    )
                  }
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Mentions of you by Finsight users
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {notificationPreferences.mentions}
                    </p>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      expandedNotificationRow === 'mentions' ? 'rotate-180' : ''
                    }`}
                  />
                </div>

                {expandedNotificationRow === 'mentions' && (
                  <div className="pt-2 pl-2 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                    {['Email, Site', 'Email only', 'Site only', 'None'].map((opt) => (
                      <label key={opt} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="mentions"
                          checked={notificationPreferences.mentions === opt}
                          onChange={() => toggleNotificationChoice('mentions', opt)}
                          className="text-slate-900"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Row 2: Direct Messages */}
              <div className="py-3">
                <div
                  onClick={() =>
                    setExpandedNotificationRow(
                      expandedNotificationRow === 'directMessages' ? null : 'directMessages'
                    )
                  }
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Direct Messages from Finsight users
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {notificationPreferences.directMessages}
                    </p>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      expandedNotificationRow === 'directMessages' ? 'rotate-180' : ''
                    }`}
                  />
                </div>

                {expandedNotificationRow === 'directMessages' && (
                  <div className="pt-2 pl-2 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                    {['Email, Site', 'Email only', 'Site only', 'None'].map((opt) => (
                      <label key={opt} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="directMessages"
                          checked={notificationPreferences.directMessages === opt}
                          onChange={() => toggleNotificationChoice('directMessages', opt)}
                          className="text-slate-900"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Row 3: Comments and Topics */}
              <div className="py-3">
                <div
                  onClick={() =>
                    setExpandedNotificationRow(
                      expandedNotificationRow === 'commentsTopics' ? null : 'commentsTopics'
                    )
                  }
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Comments and Topics
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {notificationPreferences.commentsTopics}
                    </p>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      expandedNotificationRow === 'commentsTopics' ? 'rotate-180' : ''
                    }`}
                  />
                </div>

                {expandedNotificationRow === 'commentsTopics' && (
                  <div className="pt-2 pl-2 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                    {['Email, Site', 'Email only', 'Site only', 'None'].map((opt) => (
                      <label key={opt} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="commentsTopics"
                          checked={notificationPreferences.commentsTopics === opt}
                          onChange={() => toggleNotificationChoice('commentsTopics', opt)}
                          className="text-slate-900"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SECTION C: Users */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-slate-100">
              <User className="w-4 h-4 text-slate-400" />
              <span>Users</span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 border-t border-b border-slate-100 dark:border-slate-800">
              {/* Row 1: New Follower */}
              <div className="py-3">
                <div
                  onClick={() =>
                    setExpandedNotificationRow(
                      expandedNotificationRow === 'newFollower' ? null : 'newFollower'
                    )
                  }
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      New Follower
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {notificationPreferences.newFollower}
                    </p>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      expandedNotificationRow === 'newFollower' ? 'rotate-180' : ''
                    }`}
                  />
                </div>

                {expandedNotificationRow === 'newFollower' && (
                  <div className="pt-2 pl-2 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                    {['Email, Site', 'Email only', 'Site only', 'None'].map((opt) => (
                      <label key={opt} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="newFollower"
                          checked={notificationPreferences.newFollower === opt}
                          onChange={() => toggleNotificationChoice('newFollower', opt)}
                          className="text-slate-900"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Row 2: Groups */}
              <div className="py-3">
                <div
                  onClick={() =>
                    setExpandedNotificationRow(
                      expandedNotificationRow === 'groups' ? null : 'groups'
                    )
                  }
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Groups
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {notificationPreferences.groups}
                    </p>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      expandedNotificationRow === 'groups' ? 'rotate-180' : ''
                    }`}
                  />
                </div>

                {expandedNotificationRow === 'groups' && (
                  <div className="pt-2 pl-2 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                    {['Email, Site', 'Email only', 'Site only', 'None'].map((opt) => (
                      <label key={opt} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="groups"
                          checked={notificationPreferences.groups === opt}
                          onChange={() => toggleNotificationChoice('groups', opt)}
                          className="text-slate-900"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

