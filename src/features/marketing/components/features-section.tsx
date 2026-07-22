import React from "react";
import Link from "next/link";
import {
  Target, FileText, Star, Briefcase, Check, CheckCircle2, Eye,
  Calendar, Award, Upload, ArrowRight, MapPin, type LucideIcon,
} from "lucide-react";
import MatchScoreBadge from "@/shared/components/data-display/match-score-badge";
import { Reveal } from "@/shared/components/motion/reveal";

/* ─── PER-FEATURE MOCKUP VISUALS ─────────────────────────────────
   Branded, token-only "product screenshots". Swap any of these for a
   real image later: <img src="/feature-x.png" ... /> inside the frame. */

function MockCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-xl border p-5 hover-lift"
      style={{ background: "var(--color-card)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-lg)" }}
    >
      {children}
    </div>
  );
}

/** 1 — Transparent match scores: ring + breakdown bars. */
function MatchVisual() {
  const bars = [
    { label: "Skills", score: 95 },
    { label: "Experience", score: 88 },
    { label: "Location", score: 95 },
    { label: "Salary", score: 90 },
  ];
  return (
    <MockCard>
      <div className="flex items-center gap-4">
        <MatchScoreBadge score={94} size="lg" />
        <div>
          <p className="text-base font-bold" style={{ color: "var(--color-text-primary)" }}>Excellent Match</p>
          <p className="text-xs mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>
            Senior Frontend Engineer · Stripe
          </p>
        </div>
      </div>
      <div className="mt-5 space-y-3">
        {bars.map((b) => (
          <div key={b.label} className="flex items-center gap-3">
            <span className="text-xs w-20 shrink-0" style={{ color: "var(--color-text-secondary)" }}>{b.label}</span>
            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "var(--color-neutral-100)" }}>
              <div
                className="h-full rounded-full"
                style={{ width: `${b.score}%`, background: b.score > 85 ? "var(--color-primary-500)" : "var(--color-warning-500)" }}
              />
            </div>
            <span className="text-xs font-bold w-8 text-right shrink-0" style={{ color: "var(--color-primary-600)" }}>{b.score}%</span>
          </div>
        ))}
      </div>
    </MockCard>
  );
}

/** 2 — AI resume analysis: parsed file + extracted skill chips. */
function ResumeVisual() {
  const skills = ["React", "TypeScript", "Node.js", "AWS", "Python", "GraphQL", "Figma"];
  return (
    <MockCard>
      <div
        className="flex items-center gap-3 p-3 rounded-lg border"
        style={{ background: "var(--color-bg-secondary)", borderColor: "var(--color-border)" }}
      >
        <div className="w-9 h-9 rounded-md flex items-center justify-center shrink-0" style={{ background: "var(--color-primary-50)", color: "var(--color-primary-600)" }}>
          <FileText size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: "var(--color-text-primary)" }}>Alex_Rivera_Resume.pdf</p>
          <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>Parsed in 1.4s</p>
        </div>
        <CheckCircle2 size={18} style={{ color: "var(--color-success-500)" }} />
      </div>

      <p className="text-xs font-bold uppercase tracking-wider mt-5 mb-2.5" style={{ color: "var(--color-text-tertiary)" }}>
        Skills detected
      </p>
      <div className="flex flex-wrap gap-2">
        {skills.map((s) => (
          <span
            key={s}
            className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ background: "var(--color-primary-50)", color: "var(--color-primary-700)" }}
          >
            {s}
          </span>
        ))}
      </div>

      <div className="mt-5 pt-4 border-t" style={{ borderColor: "var(--color-neutral-100)" }}>
        <div className="flex justify-between text-xs mb-1.5">
          <span style={{ color: "var(--color-text-secondary)" }}>Profile strength</span>
          <span className="font-bold" style={{ color: "var(--color-primary-600)" }}>92%</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--color-neutral-100)" }}>
          <div className="h-full rounded-full" style={{ width: "92%", background: "var(--color-primary-500)" }} />
        </div>
      </div>
    </MockCard>
  );
}

/** 3 — Smart recommendations: a mini feed of scored roles. */
function RecommendationsVisual() {
  const rows = [
    { logo: "S", bg: "var(--color-primary-700)", title: "Senior Frontend Engineer", company: "Stripe", match: 94 },
    { logo: "N", bg: "var(--color-primary-800)", title: "Machine Learning Engineer", company: "Nexus AI", match: 88 },
    { logo: "A", bg: "var(--color-info-600)", title: "React Specialist", company: "Airbnb", match: 89 },
  ];
  return (
    <MockCard>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>Recommended for you</p>
        <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: "var(--color-primary-600)" }}>
          <Star size={12} className="fill-current" /> 20 new
        </span>
      </div>
      <div className="space-y-2">
        {rows.map((r) => (
          <div
            key={r.title}
            className="flex items-center gap-3 p-2.5 rounded-lg border"
            style={{ borderColor: "var(--color-border)", background: "var(--color-bg-secondary)" }}
          >
            <div className="w-9 h-9 rounded-md flex items-center justify-center text-white font-extrabold text-sm shrink-0" style={{ background: r.bg }}>
              {r.logo}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate" style={{ color: "var(--color-text-primary)" }}>{r.title}</p>
              <p className="text-xs truncate" style={{ color: "var(--color-text-tertiary)" }}>{r.company}</p>
            </div>
            <span className="text-sm font-extrabold shrink-0" style={{ color: "var(--color-primary-600)" }}>{r.match}%</span>
          </div>
        ))}
      </div>
    </MockCard>
  );
}

/** 4 — Application tracking: a status pipeline + application rows. */
function TrackingVisual() {
  const stages = [
    { label: "Applied", icon: <Check size={13} />, done: true },
    { label: "Viewed", icon: <Eye size={13} />, done: true },
    { label: "Interview", icon: <Calendar size={13} />, active: true },
    { label: "Offer", icon: <Award size={13} />, done: false },
  ];
  return (
    <MockCard>
      <p className="text-sm font-bold mb-4" style={{ color: "var(--color-text-primary)" }}>Application pipeline</p>
      <div className="flex items-center">
        {stages.map((s, i) => (
          <React.Fragment key={s.label}>
            <div className="flex flex-col items-center gap-1.5">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{
                  background: s.done ? "var(--color-primary-600)" : s.active ? "var(--color-primary-100)" : "var(--color-neutral-100)",
                  color: s.done ? "var(--color-text-on-primary)" : s.active ? "var(--color-primary-700)" : "var(--color-text-tertiary)",
                  border: s.active ? "2px solid var(--color-primary-500)" : "none",
                }}
              >
                {s.icon}
              </div>
              <span className="text-xs font-medium whitespace-nowrap" style={{ color: s.done || s.active ? "var(--color-primary-600)" : "var(--color-text-tertiary)" }}>
                {s.label}
              </span>
            </div>
            {i < stages.length - 1 && (
              <div className="flex-1 h-0.5 -mt-5" style={{ background: s.done ? "var(--color-primary-500)" : "var(--color-neutral-200)" }} />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="mt-5 space-y-2">
        {[
          { role: "Senior Frontend Engineer", company: "Stripe", status: "Interview", tone: "primary" },
          { role: "Data Scientist", company: "Nexus AI", status: "Offer", tone: "success" },
        ].map((a) => (
          <div
            key={a.role}
            className="flex items-center justify-between gap-3 p-2.5 rounded-lg border"
            style={{ borderColor: "var(--color-border)", background: "var(--color-bg-secondary)" }}
          >
            <div className="min-w-0">
              <p className="text-xs font-bold truncate" style={{ color: "var(--color-text-primary)" }}>{a.role}</p>
              <p className="text-xs truncate" style={{ color: "var(--color-text-tertiary)" }}>{a.company}</p>
            </div>
            <span
              className="text-xs font-bold px-2.5 py-0.5 rounded-full shrink-0"
              style={
                a.tone === "success"
                  ? { background: "var(--color-success-100)", color: "var(--color-success-600)" }
                  : { background: "var(--color-primary-100)", color: "var(--color-primary-700)" }
              }
            >
              {a.status}
            </span>
          </div>
        ))}
      </div>
    </MockCard>
  );
}

/* ─── FEATURE DATA ───────────────────────────────────────────── */
interface Feature {
  num: string;
  eyebrow: string;
  icon: LucideIcon;
  title: string;
  description: string;
  points: string[];
  cta: { label: string; href: string };
  Visual: React.ComponentType;
}

const FEATURES: Feature[] = [
  {
    num: "01",
    eyebrow: "Matching",
    icon: Target,
    title: "See a transparent score on every job",
    description:
      "No more guessing whether a role is worth your time. JobFits scores every listing from 0–100 across skills, experience, salary, and location — and shows you exactly why it fits before you apply.",
    points: [
      "Weighted breakdown for skills, experience, location & pay",
      "Honest skill-gap flags with time-to-learn estimates",
      "Only shown once your profile is complete — no noise",
    ],
    cta: { label: "See how matching works", href: "/signup" },
    Visual: MatchVisual,
  },
  {
    num: "02",
    eyebrow: "Resume AI",
    icon: FileText,
    title: "Upload once, get understood instantly",
    description:
      "Drop in a PDF or DOCX and our AI reads it in seconds — extracting your skills, seniority, and experience to build a living profile that keeps every match accurate.",
    points: [
      "Automatic skill & experience extraction",
      "Profile-strength meter with improvement tips",
      "Re-parses on every update so matches stay fresh",
    ],
    cta: { label: "Analyze my resume", href: "/signup" },
    Visual: ResumeVisual,
  },
  {
    num: "03",
    eyebrow: "Discovery",
    icon: Star,
    title: "A daily feed built around you",
    description:
      "Stop scrolling through hundreds of irrelevant listings. JobFits surfaces a curated set of roles matched to your profile every day, ranked by how well they actually fit.",
    points: [
      "Fresh recommendations refreshed daily",
      "Ranked by real match score, not keywords",
      "Save roles and get alerts when new matches land",
    ],
    cta: { label: "Browse recommendations", href: "/jobs" },
    Visual: RecommendationsVisual,
  },
  {
    num: "04",
    eyebrow: "Pipeline",
    icon: Briefcase,
    title: "Track every application to the offer",
    description:
      "One clear pipeline for your whole search: submitted, viewed, interview, offer. Never lose the thread again — and get AI interview prep for every role you land.",
    points: [
      "Visual status pipeline for each application",
      "Role-specific interview prep, generated for you",
      "Offer tracking with deadlines you won't miss",
    ],
    cta: { label: "Start tracking", href: "/signup" },
    Visual: TrackingVisual,
  },
];

/* ─── FEATURE PANEL (one full-height "page") ─────────────────── */
function FeaturePanel({ feature, index }: { feature: Feature; index: number }) {
  const { num, eyebrow, icon: Icon, title, description, points, cta, Visual } = feature;
  const reverse = index % 2 === 1;
  const bg = index % 2 === 0 ? "var(--color-bg)" : "var(--color-bg-secondary)";

  return (
    <div className="py-16 lg:py-24" style={{ background: bg }}>
      <div className="max-w-7xl mx-auto w-full px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* TEXT */}
          <Reveal variant={reverse ? "right" : "left"} className={reverse ? "lg:order-2" : ""}>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-lg flex items-center justify-center" style={{ background: "var(--color-primary-50)", color: "var(--color-primary-600)" }}>
                <Icon size={20} />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--color-primary-600)" }}>
                {num} · {eyebrow}
              </span>
            </div>

            <h3 className="mt-5 text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight" style={{ color: "var(--color-text-primary)" }}>
              {title}
            </h3>
            <p className="mt-4 text-lg leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
              {description}
            </p>

            <ul className="mt-6 space-y-3">
              {points.map((p) => (
                <li key={p} className="flex items-start gap-2.5">
                  <CheckCircle2 size={18} className="shrink-0 mt-0.5" style={{ color: "var(--color-success-500)" }} />
                  <span className="text-sm" style={{ color: "var(--color-text-primary)" }}>{p}</span>
                </li>
              ))}
            </ul>

            <Link
              href={cta.href}
              className="mt-7 inline-flex items-center gap-1.5 text-sm font-bold transition-colors hover:gap-2.5"
              style={{ color: "var(--color-primary-600)" }}
            >
              {cta.label} <ArrowRight size={15} />
            </Link>
          </Reveal>

          {/* VISUAL */}
          <Reveal variant={reverse ? "left" : "right"} delay={120} className={reverse ? "lg:order-1" : ""}>
            <div className="relative rounded-2xl p-6 sm:p-10" style={{ background: "var(--color-primary-50)" }}>
              {/* Decorative accents */}
              <div className="absolute top-4 right-4 w-24 h-24 rounded-full opacity-60 pointer-events-none" style={{ background: "var(--color-primary-100)" }} />
              <div className="relative">
                <Visual />
              </div>
            </div>
          </Reveal>

        </div>
      </div>
    </div>
  );
}

/* ─── SECTION ROOT ───────────────────────────────────────────── */
export function FeaturesSection() {
  return (
    <section id="features" className="scroll-mt-16">
      {/* Intro */}
      <div className="pt-5 pb-8 lg:pt-24 lg:pb-10 text-center" style={{ background: "var(--color-bg)" }}>
        <Reveal className="max-w-3xl mx-auto px-6 lg:px-8">
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight" style={{ color: "var(--color-text-primary)" }}>
            Everything you need to land the right role
          </h2>
          <p className="mt-4 text-base leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
            Four ways JobFits takes you from resume to offer — scroll through to see each one in action.
          </p>
          <div className="mt-2 flex justify-center gap-2">
            {FEATURES.map((f) => (
              <span key={f.num} className="w-2 h-2 rounded-full" style={{ background: "var(--color-primary-200)" }} />
            ))}
          </div>
        </Reveal>
      </div>

      {/* One full-height panel per feature */}
      {FEATURES.map((feature, i) => (
        <FeaturePanel key={feature.num} feature={feature} index={i} />
      ))}
    </section>
  );
}
