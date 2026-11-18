import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, ArrowLeft, ArrowRight, Lock, User, Building, ShieldCheck, Check } from 'lucide-react';

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

  // Cookie banner state
  const [cookieConsent, setCookieConsent] = useState(() => {
    return getCookie('finsight_cookie_consent') || null;
  });
  const [showCookieDetails, setShowCookieDetails] = useState(false);

  // Check existing session cookie on mount
  useEffect(() => {
    const savedUser = getCookie('finsight_session_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed?.email) {
          setEmail(parsed.email);
        }
      } catch (e) {
        // ignore parse error
      }
    }
  }, []);

  const handleCompleteAuth = (userData) => {
    // Persist authenticated user session in cookies
    const sessionPayload = {
      email: userData.email,
      name: userData.name || userData.email.split('@')[0],
      provider: userData.provider || 'email',
      authenticatedAt: new Date().toISOString()
    };
    setCookie('finsight_session_user', JSON.stringify(sessionPayload), 30);
    setCookie('finsight_auth_token', 'fsk_' + Math.random().toString(36).substring(2) + Date.now().toString(36), 30);

    if (onLoginSuccess) onLoginSuccess();
    if (onSuccess) onSuccess();
  };

  const handleOAuthLogin = (providerName) => {
    setLoadingProvider(providerName);
    setFormError('');
    setTimeout(() => {
      setLoadingProvider(null);
      handleCompleteAuth({
        email: `user.${providerName.toLowerCase()}@finsight.ai`,
        name: `${providerName} Verified User`,
        provider: providerName
      });
    }, 800);
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!email || !email.includes('@')) {
      setFormError('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setFormError('Password must contain at least 6 characters.');
      return;
    }

    setLoadingProvider('email_submit');
    setTimeout(() => {
      setLoadingProvider(null);
      handleCompleteAuth({
        email,
        name: fullName || email.split('@')[0],
        provider: 'email'
      });
    }, 700);
  };

  const handleAcceptCookies = (type = 'all') => {
    setCookie('finsight_cookie_consent', type, 365);
    setCookieConsent(type);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-slate-800 flex flex-col justify-between antialiased selection:bg-slate-800 selection:text-white relative">
      {/* Top Header / Navigation */}
      <header className="w-full px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => {
            if (onBackToLanding) onBackToLanding();
            else if (onLoginSuccess) onLoginSuccess();
            else if (onSuccess) onSuccess();
          }}
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Landing</span>
        </button>

        <div className="text-xs text-slate-400">
          Secure Core Portal • TLS 1.3
        </div>
      </header>

      {/* Main Center Card (Kaggle Inspired Clean Aesthetic) */}
      <main className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-[440px] bg-white border border-slate-200/90 rounded-[28px] shadow-[0_2px_16px_rgba(0,0,0,0.06)] px-8 py-10 flex flex-col items-center"
        >
          {/* Logo */}
          <div className="flex items-center gap-2 mb-2">
            <span className="font-editorial text-2xl font-bold tracking-tight text-black lowercase">
              finsight<span className="text-blue-600">.ai</span>
            </span>
          </div>

          {/* Welcome Message */}
          <h1 className="text-3xl font-light text-slate-900 mb-6 tracking-tight">
            Welcome!
          </h1>

          {/* Tab Selector: Sign In / Register */}
          <div className="flex items-center justify-center gap-8 border-b border-slate-100 w-full mb-8 relative">
            <button
              onClick={() => {
                setActiveTab('signin');
                setFormError('');
              }}
              className={`pb-3 text-sm font-medium transition-colors relative ${
                activeTab === 'signin' ? 'text-slate-900 font-semibold' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Sign In
              {activeTab === 'signin' && (
                <motion.div
                  layoutId="activeTabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-900 rounded-full"
                />
              )}
            </button>

            <button
              onClick={() => {
                setActiveTab('register');
                setFormError('');
              }}
              className={`pb-3 text-sm font-medium transition-colors relative ${
                activeTab === 'register' ? 'text-slate-900 font-semibold' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Register
              {activeTab === 'register' && (
                <motion.div
                  layoutId="activeTabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-900 rounded-full"
                />
              )}
            </button>
          </div>

          {/* Error Banner */}
          {formError && (
            <div className="w-full mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
              {formError}
            </div>
          )}

          {/* Social Auth Buttons OR Inline Email Form */}
          {!showEmailForm ? (
            <div className="w-full space-y-3">
              {/* Google Button */}
              <button
                type="button"
                onClick={() => handleOAuthLogin('Google')}
                disabled={Boolean(loadingProvider)}
                className="w-full h-12 px-5 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 text-slate-700 text-sm font-medium flex items-center justify-center gap-3 transition-all cursor-pointer shadow-2xs active:scale-[0.99] disabled:opacity-50"
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
                className="w-full h-12 px-5 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 text-slate-700 text-sm font-medium flex items-center justify-center gap-3 transition-all cursor-pointer shadow-2xs active:scale-[0.99]"
              >
                <Mail className="w-4 h-4 text-slate-500 flex-shrink-0" />
                <span>{activeTab === 'signin' ? 'Sign in with Email' : 'Register with Email'}</span>
              </button>

              {/* Facebook Button */}
              <button
                type="button"
                onClick={() => handleOAuthLogin('Facebook')}
                disabled={Boolean(loadingProvider)}
                className="w-full h-12 px-5 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 text-slate-700 text-sm font-medium flex items-center justify-center gap-3 transition-all cursor-pointer shadow-2xs active:scale-[0.99] disabled:opacity-50"
              >
                <svg className="w-4 h-4 text-[#1877F2] fill-current flex-shrink-0" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span>{loadingProvider === 'Facebook' ? 'Connecting to Facebook...' : `${activeTab === 'signin' ? 'Sign in' : 'Register'} with Facebook`}</span>
              </button>

              {/* Yahoo / Enterprise SSO Button */}
              <button
                type="button"
                onClick={() => handleOAuthLogin('Yahoo')}
                disabled={Boolean(loadingProvider)}
                className="w-full h-12 px-5 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 text-slate-700 text-sm font-medium flex items-center justify-center gap-3 transition-all cursor-pointer shadow-2xs active:scale-[0.99] disabled:opacity-50"
              >
                <span className="font-bold text-sm text-[#6001d2] flex-shrink-0">y!</span>
                <span>{loadingProvider === 'Yahoo' ? 'Connecting to Yahoo...' : `${activeTab === 'signin' ? 'Sign in' : 'Register'} with Yahoo`}</span>
              </button>
            </div>
          ) : (
            /* Inline Email Input Form */
            <form onSubmit={handleEmailSubmit} className="w-full space-y-4">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {activeTab === 'signin' ? 'Email Credentials' : 'New Account Registration'}
                </span>
                <button
                  type="button"
                  onClick={() => setShowEmailForm(false)}
                  className="text-xs text-blue-600 hover:underline"
                >
                  All sign-in options
                </button>
              </div>

              {activeTab === 'register' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Alex Morgan"
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Company / Organization</label>
                    <div className="relative">
                      <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="Aetheria Systems"
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-slate-800"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Email address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-slate-800"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={Boolean(loadingProvider)}
                className="w-full h-11 rounded-full bg-slate-900 hover:bg-black text-white text-sm font-medium flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-[0.99] disabled:opacity-50"
              >
                <span>{loadingProvider === 'email_submit' ? 'Verifying...' : activeTab === 'signin' ? 'Sign in with Email' : 'Create Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Bottom Switcher */}
          <div className="mt-8 text-center text-xs text-slate-500">
            {activeTab === 'signin' ? (
              <span>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('register');
                    setFormError('');
                  }}
                  className="text-slate-900 font-medium underline hover:text-blue-600 transition-colors"
                >
                  Create one
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('signin');
                    setFormError('');
                  }}
                  className="text-slate-900 font-medium underline hover:text-blue-600 transition-colors"
                >
                  Sign in
                </button>
              </span>
            )}
          </div>
        </motion.div>
      </main>

      {/* Footer Support Link */}
      <footer className="w-full py-4 text-center">
        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          className="text-xs text-slate-500 hover:text-slate-800 underline transition-colors"
        >
          Contact Us / Support
        </a>
      </footer>

      {/* Persistent Cookie Compliance Banner (Bottom Docked) */}
      <AnimatePresence>
        {!cookieConsent && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-0 inset-x-0 z-50 bg-[#333333] text-white py-3.5 px-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-normal"
          >
            <div className="flex-1 max-w-4xl leading-relaxed">
              <span>
                Finsight AI uses cookies to deliver and enhance the quality of its document intelligence services, authenticate sessions, and analyze platform traffic.
              </span>
              {showCookieDetails && (
                <div className="mt-2 text-[11px] text-slate-300 border-t border-white/10 pt-2 space-y-1">
                  <p>• <strong>Strictly Necessary:</strong> Manages authentication tokens and session state.</p>
                  <p>• <strong>Performance & Analytics:</strong> Measures document processing latencies and Core API availability.</p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                type="button"
                onClick={() => setShowCookieDetails(!showCookieDetails)}
                className="text-slate-300 hover:text-white underline text-xs cursor-pointer"
              >
                {showCookieDetails ? 'Hide details' : 'Learn more'}
              </button>
              <button
                type="button"
                onClick={() => handleAcceptCookies('essential')}
                className="px-3.5 py-1.5 rounded-full border border-white/30 text-white hover:bg-white/10 text-xs font-medium transition-colors cursor-pointer"
              >
                Essential only
              </button>
              <button
                type="button"
                onClick={() => handleAcceptCookies('all')}
                className="px-4 py-1.5 rounded-full bg-white text-slate-900 hover:bg-slate-100 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Accept all
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
