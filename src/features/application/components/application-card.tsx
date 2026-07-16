"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Eye, StickyNote, Calendar, Send, XCircle, RefreshCw, Check, Clock,
} from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { Badge } from "@/shared/components/ui/badge";
import { NotesEditor } from "@/shared/components/ui/notes-editor";
import MatchScoreBadge from "@/shared/components/data-display/match-score-badge";
import { formatDaysAgo, formatInDays } from "@/lib/utils/format";
import {
  APPLICATION_STATUSES, STATUS_CONFIG,
  type Application, type ApplicationStatus,
} from "../api/application.api";

interface ApplicationCardProps {
  app: Application;
  selectMode?: boolean;
  selected?: boolean;
  onToggleSelect?: (id: string) => void;
  onUpdateStatus?: (id: string, status: ApplicationStatus) => void;
  onUpdateNotes?: (id: string, notes: string) => void;
  onWithdraw?: (id: string) => void;
}

/** Timeline milestones line: Applied → Viewed → Interview → Next update. */
function TimelineInfo({ app }: { app: Application }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
      <span className="flex items-center gap-1 text-xs" style={{ color: "var(--color-text-tertiary)" }}>
        <Send size={11} /> Applied {formatDaysAgo(app.appliedDaysAgo)}
      </span>
      {app.viewedDaysAgo !== undefined && (
        <span className="flex items-center gap-1 text-xs" style={{ color: "var(--color-text-tertiary)" }}>
          <Eye size={11} /> Viewed {formatDaysAgo(app.viewedDaysAgo)}
        </span>
      )}
      {app.interview && (
        <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: "var(--color-success-600)" }}>
          <Calendar size={11} /> Interview {formatInDays(app.interview.inDays)}, {app.interview.time}
        </span>
      )}
      {app.offer && (
        <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: "var(--color-primary-600)" }}>
          <Calendar size={11} /> Respond by {app.offer.respondBy}
        </span>
      )}
      {app.nextUpdateInDays !== undefined && !app.interview && !app.offer && (
        <span className="flex items-center gap-1 text-xs" style={{ color: "var(--color-text-disabled)" }}>
          <Clock size={11} /> Next update expected {formatInDays(app.nextUpdateInDays)}
        </span>
      )}
    </div>
  );
}

/**
 * Application row for the tracker list view (Flow 3A-1): job info, color-coded
 * status, timeline milestones, notes with auto-save, and quick actions.
 */
export function ApplicationCard({
  app,
  selectMode = false,
  selected = false,
  onToggleSelect,
  onUpdateStatus,
  onUpdateNotes,
  onWithdraw,
}: ApplicationCardProps) {
  const [notesOpen, setNotesOpen] = useState(false);
  const [statusPickerOpen, setStatusPickerOpen] = useState(false);
  const { job } = app;
  const status = STATUS_CONFIG[app.status];

  const smallBtn =
    "px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-200 active:scale-95 inline-flex items-center justify-center gap-1";

  return (
    <div
      className={cn(
        "rounded-lg border p-5 transition-all duration-200 hover:shadow-md",
        selected && "ring-2 ring-primary-500",
      )}
      style={{ background: "var(--color-card)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
    >
      {/* ── Header row ─────────────────────────────────────── */}
      <div className="flex items-start gap-3">
        {selectMode && (
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onToggleSelect?.(app.id)}
            aria-label={`Select application to ${job.company}`}
            className="w-4 h-4 rounded mt-3 shrink-0 accent-primary-600 cursor-pointer"
          />
        )}
        <div
          className="w-11 h-11 rounded-lg flex items-center justify-center text-white font-extrabold text-base shrink-0"
          style={{ background: job.logoBg, boxShadow: "var(--shadow-sm)" }}
        >
          {job.logo}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/applications/${app.id}`}>
              <h3
                className="text-sm font-bold truncate hover:text-primary-700 transition-colors"
                style={{ color: "var(--color-text-primary)" }}
              >
                {job.title}
              </h3>
            </Link>
            <Badge variant={status.badge}>{status.label}</Badge>
          </div>
          <p className="text-xs mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
            {job.company} · {job.location}
          </p>
          <TimelineInfo app={app} />
        </div>
        <MatchScoreBadge score={job.match} size="sm" className="shrink-0" />
      </div>

      {/* ── Inline status picker (manual override, spec 3A-2) ─ */}
      {statusPickerOpen && (
        <div
          className="flex flex-wrap gap-1.5 mt-3 p-2.5 rounded-md border animate-fade-in"
          style={{ background: "var(--color-bg-secondary)", borderColor: "var(--color-neutral-100)" }}
        >
          <span className="text-xs font-semibold w-full" style={{ color: "var(--color-text-tertiary)" }}>
            Move this application to:
          </span>
          {APPLICATION_STATUSES.map((s) => {
            const active = app.status === s;
            return (
              <button
                key={s}
                onClick={() => {
                  onUpdateStatus?.(app.id, s);
                  setStatusPickerOpen(false);
                }}
                className={cn(
                  "text-xs font-semibold px-2.5 py-1 rounded-full border transition-all duration-200 inline-flex items-center gap-1",
                  active
                    ? "border-primary-300 bg-primary-50 text-primary-700"
                    : "border-neutral-200 text-neutral-600 hover:bg-neutral-50",
                )}
                style={{ background: active ? undefined : "var(--color-bg)" }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: STATUS_CONFIG[s].dot }} />
                {active && <Check size={10} />}
                {s}
              </button>
            );
          })}
        </div>
      )}

      {/* ── Notes ──────────────────────────────────────────── */}
      {notesOpen ? (
        <div className="mt-3">
          <NotesEditor
            value={app.notes}
            onSave={(n) => onUpdateNotes?.(app.id, n)}
            onDone={() => setNotesOpen(false)}
            placeholder="Add notes about this application… (follow-ups, interview details)"
          />
        </div>
      ) : (
        app.notes && (
          <button
            onClick={() => setNotesOpen(true)}
            className="w-full text-left mt-3 px-3 py-2 rounded-md text-xs flex items-start gap-2 transition-colors hover:bg-primary-50"
            style={{ background: "var(--color-bg-secondary)", color: "var(--color-text-secondary)" }}
          >
            <StickyNote size={13} className="shrink-0 mt-0.5" style={{ color: "var(--color-primary-400)" }} />
            <span className="line-clamp-1">{app.notes}</span>
          </button>
        )
      )}

      {/* ── Actions ────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-1.5 mt-4 pt-3 border-t" style={{ borderColor: "var(--color-neutral-100)" }}>
        {app.status === "Interview" && (
          <Link
            href="/learning"
            className={cn(smallBtn, "text-white bg-success-500 hover:bg-success-600")}
          >
            <Calendar size={12} /> Prep for interview
          </Link>
        )}
        <Link
          href={`/applications/${app.id}`}
          className={cn(smallBtn, "text-white bg-primary-600 hover:bg-primary-700")}
        >
          View
        </Link>
        <button
          onClick={() => setNotesOpen((v) => !v)}
          className={cn(smallBtn, "border border-neutral-200 text-neutral-600 hover:bg-neutral-50")}
        >
          <StickyNote size={12} /> {app.notes ? "Edit notes" : "Add notes"}
        </button>
        <button
          onClick={() => setStatusPickerOpen((v) => !v)}
          className={cn(smallBtn, "border border-neutral-200 text-neutral-600 hover:bg-neutral-50")}
        >
          <RefreshCw size={12} /> Update status
        </button>
        {app.status !== "Withdrawn" && app.status !== "Rejected" && (
          <button
            onClick={() => onWithdraw?.(app.id)}
            className={cn(smallBtn, "ml-auto border border-error-100 text-error-500 hover:bg-error-50")}
          >
            <XCircle size={12} /> Withdraw
          </button>
        )}
      </div>
    </div>
  );
}
