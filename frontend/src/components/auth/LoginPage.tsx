import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Zap, ArrowRight, Lock, Mail, User, ShieldCheck, Check } from 'lucide-react';

interface LoginPageProps {
  onSuccess?: () => void;
  onLoginSuccess?: () => void;
  onBackToLanding?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onSuccess,
  onLoginSuccess,
  onBackToLanding,
}) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('alex.morgan@finsight.ai');
  const [password, setPassword] = useState('••••••••••••');
  const [name, setName] = useState('Alex Morgan');
  const [company, setCompany] = useState('Aetheria Tech Labs');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (onLoginSuccess) onLoginSuccess();
      if (onSuccess) onSuccess();
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 selection:bg-blue-500 selection:text-white">
      {/* Container */}
      <div className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Left Form Column */}
        <div className="p-8 sm:p-12 flex flex-col justify-between space-y-8">
          <div>
            <button
              onClick={() => {
                if (onBackToLanding) {
                  onBackToLanding();
                } else if (onLoginSuccess) {
                  onLoginSuccess();
                } else if (onSuccess) {
                  onSuccess();
                }
              }}
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white mb-8 transition-colors"
            >
              ← Back to Landing
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
                <Zap className="w-5 h-5 fill-white" />
              </div>
              <span className="font-bold text-xl text-white">
                FinSight <span className="text-blue-500">AI</span>
              </span>
            </div>

            <h2 className="text-2xl font-bold text-white tracking-tight">
              {isSignUp ? 'Create your FinSight AI account' : 'Welcome back to FinSight AI'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {isSignUp
                ? 'Join 12,800+ small businesses managing smart financials.'
                : 'Sign in to access your invoicing and financial AI copilot.'}
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              {isSignUp && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Alex Morgan"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Company Name
                    </label>
                    <input
                      type="text"
                      required
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g. Aetheria Tech Labs"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Business Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@company.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>
              </div>

              {!isSignUp && (
                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-400">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded bg-slate-950 border-slate-800 text-blue-600 focus:ring-blue-500"
                    />
                    Remember me for 30 days
                  </label>
                  <a href="#" className="text-blue-400 hover:underline">
                    Forgot password?
                  </a>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
              >
                {loading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>{isSignUp ? 'Create Free Account' : 'Sign In to Dashboard'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="text-center pt-4 border-t border-slate-800/80 text-xs text-slate-400">
            {isSignUp ? (
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setIsSignUp(false)}
                  className="text-blue-400 font-semibold hover:underline"
                >
                  Sign In
                </button>
              </span>
            ) : (
              <span>
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => setIsSignUp(true)}
                  className="text-blue-400 font-semibold hover:underline"
                >
                  Create one now
                </button>
              </span>
            )}
          </div>
        </div>

        {/* Right Feature Showcase Column */}
        <div className="hidden md:flex flex-col justify-between p-12 bg-gradient-to-br from-blue-900/40 via-indigo-950 to-slate-950 border-l border-slate-800 relative overflow-hidden">
          <div className="space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>SOC2 Type II Certified & Encrypted</span>
            </div>

            <h3 className="text-3xl font-extrabold text-white leading-tight">
              Instant AI Financial Intelligence for Growing Enterprises
            </h3>

            <div className="space-y-4 pt-2 text-sm text-slate-300">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>Automated Gemini Vision OCR extracts line items from receipts in &lt;2s.</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>Smart invoices with automated tax rates and Net 15/30 payment tracking.</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>Real-time natural language chat with FinSight Copilot for cash flow insights.</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-400 relative z-10">
            "FinSight AI reduced our monthly accounting processing time by 85%. The AI receipt scanner alone is worth 10x the subscription price."
            <div className="mt-2 font-bold text-white">— Sarah Jenkins, CFO @ Acme Innovations</div>
          </div>
        </div>
      </div>
    </div>
  );
};
