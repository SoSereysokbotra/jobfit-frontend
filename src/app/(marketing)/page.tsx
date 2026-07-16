import {
  HeroSection,
  FeaturesSection,
  HowItWorksSection,
  CtaSection,
  SiteFooter,
} from "@/features/marketing/components";

/* JobFits landing page — hero → features → how it works → social proof → CTA → footer. */
export default function LandingPage() {
  return (
    <main style={{ background: "var(--color-bg-secondary)" }}>
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <CtaSection />
      <SiteFooter />
    </main>
  );
}
