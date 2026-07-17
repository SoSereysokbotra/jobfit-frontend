/**
 * Admin endpoints (backend module: `admin`). All require an ADMIN JWT.
 *
 * Contract read off the running backend, not guessed:
 *   - Users search returns { data, total, skip, take }; detail adds
 *     applicationsCount/resumesCount/isLocked.
 *   - System health `status` can be "down" purely from open CRITICAL alerts
 *     (the DB can be up while status is down).
 *   - Email metrics/bounces have NO per-type breakdown and NO time series.
 *   - Admin login is its own endpoint; the shared session also accepts an ADMIN
 *     account via /auth/login, which is how the app authenticates admins.
 */

import { apiClient } from "@/lib/api/client";

export type UserRole = "JOB_SEEKER" | "EMPLOYER" | "ADMIN";

export interface AdminUserListItem {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  emailVerified: boolean;
  lastLogin: string | null;
  createdAt: string;
  deletedAt: string | null;
}

export interface AdminUserDetail extends AdminUserListItem {
  applicationsCount: number;
  resumesCount: number;
  isLocked: boolean;
}

export interface PaginatedUsers {
  data: AdminUserListItem[];
  total: number;
  skip: number;
  take: number;
}

export interface SystemHealth {
  status: "ok" | "degraded" | "down";
  uptimeSeconds: number;
  databaseLatencyMs: number;
  databaseUp: boolean;
  activeUsers: number;
  jobQueuePending: number;
  emailDeliveryRate: number;
  openAlerts: { critical: number; warning: number; info: number };
  generatedAt: string;
}

export interface SystemMetrics {
  period: string;
  windowStart: string;
  windowEnd: string;
  eventsBySeverity: Record<string, number>;
  emailByType: Record<string, number>;
  newUsers: number;
  newApplications: number;
}

export interface Alert {
  id: string;
  eventType: string;
  severity: string;
  message: string;
  details?: unknown;
  acknowledgedAt: string | null;
  acknowledgedByAdminId: string | null;
  createdAt: string;
}

export interface EmailMetrics {
  windowStart: string;
  windowEnd: string;
  sent: number;
  delivered: number;
  bounced: number;
  complained: number;
  deliveryRate: number;
}

export interface Bounce {
  id: string;
  recipientEmail: string;
  eventType: string;
  reason: string | null;
  suppressed: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminEmail: string | null;
  actionType: string;
  resourceType: string;
  resourceId: string | null;
  createdAt: string;
}

export interface SearchUsersParams {
  email?: string;
  name?: string;
  signupFrom?: string;
  signupTo?: string;
  skip?: number;
  take?: number;
}

export const adminApi = {
  // ── Users ──
  searchUsers: (params: SearchUsersParams = {}) =>
    apiClient.get<PaginatedUsers>("/admin/users", { query: { ...params } }),
  getUser: (id: string) => apiClient.get<AdminUserDetail>(`/admin/users/${id}`),
  resetPassword: (id: string) =>
    apiClient.post<{ message: string }>(`/admin/users/${id}/reset-password`),
  unlockUser: (id: string) =>
    apiClient.post<{ message: string }>(`/admin/users/${id}/unlock`),
  deleteUser: (id: string) =>
    apiClient.delete<{ message: string }>(`/admin/users/${id}`),

  // ── System ──
  systemHealth: () => apiClient.get<SystemHealth>("/admin/system/health"),
  systemMetrics: (period: "1h" | "24h" | "7d" = "24h") =>
    apiClient.get<SystemMetrics>("/admin/system/metrics", { query: { period } }),
  alerts: (params: { severity?: string; acknowledged?: boolean } = {}) =>
    apiClient.get<Alert[]>("/admin/system/alerts", { query: { ...params } }),
  acknowledgeAlert: (id: string) =>
    apiClient.post<Alert>(`/admin/system/alerts/${id}/acknowledge`),

  // ── Email ──
  emailMetrics: () => apiClient.get<EmailMetrics>("/admin/email/metrics"),
  emailBounces: () => apiClient.get<Bounce[]>("/admin/email/bounces"),
  suppressEmail: (email: string) =>
    apiClient.post<{ message: string }>("/admin/email/suppress", { email }),

  // ── Audit ──
  auditLogs: (params: { adminId?: string; actionType?: string } = {}) =>
    apiClient.get<AuditLog[]>("/admin/audit-logs", { query: { ...params } }),
};
