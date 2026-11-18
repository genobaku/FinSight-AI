import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Upload,
  Cpu,
  Layers,
  CheckCircle,
  BarChart2,
  FileText,
  Search,
  Check,
  ArrowRight,
  TrendingUp,
  FileCheck2,
  CornerDownRight,
} from 'lucide-react';

export const ProductShowcase = () => {
  const [activeStep, setActiveStep] = useState(2); // default to Structured Fields view

  const pipelineSteps = [
    {
      id: 0,
      title: 'Document Upload',
      tag: '01 Ingest',
      desc: 'Multimodal input: PDF, scan, image or camera feed',
      icon: Upload,
    },
    {
      id: 1,
      title: 'AI Extraction',
      tag: '02 OCR & Vision',
      desc: 'Multimodal document intelligence and spatial OCR parsing',
      icon: Cpu,
    },
    {
      id: 2,
      title: 'Structured Fields',
      tag: '03 Dynamic Schema',
      desc: 'Discovery of arbitrary fields, line items and metadata',
      icon: Layers,
    },
    {
      id: 3,
      title: 'Verified Data',
      tag: '04 Human in the Loop',
      desc: 'Direct audit review, coordinate evidence and correction',
      icon: CheckCircle,
    },
    {
      id: 4,
      title: 'Analytics',
      tag: '05 Insights',
      desc: 'Aggregated analytics, trend reporting and structured export',
      icon: BarChart2,
    },
  ];

  return (
    <section id="platform" className="py-24 sm:py-32 px-6 sm:px-8 bg-neutral-50/60 border-y border-black/8">
      <div className="max-w-7xl mx-auto">
        {/* Editorial Section Heading */}
        <div className="max-w-3xl mb-16 sm:mb-20">
          <span className="text-xs font-mono uppercase tracking-wider text-black/50 block mb-3">
            Product Showcase
          </span>
          <h2 className="font-editorial text-4xl sm:text-6xl font-normal tracking-tight text-black leading-tight mb-5">
            From raw document pixels to queryable intelligence.
          </h2>
          <p className="text-base sm:text-lg text-neutral-600 leading-relaxed">
            Follow the conceptual pipeline of Finsight AI: ingest messy unstructured records,
            dynamically discover schema fields, verify correctness with linked spatial evidence, and transform them into structured databases.
          </p>
        </div>

        {/* Step Selector Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-10">
          {pipelineSteps.map((step) => {
            const Icon = step.icon;
            const isActive = activeStep === step.id;
            return (
              <button
                key={step.id}
                onClick={() => setActiveStep(step.id)}
                className={`text-left p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-black text-white border-black shadow-md'
                    : 'bg-white text-neutral-800 border-black/8 hover:border-black/20 hover:bg-neutral-100/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[10px] font-mono uppercase tracking-wider ${
                      isActive ? 'text-neutral-400' : 'text-neutral-500'
                    }`}
                  >
                    {step.tag}
                  </span>
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-neutral-400'}`} />
                </div>
                <h4 className="text-sm font-semibold tracking-tight">{step.title}</h4>
                <p
                  className={`text-xs mt-1 line-clamp-2 ${
                    isActive ? 'text-neutral-300' : 'text-neutral-500'
                  }`}
                >
                  {step.desc}
                </p>
              </button>
            );
          })}
        </div>

        {/* Realistic Interactive Interface Mockup */}
        <div className="rounded-2xl border border-black/10 bg-white shadow-xl overflow-hidden">
          {/* Mock Top Application Header */}
          <div className="px-6 py-4 border-b border-black/8 flex flex-wrap items-center justify-between gap-4 bg-neutral-50/50">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="font-editorial text-sm font-bold tracking-tight text-black">
                Finsight Document Ingestion Studio
              </span>
              <span className="text-neutral-300">/</span>
              <span className="text-xs font-mono text-neutral-600">
                batch_2026_q4_enterprise_sample.pdf
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="px-2.5 py-1 rounded bg-black/5 text-neutral-700 border border-black/5">
                Format: PDF v1.7
              </span>
              <span className="px-2.5 py-1 rounded bg-black/5 text-neutral-700 border border-black/5">
                Model: Gemini 2.5 Flash Multimodal
              </span>
            </div>
          </div>

          {/* Interactive Showcase Grid */}
          <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* 1. Document Preview Pane (4 cols) */}
            <div className="lg:col-span-4 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono uppercase tracking-wider text-black/60">
                  Document Preview
                </span>
                <span className="text-xs text-neutral-500 font-mono">Page 1 of 1</span>
              </div>

              {/* Realistic Document Canvas Mockup */}
              <div className="flex-1 rounded-xl border border-black/10 bg-neutral-100 p-4 relative font-sans flex flex-col justify-between min-h-[380px] shadow-inner">
                {/* Visual Paper Simulation */}
                <div className="bg-white rounded-lg p-5 border border-black/8 shadow-xs flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start border-b border-neutral-100 pb-3 mb-3">
                      <div>
                        <div className="font-bold text-sm tracking-tight text-neutral-900">
                          Apex Global Logistics Corp.
                        </div>
                        <div className="text-[10px] text-neutral-500">
                          742 Evergreen Terrace, Suite 400
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[11px] font-mono font-bold text-neutral-900">
                          #INV-88320
                        </div>
                        <div className="text-[10px] text-neutral-400">Date: 2026-10-18</div>
                      </div>
                    </div>

                    {/* Bounding Box Highlights simulating OCR evidence anchors */}
                    <div className="space-y-2 mt-4 text-[11px]">
                      <div className="p-1.5 rounded bg-blue-50/70 border border-blue-400/40 text-blue-950 font-mono flex justify-between items-center">
                        <span>Vendor: Apex Global Logistics</span>
                        <span className="text-[9px] uppercase px-1 rounded bg-blue-200/60 font-sans">
                          Bounding Box
                        </span>
                      </div>
                      <div className="p-1.5 rounded bg-blue-50/70 border border-blue-400/40 text-blue-950 font-mono flex justify-between items-center">
                        <span>Freight Service Air Express</span>
                        <span className="text-[9px] font-bold">$3,840.00</span>
                      </div>
                      <div className="p-1.5 rounded bg-blue-50/70 border border-blue-400/40 text-blue-950 font-mono flex justify-between items-center">
                        <span>Customs Clearance Handling</span>
                        <span className="text-[9px] font-bold">$420.00</span>
                      </div>
                      <div className="p-1.5 rounded bg-emerald-50/70 border border-emerald-400/50 text-emerald-950 font-mono flex justify-between items-center mt-3 font-semibold">
                        <span>Total Payable (USD)</span>
                        <span>$4,260.00</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-[10px] text-neutral-500 font-mono">
                    <span>Resolution: 300 DPI</span>
                    <span className="text-emerald-700 font-medium">✓ High Clarity</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Extracted Dynamic Fields & Structured Information Table (5 cols) */}
            <div className="lg:col-span-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono uppercase tracking-wider text-black/60">
                    Extracted Dynamic Fields & Schema
                  </span>
                  <span className="text-xs font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Schema Discovered
                  </span>
                </div>

                {/* Structured Table */}
                <div className="border border-black/8 rounded-xl overflow-hidden bg-white">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-neutral-50 border-b border-black/8 text-neutral-600">
                      <tr>
                        <th className="py-2.5 px-3 font-medium">Field Identifier</th>
                        <th className="py-2.5 px-3 font-medium">Extracted Value</th>
                        <th className="py-2.5 px-3 font-medium text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5 text-neutral-900">
                      <tr>
                        <td className="py-2.5 px-3 text-neutral-500">merchant_name</td>
                        <td className="py-2.5 px-3 font-medium">Apex Global Logistics</td>
                        <td className="py-2.5 px-3 text-right">
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600">
                            <Check className="w-3 h-3" /> Verified
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 text-neutral-500">invoice_date</td>
                        <td className="py-2.5 px-3 font-medium">2026-10-18</td>
                        <td className="py-2.5 px-3 text-right">
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600">
                            <Check className="w-3 h-3" /> Verified
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 text-neutral-500">currency</td>
                        <td className="py-2.5 px-3 font-medium">USD ($)</td>
                        <td className="py-2.5 px-3 text-right">
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600">
                            <Check className="w-3 h-3" /> Auto
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 text-neutral-500">freight_subtotal</td>
                        <td className="py-2.5 px-3 font-semibold">$3,840.00</td>
                        <td className="py-2.5 px-3 text-right">
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600">
                            <Check className="w-3 h-3" /> Verified
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 text-neutral-500">customs_fee</td>
                        <td className="py-2.5 px-3 font-semibold">$420.00</td>
                        <td className="py-2.5 px-3 text-right">
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600">
                            <Check className="w-3 h-3" /> Verified
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 text-neutral-500">total_payable</td>
                        <td className="py-2.5 px-3 font-bold text-black">$4,260.00</td>
                        <td className="py-2.5 px-3 text-right">
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600">
                            <Check className="w-3 h-3" /> Confirmed
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Dynamic schema discovery note */}
              <div className="mt-4 p-3 rounded-lg bg-neutral-50 border border-black/5 text-xs text-neutral-600 flex items-start gap-2.5">
                <CornerDownRight className="w-4 h-4 text-black flex-shrink-0 mt-0.5" />
                <p>
                  <strong>No brittle templates required:</strong> Schema fields like{' '}
                  <code className="text-black bg-neutral-200/60 px-1 py-0.5 rounded">customs_fee</code> were
                  dynamically recognized directly from document context.
                </p>
              </div>
            </div>

            {/* 3. Real Analytics Visualization Card (3 cols) */}
            <div className="lg:col-span-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono uppercase tracking-wider text-black/60">
                    Analytics Visualization
                  </span>
                  <span className="text-xs font-mono text-neutral-500">Q4 Summary</span>
                </div>

                <div className="p-4 rounded-xl border border-black/10 bg-white space-y-4">
                  {/* Category Spend Breakdown */}
                  <div>
                    <div className="text-[11px] font-mono text-neutral-500 uppercase">
                      Category Allocation
                    </div>
                    <div className="text-xl font-bold font-editorial text-black mt-1">$48,920.00</div>
                    <div className="text-[11px] text-neutral-500">12 verified documents</div>
                  </div>

                  {/* Visual Bar representation */}
                  <div className="space-y-2 pt-2">
                    <div>
                      <div className="flex justify-between text-[11px] font-mono text-neutral-600 mb-1">
                        <span>Logistics & Freight</span>
                        <span className="font-semibold text-black">62%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-neutral-100 overflow-hidden">
                        <div className="h-full bg-black rounded-full" style={{ width: '62%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] font-mono text-neutral-600 mb-1">
                        <span>Software & Cloud</span>
                        <span className="font-semibold text-black">26%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-neutral-100 overflow-hidden">
                        <div className="h-full bg-neutral-500 rounded-full" style={{ width: '26%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] font-mono text-neutral-600 mb-1">
                        <span>Operations & Tax</span>
                        <span className="font-semibold text-black">12%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-neutral-100 overflow-hidden">
                        <div className="h-full bg-neutral-300 rounded-full" style={{ width: '12%' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data export summary */}
              <div className="mt-4 p-3 rounded-lg border border-black/8 bg-white flex items-center justify-between text-xs font-mono">
                <span className="text-neutral-500">Database Sync:</span>
                <span className="text-black font-semibold">Supabase PostgreSQL</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
