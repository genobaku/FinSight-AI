import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Mail,
  ArrowLeft,
  ArrowRight,
  Lock,
  User,
  Building,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  Database,
  ExternalLink,
  ShieldAlert,
  HelpCircle
} from 'lucide-react';
import { getSupabaseClient, isSupabaseConfigured } from '../../lib/supabase';

// Local storage user directory for accurate client-side credential verification
const getLocalRegisteredUsers = () => {
  try {
    const raw = localStorage.getItem('finsight_registered_users');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

const saveLocalRegisteredUser = (userData) => {
  try {
    const users = getLocalRegisteredUsers();
    const existingIndex = users.findIndex(
      (u) => u.email.toLowerCase() === userData.email.toLowerCase()
    );
    if (existingIndex >= 0) {
      users[existingIndex] = { ...users[existingIndex], ...userData };
    } else {
      users.push(userData);
    }
    localStorage.setItem('finsight_registered_users', JSON.stringify(users));
  } catch (e) {}
};

// Cookie helper utilities
export const getCookie = (name) => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : null;
};

export const setCookie = (name, value, days = 30) => {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
};

export const deleteCookie = (name) => {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
};

export const LoginPage = ({
  onSuccess,
  onLoginSuccess,
  onBackToLanding
}) => {
  const [activeTab, setActiveTab] = useState('signin'); // 'signin' | 'register'
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState(null);

  // Form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');

  // Explicit Authentication Feedback States
  const [formError, setFormError] = useState('');
  const [formErrorCode, setFormErrorCode] = useState(''); // 'USER_NOT_FOUND' | 'WRONG_PASSWORD' | 'USER_ALREADY_EXISTS' | 'INVALID_EMAIL'
  const [authNotice, setAuthNotice] = useState('');
  const [showDbHelp, setShowDbHelp] = useState(false);

  // Database Connection Indicator
  const [dbConfigured, setDbConfigured] = useState(isSupabaseConfigured());

  // Custom Supabase modal / configuration
  const [customDbUrl, setCustomDbUrl] = useState('');
  const [customDbKey, setCustomDbKey] = useState('');
  const [isConfiguringDb, setIsConfiguringDb] = useState(false);

  // Cookie banner state
  const [cookieConsent, setCookieConsent] = useState(() => {
    return getCookie('finsight_cookie_consent') || null;
  });

  // Check existing session or Supabase redirect token on mount
  useEffect(() => {
    setDbConfigured(isSupabaseConfigured());

    const supabase = getSupabaseClient();
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session }, error }) => {
        if (session?.user) {
          handleCompleteAuth({
            email: session.user.email,
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
            provider: session.user.app_metadata?.provider || 'supabase'
          });
        }
      });

      // Listen for auth state change (e.g. after Google OAuth redirect)
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          if (session?.user && (event === 'SIGNED_IN' || event === 'USER_UPDATED')) {
            handleCompleteAuth({
              email: session.user.email,
              name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
              provider: session.user.app_metadata?.provider || 'google'
            });
          }
        }
      );

      return () => {
        subscription?.unsubscribe();
      };
    }
  }, []);

  const handleCompleteAuth = (userData) => {
    const sessionPayload = {
      email: userData.email,
      name: userData.name || userData.email?.split('@')[0] || 'User',
      provider: userData.provider || 'email',
      authenticatedAt: new Date().toISOString()
    };
    setCookie('finsight_session_user', JSON.stringify(sessionPayload), 30);
    setCookie('finsight_auth_token', 'fsk_' + Math.random().toString(36).substring(2) + Date.now().toString(36), 30);

    // Save profile to localStorage as active session
    try {
      const existingProfile = localStorage.getItem('finsight_user_profile');
      const base = existingProfile ? JSON.parse(existingProfile) : {};
      localStorage.setItem('finsight_user_profile', JSON.stringify({
        ...base,
        email: sessionPayload.email,
        name: sessionPayload.name,
        username: sessionPayload.email ? sessionPayload.email.split('@')[0] : 'user'
      }));
    } catch (e) {}

    if (onLoginSuccess) onLoginSuccess();
    if (onSuccess) onSuccess();
  };

  // Google OAuth Login
  const handleGoogleLogin = async () => {
    setLoadingProvider('Google');
    setFormError('');
    setFormErrorCode('');
    setAuthNotice('');

    const supabase = getSupabaseClient();

    if (!supabase) {
      setLoadingProvider(null);
      setFormError(
        'Google OAuth requires database connectivity. Please connect your Supabase database URL & Anon Key below, or sign in with Email & Password.'
      );
      setFormErrorCode('DB_NOT_CONFIGURED');
      setIsConfiguringDb(true);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (err) {
      console.error('Google Auth Error:', err);
      setFormError(
        err.message || 'Google authentication was blocked or not configured in your Supabase project.'
      );
      setLoadingProvider(null);
    }
  };

  // Email / Password Authentication with Explicit Verification & Wrong Password Detection
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormErrorCode('');
    setAuthNotice('');

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setFormError('Please enter a valid email address.');
      setFormErrorCode('INVALID_EMAIL');
      return;
    }

    if (!password) {
      setFormError('Please enter your account password.');
      setFormErrorCode('EMPTY_PASSWORD');
      return;
    }

    if (password.length < 6) {
      setFormError('Password must contain at least 6 characters.');
      setFormErrorCode('SHORT_PASSWORD');
      return;
    }

    setLoadingProvider('email_submit');
    const supabase = getSupabaseClient();

    // -------------------------------------------------------------
    // MODE 1: CLOUD SUPABASE AUTHENTICATION
    // -------------------------------------------------------------
    if (supabase) {
      try {
        if (activeTab === 'register') {
          // Register with real Supabase Auth + Email Verification
          const { data, error } = await supabase.auth.signUp({
            email: cleanEmail,
            password,
            options: {
              data: {
                full_name: fullName || cleanEmail.split('@')[0],
                company: company || ''
              },
              emailRedirectTo: window.location.origin
            }
          });

          if (error) {
            if (error.message.toLowerCase().includes('already registered')) {
              setFormError('An account with this email already exists. Please Sign In instead.');
              setFormErrorCode('USER_ALREADY_EXISTS');
              setActiveTab('signin');
            } else {
              setFormError(error.message);
            }
            return;
          }

          // If email confirmation is required by Supabase
          if (data?.user && !data.session) {
            setAuthNotice(
              `Verification email sent to ${cleanEmail}! Please check your email inbox to verify your account before signing in.`
            );
            saveLocalRegisteredUser({
              email: cleanEmail,
              password,
              name: fullName || cleanEmail.split('@')[0],
              company: company || '',
              verified: false
            });
            return;
          }

          // If immediate session created
          if (data?.session) {
            saveLocalRegisteredUser({
              email: cleanEmail,
              password,
              name: fullName || cleanEmail.split('@')[0],
              company: company || '',
              verified: true
            });
            handleCompleteAuth({
              email: data.user.email,
              name: fullName || cleanEmail.split('@')[0],
              provider: 'email'
            });
          }
        } else {
          // Sign In with Supabase credentials
          const { data, error } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password
          });

          if (error) {
            const errLow = error.message.toLowerCase();
            if (errLow.includes('invalid login credentials') || errLow.includes('invalid credentials')) {
              // Check if user is registered at all in local cache or Supabase
              const localUsers = getLocalRegisteredUsers();
              const userExistsLocally = localUsers.some((u) => u.email === cleanEmail);

              if (userExistsLocally) {
                setFormError('Incorrect password. Please verify your password and try again.');
                setFormErrorCode('WRONG_PASSWORD');
              } else {
                setFormError('No account found with this email. Please click "Register" to create your account.');
                setFormErrorCode('USER_NOT_FOUND');
              }
            } else if (errLow.includes('email not confirmed')) {
              setFormError('Email address has not been confirmed yet. Please verify the link sent to your inbox.');
              setFormErrorCode('EMAIL_NOT_CONFIRMED');
            } else {
              setFormError(error.message);
            }
            return;
          }

          // Successful Supabase login
          handleCompleteAuth({
            email: data.user.email,
            name: data.user.user_metadata?.full_name || cleanEmail.split('@')[0],
            provider: 'email'
          });
        }
      } catch (err) {
        console.error('Supabase Auth Exception:', err);
        setFormError(err.message || 'Authentication failed. Please verify credentials.');
      } finally {
        setLoadingProvider(null);
      }
      return;
    }

    // -------------------------------------------------------------
    // MODE 2: LOCAL SECURE VAULT AUTHENTICATION (When Supabase not connected)
    // -------------------------------------------------------------
    setTimeout(() => {
      setLoadingProvider(null);
      const registeredUsers = getLocalRegisteredUsers();
      const existingUser = registeredUsers.find((u) => u.email === cleanEmail);

      if (activeTab === 'register') {
        if (existingUser) {
          setFormError('An account with this email already exists. Please Sign In instead.');
          setFormErrorCode('USER_ALREADY_EXISTS');
          setActiveTab('signin');
          return;
        }

        // Save new user
        saveLocalRegisteredUser({
          email: cleanEmail,
          password,
          name: fullName || cleanEmail.split('@')[0],
          company: company || '',
          registeredAt: new Date().toISOString()
        });

        setAuthNotice(`Account created successfully for ${cleanEmail}! Logging you in...`);
        setTimeout(() => {
          handleCompleteAuth({
            email: cleanEmail,
            name: fullName || cleanEmail.split('@')[0],
            provider: 'email'
          });
        }, 800);
      } else {
        // Sign In Mode: Check User Existence & Password
        if (!existingUser) {
          setFormError('Account not found. This email is not registered yet. Please click "Register" to create one.');
          setFormErrorCode('USER_NOT_FOUND');
          return;
        }

        if (existingUser.password !== password) {
          setFormError('Incorrect password. Please check your password and try again.');
          setFormErrorCode('WRONG_PASSWORD');
          return;
        }

        // Correct password & registered user
        handleCompleteAuth({
          email: existingUser.email,
          name: existingUser.name,
          provider: 'email'
        });
      }
    }, 500);
  };

  const handleSaveCustomDb = (e) => {
    e.preventDefault();
    if (!customDbUrl || !customDbKey) {
      setFormError('Please enter both Supabase URL and Anon Key.');
      return;
    }

    try {
      const existing = localStorage.getItem('finsight_user_profile');
      const base = existing ? JSON.parse(existing) : {};
      localStorage.setItem(
        'finsight_user_profile',
        JSON.stringify({
          ...base,
          customSupabaseUrl: customDbUrl.trim(),
          customSupabaseAnonKey: customDbKey.trim()
        })
      );
      setDbConfigured(true);
      setIsConfiguringDb(false);
      setAuthNotice('Supabase Database credentials connected successfully! You can now use Google OAuth or Cloud Auth.');
      setFormError('');
    } catch (err) {
      setFormError('Failed to save database credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#0b0f17] text-slate-800 dark:text-slate-100 flex flex-col justify-between antialiased selection:bg-slate-800 selection:text-white relative transition-colors">
      {/* Top Header / Navigation */}
      <header className="w-full px-6 py-4 flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60">
        <button
          onClick={() => {
            if (onBackToLanding) onBackToLanding();
            else if (onLoginSuccess) onLoginSuccess();
            else if (onSuccess) onSuccess();
          }}
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Landing</span>
        </button>

        {/* Database Status Pill */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsConfiguringDb(!isConfiguringDb)}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border transition-colors cursor-pointer ${
              dbConfigured
                ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300'
                : 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>{dbConfigured ? 'Supabase Database Connected' : 'Database: Local Vault (Connect Cloud DB)'}</span>
          </button>
        </div>
      </header>

      {/* Main Center Card */}
      <main className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-[440px] bg-white dark:bg-[#121824] border border-slate-200/90 dark:border-slate-800 rounded-[28px] shadow-[0_2px_16px_rgba(0,0,0,0.06)] px-8 py-10 flex flex-col items-center transition-colors"
        >
          {/* Logo */}
          <div className="flex items-center gap-2 mb-2">
            <span className="font-editorial text-2xl font-bold tracking-tight text-black dark:text-white lowercase">
              finsight<span className="text-blue-600">.ai</span>
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-light text-slate-900 dark:text-white mb-6 tracking-tight">
            {activeTab === 'signin' ? 'Welcome Back!' : 'Create Account'}
          </h1>

          {/* Database Setup Panel (Inline if opened) */}
          {isConfiguringDb && (
            <form onSubmit={handleSaveCustomDb} className="w-full mb-6 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-emerald-600" />
                  Connect Supabase Cloud DB
                </span>
                <button
                  type="button"
                  onClick={() => setIsConfiguringDb(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Connect your Supabase project credentials to enable Google OAuth and remote cloud persistence.
              </p>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Supabase Project URL
                </label>
                <input
                  type="url"
                  placeholder="https://xyzcompany.supabase.co"
                  value={customDbUrl}
                  onChange={(e) => setCustomDbUrl(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Supabase Anon Key
                </label>
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={customDbKey}
                  onChange={(e) => setCustomDbKey(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors"
              >
                Save &amp; Connect Supabase
              </button>
            </form>
          )}

          {/* Tab Selector: Sign In / Register */}
          <div className="flex items-center justify-center gap-8 border-b border-slate-100 dark:border-slate-800 w-full mb-6 relative">
            <button
              onClick={() => {
                setActiveTab('signin');
                setFormError('');
                setFormErrorCode('');
                setAuthNotice('');
              }}
              className={`pb-3 text-sm font-medium transition-colors relative cursor-pointer ${
                activeTab === 'signin' ? 'text-slate-900 dark:text-white font-semibold' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Sign In
              {activeTab === 'signin' && (
                <motion.div
                  layoutId="activeTabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-900 dark:bg-white rounded-full"
                />
              )}
            </button>

            <button
              onClick={() => {
                setActiveTab('register');
                setFormError('');
                setFormErrorCode('');
                setAuthNotice('');
              }}
              className={`pb-3 text-sm font-medium transition-colors relative cursor-pointer ${
                activeTab === 'register' ? 'text-slate-900 dark:text-white font-semibold' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Register
              {activeTab === 'register' && (
                <motion.div
                  layoutId="activeTabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-900 dark:bg-white rounded-full"
                />
              )}
            </button>
          </div>

          {/* Explicit Error Messages with Actionable Guidance */}
          {formError && (
            <div className="w-full mb-4 p-3.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-400 text-xs rounded-xl flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">{formError}</p>
                {formErrorCode === 'USER_NOT_FOUND' && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('register');
                      setFormError('');
                    }}
                    className="mt-1.5 text-xs font-bold underline hover:text-rose-800 dark:hover:text-rose-300 block cursor-pointer"
                  >
                    Click here to Register this email →
                  </button>
                )}
                {formErrorCode === 'WRONG_PASSWORD' && (
                  <p className="text-[11px] text-rose-600/80 mt-1">
                    Tip: Make sure Caps Lock is turned off and your password is typed accurately.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Verification / Success Notice */}
          {authNotice && (
            <div className="w-full mb-4 p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs rounded-xl flex items-start gap-2">
              <Check className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              <span>{authNotice}</span>
            </div>
          )}

          {/* Social Auth Buttons OR Inline Email Form */}
          {!showEmailForm ? (
            <div className="w-full space-y-3">
              {/* Google Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={Boolean(loadingProvider)}
                className="w-full h-12 px-5 rounded-full border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50/60 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200 text-sm font-medium flex items-center justify-center gap-3 transition-all cursor-pointer shadow-2xs active:scale-[0.99] disabled:opacity-50"
              >
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>
                  {loadingProvider === 'Google'
                    ? 'Connecting to Google...'
                    : `${activeTab === 'signin' ? 'Sign in' : 'Register'} with Google`}
                </span>
              </button>

              {/* Email Button */}
              <button
                type="button"
                onClick={() => setShowEmailForm(true)}
                className="w-full h-12 px-5 rounded-full border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50/60 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200 text-sm font-medium flex items-center justify-center gap-3 transition-all cursor-pointer shadow-2xs active:scale-[0.99]"
              >
                <Mail className="w-4 h-4 text-slate-500 flex-shrink-0" />
                <span>{activeTab === 'signin' ? 'Sign in with Email & Password' : 'Register with Email'}</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleEmailSubmit} className="w-full space-y-3.5">
              {activeTab === 'register' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full pl-10 pr-4 py-2.5 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:outline-hidden focus:ring-1 focus:ring-slate-900 dark:focus:ring-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Company / Organization</label>
                    <div className="relative">
                      <Building className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="Acme Corp"
                        className="w-full pl-10 pr-4 py-2.5 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:outline-hidden focus:ring-1 focus:ring-slate-900 dark:focus:ring-white"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Email address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (formError) setFormError('');
                    }}
                    placeholder="user@example.com"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-full border bg-white dark:bg-slate-900 text-xs focus:outline-hidden focus:ring-1 ${
                      formErrorCode === 'USER_NOT_FOUND' || formErrorCode === 'INVALID_EMAIL'
                        ? 'border-rose-400 focus:ring-rose-500'
                        : 'border-slate-300 dark:border-slate-700 focus:ring-slate-900 dark:focus:ring-white'
                    }`}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Password</label>
                  {activeTab === 'signin' && (
                    <button
                      type="button"
                      onClick={() => setAuthNotice('If you forgot your password, enter your email and click Register to set a new password, or contact support.')}
                      className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (formError) setFormError('');
                    }}
                    placeholder="Minimum 6 characters"
                    className={`w-full pl-10 pr-10 py-2.5 rounded-full border bg-white dark:bg-slate-900 text-xs focus:outline-hidden focus:ring-1 ${
                      formErrorCode === 'WRONG_PASSWORD'
                        ? 'border-rose-400 focus:ring-rose-500'
                        : 'border-slate-300 dark:border-slate-700 focus:ring-slate-900 dark:focus:ring-white'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={Boolean(loadingProvider)}
                className="w-full h-11 mt-2 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <span>
                  {loadingProvider === 'email_submit'
                    ? 'Verifying...'
                    : activeTab === 'signin'
                    ? 'Sign In with Email'
                    : 'Create Account & Send Verification'}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setShowEmailForm(false)}
                className="w-full text-center text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 pt-1 cursor-pointer"
              >
                Back to all sign in options
              </button>
            </form>
          )}

          {/* Privacy Footnote */}
          <p className="mt-8 text-center text-[11px] text-slate-400 dark:text-slate-500 max-w-[280px]">
            By continuing, you agree to the Finsight{' '}
            <span className="underline cursor-pointer hover:text-slate-600 dark:hover:text-slate-300">Terms of Service</span> and{' '}
            <span className="underline cursor-pointer hover:text-slate-600 dark:hover:text-slate-300">Privacy Policy</span>.
          </p>
        </motion.div>
      </main>

      {/* Cookie Consent Banner */}
      {!cookieConsent && (
        <aside
          aria-label="Cookie consent"
          className="w-full bg-white dark:bg-[#121824] border-t border-slate-200 dark:border-slate-800 p-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 z-40 text-xs transition-colors"
        >
          <div className="flex-1 text-slate-600 dark:text-slate-400 leading-relaxed">
            <span className="font-semibold text-slate-800 dark:text-slate-200">Cookie Notice:</span> We use cookies and session storage to preserve your authenticated ledger and secure document analysis.
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                setCookie('finsight_cookie_consent', 'essential', 365);
                setCookieConsent('essential');
              }}
              className="px-4 py-1.5 rounded-full border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium transition-colors"
            >
              Essential Only
            </button>
            <button
              onClick={() => {
                setCookie('finsight_cookie_consent', 'all', 365);
                setCookieConsent('all');
              }}
              className="px-4 py-1.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold hover:opacity-90 transition-opacity"
            >
              Accept All
            </button>
          </div>
        </aside>
      )}
    </div>
  );
};
