"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw, Home } from "lucide-react";

export default function GlobalErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log unexpected errors
    console.error("Application error boundary triggered:", error);
  }, [error]);

  return (
    <div
      className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center"
      style={{ background: "var(--color-bg)" }}
    >
      <div
        className="max-w-md w-full p-8 rounded-2xl border relative shadow-lg"
        style={{
          background: "var(--color-card)",
          borderColor: "var(--color-border)",
          boxShadow: "var(--shadow-xl)",
        }}
      >
        <div
          className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
          style={{ background: "var(--color-error-50)", color: "var(--color-error-600)" }}
        >
          <AlertCircle size={28} />
        </div>

        <h1 className="text-xl font-bold mb-2" style={{ color: "var(--color-text-primary)" }}>
          Something went wrong
        </h1>
        <p className="text-xs leading-relaxed mb-6" style={{ color: "var(--color-text-secondary)" }}>
          An unexpected error occurred while rendering this page. Our team has been notified.
        </p>

        {error.message && (
          <div
            className="p-3 rounded-lg text-left text-xs font-mono mb-6 overflow-x-auto border"
            style={{
              background: "var(--color-bg-secondary)",
              borderColor: "var(--color-border)",
              color: "var(--color-error-600)",
            }}
          >
            {error.message}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 transition-all duration-200 active:scale-95 shadow-sm"
          >
            <RotateCcw size={14} /> Try Again
          </button>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all duration-200 active:scale-95"
            style={{
              borderColor: "var(--color-border)",
              background: "var(--color-card)",
              color: "var(--color-text-primary)",
            }}
          >
            <Home size={14} /> Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
