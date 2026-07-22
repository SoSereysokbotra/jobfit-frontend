import React from "react";
import Link from "next/link";
import {
  Sparkles, ArrowRight, ChevronRight, Briefcase, Calendar, Star,
  MapPin, DollarSign,
} from "lucide-react";
import MatchScoreBadge from "@/shared/components/data-display/match-score-badge";
import { Reveal } from "@/shared/components/motion/reveal";
import { LogoMarquee, type MarqueeLogo } from "./logo-marquee";

const NAV_LINKS = [
  { label: "Find Jobs", href: "/jobs" },
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
];

/* Auto-scrolling platform logos shown above the product preview. */
const PLATFORM_LOGOS: MarqueeLogo[] = [
  { src: "/linkedin.png", label: "LinkedIn" },
  { src: "/slack.png", label: "Slack" },
  { src: "/telegram.png", label: "Telegram" },
  { src: "/communication.png", label: "Facebook" },
  { src: "/unnamed.png", label: "Khmer24" },
  { src: "/Indeed-wordmark.webp" },
];

const PREVIEW_STATS = [
  { icon: <Briefcase size={15} />, label: "Applications", value: "15" },
  { icon: <Calendar size={15} />, label: "Interviews", value: "2" },
  { icon: <Star size={15} />, label: "New Matches", value: "20" },
];

const PREVIEW_JOBS = [
  { logo: "S", logoBg: "var(--color-primary-700)", title: "Senior Frontend Engineer", company: "Stripe · San Francisco, CA", salary: "$165K – $210K", match: 94 },
  { logo: "N", logoBg: "var(--color-primary-800)", title: "Machine Learning Engineer", company: "Nexus AI · Seattle, WA", salary: "$175K – $230K", match: 88 },
  { logo: "A", logoBg: "var(--color-info-600)", title: "React Specialist Developer", company: "Airbnb · Remote (US)", salary: "$150K – $195K", match: 89 },
  { logo: "F", logoBg: "var(--color-neutral-800)", title: "Software Engineer – Platforms", company: "Figma · New York, NY", salary: "$140K – $185K", match: 85 },
];

/**
 * Landing-page hero — clean, centered layout: announcement pill, oversized
 * headline, dual CTAs, trusted-by strip, and a cropped product preview panel.
 */
export function HeroSection() {
  return (
    <section className="relative overflow-hidden" style={{ background: "var(--color-bg)" }}>
      {/* Soft brand tint behind the headline */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 rounded-full opacity-40 pointer-events-none"
        style={{ background: "var(--color-primary-50)", filter: "blur(90px)" }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">

        {/* ── NAV ─────────────────────────────────────────── */}
        <nav className="flex items-center justify-between py-5">
          <Link href="/" className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt="JobFits Logo"
              className="w-9 h-9 rounded-lg object-contain p-1 border"
              style={{ borderColor: "var(--color-border)", background: "var(--color-bg-secondary)" }}
            />
            <span className="text-lg font-extrabold tracking-tight" style={{ color: "var(--color-primary-900)" }}>
              JobFits
            </span>
          </Link>

          {/* Center links (desktop) */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="px-3.5 py-2 rounded-md text-sm font-medium transition-colors hover:bg-neutral-50"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden sm:inline-flex px-4 py-2 rounded-md text-sm font-semibold transition-colors hover:bg-neutral-50"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Log In
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 rounded-md text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 transition-all duration-200 active:scale-[0.98]"
            >
              Get Started
            </Link>
          </div>
        </nav>

        {/* ── CENTERED HERO BODY ──────────────────────────── */}
        <div className="flex flex-col items-center text-center pt-12 lg:pt-16">

          {/* Headline */}
          <Reveal
            as="h1"
            delay={80}
            className="mt-8 text-5xl sm:text-6xl font-extrabold tracking-tight leading-tight max-w-4xl"
            style={{ color: "var(--color-text-primary)" }}
          >
            The smartest way to find
            <br className="hidden sm:block" />{" "}
            a job that{" "}
            <span className="text-gradient-animated">truly fits</span>
          </Reveal>

          {/* Subheadline */}
          <Reveal
            as="p"
            delay={200}
            className="mt-6 text-lg leading-relaxed max-w-3xl"
            style={{ color: "var(--color-text-secondary)" }}
          >
            JobFits analyzes your resume against 12,000+ live roles from 500+ hiring
            companies and scores every match — skills, experience, salary, and location —
            so you apply where you&apos;ll actually win. Upload once, get matched instantly.
          </Reveal>

          {/* CTAs */}
          <Reveal delay={320} className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/signup"
              className="px-6 py-3 rounded-md text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] inline-flex items-center gap-2 group"
            >
              Get Started Free <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
            <Link
              href="/jobs"
              className="px-6 py-3 rounded-md text-sm font-bold border transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] hover:bg-neutral-50"
              style={{
                borderColor: "var(--color-border)",
                color: "var(--color-text-primary)",
                background: "var(--color-bg)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              Browse Jobs
            </Link>
          </Reveal>

          {/* Trusted-by marquee (auto-scrolling platform logos) */}
          <Reveal delay={440} variant="fade" className="mt-12 w-full max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-disabled)" }}>
              Aggregating jobs from the platforms you know
            </p>
            <LogoMarquee logos={PLATFORM_LOGOS} className="mt-5" />
          </Reveal>

          {/* ── PRODUCT PREVIEW (cropped at section bottom) ── */}
          <Reveal variant="scale" delay={120} className="relative w-full max-w-4xl mt-24 pb-20">
            {/* Back panel peeking behind */}
            <div
              className="absolute -right-10 top-10 hidden lg:block w-72 h-96 rounded-xl border rotate-2"
              style={{
                background: "var(--color-card)",
                borderColor: "var(--color-border)",
                boxShadow: "var(--shadow-lg)",
              }}
            />

            {/* Browser window frame */}
            <div
              className="relative rounded-xl border overflow-hidden text-left hover-lift"
              style={{
                background: "var(--color-card)",
                borderColor: "var(--color-border)",
                boxShadow: "var(--shadow-xl)",
              }}
            >
              {/* Window bar */}
              <div
                className="flex items-center gap-3 px-4 py-5 border-b"
                style={{ background: "var(--color-bg-secondary)", borderColor: "var(--color-border)" }}
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--color-error-500)" }} />
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--color-warning-500)" }} />
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--color-success-500)" }} />
                </div>
                <div
                  className="flex-1 max-w-xs mx-auto text-center text-xs px-3 py-1 rounded-md border"
                  style={{ background: "var(--color-bg)", borderColor: "var(--color-border)", color: "var(--color-text-tertiary)" }}
                >
                  jobfits.co/dashboard
                </div>
                <div className="w-12" />
              </div>

              {/* Mini dashboard preview */}
              <div className="p-5 sm:p-6" style={{ background: "var(--color-bg-secondary)" }}>
                {/* Stat tiles */}
                <div className="grid grid-cols-3 gap-3">
                  {PREVIEW_STATS.map((s) => (
                    <div
                      key={s.label}
                      className="rounded-lg border p-3 flex items-center gap-3"
                      style={{ background: "var(--color-card)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
                    >
                      <div
                        className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
                        style={{ background: "var(--color-primary-50)", color: "var(--color-primary-600)" }}
                      >
                        {s.icon}
                      </div>
                      <div className="min-w-0">
                        <p className="text-lg font-extrabold leading-none" style={{ color: "var(--color-text-primary)" }}>{s.value}</p>
                        <p className="text-xs mt-1 truncate" style={{ color: "var(--color-text-tertiary)" }}>{s.label}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Job match rows */}
                <div
                  className="mt-4 rounded-lg border divide-y overflow-hidden"
                  style={{ background: "var(--color-card)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
                >
                  {PREVIEW_JOBS.map((job) => (
                    <div key={job.title} className="flex items-center gap-4 px-4 py-4">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-extrabold text-sm shrink-0"
                        style={{ background: job.logoBg }}
                      >
                        {job.logo}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate" style={{ color: "var(--color-text-primary)" }}>{job.title}</p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                          <span className="flex items-center gap-1 text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                            <MapPin size={11} /> {job.company}
                          </span>
                          <span className="flex items-center gap-1 text-xs font-medium" style={{ color: "var(--color-success-600)" }}>
                            <DollarSign size={11} /> {job.salary}
                          </span>
                        </div>
                      </div>
                      <MatchScoreBadge score={job.match} size="sm" className="shrink-0" />
                      <span
                        className="hidden sm:inline-flex px-3 py-1.5 rounded-md text-xs font-bold text-white bg-primary-600"
                      >
                        Apply
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
