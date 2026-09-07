"use client";

import React from "react";
import Link from "next/link";
import { useTranslation } from "@/providers/locale-provider";

const FOOTER_COLUMNS = [
  {
    heading: "Product",
    links: [
      { label: "Find Jobs", href: "/jobs" },
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "/pricing" },
      { label: "Design System", href: "/ui-reference" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Careers", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Help Center", href: "#" },
      { label: "Career Insights", href: "/insights" },
      { label: "Interview Prep", href: "/learning" },
    ],
  },
  // The business side of the product had no route in from anywhere public. Every other
  // CTA on the marketing site points at /signup, which can only create a job seeker.
  {
    heading: "For Employers",
    links: [
      { label: "Post a Job", href: "/employer/register" },
      { label: "Employer Sign-in", href: "/employer/login" },
    ],
  },
];

/** Site footer — dark brand bookend with link columns and legal row. */
export function SiteFooter() {
  const { t } = useTranslation();

  return (
    <footer style={{ background: "var(--color-primary-900)" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <img
                src="/logo.png"
                alt="JobFits Logo"
                className="w-9 h-9 rounded-full object-contain flex-shrink-0"
              />
              <span className="text-lg font-extrabold tracking-tight text-on-primary">JobFits</span>
            </Link>
            <p className="mt-4 text-sm text-on-primary-muted max-w-xs leading-relaxed">
              AI-powered job matching with a transparent score on every role —
              so you always know where you fit.
            </p>
          </div>

          {/* Link columns */}
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.heading}>
              <p className="text-xs font-bold uppercase tracking-wider text-on-primary-muted">
                {col.heading}
              </p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-on-primary-muted hover:text-on-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Legal row */}
        <div
          className="mt-12 pt-6 border-t border-on-primary-border flex flex-col sm:flex-row items-center justify-between gap-3"
        >
          <p className="text-xs text-on-primary-muted">
            © {new Date().getFullYear()} JobFits. {t("marketing.copyright")}
          </p>
          <div className="flex items-center gap-5">
            <Link href="#" className="text-xs text-on-primary-muted hover:text-on-primary transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="text-xs text-on-primary-muted hover:text-on-primary transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
