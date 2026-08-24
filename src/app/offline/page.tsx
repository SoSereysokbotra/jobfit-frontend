import Link from "next/link";
import { WifiOff } from "lucide-react";

export const metadata = {
  title: "Offline — JobFits",
};

/**
 * Served by the service worker for navigations that miss the cache while offline
 * (see `src/app/sw.ts`). Precached at build time, so it must be a static server
 * component — anything that fetches would defeat the point.
 *
 * Deliberately no header/sidebar: those need the auth-scoped user, which is
 * exactly what is unavailable here. It borrows the brand mark and the shell's
 * page background instead, so it still reads as JobFits.
 */
export default function OfflinePage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--color-bg-secondary)" }}
    >
      <div
        className="w-full max-w-md rounded-lg border p-8 text-center"
        style={{
          background: "var(--color-card)",
          borderColor: "var(--color-border)",
          boxShadow: "var(--shadow-md)",
        }}
      >
        <div className="flex items-center justify-center gap-2 mb-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="JobFits Logo"
            className="w-8 h-8 rounded-full object-contain flex-shrink-0"
          />
          <span className="font-extrabold text-sm" style={{ color: "var(--color-text-primary)" }}>
            JobFits
          </span>
        </div>

        <div
          className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center"
          style={{ background: "var(--color-primary-50)", color: "var(--color-primary-600)" }}
        >
          <WifiOff size={22} />
        </div>

        <h1 className="text-base font-bold mb-1" style={{ color: "var(--color-text-primary)" }}>
          You&apos;re offline
        </h1>
        <p className="text-xs mb-6" style={{ color: "var(--color-text-tertiary)" }}>
          This page hasn&apos;t been saved for offline use yet. Pages you&apos;ve already visited
          still work, and anything you change will sync once you&apos;re back.
        </p>

        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2 py-2.5 px-5 rounded-md text-sm font-semibold transition-all duration-200 active:scale-[0.98] bg-primary-600 hover:bg-primary-700 text-white"
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}
