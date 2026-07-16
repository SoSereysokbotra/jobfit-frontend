import React from "react";

interface AuthShellProps {
  /** Motivational quote shown in the branding panel. */
  quote: string;
  /** Attribution for the quote. */
  author: string;
  /** Form content rendered in the right panel (already width-constrained). */
  children: React.ReactNode;
}

/**
 * Split-screen auth layout: branded gradient panel on the left, form on the
 * right. Shared by every page under (auth) so branding stays identical.
 */
export function AuthShell({ quote, author, children }: AuthShellProps) {
  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-white font-sans overflow-hidden">
      {/* LEFT — BRANDING */}
      <div
        className="w-full md:w-1/2 p-8 md:p-16 flex flex-col items-center justify-center text-center text-white relative min-h-screen"
        style={{ background: "linear-gradient(135deg, var(--color-primary-900), var(--color-primary-800), var(--color-primary-700))" }}
      >
        <div className="relative z-10 flex flex-col items-center max-w-sm">
          <img
            src="/logo.png"
            alt="JobFits Logo"
            className="w-32 h-32 rounded-full border-2 border-on-primary-border shadow-2xl bg-on-primary-surface backdrop-blur-sm p-4 object-contain hover:scale-105 transition-transform duration-300"
          />
          <h1 className="text-3xl font-extrabold tracking-tight text-on-primary mt-6">JobFits</h1>
          <p className="text-sm text-primary-200 mt-2">Discover your perfect career matches</p>

          <div className="w-16 h-0.5 bg-on-primary-border my-8 rounded" />

          <blockquote className="space-y-2">
            <p className="text-base italic text-primary-100 font-medium leading-relaxed">
              &ldquo;{quote}&rdquo;
            </p>
            <cite className="block text-xs font-semibold text-primary-300 not-italic uppercase tracking-wider">
              — {author}
            </cite>
          </blockquote>
        </div>
      </div>

      {/* RIGHT — FORM */}
      <div className="w-full md:w-1/2 bg-white flex flex-col justify-center items-center p-8 sm:p-12 md:p-16 min-h-screen">
        <div className="w-full max-w-md space-y-6">{children}</div>
      </div>
    </div>
  );
}
