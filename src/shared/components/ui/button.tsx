import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/shared/utils/cn";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";

export type ButtonSize = "sm" | "md" | "lg";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-primary-600 hover:bg-primary-700 text-white",
  secondary: "bg-primary-100 hover:bg-primary-200 text-primary-700",
  outline: "border-2 border-primary-500 text-primary-600 bg-transparent hover:bg-primary-50",
  ghost: "text-primary-600 bg-transparent hover:bg-primary-50",
  danger: "bg-error-500 hover:bg-error-600 text-white",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "py-1.5 px-3.5 text-xs rounded",
  md: "py-2.5 px-5 text-sm rounded-md",
  lg: "py-3 px-7 text-base rounded-md",
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  /** Optional label to show in place of children while loading. */
  loadingText?: React.ReactNode;
  fullWidth?: boolean;
}

/** Standard JobFits button. Matches ui-reference button spec (radius, states). */
export function Button({
  variant = "primary",
  size = "md",
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
        "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
        VARIANTS[variant],
        SIZES[size],
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
