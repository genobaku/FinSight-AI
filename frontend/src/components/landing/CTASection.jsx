import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, ShieldCheck, Database, Zap } from 'lucide-react';

export const CTASection = ({ onLaunchApp }) => {
  return (
    <section className="py-28 sm:py-40 px-6 sm:px-8 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-4xl">
          {/* Tag */}
          <span className="text-xs font-mono uppercase tracking-wider text-black/50 block mb-4">
            Get Started
          </span>

          {/* Headline */}
          <h2 className="font-editorial text-5xl sm:text-7xl lg:text-8xl font-normal tracking-tight text-black leading-[1.02] mb-6">
            Make your documents <br className="hidden sm:inline" />
            work smarter.
          </h2>

          {/* Description */}
          <p className="text-lg sm:text-xl text-neutral-600 max-w-2xl leading-relaxed mb-10">
            Bring your information together and turn it into something useful.
            Experience intelligent document processing today.
          </p>

          {/* CTA Action */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <button
              onClick={onLaunchApp}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-black text-white text-base font-medium hover:bg-neutral-800 transition-all duration-200 shadow-sm cursor-pointer group hover:scale-[1.01] active:scale-[0.99]"
            >
              <span>Get started with Finsight</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          {/* Minimalist Trust Features */}
          <div className="mt-14 pt-8 border-t border-black/8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-neutral-600 font-mono">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-black flex-shrink-0" />
              <span>AES-256 Encrypted & Secure Storage</span>
            </div>
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-black flex-shrink-0" />
              <span>Supabase PostgreSQL Integration</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-black flex-shrink-0" />
              <span>Instant Multimodal Processing</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
