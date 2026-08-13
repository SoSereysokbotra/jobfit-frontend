"use client";

import React from "react";
import { AlertCircle, Check, Loader2 } from "lucide-react";
import type { SaveStatus } from "../hooks/use-resume-builder";

/**
 * Autosave feedback.
 *
 * Nothing in the app had an autosave pattern to copy — every other form saves on
 * an explicit button — so this is deliberately the smallest thing that tells the
 * truth: idle shows nothing, and the three live states use existing tokens only.
 */
export function SaveIndicator({ status }: { status: SaveStatus }) {
  if (status === "idle") return null;

  if (status === "saving") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs" style={{ color: "var(--color-text-tertiary)" }}>
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        Saving…
      </span>
    );
  }

  if (status === "error") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color: "var(--color-error-600)" }}>
        <AlertCircle className="w-3.5 h-3.5" />
        Not saved
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color: "var(--color-success-600)" }}>
      <Check className="w-3.5 h-3.5" />
      Saved
    </span>
  );
}

interface SectionShellProps {
  title: string;
  icon: React.ElementType;
  status: SaveStatus;
  /** Extra controls beside the save indicator (e.g. per-section import). */
  action?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Card wrapper for one content section. Mirrors the SectionCard used on the
 * Resumes page (same radius, border, header rule and icon chip) so the builder
 * reads as part of the same app.
 */
export function SectionShell({ title, icon: Icon, status, action, children }: SectionShellProps) {
  return (
    <section
      className="rounded-xl border"
      style={{
        background: "var(--color-card)",
        borderColor: "var(--color-border)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div
        className="flex items-center justify-between gap-3 px-5 py-3.5 border-b"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "var(--color-primary-50)" }}
          >
            <Icon className="w-4 h-4" style={{ color: "var(--color-primary-600)" }} />
          </div>
          <h2 className="text-sm font-bold truncate" style={{ color: "var(--color-text-primary)" }}>
            {title}
          </h2>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <SaveIndicator status={status} />
          {action}
        </div>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}
