import React from "react";

interface AuthShellProps {
  /** Motivational quote shown beneath the form card. */
  quote?: string;
  /** Attribution for the quote. */
  author?: string;
  /** Form content rendered inside the centered card. */
  children: React.ReactNode;
}

/**
 * Full-screen auth layout: a fixed gradient + orb layer sits behind a
 * separate scrollable layer that holds the centered card.
 * Splitting them prevents the "orb slides over card" artifact on scroll.
 * All colors/shadows use only the tokens defined in globals.css.
 */
export function AuthShell({ quote, author, children }: AuthShellProps) {
  return (
    <>
      {/* ── LAYER 1: fixed background — never moves during scroll ── */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(135deg, var(--color-primary-900) 0%, var(--color-primary-800) 40%, var(--color-primary-700) 70%, var(--color-primary-600) 100%)",
          zIndex: 0,
        }}
      >
        {/* decorative blur orbs */}
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full"
          style={{
            background: "var(--color-primary-500)",
            filter: "blur(120px)",
            opacity: 0.18,
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-80 h-80 rounded-full"
          style={{
            background: "var(--color-primary-400)",
            filter: "blur(100px)",
            opacity: 0.14,
          }}
        />
        <div
          className="absolute top-1/2 left-1/4 w-64 h-64 rounded-full"
          style={{
            background: "var(--color-primary-300)",
            filter: "blur(140px)",
            opacity: 0.10,
          }}
        />
      </div>

      {/* ── LAYER 2: scrollable content wrapper ── */}
      <div
        className="relative min-h-screen w-full flex flex-col items-center justify-center py-8 px-4 sm:px-6 font-sans"
        style={{ zIndex: 1 }}
      >
        {/* ── centered card ── */}
        <div
          className="w-full max-w-md rounded-2xl p-8 sm:p-10 animate-slide-up"
          style={{
            background: "var(--color-card)",
            boxShadow: "var(--shadow-xl)",
            border: "1px solid var(--color-border)",
          }}
        >
          {/* ── brand header ── */}
          <div className="flex flex-col items-center mb-8">
            <img
              src="/logo.png"
              alt="JobFits Logo"
              className="w-16 h-16 rounded-xl object-contain transition-transform duration-300 hover:scale-105"
              style={{
                background: "linear-gradient(135deg, var(--color-primary-900), var(--color-primary-700))",
                padding: "var(--spacing-sm)",
                boxShadow: "var(--shadow-lg)",
              }}
            />
            <h1
              className="mt-4 text-xl font-extrabold tracking-tight"
              style={{ color: "var(--color-primary-900)" }}
            >
              JobFits
            </h1>
            <p
              className="mt-1 text-xs font-medium"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              Discover your perfect career matches
            </p>

            {/* gradient accent rule */}
            <div
              className="mt-5 w-12 h-px rounded"
              style={{
                background: "linear-gradient(to right, var(--color-primary-500), transparent)",
              }}
            />
          </div>

          {/* ── page-specific form content ── */}
          <div className="space-y-5">{children}</div>

          {/* ── optional motivational quote ── */}
          {quote && (
            <blockquote
              className="mt-8 pt-6 text-center space-y-1"
              style={{ borderTop: "1px solid var(--color-border)" }}
            >
              <p
                className="text-xs italic leading-relaxed"
                style={{ color: "var(--color-text-tertiary)" }}
              >
                &ldquo;{quote}&rdquo;
              </p>
              {author && (
                <cite
                  className="block text-xs font-semibold not-italic uppercase tracking-widest"
                  style={{ color: "var(--color-text-disabled)" }}
                >
                  — {author}
                </cite>
              )}
            </blockquote>
          )}
        </div>
      </div>
    </>
  );
}

