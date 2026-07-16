"use client";

import React from "react";
import Link from "next/link";
import { TrendingUp } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  change?: string;
  changeUp?: boolean;
  icon: React.ReactNode;
  /** Token-backed accent, e.g. "var(--color-primary-600)". */
  accentColor: string;
  accentBg: string;
  /** When set, the tile is a link. */
  href?: string;
}

/** KPI tile (ui-reference §12 dashboard components). Shared by dashboard & trackers. */
export function StatCard({
  label, value, change, changeUp, icon, accentColor, accentBg, href,
}: StatCardProps) {
  const body = (
    <>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-tertiary)" }}>{label}</p>
        <div
          className="w-9 h-9 rounded-md flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
          style={{ background: accentBg, color: accentColor }}
        >
          {icon}
        </div>
      </div>
      <p className="text-3xl font-extrabold tracking-tight" style={{ color: "var(--color-text-primary)" }}>{value}</p>
      {change && (
        <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: "var(--color-text-tertiary)" }}>
          {changeUp && <TrendingUp size={11} style={{ color: "var(--color-success-500)" }} />}
          {change}
        </p>
      )}
    </>
  );

  const baseClass = "rounded-lg border p-5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 group block";
  const baseStyle: React.CSSProperties = {
    background: "var(--color-card)",
    borderColor: "var(--color-border)",
    boxShadow: "var(--shadow-sm)",
  };

  if (href) {
    return (
      <Link href={href} className={baseClass} style={baseStyle}>
        {body}
      </Link>
    );
  }
  return (
    <div className={baseClass} style={baseStyle}>
      {body}
    </div>
  );
}
