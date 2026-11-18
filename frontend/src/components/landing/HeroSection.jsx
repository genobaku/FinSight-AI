import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, FileText, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';

export const HeroSection = ({ onLaunchApp }) => {
  const handleScrollToWorkflow = (e) => {
    e.preventDefault();
    const target = document.querySelector('#how-it-works');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative pt-36 sm:pt-44 pb-20 sm:pb-32 px-6 sm:px-8 overflow-hidden bg-white">
      {/* Background Subtle Coordinate Grid / Minimalist Architectural Feel */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-neutral-100 rounded-full blur-[140px] pointer-events-none opacity-60" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="max-w-4xl">
          {/* Subtle Technology Badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-black/8 bg-neutral-50/80 mb-8 backdrop-blur-xs"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
            <span className="text-xs font-mono text-black/70 tracking-tight uppercase">
              Intelligent Document Processing & Architecture
            </span>
          </motion.div>

          {/* Oversized Editorial Headlines (Antigravity Inspiration) */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-editorial text-5xl sm:text-7xl lg:text-8xl font-normal tracking-tight text-black leading-[1.05] sm:leading-[1.02] mb-6"
          >
            Turn documents <br className="hidden sm:inline" />
            into data.
            <span className="block text-black/35 font-light mt-2 sm:mt-3">
              Turn data into decisions.
            </span>
          </motion.h1>

          {/* Clean Supporting Description */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-lg sm:text-xl text-neutral-600 font-normal max-w-2xl leading-relaxed mb-10"
          >
            An intelligent platform to extract, organize and understand information
            hidden inside your documents.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="flex flex-wrap items-center gap-4 sm:gap-5"
          >
            <button
              onClick={onLaunchApp}
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-black text-white text-sm font-medium hover:bg-neutral-800 transition-all duration-200 shadow-sm cursor-pointer group hover:scale-[1.01] active:scale-[0.99]"
            >
              <span>Explore Finsight</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            <a
              href="#how-it-works"
              onClick={handleScrollToWorkflow}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-black/12 bg-white text-black text-sm font-medium hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              <span>See how it works</span>
              <ChevronRight className="w-4 h-4 text-black/40" />
            </a>
          </motion.div>
        </div>

        {/* Hero Interactive Document Architecture Preview / Visualization */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="mt-16 sm:mt-24 rounded-2xl border border-black/10 bg-neutral-900 text-white shadow-2xl overflow-hidden"
        >
          {/* Mock Window Chrome Bar */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-neutral-950/80 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-neutral-700" />
              <div className="w-3 h-3 rounded-full bg-neutral-700" />
              <div className="w-3 h-3 rounded-full bg-neutral-700" />
              <span className="ml-3 text-xs font-mono text-neutral-400">
                finsight-core://document-stream/live-ingestion
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                OCR Engine Ready
              </span>
            </div>
          </div>

          {/* Visualization Content: Ingestion Pipeline Preview */}
          <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-gradient-to-b from-neutral-900 to-neutral-950">
            {/* Left: Input Document Preview Card */}
            <div className="lg:col-span-5 rounded-xl border border-white/10 bg-white/5 p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-neutral-400" />
                    <span className="text-xs font-mono text-neutral-300">
                      INV-2026-9041_TaxInvoice.pdf
                    </span>
                  </div>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white/10 text-neutral-300">
                    PDF • 1.4 MB
                  </span>
                </div>

                <div className="space-y-3 font-mono text-xs text-neutral-400 bg-black/40 p-4 rounded-lg border border-white/5">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-neutral-500">Document Type</span>
                    <span className="text-white">Commercial Tax Invoice</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-neutral-500">Issuer / Vendor</span>
                    <span className="text-white">Aetheria Cloud Systems Ltd</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-neutral-500">Invoice Date</span>
                    <span className="text-white">2026-10-24</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-neutral-500">Currency</span>
                    <span className="text-white">USD ($)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Subtotal / Tax</span>
                    <span className="text-white">$14,200.00 / 18% GST</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-neutral-400">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-neutral-300" />
                  Dynamic field discovery enabled
                </span>
                <span className="font-mono text-neutral-500">14 fields detected</span>
              </div>
            </div>

            {/* Right: Real-time Structured Entity Stream */}
            <div className="lg:col-span-7 rounded-xl border border-white/10 bg-white/5 p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono uppercase tracking-wider text-neutral-400">
                    Discovered Schema & Extracted Records
                  </span>
                  <span className="text-[11px] font-mono text-neutral-400">
                    Status: <span className="text-white">Extracted & Verified</span>
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-neutral-400">
                        <th className="pb-2.5 font-medium">Field</th>
                        <th className="pb-2.5 font-medium">Data Type</th>
                        <th className="pb-2.5 font-medium">Value</th>
                        <th className="pb-2.5 font-medium text-right">Verification</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-neutral-200">
                      <tr>
                        <td className="py-2.5 text-neutral-400">invoice_number</td>
                        <td className="py-2.5 text-neutral-500">identifier</td>
                        <td className="py-2.5 text-white font-semibold">INV-2026-9041</td>
                        <td className="py-2.5 text-right">
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400">
                            <CheckCircle2 className="w-3 h-3" /> Approved
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 text-neutral-400">line_items[0].sku</td>
                        <td className="py-2.5 text-neutral-500">text</td>
                        <td className="py-2.5 text-white">Compute Node 64GB H100</td>
                        <td className="py-2.5 text-right">
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400">
                            <CheckCircle2 className="w-3 h-3" /> Approved
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 text-neutral-400">line_items[0].amount</td>
                        <td className="py-2.5 text-neutral-500">currency</td>
                        <td className="py-2.5 text-white font-semibold">$14,200.00</td>
                        <td className="py-2.5 text-right">
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400">
                            <CheckCircle2 className="w-3 h-3" /> Approved
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 text-neutral-400">tax_jurisdiction</td>
                        <td className="py-2.5 text-neutral-500">category</td>
                        <td className="py-2.5 text-white">Federal / Direct Service</td>
                        <td className="py-2.5 text-right">
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400">
                            <CheckCircle2 className="w-3 h-3" /> Approved
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-neutral-400 font-mono">
                <span>Confidence: 99.4% (Gemini Multimodal Vision)</span>
                <span className="text-white underline cursor-pointer hover:text-neutral-300">
                  Export JSON / SQL / CSV
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
