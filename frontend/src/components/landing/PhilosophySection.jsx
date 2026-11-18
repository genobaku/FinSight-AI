import React from 'react';
import { motion } from 'motion/react';

export const PhilosophySection = () => {
  return (
    <section id="about" className="py-28 sm:py-44 px-6 sm:px-8 bg-neutral-950 text-white relative overflow-hidden">
      {/* Subtle Dot Grid pattern in dark mode */}
      <div className="absolute inset-0 bg-dot-pattern opacity-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="max-w-5xl">
          {/* Subtle Tag */}
          <span className="text-xs font-mono uppercase tracking-widest text-neutral-400 block mb-8">
            Product Philosophy & Principles
          </span>

          {/* Oversized Antigravity-Style Editorial Statement */}
          <h2 className="font-editorial text-4xl sm:text-6xl lg:text-7xl font-normal tracking-tight text-white leading-[1.08] sm:leading-[1.05] mb-12">
            “Information is everywhere. <br className="hidden sm:inline" />
            <span className="text-neutral-400">Understanding it should be easier.”</span>
          </h2>

          {/* Philosophy Statement */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-16 pt-8 border-t border-white/10 text-neutral-300 font-sans leading-relaxed text-base sm:text-lg">
            <p>
              Every modern enterprise, university, and independent operator produces mountains of
              unstructured data: purchase invoices, receipts, signed contracts, PDFs, and scans.
              Yet the knowledge locked inside remains inert—trapped in disconnected files, demanding
              exhausting manual entry and prone to transcription errors.
            </p>
            <p>
              Finsight AI exists to bridge the gap between static paperwork and structured,
              decision-ready intelligence. By marrying multimodal computer vision with dynamic
              schema discovery and human-in-the-loop audit verification, we turn documents into
              data, and data into decisions.
            </p>
          </div>

          {/* Minimalist 3 Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-16 sm:mt-24 pt-10 border-t border-white/10">
            <div>
              <div className="text-xs font-mono text-neutral-400 uppercase tracking-wider mb-2">
                01 / Truth in Evidence
              </div>
              <h4 className="font-editorial text-xl font-bold text-white mb-2">No Hallucinations</h4>
              <p className="text-xs sm:text-sm text-neutral-400">
                Every extracted entity is permanently linked back to its pixel coordinate bounding
                box on the source document.
              </p>
            </div>

            <div>
              <div className="text-xs font-mono text-neutral-400 uppercase tracking-wider mb-2">
                02 / Adaptive Schemas
              </div>
              <h4 className="font-editorial text-xl font-bold text-white mb-2">No Rigid Templates</h4>
              <p className="text-xs sm:text-sm text-neutral-400">
                Documents are unpredictable. We infer dynamic structure organically rather than
                failing when a layout changes.
              </p>
            </div>

            <div>
              <div className="text-xs font-mono text-neutral-400 uppercase tracking-wider mb-2">
                03 / Human Authority
              </div>
              <h4 className="font-editorial text-xl font-bold text-white mb-2">Operator in Control</h4>
              <p className="text-xs sm:text-sm text-neutral-400">
                AI accelerates processing; human operators retain the final authority to inspect,
                edit, and approve.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
