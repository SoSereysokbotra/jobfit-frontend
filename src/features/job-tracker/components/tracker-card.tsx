"use client";

import React from "react";
import { Archive, ExternalLink, GripVertical, MapPin, Trash2 } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { formatTrackedSalary, type TrackedJob } from "../api/tracker.api";

interface TrackerCardProps {
  job: TrackedJob;
  dragging: boolean;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onEdit: (job: TrackedJob) => void;
  onArchive: (id: string) => void;
  onRemove: (id: string) => void;
}

/**
 * One card on the board.
 *
 * The whole card is draggable, but the grip is drawn because a draggable surface with no
 * affordance is a thing users find by accident. Buttons inside stop propagation so
 * archiving does not also start a drag.
 */
export function TrackerCard({
  job,
  dragging,
  onDragStart,
  onDragEnd,
  onEdit,
  onArchive,
  onRemove,
}: TrackerCardProps) {
  const salary = formatTrackedSalary(job);

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={() => onEdit(job)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onEdit(job);
        }
      }}
      aria-label={`${job.title} at ${job.companyName}`}
      className={cn(
        "group relative rounded-xl border p-4 cursor-grab active:cursor-grabbing transition-all duration-150",
        dragging ? "opacity-40" : "hover:shadow-md",
      )}
      style={{
        background: "var(--color-card)",
        borderColor: "var(--color-border)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div className="flex items-start gap-2.5">
        <GripVertical
          size={15}
          className="mt-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ color: "var(--color-text-disabled)" }}
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <p
            className="text-[13px] truncate"
            style={{ color: "var(--color-text-tertiary)" }}
            title={job.title}
          >
            {job.title}
          </p>
          <p
            className="text-[15px] font-bold truncate leading-snug mt-0.5"
            style={{ color: "var(--color-text-primary)" }}
            title={job.companyName}
          >
            {job.companyName}
          </p>

          {(job.location || salary) && (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
              {job.location && (
                <span
                  className="inline-flex items-center gap-1 text-xs"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  <MapPin size={11} /> {job.location}
                </span>
              )}
              {/* Absent salary renders NOTHING — the board must not imply a job pays
                  nothing just because the user has not filled it in. */}
              {salary && (
                <span
                  className="text-xs font-semibold"
                  style={{ color: "var(--color-success-600)" }}
                >
                  {salary}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {job.url && (
            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              aria-label="Open the original posting"
              title="Open the original posting"
              className="p-1 rounded hover:bg-neutral-100"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              <ExternalLink size={14} />
            </a>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onArchive(job.id);
            }}
            aria-label="Archive this card"
            title="Archive"
            className="p-1 rounded hover:bg-neutral-100"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            <Archive size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(job.id);
            }}
            aria-label="Delete this card"
            title="Delete"
            className="p-1 rounded hover:bg-error-50"
            style={{ color: "var(--color-error-500)" }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {job.notes && (
        <p
          className="text-xs mt-3 pt-2.5 border-t line-clamp-2 leading-relaxed"
          style={{ color: "var(--color-text-secondary)", borderColor: "var(--color-neutral-100)" }}
        >
          {job.notes}
        </p>
      )}
    </div>
  );
}
