"use client";

/**
 * Request employer access.
 *
 * SUBMITTING THIS IS NOT REGISTERING. It writes a row to an admin review queue and grants
 * nothing — no account, no password, no login exists until an admin approves the request
 * and picks the company (employer_logic.md §3.1). The page says so plainly, because an
 * employer who expects to be signed in afterwards will think it failed.
 */

import React, { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, ArrowRight } from "lucide-react";

import { employerRequestApi } from "@/features/employer-request/api/employer-request.api";
import {
  Field,
  PortalFrame,
} from "@/features/employer-request/components/portal-frame";
import { Alert } from "@/shared/components/feedback/alert";
import { ApiError } from "@/lib/api/client";

/** Exactly the fields employer_logic.md §4.1 lists — no more. */
const FIELDS = [
  {
    name: "companyName",
    label: "Company name",
    required: true,
  },
  {
    name: "companyEmail",
    label: "Official company email",
    required: true,
    type: "email",
    // The commonest way an employer trips over this flow: they use a personal address,
    // then wonder why the activation code went somewhere they cannot read.
    hint: "This becomes your sign-in address, and the activation code is sent here.",
  },
  { name: "contactName", label: "Your name", required: true },
  { name: "contactRole", label: "Your role", required: true },
  { name: "companyWebsite", label: "Website or social page", required: false },
  {
    name: "supportingDocsUrl",
    label: "Link to business registration",
    required: false,
    hint: "Optional, but it speeds up the review.",
  },
] as const;

type FieldName = (typeof FIELDS)[number]["name"];

const EMPTY: Record<FieldName, string> = {
  companyName: "",
  companyEmail: "",
  contactName: "",
  contactRole: "",
  companyWebsite: "",
  supportingDocsUrl: "",
};

export default function EmployerRegisterPage() {
  const [values, setValues] = useState(EMPTY);
  const [description, setDescription] = useState("");
  const [receipt, setReceipt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = (name: FieldName, v: string) =>
    setValues((prev) => ({ ...prev, [name]: v }));

  const complete =
    FIELDS.every((f) => !f.required || values[f.name].trim()) &&
    description.trim().length > 0;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await employerRequestApi.create({
        companyName: values.companyName.trim(),
        companyEmail: values.companyEmail.trim(),
        contactName: values.contactName.trim(),
        contactRole: values.contactRole.trim(),
        description: description.trim(),
        companyWebsite: values.companyWebsite.trim() || undefined,
        supportingDocsUrl: values.supportingDocsUrl.trim() || undefined,
      });
      setReceipt(res.message);
    } catch (err) {
      // 409 means a request for this address is already open. Safe to say out loud: it
      // concerns a request this caller submitted, not whether an account exists.
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not send your request. Please try again.",
      );
      setBusy(false);
    }
  };

  // Nowhere to redirect to — they have no account yet — so the receipt replaces the form.
  if (receipt) {
    return (
      <PortalFrame title="Request received">
        <div className="text-center space-y-4">
          <div
            className="w-12 h-12 rounded-full mx-auto flex items-center justify-center"
            style={{
              background: "var(--color-success-50)",
              color: "var(--color-success-600)",
            }}
          >
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            {receipt}
          </p>
          <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
            Once approved you will get a 6-digit code by email, which you use to set your
            password.
          </p>
          <Link
            href="/"
            className="inline-block text-xs font-semibold underline"
            style={{ color: "var(--color-primary-600)" }}
          >
            Back to JobFits
          </Link>
        </div>
      </PortalFrame>
    );
  }

  return (
    <PortalFrame
      title="Request employer access"
      subtitle="Tell us about your company. We review new employers within two business days."
    >
      {error && <Alert variant="error">{error}</Alert>}

      <form onSubmit={submit} className="space-y-4">
        {FIELDS.map((f) => (
          <Field
            key={f.name}
            id={f.name}
            label={f.required ? f.label : `${f.label} (optional)`}
            type={"type" in f ? f.type : "text"}
            value={values[f.name]}
            onChange={(v) => set(f.name, v)}
            required={f.required}
            hint={"hint" in f ? f.hint : undefined}
          />
        ))}

        <div>
          <label
            htmlFor="description"
            className="block text-xs font-bold uppercase tracking-wider mb-1.5"
            style={{ color: "var(--color-text-secondary)" }}
          >
            What jobs will you post?
          </label>
          <textarea
            id="description"
            rows={3}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Backend and mobile engineers, 3-5 roles a quarter."
            className="w-full px-3 py-2.5 rounded-md border text-sm outline-none transition-all duration-200 focus:border-primary-500 resize-y"
            style={{
              background: "var(--color-bg-secondary)",
              borderColor: "var(--color-border)",
              color: "var(--color-text-primary)",
            }}
          />
        </div>

        <button
          type="submit"
          disabled={!complete || busy}
          className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-bold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-primary-600 hover:bg-primary-700"
        >
          {busy ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Sending…
            </>
          ) : (
            <>
              Send request <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <p
        className="text-center text-xs"
        style={{ color: "var(--color-text-tertiary)" }}
      >
        Already have an employer account?{" "}
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
