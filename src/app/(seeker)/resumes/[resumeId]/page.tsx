"use client";

import React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Download, Loader2, RefreshCw, Star, Trash2, AlertTriangle } from "lucide-react";
import { AtsScoreBadge, ParsedDataView } from "@/features/resume/components";
import {
  useResume,
  useResumeScores,
  useResumeMutations,
  useParsingStatus,
  useParsedData,
} from "@/features/resume/hooks/use-resumes";
import { PARSING_STATUS_TONE } from "@/features/resume/api/resume.mappers";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Alert } from "@/shared/components/feedback/alert";
import { Skeleton } from "@/shared/components/feedback/skeleton";
import { EmptyState } from "@/shared/components/data-display/empty-state";
import { ApiError } from "@/lib/api/client";

export default function ResumeDetailPage() {
  const params = useParams<{ resumeId: string }>();
  const router = useRouter();
  const resumeId = params?.resumeId;

  const { resume, isLoading, error } = useResume(resumeId);
  // Only poll while the resume is still being analysed.
  const { status, isPolling, hasTimedOut } = useParsingStatus(resumeId, Boolean(resume?.isProcessing));
  const { scores } = useResumeScores(resumeId, Boolean(resume?.isParsed));
  const { parsed, isLoading: parsedLoading } = useParsedData(resumeId, Boolean(resume?.isParsed));
  const { remove, setDefault, recalculateScore } = useResumeMutations();

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  if (error instanceof ApiError && error.statusCode === 404) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
        <EmptyState
          icon={<AlertTriangle className="w-6 h-6" />}
          title="Resume not found"
          description="It may have been deleted."
          action={
            <Link href="/resumes">
              <Button variant="outline">Back to resumes</Button>
            </Link>
          }
        />
      </div>
    );
  }

  if (!resume) return null;

  const effectiveStatus = status ?? resume.parsingStatus;

  return (
    <div
      className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6 min-h-full"
      style={{ background: "var(--color-bg-secondary)" }}
    >
      <Link
        href="/resumes"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-700 transition-colors duration-200"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to resumes
      </Link>

      {/* ── HEADER ─────────────────────────────────────────── */}
      <div className="rounded-lg border border-border bg-card p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start gap-5">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-neutral-900 truncate">
                {resume.title || resume.fileName}
              </h1>
              {resume.isDefault && <Badge variant="primary">Default</Badge>}
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              {resume.fileType} · {resume.sizeLabel} · {resume.uploadedLabel} · v{resume.version}
            </p>

            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <Badge variant={PARSING_STATUS_TONE[effectiveStatus]}>
                {isPolling && <Loader2 className="w-3 h-3 animate-spin" />}
                {resume.statusLabel}
              </Badge>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              <Link href={resume.fileUrl} target="_blank">
                <Button variant="outline">
                  <Download className="w-4 h-4" /> Open file
                </Button>
              </Link>
              {!resume.isDefault && (
                <Button
                  variant="outline"
                  onClick={() => setDefault.mutate(resume.id)}
                  disabled={setDefault.isPending}
                >
                  <Star className="w-4 h-4" /> Set as default
                </Button>
              )}
              {resume.isParsed && (
                <Button
                  variant="outline"
                  onClick={() => recalculateScore.mutate(resume.id)}
                  loading={recalculateScore.isPending}
                  loadingText="Scoring…"
                >
                  <RefreshCw className="w-4 h-4" /> Recalculate score
                </Button>
              )}
              <Button
                variant="danger"
                onClick={async () => {
                  await remove.mutateAsync(resume.id);
                  router.push("/resumes");
                }}
                disabled={remove.isPending}
              >
                <Trash2 className="w-4 h-4" /> Delete
              </Button>
            </div>
          </div>

          {/* Scores land only once parsing succeeds. */}
          {resume.isParsed && scores && (
            <div className="flex gap-4 shrink-0">
              <AtsScoreBadge score={scores.atsScore} label="ATS Score" />
              <AtsScoreBadge score={scores.qualityScore} label="Quality" />
            </div>
          )}
        </div>
      </div>

      {/* ── PARSING STATE ──────────────────────────────────── */}
      {resume.hasFailed && (
        <Alert variant="error">
          We couldn&apos;t read this resume. {resume.parsingError ?? "Try uploading it again."}
        </Alert>
      )}

      {resume.isProcessing && !hasTimedOut && (
        <Alert variant="info">
          Analysing your resume — scores appear here as soon as it finishes.
        </Alert>
      )}

      {hasTimedOut && (
        <Alert variant="warning">
          This resume is still queued. Analysis runs in a background worker; if it stays queued,
          the worker may not be running.
        </Alert>
      )}

      {/* ── PARSED DATA ────────────────────────────────────── */}
      <div className="rounded-lg border border-border bg-card p-5 sm:p-6 shadow-sm">
        {resume.isParsed ? (
          <ParsedDataView parsed={parsed} isLoading={parsedLoading} />
        ) : (
          <EmptyState
            icon={<Loader2 className={resume.isProcessing ? "w-6 h-6 animate-spin" : "w-6 h-6"} />}
            title={resume.hasFailed ? "Nothing to show" : "Analysis in progress"}
            description={
              resume.hasFailed
                ? "We couldn't extract details from this file."
                : "The details we extract from your resume will appear here."
            }
          />
        )}
      </div>
    </div>
  );
}
