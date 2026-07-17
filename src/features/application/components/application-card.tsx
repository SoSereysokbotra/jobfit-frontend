"use client";

import React from "react";
import Link from "next/link";
import { MapPin, Clock } from "lucide-react";
import { Badge } from "@/shared/components/data-display/badge";
import type { ApplicationView } from "../api/application.mappers";

interface ApplicationCardProps {
  application: ApplicationView;
  /** Compact tile for the kanban board (hides location/meta row). */
  compact?: boolean;
}

/** A single application, linking to its detail/timeline view. */
export function ApplicationCard({ application, compact = false }: ApplicationCardProps) {
  return (
    <Link
      href={`/applications/${application.id}`}
      className="block rounded-lg border p-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
      style={{
        background: "var(--color-card)",
        borderColor: "var(--color-border)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-extrabold text-sm shrink-0"
          style={{ background: application.logoBg }}
        >
          {application.logo}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3
                className="text-sm font-bold truncate"
                style={{ color: "var(--color-text-primary)" }}
              >
                {application.jobTitle}
              </h3>
              <p className="text-xs truncate mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
                {application.company}
              </p>
            </div>
            <Badge tone={application.statusMeta.tone} dot className="shrink-0">
              {application.statusMeta.label}
            </Badge>
          </div>

          {!compact && (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
              <span className="flex items-center gap-1 text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                <MapPin size={11} /> {application.location}
              </span>
              <span className="flex items-center gap-1 text-xs" style={{ color: "var(--color-text-disabled)" }}>
                <Clock size={11} /> {application.appliedLabel}
              </span>
            </div>
          )}
          {compact && (
            <span className="flex items-center gap-1 text-xs mt-2" style={{ color: "var(--color-text-disabled)" }}>
              <Clock size={11} /> {application.appliedLabel}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
