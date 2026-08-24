import React from "react";

export default function Loading() {
  return (
    <div
      className="min-h-[60vh] flex flex-col items-center justify-center p-8 gap-3"
      style={{ background: "transparent" }}
    >
      <div className="relative w-12 h-12">
        {/* Outer pulsating ring */}
        <div
          className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-600 animate-spin"
          style={{ borderTopColor: "var(--color-primary-600)" }}
        />
        {/* Inner subtle glow ring */}
        <div
          className="absolute inset-1.5 rounded-full border-2 border-primary-200 dark:border-primary-900 animate-pulse"
        />
      </div>
      <p className="text-xs font-semibold tracking-wide animate-pulse" style={{ color: "var(--color-text-tertiary)" }}>
        Loading content…
      </p>
    </div>
  );
}
