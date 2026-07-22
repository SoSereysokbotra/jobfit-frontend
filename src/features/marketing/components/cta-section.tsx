import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/shared/components/motion/reveal";

/** Closing call-to-action — clean centered block on the page background. */
export function CtaSection() {
  return (
    <section className="py-20 lg:py-28" style={{ background: "var(--color-bg-secondary)" }}>
      <Reveal variant="scale" className="max-w-3xl mx-auto px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight" style={{ color: "var(--color-text-primary)" }}>
          Ready to find the job that truly fits?
        </h2>
        <p className="mt-4 text-base leading-relaxed max-w-xl mx-auto" style={{ color: "var(--color-text-secondary)" }}>
          Join thousands of candidates matching smarter. Upload your resume and see
          your first scored matches in under a minute — free.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
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
        </div>
        <p className="mt-5 text-xs" style={{ color: "var(--color-text-tertiary)" }}>
          No credit card required · Free for job seekers
        </p>
      </Reveal>
    </section>
  );
}
