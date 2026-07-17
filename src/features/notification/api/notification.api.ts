/**
 * Notifications.
 *
 * TODO(backend): there are no notification endpoints. This serves a mock feed behind
 * the same interface the UI would use for a real API, so swapping it in later is a
 * one-file change (INTEGRATION_PLAN.md Phase 10). Read state is client-only.
 */

export type NotificationType = "application" | "match" | "message" | "system";

export interface NotificationDto {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}

const now = Date.now();
const iso = (minsAgo: number) => new Date(now - minsAgo * 60_000).toISOString();

const MOCK_NOTIFICATIONS: NotificationDto[] = [
  { id: "n1", type: "application", title: "Application viewed", body: "Stripe viewed your application for Senior Frontend Engineer.", createdAt: iso(35), read: false },
  { id: "n2", type: "match", title: "New matches available", body: "5 new jobs match your profile this week.", createdAt: iso(180), read: false },
  { id: "n3", type: "message", title: "Message from a recruiter", body: "Evan at Stripe sent you a message about next steps.", createdAt: iso(60 * 5), read: false },
  { id: "n4", type: "application", title: "Interview scheduled", body: "Your application moved to the Interview stage.", createdAt: iso(60 * 26), read: true },
  { id: "n5", type: "system", title: "Welcome to JobFits", body: "Complete your profile to unlock better matches.", createdAt: iso(60 * 72), read: true },
];

export const notificationApi = {
  /** Newest-first notification feed. */
  list: async (): Promise<NotificationDto[]> => [...MOCK_NOTIFICATIONS],
};
