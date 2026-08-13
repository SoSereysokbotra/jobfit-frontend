"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FileText, Plus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Alert } from "@/shared/components/feedback/alert";
import { Skeleton } from "@/shared/components/feedback/skeleton";
import { EmptyState } from "@/shared/components/data-display/empty-state";
import { ConfirmDialog } from "@/shared/components/feedback/confirm-dialog";
import { DocumentCard } from "@/features/resume-builder/components/document-card";
import { openExportedResume } from "@/features/resume-builder/lib/download";
import {
  useDeleteResumeDocument,
  useDuplicateResumeDocument,
  useExportResumeDocument,
  useResumeDocuments,
  useResumeTemplates,
} from "@/features/resume-builder/hooks/use-resume-builder";
import type { ResumeDocumentListItemDto } from "@/features/resume-builder/api/resume-builder.api";

export default function ResumeBuilderPage() {
  const { data: documents = [], isLoading, error } = useResumeDocuments();
  // Only to resolve each card's thumbnail — the list endpoint returns templateId alone.
  const { data: templates = [] } = useResumeTemplates();

  const duplicate = useDuplicateResumeDocument();
  const remove = useDeleteResumeDocument();
  const exportDocument = useExportResumeDocument();

  const [pendingDelete, setPendingDelete] = useState<ResumeDocumentListItemDto | null>(null);
  const [actionError, setActionError] = useState("");

  const handleExport = async (document: ResumeDocumentListItemDto) => {
    setActionError("");
    try {
      const result = await exportDocument.mutateAsync(document.id);
      openExportedResume(result.downloadUrl, result.fileName);
    } catch (e) {
      // Never leave the button spinning on failure — mutateAsync rejects, the
      // mutation resets itself, and the reason is shown rather than swallowed.
      setActionError(e instanceof Error ? e.message : "Could not export that résumé.");
    }
  };

  const handleDuplicate = async (documentId: string) => {
    setActionError("");
    try {
      await duplicate.mutateAsync(documentId);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Could not duplicate that résumé.");
    }
  };

  return (
    <div
      className="p-4 sm:p-6 lg:p-8 space-y-6 min-h-full"
      style={{ background: "var(--color-bg-secondary)" }}
    >
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>
            Resume Builder
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>
            Compose a tailored résumé and export it as a PDF
          </p>
        </div>
        {documents.length > 0 && (
          <Link href="/resume-builder/new">
            <Button>
              <Plus className="w-4 h-4" /> New Resume
            </Button>
          </Link>
        )}
      </div>

      {error && (
        <Alert variant="error">
          {error instanceof Error ? error.message : "Could not load your résumés."}
        </Alert>
      )}
      {actionError && <Alert variant="error">{actionError}</Alert>}

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : documents.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-6 h-6" />}
          title="No résumés yet"
          description="Build one from a template, pull in your profile details, and export it as a PDF."
          action={
            <Link href="/resume-builder/new">
              <Button>
                <Plus className="w-4 h-4" /> Create your first resume
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {documents.map((document) => (
            <DocumentCard
              key={document.id}
              document={document}
              template={templates.find((t) => t.id === document.templateId)}
              onDuplicate={handleDuplicate}
              onDelete={setPendingDelete}
              onExport={handleExport}
              isExporting={exportDocument.isPending && exportDocument.variables === document.id}
              isDuplicating={duplicate.isPending && duplicate.variables === document.id}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        title="Delete this résumé?"
        subtitle={pendingDelete?.title}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => remove.mutateAsync(pendingDelete!.id)}
      >
        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          This removes the résumé from your builder.{" "}
          {pendingDelete?.exportedResumeId
            ? "The PDF you already exported stays in your Resumes, so any application you sent with it is unaffected."
            : "You can't undo this."}
        </p>
      </ConfirmDialog>
    </div>
  );
}
