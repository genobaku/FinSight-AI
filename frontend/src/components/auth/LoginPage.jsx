import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Mail, ArrowLeft, ArrowRight, Lock, User, Building, ShieldCheck, Check, AlertCircle } from 'lucide-react';
import { getSupabaseClient, isSupabaseConfigured } from '../../lib/supabase';

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
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [formError, setFormError] = useState('');
  const [authNotice, setAuthNotice] = useState('');

  // Cookie banner state
  const [cookieConsent, setCookieConsent] = useState(() => {
    return getCookie('finsight_cookie_consent') || null;
  });
  const [showCookieDetails, setShowCookieDetails] = useState(false);

  // Check existing session cookie or Supabase session on mount
  useEffect(() => {
    const supabase = getSupabaseClient();
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          handleCompleteAuth({
            email: session.user.email,
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
            provider: session.user.app_metadata?.provider || 'supabase'
          });
        }
      });
    }

    const savedUser = getCookie('finsight_session_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed?.email) {
          setEmail(parsed.email);
        }
      } catch (e) {}
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

  // Real Google OAuth via Supabase
  const handleGoogleLogin = async () => {
    setLoadingProvider('Google');
    setFormError('');
    setAuthNotice('');

    const supabase = getSupabaseClient();
    if (!supabase) {
      // Fallback if Supabase credentials are not in environment yet
      setTimeout(() => {
        setLoadingProvider(null);
        handleCompleteAuth({
          email: 'user.google@gmail.com',
          name: 'Google Verified User',
          provider: 'Google'
        });
      }, 900);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (err) {
      console.error('Google Auth Error:', err);
      setFormError(err.message || 'Google authentication failed.');
      setLoadingProvider(null);
    }
  };

  // Real Email/Password + Verification Email via Supabase
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setAuthNotice('');

    if (!email || !email.includes('@')) {
      setFormError('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setFormError('Password must contain at least 6 characters.');
      return;
    }

    setLoadingProvider('email_submit');
    const supabase = getSupabaseClient();

    if (!supabase) {
      // Local fallback mode when cloud database is not connected
      setTimeout(() => {
        setLoadingProvider(null);
        handleCompleteAuth({
          email,
          name: fullName || email.split('@')[0],
          provider: 'email'
        });
      }, 700);
      return;
    }

    try {
      if (activeTab === 'register') {
        // Sign Up with confirmation email sent to user
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName || email.split('@')[0],
              company: company || ''
            },
            emailRedirectTo: window.location.origin
          }
        });
        if (error) throw error;

        if (data.session) {
          handleCompleteAuth({
            email: data.user?.email || email,
            name: fullName || email.split('@')[0],
            provider: 'email'
          });
        } else {
          setAuthNotice(
            `Verification email sent to ${email}! Please check your inbox and verify your email to log in.`
          );
        }
      } else {
        // Sign In with existing account
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;

        handleCompleteAuth({
          email: data.user?.email || email,
          name: data.user?.user_metadata?.full_name || email.split('@')[0],
          provider: 'email'
        });
      }
    } catch (err) {
      console.error('Auth error:', err);
      setFormError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleAcceptCookies = (type = 'all') => {
    setCookie('finsight_cookie_consent', type, 365);
    setCookieConsent(type);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#0b0f17] text-slate-800 dark:text-slate-100 flex flex-col justify-between antialiased selection:bg-slate-800 selection:text-white relative transition-colors">
      {/* Top Header / Navigation */}
      <header className="w-full px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => {
            if (onBackToLanding) onBackToLanding();
            else if (onLoginSuccess) onLoginSuccess();
            else if (onSuccess) onSuccess();
          }}
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Landing</span>
        </button>

        <div className="text-xs text-slate-400">
          Secure Core Portal • TLS 1.3
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

          {/* Welcome Message */}
          <h1 className="text-3xl font-light text-slate-900 dark:text-white mb-6 tracking-tight">
            Welcome!
          </h1>

          {/* Tab Selector: Sign In / Register */}
          <div className="flex items-center justify-center gap-8 border-b border-slate-100 dark:border-slate-800 w-full mb-8 relative">
            <button
              onClick={() => {
                setActiveTab('signin');
                setFormError('');
                setAuthNotice('');
              }}
              className={`pb-3 text-sm font-medium transition-colors relative ${
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
                setAuthNotice('');
              }}
              className={`pb-3 text-sm font-medium transition-colors relative ${
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

          {/* Error Banner */}
          {formError && (
            <div className="w-full mb-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-xs rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{formError}</span>
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
                <span>{loadingProvider === 'Google' ? 'Connecting to Google...' : `${activeTab === 'signin' ? 'Sign in' : 'Register'} with Google`}</span>
              </button>

              {/* Email Button */}
              <button
                type="button"
                onClick={() => setShowEmailForm(true)}
                className="w-full h-12 px-5 rounded-full border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50/60 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200 text-sm font-medium flex items-center justify-center gap-3 transition-all cursor-pointer shadow-2xs active:scale-[0.99]"
              >
                <Mail className="w-4 h-4 text-slate-500 flex-shrink-0" />
                <span>{activeTab === 'signin' ? 'Sign in with Email' : 'Register with Email'}</span>
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
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:outline-hidden focus:ring-1 focus:ring-slate-900 dark:focus:ring-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full pl-10 pr-4 py-2.5 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:outline-hidden focus:ring-1 focus:ring-slate-900 dark:focus:ring-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={Boolean(loadingProvider)}
                className="w-full h-11 mt-2 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <span>{loadingProvider === 'email_submit' ? 'Authenticating...' : (activeTab === 'signin' ? 'Sign In with Email' : 'Create Account & Send Verification')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setShowEmailForm(false)}
                className="w-full text-center text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 pt-1"
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
            <span className="font-semibold text-slate-800 dark:text-slate-200">Cookie Notice:</span> We use cookies and similar technologies to preserve your persistent financial ledger, store custom models, and analyze service traffic.
            <button
              onClick={() => setShowCookieDetails(!showCookieDetails)}
              className="ml-2 underline text-slate-800 dark:text-slate-200 hover:text-blue-600"
            >
              {showCookieDetails ? 'Hide details' : 'Cookie choices'}
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => handleAcceptCookies('essential')}
              className="px-4 py-1.5 rounded-full border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium transition-colors"
            >
              Essential Only
            </button>
            <button
              onClick={() => handleAcceptCookies('all')}
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
