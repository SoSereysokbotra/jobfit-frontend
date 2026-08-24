"use client";

import React, { useState } from "react";
import {
  HelpCircle,
  Search,
  ChevronDown,
  Mail,
  MessageSquare,
  Sparkles,
  BookOpen,
  Send,
} from "lucide-react";
import { toast } from "@/stores/toast-store";
import { Reveal } from "@/shared/components/motion/reveal";

interface FaqItem {
  question: string;
  answer: string;
  category: "matching" | "resume" | "account" | "general";
}

const FAQS: FaqItem[] = [
  {
    category: "matching",
    question: "How is my match score calculated for each job?",
    answer:
      "Your match score is computed deterministically by comparing your extracted skills and profile criteria (experience level, location preferences, salary expectation) against the job requirements using embedding cosine similarity and rule-based scoring.",
  },
  {
    category: "resume",
    question: "What is an ATS score and how can I improve it?",
    answer:
      "The ATS (Applicant Tracking System) score evaluates how well your resume matches standard formatting, keyword presence, and section structure. To improve it, ensure relevant technical keywords are clearly listed, use clean headings, and detail your measurable impact.",
  },
  {
    category: "matching",
    question: "How do I compare multiple jobs side-by-side?",
    answer:
      "When browsing jobs on the Search page, click 'Compare' on up to 3 jobs. A docked comparison bar will appear at the bottom of the screen. Click 'Compare Now' to view a full side-by-side breakdown highlighting top benefits and match factors.",
  },
  {
    category: "account",
    question: "How do I switch between Light, Dark, or System themes?",
    answer:
      "Click the Sun/Moon icon in the top navigation bar, or navigate to Settings → Appearance to choose your preferred theme mode.",
  },
  {
    category: "general",
    question: "How do I use keyboard shortcuts?",
    answer:
      "Press ⌘K (Mac) or Ctrl+K (Windows/Linux) anytime to open the global Command Palette for quick search and navigation. On the recommendations swipe deck, use the Left Arrow (←) and Right Arrow (→) to review matches.",
  },
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Feedback form state
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [feedbackType, setFeedbackType] = useState<"feedback" | "bug" | "question">("feedback");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredFaqs = FAQS.filter((faq) => {
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory;
    const matchesQuery =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error("Please enter a message before submitting.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubject("");
      setMessage("");
      toast.success("Thank you for your feedback! Our support team will review it shortly.");
    }, 600);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 min-h-full" style={{ background: "var(--color-bg-secondary)" }}>
      {/* ── HEADER ────────────────────────────────────────── */}
      <Reveal variant="fade" delay={0}>
        <div
          className="rounded-2xl p-6 sm:p-8 relative overflow-hidden text-center max-w-4xl mx-auto"
          style={{
            background: "linear-gradient(135deg, var(--color-primary-900) 0%, var(--color-primary-700) 100%)",
          }}
        >
          <div
            className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center"
            style={{ background: "var(--color-primary-800)", color: "var(--color-text-on-primary)" }}
          >
            <HelpCircle size={24} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-on-primary tracking-tight">
            How can we help you?
          </h1>
          <p className="text-sm text-on-primary-muted mt-2 max-w-md mx-auto">
            Find answers to frequently asked questions, learn how JobFits matching works, or submit feedback to our team.
          </p>

          {/* Search Box */}
          <div className="mt-6 max-w-lg mx-auto relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2"
              style={{ color: "var(--color-text-tertiary)" }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search help articles, topics, FAQs…"
              className="w-full pl-11 pr-4 py-3 rounded-xl text-sm border outline-none shadow-sm transition-all focus:ring-2 focus:ring-primary-400"
              style={{
                background: "var(--color-card)",
                borderColor: "var(--color-border)",
                color: "var(--color-text-primary)",
              }}
            />
          </div>
        </div>
      </Reveal>

      {/* ── QUICK CARDS ───────────────────────────────────── */}
      <Reveal variant="up" delay={80}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          <div
            className="p-5 rounded-xl border flex items-start gap-4 transition-all hover:shadow-md"
            style={{ background: "var(--color-card)", borderColor: "var(--color-border)" }}
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "var(--color-primary-50)", color: "var(--color-primary-600)" }}
            >
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>
                Match Scoring Guide
              </h3>
              <p className="text-xs mt-1" style={{ color: "var(--color-text-secondary)" }}>
                Learn how skill embeddings and rules determine your role compatibility.
              </p>
            </div>
          </div>

          <div
            className="p-5 rounded-xl border flex items-start gap-4 transition-all hover:shadow-md"
            style={{ background: "var(--color-card)", borderColor: "var(--color-border)" }}
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "var(--color-info-50)", color: "var(--color-info-600)" }}
            >
              <BookOpen size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>
                Resume Optimization
              </h3>
              <p className="text-xs mt-1" style={{ color: "var(--color-text-secondary)" }}>
                Best practices for passing ATS filters and improving visibility.
              </p>
            </div>
          </div>

          <div
            className="p-5 rounded-xl border flex items-start gap-4 transition-all hover:shadow-md"
            style={{ background: "var(--color-card)", borderColor: "var(--color-border)" }}
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "var(--color-success-50)", color: "var(--color-success-600)" }}
            >
              <MessageSquare size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>
                Community & Support
              </h3>
              <p className="text-xs mt-1" style={{ color: "var(--color-text-secondary)" }}>
                Connect with our team for account or technical inquiries.
              </p>
            </div>
          </div>
        </div>
      </Reveal>

      {/* ── FAQS & FEEDBACK 2-COLUMN ──────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {/* FAQS (2/3) */}
        <div className="lg:col-span-2 space-y-4">
          <Reveal variant="up" delay={120}>
            <div
              className="p-6 rounded-xl border space-y-4"
              style={{ background: "var(--color-card)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h2 className="text-base font-bold" style={{ color: "var(--color-text-primary)" }}>
                  Frequently Asked Questions
                </h2>
                {/* Filter tabs */}
                <div className="flex rounded-md border overflow-hidden text-xs" style={{ borderColor: "var(--color-border)" }}>
                  {["all", "matching", "resume", "account"].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className="px-2.5 py-1 font-semibold capitalize transition-colors"
                      style={{
                        background: selectedCategory === cat ? "var(--color-primary-50)" : "transparent",
                        color: selectedCategory === cat ? "var(--color-primary-600)" : "var(--color-text-secondary)",
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {filteredFaqs.length === 0 ? (
                <p className="py-8 text-xs text-center" style={{ color: "var(--color-text-tertiary)" }}>
                  No FAQs matched your search.
                </p>
              ) : (
                <div className="divide-y" style={{ borderColor: "var(--color-neutral-100)" }}>
                  {filteredFaqs.map((faq, idx) => {
                    const isOpen = openFaq === idx;
                    return (
                      <div key={idx} className="py-3.5">
                        <button
                          onClick={() => setOpenFaq(isOpen ? null : idx)}
                          className="w-full flex items-center justify-between gap-3 text-left group"
                        >
                          <span
                            className="text-sm font-semibold transition-colors group-hover:text-primary-600"
                            style={{ color: "var(--color-text-primary)" }}
                          >
                            {faq.question}
                          </span>
                          <ChevronDown
                            size={16}
                            className={`shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180 text-primary-600" : "text-neutral-400"}`}
                          />
                        </button>
                        {isOpen && (
                          <p className="text-xs leading-relaxed mt-2.5" style={{ color: "var(--color-text-secondary)" }}>
                            {faq.answer}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Reveal>
        </div>

        {/* FEEDBACK FORM (1/3) */}
        <div>
          <Reveal variant="up" delay={160}>
            <div
              className="p-6 rounded-xl border space-y-4"
              style={{ background: "var(--color-card)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
            >
              <div className="flex items-center gap-2">
                <Mail size={18} style={{ color: "var(--color-primary-600)" }} />
                <h2 className="text-base font-bold" style={{ color: "var(--color-text-primary)" }}>
                  Send Feedback
                </h2>
              </div>
              <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                Have a suggestion or encountered an issue? Let us know!
              </p>

              <form onSubmit={handleSubmitFeedback} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold block mb-1" style={{ color: "var(--color-text-secondary)" }}>
                    Type
                  </label>
                  <select
                    value={feedbackType}
                    onChange={(e) => setFeedbackType(e.target.value as "feedback" | "bug" | "question")}
                    className="w-full px-3 py-2 rounded-lg border text-xs outline-none"
                    style={{
                      background: "var(--color-bg)",
                      borderColor: "var(--color-border)",
                      color: "var(--color-text-primary)",
                    }}
                  >
                    <option value="feedback">General Feedback</option>
                    <option value="bug">Report a Bug</option>
                    <option value="question">Question</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold block mb-1" style={{ color: "var(--color-text-secondary)" }}>
                    Subject
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Brief summary…"
                    className="w-full px-3 py-2 rounded-lg border text-xs outline-none"
                    style={{
                      background: "var(--color-bg)",
                      borderColor: "var(--color-border)",
                      color: "var(--color-text-primary)",
                    }}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold block mb-1" style={{ color: "var(--color-text-secondary)" }}>
                    Message
                  </label>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your feedback or question in detail…"
                    className="w-full px-3 py-2 rounded-lg border text-xs outline-none resize-none"
                    style={{
                      background: "var(--color-bg)",
                      borderColor: "var(--color-border)",
                      color: "var(--color-text-primary)",
                    }}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 transition-all duration-200 active:scale-95 disabled:opacity-50"
                >
                  <Send size={13} />
                  {isSubmitting ? "Sending…" : "Submit Feedback"}
                </button>
              </form>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
