"use client";

import React from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { useUnreadCount } from "../hooks/use-notifications";

/** Topnav bell with a live unread badge. Links to the notifications page. */
export function NotificationBell() {
  const unread = useUnreadCount();

  return (
    <Link
      href="/notifications"
      aria-label={unread > 0 ? `Notifications (${unread} unread)` : "Notifications"}
      className="relative p-2 rounded-lg hover:bg-neutral-100 transition-colors"
      style={{ color: "var(--color-text-secondary)" }}
    >
      <Bell size={20} />
      {unread > 0 && (
        <span
          className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
          style={{ background: "var(--color-primary-600)" }}
        >
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </Link>
  );
}
