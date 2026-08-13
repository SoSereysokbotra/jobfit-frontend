"use client";

import React, { useState } from "react";
import { Modal } from "@/shared/components/ui/modal";
import { Button } from "@/shared/components/ui/button";
import { Alert } from "@/shared/components/feedback/alert";
import { PillMultiSelect } from "@/shared/components/ui/form-controls";
import {
  IMPORTABLE_SECTIONS,
  type ImportableSection,
  type ResumeDocumentDetailDto,
} from "../api/resume-builder.api";

const SECTION_LABEL: Record<ImportableSection, string> = {
  summary: "Summary",
  experience: "Experience",
  education: "Education",
  skills: "Skills",
  certifications: "Certifications",
};

const SECTION_OPTIONS = IMPORTABLE_SECTIONS.map((value) => ({
  value,
  label: SECTION_LABEL[value],
}));

/** Which of the importable sections currently hold anything. */
function populatedSections(document: ResumeDocumentDetailDto): Set<ImportableSection> {
  const populated = new Set<ImportableSection>();
  if (document.summary.trim()) populated.add("summary");
  if (document.experiences.length) populated.add("experience");
  if (document.educations.length) populated.add("education");
  if (document.skills.length) populated.add("skills");
  if (document.certifications.length) populated.add("certifications");
  return populated;
}

interface ImportDialogProps {
  open: boolean;
  onClose: () => void;
  document: ResumeDocumentDetailDto;
  onImport: (sections: ImportableSection[]) => Promise<unknown>;
}

/**
 * Import from profile.
 *
 * Import REPLACES a named section rather than merging into it, so the dialog
 * names exactly which sections would be overwritten before anything happens —
 * that warning is the reason this is a dialog and not a one-click button.
 *
 * Projects is absent by design: there is no Project model to import from, and
 * naming it is a 400 rather than a silent no-op.
 */
export function ImportDialog({ open, onClose, document, onImport }: ImportDialogProps) {
  const [selected, setSelected] = useState<ImportableSection[]>([...IMPORTABLE_SECTIONS]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const populated = populatedSections(document);
  const overwriting = selected.filter((section) => populated.has(section));

  const handleImport = async () => {
    if (selected.length === 0) return;
    setBusy(true);
    setError("");
    try {
      await onImport(selected);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not import from your profile.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={busy ? () => {} : onClose}
      title="Import from your profile"
      subtitle="Copies your profile into this résumé. Optional — you can fill everything in by hand instead."
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            loading={busy}
            loadingText="Importing…"
            disabled={selected.length === 0}
          >
            Import {selected.length > 0 ? `${selected.length} section${selected.length > 1 ? "s" : ""}` : ""}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <PillMultiSelect<ImportableSection>
          label="Sections"
          options={SECTION_OPTIONS}
          value={selected}
          onChange={setSelected}
          hint="Projects can't be imported — there's nothing on your profile to import from."
        />

        {overwriting.length > 0 && (
          <Alert variant="warning">
            {overwriting.map((s) => SECTION_LABEL[s]).join(", ")}{" "}
            {overwriting.length === 1 ? "already has" : "already have"} content here. Importing
            replaces {overwriting.length === 1 ? "it" : "them"} — this isn&apos;t a merge.
          </Alert>
        )}

        <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
          This is a one-time copy. Editing it here never changes your profile, and later profile
          edits won&apos;t reach back into this résumé.
        </p>

        {error && <Alert variant="error">{error}</Alert>}
      </div>
    </Modal>
  );
}
