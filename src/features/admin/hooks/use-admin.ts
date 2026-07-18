"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/api/query-keys";
import { adminApi, type SearchUsersParams } from "../api/admin.api";

// ── Users ────────────────────────────────────────────────────────────────────
export function useAdminUsers(params: SearchUsersParams = {}) {
  return useQuery({
    queryKey: qk.admin.users(params as Record<string, unknown>),
    queryFn: () => adminApi.searchUsers(params),
    staleTime: 15_000,
  });
}

export function useAdminUser(id: string | undefined) {
  return useQuery({
    queryKey: qk.admin.user(id ?? ""),
    queryFn: () => adminApi.getUser(id as string),
    enabled: Boolean(id),
  });
}

export function useResetUserPassword() {
  return useMutation({ mutationFn: (id: string) => adminApi.resetPassword(id) });
}

export function useUnlockUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.unlockUser(id),
    onSuccess: (_d, id) => {
      qc.invalidateQueries({ queryKey: qk.admin.user(id) });
      qc.invalidateQueries({ queryKey: qk.admin.all });
    },
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.deleteUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.admin.all }),
  });
}

// ── System ───────────────────────────────────────────────────────────────────
export function useSystemHealth() {
  return useQuery({
    queryKey: qk.admin.systemHealth(),
    queryFn: () => adminApi.systemHealth(),
    refetchInterval: 30_000,
  });
}

export function useSystemMetrics(period: "1h" | "24h" | "7d") {
  return useQuery({
    queryKey: qk.admin.systemMetrics(period),
    queryFn: () => adminApi.systemMetrics(period),
  });
}

export function useAlerts(params: { severity?: string; acknowledged?: boolean } = {}) {
  return useQuery({
    queryKey: qk.admin.systemAlerts(params as Record<string, unknown>),
    queryFn: () => adminApi.alerts(params),
    staleTime: 15_000,
  });
}

export function useAcknowledgeAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.acknowledgeAlert(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.admin.all });
    },
  });
}

// ── Email ────────────────────────────────────────────────────────────────────
export function useEmailMetrics() {
  return useQuery({ queryKey: qk.admin.emailMetrics(), queryFn: () => adminApi.emailMetrics() });
}

export function useEmailBounces() {
  return useQuery({ queryKey: qk.admin.emailBounces(), queryFn: () => adminApi.emailBounces() });
}

export function useSuppressEmail() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (email: string) => adminApi.suppressEmail(email),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.admin.emailBounces() }),
  });
}

// ── Audit ────────────────────────────────────────────────────────────────────
export function useAuditLogs(params: { adminId?: string; actionType?: string } = {}) {
  return useQuery({
    queryKey: qk.admin.auditLogs(params as Record<string, unknown>),
    queryFn: () => adminApi.auditLogs(params),
  });
}
