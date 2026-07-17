"use client";

import React from "react";
import Link from "next/link";
import { FileText, Star, Trash2, Loader2, AlertTriangle } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { AtsScoreBadge } from "./ats-score-badge";
import { PARSING_STATUS_TONE, type ResumeView } from "../api/resume.mappers";

interface ResumeCardProps {
  resume: ResumeView;
  onSetDefault?: (resumeId: string) => void;
  onDelete?: (resumeId: string) => void;
  isMutating?: boolean;
}

/** One resume row: file meta, parsing state, scores, and row actions. */
export function ResumeCard({ resume, onSetDefault, onDelete, isMutating = false }: ResumeCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm transition-all duration-200 hover:bg-card-hover">
      <div className="flex items-start gap-4">
        <div
          className="w-11 h-11 rounded-lg shrink-0 flex items-center justify-center"
          style={{ background: "var(--color-primary-50)", color: "var(--color-primary-600)" }}
        >
          <FileText className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={`/resumes/${resume.id}`}
              className="text-sm font-bold text-neutral-900 truncate hover:underline"
            >
              {resume.title || resume.fileName}
            </Link>
            {resume.isDefault && <Badge variant="primary">Default</Badge>}
          </div>

          <p className="text-xs text-neutral-500 mt-0.5 truncate">
            {resume.fileType} · {resume.sizeLabel} · {resume.uploadedLabel}
          </p>

          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <Badge variant={PARSING_STATUS_TONE[resume.parsingStatus]}>
              {resume.isProcessing && <Loader2 className="w-3 h-3 animate-spin" />}
              {resume.hasFailed && <AlertTriangle className="w-3 h-3" />}
              {resume.statusLabel}
            </Badge>

            {/* Scores exist only after parsing succeeds. */}
            {resume.isParsed && typeof resume.atsScore === "number" && (
              <AtsScoreBadge score={resume.atsScore} variant="pill" label="ATS" />
            )}
            {resume.isParsed && typeof resume.qualityScore === "number" && (
              <AtsScoreBadge score={resume.qualityScore} variant="pill" label="Quality" />
            )}
          </div>

          {resume.hasFailed && resume.parsingError && (
            <p className="text-xs text-error-500 mt-2">{resume.parsingError}</p>
          )}
        </div>

        <div className="flex flex-col items-end gap-1.5 shrink-0">
          {!resume.isDefault && onSetDefault && (
            <Button
              variant="ghost"
              onClick={() => onSetDefault(resume.id)}
              disabled={isMutating}
              className="text-xs"
            >
              <Star className="w-3.5 h-3.5" /> Set default
            </Button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(resume.id)}
              disabled={isMutating}
              aria-label={`Delete ${resume.title || resume.fileName}`}
              className="p-1.5 rounded-md text-neutral-400 hover:bg-error-50 hover:text-error-600 transition-colors duration-200 disabled:opacity-40"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
