"use client";

import React from "react";

export function SectionCard({
  title,
  subtitle,
  action,
  children,
  headerIcon,
  flush = false,
  className = "",
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  headerIcon?: React.ReactNode;
  children: React.ReactNode;
  /** Remove body padding (for list rows that span full width). */
  flush?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`rounded-lg border overflow-hidden ${className}`}
      style={{ background: "var(--color-card)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
    >
      <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--color-neutral-100)" }}>
        <div className="flex items-center gap-3">
          {headerIcon}
          <div>
            <div className="text-base font-bold" style={{ color: "var(--color-text-primary)" }}>{title}</div>
            {subtitle && <div className="text-xs mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>{subtitle}</div>}
          </div>
        </div>
        {action}
      </div>
      <div className={flush ? "" : "p-5"}>{children}</div>
    </div>
  );
}
