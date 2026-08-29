"use client";

import React, { useState } from "react";
import { Building2, Eye, EyeOff } from "lucide-react";

/**
 * The centred card the employer portal's public pages sit in — sign-in and activation.
 *
 * Deliberately not `AuthShell`: that is the seeker/marketing shell with its own artwork and
 * copy. These two pages are the employer's front door and should look like the portal they
 * open, not like the job-seeker site.
 *
 * Lives here rather than beside the pages because a Next.js `page.tsx` may only export the
 * route's own contract — sharing a component out of one is a build error.
 */
export function PortalFrame({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "var(--color-bg-secondary)" }}
    >
      <div
        className="w-full max-w-md rounded-xl border p-7 space-y-5"
        style={{
          background: "var(--color-card)",
          borderColor: "var(--color-border)",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        <div className="text-center space-y-2">
          <div
            className="w-12 h-12 rounded-lg mx-auto flex items-center justify-center"
            style={{
              background: "var(--color-primary-50)",
              color: "var(--color-primary-600)",
            }}
          >
            <Building2 className="w-6 h-6" />
          </div>
          <h1
            className="text-xl font-bold"
            style={{ color: "var(--color-text-primary)" }}
          >
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
              {subtitle}
            </p>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}

export function Field({
  id,
  label,
  type = "text",
  value,
  onChange,
  autoComplete,
  required,
  inputMode,
  maxLength,
  hint,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  required?: boolean;
  inputMode?: "text" | "numeric";
  maxLength?: number;
  hint?: string;
}) {
  const [show, setShow] = useState(false);

  /**
   * Reveal, for password fields only. Same affordance as the shared TextField, because a
   * portal password typed blind is the one people get wrong twice and then blame the
   * account for — and here they are choosing a password against four printed rules, so
   * they need to see what they typed.
   */
  const isPassword = type === "password";
  const inputType = isPassword && show ? "text" : type;

  return (
    <div>
      <label
        htmlFor={id}
        className="block text-xs font-bold uppercase tracking-wider mb-1.5"
        style={{ color: "var(--color-text-secondary)" }}
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          required={required}
          inputMode={inputMode}
          maxLength={maxLength}
          className={`w-full pl-3 py-2.5 rounded-md border text-sm outline-none transition-all duration-200 focus:border-primary-500 ${
            isPassword ? "pr-10" : "pr-3"
          }`}
          style={{
            background: "var(--color-bg-secondary)",
            borderColor: "var(--color-border)",
            color: "var(--color-text-primary)",
          }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            // Not in the tab order: a keyboard user tabbing from password to submit should
            // not be interrupted by a control they did not ask for.
            tabIndex={-1}
            aria-label={show ? "Hide password" : "Show password"}
            className="absolute inset-y-0 right-0 pr-3 flex items-center hover:opacity-80"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
      {hint && (
        <p className="text-xs mt-1.5" style={{ color: "var(--color-text-tertiary)" }}>
          {hint}
        </p>
      )}
    </div>
  );
}
