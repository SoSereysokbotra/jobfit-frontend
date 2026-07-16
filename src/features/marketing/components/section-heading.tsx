import React from "react";

interface SectionHeadingProps {
  /** Small uppercase label above the title. */
  eyebrow: string;
  title: React.ReactNode;
  description?: string;
}

/** Centered eyebrow + title + description block shared by landing sections. */
export function SectionHeading({ eyebrow, title, description }: SectionHeadingProps) {
  return (
    <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
      <span
        className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border"
        style={{
          color: "var(--color-primary-700)",
          background: "var(--color-primary-50)",
          borderColor: "var(--color-primary-100)",
        }}
      >
        {eyebrow}
      </span>
      <h2
        className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight"
        style={{ color: "var(--color-text-primary)" }}
      >
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-base leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
          {description}
        </p>
      )}
    </div>
  );
}
