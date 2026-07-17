"use client";

import React, { useMemo, useState } from "react";
import { Search, X, FileText, KeyRound, Unlock, Trash2, AlertTriangle } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { Badge, type BadgeTone } from "@/shared/components/data-display/badge";
import { EmptyState } from "@/shared/components/data-display/empty-state";
import { ADMIN_USERS, type AdminUser } from "@/features/admin/api/admin.api";

const STATUS_TONE: Record<AdminUser["status"], BadgeTone> = {
  active: "success", inactive: "neutral", locked: "error",
};
const FILTERS = ["All", "Active", "Inactive", "Locked", "Verified"] as const;

export default function UserManagementPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ADMIN_USERS.filter((u) => {
      if (q && !`${u.name} ${u.email}`.toLowerCase().includes(q)) return false;
      if (filter === "Active") return u.status === "active";
      if (filter === "Inactive") return u.status === "inactive";
      if (filter === "Locked") return u.status === "locked";
      if (filter === "Verified") return u.emailVerified;
      return true;
    });
  }, [query, filter]);

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
            placeholder="Search by name or email…"
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

      <p className="text-xs text-content-tertiary">Showing {results.length} of {ADMIN_USERS.length} users</p>

      {/* Table */}
      {results.length === 0 ? (
        <EmptyState icon={<Search size={26} />} title="No users found" description="Try a different search term or filter." />
      ) : (
        <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-content-tertiary">
                  <th className="font-semibold text-xs uppercase tracking-wider px-5 py-3">Name</th>
                  <th className="font-semibold text-xs uppercase tracking-wider px-5 py-3 hidden sm:table-cell">Email</th>
                  <th className="font-semibold text-xs uppercase tracking-wider px-5 py-3">Status</th>
                  <th className="font-semibold text-xs uppercase tracking-wider px-5 py-3 hidden md:table-cell">Last Login</th>
                </tr>
              </thead>
              <tbody>
                {results.map((u) => (
                  <tr key={u.id} onClick={() => { setSelected(u); setDeleteConfirm(""); }} className="border-t border-neutral-100 cursor-pointer transition-colors hover:bg-primary-50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 bg-primary-100 text-primary-700">{u.initials}</div>
                        <span className="font-semibold text-content">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 hidden sm:table-cell text-content-secondary">{u.email}</td>
                    <td className="px-5 py-3"><Badge tone={STATUS_TONE[u.status]} dot>{u.status}</Badge></td>
                    <td className="px-5 py-3 hidden md:table-cell text-content-tertiary">{u.lastLogin}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail drawer */}
      {selected && (
        <div className="fixed inset-0 flex justify-end z-50">
          <div className="flex-1 bg-scrim" onClick={() => setSelected(null)} />
          <div className="w-full max-w-md h-full overflow-y-auto p-6 animate-slide-up bg-background">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-base font-bold shrink-0 bg-primary-100 text-primary-700">{selected.initials}</div>
                <div>
                  <h2 className="text-lg font-bold text-content">{selected.name}</h2>
                  <p className="text-xs text-content-tertiary">{selected.email}</p>
                </div>
              </div>
              <button onClick={() => setSelected(null)} aria-label="Close" className="p-2 rounded-md hover:bg-neutral-100 transition-colors text-content-secondary"><X size={18} /></button>
            </div>

            <Section title="Account">
              <Row label="Status"><Badge tone={STATUS_TONE[selected.status]} dot>{selected.status}</Badge></Row>
              <Row label="Email verified"><Badge tone={selected.emailVerified ? "success" : "warning"}>{selected.emailVerified ? "Yes" : "No"}</Badge></Row>
              <Row label="Signup date"><span className="text-content">{selected.signupDate}</span></Row>
              <Row label="Last login"><span className="text-content">{selected.lastLogin}</span></Row>
            </Section>

            <Section title="Profile">
              <Row label="Location"><span className="text-content">{selected.location}</span></Row>
              <Row label="Salary expectation"><span className="text-content">{selected.salaryExpectation}</span></Row>
              <Row label="Completeness"><span className="text-content">{selected.profileCompleteness}%</span></Row>
              <Row label="Applications"><span className="text-content">{selected.applications}</span></Row>
            </Section>

            <Section title="Resumes">
              {selected.resumes.length === 0 ? (
                <p className="text-sm text-content-tertiary">No resumes uploaded.</p>
              ) : selected.resumes.map((r) => (
                <div key={r.id} className="flex items-center gap-2.5 py-1.5">
                  <FileText size={15} className="text-primary-500" />
                  <span className="text-sm flex-1 text-content">{r.filename}</span>
                  {r.current && <Badge tone="primary">Current</Badge>}
                  <span className="text-xs text-content-tertiary">{r.uploadedAt}</span>
                </div>
              ))}
            </Section>

            {/* Actions */}
            <div className="mt-6 space-y-2">
              <button className="w-full flex items-center gap-2 px-4 py-2.5 rounded-md border border-border text-sm font-semibold text-content transition-colors hover:bg-neutral-50">
                <KeyRound size={16} className="text-primary-600" /> Reset Password
              </button>
              {selected.status === "locked" && (
                <button className="w-full flex items-center gap-2 px-4 py-2.5 rounded-md border border-border text-sm font-semibold text-content transition-colors hover:bg-neutral-50">
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
                  <button disabled={deleteConfirm !== "DELETE"} className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-bold text-white transition-all bg-error-500 hover:bg-error-600 disabled:opacity-50 disabled:cursor-not-allowed">
                    <Trash2 size={15} /> Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
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
