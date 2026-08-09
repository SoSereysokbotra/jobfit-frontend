/**
 * Notifications — backed by the live `/notifications` endpoints (JWT-scoped to the
 * current user).
 *
 * This served a MOCK feed of five invented items, and read state lived in the React
 * Query cache and was lost on reload. There was nothing behind it: the backend's
 * notification module was three empty listener stubs and a service whose two methods had
 * empty bodies, with no table for a notification to go into.
 */

import { apiClient } from "@/lib/api/client";

/** Mirrors the backend `NotificationType` enum. */
export type NotificationType =
  | "APPLICATION"
  | "OFFER"
  | "MESSAGE"
  | "MATCH"
  | "SYSTEM";

export interface NotificationDto {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  /** In-app path to what this is about. Null when there is nowhere useful to go. */
  link: string | null;
  read: boolean;
  createdAt: string;
}

export const notificationApi = {
  /** GET /notifications — newest first. */
  list: () => apiClient.get<NotificationDto[]>("/notifications"),

  /** Its own endpoint so the bell badge need not fetch the whole feed to draw a number. */
  unreadCount: () =>
    apiClient.get<{ unread: number }>("/notifications/unread-count"),

  markRead: (id: string) =>
    apiClient.patch<{ ok: true }>(`/notifications/${id}/read`),

  markAllRead: () =>
    apiClient.post<{ marked: number }>("/notifications/read-all"),
};
