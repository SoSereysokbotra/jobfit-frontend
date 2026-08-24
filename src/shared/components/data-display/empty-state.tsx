import React from "react";

interface EmptyStateProps {
  icon?: React.ReactNode;
  illustration?: React.ReactNode;
  title: string;
  description?: React.ReactNode;
  /** Action area (buttons/links) rendered under the description. */
  action?: React.ReactNode;
  className?: string;
}

/** Zero-results placeholder required by the dev rules (§4.2) for every list/table. */
export function EmptyState({ icon, illustration, title, description, action, className = "" }: EmptyStateProps) {
  return (
    <div
      className={`rounded-xl border flex flex-col items-center justify-center text-center px-6 py-14 relative overflow-hidden transition-all ${className}`}
      style={{
        background: "var(--color-card)",
        borderColor: "var(--color-border)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      {/* Decorative ambient background rings */}
      <div
        className="absolute w-64 h-64 rounded-full opacity-40 pointer-events-none -top-20 -right-20 blur-2xl"
        style={{ background: "var(--color-primary-50)" }}
      />
      <div
        className="absolute w-64 h-64 rounded-full opacity-30 pointer-events-none -bottom-20 -left-20 blur-2xl"
        style={{ background: "var(--color-primary-50)" }}
      />

      {illustration ? (
        <div className="mb-5 relative z-10">{illustration}</div>
      ) : icon ? (
        <div className="relative mb-5 z-10">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center relative shadow-sm"
            style={{
              background: "linear-gradient(135deg, var(--color-primary-50), var(--color-primary-100))",
              color: "var(--color-primary-600)",
              border: "1px solid var(--color-primary-200)",
            }}
          >
            {icon}
          </div>
          {/* Subtle outer pulse dot */}
          <div
            className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-2"
            style={{
              background: "var(--color-primary-500)",
              borderColor: "var(--color-card)",
            }}
          />
        </div>
      ) : null}

      <h3 className="text-base font-bold relative z-10" style={{ color: "var(--color-text-primary)" }}>
        {title}
      </h3>
      {description && (
        <p className="text-sm mt-1.5 max-w-sm relative z-10 leading-relaxed" style={{ color: "var(--color-text-tertiary)" }}>
          {description}
        </p>
      )}
      {action && <div className="mt-5 flex flex-wrap justify-center gap-2 relative z-10">{action}</div>}
    </div>
  );
}
