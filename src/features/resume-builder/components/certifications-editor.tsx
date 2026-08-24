"use client";

import React from "react";
import { Award } from "lucide-react";
import { TextField } from "@/shared/components/ui/text-field";
import {
  resumeBuilderApi,
  type BuilderCertificationDto,
  type CertificationItemInput,
} from "../api/resume-builder.api";
import {
  rowIdentity,
  useDebouncedSectionSave,
  useLocalDocumentPatch,
  useSectionDraft,
} from "../hooks/use-resume-builder";
import { fromDateInputValue, toDateInputValue, todayInputValue } from "../lib/dates";
import { RepeatableList } from "./repeatable-list";
import { SectionShell } from "./section-shell";

interface CertificationsEditorProps {
  documentId: string;
  certifications: BuilderCertificationDto[];
  resetToken: number;
  action?: React.ReactNode;
}

function toDraft(items: BuilderCertificationDto[]): CertificationItemInput[] {
  return items.map((item) => ({
    name: item.name,
    issuer: item.issuer,
    issueDate: item.issueDate,
    expirationDate: item.expirationDate,
    credentialId: item.credentialId ?? "",
    credentialUrl: item.credentialUrl ?? "",
  }));
}

/** Draft rows are Input-shaped; the preview reads DTO-shaped rows. */
function toRows(
  items: CertificationItemInput[],
  previous: BuilderCertificationDto[],
): BuilderCertificationDto[] {
  return items.map((item, index) => ({
    ...rowIdentity(previous, index),
    name: item.name,
    issuer: item.issuer,
    issueDate: item.issueDate,
    expirationDate: item.expirationDate,
    credentialId: item.credentialId,
    credentialUrl: item.credentialUrl,
  }));
}

/** `name` and `issuer` are both @IsNotEmpty server-side. */
function isComplete(item: CertificationItemInput): boolean {
  return item.name.trim().length > 0 && item.issuer.trim().length > 0;
}

export function CertificationsEditor({
  documentId,
  certifications,
  resetToken,
  action,
}: CertificationsEditorProps) {
  const [draft, setDraft] = useSectionDraft(toDraft(certifications), resetToken);
  const patchDocument = useLocalDocumentPatch(documentId);

  const { status, schedule, saveNow } = useDebouncedSectionSave<CertificationItemInput[]>((items) =>
    resumeBuilderApi.putCertifications(
      documentId,
      items.filter(isComplete).map((item) => ({
        ...item,
        credentialId: item.credentialId?.trim() || undefined,
        credentialUrl: item.credentialUrl?.trim() || undefined,
      })),
    ),
  );

  /**
   * The one place a row edit lands. Local draft (so the cursor is stable),
   * preview cache (so the preview redraws this render) and the debounced PUT
   * (so the server catches up in the background) all move together.
   */
  const change = (items: CertificationItemInput[]) => {
    setDraft(items);
    patchDocument({ certifications: toRows(items, certifications) });
    schedule(items);
  };

  const incomplete = draft.filter((item) => !isComplete(item)).length;

  return (
    <SectionShell title="Certifications" icon={Award} status={status} action={action}>
      <RepeatableList<CertificationItemInput>
        items={draft}
        onChange={change}
        makeEmpty={() => ({
          name: "",
          issuer: "",
          issueDate: fromDateInputValue(todayInputValue())!,
          credentialId: "",
          credentialUrl: "",
        })}
        addLabel="Add certification"
        empty={{
          icon: <Award className="w-6 h-6" />,
          title: "No certifications yet",
          description: "Add any credentials worth showing on this résumé.",
        }}
        rowLabel={(item, index) => item.name?.trim() || `Certification ${index + 1}`}
        renderRow={(item, index, update) => (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <TextField
                id={`cert-name-${index}`}
                label="Certification"
                value={item.name}
                onChange={(e) => update({ name: e.target.value })}
                onBlur={() => void saveNow(draft)}
                placeholder="AWS Solutions Architect"
              />
              <TextField
                id={`cert-issuer-${index}`}
                label="Issuer"
                value={item.issuer}
                onChange={(e) => update({ issuer: e.target.value })}
                onBlur={() => void saveNow(draft)}
                placeholder="Amazon"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <TextField
                id={`cert-issued-${index}`}
                label="Issued"
                type="date"
                value={toDateInputValue(item.issueDate)}
                onChange={(e) =>
                  update({ issueDate: fromDateInputValue(e.target.value) ?? item.issueDate })
                }
                onBlur={() => void saveNow(draft)}
              />
              <TextField
                id={`cert-expires-${index}`}
                label="Expires"
                type="date"
                value={toDateInputValue(item.expirationDate)}
                onChange={(e) => update({ expirationDate: fromDateInputValue(e.target.value) })}
                onBlur={() => void saveNow(draft)}
                hint="Leave empty if it doesn't expire."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <TextField
                id={`cert-credential-${index}`}
                label="Credential ID"
                value={item.credentialId ?? ""}
                onChange={(e) => update({ credentialId: e.target.value })}
                onBlur={() => void saveNow(draft)}
                placeholder="ABC-123"
              />
              <TextField
                id={`cert-url-${index}`}
                label="Credential URL"
                type="url"
                value={item.credentialUrl ?? ""}
                onChange={(e) => update({ credentialUrl: e.target.value })}
                onBlur={() => void saveNow(draft)}
                placeholder="https://…"
              />
            </div>
          </>
        )}
      />

      {incomplete > 0 && (
        <p className="mt-3 text-xs" style={{ color: "var(--color-text-tertiary)" }}>
          {incomplete === 1 ? "One certification needs" : `${incomplete} certifications need`} a name
          and issuer before {incomplete === 1 ? "it is" : "they are"} saved.
        </p>
      )}
    </SectionShell>
  );
}
