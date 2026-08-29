"use client";

/**
 * Activation: the 6-digit code emailed on approval becomes a working account.
 *
 * The employer chooses their own password here — no password is ever emailed. Until this
 * succeeds the account cannot sign in at all: it is created unverified with an empty hash,
 * and the login command refuses unverified accounts.
 */

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight } from "lucide-react";

import { employerAuthApi } from "@/features/employer-request/api/employer-auth.api";
import { Alert } from "@/shared/components/feedback/alert";
import {
  Field,
  PortalFrame,
} from "@/features/employer-request/components/portal-frame";

/** Mirrors ActivateEmployerAccountDto, so the form fails here rather than at a 400. */
const PASSWORD_RULES: { test: (v: string) => boolean; label: string }[] = [
  { test: (v) => v.length >= 8, label: "At least 8 characters" },
  { test: (v) => /[a-z]/.test(v), label: "A lowercase letter" },
  { test: (v) => /[A-Z]/.test(v), label: "An uppercase letter" },
  { test: (v) => /[0-9]/.test(v), label: "A number" },
];

export default function EmployerActivatePage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const rulesMet = PASSWORD_RULES.every((r) => r.test(password));
  const matches = password.length > 0 && password === confirm;
  const canSubmit = email && code.length === 6 && rulesMet && matches && !busy;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await employerAuthApi.activate({ email, code, password });
      // Deliberately not signed in here — they land on the portal login with the address
      // carried over, and use the password they just chose.
      router.replace(
        `/employer/login?activated=1&email=${encodeURIComponent(email)}`,
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not activate the account. Please try again.",
      );
      setBusy(false);
    }
  };

  return (
    <PortalFrame
      title="Activate your account"
      subtitle="Enter the code we emailed you and choose a password."
    >
      {error && <Alert variant="error">{error}</Alert>}

      <form onSubmit={submit} className="space-y-4">
        <Field
          id="email"
          label="Company email"
          type="email"
          value={email}
          onChange={setEmail}
          autoComplete="username"
          required
          hint="The address your approval was sent to."
        />
        <Field
          id="code"
          label="6-digit code"
          value={code}
          onChange={(v) => setCode(v.replace(/\D/g, "").slice(0, 6))}
          inputMode="numeric"
          maxLength={6}
          required
        />
        <Field
          id="password"
          label="Choose a password"
          type="password"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          required
        />

        <ul className="space-y-1">
          {PASSWORD_RULES.map((rule) => {
            const met = rule.test(password);
            return (
              <li
                key={rule.label}
                className="text-xs flex items-center gap-1.5"
                style={{
                  color: met
                    ? "var(--color-success-600)"
                    : "var(--color-text-tertiary)",
                }}
              >
                <span aria-hidden="true">{met ? "✓" : "•"}</span>
                {rule.label}
              </li>
            );
          })}
        </ul>

        <Field
          id="confirm"
          label="Confirm password"
          type="password"
          value={confirm}
          onChange={setConfirm}
          autoComplete="new-password"
          required
        />
        {confirm.length > 0 && !matches && (
          <p className="text-xs" style={{ color: "var(--color-error-600)" }}>
            Those passwords do not match.
          </p>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-bold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-primary-600 hover:bg-primary-700"
        >
          {busy ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Activating…
            </>
          ) : (
            <>
              Activate <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <p className="text-center text-xs" style={{ color: "var(--color-text-tertiary)" }}>
        Code expired?{" "}
        <span>Ask your JobFit contact to resend it.</span>
        <br />
        Already activated?{" "}
        <Link
          href="/employer/login"
          className="underline font-semibold"
          style={{ color: "var(--color-primary-600)" }}
        >
          Sign in
        </Link>
      </p>
    </PortalFrame>
  );
}
