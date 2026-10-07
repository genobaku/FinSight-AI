import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Zap,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Scan,
  FileText,
  Bot,
  BarChart3,
  Sparkles,
  ChevronDown,
  Building,
  Users,
  CreditCard,
  Lock,
  Globe2,
} from 'lucide-react';
import { TabType } from '../../types';

interface LandingPageProps {
  onLaunchApp: () => void;
  onLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunchApp, onLogin }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does the AI Receipt OCR scanner work?',
      a: 'FinSight AI uses Google Gemini vision models to analyze uploaded receipts, PDFs, and photos in real-time. It automatically extracts vendor names, GST/tax IDs, line items, itemized sub-totals, and total amounts with up to 99.8% precision.',
    },
    {
      q: 'Can I issue multi-currency invoices to global clients?',
      a: 'Yes! FinSight AI supports USD, EUR, GBP, CAD, AUD, and INR natively with automated tax rate calculations, customizable payment terms (Net 15, Net 30, Net 60), and PDF export.',
    },
    {
      q: 'Is my financial data secure?',
      a: 'Absolutely. We enforce AES-256 bank-level encryption at rest and in transit. Your AI processing occurs in secure, server-side sandboxed environments with zero client-side credential exposure.',
    },
    {
      q: 'How does the AI Financial Assistant help my cash flow?',
      a: 'FinSight Copilot connects with your live invoice and expense logs to identify early payment discounts, flag overdue accounts, detect spending anomalies, and answer complex financial questions in plain natural language.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased overflow-x-hidden selection:bg-blue-500 selection:text-white">
      {/* Top Navbar */}
      <header className="fixed top-0 inset-x-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
              <Zap className="w-5 h-5 fill-white" />
            </div>
            <span className="font-bold text-xl text-white tracking-tight">
              FinSight <span className="text-blue-500 font-extrabold">AI</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-blue-400 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-blue-400 transition-colors">
              AI OCR Scanner
            </a>
            <a href="#pricing" className="hover:text-blue-400 transition-colors">
              Pricing
            </a>
            <a href="#faq" className="hover:text-blue-400 transition-colors">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={onLogin}
              className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={onLaunchApp}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-lg shadow-blue-600/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <span>Launch Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-36 pb-20 px-6 overflow-hidden">
        {/* Glowing Radial Gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto text-center space-y-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-xs font-semibold text-blue-400 shadow-xl"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Next-Gen Financial Intelligence Engine v2.4</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight max-w-5xl mx-auto leading-[1.1]"
          >
            AI-Powered Smart Invoicing & <br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              Financial Intelligence
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed"
          >
            Automate invoices, scan receipts with vision OCR, forecast cash flows, and ask your personal Gemini AI CFO financial questions in seconds.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <button
              onClick={onLaunchApp}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-base shadow-xl shadow-blue-600/30 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={onLaunchApp}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold text-base transition-all hover:scale-105"
            >
              Explore Live Demo
            </button>
          </motion.div>

          {/* Feature Badge Pills */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-slate-400">
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Bank-Grade Security
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-400" /> 99.8% OCR Accuracy
            </span>
            <span className="flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-indigo-400" /> Multi-Currency Support
            </span>
          </div>

          {/* Animated Hero Product Showcase Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="pt-10 max-w-5xl mx-auto"
          >
            <div className="relative rounded-2xl p-2 bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700/60 shadow-2xl overflow-hidden group">
              <div className="bg-slate-950 rounded-xl p-6 text-left space-y-6">
                {/* Simulated App Top Bar */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                    <span className="ml-4 text-xs font-mono text-slate-500">app.finsight.ai/overview</span>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    Live Platform Preview
                  </span>
                </div>

                {/* Simulated Metrics Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                    <p className="text-xs text-slate-400">Total Monthly Revenue</p>
                    <p className="text-2xl font-bold text-white mt-1">$64,280.00</p>
                    <span className="text-xs text-emerald-400 font-semibold">↑ +24.8% vs last month</span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                    <p className="text-xs text-slate-400">Operating Expenses</p>
                    <p className="text-2xl font-bold text-white mt-1">$21,600.00</p>
                    <span className="text-xs text-blue-400 font-semibold">4 receipts scanned today</span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                    <p className="text-xs text-slate-400">AI Net Profit Margin</p>
                    <p className="text-2xl font-bold text-emerald-400 mt-1">66.4%</p>
                    <span className="text-xs text-slate-400">Optimal liquidity index</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="py-12 border-y border-slate-800 bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-white">$18.4M+</div>
            <div className="text-xs sm:text-sm font-medium text-slate-400 mt-1">Invoices Processed</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-blue-400">99.8%</div>
            <div className="text-xs sm:text-sm font-medium text-slate-400 mt-1">OCR Scan Precision</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-white">12,800+</div>
            <div className="text-xs sm:text-sm font-medium text-slate-400 mt-1">Small Businesses & SMEs</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400">&lt;1.2s</div>
            <div className="text-xs sm:text-sm font-medium text-slate-400 mt-1">AI Extraction Speed</div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h2 className="text-xs uppercase font-bold tracking-widest text-blue-400">
            End-to-End Financial Intelligence
          </h2>
          <p className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Built for Modern Businesses, Freelancers & Founders
          </p>
          <p className="text-slate-400 text-base sm:text-lg">
            Replace legacy accounting tools with intelligent automation that saves hours every week.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="p-8 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/50 transition-all hover:-translate-y-1 group">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Smart Invoicing Engine</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Generate customizable, professional invoices with line item tax rules, Net 15/30 terms, payment links, and instant PDF download.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-8 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/50 transition-all hover:-translate-y-1 group">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
              <Scan className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">AI Vision Receipt Scanner</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Upload physical or digital receipts. Google Gemini Vision extracts vendors, date, line items, GST totals, and expense categories automatically.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-8 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/50 transition-all hover:-translate-y-1 group">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 transition-transform">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">FinSight Copilot Assistant</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Ask questions like "How much did I spend on fuel?" or "Which invoices are overdue?". Get instant plain language answers with dynamic charts.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-8 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/50 transition-all hover:-translate-y-1 group">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Cash Flow & P&L Analytics</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Real-time charts tracking revenue vs expense curves, category distributions, monthly cash buffers, and vendor spending patterns.
            </p>
          </div>

          {/* Card 5 */}
          <div className="p-8 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/50 transition-all hover:-translate-y-1 group">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-6 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Customer & Vendor CRM</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Manage client billing histories, track payables to top vendors, and monitor vendor risk profiles with anomaly alerts.
            </p>
          </div>

          {/* Card 6 */}
          <div className="p-8 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/50 transition-all hover:-translate-y-1 group">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-6 group-hover:scale-110 transition-transform">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Automated AR/AP Reminders</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Never miss unpaid invoices. Automated overdue notifications help recover past due funds up to 3x faster without awkward emails.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 bg-slate-900/40 border-t border-slate-800">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h2 className="text-xs uppercase font-bold tracking-widest text-blue-400">
              Simple, Transparent Pricing
            </h2>
            <p className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Scale Your Financial Operations
            </p>
            <p className="text-slate-400 text-sm sm:text-base">
              No hidden fees. Upgrade or downgrade anytime with 14 days free trial.
            </p>

            {/* Toggle */}
            <div className="pt-4 flex items-center justify-center gap-4">
              <span className={`text-sm font-semibold ${billingCycle === 'monthly' ? 'text-white' : 'text-slate-400'}`}>
                Monthly Billing
              </span>
              <button
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                className="w-14 h-8 rounded-full bg-slate-800 p-1 border border-slate-700 relative transition-colors"
              >
                <div
                  className={`w-6 h-6 rounded-full bg-blue-500 transition-transform ${
                    billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className={`text-sm font-semibold flex items-center gap-1.5 ${billingCycle === 'yearly' ? 'text-white' : 'text-slate-400'}`}>
                Yearly Billing
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Save 20%
                </span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Starter */}
            <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800 space-y-6 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Starter</h3>
                <p className="text-slate-400 text-xs mt-1">Perfect for freelancers & solo consultants</p>
                <div className="my-6">
                  <span className="text-4xl font-extrabold text-white">
                    ${billingCycle === 'yearly' ? '15' : '19'}
                  </span>
                  <span className="text-slate-400 text-sm"> / month</span>
                </div>
                <ul className="space-y-3 text-sm text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Up to 25 Invoices / mo
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 50 AI Receipt OCR Scans
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Basic Financial Reports
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Multi-Currency Support
                  </li>
                </ul>
              </div>
              <button
                onClick={onLaunchApp}
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition-colors"
              >
                Start 14-Day Trial
              </button>
            </div>

            {/* Pro Business - Featured */}
            <div className="p-8 rounded-2xl bg-slate-900 border-2 border-blue-500 shadow-2xl shadow-blue-500/10 space-y-6 flex flex-col justify-between relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-blue-600 text-white font-bold text-[10px] uppercase tracking-wider">
                Most Popular
              </span>
              <div>
                <h3 className="text-lg font-bold text-white">Pro Business</h3>
                <p className="text-slate-400 text-xs mt-1">Ideal for growing startups & local SMEs</p>
                <div className="my-6">
                  <span className="text-4xl font-extrabold text-white">
                    ${billingCycle === 'yearly' ? '39' : '49'}
                  </span>
                  <span className="text-slate-400 text-sm"> / month</span>
                </div>
                <ul className="space-y-3 text-sm text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-400" /> Unlimited Invoices & PDF Export
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-400" /> Unlimited AI Vision OCR Scans
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-400" /> FinSight Gemini AI Copilot
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-400" /> Customer & Vendor CRM
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-400" /> Cash Flow Forecasting
                  </li>
                </ul>
              </div>
              <button
                onClick={onLaunchApp}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-colors"
              >
                Get Started Now
              </button>
            </div>

            {/* Enterprise */}
            <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800 space-y-6 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Enterprise</h3>
                <p className="text-slate-400 text-xs mt-1">For multi-entity companies & agencies</p>
                <div className="my-6">
                  <span className="text-4xl font-extrabold text-white">
                    ${billingCycle === 'yearly' ? '119' : '149'}
                  </span>
                  <span className="text-slate-400 text-sm"> / month</span>
                </div>
                <ul className="space-y-3 text-sm text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Everything in Pro Business
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Dedicated Account Manager
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Custom API & Webhooks
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Audit Log & Role Access
                  </li>
                </ul>
              </div>
              <button
                onClick={onLaunchApp}
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition-colors"
              >
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section id="faq" className="py-24 px-6 max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-extrabold text-white">Frequently Asked Questions</h2>
          <p className="text-slate-400 text-sm">Have questions about FinSight AI? We have answers.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden transition-colors"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-6 text-left flex items-center justify-between font-bold text-white text-base"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-slate-400 transition-transform ${
                    openFaq === idx ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-6 pb-6 text-sm text-slate-400 leading-relaxed border-t border-slate-800/60 pt-4">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-800 bg-slate-950 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Zap className="w-4 h-4 fill-white" />
            </div>
            <span className="font-bold text-sm text-white">FinSight AI Platform</span>
          </div>
          <p>© 2026 FinSight AI Inc. All rights reserved. Built for global businesses.</p>
          <div className="flex items-center gap-6 text-slate-400">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Service</a>
            <a href="#" className="hover:text-white">Security</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
