"use client";

/**
 * One job saved from the browser extension.
 *
 * Shaped like the internal `JobCard` list row on purpose — same card surface, same border
 * token, same title/company/meta stack — so the two tabs of Saved Jobs read as one
 * feature rather than two bolted together. What differs is what we actually have: no
 * internal job id, so no apply button and no match badge; instead the user's own salary,
 * notes and a link back to the posting.
 */

import React from "react";
import { Building2, ExternalLink, StickyNote, Trash2, Wallet } from "lucide-react";
import type { SavedExternalJob } from "../api/saved-external-jobs.api";
import { formatDate } from "@/shared/utils/formatters";

/** "2026-08-13T…" → "13 Aug 2026". */
function formatSavedAt(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? ""
    : formatDate(date, {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
}

/**
 * The description is a whole job posting, so it is clamped to a few lines. Saving it was
 * the point — reading all of it here is not, and the link back to the posting is one
 * click away.
 */
const CLAMP: React.CSSProperties = {
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
};

export function SavedExternalJobCard({
  job,
  onRemove,
  removing = false,
}: {
  job: SavedExternalJob;
  onRemove: () => void;
  removing?: boolean;
}) {
  return (
    <article className="flex flex-col sm:flex-row items-start gap-4 px-4 sm:px-5 py-4">
      <div className="flex items-start gap-3 w-full flex-1 min-w-0">
        <div
          className="w-11 h-11 rounded-lg shrink-0 flex items-center justify-center"
          style={{ background: "var(--color-primary-50)", color: "var(--color-primary-600)" }}
          aria-hidden="true"
        >
          <Building2 size={20} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <h3
              className="text-sm font-bold truncate"
              style={{ color: "var(--color-text-primary)" }}
            >
              {job.title}
            </h3>
            <span
              className="text-xs font-semibold px-1.5 py-0.5 rounded-full capitalize"
              style={{ background: "var(--color-bg-secondary)", color: "var(--color-text-tertiary)" }}
            >
              {job.source}
            </span>
          </div>

          <div
            className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {job.company && <span className="font-medium">{job.company}</span>}
            {job.salary && (
              <span className="inline-flex items-center gap-1">
                <Wallet size={12} /> {job.salary}
              </span>
            )}
            <span style={{ color: "var(--color-text-tertiary)" }}>
              Saved {formatSavedAt(job.savedAt)}
            </span>
          </div>

          {job.notes && (
            <p
              className="text-xs mt-2 inline-flex items-start gap-1.5 rounded-md px-2 py-1.5"
              style={{ background: "var(--color-bg-secondary)", color: "var(--color-text-secondary)" }}
            >
              <StickyNote size={12} className="shrink-0 mt-0.5" />
              <span>{job.notes}</span>
            </p>
          )}

          {job.description && (
            <p
              className="text-xs mt-2 leading-relaxed"
              style={{ color: "var(--color-text-tertiary)", ...CLAMP }}
            >
              {job.description}
            </p>
          )}
        </div>
      </div>

      <div
        className="flex flex-row sm:flex-col items-center sm:items-end justify-end gap-2 shrink-0 w-full sm:w-auto pt-2.5 sm:pt-0 border-t sm:border-t-0"
        style={{ borderColor: "var(--color-border)" }}
      >
        {job.url && (
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-md text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 transition-all duration-200 inline-flex items-center gap-1.5"
          >
            <ExternalLink size={12} /> View
          </a>
        )}
        <button
          type="button"
          onClick={onRemove}
          disabled={removing}
          aria-label={`Remove ${job.title}`}
          className="px-2 py-1.5 rounded-md text-xs font-medium inline-flex items-center gap-1.5 transition-all duration-200 disabled:opacity-50 hover:bg-error-50"
          style={{ color: "var(--color-text-tertiary)" }}
        >
          <Trash2 size={12} /> Remove
        </button>
      </div>
    </article>
  );
}
