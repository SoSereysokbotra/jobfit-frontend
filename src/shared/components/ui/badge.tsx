import React from "react";
import { cn } from "@/shared/utils/cn";

export type BadgeVariant = "primary" | "neutral" | "success" | "warning" | "error" | "info";

const VARIANTS: Record<BadgeVariant, string> = {
  primary: "bg-primary-50 text-primary-700",
  neutral: "bg-neutral-100 text-neutral-600",
  success: "bg-success-100 text-success-600",
  warning: "bg-warning-100 text-warning-600",
  error: "bg-error-100 text-error-600",
  info: "bg-info-100 text-info-600",
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

/** Small pill badge (job type, remote mode, salary, status). Matches ui-reference badges. */
export function Badge({ variant = "neutral", children, className }: BadgeProps) {
  return (
    <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1", VARIANTS[variant], className)}>
      {children}
    </span>
  );
}
