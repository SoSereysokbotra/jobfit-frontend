"use client";

/**
 * The employer review queue.
 *
 * Employers cannot self-register, so every approval made here creates an EMPLOYER account
 * — this screen is the only path to one (docs/EMPLOYER_ONBOARDING_PLAN.md Phase 5).
 */

import React, { useState } from "react";
import Link from "next/link";
import { Search, Inbox, Clock, AlertTriangle, ChevronRight, Plus } from "lucide-react";

import {
  useCreateEmployerRequest,
  useEmployerRequests,
} from "@/features/employer-request/hooks/use-employer-requests";
import { Modal } from "@/shared/components/ui/modal";
import { toast } from "@/stores/toast-store";
import type {
  EmployerRequest,
  EmployerRequestStatus,
} from "@/features/employer-request/api/employer-request.api";
import { useDebounce } from "@/shared/hooks/use-debounce";
import { Badge } from "@/shared/components/data-display/badge";
import {
  STATUS_LABEL,
  STATUS_TONE,
} from "@/features/employer-request/components/request-status";
import { EmptyState } from "@/shared/components/data-display/empty-state";
import { Skeleton } from "@/shared/components/feedback/skeleton";
import { Alert } from "@/shared/components/feedback/alert";

const FILTERS: { label: string; value?: EmployerRequestStatus }[] = [
  { label: "All" },
  { label: "New", value: "SUBMITTED" },
  { label: "Reviewing", value: "REVIEWING" },
  { label: "Waiting on them", value: "PENDING_INFO" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
];

export default function EmployerRequestsPage() {
  const [status, setStatus] = useState<EmployerRequestStatus | undefined>();
  const [query, setQuery] = useState("");
  const [newOpen, setNewOpen] = useState(false);
  const search = useDebounce(query, 250);

  const { data, isLoading, isError, error } = useEmployerRequests({
    status,
    search: search.trim() || undefined,
  });

  const items = data?.items ?? [];
  const overdue = items.filter((r) => r.breachesSla).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: "var(--color-text-primary)" }}
          >
            Employer Requests
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
            Companies asking to post jobs. Approving one creates their account.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {overdue > 0 && (
            <Badge tone="error" dot>
              {overdue} past the 48-hour SLA
            </Badge>
          )}
          <button
            type="button"
            onClick={() => setNewOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 transition-all duration-200"
          >
            <Plus size={16} /> New request
          </button>
        </div>
      </header>

      <NewRequestDialog open={newOpen} onClose={() => setNewOpen(false)} />

      {isError && (
        <Alert variant="error">
          {error instanceof Error ? error.message : "Could not load the queue."}
        </Alert>
      )}

      {/* Filters + search */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const active = status === f.value;
            return (
              <button
                key={f.label}
                type="button"
                onClick={() => setStatus(f.value)}
                className="px-3 py-1.5 rounded-md text-xs font-semibold border transition-all duration-200"
                style={{
                  background: active
                    ? "var(--color-primary-50)"
                    : "var(--color-card)",
                  borderColor: active
                    ? "var(--color-primary-500)"
                    : "var(--color-border)",
                  color: active
                    ? "var(--color-primary-700)"
                    : "var(--color-text-secondary)",
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        <div className="relative sm:ml-auto sm:w-72">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "var(--color-text-tertiary)" }}
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Company or email…"
            aria-label="Search employer requests"
            className="w-full pl-9 pr-3 py-2 rounded-md border text-sm outline-none transition-all duration-200 focus:border-primary-500"
            style={{
              background: "var(--color-card)",
              borderColor: "var(--color-border)",
              color: "var(--color-text-primary)",
            }}
          />
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Inbox size={26} />}
          title={search || status ? "Nothing matches" : "No requests yet"}
          description={
            search || status
              ? "Try a different filter or search term."
              : "When a company asks to join, their request lands here for review."
          }
        />
      ) : (
        <ul className="space-y-2">
          {items.map((request) => (
            <li key={request.id}>
              <RequestRow request={request} />
            </li>
          ))}
        </ul>
      )}

      {data && data.total > items.length && (
        <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
          Showing {items.length} of {data.total}.
        </p>
      )}
    </div>
  );
}

function RequestRow({ request }: { request: EmployerRequest }) {
  return (
    <Link
      href={`/admin/employer-requests/${request.id}`}
      className="flex items-center gap-4 p-4 rounded-lg border transition-all duration-200 hover:shadow-md"
      style={{
        background: "var(--color-card)",
        // The SLA breach is the one thing that must read at a glance in a long queue, so
        // it changes the row's own border rather than adding another pill to scan past.
        borderColor: request.breachesSla
          ? "var(--color-error-500)"
          : "var(--color-border)",
      }}
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="font-semibold truncate"
            style={{ color: "var(--color-text-primary)" }}
          >
            {request.companyName}
          </span>
          <Badge tone={STATUS_TONE[request.status]}>
            {STATUS_LABEL[request.status]}
          </Badge>
          {request.isPublicDomain && (
            <Badge tone="warning">Public domain</Badge>
          )}
        </div>
        <p
          className="text-xs mt-1 truncate"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {request.contactName} · {request.contactRole} · {request.companyEmail}
        </p>
      </div>

      <div className="shrink-0 text-right">
        <WaitingFor request={request} />
      </div>

      <ChevronRight
        size={18}
        className="shrink-0"
        style={{ color: "var(--color-text-tertiary)" }}
      />
    </Link>
  );
}

/** Age, but only while it still means something — it is null once decided. */
function WaitingFor({ request }: { request: EmployerRequest }) {
  if (request.hoursAwaitingDecision === null) {
    return (
      <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
        {request.reviewedAt
          ? new Date(request.reviewedAt).toLocaleDateString()
          : "—"}
      </span>
    );
  }

  const hours = request.hoursAwaitingDecision;
  const label = hours < 24 ? `${hours}h` : `${Math.floor(hours / 24)}d`;

  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-semibold"
      style={{
        color: request.breachesSla
          ? "var(--color-error-600)"
          : "var(--color-text-tertiary)",
      }}
    >
      {request.breachesSla ? <AlertTriangle size={12} /> : <Clock size={12} />}
      {label}
    </span>
  );
}

/* ─────────────────────────── New request ───────────────────────────
   Employers cannot register through the website (employer_logic.md v2.1 §3.1) — they email
   or Telegram the admin, who records what they sent here. This form is the only way a
   request enters the queue. */

const FIELDS = [
  { name: "companyName", label: "Company name", required: true },
  { name: "companyEmail", label: "Official company email", required: true, type: "email" },
  { name: "contactName", label: "Contact person", required: true },
  { name: "contactRole", label: "Their role", required: true },
  { name: "companyWebsite", label: "Website or social page", required: false },
  { name: "supportingDocsUrl", label: "Link to supporting documents", required: false },
] as const;

type FieldName = (typeof FIELDS)[number]["name"];

function NewRequestDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [values, setValues] = useState<Record<FieldName, string>>({
    companyName: "",
    companyEmail: "",
    contactName: "",
    contactRole: "",
    companyWebsite: "",
    supportingDocsUrl: "",
  });
  const [description, setDescription] = useState("");
  const create = useCreateEmployerRequest();

  const set = (name: FieldName, v: string) =>
    setValues((prev) => ({ ...prev, [name]: v }));

  const complete =
    FIELDS.every((f) => !f.required || values[f.name].trim()) && description.trim();

  const submit = () => {
    create.mutate(
      {
        companyName: values.companyName.trim(),
        companyEmail: values.companyEmail.trim(),
        contactName: values.contactName.trim(),
        contactRole: values.contactRole.trim(),
        description: description.trim(),
        companyWebsite: values.companyWebsite.trim() || undefined,
        supportingDocsUrl: values.supportingDocsUrl.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Request added to the queue.");
          setValues({
            companyName: "",
            companyEmail: "",
            contactName: "",
            contactRole: "",
            companyWebsite: "",
            supportingDocsUrl: "",
          });
          setDescription("");
          onClose();
        },
      },
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Record an employer request"
      subtitle="From the email or Telegram message they sent you."
      footer={
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md border text-sm font-semibold"
            style={{
              borderColor: "var(--color-border)",
              color: "var(--color-text-secondary)",
              background: "var(--color-card)",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!complete || create.isPending}
            className="px-4 py-2 rounded-md text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {create.isPending ? "Adding…" : "Add to queue"}
          </button>
        </div>
      }
    >
      <div className="space-y-3">
        {create.isError && (
          <Alert variant="error">
            {create.error instanceof Error
              ? create.error.message
              : "Could not add the request."}
          </Alert>
        )}

        {FIELDS.map((f) => (
          <div key={f.name}>
            <label
              htmlFor={f.name}
              className="block text-xs font-bold uppercase tracking-wider mb-1.5"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {f.label}
              {!f.required && " (optional)"}
            </label>
            <input
              id={f.name}
              type={"type" in f ? f.type : "text"}
              value={values[f.name]}
              onChange={(e) => set(f.name, e.target.value)}
              className="w-full px-3 py-2 rounded-md border text-sm outline-none focus:border-primary-500"
              style={{
                background: "var(--color-bg-secondary)",
                borderColor: "var(--color-border)",
                color: "var(--color-text-primary)",
              }}
            />
          </div>
        ))}

        <div>
          <label
            htmlFor="description"
            className="block text-xs font-bold uppercase tracking-wider mb-1.5"
            style={{ color: "var(--color-text-secondary)" }}
          >
            What they plan to post
          </label>
          <textarea
            id="description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 rounded-md border text-sm outline-none focus:border-primary-500 resize-y"
            style={{
              background: "var(--color-bg-secondary)",
              borderColor: "var(--color-border)",
              color: "var(--color-text-primary)",
            }}
          />
        </div>
      </div>
    </Modal>
  );
}
