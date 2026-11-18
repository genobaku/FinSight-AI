import React, { useState } from 'react';
import {
  Edit3,
  Calendar,
  Building2,
  MapPin,
  Database,
  Lock,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  Save,
  Globe,
  Briefcase
} from 'lucide-react';
import { UserProfile } from '../../types';
import { saveSupabaseUserProfile } from '../../lib/supabaseService';

interface ProfileViewProps {
  user: UserProfile;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  onSelectTab: (tab: any) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  onUpdateUser,
  onSelectTab
}) => {
  const [isEditing, setIsEditing] = useState(false);

  // Form states
  const [name, setName] = useState(user.name || '');
  const [username, setUsername] = useState(user.username || 'anugaur');
  const [tagline, setTagline] = useState(user.tagline || '');
  const [pronouns, setPronouns] = useState(user.pronouns || '');
  const [occupation, setOccupation] = useState(user.occupation || '');
  const [companyName, setCompanyName] = useState(user.companyName || '');
  const [city, setCity] = useState(user.city || '');
  const [location, setLocation] = useState(user.location || '');
  const [customSupabaseUrl, setCustomSupabaseUrl] = useState(user.customSupabaseUrl || '');
  const [customSupabaseAnonKey, setCustomSupabaseAnonKey] = useState(user.customSupabaseAnonKey || '');

  // Password change states
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Status alerts
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    // Validate password change if attempted
    if (newPassword || oldPassword || confirmPassword) {
      if (!oldPassword) {
        setStatusMessage({ type: 'error', text: 'Please enter your current old password.' });
        return;
      }
      if (newPassword.length < 6) {
        setStatusMessage({ type: 'error', text: 'New password must be at least 6 characters.' });
        return;
      }
      if (newPassword !== confirmPassword) {
        setStatusMessage({ type: 'error', text: 'New password and confirmation do not match.' });
        return;
      }
    }

    setIsSaving(true);
    const updatedUser: Partial<UserProfile> = {
      name,
      username: username.toLowerCase().replace(/[^a-z0-9_.]/g, ''),
      tagline,
      pronouns,
      occupation,
      companyName,
      city,
      location,
      customSupabaseUrl,
      customSupabaseAnonKey
    };

    onUpdateUser(updatedUser);

    // Persist to central Supabase DB
    const res = await saveSupabaseUserProfile({ ...user, ...updatedUser } as UserProfile);
    setIsSaving(false);

    if (res.success) {
      setStatusMessage({ type: 'success', text: 'Profile information updated and saved to Supabase!' });
      setIsEditing(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setStatusMessage(null), 3000);
    } else {
      setStatusMessage({ type: 'error', text: res.message || 'Failed to sync with Supabase.' });
    }
  };

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto font-sans select-none">
      {/* Top Banner Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold shadow-xs transition-all active:scale-[0.98] ${
            isEditing
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
              : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90'
          }`}
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>{isEditing ? 'View public profile' : 'Edit your public profile'}</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          <button
            onClick={() => onSelectTab('settings')}
            className="hover:text-slate-900 dark:hover:text-white px-3 py-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Settings
          </button>
          <button
            onClick={() => onSelectTab('invoices')}
            className="hover:text-slate-900 dark:hover:text-white px-3 py-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Your Work
          </button>
          <button
            onClick={() => onSelectTab('analytics')}
            className="hover:text-slate-900 dark:hover:text-white px-3 py-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Progression
          </button>
        </div>
      </div>

      {/* Status feedback */}
      {statusMessage && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-medium flex items-center justify-between border ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="font-bold">
            ✕
          </button>
        </div>
      )}

      {/* =========================================================
           MODE 1: VIEW PROFILE ONLY (Image 2)
        ========================================================= */}
      {!isEditing ? (
        <div className="space-y-6">
          {/* Profile Header Banner */}
          <div className="bg-amber-50/60 dark:bg-[#151c28] border border-amber-200/50 dark:border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden flex flex-col sm:flex-row items-center sm:items-start gap-6 shadow-xs">
            {/* Soft decorative background circles */}
            <div className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none opacity-40 dark:opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-400 via-amber-200 to-transparent" />

            {/* Avatar Circle with Goose/User styling */}
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-slate-300/80 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden shadow-xs flex-shrink-0 flex items-center justify-center">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-slate-800 dark:text-white">
                  {user.name.split(' ').map((n) => n[0]).join('')}
                </span>
              )}
            </div>

            {/* Profile Info */}
            <div className="space-y-2 z-10 text-center sm:text-left flex-1 min-w-0">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                @{user.username || 'user'}
              </p>
              <h1 className="text-3xl sm:text-4xl font-normal tracking-tight text-slate-900 dark:text-white">
                {user.name}
              </h1>

              {user.pronouns && (
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {user.pronouns}
                </span>
              )}

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Joined 2026 · Active now</span>
                </div>
                {user.city && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{user.city}{user.location ? `, ${user.location}` : ''}</span>
                  </div>
                )}
                {user.companyName && (
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{user.companyName}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bio & Details Section */}
          <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="text-sm font-semibold text-slate-900 dark:text-white border-b-2 border-slate-900 dark:border-white pb-3 -mb-3">
                About
              </span>
              <div className="flex items-center gap-2">
                <button className="px-4 py-1.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-300 transition-colors">
                  Follow
                </button>
                <button className="px-4 py-1.5 rounded-full border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  Contact
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">Bio</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
                {user.tagline || 'Quietly working away. Building next-generation document extraction and financial analytics.'}
              </p>
            </div>

            {/* Quick Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80">
                <p className="text-slate-400 font-medium">Occupation</p>
                <p className="font-semibold text-slate-900 dark:text-white mt-1">
                  {user.occupation || 'Software Engineer'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80">
                <p className="text-slate-400 font-medium">Organization</p>
                <p className="font-semibold text-slate-900 dark:text-white mt-1">
                  {user.companyName || 'Self-Employed'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80">
                <p className="text-slate-400 font-medium">Database Mode</p>
                <p className="font-semibold text-slate-900 dark:text-white mt-1">
                  {user.customSupabaseUrl ? 'Personal Supabase Connected' : 'Central Finsight DB'}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* =========================================================
           MODE 2: EDIT PROFILE FORM (Image 3)
        ========================================================= */
        <form onSubmit={handleSave} className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
            {/* Avatar with "Edit photo" overlay */}
            <div className="relative w-28 h-28 rounded-full border-4 border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center flex-shrink-0 group">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-slate-800 dark:text-white">
                  {name.split(' ').map((n) => n[0]).join('')}
                </span>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                <span className="text-white text-xs font-semibold px-2 py-1 rounded-full border border-white/40">
                  Edit photo
                </span>
              </div>
            </div>

            <div className="space-y-1 text-center sm:text-left flex-1 min-w-0">
              <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">@{username || 'username'}</span>
              <h2 className="text-2xl font-normal text-slate-900 dark:text-white">Edit public profile details</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Update your display name, unique username, credentials, and personal storage settings.
              </p>
            </div>
          </div>

          <div className="space-y-5">
            {/* 1. Display Name */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Your display name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>

            {/* 2. Unique Username (Instagram-style) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Unique Username (@handle)
                </label>
                <span className="text-[11px] text-slate-400">Unique for every user</span>
              </div>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-xs font-bold text-slate-400">@</span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ''))}
                  placeholder="username"
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 font-mono"
                />
              </div>
            </div>

            {/* 3. Tagline / Bio */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Tagline
                </label>
                <span className="text-[11px] text-slate-400">{tagline.length} / 80</span>
              </div>
              <input
                type="text"
                maxLength={80}
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Add a brief tagline - you, in a sentence"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>

            {/* 4. Pronouns */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Pronouns (Pronunciation)
              </label>
              <input
                type="text"
                value={pronouns}
                onChange={(e) => setPronouns(e.target.value)}
                placeholder="e.g. they/them, she/her, he/him"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>

            {/* 5. Occupation & Organization / Company */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Occupation
                </label>
                <input
                  type="text"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  placeholder="Your main occupation..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Organization / Company
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Organization"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>
            </div>

            {/* 6. City & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. San Francisco, London, Mumbai"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  State / Country Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. California, US"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>
            </div>

            {/* 7. Change Password Section */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-slate-500" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Change Password
                </h3>
              </div>
              <p className="text-xs text-slate-400">Leave blank if you do not want to change your password.</p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="relative">
                  <label className="text-[11px] font-semibold text-slate-500 block mb-1">Old Password</label>
                  <input
                    type={showOldPassword ? 'text' : 'password'}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white pr-9 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-3 top-7 text-slate-400"
                  >
                    {showOldPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="relative">
                  <label className="text-[11px] font-semibold text-slate-500 block mb-1">New Password</label>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white pr-9 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-7 text-slate-400"
                  >
                    {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type new password"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 8. Personal Database Connectivity (Supabase URL & Anon Key) */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-slate-500" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Personal Database Connectivity (Supabase)
                </h3>
              </div>
              <p className="text-xs text-slate-400">
                Optional: If you wish to store your personal accounting logs into your own private Supabase instance, provide your credentials below. All changes will also be synced to our secure server database.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-1">Personal Supabase URL</label>
                  <input
                    type="url"
                    value={customSupabaseUrl}
                    onChange={(e) => setCustomSupabaseUrl(e.target.value)}
                    placeholder="https://xyzcompany.supabase.co"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-1">Personal Supabase Anon Key</label>
                  <input
                    type="password"
                    value={customSupabaseAnonKey}
                    onChange={(e) => setCustomSupabaseAnonKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 rounded-full text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold shadow-xs hover:opacity-90 transition-all flex items-center gap-2 active:scale-98"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save changes'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
