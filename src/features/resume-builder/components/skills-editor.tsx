"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import { TextField } from "@/shared/components/ui/text-field";
import { Select } from "@/shared/components/ui/form-controls";
import { PROFICIENCY_LABELS } from "@/features/user-profile/api/profile.mappers";
import type { ProficiencyLevel } from "@/features/user-profile/api/profile.api";
import {
  resumeBuilderApi,
  type BuilderSkillDto,
  type SkillItemInput,
} from "../api/resume-builder.api";
import { useDebouncedSectionSave, useSectionDraft } from "../hooks/use-resume-builder";
import { RepeatableList } from "./repeatable-list";
import { SectionShell } from "./section-shell";

interface SkillsEditorProps {
  documentId: string;
  skills: BuilderSkillDto[];
  resetToken: number;
  action?: React.ReactNode;
}

const PROFICIENCY_OPTIONS = (Object.keys(PROFICIENCY_LABELS) as ProficiencyLevel[]).map(
  (value) => ({ value, label: PROFICIENCY_LABELS[value] }),
);

function toDraft(items: BuilderSkillDto[]): SkillItemInput[] {
  return items.map((item) => ({ name: item.name, proficiencyLevel: item.proficiencyLevel }));
}

function isComplete(item: SkillItemInput): boolean {
  return item.name.trim().length > 0;
}

export function SkillsEditor({ documentId, skills, resetToken, action }: SkillsEditorProps) {
  const [draft, setDraft] = useSectionDraft(toDraft(skills), resetToken);

  const { status, schedule, saveNow } = useDebouncedSectionSave<SkillItemInput[]>((items) =>
    resumeBuilderApi.putSkills(documentId, items.filter(isComplete)),
  );

  const change = (items: SkillItemInput[]) => {
    setDraft(items);
    schedule(items);
  };

  const incomplete = draft.filter((item) => !isComplete(item)).length;

  return (
    <SectionShell title="Skills" icon={Sparkles} status={status} action={action}>
      <RepeatableList<SkillItemInput>
        items={draft}
        onChange={change}
        makeEmpty={() => ({ name: "", proficiencyLevel: "INTERMEDIATE" })}
        addLabel="Add skill"
        empty={{
          icon: <Sparkles className="w-6 h-6" />,
          title: "No skills yet",
          description: "List the skills this application should lead with.",
        }}
        rowLabel={(item, index) => item.name?.trim() || `Skill ${index + 1}`}
        renderRow={(item, index, update) => (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <TextField
              id={`skill-name-${index}`}
              label="Skill"
              value={item.name}
              onChange={(e) => update({ name: e.target.value })}
              onBlur={() => void saveNow(draft)}
              placeholder="TypeScript"
            />
            <Select<ProficiencyLevel>
              id={`skill-level-${index}`}
              label="Proficiency"
              options={PROFICIENCY_OPTIONS}
              value={item.proficiencyLevel ?? "INTERMEDIATE"}
              onChange={(value) => {
                const next = [...draft];
                next[index] = { ...item, proficiencyLevel: value };
                change(next);
              }}
            />
          </div>
        )}
      />

      {incomplete > 0 && (
        <p className="mt-3 text-xs" style={{ color: "var(--color-text-tertiary)" }}>
          {incomplete === 1 ? "One skill needs" : `${incomplete} skills need`} a name before{" "}
          {incomplete === 1 ? "it is" : "they are"} saved.
        </p>
      )}
    </SectionShell>
  );
}
