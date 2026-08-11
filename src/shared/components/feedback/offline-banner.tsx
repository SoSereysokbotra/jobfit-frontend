"use client";

import React from "react";
import { X } from "lucide-react";
import { Alert } from "./alert";

interface OfflineBannerProps {
  show: boolean;
  /** Messages for actions the server refused outright; each is dropped from the queue. */
  failures: string[];
  onDismiss: () => void;
  onDismissFailures: () => void;
}

/**
 * Transient connectivity notices, pinned above the bottom tab bar on mobile.
 *
 * Built on the existing `Alert` rather than a new toast system — the app has no
 * toast primitive, and adding one for two messages would mean a second visual
 * language for the same job.
 */
export function OfflineBanner({
  show,
  failures,
  onDismiss,
  onDismissFailures,
}: OfflineBannerProps) {
  if (!show && failures.length === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-20 md:bottom-4 z-40 flex flex-col items-center gap-2 px-4 pointer-events-none">
      {show && (
        <Alert variant="info" className="pointer-events-auto max-w-md w-full shadow-md">
          <span className="flex-1">
            You&apos;re offline — changes you make will be saved and synced when you&apos;re back.
          </span>
          <button
            onClick={onDismiss}
            aria-label="Dismiss"
            className="p-0.5 rounded shrink-0 hover:opacity-70 transition-opacity"
          >
            <X size={14} />
          </button>
        </Alert>
      )}

      {failures.length > 0 && (
        <Alert variant="error" className="pointer-events-auto max-w-md w-full shadow-md">
          <span className="flex-1">
            {failures.length === 1
              ? failures[0]
              : `${failures.length} changes couldn't be saved and have been discarded.`}
          </span>
          <button
            onClick={onDismissFailures}
            aria-label="Dismiss"
            className="p-0.5 rounded shrink-0 hover:opacity-70 transition-opacity"
          >
            <X size={14} />
          </button>
        </Alert>
      )}
    </div>
  );
}
