"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Briefcase, Clock, UserPlus, Check } from "lucide-react";
import {
  useApplication,
  useApplicationTimeline,
  useUpdateApplicationStatus,
  useAddContactPerson,
} from "@/features/application/hooks/use-applications";
import { ApplicationTimeline } from "@/features/application/components/application-timeline";
import { InterviewScheduler } from "@/features/application/components/interview-scheduler";
import { SELECTABLE_STATUSES, STATUS_META } from "@/features/application/api/application.mappers";
import type { ApplicationStatus } from "@/features/application/api/application.api";
import { Badge } from "@/shared/components/data-display/badge";
import { Button } from "@/shared/components/ui/button";
import { Alert } from "@/shared/components/feedback/alert";
import { Skeleton } from "@/shared/components/feedback/skeleton";
import { EmptyState } from "@/shared/components/data-display/empty-state";

export default function ApplicationDetailPage() {
  const { applicationId } = useParams<{ applicationId: string }>();
  const { data: application, isLoading, isError, error } = useApplication(applicationId);
  const { data: timeline = [], isLoading: timelineLoading } = useApplicationTimeline(applicationId);
  const updateStatus = useUpdateApplicationStatus();

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-5 max-w-4xl mx-auto">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-28 rounded-lg" />
        <Skeleton className="h-56 rounded-lg" />
      </div>
    );
  }

  if (isError || !application) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
        <EmptyState
          title="Application not found"
          description={
            error instanceof Error ? error.message : "This application doesn't exist or isn't yours."
          }
          action={
            <Link
              href="/applications"
              className="px-4 py-2 rounded-md text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 transition-all duration-200"
            >
              Back to applications
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6" style={{ background: "var(--color-bg-secondary)" }}>
      <Link
        href="/applications"
        className="inline-flex items-center gap-1.5 text-sm font-semibold hover:underline"
        style={{ color: "var(--color-text-secondary)" }}
      >
        <ArrowLeft size={15} /> All applications
      </Link>

      {/* Header */}
      <div
        className="p-6 rounded-lg border"
        style={{ background: "var(--color-card)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
      >
        <div className="flex items-start gap-4">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-lg font-bold shrink-0"
            style={{ background: application.logoBg }}
          >
            {application.logo}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h1 className="text-xl font-bold" style={{ color: "var(--color-text-primary)" }}>
                {application.jobTitle}
              </h1>
              <Badge tone={application.statusMeta.tone} dot className="shrink-0">
                {application.statusMeta.label}
              </Badge>
            </div>
            <p className="text-sm mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
              {application.company} · {application.location}
            </p>
            <div className="flex flex-wrap gap-4 mt-3">
              <span className="flex items-center gap-1.5 text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                <Clock size={13} /> {application.appliedLabel}
              </span>
              <Link
                href={`/jobs/${application.jobId}`}
                className="flex items-center gap-1.5 text-xs font-semibold hover:underline"
                style={{ color: "var(--color-primary-600)" }}
              >
                <Briefcase size={13} /> View job posting
              </Link>
            </div>
          </div>
        </div>

        {/* Status changer */}
        <div className="mt-5 pt-4 border-t flex flex-wrap items-center gap-3" style={{ borderColor: "var(--color-border)" }}>
          <label className="text-xs font-semibold" style={{ color: "var(--color-text-secondary)" }}>
            Update status
          </label>
          <select
            value={application.status}
            disabled={updateStatus.isPending}
            onChange={(e) =>
              updateStatus.mutate({ id: application.id, newStatus: e.target.value as ApplicationStatus })
            }
            className="text-xs font-semibold rounded-md border px-2.5 py-1.5 outline-none cursor-pointer disabled:opacity-50"
            style={{ borderColor: "var(--color-border)", background: "var(--color-bg)", color: "var(--color-text-primary)" }}
          >
            {SELECTABLE_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_META[s].label}
              </option>
            ))}
          </select>
          {updateStatus.isPending && (
            <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>Saving…</span>
          )}
          {updateStatus.isError && (
            <span className="text-xs" style={{ color: "var(--color-error-600)" }}>
              {updateStatus.error instanceof Error ? updateStatus.error.message : "Update failed"}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Timeline */}
        <div
          className="lg:col-span-2 p-6 rounded-lg border"
          style={{ background: "var(--color-card)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
        >
          <h2 className="text-sm font-bold mb-4" style={{ color: "var(--color-text-primary)" }}>
            Timeline
          </h2>
          <ApplicationTimeline entries={timeline} loading={timelineLoading} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <InterviewScheduler status={application.status} />
          <AddContactPerson applicationId={application.id} />
        </div>
      </div>
    </div>
  );
}

/**
 * Add a contact person to the application (POST /applications/{id}/contact-person).
 * There is no GET for contacts, so this confirms the add without listing them.
 */
function AddContactPerson({ applicationId }: { applicationId: string }) {
  const addContact = useAddContactPerson(applicationId);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [email, setEmail] = useState("");

  if (addContact.isSuccess) {
    return (
      <div
        className="p-5 rounded-lg border"
        style={{ background: "var(--color-card)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
      >
        <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--color-success-600)" }}>
          <Check size={16} /> Contact added
        </div>
        <button
          onClick={() => {
            addContact.reset();
            setName("");
            setTitle("");
            setEmail("");
            setOpen(true);
          }}
          className="text-xs font-semibold mt-2 hover:underline"
          style={{ color: "var(--color-primary-600)" }}
        >
          Add another
        </button>
      </div>
    );
  }

  return (
    <div
      className="p-5 rounded-lg border"
      style={{ background: "var(--color-card)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
    >
      <div className="flex items-center gap-2 mb-3">
        <UserPlus size={16} style={{ color: "var(--color-primary-600)" }} />
        <h3 className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>
          Contact person
        </h3>
      </div>

      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="text-xs font-semibold hover:underline"
          style={{ color: "var(--color-primary-600)" }}
        >
          + Add a recruiter or hiring manager
        </button>
      ) : (
        <form
          className="space-y-2.5"
          onSubmit={(e) => {
            e.preventDefault();
            if (name.trim().length === 0) return;
            addContact.mutate({
              name: name.trim(),
              title: title.trim() || undefined,
              email: email.trim() || undefined,
            });
          }}
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name *"
            required
            className="w-full text-sm rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500"
            style={{ borderColor: "var(--color-border)", background: "var(--color-bg)", color: "var(--color-text-primary)" }}
          />
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title (e.g. Recruiter)"
            className="w-full text-sm rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500"
            style={{ borderColor: "var(--color-border)", background: "var(--color-bg)", color: "var(--color-text-primary)" }}
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Email"
            className="w-full text-sm rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500"
            style={{ borderColor: "var(--color-border)", background: "var(--color-bg)", color: "var(--color-text-primary)" }}
          />
          {addContact.isError && (
            <Alert variant="error">
              {addContact.error instanceof Error ? addContact.error.message : "Could not add contact."}
            </Alert>
          )}
          <div className="flex gap-2">
            <Button type="submit" loading={addContact.isPending} loadingText="Saving…" className="text-xs py-2 px-4">
              Save
            </Button>
            <Button type="button" variant="ghost" className="text-xs py-2 px-4" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
