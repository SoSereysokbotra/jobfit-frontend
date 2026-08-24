import React from "react";

interface AuthHeadingProps {
  title: string;
  subtitle?: React.ReactNode;
  /** Optional icon rendered in a circular badge above the title. */
  icon?: React.ReactNode;
}

/** Title + subtitle block used at the top of each auth form. */
export function AuthHeading({ title, subtitle, icon }: AuthHeadingProps) {
  return (
    <div>
      {icon && (
        <div
          className="flex items-center justify-center w-12 h-12 rounded-full border mb-4"
          style={{ background: "var(--color-primary-50)", borderColor: "var(--color-primary-100)" }}
        >
          {icon}
        </div>
      )}
      <h2 className="text-2xl font-bold tracking-tight" style={{ color: "var(--color-text-primary)" }}>{title}</h2>
      {subtitle && <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>{subtitle}</p>}
    </div>
  );
}
