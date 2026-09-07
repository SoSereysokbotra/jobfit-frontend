"use client";

import React from "react";
import Image from "next/image";
import { Star, CheckCircle2, TrendingUp, Sparkles } from "lucide-react";
import { Reveal } from "@/shared/components/motion/reveal";

interface Testimonial {
  name: string;
  role: string;
  company: string;
  avatar: string;
  salaryBump: string;
  matchScore: number;
  content: string;
  highlight: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: "Elena Rostova",
    role: "Senior Frontend Architect",
    company: "Stripe",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
    salaryBump: "+34% Compensation",
    matchScore: 96,
    highlight: "Booked 3 interviews in 9 days",
    content:
      "JobFits was the first platform where I could actually see why a role matched me. The ATS scanner identified 4 critical architectural keywords missing from my resume. After making those tweaks, I booked 3 interviews within 9 days.",
  },
  {
    name: "Marcus Chen",
    role: "Principal AI Infrastructure Lead",
    company: "Datadog",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
    salaryBump: "+$38K Base Salary",
    matchScore: 94,
    highlight: "Transparent compensation intel",
    content:
      "The market compensation radar provided verified offer percentiles that completely changed my negotiation leverage. Knowing the true P75 band for Staff AI roles allowed me to confidently counter-offer and secure $38k higher base pay.",
  },
  {
    name: "Sarah Al-Mansoor",
    role: "Full-Stack Engineer",
    company: "Airbnb",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop",
    salaryBump: "2.5x Faster Land Rate",
    matchScore: 95,
    highlight: "Zero ghost jobs, instant feedback",
    content:
      "No endless scrolling through ghost listings or expired job boards. Every morning, JobFits delivered 3 hyper-targeted roles scored against my exact TypeScript & Next.js background. The AI interview talking points were spot-on.",
  },
];

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-16 sm:py-24 relative overflow-hidden" style={{ background: "var(--color-bg)" }}>
      {/* Soft background glow */}
      <div
        className="absolute top-1/3 right-0 w-96 h-96 rounded-full opacity-20 pointer-events-none"
        style={{
          background: "radial-gradient(circle, var(--color-primary-400) 0%, transparent 70%)",
          filter: "blur(90px)",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <Reveal variant="up">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400 border border-primary-200/60 dark:border-primary-800/40 mb-3">
              <Sparkles size={13} />
              Proven Candidate Outcomes
            </div>
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight"
              style={{ color: "var(--color-text-primary)" }}
            >
              Engineers landing roles{" "}
              <span className="text-gradient-animated">they actually love</span>
            </h2>
            <p
              className="mt-4 text-base sm:text-lg leading-relaxed"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Real candidates who skipped the recruiter black hole, discovered high-match opportunities, and negotiated with confidence.
            </p>
          </Reveal>
        </div>

        {/* 3-Card Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {TESTIMONIALS.map((item, i) => (
            <Reveal key={item.name} delay={i * 120} variant="up">
              <div
                className="h-full flex flex-col justify-between p-6 sm:p-8 rounded-2xl sm:rounded-3xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group"
                style={{
                  background: "var(--color-surface)",
                  borderColor: "var(--color-border)",
                }}
              >
                <div>
                  {/* Top Meta: Match Score + Salary Bump Tag */}
                  <div className="flex items-center justify-between gap-2 pb-5 border-b border-border/60">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-success-50 text-success-600 border border-success-200">
                      <TrendingUp size={12} />
                      {item.salaryBump}
                    </span>
                    <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-primary-50 text-primary-600 border border-primary-200">
                      {item.matchScore}% Match
                    </span>
                  </div>

                  {/* Rating Stars */}
                  <div className="flex items-center gap-1 mt-5 mb-3 text-amber-400">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star key={idx} size={15} fill="currentColor" />
                    ))}
                  </div>

                  {/* Highlight Quote */}
                  <p className="text-sm font-bold text-content mb-2">
                    &ldquo;{item.highlight}&rdquo;
                  </p>

                  {/* Testimonial body */}
                  <p className="text-xs sm:text-sm text-content-secondary leading-relaxed">
                    {item.content}
                  </p>
                </div>

                {/* Author Card Footer */}
                <div className="mt-8 pt-5 border-t border-border/60 flex items-center gap-3">
                  <Image
                    src={item.avatar}
                    alt={item.name}
                    width={44}
                    height={44}
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-primary-500/20"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-bold text-content">{item.name}</h4>
                      <CheckCircle2 size={13} className="text-primary-600" />
                    </div>
                    <p className="text-xs text-content-tertiary">
                      {item.role} · <span className="font-semibold text-content-secondary">{item.company}</span>
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Global Rating Strip */}
        <Reveal variant="scale" delay={300} className="mt-12 sm:mt-16">
          <div
            className="p-6 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left"
            style={{
              background: "var(--color-bg-secondary)",
              borderColor: "var(--color-border)",
            }}
          >
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex items-center gap-1 text-amber-400 text-lg">
                <span className="font-black text-2xl text-content mr-1">4.9</span>
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star key={idx} size={18} fill="currentColor" />
                ))}
              </div>
              <div className="h-8 w-px bg-border hidden sm:block" />
              <div>
                <p className="text-sm font-bold text-content">
                  Over 2,400+ Verified Placements
                </p>
                <p className="text-xs text-content-tertiary">
                  Across tech talent in North America, Europe, and Southeast Asia
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-content-secondary">
              <span className="inline-block w-2 h-2 rounded-full bg-success-500" />
              98.2% Satisfaction Rate
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
