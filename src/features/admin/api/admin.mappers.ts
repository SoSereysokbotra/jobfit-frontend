/** Backend DTO -> view adapters for the admin feature. */

import type { BadgeTone } from "@/shared/components/data-display/badge";
import { daysSince, initialsFrom } from "@/lib/utils/format";
import type { AdminUserListItem, Alert, SystemHealth } from "./admin.api";

export type UserStatus = "active" | "inactive" | "locked" | "deleted";

export const USER_STATUS_TONE: Record<UserStatus, BadgeTone> = {
  active: "success",
  inactive: "neutral",
  locked: "error",
  deleted: "neutral",
};

/** Derive a display status. `isLocked` only exists on the detail DTO. */
export function userStatus(u: { isActive: boolean; deletedAt: string | null; isLocked?: boolean }): UserStatus {
  if (u.deletedAt) return "deleted";
  if (u.isLocked) return "locked";
  if (!u.isActive) return "inactive";
  return "active";
}

/** "just now" / "3 days ago" / "—" for a nullable ISO timestamp. */
export function ago(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = daysSince(iso);
  if (d === 0) return "today";
  if (d === 1) return "yesterday";
  return `${d} days ago`;
}

export function dateLabel(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export function userInitials(u: { name: string; email: string }): string {
  return initialsFrom(u.name?.trim() || u.email.split("@")[0]);
}

// ── Alerts ───────────────────────────────────────────────────────────────────
export function severityTone(severity: string): BadgeTone {
  switch (severity.toUpperCase()) {
    case "CRITICAL":
    case "ERROR":
      return "error";
    case "WARNING":
      return "warning";
    default:
      return "info";
  }
}

export function severityLabel(severity: string): string {
  const s = severity.toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function isAcknowledged(a: Alert): boolean {
  return a.acknowledgedAt !== null;
}

// ── Health ───────────────────────────────────────────────────────────────────
export const HEALTH_TONE: Record<string, BadgeTone> = {
  ok: "success",
  degraded: "warning",
  down: "error",
};

export function healthLabel(status: string): string {
  switch (status) {
    case "ok":
      return "Healthy";
    case "degraded":
      return "Degraded";
    case "down":
      return "Down";
    default:
      return status;
  }
}

/** Human uptime, e.g. 90061 -> "1d 1h". */
export function uptimeLabel(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function totalOpenAlerts(h: Pick<SystemHealth, "openAlerts">): number {
  return h.openAlerts.critical + h.openAlerts.warning + h.openAlerts.info;
}

export function bounceTone(eventType: string): BadgeTone {
  return eventType.toUpperCase().includes("BOUNCE") ? "error" : "warning";
}
