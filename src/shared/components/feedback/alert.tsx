import React from "react";
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/shared/utils/cn";

export type AlertVariant = "error" | "success" | "info" | "warning";

const VARIANTS: Record<AlertVariant, { wrap: string; Icon: typeof AlertCircle }> = {
  error: { wrap: "bg-error-50 border-error-100 text-error-600", Icon: AlertCircle },
  success: { wrap: "bg-success-50 border-success-100 text-success-600", Icon: CheckCircle2 },
  info: { wrap: "bg-info-50 border-info-100 text-info-600", Icon: Info },
  warning: { wrap: "bg-warning-50 border-warning-100 text-warning-600", Icon: AlertTriangle },
};

interface AlertProps {
  variant?: AlertVariant;
  children: React.ReactNode;
  className?: string;
}

/** Inline status banner used across auth flows and forms. */
export function Alert({ variant = "error", children, className }: AlertProps) {
  const { wrap, Icon } = VARIANTS[variant];
  return (
    <div className={cn("p-3 rounded-md border text-xs flex items-center gap-2", wrap, className)}>
      <Icon className="w-4 h-4 shrink-0" />
      <span>{children}</span>
    </div>
  );
}
