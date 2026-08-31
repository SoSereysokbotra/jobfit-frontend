"use client";

import React from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Modal } from "@/shared/components/ui/modal";
import { Alert } from "@/shared/components/feedback/alert";
import { useResumeLink } from "@/features/employer/hooks/use-employer";

interface ResumeViewerModalProps {
  /** The application whose CV to show, or null when the viewer is closed. */
  applicationId: string | null;
  candidateName: string;
  /** As the candidate named it — shown as the subtitle so the employer knows what opened. */
  fileName: string | null;
  /** "PDF" | "DOCX". Only PDF can be rendered inline; see below. */
  fileType: string | null;
  onClose: () => void;
}

/**
 * Reads a candidate's CV inside JobFits rather than handing it to another tab.
 *
 * The employer is reviewing a pipeline, so the CV is one step in a task they are already
 * in the middle of: bouncing them to a browser PDF tab loses the candidate, the job and
 * the board they were working through. It renders in an iframe over the page instead, and
 * closing returns them exactly where they were.
 *
 * The signed URL is fetched only while this is open and dropped on close (`gcTime: 0` in
 * useResumeLink), because it expires — a cached one would render an error page later.
 *
 * DOCX cannot be rendered by the browser, so it is offered as a download instead of an
 * empty frame. That download leaves the site by necessity: there is nothing to render.
 */
export function ResumeViewerModal({
  applicationId,
  candidateName,
  fileName,
  fileType,
  onClose,
}: ResumeViewerModalProps) {
  const { data, isPending, isError, error } = useResumeLink(applicationId);
  const isPdf = (fileType ?? "").toUpperCase() === "PDF";

  return (
    <Modal
      open={applicationId !== null}
      onClose={onClose}
      size="xl"
      title={`${candidateName} — CV`}
      subtitle={fileName ?? undefined}
    >
      <div className="p-0">
        {isPending && (
          <div className="flex flex-col items-center justify-center gap-2 py-24">
            <Loader2 size={22} className="animate-spin text-primary-600" />
            <p className="text-sm text-content-tertiary">Opening CV…</p>
          </div>
        )}

        {isError && (
          <div className="p-5">
            <Alert variant="error">
              {error instanceof Error
                ? error.message
                : "Could not open this CV. It may have been deleted by the candidate."}
            </Alert>
          </div>
        )}

        {data && isPdf && (
          <iframe
            src={data.url}
            title={`${candidateName} CV`}
            className="w-full h-[75vh] border-0 bg-neutral-50"
          />
        )}

        {data && !isPdf && (
          <div className="flex flex-col items-center gap-3 px-5 py-16 text-center">
            <AlertTriangle size={22} className="text-warning-600" />
            <p className="text-sm text-content-secondary">
              This CV is a {fileType ?? "non-PDF"} file, which cannot be previewed in the
              browser.
            </p>
            <a
              href={data.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold px-3 py-2 rounded-md text-white bg-primary-600 transition-colors hover:bg-primary-700"
            >
              Download {fileName ?? "CV"}
            </a>
          </div>
        )}
      </div>
    </Modal>
  );
}
