"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles, CheckCircle2, ShieldCheck, Zap } from "lucide-react";
import { Reveal } from "@/shared/components/motion/reveal";
import { useTranslation } from "@/providers/locale-provider";

export function CtaSection() {
  const { t } = useTranslation();
  const router = useRouter();
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      router.push(`/signup?email=${encodeURIComponent(email.trim())}`);
    } else {
      router.push("/signup");
    }
  };

  return (
    <section className="py-16 sm:py-24 relative overflow-hidden" style={{ background: "var(--color-bg)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <Reveal variant="scale">
          <div className="relative rounded-3xl overflow-hidden p-8 sm:p-12 md:p-16 text-center text-white bg-gradient-to-br from-[#240046] via-[#3C096C] to-[#1A0530] shadow-2xl border border-primary-500/30">
            {/* Ambient inner glow elements */}
            <div
              className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-40 pointer-events-none"
              style={{
                background: "radial-gradient(circle, var(--color-primary-500) 0%, transparent 70%)",
                filter: "blur(60px)",
              }}
            />
            <div
              className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full opacity-30 pointer-events-none"
              style={{
                background: "radial-gradient(circle, var(--color-primary-600) 0%, transparent 70%)",
                filter: "blur(70px)",
              }}
            />

            <div className="relative z-10 max-w-3xl mx-auto">
              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 text-white border border-white/20 backdrop-blur-md mb-6 shadow-inner">
                <Sparkles size={13} className="text-primary-300" />
                <span>Zero Ghost Jobs · 100% Free For Talent</span>
              </div>

              {/* Headline */}
              <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.15]">
                {t("marketing.ctaTitle") || "Ready to land a role that truly fits?"}
              </h2>

              {/* Subheadline */}
              <p className="mt-5 text-base sm:text-lg md:text-xl text-white/80 leading-relaxed max-w-2xl mx-auto">
                {t("marketing.ctaSubtitle") ||
                  "Join thousands of software engineers, designers, and tech leaders discovering high-match opportunities with transparent scoring."}
              </p>

              {/* Email quick-start form */}
              <form
                onSubmit={handleSubmit}
                className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-2.5 max-w-md mx-auto"
              >
                <div className="w-full relative">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email address…"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl text-sm bg-white/10 border border-white/25 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 backdrop-blur-md"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-sm font-bold text-[#240046] bg-white hover:bg-neutral-100 transition-all duration-200 shadow-xl hover:-translate-y-0.5 active:scale-95 shrink-0 flex items-center justify-center gap-2"
                >
                  <span>{t("marketing.ctaButton") || "Get Started Free"}</span>
                  <ArrowRight size={15} />
                </button>
              </form>

              {/* Trust assurances row */}
              <div className="mt-8 pt-6 border-t border-white/15 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-white/75">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-primary-300" /> Free forever for job seekers
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck size={13} className="text-primary-300" /> Private & confidential
                </span>
                <span className="flex items-center gap-1.5">
                  <Zap size={13} className="text-primary-300" /> Instant ATS scan in 30 seconds
                </span>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
