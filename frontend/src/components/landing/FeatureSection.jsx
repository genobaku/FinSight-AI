import React from 'react';
import { motion } from 'motion/react';
import {
  FileSearch,
  Cpu,
  Layers,
  UserCheck,
  BarChart3,
  Database,
  ArrowUpRight,
} from 'lucide-react';

export const FeatureSection = () => {
  const capabilities = [
    {
      num: '01',
      title: 'Document Intelligence',
      headline: 'Understand documents and extract meaningful information.',
      description:
        'Parse complex document hierarchies, multi-column tables, handwritten signatures and stamps across unstructured PDFs, scans and photos without manual bounding boxes.',
      icon: FileSearch,
      highlight: 'Multimodal Spatial Vision',
    },
    {
      num: '02',
      title: 'Dynamic Data Extraction',
      headline:
        'Discover fields based on the actual document instead of relying exclusively on predefined labels.',
      description:
        'Unlike legacy OCR platforms trapped in rigid regex patterns, Finsight automatically detects unforeseen line items, custom VAT IDs, payment terms and document-specific terminology.',
      icon: Cpu,
      highlight: 'Zero-Template Discovery',
    },
    {
      num: '03',
      title: 'Intelligent Organization',
      headline: 'Organize information into structured records, fields and tables.',
      description:
        'Map extracted entities into consistent normalized data structures, categorizing suppliers, line items, timestamps and currencies with automated semantic indexing.',
      icon: Layers,
      highlight: 'Automated Normalization',
    },
    {
      num: '04',
      title: 'Human Verification',
      headline: 'Allow users to review, correct and approve extracted information.',
      description:
        'Keep human experts in complete control. Click any extracted field to inspect its bounding-box coordinates on the original document, adjust values inline and confirm accuracy.',
      icon: UserCheck,
      highlight: 'Audit & Coordinate Evidence',
    },
    {
      num: '05',
      title: 'Data Analytics',
      headline: 'Turn verified structured data into meaningful insights and reports.',
      description:
        'Transform historical documents into actionable financial clarity: identify spending patterns, supplier concentrations, cash commitments and payment schedules.',
      icon: BarChart3,
      highlight: 'Decision-Ready Intelligence',
    },
    {
      num: '06',
      title: 'Flexible Data Management',
      headline: 'Support structured storage and future integrations.',
      description:
        'Seamlessly store verified records in managed PostgreSQL via Supabase, or export in machine-readable JSON, CSV and relational schemas for ERP and reporting pipelines.',
      icon: Database,
      highlight: 'PostgreSQL & Cloud Storage',
    },
  ];

  return (
    <section id="features" className="py-24 sm:py-36 px-6 sm:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="max-w-3xl mb-20">
          <span className="text-xs font-mono uppercase tracking-wider text-black/50 block mb-3">
            Platform Capabilities
          </span>
          <h2 className="font-editorial text-4xl sm:text-6xl font-normal tracking-tight text-black leading-tight mb-6">
            Engineered for high-fidelity document comprehension.
          </h2>
          <p className="text-base sm:text-lg text-neutral-600 leading-relaxed">
            A unified architecture designed to bridge the gap between messy real-world files and
            relational databases ready for business decisions.
          </p>
        </div>

        {/* Editorial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
          {capabilities.map((cap) => {
            const Icon = cap.icon;
            return (
              <div
                key={cap.num}
                className="group p-8 rounded-2xl border border-black/8 bg-neutral-50/40 hover:bg-white hover:border-black/20 hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-black/6">
                    <span className="text-xs font-mono text-black/40 group-hover:text-black transition-colors">
                      {cap.num}
                    </span>
                    <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-black/5 text-neutral-600">
                      {cap.highlight}
                    </span>
                  </div>

                  <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center mb-6 shadow-xs">
                    <Icon className="w-5 h-5" />
                  </div>

                  <h3 className="font-editorial text-xl font-bold tracking-tight text-black mb-2">
                    {cap.title}
                  </h3>

                  <h4 className="text-sm font-medium text-neutral-900 leading-snug mb-3">
                    {cap.headline}
                  </h4>

                  <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                    {cap.description}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-black/5 flex items-center justify-between text-xs font-mono text-black/50 group-hover:text-black transition-colors">
                  <span>Architecture component</span>
                  <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
