"use client";

import React from "react";
import { AlertTriangle, WifiOff } from "lucide-react";
import { useOffline } from "@/providers/offline-provider";

/**
 * Topnav connectivity status. Renders nothing when online and fully synced,
 * which is the overwhelmingly common case.
 *
 * Sized to the notification bell deliberately — same `p-2 rounded-lg`, same
 * 20px icon, same badge geometry — so it reads as a peer of the bell rather
 * than an alarm. The pending count uses the neutral-600 badge rather than the
 * bell's primary-600: unsynced work is information, not a call to action, and
 * two competing purple dots in one header is one too many.
 */
export function OfflineIndicator() {
  const offline = useOffline();
  if (!offline) return null;

  const { isOnline, pendingCount, conflicts, openConflict } = offline;
  const hasConflicts = conflicts.length > 0;

  if (isOnline && pendingCount === 0 && !hasConflicts) return null;

  // A conflict is the only state here that genuinely needs the user, so it is
  // the only one that gets a button.
  if (hasConflicts) {
    return (
      <button
        onClick={() => openConflict(conflicts[0])}
        aria-label={`${conflicts.length} ${conflicts.length === 1 ? "change needs" : "changes need"} your attention`}
        title="Some changes need your attention"
        className="relative p-2 rounded-lg hover:bg-neutral-100 transition-colors"
        style={{ color: "var(--color-warning-600)" }}
      >
        <AlertTriangle size={20} />
        <span
          className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
          style={{ background: "var(--color-warning-600)" }}
        >
          {conflicts.length > 9 ? "9+" : conflicts.length}
        </span>
      </button>
    );
  }

  const label = !isOnline
    ? pendingCount > 0
      ? `Offline — ${pendingCount} ${pendingCount === 1 ? "change" : "changes"} pending`
      : "Offline"
    : `${pendingCount} ${pendingCount === 1 ? "change" : "changes"} pending`;

  return (
    <div
      role="status"
      aria-label={label}
      title={label}
      className="relative p-2 rounded-lg"
      style={{ color: "var(--color-text-tertiary)" }}
    >
      {isOnline ? (
        // Online with a queue: syncing shortly. A count alone says it.
        <span className="text-xs font-semibold tabular-nums">{pendingCount}</span>
      ) : (
        <>
          <WifiOff size={20} />
          {pendingCount > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
              style={{ background: "var(--color-neutral-600)" }}
            >
              {pendingCount > 9 ? "9+" : pendingCount}
            </span>
          )}
        </>
      )}
    </div>
  );
}
