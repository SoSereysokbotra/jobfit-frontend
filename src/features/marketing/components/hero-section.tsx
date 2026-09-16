"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Reveal } from "@/shared/components/motion/reveal";
import { LogoMarquee, type MarqueeLogo } from "./logo-marquee";
import { HeroMatchPreview } from "./hero-match-preview";
import { useTranslation } from "@/providers/locale-provider";

/* Auto-scrolling platform logos shown under the product preview. */
const PLATFORM_LOGOS: MarqueeLogo[] = [
  { src: "/linkedin.png", label: "LinkedIn" },
  { src: "/slack.png", label: "Slack" },
  { src: "/telegram.png", label: "Telegram" },
  { src: "/communication.png", label: "Facebook" },
  // These two ship as wordmarks on an opaque plate rather than transparent
  // square icons, so they render as chips without a duplicate text label.
  { src: "/unnamed.png", label: "Khmer24", wordmark: true },
  { src: "/Indeed-wordmark.webp", label: "Indeed", wordmark: true },
];

/**
 * Landing-page hero — centered announcement pill, oversized headline, dual
 * CTAs, an illustrative match card, and the trusted-by platform strip.
 *
 * The section is deliberately *not* pinned to 100dvh any more: with only
 * copy in it, `min-h-[100dvh]` + `justify-between` opened a ~360px gap
 * between the buttons and the logo strip. It now sizes to its content, with
 * the preview card carrying the fold.
 */
export function HeroSection() {
  const { t } = useTranslation();

  return (
    <section
      className="relative overflow-hidden"
      style={{ background: "var(--color-bg)" }}
    >
      {/* Background glow */}
      <div
        className="absolute -top-24 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 rounded-full opacity-70 pointer-events-none"
        style={{ background: "var(--color-primary-100)", filter: "blur(100px)" }}
      />

      <div className="relative z-10 max-w-7xl w-full mx-auto px-6 lg:px-8 pt-12 pb-14 sm:pt-16 lg:pt-20 lg:pb-20 flex flex-col items-center text-center">
        {/* Announcement pill */}
        <Reveal variant="fade">
          {/* primary-700 on the translucent dark primary-50 is too dim to
              read in dark mode, hence the lighter dark: text. */}
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border bg-primary-50 border-primary-200 text-primary-700 dark:text-primary-300"
          >
            <Sparkles size={12} /> AI matching with a transparent score
          </span>
        </Reveal>

        {/* Headline */}
        <Reveal
          as="h1"
          delay={80}
          className="mt-5 text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-tight max-w-4xl"
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
          delay={160}
          className="mt-5 text-base sm:text-lg md:text-xl leading-relaxed max-w-2xl"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {t("marketing.heroSubtitle")}
        </Reveal>

        {/* CTAs */}
        <Reveal delay={240} className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/signup"
            className="px-6 py-3 rounded-md text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] inline-flex items-center gap-2 group"
          >
            {t("marketing.ctaButton")}{" "}
            <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
          <Link
            href="/jobs"
            className="px-6 py-3 rounded-md text-sm font-bold border transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] hover:bg-surface-hover"
            style={{
              borderColor: "var(--color-border)",
              color: "var(--color-text-primary)",
              background: "var(--color-bg)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            {t("marketing.exploreJobs")}
          </Link>
        </Reveal>

        <p className="mt-4 text-xs" style={{ color: "var(--color-text-tertiary)" }}>
          No credit card required · Free for job seekers
        </p>

        {/* Product preview — carries the fold in place of empty space. */}
        <Reveal delay={320} variant="scale" className="mt-12 w-full flex justify-center">
          <HeroMatchPreview />
        </Reveal>
      </div>

      {/* ── TRUSTED-BY PLATFORMS STRIP ──────────────────── */}
      <div className="relative z-10 max-w-7xl w-full mx-auto px-6 lg:px-8 pb-12 lg:pb-16 flex flex-col items-center text-center">
        <Reveal delay={120} variant="fade" className="w-full max-w-4xl">
          <p
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            Aggregating jobs from the platforms you know
          </p>
          <LogoMarquee logos={PLATFORM_LOGOS} className="mt-5" />
        </Reveal>
      </div>
    </section>
  );
}
