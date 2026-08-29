"use client";

/**
 * One employer request, and the decisions an admin can take on it.
 *
 * Approving creates an EMPLOYER account and emails a 6-digit activation code — no password
 * is ever sent. The email conflict is decided server-side by the unique index inside the
 * approval transaction, so the dialog below reacts to a 409 rather than pre-checking.
 */

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Mail,
  User,
  Globe,
  FileText,
  Send,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Search,
} from "lucide-react";

import {
  useApproveEmployerRequest,
  useCompanyOptions,
  useCreateCompany,
  useEmployerRequest,
  useResendActivation,
  useReviewEmployerRequest,
} from "@/features/employer-request/hooks/use-employer-requests";
import type {
  AdminCompanyOption,
  DomainCheckResult,
} from "@/features/employer-request/api/employer-request.api";
import {
  STATUS_LABEL,
  STATUS_TONE,
} from "@/features/employer-request/components/request-status";
import { ApiError } from "@/lib/api/client";
import { useDebounce } from "@/shared/hooks/use-debounce";
import { Badge } from "@/shared/components/data-display/badge";
import { Alert } from "@/shared/components/feedback/alert";
import { Skeleton } from "@/shared/components/feedback/skeleton";
import { Modal } from "@/shared/components/ui/modal";
import { toast } from "@/stores/toast-store";

const DOMAIN_CHECK_COPY: Record<DomainCheckResult, { tone: "success" | "warning"; text: string }> = {
  MATCH: { tone: "success", text: "Domain matched the company website" },
  MISMATCH: { tone: "warning", text: "Domain did not match the company website" },
  NO_WEBSITE: { tone: "warning", text: "Company has no website to check against" },
};

export default function EmployerRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: request, isLoading, isError } = useEmployerRequest(id);

  const [dialog, setDialog] = useState<"approve" | "reject" | "info" | null>(null);

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-4">
        <Skeleton className="h-8 w-64 rounded-md" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    );
  }

  if (isError || !request) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-4">
        <BackLink />
        <Alert variant="error">That request could not be loaded.</Alert>
      </div>
    );
  }

  const decided = request.status === "APPROVED" || request.status === "REJECTED";

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl">
      <BackLink />

      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: "var(--color-text-primary)" }}
          >
            {request.companyName}
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
            Submitted {new Date(request.createdAt).toLocaleDateString()}
            {request.hoursAwaitingDecision !== null &&
              ` · waiting ${request.hoursAwaitingDecision}h`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone={STATUS_TONE[request.status]}>
            {STATUS_LABEL[request.status]}
          </Badge>
          {request.breachesSla && <Badge tone="error" dot>Past SLA</Badge>}
        </div>
      </header>

      {request.isPublicDomain && (
        <Alert variant="warning">
          Public email domain. Verify the business documents thoroughly — the address
          proves nothing about the company.
        </Alert>
      )}

      {request.status === "REJECTED" && request.adminNotes && (
        <Alert variant="error">Rejected: {request.adminNotes}</Alert>
      )}

      {request.status === "PENDING_INFO" && (
        <Alert variant="info">
          Waiting on the employer.{request.adminNotes ? ` Asked for: ${request.adminNotes}` : ""}
        </Alert>
      )}

      <Card title="The request">
        <Field icon={<Building2 size={14} />} label="Company" value={request.companyName} />
        <Field icon={<Mail size={14} />} label="Contact email" value={request.companyEmail} />
        <Field
          icon={<User size={14} />}
          label="Contact"
          value={`${request.contactName} — ${request.contactRole}`}
        />
        {request.companyWebsite && (
          <Field
            icon={<Globe size={14} />}
            label="Website"
            value={
              <ExternalLink href={request.companyWebsite}>
                {request.companyWebsite}
              </ExternalLink>
            }
          />
        )}
        {request.supportingDocsUrl && (
          <Field
            icon={<FileText size={14} />}
            label="Documents"
            value={
              <ExternalLink href={request.supportingDocsUrl}>
                Open supporting documents
              </ExternalLink>
            }
          />
        )}
        <Field
          icon={<MessageSquare size={14} />}
          label="What they plan to post"
          value={request.description}
        />
      </Card>

      {request.status === "APPROVED" && (
        <ApprovedPanel requestId={request.id} domainCheck={request.domainCheck} />
      )}

      {!decided && (
        <div className="flex flex-wrap gap-2">
          <Action tone="primary" onClick={() => setDialog("approve")}>
            <CheckCircle2 size={16} /> Approve &amp; create account
          </Action>
          <Action onClick={() => setDialog("info")}>
            <MessageSquare size={16} /> Request more info
          </Action>
          <Action tone="danger" onClick={() => setDialog("reject")}>
            <XCircle size={16} /> Reject
          </Action>
        </div>
      )}

      <ApproveDialog
        open={dialog === "approve"}
        onClose={() => setDialog(null)}
        requestId={request.id}
        companyName={request.companyName}
        companyWebsite={request.companyWebsite}
      />
      <NotesDialog
        open={dialog === "reject"}
        onClose={() => setDialog(null)}
        requestId={request.id}
        mode="reject"
      />
      <NotesDialog
        open={dialog === "info"}
        onClose={() => setDialog(null)}
        requestId={request.id}
        mode="info"
      />
    </div>
  );
}

/* ─────────────────────────── Approve ─────────────────────────── */

function ApproveDialog({
  open,
  onClose,
  requestId,
  companyName,
  companyWebsite,
}: {
  open: boolean;
  onClose: () => void;
  requestId: string;
  companyName: string;
  companyWebsite?: string;
}) {
  /**
   * Seeded with the FIRST WORD of the submitted name, not the whole thing.
   *
   * The full name is an exact string that usually matches nothing — "Acme Robotics" finds
   * no row when the company was ingested as "Acme Robotics Co., Ltd". Seeding the whole
   * name made the dialog open on "no matches" for precisely the requests it exists to
   * approve.
   */
  const [query, setQuery] = useState(() => companyName.trim().split(/\s+/)[0] ?? "");
  const [selected, setSelected] = useState<AdminCompanyOption | null>(null);
  const search = useDebounce(query, 250);

  const {
    data: companies = [],
    isFetching,
    // Surfaced below. Without it a failed search rendered as "no company matches", which
    // sent us hunting for missing data that was there all along.
    error: searchError,
  } = useCompanyOptions(search);
  const approve = useApproveEmployerRequest(requestId);
  const createCompany = useCreateCompany();

  // The email conflict is answered by the unique index during approval, so it arrives as a
  // 409 rather than being known in advance. It gets its own branch because the admin has
  // two specific ways out of it, neither of which is "try again".
  const conflict =
    approve.error instanceof ApiError && approve.error.statusCode === 409
      ? approve.error.message
      : null;
  const otherError =
    approve.error && !conflict
      ? approve.error instanceof Error
        ? approve.error.message
        : "Could not approve this request."
      : null;

  const submit = () => {
    if (!selected) return;
    approve.mutate(selected.id, {
      onSuccess: () => {
        toast.success(
          `Account created. An activation code was emailed to the company address.`,
        );
        onClose();
      },
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Approve and create the account"
      subtitle="This creates an EMPLOYER account and emails a 6-digit activation code. No password is sent."
      footer={
        <div className="flex justify-end gap-2">
          <Action onClick={onClose}>Cancel</Action>
          <Action
            tone="primary"
            onClick={submit}
            disabled={!selected || approve.isPending}
          >
            {approve.isPending ? "Approving…" : "Approve"}
          </Action>
        </div>
      }
    >
      <div className="space-y-3">
        {/* The Approve button is disabled until a row is CLICKED — typing a name is not
            selecting one. Saying so removes the commonest confusion in this dialog. */}
        <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
          {selected ? (
            <span style={{ color: "var(--color-success-600)" }}>
              Selected: <strong>{selected.name}</strong>
            </span>
          ) : (
            "Click a company below to select it, then Approve."
          )}
        </p>

        {conflict && (
          <Alert variant="warning">
            {conflict} Ask them for a different address (Request more info), or reject the
            request.
          </Alert>
        )}
        {otherError && <Alert variant="error">{otherError}</Alert>}

        <div>
          <label
            className="block text-xs font-bold uppercase tracking-wider mb-1.5"
            style={{ color: "var(--color-text-secondary)" }}
            htmlFor="company-search"
          >
            Which company are they approved for?
          </label>
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--color-text-tertiary)" }}
            />
            <input
              id="company-search"
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelected(null);
              }}
              className="w-full pl-9 pr-3 py-2 rounded-md border text-sm outline-none focus:border-primary-500"
              style={{
                background: "var(--color-bg-secondary)",
                borderColor: "var(--color-border)",
                color: "var(--color-text-primary)",
              }}
            />
          </div>
          <p className="text-xs mt-1.5" style={{ color: "var(--color-text-tertiary)" }}>
            They will only be able to claim this company at first login.
          </p>
        </div>

        <div
          className="max-h-56 overflow-y-auto rounded-md border divide-y"
          style={{ borderColor: "var(--color-border)" }}
        >
          {search.trim().length < 2 ? (
            <p className="p-3 text-xs" style={{ color: "var(--color-text-tertiary)" }}>
              Type at least two characters.
            </p>
          ) : isFetching ? (
            <p className="p-3 text-xs" style={{ color: "var(--color-text-tertiary)" }}>
              Searching…
            </p>
          ) : searchError ? (
            <p className="p-3 text-xs" style={{ color: "var(--color-error-600)" }}>
              Could not search companies:{" "}
              {searchError instanceof Error ? searchError.message : "request failed"}
            </p>
          ) : companies.length === 0 ? (
            <div className="p-3 space-y-2">
              <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                No company named “{search}”. A brand-new employer usually has no company
                row yet — create one from this request.
              </p>
              <button
                type="button"
                disabled={createCompany.isPending}
                onClick={() =>
                  createCompany.mutate(
                    { name: companyName, website: companyWebsite },
                    {
                      // Select it straight away: the admin asked for this company, so
                      // making them search again for the row they just made is busywork.
                      onSuccess: (created) => {
                        setSelected(created);
                        setQuery(created.name);
                      },
                    },
                  )
                }
                className="text-xs font-bold underline disabled:opacity-50"
                style={{ color: "var(--color-primary-600)" }}
              >
                {createCompany.isPending
                  ? "Creating…"
                  : `Create “${companyName}” and select it`}
              </button>
              {createCompany.isError && (
                <p className="text-xs" style={{ color: "var(--color-error-600)" }}>
                  {createCompany.error instanceof Error
                    ? createCompany.error.message
                    : "Could not create the company."}
                </p>
              )}
            </div>
          ) : (
            companies.map((company) => (
              <button
                key={company.id}
                type="button"
                disabled={company.isClaimed}
                onClick={() => setSelected(company)}
                className="w-full text-left px-3 py-2.5 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background:
                    selected?.id === company.id
                      ? "var(--color-primary-50)"
                      : "transparent",
                  color: "var(--color-text-primary)",
                }}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate">{company.name}</span>
                  {company.isClaimed ? (
                    <Badge tone="neutral">Already claimed</Badge>
                  ) : company.isVerified ? (
                    <Badge tone="success">Verified</Badge>
                  ) : null}
                </span>
                {company.website && (
                  <span
                    className="block text-xs truncate"
                    style={{ color: "var(--color-text-tertiary)" }}
                  >
                    {company.website}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
}

/* ─────────────────────────── Reject / Request info ─────────────────────────── */

function NotesDialog({
  open,
  onClose,
  requestId,
  mode,
}: {
  open: boolean;
  onClose: () => void;
  requestId: string;
  mode: "reject" | "info";
}) {
  const [notes, setNotes] = useState("");
  const review = useReviewEmployerRequest(requestId);

  const rejecting = mode === "reject";
  // The backend requires a reason on a rejection, because it is emailed verbatim. Mirror
  // that here so the admin is not told about it by a 400.
  const canSubmit = rejecting ? notes.trim().length > 0 : true;

  const submit = () => {
    review.mutate(
      {
        status: rejecting ? "REJECTED" : "PENDING_INFO",
        adminNotes: notes.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success(rejecting ? "Request rejected." : "Marked as waiting on them.");
          setNotes("");
          onClose();
        },
        onError: (e) =>
          toast.error(e instanceof Error ? e.message : "Could not save that."),
      },
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={rejecting ? "Reject this request" : "Request more information"}
      subtitle={
        rejecting
          ? "The reason is emailed to the employer exactly as written."
          : "Note what is missing. The request moves to “waiting on them”."
      }
      footer={
        <div className="flex justify-end gap-2">
          <Action onClick={onClose}>Cancel</Action>
          <Action
            tone={rejecting ? "danger" : "primary"}
            onClick={submit}
            disabled={!canSubmit || review.isPending}
          >
            {review.isPending ? "Saving…" : rejecting ? "Reject" : "Save"}
          </Action>
        </div>
      }
    >
      <label
        className="block text-xs font-bold uppercase tracking-wider mb-1.5"
        style={{ color: "var(--color-text-secondary)" }}
        htmlFor="admin-notes"
      >
        {rejecting ? "Reason (required)" : "What do you need from them?"}
      </label>
      <textarea
        id="admin-notes"
        rows={4}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="w-full px-3 py-2 rounded-md border text-sm outline-none focus:border-primary-500 resize-y"
        style={{
          background: "var(--color-bg-secondary)",
          borderColor: "var(--color-border)",
          color: "var(--color-text-primary)",
        }}
      />
    </Modal>
  );
}

/* ─────────────────────────── Approved state ─────────────────────────── */

function ApprovedPanel({
  requestId,
  domainCheck,
}: {
  requestId: string;
  domainCheck?: DomainCheckResult;
}) {
  const resend = useResendActivation(requestId);
  const signal = domainCheck ? DOMAIN_CHECK_COPY[domainCheck] : null;

  return (
    <Card title="Account">
      <div className="space-y-3">
        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          The account exists but cannot sign in until the employer uses the activation code.
        </p>

        {signal && (
          <div className="flex items-center gap-2">
            <Badge tone={signal.tone}>{signal.text}</Badge>
            <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
              Advisory — your approval is what verified them.
            </span>
          </div>
        )}

        <Action
          onClick={() =>
            resend.mutate(undefined, {
              onSuccess: (r) => toast.success(r.message),
              onError: (e) =>
                toast.error(e instanceof Error ? e.message : "Could not resend."),
            })
          }
          disabled={resend.isPending}
        >
          <Send size={16} /> {resend.isPending ? "Sending…" : "Resend activation code"}
        </Action>
      </div>
    </Card>
  );
}

/* ─────────────────────────── primitives ─────────────────────────── */

function BackLink() {
  return (
    <Link
      href="/admin/employer-requests"
      className="inline-flex items-center gap-1.5 text-sm font-medium"
      style={{ color: "var(--color-text-secondary)" }}
    >
      <ArrowLeft size={16} /> All requests
    </Link>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section
      className="rounded-lg border p-5 space-y-3"
      style={{
        background: "var(--color-card)",
        borderColor: "var(--color-border)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <h2 className="text-base font-bold" style={{ color: "var(--color-text-primary)" }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Field({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[11rem_1fr] gap-1 sm:gap-3">
      <span
        className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider"
        style={{ color: "var(--color-text-tertiary)" }}
      >
        {icon} {label}
      </span>
      <span className="text-sm break-words" style={{ color: "var(--color-text-primary)" }}>
        {value}
      </span>
    </div>
  );
}

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  const safe = /^https?:\/\//i.test(href) ? href : `https://${href}`;
  return (
    <a
      href={safe}
      target="_blank"
      // Employer-supplied URL: noopener/noreferrer so the opened page cannot reach back
      // into the admin session through window.opener.
      rel="noopener noreferrer"
      className="underline"
      style={{ color: "var(--color-primary-600)" }}
    >
      {children}
    </a>
  );
}

function Action({
  children,
  onClick,
  tone = "neutral",
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  tone?: "neutral" | "primary" | "danger";
  disabled?: boolean;
}) {
  const styles =
    tone === "primary"
      ? { background: "var(--color-primary-600)", color: "var(--color-text-on-primary)", borderColor: "transparent" }
      : tone === "danger"
        ? { background: "var(--color-card)", color: "var(--color-error-600)", borderColor: "var(--color-error-500)" }
        : { background: "var(--color-card)", color: "var(--color-text-secondary)", borderColor: "var(--color-border)" };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-md border text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      style={styles}
    >
      {children}
    </button>
  );
}
