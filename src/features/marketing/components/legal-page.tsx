// src/features/marketing/components/legal-page.tsx
//
// Shell shared by /terms and /privacy. One place for the things a legal page must carry
// on EVERY version — the version label, the effective date, the draft status — so the
// two documents cannot drift apart on the parts that make them a record rather than
// prose.
//
// THE VERSION LABEL IS NOT DECORATION. The backend stamps `users.termsVersion` with
// TERMS_VERSION at registration (jobfit-backend, src/modules/auth/application/
// auth.constants.ts), and that record only answers "which text did this person agree
// to?" if the label rendered here is the same string. Change one, change both, in the
// same change.

import React from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { SiteFooter } from "./site-footer";

/**
 * The site's public address, for links that must be absolute (the extension's privacy
 * URL, canonical metadata). NEXT_PUBLIC_APP_URL when set, else the Vercel production
 * alias.
 *
 * NOT jobfits.io. That domain belongs to someone else — "jobfits, AI-Powered Career
 * Coaching Tools", a different product on a different server — and this codebase had
 * carried it as the canonical URL since before these pages existed. Verified 2026-09-21
 * by fetching it. Do not reintroduce it anywhere until it is actually owned.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_APP_URL?.trim() || "https://jobfit-frontend-six.vercel.app").replace(/\/$/, "");

/**
 * Where users write to. The Gmail address is already the sender of every email the
 * platform sends (SMTP_FROM in the backend deploy), so publishing it here exposes
 * nothing new. Swap for a domain address once a domain is owned.
 */
export const SUPPORT_EMAIL = "soviseth869@gmail.com";

/** Must match `TERMS_VERSION` in jobfit-backend. */
export const LEGAL_DOCS_VERSION = "2026-09-v1";
export const LEGAL_DOCS_EFFECTIVE = "16 September 2026";

/**
 * Values the engineering side cannot supply. Rendered LOUDLY rather than guessed, so a
 * page that reaches production with one still in place is visibly unfinished instead of
 * quietly wrong. Search for `ToConfirm` before removing the draft banner.
 */
export function ToConfirm({ children }: { children: React.ReactNode }) {
  return (
    <mark
      className="px-1.5 py-0.5 rounded font-semibold"
      style={{ background: "var(--color-warning-50)", color: "var(--color-warning-600)" }}
    >
      [TO CONFIRM: {children}]
    </mark>
  );
}

export function LegalSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2
        className="text-xl font-extrabold tracking-tight mt-12 mb-4"
        style={{ color: "var(--color-text-primary)" }}
      >
        {title}
      </h2>
      <div className="space-y-4 text-sm leading-relaxed text-content-secondary">{children}</div>
    </section>
  );
}

export function LegalPage({
  title,
  intro,
  toc,
  children,
}: {
  title: string;
  intro: string;
  toc: { id: string; label: string }[];
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        {/* Draft status. Removing this banner is a decision counsel makes, not engineering. */}
        <div
          className="flex items-start gap-3 rounded-lg border p-4 mb-8"
          style={{ background: "var(--color-warning-50)", borderColor: "var(--color-warning-100)" }}
        >
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "var(--color-warning-600)" }} />
          <p className="text-xs leading-relaxed" style={{ color: "var(--color-warning-600)" }}>
            <strong>Draft — pending legal review.</strong> The technical statements on this page
            (what is collected, where it is processed, what is sent to which provider) are
            verified against the platform&apos;s code. The legal wording has not yet been
            reviewed by qualified counsel.
          </p>
        </div>

        <h1
          className="text-3xl sm:text-4xl font-extrabold tracking-tight"
          style={{ color: "var(--color-text-primary)" }}
        >
          {title}
        </h1>
        <p className="mt-2 text-xs text-content-tertiary">
          Version <span className="font-mono font-semibold">{LEGAL_DOCS_VERSION}</span> · Effective{" "}
          {LEGAL_DOCS_EFFECTIVE}
        </p>
        <p className="mt-5 text-sm leading-relaxed text-content-secondary">{intro}</p>

        <nav aria-label="Contents" className="mt-8 rounded-lg border border-border bg-card p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-content-tertiary mb-3">
            Contents
          </p>
          <ol className="space-y-1.5 text-sm">
            {toc.map((item, i) => (
              <li key={item.id}>
                <Link
                  href={`#${item.id}`}
                  className="text-primary-600 dark:text-primary-400 hover:underline"
                >
                  {i + 1}. {item.label}
                </Link>
              </li>
            ))}
          </ol>
        </nav>

        {children}

        <div className="mt-14 pt-6 border-t border-border flex flex-wrap gap-x-6 gap-y-2 text-xs">
          <Link href="/terms" className="text-primary-600 dark:text-primary-400 hover:underline">
            Terms of Service
          </Link>
          <Link href="/privacy" className="text-primary-600 dark:text-primary-400 hover:underline">
            Privacy Policy
          </Link>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
