import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/shared/utils/cn";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-primary-600 hover:bg-primary-700 text-white",
  secondary: "bg-primary-100 hover:bg-primary-200 text-primary-700",
  outline: "border-2 border-primary-500 text-primary-600 bg-transparent hover:bg-primary-50",
  ghost: "text-primary-600 bg-transparent hover:bg-primary-50",
  danger: "bg-error-500 hover:bg-error-600 text-white",
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
  /** Optional label to show in place of children while loading. */
  loadingText?: React.ReactNode;
  fullWidth?: boolean;
}

/** Standard JobFits button. Matches ui-reference button spec (radius, states). */
export function Button({
  variant = "primary",
  loading = false,
  loadingText,
  fullWidth = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 py-2.5 px-5 rounded-md text-sm font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
        VARIANTS[variant],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {loading ? loadingText ?? children : children}
    </button>
  );
}
