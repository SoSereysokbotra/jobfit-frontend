"use client";

import React from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Optional secondary line under the title. */
  subtitle?: string;
  children: React.ReactNode;
  /** Action buttons rendered right-aligned at the bottom. */
  footer?: React.ReactNode;
}

/** Centered confirmation/form modal (ui-reference §16): scrim + rounded-lg panel. */
export function Modal({ open, onClose, title, subtitle, children, footer }: ModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex: "var(--z-modal)" as React.CSSProperties["zIndex"] }}
    >
      {/* Scrim */}
      <div className="absolute inset-0 bg-scrim animate-fade-in" onClick={onClose} />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative w-full max-w-md rounded-lg border animate-slide-up"
        style={{
          background: "var(--color-card)",
          borderColor: "var(--color-border)",
          boxShadow: "var(--shadow-xl)",
        }}
      >
        <div className="flex items-start justify-between px-5 py-4 border-b" style={{ borderColor: "var(--color-neutral-100)" }}>
          <div>
            <h2 className="text-base font-bold" style={{ color: "var(--color-text-primary)" }}>{title}</h2>
            {subtitle && (
              <p className="text-xs mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-md transition-colors hover:bg-neutral-100"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-5 py-4">{children}</div>

        {footer && (
          <div
            className="flex justify-end gap-2 px-5 py-4 border-t"
            style={{ borderColor: "var(--color-neutral-100)", background: "var(--color-bg-secondary)" }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
