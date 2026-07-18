"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  MapPin, DollarSign, Clock, Heart, Share2, StickyNote,
  Plus, Check, Tag as TagIcon,
} from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { Badge, type BadgeVariant } from "@/shared/components/ui/badge";
import { NotesEditor } from "@/shared/components/ui/notes-editor";
import MatchScoreBadge from "@/shared/components/data-display/match-score-badge";
import { formatSalaryRange } from "@/shared/types/shared.types";
import { PRESET_TAGS, type SavedJob, type SavedJobStatus } from "../api/saved-jobs.api";

const STATUS_BADGE: Record<SavedJobStatus, { label: string; variant: BadgeVariant }> = {
  Applied: { label: "✓ Applied", variant: "success" },
  Waiting: { label: "Waiting", variant: "warning" },
  Interview: { label: "Interview scheduled", variant: "info" },
  Rejected: { label: "Rejected", variant: "error" },
};

function formatSavedDate(daysAgo: number): string {
  if (daysAgo <= 0) return "Saved today";
  if (daysAgo === 1) return "Saved yesterday";
  return `Saved ${daysAgo} days ago`;
}

interface SavedJobCardProps {
  item: SavedJob;
  selectMode?: boolean;
  selected?: boolean;
  onToggleSelect?: (id: string) => void;
  onApply?: (id: string) => void;
  onRemove?: (id: string) => void;
  onUpdateNotes?: (id: string, notes: string) => void;
  onToggleTag?: (id: string, tag: string) => void;
}

/**
 * Saved-job card (Path 2C-1): JobCard visual language plus the personal
 * layer — status badge, tags (inline add, no modal), auto-saving notes,
 * saved date, share, and unsave with confirmation.
 */
export function SavedJobCard({
  item,
  selectMode = false,
  selected = false,
  onToggleSelect,
  onApply,
  onRemove,
  onUpdateNotes,
  onToggleTag,
}: SavedJobCardProps) {
  const { job, savedDaysAgo, status, tags, notes } = item;

  const [notesOpen, setNotesOpen] = useState(false);
  const [tagPickerOpen, setTagPickerOpen] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [copied, setCopied] = useState(false);

  const share = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/jobs/${job.id}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard unavailable — ignore */ }
  };

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
            onChange={() => onToggleSelect?.(job.id)}
            aria-label={`Select ${job.title}`}
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
          <Link href={`/jobs/${job.id}`} className="block">
            <h3
              className="text-sm font-bold truncate hover:text-primary-700 transition-colors"
              style={{ color: "var(--color-text-primary)" }}
            >
              {job.title}
            </h3>
          </Link>
          <p className="text-xs mt-0.5" style={{ color: "var(--color-text-secondary)" }}>{job.company}</p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
            <span className="flex items-center gap-1 text-xs" style={{ color: "var(--color-text-tertiary)" }}>
              <MapPin size={11} /> {job.location}
            </span>
            <span className="flex items-center gap-1 text-xs font-medium" style={{ color: "var(--color-success-600)" }}>
              <DollarSign size={11} /> {formatSalaryRange(job)}
            </span>
            <Badge variant="primary">{job.type}</Badge>
            <Badge variant="neutral">{job.remote}</Badge>
          </div>
        </div>
        <MatchScoreBadge score={job.match} size="sm" className="shrink-0" />
      </div>

      {/* ── Status + saved date + tags ─────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 mt-3">
        {status && <Badge variant={STATUS_BADGE[status].variant}>{STATUS_BADGE[status].label}</Badge>}
        {tags.map((tag) => (
          <button
            key={tag}
            onClick={() => onToggleTag?.(job.id, tag)}
            title="Remove tag"
            className="text-xs font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1 border transition-colors hover:bg-primary-100"
            style={{
              background: "var(--color-primary-50)",
              borderColor: "var(--color-primary-100)",
              color: "var(--color-primary-700)",
            }}
          >
            <TagIcon size={10} /> {tag}
          </button>
        ))}
        <button
          onClick={() => setTagPickerOpen((v) => !v)}
          className="text-xs font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-0.5 border border-dashed transition-colors hover:bg-neutral-50"
          style={{ borderColor: "var(--color-neutral-300)", color: "var(--color-text-tertiary)" }}
        >
          <Plus size={10} /> Tag
        </button>
        <span className="flex items-center gap-1 text-xs ml-auto" style={{ color: "var(--color-text-disabled)" }}>
          <Clock size={11} /> {formatSavedDate(savedDaysAgo)}
        </span>
      </div>

      {/* Inline tag picker (spec: quick to add — inline, not a modal) */}
      {tagPickerOpen && (
        <div
          className="flex flex-wrap gap-1.5 mt-2 p-2.5 rounded-md border animate-fade-in"
          style={{ background: "var(--color-bg-secondary)", borderColor: "var(--color-neutral-100)" }}
        >
          {PRESET_TAGS.map((tag) => {
            const active = tags.includes(tag);
            return (
              <button
                key={tag}
                onClick={() => onToggleTag?.(job.id, tag)}
                className={cn(
                  "text-xs font-semibold px-2.5 py-1 rounded-full border transition-all duration-200 inline-flex items-center gap-1",
                  active ? "border-primary-300 bg-primary-50 text-primary-700" : "border-neutral-200 text-neutral-600 hover:bg-neutral-50",
                )}
                style={{ background: active ? undefined : "var(--color-bg)" }}
              >
                {active && <Check size={10} />}
                {tag}
              </button>
            );
          })}
        </div>
      )}

      {/* ── Notes ──────────────────────────────────────────── */}
      {notesOpen ? (
        <div className="mt-3">
          <NotesEditor
            value={notes}
            onSave={(n) => onUpdateNotes?.(job.id, n)}
            onDone={() => setNotesOpen(false)}
            placeholder="Add notes about this job… (e.g. follow-ups, salary thoughts)"
          />
        </div>
      ) : (
        notes && (
          <button
            onClick={() => setNotesOpen(true)}
            className="w-full text-left mt-3 px-3 py-2 rounded-md text-xs flex items-start gap-2 transition-colors hover:bg-primary-50"
            style={{ background: "var(--color-bg-secondary)", color: "var(--color-text-secondary)" }}
          >
            <StickyNote size={13} className="shrink-0 mt-0.5" style={{ color: "var(--color-primary-400)" }} />
            <span className="line-clamp-1">{notes}</span>
          </button>
        )
      )}

      {/* ── Actions ────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-1.5 mt-4 pt-3 border-t" style={{ borderColor: "var(--color-neutral-100)" }}>
        {confirmRemove ? (
          <>
            <span className="text-xs font-semibold mr-auto" style={{ color: "var(--color-text-secondary)" }}>
              Remove from saved jobs?
            </span>
            <button
              onClick={() => onRemove?.(job.id)}
              className={cn(smallBtn, "text-white bg-error-500 hover:bg-error-600")}
            >
              Yes, remove
            </button>
            <button
              onClick={() => setConfirmRemove(false)}
              className={cn(smallBtn, "border border-neutral-200 text-neutral-600 hover:bg-neutral-50")}
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => onApply?.(job.id)}
              disabled={status !== undefined}
              className={cn(
                smallBtn,
                status !== undefined
                  ? "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                  : "text-white bg-primary-600 hover:bg-primary-700",
              )}
            >
              {status !== undefined ? "Applied ✓" : "Apply Now"}
            </button>
            <button
              onClick={() => setNotesOpen((v) => !v)}
              className={cn(smallBtn, "border border-neutral-200 text-neutral-600 hover:bg-neutral-50")}
            >
              <StickyNote size={12} /> {notes ? "Edit notes" : "Add notes"}
            </button>
            <button
              onClick={share}
              className={cn(smallBtn, "border border-neutral-200 text-neutral-600 hover:bg-neutral-50")}
            >
              {copied ? <Check size={12} /> : <Share2 size={12} />}
              {copied ? "Link copied!" : "Share"}
            </button>
            <button
              onClick={() => setConfirmRemove(true)}
              aria-label="Remove from saved jobs"
              className={cn(smallBtn, "ml-auto border border-primary-300 text-primary-600 bg-primary-50 hover:bg-primary-100")}
            >
              <Heart size={12} className="fill-current" /> Saved
            </button>
          </>
        )}
      </div>
    </div>
  );
}
