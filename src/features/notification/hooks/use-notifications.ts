"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/api/query-keys";
import { notificationApi, type NotificationDto } from "../api/notification.api";

/** The notification feed, newest first. */
export function useNotifications() {
  return useQuery({
    queryKey: qk.notifications.list(),
    queryFn: () => notificationApi.list(),
    staleTime: 60_000,
  });
}

/**
 * Unread count for the bell badge.
 *
 * Its own query against its own endpoint rather than counting the feed client-side: the
 * badge is drawn on every page, the feed is only opened on some of them, and the server
 * can answer this with a COUNT instead of shipping fifty rows.
 */
export function useUnreadCount(): number {
  const { data } = useQuery({
    queryKey: qk.notifications.unreadCount(),
    queryFn: () => notificationApi.unreadCount(),
    staleTime: 60_000,
  });
  return data?.unread ?? 0;
}

/**
 * Mark read / mark all read — now persisted.
 *
 * These used to write the query cache and nothing else, so every notification came back
 * unread on reload. The optimistic cache write is KEPT (the bell should respond
 * immediately) but it is now a preview of a real write, and `onSettled` re-syncs both the
 * feed and the badge with whatever the server actually did.
 */
export function useNotificationActions() {
  const qc = useQueryClient();

  const patch = (fn: (n: NotificationDto) => NotificationDto) =>
    qc.setQueryData<NotificationDto[]>(qk.notifications.list(), (prev) => prev?.map(fn));

  const resync = () => {
    void qc.invalidateQueries({ queryKey: qk.notifications.all });
  };

  const markRead = useMutation({
    mutationFn: (id: string) => notificationApi.markRead(id),
    onMutate: (id) => patch((n) => (n.id === id ? { ...n, read: true } : n)),
    onSettled: resync,
  });

  const markAllRead = useMutation({
    mutationFn: () => notificationApi.markAllRead(),
    onMutate: () => patch((n) => ({ ...n, read: true })),
    onSettled: resync,
  });

  return {
    markRead: (id: string) => markRead.mutate(id),
    markAllRead: () => markAllRead.mutate(),
  };
}
