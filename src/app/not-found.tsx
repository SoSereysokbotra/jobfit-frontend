import React from "react";
import Link from "next/link";
import { Search, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 text-center relative overflow-hidden"
      style={{ background: "var(--color-bg)" }}
    >
      {/* Background ambient gradient glow */}
      <div
        className="absolute w-96 h-96 rounded-full opacity-30 pointer-events-none blur-3xl"
        style={{ background: "var(--color-primary-500)", top: "20%", left: "50%", transform: "translateX(-50%)" }}
      />

      <div className="relative z-10 max-w-md mx-auto space-y-6">
        {/* Visual 404 badge */}
        <div className="inline-flex items-center justify-center">
          <span
            className="text-8xl sm:text-9xl font-black tracking-tighter"
            style={{
              background: "linear-gradient(135deg, var(--color-primary-600), var(--color-primary-400))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            404
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold" style={{ color: "var(--color-text-primary)" }}>
            Page Not Found
          </h1>
          <p className="text-sm leading-relaxed max-w-sm mx-auto" style={{ color: "var(--color-text-secondary)" }}>
            The page you are looking for might have been moved, renamed, or is temporarily unavailable.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 transition-all duration-200 shadow-sm active:scale-95"
          >
            <Home size={14} /> Back to Dashboard
          </Link>
          <Link
            href="/jobs"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold border transition-all duration-200 active:scale-95"
            style={{
              borderColor: "var(--color-border)",
              background: "var(--color-card)",
              color: "var(--color-text-primary)",
            }}
          >
            <Search size={14} /> Search Jobs
          </Link>
        </div>
      </div>
    </div>
  );
}
