import React from "react";
import Link from "next/link";
import {
  Sparkles,
  Target,
  Users,
  ShieldCheck,
  Zap,
  Brain,
  ArrowRight,
  CheckCircle2,
  Briefcase,
} from "lucide-react";
import { SiteFooter } from "@/features/marketing/components";
import { Reveal } from "@/shared/components/motion/reveal";

export const metadata = {
  title: "About Us | JobFits AI Job Matching Platform",
  description:
    "Learn about JobFits - our mission, vision, AI matching technology, and how we are empowering job seekers and hiring teams worldwide.",
};

const VALUES = [
  {
    icon: Target,
    title: "Precision Matching",
    description:
      "We replace fuzzy keyword searches with multidimensional semantic fit algorithms, ensuring candidates and roles align on real requirements.",
  },
  {
    icon: ShieldCheck,
    title: "Radical Transparency",
    description:
      "Every candidate sees exactly why they matched with a role, what skills they have, and clear steps to bridge any identified skill gaps.",
  },
  {
    icon: Brain,
    title: "Skills-First Hiring",
    description:
      "We believe capability matters more than pedigree. Our evaluation spotlights verified skills, accomplishments, and demonstrated potential.",
  },
  {
    icon: Users,
    title: "Candidate Empowerment",
    description:
      "We build tools that advocate for the job seeker—from automated resume parsing to real-time salary insights and application funnel analytics.",
  },
];

const STATS = [
  { value: "94%", label: "Match Precision Rate" },
  { value: "10,000+", label: "Successful Placements" },
  { value: "500+", label: "Top Hiring Companies" },
  { value: "3.5x", label: "Faster Time-to-Offer" },
];

const TEAM = [
  {
    name: "Alex Rivera",
    role: "Co-Founder & CEO",
    bio: "Former Head of Talent Operations with 12+ years building high-growth recruitment platforms.",
    initials: "AR",
  },
  {
    name: "Dr. Maya Chen",
    role: "Co-Founder & Chief AI Officer",
    bio: "PhD in NLP from Stanford. Pioneer in semantic embedding models and fair algorithmic matching.",
    initials: "MC",
  },
  {
    name: "David Kim",
    role: "VP of Product & Engineering",
    bio: "Ex-Staff Engineer at modern SaaS scale-ups; obsessed with high-performance candidate UX.",
    initials: "DK",
  },
  {
    name: "Elena Rostova",
    role: "Head of Employer Success",
    bio: "Dedicated to helping hiring teams build diverse, high-performing organizations without bias.",
    initials: "ER",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--color-bg-secondary)" }}>
      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden pt-20 pb-16 lg:pt-28 lg:pb-24 border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <Reveal>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-6 bg-primary-50 text-primary-700 border border-primary-200">
              <Sparkles size={14} className="text-primary-600" />
              <span>Our Story & Mission</span>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto"
              style={{ color: "var(--color-text-primary)" }}
            >
              Transforming Job Discovery with{" "}
              <span className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                Intelligent Precision
              </span>
            </h1>
          </Reveal>

          <Reveal delay={200}>
            <p
              className="mt-6 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed"
              style={{ color: "var(--color-text-secondary)" }}
            >
              JobFits was founded on a simple truth: traditional job boards are broken. We
              combine deep AI semantic matching, skill-gap analysis, and transparent compensation
              to connect talent with dream careers.
            </p>
          </Reveal>

          <Reveal delay={300}>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/jobs"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold text-white shadow-md transition-transform active:scale-[0.98]"
                style={{
                  background: "linear-gradient(135deg, var(--color-primary-700), var(--color-primary-500))",
                }}
              >
                <Briefcase size={16} />
                <span>Explore Opportunities</span>
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/employer/jobs/new"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold border border-border bg-card text-content hover:bg-card-hover transition-colors"
              >
                <span>For Employers</span>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Impact Stats Banner ── */}
      <section className="py-12 border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            {STATS.map((stat, idx) => (
              <Reveal key={stat.label} delay={idx * 100}>
                <div className="p-4">
                  <div
                    className="text-3xl sm:text-4xl font-extrabold"
                    style={{ color: "var(--color-primary-600)" }}
                  >
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm font-medium mt-1 text-content-secondary">
                    {stat.label}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Core Values & Philosophy ── */}
      <section className="py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2
            className="text-2xl sm:text-3xl font-extrabold tracking-tight"
            style={{ color: "var(--color-text-primary)" }}
          >
            What Sets Us Apart
          </h2>
          <p className="text-sm sm:text-base mt-2 text-content-secondary">
            Built on core principles that prioritize human potential and algorithmic fairness.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {VALUES.map((val, idx) => {
            const Icon = val.icon;
            return (
              <Reveal key={val.title} delay={idx * 100}>
                <div
                  className="p-6 sm:p-8 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-primary-50 text-primary-600 mb-5">
                    <Icon size={24} />
                  </div>
                  <h3
                    className="text-lg font-bold mb-2"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {val.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-content-secondary">
                    {val.description}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ── How the Technology Works ── */}
      <section className="py-20 border-y border-border bg-card">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary-50 text-primary-700 border border-primary-200 mb-4">
                <Brain size={14} />
                <span>Next-Gen Match Engine</span>
              </div>
              <h2
                className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight"
                style={{ color: "var(--color-text-primary)" }}
              >
                Going beyond keyword searches to evaluate real career compatibility
              </h2>
              <p className="mt-4 text-sm sm:text-base text-content-secondary leading-relaxed">
                Most platforms rank candidates on keyword frequency. JobFits builds multidimensional
                profiles evaluating technical competencies, role domain, seniority, and career
                trajectory.
              </p>

              <div className="mt-6 space-y-3">
                {[
                  "Semantic resume parsing across 2,000+ industry skill ontologies",
                  "Automated skill-gap radar charts with recommended learning pathways",
                  "Objective match score percentages backed by explainable breakdowns",
                  "Side-by-side job comparisons highlighting compensation and growth",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle2 size={18} className="text-success-600 mt-0.5 shrink-0" />
                    <span className="text-sm text-content">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="p-8 rounded-2xl border border-border"
              style={{
                background: "linear-gradient(135deg, var(--color-primary-900), var(--color-primary-800))",
              }}
            >
              <div className="space-y-4 text-white">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center text-primary-300 font-bold">
                      <Zap size={20} />
                    </div>
                    <div>
                      <div className="text-sm font-bold">AI Match Diagnostic</div>
                      <div className="text-xs text-white/60">Live Compatibility Engine</div>
                    </div>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                    95% Match
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-white/80">
                    <span>Skill Overlap</span>
                    <span className="font-semibold text-white">92%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full bg-primary-400 rounded-full" style={{ width: "92%" }} />
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-white/80">
                    <span>Experience Level Fit</span>
                    <span className="font-semibold text-white">100%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: "100%" }} />
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-white/80">
                    <span>Compensation Alignment</span>
                    <span className="font-semibold text-white">94%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full bg-primary-400 rounded-full" style={{ width: "94%" }} />
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-white/60 italic">
                  &ldquo;JobFits helped our team cut screening time by 65% while increasing candidate quality.&rdquo;
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Leadership Team ── */}
      <section className="py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2
            className="text-2xl sm:text-3xl font-extrabold tracking-tight"
            style={{ color: "var(--color-text-primary)" }}
          >
            Meet the Team
          </h2>
          <p className="text-sm sm:text-base mt-2 text-content-secondary">
            Engineers, recruiters, and data scientists dedicated to building the future of hiring.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TEAM.map((member, idx) => (
            <Reveal key={member.name} delay={idx * 100}>
              <div className="p-6 rounded-xl border border-border bg-card text-center hover:shadow-md transition-all">
                <div
                  className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center font-bold text-lg text-white"
                  style={{
                    background: "linear-gradient(135deg, var(--color-primary-700), var(--color-primary-500))",
                  }}
                >
                  {member.initials}
                </div>
                <h3 className="font-bold text-sm text-content">{member.name}</h3>
                <p className="text-xs font-medium text-primary-600 mt-0.5">{member.role}</p>
                <p className="text-xs text-content-secondary mt-3 leading-relaxed">{member.bio}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-16 bg-card border-t border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2
            className="text-2xl sm:text-3xl font-extrabold tracking-tight"
            style={{ color: "var(--color-text-primary)" }}
          >
            Ready to find where your skills fit best?
          </h2>
          <p className="text-sm sm:text-base mt-3 text-content-secondary max-w-xl mx-auto">
            Join thousands of professionals finding roles that match their true potential.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/signup"
              className="px-6 py-3 rounded-lg text-sm font-bold text-white shadow-md transition-transform active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, var(--color-primary-700), var(--color-primary-500))",
              }}
            >
              Get Started for Free
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
