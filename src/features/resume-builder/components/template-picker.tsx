"use client";

import React from "react";
import { Check, LayoutTemplate } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Skeleton } from "@/shared/components/feedback/skeleton";
import { Alert } from "@/shared/components/feedback/alert";
import { EmptyState } from "@/shared/components/data-display/empty-state";
import { cn } from "@/shared/utils/cn";
import type { ResumeTemplateDto } from "../api/resume-builder.api";

interface TemplatePickerProps {
  templates: ResumeTemplateDto[];
  selectedId: string | null;
  onSelect: (templateId: string) => void;
  isLoading?: boolean;
  error?: unknown;
  /** Tighter grid for the in-editor switch dialog. */
  compact?: boolean;
}

/**
 * Template grid, shared by the create flow and the editor's switch dialog.
 *
 * The thumbnails are backend-authored placeholder SVGs served from this app's
 * own `public/templates/` — `thumbnailUrl` is root-relative and resolves against
 * the frontend origin, because the API serves no static assets at all.
 */
export function TemplatePicker({
  templates,
  selectedId,
  onSelect,
  isLoading = false,
  error,
  compact = false,
}: TemplatePickerProps) {
  if (isLoading) {
    return (
      <div className={cn("grid gap-4", compact ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2 lg:grid-cols-3")}>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className={compact ? "h-40 rounded-lg" : "h-64 rounded-xl"} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="error">
        {error instanceof Error ? error.message : "Could not load the templates."}
      </Alert>
    );
  }

  if (templates.length === 0) {
    return (
      <EmptyState
        icon={<LayoutTemplate className="w-6 h-6" />}
        title="No templates available"
        description="Templates are published by the JobFits team. Check back shortly."
      />
    );
  }

  return (
    <div
      className={cn("grid gap-4", compact ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2 lg:grid-cols-3")}
      role="radiogroup"
      aria-label="Résumé template"
    >
      {templates.map((template) => {
        const selected = template.id === selectedId;
        return (
          <button
            key={template.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onSelect(template.id)}
            className={cn(
              "group text-left rounded-xl border overflow-hidden transition-all duration-200",
              selected ? "border-primary-500" : "border-neutral-200 hover:border-primary-300",
            )}
            style={{
              background: "var(--color-card)",
              boxShadow: selected ? "0 0 0 3px var(--color-primary-50)" : "var(--shadow-sm)",
            }}
          >
            <div className="relative aspect-[3/4] overflow-hidden" style={{ background: "var(--color-bg-secondary)" }}>
              {/* Plain <img>: these are SVGs, and next/image refuses to serve SVG
                  without dangerouslyAllowSVG — not a trade worth making for a
                  static thumbnail we author ourselves. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={template.thumbnailUrl}
                alt={`${template.name} template preview`}
                className="w-full h-full object-cover object-top"
              />
              {selected && (
                <span
                  className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-white"
                  style={{ background: "var(--color-primary-600)" }}
                >
                  <Check className="w-3.5 h-3.5" />
                </span>
              )}
            </div>

            <div className="px-3 py-2.5 border-t" style={{ borderColor: "var(--color-border)" }}>
              <p
                className={cn("text-sm truncate", selected ? "font-bold" : "font-semibold")}
                style={{ color: selected ? "var(--color-primary-700)" : "var(--color-text-primary)" }}
              >
                {template.name}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                {template.isAtsFriendly && <Badge variant="success">ATS</Badge>}
                <span className="text-xs truncate" style={{ color: "var(--color-text-tertiary)" }}>
                  {template.category}
                </span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
