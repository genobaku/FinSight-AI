import React from 'react';
import { motion } from 'motion/react';
import { Upload, Eye, Table, CheckSquare, BarChart3, ArrowRight } from 'lucide-react';

export const WorkflowSection = ({ onLaunchApp }) => {
  const steps = [
    {
      num: '01',
      title: 'Upload your documents',
      description:
        'Incorporate multi-page PDFs, mobile photos, high-resolution scans, or digital receipts directly through the secure ingestion portal.',
      icon: Upload,
      detail: 'Supports PDF, PNG, JPG, WEBP & DOCX formats up to 10MB.',
    },
    {
      num: '02',
      title: 'Understand the content',
      description:
        'Multimodal vision and OCR models scan the document layout, identifying typography, tabular matrices, language nuances, and document classification.',
      icon: Eye,
      detail: 'Contextual semantic understanding without template pre-training.',
    },
    {
      num: '03',
      title: 'Extract and organize information',
      description:
        'Key-value pairs, nested line items, tax numbers, and dates are dynamically parsed and structured into strongly-typed relational entities.',
      icon: Table,
      detail: 'Dynamic field discovery without manual schema configuration.',
    },
    {
      num: '04',
      title: 'Review and verify results',
      description:
        'Inspect extracted values side-by-side with original document evidence. Make instant corrections and approve records with a single click.',
      icon: CheckSquare,
      detail: 'Full human-in-the-loop audit trail with bounding box highlighting.',
    },
    {
      num: '05',
      title: 'Analyze and export your data',
      description:
        'Transform clean data into financial dashboards, category trends, or export seamlessly to Supabase PostgreSQL, JSON, or CSV pipelines.',
      icon: BarChart3,
      detail: 'Direct database synchronization and enterprise analytics ready.',
    },
  ];

  return (
    <section id="how-it-works" className="py-24 sm:py-36 px-6 sm:px-8 bg-neutral-50/70 border-t border-black/8">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="max-w-3xl mb-20 sm:mb-28">
          <span className="text-xs font-mono uppercase tracking-wider text-black/50 block mb-3">
            Workflow Architecture
          </span>
          <h2 className="font-editorial text-4xl sm:text-6xl font-normal tracking-tight text-black leading-tight mb-6">
            A precise five-step transformation pipeline.
          </h2>
          <p className="text-base sm:text-lg text-neutral-600 leading-relaxed">
            From raw, ambiguous paperwork to verified, queryable data in seconds.
          </p>
        </div>

        {/* Five Step Workflow Container */}
        <div className="relative">
          {/* Subtle connecting vertical line on desktop */}
          <div className="hidden lg:block absolute left-[31px] top-8 bottom-8 w-[1px] bg-black/10 z-0" />

          <div className="space-y-12 sm:space-y-16 relative z-10">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.num}
                  className="group grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 items-start"
                >
                  {/* Left Column: Number Marker & Icon */}
                  <div className="lg:col-span-1 flex items-center lg:flex-col lg:items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-white border border-black/10 group-hover:border-black group-hover:bg-black group-hover:text-white transition-all duration-300 flex items-center justify-center text-black font-editorial text-xl font-bold shadow-xs">
                      {step.num}
                    </div>
                  </div>

                  {/* Middle Column: Step Title & Deep Description */}
                  <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-2xl border border-black/8 group-hover:border-black/20 group-hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-800">
                        <Icon className="w-4 h-4" />
                      </div>
                      <h3 className="font-editorial text-xl sm:text-2xl font-bold tracking-tight text-black">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-neutral-600 text-sm sm:text-base leading-relaxed mb-4">
                      {step.description}
                    </p>
                    <div className="pt-3 border-t border-black/5 text-xs font-mono text-neutral-500">
                      {step.detail}
                    </div>
                  </div>

                  {/* Right Column: Technical Representation */}
                  <div className="lg:col-span-5 bg-neutral-100/70 p-6 rounded-2xl border border-black/6 font-mono text-xs text-neutral-700 flex flex-col justify-center">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-black/5 text-[11px] text-neutral-500">
                      <span>PIPELINE_STAGE: {step.num}</span>
                      <span>STATUS: ACTIVE</span>
                    </div>
                    {step.num === '01' && (
                      <div className="text-neutral-600 space-y-1">
                        <div>&gt; ingest.receive_stream(file_buffer)</div>
                        <div className="text-emerald-700">&gt; MIME validated: application/pdf (OK)</div>
                        <div>&gt; hash: sha256_e891c... [Stored Securely]</div>
                      </div>
                    )}
                    {step.num === '02' && (
                      <div className="text-neutral-600 space-y-1">
                        <div>&gt; ocr.spatial_scan(resolution=300dpi)</div>
                        <div>&gt; document_classification: "Tax Invoice" (conf: 0.98)</div>
                        <div className="text-emerald-700">&gt; 18 text segments mapped to coordinates</div>
                      </div>
                    )}
                    {step.num === '03' && (
                      <div className="text-neutral-600 space-y-1">
                        <div>&gt; schema_discovery.infer_entities()</div>
                        <div>&gt; detected: [vendor, issue_date, line_items[], vat_id]</div>
                        <div className="text-emerald-700">&gt; auto-typed: 4 currency, 2 string, 1 date</div>
                      </div>
                    )}
                    {step.num === '04' && (
                      <div className="text-neutral-600 space-y-1">
                        <div>&gt; audit.mount_evidence_overlay()</div>
                        <div>&gt; user_action: APPROVED_BY_OPERATOR</div>
                        <div className="text-emerald-700">&gt; verification_delta: 0 errors detected</div>
                      </div>
                    )}
                    {step.num === '05' && (
                      <div className="text-neutral-600 space-y-1">
                        <div>&gt; database.sync(target="supabase_postgresql")</div>
                        <div>&gt; analytics.update_aggregates(q4_cashflow)</div>
                        <div className="text-emerald-700">&gt; exported: JSON schema v2.1 generated</div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Workflow Action */}
        <div className="mt-16 text-center">
          <button
            onClick={onLaunchApp}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-black text-white text-xs sm:text-sm font-medium hover:bg-neutral-800 transition-colors shadow-xs cursor-pointer"
          >
            <span>Experience the workflow in live demo</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
