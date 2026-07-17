"use client";

import React from "react";
import { ApplicationCard } from "./application-card";
import { BOARD_COLUMNS, columnIdForStatus, type ApplicationView } from "../api/application.mappers";

interface ApplicationKanbanProps {
  applications: ApplicationView[];
}

/**
 * Read-only pipeline board: applications grouped into columns by status. Status
 * is changed from the detail view (the backend has no reorder endpoint), so this
 * is intentionally not drag-and-drop.
 */
export function ApplicationKanban({ applications }: ApplicationKanbanProps) {
  const byColumn = new Map<string, ApplicationView[]>();
  for (const col of BOARD_COLUMNS) byColumn.set(col.id, []);
  for (const app of applications) {
    byColumn.get(columnIdForStatus(app.status))?.push(app);
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {BOARD_COLUMNS.map((col) => {
        const items = byColumn.get(col.id) ?? [];
        return (
          <div key={col.id} className="w-72 shrink-0 flex flex-col">
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--color-text-secondary)" }}>
                {col.label}
              </h3>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ background: "var(--color-neutral-100)", color: "var(--color-text-tertiary)" }}
              >
                {items.length}
              </span>
            </div>
            <div
              className="flex-1 rounded-lg p-2 space-y-2 min-h-24"
              style={{ background: "var(--color-bg-secondary)" }}
            >
              {items.length === 0 ? (
                <p className="text-xs text-center py-6" style={{ color: "var(--color-text-disabled)" }}>
                  Nothing here
                </p>
              ) : (
                items.map((app) => <ApplicationCard key={app.id} application={app} compact />)
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
