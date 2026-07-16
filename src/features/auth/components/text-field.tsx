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
}

/** Labeled text input with optional leading icon and password visibility toggle. */
export function TextField({
  label,
  icon: Icon,
  passwordToggle = false,
  type = "text",
  className,
  id,
  ...props
}: TextFieldProps) {
  const [show, setShow] = useState(false);
  const inputType = passwordToggle ? (show ? "text" : "password") : type;

  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
          {label}
        </label>
      )}
      <div className="relative rounded-md shadow-sm">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-neutral-400" />
          </div>
        )}
        <input
          id={id}
          type={inputType}
          className={cn(
            "block w-full py-2.5 border border-neutral-200 bg-white rounded-md text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm transition-all duration-200",
            Icon ? "pl-10" : "pl-3",
            passwordToggle ? "pr-10" : "pr-3",
            className,
          )}
          {...props}
        />
        {passwordToggle && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600"
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
    </div>
  );
}
