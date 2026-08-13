"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Copy, Download, Trash2, Upload } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { TextField } from "@/shared/components/ui/text-field";
import { Alert } from "@/shared/components/feedback/alert";
import { Skeleton } from "@/shared/components/feedback/skeleton";
import { ConfirmDialog } from "@/shared/components/feedback/confirm-dialog";
import { ApiError } from "@/lib/api/client";
import { SettingsPanel } from "@/features/resume-builder/components/settings-panel";
import { SummaryEditor } from "@/features/resume-builder/components/summary-editor";
import { ExperienceEditor } from "@/features/resume-builder/components/experience-editor";
import { EducationEditor } from "@/features/resume-builder/components/education-editor";
import { SkillsEditor } from "@/features/resume-builder/components/skills-editor";
import { CertificationsEditor } from "@/features/resume-builder/components/certifications-editor";
import { ProjectsEditor } from "@/features/resume-builder/components/projects-editor";
import { ResumePreview } from "@/features/resume-builder/components/resume-preview";
import { ImportDialog } from "@/features/resume-builder/components/import-dialog";
import { SaveIndicator } from "@/features/resume-builder/components/section-shell";
import { openExportedResume } from "@/features/resume-builder/lib/download";
import {
  useDebouncedSectionSave,
  useDeleteResumeDocument,
  useDuplicateResumeDocument,
  useExportResumeDocument,
  useImportFromProfile,
  useResumeDocument,
  useResumeTemplates,
  useUpdateResumeDocument,
} from "@/features/resume-builder/hooks/use-resume-builder";

export default function ResumeBuilderEditorPage() {
  const params = useParams<{ id: string }>();
  const documentId = params?.id ?? "";
  const router = useRouter();

  const { data: document, isLoading, error } = useResumeDocument(documentId);
  const {
    data: templates = [],
    isLoading: templatesLoading,
    error: templatesError,
  } = useResumeTemplates();

  const update = useUpdateResumeDocument(documentId);
  const importFromProfile = useImportFromProfile(documentId);
  const exportDocument = useExportResumeDocument();
  const duplicate = useDuplicateResumeDocument();
  const remove = useDeleteResumeDocument();

  /**
   * Bumped only when the whole document is replaced (import), which is the one
   * case where the section editors must drop their local drafts and re-seed.
   * An ordinary autosave must NOT bump it or the user's cursor would jump.
   */
  const [resetToken, setResetToken] = useState(0);

  const [title, setTitle] = useState<string | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [actionError, setActionError] = useState("");

  const titleSave = useDebouncedSectionSave<string>((value) =>
    update.mutateAsync({ title: value.trim() || "Untitled résumé" }),
  );

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6" style={{ background: "var(--color-bg-secondary)" }}>
        <Skeleton className="h-10 w-64 rounded-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-[600px] rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !document) {
    // Every id-scoped route 404s for a document you don't own, identical to one
    // that never existed — so there is deliberately no "not yours" wording.
    const notFound = error instanceof ApiError && error.statusCode === 404;
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-4" style={{ background: "var(--color-bg-secondary)" }}>
        <Alert variant="error">
          {notFound
            ? "That résumé no longer exists."
            : error instanceof Error
              ? error.message
              : "Could not load that résumé."}
        </Alert>
        <Link href="/resume-builder">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4" /> Back to Resume Builder
          </Button>
        </Link>
      </div>
    );
  }

  const activeTemplate = templates.find((t) => t.id === document.templateId);
  const isFinalized = document.status === "FINALIZED";

  const handleExport = async () => {
    setActionError("");
    try {
      const result = await exportDocument.mutateAsync(documentId);
      openExportedResume(result.downloadUrl, result.fileName);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Could not export this résumé.");
    }
  };

  const handleDuplicate = async () => {
    setActionError("");
    try {
      const copy = await duplicate.mutateAsync(documentId);
      router.push(`/resume-builder/${copy.id}/edit`);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Could not duplicate this résumé.");
    }
  };

  return (
    <div
      className="p-4 sm:p-6 lg:p-8 space-y-6 min-h-full"
      style={{ background: "var(--color-bg-secondary)" }}
    >
      {/* ── Header ── */}
      <div className="space-y-3">
        <Link
          href="/resume-builder"
          className="inline-flex items-center gap-1.5 text-xs font-semibold"
          style={{ color: "var(--color-text-tertiary)" }}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Resume Builder
        </Link>

        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div className="min-w-0 flex-1 max-w-md">
            <TextField
              id="document-title"
              label="Title"
              value={title ?? document.title}
              onChange={(e) => {
                setTitle(e.target.value);
                titleSave.schedule(e.target.value);
              }}
              onBlur={() => void titleSave.saveNow(title ?? document.title)}
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <SaveIndicator status={titleSave.status} />
            <Badge variant={isFinalized ? "success" : "neutral"}>
              {isFinalized ? "Finalized" : "Draft"}
            </Badge>
            <Button
              variant="ghost"
              onClick={() => update.mutate({ status: isFinalized ? "DRAFT" : "FINALIZED" })}
            >
              {isFinalized ? "Reopen as draft" : "Mark finalized"}
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button onClick={handleExport} loading={exportDocument.isPending} loadingText="Exporting…">
            <Download className="w-4 h-4" /> Export PDF
          </Button>
          <Button variant="outline" onClick={() => setImportOpen(true)}>
            <Upload className="w-4 h-4" /> Import from profile
          </Button>
          <Button variant="ghost" onClick={handleDuplicate} loading={duplicate.isPending} loadingText="Duplicating…">
            <Copy className="w-4 h-4" /> Duplicate
          </Button>
          <Button variant="ghost" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="w-4 h-4" style={{ color: "var(--color-error-600)" }} /> Delete
          </Button>
        </div>
      </div>

      {actionError && <Alert variant="error">{actionError}</Alert>}

      {/* ── Two panels: controls on the left, preview on the right ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="space-y-4">
          <SettingsPanel
            document={document}
            templates={templates}
            templatesLoading={templatesLoading}
            templatesError={templatesError}
            onUpdate={(input) => update.mutate(input)}
          />

          <SummaryEditor documentId={documentId} summary={document.summary} resetToken={resetToken} />
          <ExperienceEditor
            documentId={documentId}
            experiences={document.experiences}
            resetToken={resetToken}
          />
          <EducationEditor
            documentId={documentId}
            educations={document.educations}
            resetToken={resetToken}
          />
          <SkillsEditor documentId={documentId} skills={document.skills} resetToken={resetToken} />
          <CertificationsEditor
            documentId={documentId}
            certifications={document.certifications}
            resetToken={resetToken}
          />
          <ProjectsEditor documentId={documentId} projects={document.projects} resetToken={resetToken} />
        </div>

        <div className="lg:sticky lg:top-6">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h2 className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>
              Preview
            </h2>
            <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
              Approximate — export to see the real PDF
            </span>
          </div>
          <ResumePreview document={document} template={activeTemplate} />
        </div>
      </div>

      <ImportDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        document={document}
        onImport={async (sections) => {
          await importFromProfile.mutateAsync(sections);
          // The document was replaced wholesale — make the editors re-seed.
          setResetToken((token) => token + 1);
        }}
      />

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete this résumé?"
        subtitle={document.title}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={async () => {
          await remove.mutateAsync(documentId);
          router.push("/resume-builder");
        }}
      >
        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          This removes the résumé from your builder.{" "}
          {document.exportedResumeId
            ? "The PDF you already exported stays in your Resumes, so any application you sent with it is unaffected."
            : "You can't undo this."}
        </p>
      </ConfirmDialog>
    </div>
  );
}
