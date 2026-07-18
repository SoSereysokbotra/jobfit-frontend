"use client";

import React from "react";
import { Bell, CheckCheck } from "lucide-react";
import { useNotifications, useNotificationActions, useUnreadCount } from "@/features/notification/hooks/use-notifications";
import { NotificationList } from "@/features/notification/components/notification-list";
import { EmptyState } from "@/shared/components/data-display/empty-state";
import { Skeleton } from "@/shared/components/feedback/skeleton";

export default function NotificationsPage() {
  const { data: notifications = [], isLoading } = useNotifications();
  const { markRead, markAllRead } = useNotificationActions();
  const unread = useUnreadCount();

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 min-h-full" style={{ background: "var(--color-bg-secondary)" }}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--color-text-primary)" }}>
            Notifications
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
            {unread > 0 ? `${unread} unread` : "You're all caught up"}
          </p>
        </div>
        {unread > 0 && (
          <button
            onClick={markAllRead}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md border text-sm font-semibold transition-colors hover:bg-neutral-50"
            style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)", background: "var(--color-card)" }}
          >
            <CheckCheck size={15} /> Mark all read
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="rounded-lg border overflow-hidden" style={{ background: "var(--color-card)", borderColor: "var(--color-border)" }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-start gap-3 px-5 py-4">
              <Skeleton className="w-9 h-9 rounded-full shrink-0" />
              <div className="flex-1 space-y-2"><Skeleton className="h-3 w-1/3" /><Skeleton className="h-3 w-2/3" /></div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState icon={<Bell size={26} />} title="No notifications" description="Updates about your applications and matches will show up here." />
      ) : (
        <div className="rounded-lg border overflow-hidden" style={{ background: "var(--color-card)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}>
          <NotificationList notifications={notifications} onRead={markRead} />
        </div>
      )}
    </div>
  );
}
