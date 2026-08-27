"use client";

import React, { useEffect, useRef } from "react";
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
  const panelRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Escape key listener + Body scroll lock + Focus management
  useEffect(() => {
    if (!open) return;

    // Save previous active element to restore focus on close
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Lock body scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      // Focus trap
      if (e.key === "Tab" && panelRef.current) {
        const focusableElements = panelRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    // Initial focus into modal panel
    const focusTimeout = setTimeout(() => {
      if (panelRef.current) {
        const firstFocusable = panelRef.current.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (firstFocusable) {
          firstFocusable.focus();
        } else {
          panelRef.current.focus();
        }
      }
    }, 50);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      clearTimeout(focusTimeout);
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex: "var(--z-modal)" as unknown as number }}
    >
      {/* Scrim */}
      <div className="absolute inset-0 bg-scrim animate-fade-in" onClick={onClose} />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        tabIndex={-1}
        aria-modal="true"
        aria-label={title}
        className="relative w-full max-w-md max-h-[calc(100dvh-2rem)] flex flex-col rounded-xl border animate-slide-up outline-none overflow-hidden"
        style={{
          background: "var(--color-card)",
          borderColor: "var(--color-border)",
          boxShadow: "var(--shadow-xl)",
        }}
      >
        <div className="flex items-start justify-between px-5 py-4 border-b shrink-0" style={{ borderColor: "var(--color-border)" }}>
          <div>
            <h2 className="text-base font-bold" style={{ color: "var(--color-text-primary)" }}>{title}</h2>
            {subtitle && (
              <p className="text-xs mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-md transition-colors hover:bg-[var(--color-surface-hover)]"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-5 py-4 overflow-y-auto flex-1">{children}</div>

        {footer && (
          <div
            className="flex justify-end gap-2 px-5 py-3.5 border-t shrink-0 flex-wrap"
            style={{ borderColor: "var(--color-border)", background: "var(--color-bg-secondary)" }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
