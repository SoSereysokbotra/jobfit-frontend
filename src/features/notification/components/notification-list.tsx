"use client";

import React from "react";
import { Briefcase, Sparkles, MessageSquare, Info } from "lucide-react";
import { daysSince } from "@/lib/utils/format";
import type { NotificationDto, NotificationType } from "../api/notification.api";

const TYPE_ICON: Record<NotificationType, React.ReactNode> = {
  application: <Briefcase size={16} />,
  match: <Sparkles size={16} />,
  message: <MessageSquare size={16} />,
  system: <Info size={16} />,
};

function ago(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const d = daysSince(iso);
  return d === 1 ? "yesterday" : `${d}d ago`;
}

interface NotificationListProps {
  notifications: NotificationDto[];
  onRead: (id: string) => void;
}

export function NotificationList({ notifications, onRead }: NotificationListProps) {
  return (
    <div className="divide-y" style={{ borderColor: "var(--color-neutral-100)" }}>
      {notifications.map((n) => (
        <button
          key={n.id}
          onClick={() => onRead(n.id)}
          className="w-full text-left flex items-start gap-3 px-5 py-4 transition-colors hover:bg-primary-50"
          style={{ background: n.read ? "transparent" : "var(--color-primary-50)" }}
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            style={{ background: "var(--color-primary-100)", color: "var(--color-primary-700)" }}
          >
            {TYPE_ICON[n.type]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>{n.title}</p>
              {!n.read && <span className="w-2 h-2 rounded-full shrink-0" style={{ background: "var(--color-primary-500)" }} />}
            </div>
            <p className="text-sm mt-0.5" style={{ color: "var(--color-text-secondary)" }}>{n.body}</p>
            <p className="text-xs mt-1" style={{ color: "var(--color-text-tertiary)" }}>{ago(n.createdAt)}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
