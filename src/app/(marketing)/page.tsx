import {
  MarketingNavbar,
  HeroSection,
  StatsBanner,
  FeaturesSection,
  InteractiveMatchDemo,
  HowItWorksSection,
  HeroParallaxShowcase,
  TestimonialsSection,
  FaqSection,
  CtaSection,
  SiteFooter,
} from "@/features/marketing/components";

/**
 * JobFits state-of-the-art marketing landing page:
 * - Frosted glass sticky navbar
 * - High-tech hero with quick search and product evaluation preview
 * - Verified metrics & social proof strip
 * - Bento Grid of 5 core platform capabilities
 * - Interactive AI Match Simulator sandbox
 * - 3-step candidate journey
 * - Live opportunities parallax showcase
 * - Candidate testimonials & placement outcomes
 * - Candidate FAQ accordion
 * - High-conversion closing CTA
 * - Modern multi-column dark footer
 */
export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--color-bg)" }}>
      {/* Sticky Frosted Glass Navigation */}
      <MarketingNavbar />

      {/* Main Page Flow */}
      <main className="flex-1">
        <HeroSection />
        <StatsBanner />
        <FeaturesSection />
        <InteractiveMatchDemo />
        <HowItWorksSection />
        <HeroParallaxShowcase />
        <TestimonialsSection />
        <FaqSection />
        <CtaSection />
      </main>

      {/* Brand Bookend Footer */}
      <SiteFooter />
    </div>
  );
}
