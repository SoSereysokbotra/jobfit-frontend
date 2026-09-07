import {
  HeroSection,
  HeroParallaxShowcase,
  FeaturesSection,
  HowItWorksSection,
  CtaSection,
  SiteFooter,
} from "@/features/marketing/components";

/* JobFits landing page — hero → parallax showcase → features → how it works → CTA → footer. */
export default function LandingPage() {
  return (
    <main style={{ background: "var(--color-bg-secondary)" }}>
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <HeroParallaxShowcase />
      <CtaSection />
      <SiteFooter />
    </main>
  );
}
