import React from "react";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: React.ReactNode;
  /** Action area (buttons/links) rendered under the description. */
  action?: React.ReactNode;
}

/** Zero-results placeholder required by the dev rules (§4.2) for every list/table. */
export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div
      className="rounded-lg border flex flex-col items-center justify-center text-center px-6 py-14"
      style={{ background: "var(--color-card)", borderColor: "var(--color-border)" }}
    >
      {icon && (
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
          style={{ background: "var(--color-primary-50)", color: "var(--color-primary-500)" }}
        >
          {icon}
        </div>
      )}
      <h3 className="text-base font-bold" style={{ color: "var(--color-text-primary)" }}>{title}</h3>
      {description && (
        <p className="text-sm mt-1.5 max-w-sm" style={{ color: "var(--color-text-tertiary)" }}>{description}</p>
      )}
      {action && <div className="mt-5 flex flex-wrap justify-center gap-2">{action}</div>}
    </div>
  );
}
