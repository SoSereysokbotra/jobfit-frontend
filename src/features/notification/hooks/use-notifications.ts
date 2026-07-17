"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/api/query-keys";
import { notificationApi, type NotificationDto } from "../api/notification.api";

/** The notification feed. */
export function useNotifications() {
  return useQuery({
    queryKey: qk.notifications.list(),
    queryFn: () => notificationApi.list(),
    staleTime: 60_000,
  });
}

/** Unread count for the bell badge. */
export function useUnreadCount() {
  const { data = [] } = useNotifications();
  return data.filter((n) => !n.read).length;
}

/**
 * Mark read / mark all read. TODO(backend): purely client-side (updates the query
 * cache) until a notifications API exists — resets on reload.
 */
export function useNotificationActions() {
  const qc = useQueryClient();

  const patch = (fn: (n: NotificationDto) => NotificationDto) =>
    qc.setQueryData<NotificationDto[]>(qk.notifications.list(), (prev) => prev?.map(fn));

  return {
    markRead: (id: string) => patch((n) => (n.id === id ? { ...n, read: true } : n)),
    markAllRead: () => patch((n) => ({ ...n, read: true })),
  };
}
