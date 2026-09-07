"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle, MessageSquare } from "lucide-react";
import { Reveal } from "@/shared/components/motion/reveal";
import Link from "next/link";

interface FaqItem {
  question: string;
  answer: string;
  category?: string;
}

const FAQS: FaqItem[] = [
  {
    question: "How does the JobFits Match Score algorithm work?",
    answer:
      "JobFits uses a multi-factor deep semantic model. Rather than simple keyword matching, it evaluates your parsed technical competencies (45%), verified years of experience and level of seniority (30%), and compensation/work-mode preferences (25%) against actual hiring requirements extracted directly from employer job descriptions.",
  },
  {
    question: "Is JobFits completely free for job seekers?",
    answer:
      "Yes, 100%. Candidates can upload their resume, receive unlimited match scoring, browse verified salary market intelligence, and track application pipelines for free. We monetize through employers who pay to reach high-affinity, pre-matched talent.",
  },
  {
    question: "How is JobFits different from LinkedIn or Indeed?",
    answer:
      "Traditional job boards rely on sponsored ads, creating feeds flooded with ghost jobs, recruiter spam, and zero transparency. JobFits calculates a transparent 0–100% score for every single listing, reveals verified salary percentiles before you apply, and checks your resume against ATS filters to eliminate blind applications.",
  },
  {
    question: "What does the Instant ATS Resume Scanner do?",
    answer:
      "When you drop in your PDF or DOCX resume, our parser extracts over 20 structured attributes—including technical frameworks, tooling, years per role, and impact metrics. It tests your formatting against major Applicant Tracking Systems (Workday, Greenhouse, Lever) and suggests keyword improvements to ensure your application reaches human eyes.",
  },
  {
    question: "Will my current employer know I am looking for jobs?",
    answer:
      "Never. Your profile and uploaded materials are strictly confidential. You have total control over your visibility settings, and your resume is never made publicly searchable without your explicit consent.",
  },
  {
    question: "How does JobFits eliminate ghost jobs and expired listings?",
    answer:
      "Our automated pipeline monitors company career portals and API feeds every 15 minutes. Any role that is closed, unfilled for over 45 days without hiring activity, or flagged as a generic talent pool is immediately deprioritized or removed.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex((current) => (current === index ? null : index));
  };

  return (
    <section id="faq" className="py-16 sm:py-24 relative overflow-hidden" style={{ background: "var(--color-bg-secondary)" }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <Reveal variant="up">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400 border border-primary-200/60 dark:border-primary-800/40 mb-3">
              <HelpCircle size={13} />
              Got Questions?
            </div>
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight"
              style={{ color: "var(--color-text-primary)" }}
            >
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-base sm:text-lg leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
              Everything you need to know about our matching engine, privacy, and how JobFits accelerates your tech career.
            </p>
          </Reveal>
        </div>

        <div className="space-y-3.5">
          {FAQS.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <Reveal key={faq.question} delay={i * 60} variant="up">
                <div
                  className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                    isOpen
                      ? "border-primary-500/50 shadow-lg shadow-primary-500/5 bg-surface ring-1 ring-primary-500/20"
                      : "border-border/80 bg-surface hover:border-primary-300/60"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggle(i)}
                    className="w-full text-left px-5 sm:px-7 py-5 flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                    aria-expanded={isOpen}
                  >
                    <span
                      className={`text-base sm:text-lg font-bold transition-colors ${
                        isOpen ? "text-primary-600 dark:text-primary-400" : "text-content"
                      }`}
                    >
                      {faq.question}
                    </span>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                        isOpen
                          ? "rotate-180 bg-primary-100 dark:bg-primary-950/80 text-primary-600 dark:text-primary-400"
                          : "bg-bg-secondary text-content-tertiary"
                      }`}
                    >
                      <ChevronDown size={16} />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 sm:px-7 pb-6 pt-1 text-sm sm:text-base leading-relaxed text-content-secondary border-t border-border/40 animate-fadeIn">
                      {faq.answer}
                    </div>
                  )}
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* Support Callout */}
        <Reveal variant="fade" delay={300} className="mt-12 text-center">
          <div
            className="inline-flex flex-col sm:flex-row items-center gap-3 px-6 py-4 rounded-2xl border bg-surface"
            style={{ borderColor: "var(--color-border)" }}
          >
            <div className="w-9 h-9 rounded-xl bg-primary-100 dark:bg-primary-950 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0">
              <MessageSquare size={18} />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-content">
                Still have unanswered questions?
              </p>
              <p className="text-xs text-content-secondary">
                Reach out to our team anytime — we’re here to help you land your dream role.
              </p>
            </div>
            <Link
              href="/about"
              className="sm:ml-4 px-4 py-2 rounded-xl text-xs font-bold text-primary-600 bg-primary-50 hover:bg-primary-100 dark:bg-primary-950/60 dark:hover:bg-primary-900/60 transition-colors shrink-0"
            >
              Contact Support
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
