"use client";

import React, { useState } from "react";
import { Eye, EyeOff, type LucideIcon } from "lucide-react";
import { cn } from "@/shared/utils/cn";

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  /** Optional leading icon (lucide component). */
  icon?: LucideIcon;
  /** Render a show/hide toggle and manage password visibility internally. */
  passwordToggle?: boolean;
  /** Field-level error message, rendered under the input. */
  error?: string;
  /** Muted helper text, shown when there is no error. */
  hint?: string;
}

/** Labeled text input with optional leading icon and password visibility toggle. */
export function TextField({
  label,
  icon: Icon,
  passwordToggle = false,
  type = "text",
  className,
  id,
  error,
  hint,
  style,
  ...props
}: TextFieldProps) {
  const [show, setShow] = useState(false);
  const inputType = passwordToggle ? (show ? "text" : "password") : type;

  return (
    <div>
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {label}
        </label>
      )}
      <div className="relative rounded-md shadow-sm">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5" style={{ color: "var(--color-text-tertiary)" }} />
          </div>
        )}
        <input
          id={id}
          type={inputType}
          aria-invalid={error ? true : undefined}
          className={cn(
            "block w-full py-2.5 border rounded-md placeholder:text-[var(--color-text-disabled)] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm transition-all duration-200",
            Icon ? "pl-10" : "pl-3",
            passwordToggle ? "pr-10" : "pr-3",
            className,
          )}
          style={{
            background: "var(--color-bg)",
            borderColor: error ? "var(--color-error-500)" : "var(--color-border)",
            color: "var(--color-text-primary)",
            ...style,
          }}
          {...props}
        />
        {passwordToggle && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center hover:opacity-80"
            style={{ color: "var(--color-text-tertiary)" }}
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
      {error ? (
        <p className="mt-1 text-xs" style={{ color: "var(--color-error-500)" }}>{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs" style={{ color: "var(--color-text-tertiary)" }}>{hint}</p>
      ) : null}
    </div>
  );
}
