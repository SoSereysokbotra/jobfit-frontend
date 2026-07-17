import React from "react";
import { cn } from "@/shared/utils/cn";

export type BadgeTone = "primary" | "success" | "warning" | "error" | "info" | "neutral";

const TONES: Record<BadgeTone, string> = {
  primary: "bg-primary-50 text-primary-700",
  success: "bg-success-50 text-success-600",
  warning: "bg-warning-50 text-warning-600",
  error: "bg-error-50 text-error-600",
  info: "bg-info-50 text-info-600",
  neutral: "bg-neutral-100 text-neutral-600",
};

interface BadgeProps {
  tone?: BadgeTone;
  /** Show a leading status dot in the tone color. */
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
}

/** Status pill used across admin/employer tables and cards. */
export function Badge({ tone = "neutral", dot = false, children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap",
        TONES[tone],
        className,
      )}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}
