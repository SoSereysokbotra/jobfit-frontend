"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Calendar, GripVertical } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { formatDaysAgo, formatInDays } from "@/lib/utils/format";
import {
  APPLICATION_STATUSES, STATUS_CONFIG,
  type Application, type ApplicationStatus,
} from "../api/application.api";

interface ApplicationKanbanProps {
  apps: Application[];
  onUpdateStatus: (id: string, status: ApplicationStatus) => void;
}

/** Compact card shown inside a kanban column. */
function KanbanCard({
  app,
  onDragStart,
}: {
  app: Application;
  onDragStart: (e: React.DragEvent, id: string) => void;
}) {
  const { job } = app;
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, app.id)}
      className="rounded-md border p-3 cursor-grab active:cursor-grabbing transition-all duration-200 hover:shadow-md group"
      style={{ background: "var(--color-card)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
    >
      <div className="flex items-start gap-2">
        <div
          className="w-8 h-8 rounded-md flex items-center justify-center text-white font-bold text-xs shrink-0"
          style={{ background: job.logoBg }}
        >
          {job.logo}
        </div>
        <div className="flex-1 min-w-0">
          <Link href={`/applications/${app.id}`}>
            <h4
              className="text-xs font-bold leading-snug line-clamp-2 hover:text-primary-700 transition-colors"
              style={{ color: "var(--color-text-primary)" }}
            >
              {job.title}
            </h4>
          </Link>
          <p className="text-xs mt-0.5 truncate" style={{ color: "var(--color-text-secondary)" }}>{job.company}</p>
        </div>
        <GripVertical
          size={13}
          className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ color: "var(--color-text-disabled)" }}
        />
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs" style={{ color: "var(--color-text-disabled)" }}>
          Applied {formatDaysAgo(app.appliedDaysAgo)}
        </span>
        <span className="text-xs font-bold" style={{ color: "var(--color-primary-600)" }}>{job.match}%</span>
      </div>
      {app.interview && (
        <span
          className="flex items-center gap-1 text-xs font-semibold mt-1.5"
          style={{ color: "var(--color-success-600)" }}
        >
          <Calendar size={10} /> {formatInDays(app.interview.inDays)}, {app.interview.time}
        </span>
      )}
      {app.offer && (
        <span
          className="flex items-center gap-1 text-xs font-semibold mt-1.5"
          style={{ color: "var(--color-primary-600)" }}
        >
          <Calendar size={10} /> Respond by {app.offer.respondBy}
        </span>
      )}
    </div>
  );
}

/**
 * Kanban board for the tracker (Flow 3A-1): one column per status,
 * drag a card between columns to update its status.
 */
export function ApplicationKanban({ apps, onUpdateStatus }: ApplicationKanbanProps) {
  const [dropTarget, setDropTarget] = useState<ApplicationStatus | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (e: React.DragEvent, status: ApplicationStatus) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    if (id) onUpdateStatus(id, status);
    setDropTarget(null);
  };

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
      {APPLICATION_STATUSES.map((status) => {
        const config = STATUS_CONFIG[status];
        const columnApps = apps.filter((a) => a.status === status);
        const isTarget = dropTarget === status;
        return (
          <div
            key={status}
            onDragOver={(e) => { e.preventDefault(); setDropTarget(status); }}
            onDragLeave={() => setDropTarget((t) => (t === status ? null : t))}
            onDrop={(e) => handleDrop(e, status)}
            className={cn(
              "w-64 shrink-0 rounded-lg border p-3 transition-colors duration-200",
              isTarget && "ring-2 ring-primary-500",
            )}
            style={{
              background: isTarget ? "var(--color-primary-50)" : "var(--color-bg-secondary)",
              borderColor: "var(--color-border)",
            }}
          >
            {/* Column header */}
            <div className="flex items-center gap-2 px-1 mb-3">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: config.dot }} />
              <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--color-text-secondary)" }}>
                {status}
              </h3>
              <span
                className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ background: "var(--color-neutral-100)", color: "var(--color-text-tertiary)" }}
              >
                {columnApps.length}
              </span>
            </div>

            {/* Cards */}
            <div className="space-y-2 min-h-[80px]">
              {columnApps.map((app) => (
                <KanbanCard key={app.id} app={app} onDragStart={handleDragStart} />
              ))}
              {columnApps.length === 0 && (
                <p
                  className="text-xs text-center py-6 rounded-md border border-dashed"
                  style={{ color: "var(--color-text-disabled)", borderColor: "var(--color-neutral-200)" }}
                >
                  Drop applications here
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
