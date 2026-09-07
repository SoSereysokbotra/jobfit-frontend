"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, Github, Linkedin, Twitter, Mail, Sparkles } from "lucide-react";
import { useTranslation } from "@/providers/locale-provider";

const FOOTER_COLUMNS = [
  {
    heading: "Platform",
    links: [
      { label: "Search Jobs", href: "/jobs" },
      { label: "Core Features", href: "#features" },
      { label: "Match Simulator", href: "#simulator" },
      { label: "Pricing & Plans", href: "/pricing" },
      { label: "Design System", href: "/ui-reference" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "ATS Resume Checker", href: "/resumes" },
      { label: "Market Salary Intel", href: "/jobs" },
      { label: "Interview Prep Coach", href: "#features" },
      { label: "Career Insights", href: "/about" },
      { label: "Candidate FAQ", href: "#faq" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About JobFits", href: "/about" },
      { label: "Careers", href: "/jobs" },
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
    ],
  },
  {
    heading: "For Employers",
    links: [
      { label: "Post a Job", href: "/employer/register" },
      { label: "Employer Portal", href: "/employer/login" },
      { label: "Candidate Search", href: "/employer/register" },
    ],
  },
];

export function SiteFooter() {
  const { t } = useTranslation();
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="relative border-t border-primary-800/40 text-white overflow-hidden" style={{ background: "var(--color-primary-900)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        {/* Top Brand & Newsletter Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-14 border-b border-white/10">
          {/* Brand Col (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <Image
                src="/logo.png"
                alt="JobFits Logo"
                width={36}
                height={36}
                className="w-9 h-9 rounded-full object-contain ring-1 ring-white/20"
              />
              <span className="text-xl font-black tracking-tight text-white">JobFits</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-primary-300 border border-white/15">
                AI 2.0
              </span>
            </Link>

            <p className="text-sm text-white/70 max-w-sm leading-relaxed">
              The intelligent tech career platform with transparent 0–100% match scores, instant ATS resume validation, and verified salary intelligence.
            </p>

            {/* System Status Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/5 border border-white/10 text-white/80">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>All matching engines operational · 99.98% Uptime</span>
            </div>
          </div>

          {/* Newsletter Box (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-center p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary-300 mb-1">
              <Sparkles size={14} /> Weekly Curated Tech Roles
            </div>
            <h4 className="text-base sm:text-lg font-bold text-white">
              Get notified when high-affinity roles in your stack drop
            </h4>
            <p className="text-xs text-white/60 mt-1 mb-4">
              Zero recruiter spam. Only verified roles scored 85%+ against your target skills.
            </p>

            {subscribed ? (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 size={15} />
                You&apos;re subscribed! We&apos;ll notify you when high-match roles appear.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  required
                  placeholder="name@workemail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-1 focus:ring-primary-400"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-white text-[#240046] hover:bg-neutral-100 transition-colors shrink-0"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Links Navigation Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-8 py-12 border-b border-white/10">
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.heading}>
              <h5 className="text-xs font-black uppercase tracking-wider text-primary-300 mb-4">
                {col.heading}
              </h5>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-xs sm:text-sm text-white/70 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Legal & Socials Row */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/60">
          <p>© {new Date().getFullYear()} JobFits Inc. {t("marketing.copyright") || "All rights reserved."}</p>

          <div className="flex items-center gap-4">
            <Link href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors p-1" aria-label="GitHub">
              <Github size={16} />
            </Link>
            <Link href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors p-1" aria-label="Twitter">
              <Twitter size={16} />
            </Link>
            <Link href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors p-1" aria-label="LinkedIn">
              <Linkedin size={16} />
            </Link>
            <Link href="/about" className="hover:text-white transition-colors p-1" aria-label="Email support">
              <Mail size={16} />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
