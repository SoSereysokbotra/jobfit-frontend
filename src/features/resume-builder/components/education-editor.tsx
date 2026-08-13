"use client";

import React from "react";
import { GraduationCap } from "lucide-react";
import { TextField } from "@/shared/components/ui/text-field";
import { Select, Textarea } from "@/shared/components/ui/form-controls";
import { DEGREE_LEVEL_LABELS } from "@/features/user-profile/api/profile.mappers";
import type { DegreeLevel } from "@/features/user-profile/api/profile.api";
import {
  resumeBuilderApi,
  type BuilderEducationDto,
  type EducationItemInput,
} from "../api/resume-builder.api";
import { useDebouncedSectionSave, useSectionDraft } from "../hooks/use-resume-builder";
import { fromDateInputValue, toDateInputValue, todayInputValue } from "../lib/dates";
import { RepeatableList } from "./repeatable-list";
import { SectionShell } from "./section-shell";

interface EducationEditorProps {
  documentId: string;
  educations: BuilderEducationDto[];
  resetToken: number;
  action?: React.ReactNode;
}

/** Built from the profile feature's own label map so the two never diverge. */
const DEGREE_OPTIONS = (Object.keys(DEGREE_LEVEL_LABELS) as DegreeLevel[]).map((value) => ({
  value,
  label: DEGREE_LEVEL_LABELS[value],
}));

function toDraft(items: BuilderEducationDto[]): EducationItemInput[] {
  return items.map((item) => ({
    institution: item.institution,
    degreeLevel: item.degreeLevel,
    fieldOfStudy: item.fieldOfStudy,
    startDate: item.startDate,
    endDate: item.endDate,
    gpa: item.gpa,
    description: item.description ?? "",
  }));
}

function isComplete(item: EducationItemInput): boolean {
  return item.institution.trim().length > 0 && item.fieldOfStudy.trim().length > 0;
}

export function EducationEditor({
  documentId,
  educations,
  resetToken,
  action,
}: EducationEditorProps) {
  const [draft, setDraft] = useSectionDraft(toDraft(educations), resetToken);

  const { status, schedule, saveNow } = useDebouncedSectionSave<EducationItemInput[]>((items) =>
    resumeBuilderApi.putEducation(
      documentId,
      items.filter(isComplete).map((item) => ({
        ...item,
        description: item.description?.trim() || undefined,
        // The DTO validates 0–4 and rejects NaN, so an emptied field must drop out.
        gpa: typeof item.gpa === "number" && Number.isFinite(item.gpa) ? item.gpa : undefined,
      })),
    ),
  );

  const change = (items: EducationItemInput[]) => {
    setDraft(items);
    schedule(items);
  };

  const incomplete = draft.filter((item) => !isComplete(item)).length;

  return (
    <SectionShell title="Education" icon={GraduationCap} status={status} action={action}>
      <RepeatableList<EducationItemInput>
        items={draft}
        onChange={change}
        makeEmpty={() => ({
          institution: "",
          degreeLevel: "BACHELOR",
          fieldOfStudy: "",
          startDate: fromDateInputValue(todayInputValue())!,
          description: "",
        })}
        addLabel="Add education"
        empty={{
          icon: <GraduationCap className="w-6 h-6" />,
          title: "No education yet",
          description: "Add the degrees or diplomas you want on this résumé.",
        }}
        rowLabel={(item, index) => item.institution?.trim() || `Education ${index + 1}`}
        renderRow={(item, index, update) => (
          <>
            <TextField
              id={`edu-institution-${index}`}
              label="Institution"
              value={item.institution}
              onChange={(e) => update({ institution: e.target.value })}
              onBlur={() => void saveNow(draft)}
              placeholder="MIT"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select<DegreeLevel>
                id={`edu-degree-${index}`}
                label="Degree"
                options={DEGREE_OPTIONS}
                value={item.degreeLevel}
                onChange={(value) => {
                  const next = [...draft];
                  next[index] = { ...item, degreeLevel: value };
                  change(next);
                }}
              />
              <TextField
                id={`edu-field-${index}`}
                label="Field of study"
                value={item.fieldOfStudy}
                onChange={(e) => update({ fieldOfStudy: e.target.value })}
                onBlur={() => void saveNow(draft)}
                placeholder="Computer Science"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <TextField
                id={`edu-start-${index}`}
                label="Start date"
                type="date"
                value={toDateInputValue(item.startDate)}
                onChange={(e) =>
                  update({ startDate: fromDateInputValue(e.target.value) ?? item.startDate })
                }
                onBlur={() => void saveNow(draft)}
              />
              <TextField
                id={`edu-end-${index}`}
                label="End date"
                type="date"
                value={toDateInputValue(item.endDate)}
                onChange={(e) => update({ endDate: fromDateInputValue(e.target.value) })}
                onBlur={() => void saveNow(draft)}
              />
              <TextField
                id={`edu-gpa-${index}`}
                label="GPA"
                type="number"
                min={0}
                max={4}
                step={0.1}
                value={item.gpa ?? ""}
                onChange={(e) =>
                  update({ gpa: e.target.value === "" ? undefined : Number(e.target.value) })
                }
                onBlur={() => void saveNow(draft)}
                placeholder="3.8"
                hint="0–4, optional."
              />
            </div>

            <Textarea
              id={`edu-desc-${index}`}
              label="Notes"
              rows={2}
              value={item.description ?? ""}
              onChange={(e) => update({ description: e.target.value })}
              onBlur={() => void saveNow(draft)}
              placeholder="Honours, thesis, relevant coursework."
            />
          </>
        )}
      />

      {incomplete > 0 && (
        <p className="mt-3 text-xs" style={{ color: "var(--color-text-tertiary)" }}>
          {incomplete === 1 ? "One entry needs" : `${incomplete} entries need`} an institution and
          field of study before {incomplete === 1 ? "it is" : "they are"} saved.
        </p>
      )}
    </SectionShell>
  );
}
