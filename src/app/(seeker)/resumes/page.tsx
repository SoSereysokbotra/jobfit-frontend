"use client";

import React, { useState } from "react";
import { FileText, Plus } from "lucide-react";
import { ResumeCard, ResumeUploader } from "@/features/resume/components";
import { useResumes, useResumeMutations } from "@/features/resume/hooks/use-resumes";
import { Button } from "@/shared/components/ui/button";
import { EmptyState } from "@/shared/components/data-display/empty-state";
import { Skeleton } from "@/shared/components/feedback/skeleton";
import { Alert } from "@/shared/components/feedback/alert";
import { ApiError } from "@/lib/api/client";

export default function ResumesPage() {
  const { resumes, isLoading, error } = useResumes();
  const { remove, setDefault } = useResumeMutations();
  const [showUploader, setShowUploader] = useState(false);

  const isMutating = remove.isPending || setDefault.isPending;
  const mutationError = remove.error ?? setDefault.error;

  return (
    <div
      className="p-4 sm:p-6 lg:p-8 space-y-6 min-h-full"
      style={{ background: "var(--color-bg-secondary)" }}
    >
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Resumes</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Upload a resume to get an ATS score and better job matches.
          </p>
        </div>
        {resumes.length > 0 && !showUploader && (
          <Button onClick={() => setShowUploader(true)}>
            <Plus className="w-4 h-4" /> Upload resume
          </Button>
        )}
      </div>

      {error instanceof ApiError && <Alert variant="error">{error.message}</Alert>}
      {mutationError instanceof ApiError && <Alert variant="error">{mutationError.message}</Alert>}

      {showUploader && <ResumeUploader onUploaded={() => setShowUploader(false)} />}

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-4 flex gap-4">
              <Skeleton className="w-11 h-11 rounded-lg shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-2/5" />
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-5 w-24 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : resumes.length === 0 && !showUploader ? (
        <EmptyState
          icon={<FileText className="w-6 h-6" />}
          title="No resumes yet"
          description="Upload a PDF or DOCX and we'll score it against what employers look for."
          action={
            <Button onClick={() => setShowUploader(true)}>
              <Plus className="w-4 h-4" /> Upload resume
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {resumes.map((resume) => (
            <ResumeCard
              key={resume.id}
              resume={resume}
              onSetDefault={(id) => setDefault.mutate(id)}
              onDelete={(id) => remove.mutate(id)}
              isMutating={isMutating}
            />
          ))}
        </div>
      )}
    </div>
  );
}
