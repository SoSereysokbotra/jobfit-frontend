"use client";

import React, { useState } from "react";
import { Plus, X, ThumbsUp, Sparkles } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Select } from "@/shared/components/ui/form-controls";
import { TextField } from "@/shared/components/ui/text-field";
import { EmptyState } from "@/shared/components/data-display/empty-state";
import { Skeleton } from "@/shared/components/feedback/skeleton";
import { Alert } from "@/shared/components/feedback/alert";
import type { CatalogueSkill, ProficiencyLevel, UserSkillDto } from "../api/profile.api";
import { PROFICIENCY_LABELS, asOptions } from "../api/profile.mappers";

const PROFICIENCY_OPTIONS = asOptions(PROFICIENCY_LABELS);

interface SkillsEditorProps {
  skills: UserSkillDto[];
  catalogue: CatalogueSkill[];
  isLoading?: boolean;
  onAdd: (input: { skillId: string; proficiencyLevel: ProficiencyLevel; yearsOfExperience?: number }) => Promise<unknown>;
  onRemove: (skillId: string) => Promise<unknown>;
  onEndorse: (skillId: string) => Promise<unknown>;
  isMutating?: boolean;
}

/**
 * Skills list + add form.
 *
 * TODO(backend): this whole component is mock-backed. The backend has no skill
 * catalogue endpoint to pick a `skillId` from, and SkillResponseDto returns no
 * skill `name` — see the header of profile.api.ts. The props/shape here already
 * match what a live implementation would return, so swapping is one file.
 */
export function SkillsEditor({
  skills,
  catalogue,
  isLoading = false,
  onAdd,
  onRemove,
  onEndorse,
  isMutating = false,
}: SkillsEditorProps) {
  const [showForm, setShowForm] = useState(false);
  const [skillId, setSkillId] = useState<string>("");
  const [proficiency, setProficiency] = useState<ProficiencyLevel>("INTERMEDIATE");
  const [years, setYears] = useState("");

  // Don't offer skills the user already has.
  const available = catalogue.filter((c) => !skills.some((s) => s.skillId === c.id));

  const reset = () => {
    setSkillId("");
    setProficiency("INTERMEDIATE");
    setYears("");
    setShowForm(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillId) return;
    await onAdd({
      skillId,
      proficiencyLevel: proficiency,
      yearsOfExperience: years ? Number(years) : undefined,
    });
    reset();
  };

  if (isLoading) {
    return (
      <div className="flex flex-wrap gap-2">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-8 w-24 rounded-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Alert variant="info">
        Skills are a preview — they aren&apos;t saved to your account yet.
      </Alert>

      {skills.length === 0 && !showForm ? (
        <EmptyState
          icon={<Sparkles className="w-6 h-6" />}
          title="No skills yet"
          description="Add the skills you want to be matched on."
          action={
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4" /> Add skill
            </Button>
          }
        />
      ) : (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span
              key={skill.id}
              className="inline-flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-full border border-neutral-200 bg-white"
            >
              <span className="text-sm font-semibold text-neutral-900">{skill.name}</span>
              <Badge variant="neutral">{PROFICIENCY_LABELS[skill.proficiencyLevel]}</Badge>
              {typeof skill.yearsOfExperience === "number" && (
                <span className="text-xs text-neutral-500">{skill.yearsOfExperience}y</span>
              )}
              <button
                type="button"
                onClick={() => void onEndorse(skill.skillId)}
                disabled={isMutating}
                aria-label={`Endorse ${skill.name}`}
                className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-primary-600 transition-colors duration-200 disabled:opacity-40"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                {skill.endorsementCount}
              </button>
              <button
                type="button"
                onClick={() => void onRemove(skill.skillId)}
                disabled={isMutating}
                aria-label={`Remove ${skill.name}`}
                className="p-1 rounded-full text-neutral-400 hover:bg-error-50 hover:text-error-600 transition-colors duration-200 disabled:opacity-40"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}

          {!showForm && available.length > 0 && (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-dashed border-neutral-200 text-xs font-semibold text-neutral-600 hover:bg-neutral-50 transition-all duration-200"
            >
              <Plus className="w-3.5 h-3.5" /> Add skill
            </button>
          )}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleAdd}
          className="rounded-lg border border-neutral-200 bg-white p-4 space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              id="skillId"
              label="Skill"
              options={available.map((s) => ({ value: s.id, label: s.name }))}
              value={skillId}
              onChange={setSkillId}
              placeholder="Select a skill"
            />
            <Select
              id="proficiency"
              label="Proficiency"
              options={PROFICIENCY_OPTIONS}
              value={proficiency}
              onChange={setProficiency}
            />
            <TextField
              id="years"
              label="Years"
              type="number"
              min={0}
              placeholder="3"
              value={years}
              onChange={(e) => setYears(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={reset}>
              Cancel
            </Button>
            <Button type="submit" disabled={!skillId} loading={isMutating} loadingText="Adding…">
              Add skill
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
