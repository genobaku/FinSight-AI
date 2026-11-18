import React from 'react';
import { ArrowUp } from 'lucide-react';

export const Footer = ({ onLaunchApp, onLogin }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-white border-t border-black/10 pt-20 pb-12 px-6 sm:px-8 text-black">
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Links Columns */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 pb-16 border-b border-black/8">
          {/* Brand Col (2 cols on wide) */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-black text-white flex items-center justify-center font-bold text-xs tracking-wider">
                F
              </div>
              <span className="font-editorial text-xl font-bold tracking-tight text-black">
                Finsight AI
              </span>
            </div>
            <p className="text-sm text-neutral-600 max-w-sm leading-relaxed">
              Intelligent document processing and data organization.
              Turn documents into data. Turn data into decisions.
            </p>
            <div className="pt-2">
              <button
                onClick={onLaunchApp}
                className="text-xs font-mono font-medium underline text-black hover:text-neutral-600 cursor-pointer"
              >
                Launch Document Studio →
              </button>
            </div>
          </div>

          {/* Product Col */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-black font-semibold">
              Product
            </h4>
            <ul className="space-y-2.5 text-sm text-neutral-600">
              <li>
                <a href="#platform" className="hover:text-black transition-colors">
                  Platform
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-black transition-colors">
                  Document Intelligence
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-black transition-colors">
                  Data Extraction
                </a>
              </li>
              <li>
                <a href="#platform" className="hover:text-black transition-colors">
                  Analytics
                </a>
              </li>
            </ul>
          </div>

          {/* Resources Col */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-black font-semibold">
              Resources
            </h4>
            <ul className="space-y-2.5 text-sm text-neutral-600">
              <li>
                <a
                  href="#how-it-works"
                  onClick={(e) => {
                    e.preventDefault();
                    document.querySelector('#how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:text-black transition-colors"
                >
                  How it works
                </a>
              </li>
              <li>
                <a href="#solutions" className="hover:text-black transition-colors">
                  Solutions & Use Cases
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-black transition-colors">
                  Philosophy
                </a>
              </li>
              <li>
                <button
                  onClick={onLogin}
                  className="hover:text-black transition-colors text-left cursor-pointer"
                >
                  Operator Sign In
                </button>
              </li>
            </ul>
          </div>

          {/* Company Col */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-black font-semibold">
              Company
            </h4>
            <ul className="space-y-2.5 text-sm text-neutral-600">
              <li>
                <a href="#about" className="hover:text-black transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="mailto:support@finsight.ai" className="hover:text-black transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-black transition-colors">
                  Privacy
                </a>
              </li>
              <li>
                <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-black transition-colors">
                  Terms
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Back to top & sub-bar */}
        <div className="py-8 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 font-mono gap-4">
          <div>
            © {new Date().getFullYear()} Finsight AI. All rights reserved. Built with precision for document intelligence.
          </div>
          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 hover:text-black transition-colors cursor-pointer"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Oversized FINSIGHT Wordmark anchoring the footer (Antigravity Reference) */}
        <div className="pt-10 sm:pt-16 pb-4 overflow-hidden select-none pointer-events-none">
          <div className="font-editorial text-[14vw] font-black tracking-tighter text-neutral-200/70 leading-none text-center">
            FINSIGHT
          </div>
        </div>
      </div>
    </footer>
  );
};
