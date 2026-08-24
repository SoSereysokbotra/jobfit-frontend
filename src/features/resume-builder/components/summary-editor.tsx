"use client";

import React from "react";
import { AlignLeft } from "lucide-react";
import { Textarea } from "@/shared/components/ui/form-controls";
import { resumeBuilderApi } from "../api/resume-builder.api";
import {
  useDebouncedSectionSave,
  useLocalDocumentPatch,
  useSectionDraft,
} from "../hooks/use-resume-builder";
import { SectionShell } from "./section-shell";

interface SummaryEditorProps {
  documentId: string;
  summary: string;
  resetToken: number;
  action?: React.ReactNode;
}

/** Summary is 1:1 with the document, so its "replace" is a plain overwrite. */
export function SummaryEditor({ documentId, summary, resetToken, action }: SummaryEditorProps) {
  const [draft, setDraft] = useSectionDraft(summary, resetToken);
  const patchDocument = useLocalDocumentPatch(documentId);

  const { status, schedule, saveNow } = useDebouncedSectionSave<string>((value) =>
    resumeBuilderApi.putSummary(documentId, value),
  );

  /** Local state, preview and autosave all move on the same keystroke. */
  const change = (value: string) => {
    setDraft(value);
    patchDocument({ summary: value });
    schedule(value);
  };

  return (
    <SectionShell title="Summary" icon={AlignLeft} status={status} action={action}>
      <Textarea
        rows={5}
        value={draft}
        placeholder="Two or three sentences on what you do and what you're looking for."
        hint="Clearing this removes the section from the exported PDF."
        onChange={(e) => change(e.target.value)}
        onBlur={() => void saveNow(draft)}
      />
    </SectionShell>
  );
}
