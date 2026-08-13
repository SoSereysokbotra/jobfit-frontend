"use client";

import React from "react";
import Link from "next/link";
import { Clock, Copy, Download, FileText, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { daysSince, formatDaysAgo } from "@/lib/utils/format";
import type { ResumeDocumentListItemDto, ResumeTemplateDto } from "../api/resume-builder.api";

interface DocumentCardProps {
  document: ResumeDocumentListItemDto;
  template?: ResumeTemplateDto;
  onDuplicate: (documentId: string) => void;
  onDelete: (document: ResumeDocumentListItemDto) => void;
  onExport: (document: ResumeDocumentListItemDto) => void;
  isExporting: boolean;
  isDuplicating: boolean;
}

/**
 * One résumé document in the list. Mirrors the Resumes page's card: same radius,
 * border, icon chip and meta row, so the two lists read as siblings.
 */
export function DocumentCard({
  document,
  template,
  onDuplicate,
  onDelete,
  onExport,
  isExporting,
  isDuplicating,
}: DocumentCardProps) {
  const editHref = `/resume-builder/${document.id}/edit`;
  const isFinalized = document.status === "FINALIZED";

  return (
    <div
      className="rounded-xl border transition-all duration-200"
      style={{
        background: "var(--color-card)",
        borderColor: "var(--color-border)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div className="p-5 flex gap-4">
        {/* Template thumbnail — falls back to the icon chip when unresolved. */}
        <Link
          href={editHref}
          className="shrink-0 w-16 rounded-lg overflow-hidden border"
          style={{ borderColor: "var(--color-border)", background: "var(--color-bg-secondary)" }}
          aria-label={`Edit ${document.title}`}
        >
          {template ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={template.thumbnailUrl}
              alt=""
              className="w-full h-full object-cover object-top"
              style={{ aspectRatio: "3 / 4" }}
            />
          ) : (
            <div
              className="w-full flex items-center justify-center"
              style={{ aspectRatio: "3 / 4", background: "var(--color-primary-50)" }}
            >
              <FileText className="w-6 h-6" style={{ color: "var(--color-primary-600)" }} />
            </div>
          )}
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <Link href={editHref}>
                <h3
                  className="text-sm font-bold truncate hover:underline"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {document.title}
                </h3>
              </Link>
              <p className="text-xs truncate mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>
                {template?.name ?? "Template"}
              </p>
            </div>
            <Badge variant={isFinalized ? "success" : "neutral"}>
              {isFinalized ? "Finalized" : "Draft"}
            </Badge>
          </div>

          <div className="flex items-center flex-wrap gap-2 mt-2">
            <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
              <Clock className="w-3 h-3 inline mr-0.5" />
              Updated {formatDaysAgo(daysSince(document.updatedAt))}
            </span>
            {document.exportedResumeId && (
              <>
                <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>·</span>
                <Badge variant="info">Exported</Badge>
              </>
            )}
          </div>

          <div className="flex items-center flex-wrap gap-2 mt-4">
            <Link href={editHref}>
              <Button variant="outline" className="text-xs py-2">
                <Pencil className="w-3.5 h-3.5" />
                Edit
              </Button>
            </Link>
            <Button
              variant="ghost"
              className="text-xs py-2"
              onClick={() => onExport(document)}
              loading={isExporting}
              loadingText="Exporting…"
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </Button>
            <Button
              variant="ghost"
              className="text-xs py-2"
              onClick={() => onDuplicate(document.id)}
              loading={isDuplicating}
              loadingText="Duplicating…"
            >
              <Copy className="w-3.5 h-3.5" />
              Duplicate
            </Button>
            <Button
              variant="ghost"
              className="text-xs py-2 ml-auto"
              onClick={() => onDelete(document)}
              aria-label={`Delete ${document.title}`}
            >
              <Trash2 className="w-3.5 h-3.5" style={{ color: "var(--color-error-600)" }} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
