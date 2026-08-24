"use client";

import React from "react";
import { Briefcase } from "lucide-react";
import { TextField } from "@/shared/components/ui/text-field";
import { Textarea } from "@/shared/components/ui/form-controls";
import {
  resumeBuilderApi,
  type BuilderExperienceDto,
  type ExperienceItemInput,
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

interface ExperienceEditorProps {
  documentId: string;
  experiences: BuilderExperienceDto[];
  resetToken: number;
  action?: React.ReactNode;
}

function toDraft(items: BuilderExperienceDto[]): ExperienceItemInput[] {
  return items.map((item) => ({
    company: item.company,
    title: item.title,
    location: item.location ?? "",
    startDate: item.startDate,
    endDate: item.endDate,
    isCurrentJob: item.isCurrentJob,
    description: item.description ?? "",
    technologies: item.technologies ?? [],
  }));
}

/** Draft rows are Input-shaped; the preview reads DTO-shaped rows. */
function toRows(
  items: ExperienceItemInput[],
  previous: BuilderExperienceDto[],
): BuilderExperienceDto[] {
  return items.map((item, index) => ({
    ...rowIdentity(previous, index),
    company: item.company,
    title: item.title,
    location: item.location,
    startDate: item.startDate,
    // Mirrors what the save payload does, so the preview shows "Present" the
    // moment the box is ticked rather than the stale end date underneath it.
    endDate: item.isCurrentJob ? undefined : item.endDate,
    isCurrentJob: item.isCurrentJob ?? false,
    description: item.description,
    technologies: item.technologies ?? [],
  }));
}

/** `company` and `title` are @IsNotEmpty server-side — a half-typed row would 400. */
function isComplete(item: ExperienceItemInput): boolean {
  return item.company.trim().length > 0 && item.title.trim().length > 0;
}

export function ExperienceEditor({
  documentId,
  experiences,
  resetToken,
  action,
}: ExperienceEditorProps) {
  const [draft, setDraft] = useSectionDraft(toDraft(experiences), resetToken);
  const patchDocument = useLocalDocumentPatch(documentId);

  const { status, schedule, saveNow } = useDebouncedSectionSave<ExperienceItemInput[]>((items) =>
    resumeBuilderApi.putExperience(
      documentId,
      // Incomplete rows are held locally rather than sent. Sending them is a 400
      // that would leave the whole section unsaved, including the good rows.
      items.filter(isComplete).map((item) => ({
        ...item,
        location: item.location?.trim() || undefined,
        description: item.description?.trim() || undefined,
        endDate: item.isCurrentJob ? undefined : item.endDate,
      })),
    ),
  );

  /**
   * The one place a row edit lands. Local draft (so the cursor is stable),
   * preview cache (so the preview redraws this render) and the debounced PUT
   * (so the server catches up in the background) all move together.
   */
  const change = (items: ExperienceItemInput[]) => {
    setDraft(items);
    patchDocument({ experiences: toRows(items, experiences) });
    schedule(items);
  };

  const incomplete = draft.filter((item) => !isComplete(item)).length;

  return (
    <SectionShell title="Experience" icon={Briefcase} status={status} action={action}>
      <RepeatableList<ExperienceItemInput>
        items={draft}
        onChange={change}
        makeEmpty={() => ({
          company: "",
          title: "",
          location: "",
          startDate: fromDateInputValue(todayInputValue())!,
          isCurrentJob: false,
          description: "",
          technologies: [],
        })}
        addLabel="Add role"
        empty={{
          icon: <Briefcase className="w-6 h-6" />,
          title: "No experience yet",
          description: "Add the roles you want on this résumé, most recent first.",
        }}
        rowLabel={(item, index) => item.title?.trim() || item.company?.trim() || `Role ${index + 1}`}
        renderRow={(item, index, update) => (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <TextField
                id={`exp-title-${index}`}
                label="Job title"
                value={item.title}
                onChange={(e) => update({ title: e.target.value })}
                onBlur={() => void saveNow(draft)}
                placeholder="Senior Engineer"
              />
              <TextField
                id={`exp-company-${index}`}
                label="Company"
                value={item.company}
                onChange={(e) => update({ company: e.target.value })}
                onBlur={() => void saveNow(draft)}
                placeholder="Acme"
              />
            </div>

            <TextField
              id={`exp-location-${index}`}
              label="Location"
              value={item.location ?? ""}
              onChange={(e) => update({ location: e.target.value })}
              onBlur={() => void saveNow(draft)}
              placeholder="Remote"
              hint="Not imported from your profile — the profile has no location on a role."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <TextField
                id={`exp-start-${index}`}
                label="Start date"
                type="date"
                value={toDateInputValue(item.startDate)}
                onChange={(e) =>
                  update({ startDate: fromDateInputValue(e.target.value) ?? item.startDate })
                }
                onBlur={() => void saveNow(draft)}
              />
              <TextField
                id={`exp-end-${index}`}
                label="End date"
                type="date"
                value={toDateInputValue(item.endDate)}
                disabled={item.isCurrentJob}
                onChange={(e) => update({ endDate: fromDateInputValue(e.target.value) })}
                onBlur={() => void saveNow(draft)}
              />
            </div>

            <label className="flex items-center gap-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
              <input
                type="checkbox"
                checked={item.isCurrentJob ?? false}
                onChange={(e) => {
                  const next = [...draft];
                  next[index] = {
                    ...item,
                    isCurrentJob: e.target.checked,
                    endDate: e.target.checked ? undefined : item.endDate,
                  };
                  change(next);
                }}
                className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
              />
              I currently work here
            </label>

            <Textarea
              id={`exp-desc-${index}`}
              label="What you did"
              rows={3}
              value={item.description ?? ""}
              onChange={(e) => update({ description: e.target.value })}
              onBlur={() => void saveNow(draft)}
              placeholder="Led the platform team; shipped the billing rewrite."
            />

            <TextField
              id={`exp-tech-${index}`}
              label="Technologies"
              value={(item.technologies ?? []).join(", ")}
              onChange={(e) =>
                update({
                  technologies: e.target.value
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean),
                })
              }
              onBlur={() => void saveNow(draft)}
              placeholder="TypeScript, Postgres"
              hint="Comma separated."
            />
          </>
        )}
      />

      {incomplete > 0 && (
        <p className="mt-3 text-xs" style={{ color: "var(--color-text-tertiary)" }}>
          {incomplete === 1 ? "One role needs" : `${incomplete} roles need`} a job title and company
          before {incomplete === 1 ? "it is" : "they are"} saved.
        </p>
      )}
    </SectionShell>
  );
}
