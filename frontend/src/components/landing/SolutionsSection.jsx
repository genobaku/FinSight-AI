import React from 'react';
import { motion } from 'motion/react';
import {
  Receipt,
  GraduationCap,
  Building,
  Folders,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
} from 'lucide-react';

export const SolutionsSection = ({ onLaunchApp }) => {
  const domains = [
    {
      domain: 'Financial Documents',
      status: 'Implemented',
      statusType: 'active',
      title: 'Invoices, Receipts & Bank Statements',
      description:
        'Extract vendors, payment dates, GST/VAT IDs, exchange rates, and itemized sub-totals. Automatically reconcile accounts and update live cash flow ledgers.',
      icon: Receipt,
      features: [
        'Dynamic receipt OCR with line items',
        'Multi-currency support (USD, EUR, GBP, INR)',
        'Tax & jurisdiction categorization',
      ],
      sample: 'INV-2026-X889 • $14,200.00 • Cleared',
    },
    {
      domain: 'Educational Records',
      status: 'Planned',
      statusType: 'roadmap',
      title: 'Transcripts, Diplomas & Certifications',
      description:
        'Digitize academic credentials, course grades, credits and accreditation seals. Transform printed transcripts into structured student profiles and transfer audits.',
      icon: GraduationCap,
      features: [
        'Transcript grade & GPA tabular extraction',
        'Accreditation seal & signature detection',
        'Standardized credit mapping schema',
      ],
      sample: 'Academic Transcript • Grade A+ • 120 Credits',
    },
    {
      domain: 'Business Reports',
      status: 'Planned',
      statusType: 'roadmap',
      title: 'Contracts, Vendor Audits & Board Decks',
      description:
        'Parse multi-page agreements, SLA terms, procurement filings and compliance filings into queryable corporate knowledge bases without manual data entry.',
      icon: Building,
      features: [
        'Master service agreement (MSA) clause extraction',
        'Renewal dates & penalty clause indexing',
        'Vendor performance metric ingestion',
      ],
      sample: 'Vendor SLA Agreement • Net 30 Terms • Auto-Renew',
    },
    {
      domain: 'General Organization',
      status: 'Implemented',
      statusType: 'active',
      title: 'Heterogeneous File Archive & Indexing',
      description:
        'Organize arbitrary unstructured document dumps into searchable semantic libraries. Automatically tag, deduplicate and index records with confidence scoring.',
      icon: Folders,
      features: [
        'SHA-256 duplicate file detection',
        'Freeform key-value extraction',
        'Supabase cloud synchronization',
      ],
      sample: 'Archive Vault • 1,420 Records Indexed • Synced',
    },
  ];

  return (
    <section id="solutions" className="py-24 sm:py-36 px-6 sm:px-8 bg-white border-t border-black/8">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="max-w-3xl mb-16 sm:mb-24">
          <span className="text-xs font-mono uppercase tracking-wider text-black/50 block mb-3">
            Solutions & Use Cases
          </span>
          <h2 className="font-editorial text-4xl sm:text-6xl font-normal tracking-tight text-black leading-tight mb-6">
            Engineered for multiple document domains.
          </h2>
          <p className="text-base sm:text-lg text-neutral-600 leading-relaxed">
            Finsight AI is built to handle diverse document categories with equal precision.
            We maintain strict transparency between existing capabilities and our product roadmap.
          </p>
        </div>

        {/* 2x2 Domain Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10">
          {domains.map((item) => {
            const Icon = item.icon;
            const isImplemented = item.statusType === 'active';
            return (
              <div
                key={item.domain}
                className="p-8 sm:p-10 rounded-2xl border border-black/8 bg-neutral-50/50 hover:bg-white hover:border-black/20 hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-black/6">
                    <span className="text-xs font-mono font-medium text-black uppercase tracking-wider">
                      {item.domain}
                    </span>
                    {isImplemented ? (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Available in Platform
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-300">
                        <Clock className="w-3 h-3 text-neutral-500" />
                        Planned Roadmap
                      </span>
                    )}
                  </div>

                  <div className="w-12 h-12 rounded-xl bg-black text-white flex items-center justify-center mb-6 shadow-xs">
                    <Icon className="w-6 h-6" />
                  </div>

                  <h3 className="font-editorial text-2xl font-bold tracking-tight text-black mb-3">
                    {item.title}
                  </h3>

                  <p className="text-sm text-neutral-600 leading-relaxed mb-6">
                    {item.description}
                  </p>

                  <div className="space-y-2 mb-8">
                    {item.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-neutral-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-black/8 font-mono text-xs flex items-center justify-between text-neutral-700 shadow-2xs">
                  <span className="text-neutral-400">Sample:</span>
                  <span className="font-medium text-black">{item.sample}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Note on Roadmap Commitment */}
        <div className="mt-12 p-6 rounded-xl bg-neutral-50 border border-black/6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-neutral-700 flex-shrink-0" />
            <p className="text-xs sm:text-sm text-neutral-600">
              Our engineering focus is on accuracy, traceability and transparent capability boundaries.
              Financial and general document indexing are live in the application today.
            </p>
          </div>
          <button
            onClick={onLaunchApp}
            className="text-xs font-mono font-semibold text-black hover:underline flex-shrink-0 cursor-pointer"
          >
            Launch Live Engine →
          </button>
        </div>
      </div>
    </section>
  );
};
