"use client";

import React, { useMemo, useState } from "react";
import { Search, X, KeyRound, Unlock, Trash2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { Badge } from "@/shared/components/data-display/badge";
import { EmptyState } from "@/shared/components/data-display/empty-state";
import { Skeleton } from "@/shared/components/feedback/skeleton";
import { Alert } from "@/shared/components/feedback/alert";
import { Button } from "@/shared/components/ui/button";
import { useDebounce } from "@/shared/hooks/use-debounce";
import {
  useAdminUsers,
  useAdminUser,
  useResetUserPassword,
  useUnlockUser,
  useDeleteUser,
} from "@/features/admin/hooks/use-admin";
import {
  USER_STATUS_TONE,
  userStatus,
  userInitials,
  ago,
  dateLabel,
} from "@/features/admin/api/admin.mappers";

const FILTERS = ["All", "Active", "Inactive", "Verified"] as const;

export default function UserManagementPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const debounced = useDebounce(query, 300);
  // The backend filters email and name separately; route the query by shape.
  const searchParams = debounced.includes("@") ? { email: debounced } : { name: debounced };
  const { data, isLoading, isError, error } = useAdminUsers(debounced ? searchParams : {});

  const users = data?.data ?? [];
  const results = useMemo(() => {
    return users.filter((u) => {
      const status = userStatus(u);
      if (filter === "Active") return status === "active";
      if (filter === "Inactive") return status === "inactive" || status === "deleted";
      if (filter === "Verified") return u.emailVerified;
      return true;
    });
  }, [users, filter]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-content">User Management</h1>
        <p className="text-sm mt-1 text-content-secondary">Search, review, and manage platform users.</p>
      </div>

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-content-tertiary" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, or email (with @)…"
            className="w-full pl-9 pr-3 py-2.5 rounded-md border border-border bg-card text-content text-sm outline-none transition-all focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={cn("px-3 py-1.5 rounded-md text-xs font-bold border transition-colors", filter === f ? "bg-primary-50 border-primary-200 text-primary-700" : "bg-card border-border text-content-secondary")}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {isError && <Alert variant="error">{error instanceof Error ? error.message : "Could not load users."}</Alert>}
      {data && <p className="text-xs text-content-tertiary">Showing {results.length} of {data.total} users</p>}

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-14 rounded-lg" />)}</div>
      ) : results.length === 0 ? (
        <EmptyState icon={<Search size={26} />} title="No users found" description="Try a different search term or filter." />
      ) : (
        <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-content-tertiary">
                  <th className="font-semibold text-xs uppercase tracking-wider px-5 py-3">Name</th>
                  <th className="font-semibold text-xs uppercase tracking-wider px-5 py-3 hidden sm:table-cell">Email</th>
                  <th className="font-semibold text-xs uppercase tracking-wider px-5 py-3">Role</th>
                  <th className="font-semibold text-xs uppercase tracking-wider px-5 py-3">Status</th>
                  <th className="font-semibold text-xs uppercase tracking-wider px-5 py-3 hidden md:table-cell">Last Login</th>
                </tr>
              </thead>
              <tbody>
                {results.map((u) => (
                  <tr key={u.id} onClick={() => setSelectedId(u.id)} className="border-t border-neutral-100 cursor-pointer transition-colors hover:bg-primary-50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 bg-primary-100 text-primary-700">{userInitials(u)}</div>
                        <span className="font-semibold text-content">{u.name || "—"}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 hidden sm:table-cell text-content-secondary">{u.email}</td>
                    <td className="px-5 py-3"><Badge tone="neutral">{u.role.replace("_", " ")}</Badge></td>
                    <td className="px-5 py-3"><Badge tone={USER_STATUS_TONE[userStatus(u)]} dot>{userStatus(u)}</Badge></td>
                    <td className="px-5 py-3 hidden md:table-cell text-content-tertiary">{ago(u.lastLogin)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedId && <UserDetailDrawer id={selectedId} onClose={() => setSelectedId(null)} />}
    </div>
  );
}

function UserDetailDrawer({ id, onClose }: { id: string; onClose: () => void }) {
  const { data: user, isLoading } = useAdminUser(id);
  const resetPassword = useResetUserPassword();
  const unlock = useUnlockUser();
  const deleteUser = useDeleteUser();
  const [deleteConfirm, setDeleteConfirm] = useState("");

  return (
    <div className="fixed inset-0 flex justify-end z-50">
      <div className="flex-1 bg-scrim" onClick={onClose} />
      <div className="w-full max-w-md h-full overflow-y-auto p-6 animate-slide-up bg-background">
        {isLoading || !user ? (
          <div className="space-y-4"><Skeleton className="h-14 w-full" /><Skeleton className="h-40 w-full" /></div>
        ) : (
          <>
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-base font-bold shrink-0 bg-primary-100 text-primary-700">{userInitials(user)}</div>
                <div>
                  <h2 className="text-lg font-bold text-content">{user.name || "—"}</h2>
                  <p className="text-xs text-content-tertiary">{user.email}</p>
                </div>
              </div>
              <button onClick={onClose} aria-label="Close" className="p-2 rounded-md hover:bg-neutral-100 transition-colors text-content-secondary"><X size={18} /></button>
            </div>

            <Section title="Account">
              <Row label="Role"><Badge tone="neutral">{user.role.replace("_", " ")}</Badge></Row>
              <Row label="Status"><Badge tone={USER_STATUS_TONE[userStatus(user)]} dot>{userStatus(user)}</Badge></Row>
              <Row label="Email verified"><Badge tone={user.emailVerified ? "success" : "warning"}>{user.emailVerified ? "Yes" : "No"}</Badge></Row>
              <Row label="Signup date"><span className="text-content">{dateLabel(user.createdAt)}</span></Row>
              <Row label="Last login"><span className="text-content">{ago(user.lastLogin)}</span></Row>
            </Section>

            <Section title="Activity">
              <Row label="Applications"><span className="text-content">{user.applicationsCount}</span></Row>
              <Row label="Resumes"><span className="text-content">{user.resumesCount}</span></Row>
              <Row label="Locked"><Badge tone={user.isLocked ? "error" : "neutral"}>{user.isLocked ? "Yes" : "No"}</Badge></Row>
            </Section>

            {/* Actions */}
            <div className="mt-6 space-y-2">
              <button
                onClick={() => resetPassword.mutate(user.id)}
                disabled={resetPassword.isPending}
                className="w-full flex items-center gap-2 px-4 py-2.5 rounded-md border border-border text-sm font-semibold text-content transition-colors hover:bg-neutral-50 disabled:opacity-50"
              >
                <KeyRound size={16} className="text-primary-600" /> Send Password Reset
              </button>
              {resetPassword.isSuccess && <Alert variant="success"><span className="inline-flex items-center gap-1"><CheckCircle2 size={13} /> Reset code sent.</span></Alert>}

              {user.isLocked && (
                <button
                  onClick={() => unlock.mutate(user.id)}
                  disabled={unlock.isPending}
                  className="w-full flex items-center gap-2 px-4 py-2.5 rounded-md border border-border text-sm font-semibold text-content transition-colors hover:bg-neutral-50 disabled:opacity-50"
                >
                  <Unlock size={16} className="text-success-600" /> Unlock Account
                </button>
              )}

              {/* Delete (GDPR) */}
              <div className="mt-4 pt-4 border-t border-neutral-100">
                <div className="p-3 rounded-md border border-error-100 bg-error-50">
                  <p className="text-xs font-bold flex items-center gap-1.5 mb-2 text-error-600">
                    <AlertTriangle size={13} /> Danger zone — this cannot be undone
                  </p>
                  <input
                    value={deleteConfirm}
                    onChange={(e) => setDeleteConfirm(e.target.value)}
                    placeholder='Type "DELETE" to confirm'
                    className="w-full px-3 py-2 rounded-md border border-error-100 bg-card text-content text-sm outline-none mb-2"
                  />
                  <Button
                    variant="danger"
                    fullWidth
                    loading={deleteUser.isPending}
                    loadingText="Deleting…"
                    disabled={deleteConfirm !== "DELETE"}
                    onClick={() => deleteUser.mutate(user.id, { onSuccess: onClose })}
                    className="text-sm"
                  >
                    <Trash2 size={15} /> Delete Account
                  </Button>
                  {deleteUser.isError && <Alert variant="error" className="mt-2">{deleteUser.error instanceof Error ? deleteUser.error.message : "Delete failed."}</Alert>}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <p className="text-xs font-bold uppercase tracking-wider mb-2 text-content-tertiary">{title}</p>
      <div className="rounded-lg border border-border bg-card p-4 space-y-2">{children}</div>
    </div>
  );
}
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-content-secondary">{label}</span>
      {children}
    </div>
  );
}
