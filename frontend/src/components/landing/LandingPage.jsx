import React from 'react';
import { LandingNavbar } from './Navbar';
import { HeroSection } from './HeroSection';
import { ProductShowcase } from './ProductShowcase';
import { FeatureSection } from './FeatureSection';
import { WorkflowSection } from './WorkflowSection';
import { SolutionsSection } from './SolutionsSection';
import { PhilosophySection } from './PhilosophySection';
import { CTASection } from './CTASection';
import { Footer } from './Footer';

export const LandingPage = ({
  onLaunchApp,
  onLogin,
  onGetStarted,
  onSignIn
}) => {
  // Support both prop naming conventions (onLaunchApp/onGetStarted and onLogin/onSignIn)
  const handleLaunchApp = onLaunchApp || onGetStarted;
  const handleLogin = onLogin || onSignIn;

  return (
    <div className="min-h-screen bg-white text-black font-sans-clean antialiased selection:bg-neutral-900 selection:text-white">
      {/* Navigation */}
      <LandingNavbar onLaunchApp={handleLaunchApp} onLogin={handleLogin} />

      {/* Hero Section */}
      <HeroSection onLaunchApp={handleLaunchApp} />

      {/* Product Showcase */}
      <ProductShowcase />

      {/* Platform Capabilities */}
      <FeatureSection />

      {/* 5-Step Workflow */}
      <WorkflowSection onLaunchApp={handleLaunchApp} />

      {/* Solutions & Use Cases */}
      <SolutionsSection onLaunchApp={handleLaunchApp} />

      {/* Product Philosophy */}
      <PhilosophySection />

      {/* Call to Action */}
      <CTASection onLaunchApp={handleLaunchApp} />

      {/* Oversized Antigravity-Style Footer */}
      <Footer onLaunchApp={handleLaunchApp} onLogin={handleLogin} />
    </div>
  );
};
