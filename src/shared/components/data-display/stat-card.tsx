import React from "react";
import Link from "next/link";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  /** Small caption under the value (e.g. "+3 this week"). */
  hint?: string;
  /** Trend direction for the hint icon; omit for no icon. */
  trend?: "up" | "down";
  icon: React.ReactNode;
  /** Icon tile color classes, e.g. "bg-primary-50 text-primary-600". */
  accent: string;
  href?: string;
}

/** KPI tile shared by admin and employer dashboards. */
export function StatCard({ label, value, hint, trend, icon, accent, href }: StatCardProps) {
  const body = (
    <>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-content-tertiary">{label}</p>
        <div className={`w-9 h-9 rounded-md flex items-center justify-center transition-transform duration-200 group-hover:scale-110 ${accent}`}>
          {icon}
        </div>
      </div>
      <p className="text-3xl font-extrabold tracking-tight text-content">{value}</p>
      {hint && (
        <p className="text-xs mt-1.5 flex items-center gap-1 text-content-tertiary">
          {trend === "up" && <TrendingUp size={11} className="text-success-500" />}
          {trend === "down" && <TrendingDown size={11} className="text-error-500" />}
          {hint}
        </p>
      )}
    </>
  );

  const base = "rounded-lg border border-border bg-card shadow-sm p-5 transition-all duration-200 hover:shadow-md group block";

  return href ? (
    <Link href={href} className={`${base} hover:-translate-y-0.5`}>{body}</Link>
  ) : (
    <div className={base}>{body}</div>
  );
}
