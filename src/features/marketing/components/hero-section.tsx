"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/shared/components/motion/reveal";
import { LogoMarquee, type MarqueeLogo } from "./logo-marquee";
import { LanguageSwitcher } from "@/shared/components/ui/language-switcher";
import { ThemeToggle } from "@/shared/components/ui/theme-toggle";
import { useTranslation } from "@/providers/locale-provider";

/* Auto-scrolling platform logos shown above the product preview. */
const PLATFORM_LOGOS: MarqueeLogo[] = [
  { src: "/linkedin.png", label: "LinkedIn" },
  { src: "/slack.png", label: "Slack" },
  { src: "/telegram.png", label: "Telegram" },
  { src: "/communication.png", label: "Facebook" },
  { src: "/unnamed.png", label: "Khmer24" },
  { src: "/Indeed-wordmark.webp" },
];

/**
 * Landing-page hero — clean, centered layout: announcement pill, oversized
 * headline, dual CTAs, and trusted-by platform logos strip.
 */
export function HeroSection() {
  const { t } = useTranslation();

  const navLinks = [
    { label: t("marketing.findJobs"), href: "/jobs" },
    { label: t("marketing.features"), href: "#features" },
    { label: t("marketing.pricing"), href: "/pricing" },
    { label: t("marketing.about"), href: "/about" },
  ];

  return (
    <section
      className="relative overflow-hidden min-h-[100dvh] flex flex-col justify-between"
      style={{ background: "var(--color-bg)" }}
    >
      {/* Background glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 rounded-full opacity-40 pointer-events-none"
        style={{ background: "var(--color-primary-50)", filter: "blur(90px)" }}
      />

      {/* ── TOP NAV ─────────────────────────────────────── */}
      <div className="relative z-10 max-w-7xl w-full mx-auto px-6 lg:px-8 pt-4">
        <nav className="flex items-center justify-between py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt="JobFits Logo"
              className="w-9 h-9 rounded-full object-contain flex-shrink-0"
            />
            <span className="text-lg font-extrabold tracking-tight" style={{ color: "var(--color-text-primary)" }}>
              JobFits
            </span>
          </Link>

          {/* Center links (desktop) */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="px-3.5 py-2 rounded-md text-sm font-medium transition-colors hover:bg-[var(--color-surface-hover)]"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2.5">
            <LanguageSwitcher />
            <ThemeToggle />
            <Link
              href="/login"
              className="hidden sm:inline-flex px-4 py-2 rounded-md text-sm font-semibold transition-colors hover:bg-[var(--color-surface-hover)]"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {t("marketing.login")}
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 rounded-md text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 transition-all duration-200 active:scale-[0.98]"
            >
              {t("marketing.getStarted")}
            </Link>
          </div>
        </nav>
      </div>

      {/* ── CENTERED HERO BODY ──────────────────────────── */}
      <div className="relative z-10 max-w-7xl w-full mx-auto px-6 lg:px-8 flex-1 flex flex-col items-center justify-center text-center py-6 sm:py-10">
        {/* Headline */}
        <Reveal
          as="h1"
          delay={80}
          className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-tight max-w-4xl"
          style={{ color: "var(--color-text-primary)" }}
        >
          {t("marketing.heroTitlePrefix")}
          <br className="hidden sm:block" />{" "}
          {t("marketing.heroTitleMiddle")}{" "}
          <span className="text-gradient-animated">{t("marketing.heroTitleAccent")}</span>
        </Reveal>

        {/* Subheadline */}
        <Reveal
          as="p"
          delay={200}
          className="mt-6 text-base sm:text-lg md:text-xl leading-relaxed max-w-3xl"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {t("marketing.heroSubtitle")}
        </Reveal>

        {/* CTAs */}
        <Reveal delay={320} className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/signup"
            className="px-6 py-3 rounded-md text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] inline-flex items-center gap-2 group"
          >
            {t("marketing.ctaButton")} <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
          <Link
            href="/jobs"
            className="px-6 py-3 rounded-md text-sm font-bold border transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] hover:bg-neutral-50"
            style={{
              borderColor: "var(--color-border)",
              color: "var(--color-text-primary)",
              background: "var(--color-bg)",
              boxShadow: "var(--shadow-sm)"
            }}
          >
            {t("marketing.exploreJobs")}
          </Link>
        </Reveal>
      </div>

      {/* ── TRUSTED-BY PLATFORMS FOOTER ─────────────────── */}
      <div className="relative z-10 max-w-7xl w-full mx-auto px-6 lg:px-8 pb-8 lg:pb-12 flex flex-col items-center text-center">
        <Reveal delay={440} variant="fade" className="w-full max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-disabled)" }}>
            Aggregating jobs from the platforms you know
          </p>
          <LogoMarquee logos={PLATFORM_LOGOS} className="mt-4" />
        </Reveal>
      </div>
    </section>
  );
}
