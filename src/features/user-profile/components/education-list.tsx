"use client";

import React, { useState } from "react";
import { GraduationCap, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { TextField } from "@/shared/components/ui/text-field";
import { Select, Textarea } from "@/shared/components/ui/form-controls";
import { EmptyState } from "@/shared/components/data-display/empty-state";
import { Skeleton } from "@/shared/components/feedback/skeleton";
import { Alert } from "@/shared/components/feedback/alert";
import { ApiError } from "@/lib/api/client";
import type { AddEducationInput, DegreeLevel } from "../api/profile.api";
import {
  DEGREE_LEVEL_LABELS,
  asOptions,
  fromDateInputValue,
  toDateInputValue,
  type EducationView,
} from "../api/profile.mappers";

const DEGREE_LEVEL_OPTIONS = asOptions(DEGREE_LEVEL_LABELS);

interface EducationFormState {
  institution: string;
  degreeLevel: DegreeLevel;
  fieldOfStudy: string;
  description: string;
  startDate: string;
  endDate: string;
  gpa: string;
}

const EMPTY_FORM: EducationFormState = {
  institution: "", degreeLevel: "BACHELOR", fieldOfStudy: "",
  description: "", startDate: "", endDate: "", gpa: "",
};

function toFormState(item: EducationView): EducationFormState {
  return {
    institution: item.institution,
    degreeLevel: item.degreeLevel,
    fieldOfStudy: item.fieldOfStudy,
    description: item.description ?? "",
    startDate: toDateInputValue(item.startDate),
    endDate: toDateInputValue(item.endDate),
    gpa: typeof item.gpa === "number" ? String(item.gpa) : "",
  };
}

function toInput(form: EducationFormState): AddEducationInput {
  return {
    institution: form.institution.trim(),
    degreeLevel: form.degreeLevel,
    fieldOfStudy: form.fieldOfStudy.trim(),
    description: form.description.trim() || undefined,
    startDate: fromDateInputValue(form.startDate)!,
    endDate: fromDateInputValue(form.endDate),
    gpa: form.gpa ? Number(form.gpa) : undefined,
  };
}

interface EducationListProps {
  education: EducationView[];
  isLoading?: boolean;
  onAdd: (input: AddEducationInput) => Promise<unknown>;
  onUpdate: (eduId: string, input: Partial<AddEducationInput>) => Promise<unknown>;
  onRemove: (eduId: string) => Promise<unknown>;
  isMutating?: boolean;
  error?: unknown;
}

/** Education history — GET/POST/PATCH/DELETE /profiles/{userId}/education. */
export function EducationList({
  education,
  isLoading = false,
  onAdd,
  onUpdate,
  onRemove,
  isMutating = false,
  error,
}: EducationListProps) {
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<EducationFormState>(EMPTY_FORM);

  const openNew = () => {
    setForm(EMPTY_FORM);
    setEditing("new");
  };
  const openEdit = (item: EducationView) => {
    setForm(toFormState(item));
    setEditing(item.id);
  };
  const close = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const input = toInput(form);
    if (editing === "new") await onAdd(input);
    else if (editing) await onUpdate(editing, input);
    close();
  };

  const canSubmit = form.institution.trim() && form.fieldOfStudy.trim() && form.startDate;
  // The DTO caps GPA at 4; catch it here rather than round-tripping a 400.
  const gpaError =
    form.gpa && (Number(form.gpa) < 0 || Number(form.gpa) > 4)
      ? "GPA must be between 0 and 4."
      : undefined;

  const errorMessage =
    error instanceof ApiError
      ? error.messages.join(" ")
      : error
        ? "Could not save this qualification."
        : "";

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[0, 1].map((i) => (
          <div key={i} className="rounded-lg border border-neutral-200 p-4 space-y-2">
            <Skeleton className="h-4 w-2/5" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {errorMessage && <Alert variant="error">{errorMessage}</Alert>}

      {education.length === 0 && editing !== "new" ? (
        <EmptyState
          icon={<GraduationCap className="w-6 h-6" />}
          title="No education yet"
          description="Add your degrees, diplomas or certifications."
          action={
            <Button onClick={openNew}>
              <Plus className="w-4 h-4" /> Add education
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {education.map((item) =>
            editing === item.id ? null : (
              <div
                key={item.id}
                className="rounded-lg border border-border bg-card p-4 shadow-sm transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-neutral-900 truncate">
                      {item.degreeLevelLabel} · {item.fieldOfStudy}
                    </p>
                    <p className="text-sm text-neutral-600 truncate">{item.institution}</p>
                    <p className="text-xs text-neutral-400 mt-0.5">{item.dateRangeLabel}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => openEdit(item)}
                      aria-label={`Edit ${item.fieldOfStudy}`}
                      className="p-1.5 rounded-md text-neutral-400 hover:bg-neutral-50 hover:text-neutral-600 transition-colors duration-200"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => void onRemove(item.id)}
                      disabled={isMutating}
                      aria-label={`Delete ${item.fieldOfStudy}`}
                      className="p-1.5 rounded-md text-neutral-400 hover:bg-error-50 hover:text-error-600 transition-colors duration-200 disabled:opacity-40"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {typeof item.gpa === "number" && (
                  <div className="mt-3">
                    <Badge variant="neutral">GPA {item.gpa}</Badge>
                  </div>
                )}

                {item.description && (
                  <p className="text-sm text-neutral-600 mt-3 whitespace-pre-line">
                    {item.description}
                  </p>
                )}
              </div>
            ),
          )}

          {editing === null && (
            <Button variant="outline" onClick={openNew}>
              <Plus className="w-4 h-4" /> Add education
            </Button>
          )}
        </div>
      )}

      {editing !== null && (
        <form onSubmit={handleSubmit} className="rounded-lg border border-border bg-card p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField
              id="edu-institution"
              label="Institution"
              required
              placeholder="Royal University of Phnom Penh"
              value={form.institution}
              onChange={(e) => setForm((f) => ({ ...f, institution: e.target.value }))}
            />
            <TextField
              id="edu-field"
              label="Field of Study"
              required
              placeholder="Computer Science"
              value={form.fieldOfStudy}
              onChange={(e) => setForm((f) => ({ ...f, fieldOfStudy: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              id="edu-degree"
              label="Degree"
              options={DEGREE_LEVEL_OPTIONS}
              value={form.degreeLevel}
              onChange={(v) => setForm((f) => ({ ...f, degreeLevel: v }))}
            />
            <TextField
              id="edu-start"
              label="Start Date"
              type="date"
              required
              value={form.startDate}
              onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
            />
            <TextField
              id="edu-end"
              label="End Date"
              type="date"
              value={form.endDate}
              onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
              hint="Leave blank if ongoing."
            />
          </div>

          <TextField
            id="edu-gpa"
            label="GPA"
            type="number"
            min={0}
            max={4}
            step="0.01"
            placeholder="3.6"
            value={form.gpa}
            onChange={(e) => setForm((f) => ({ ...f, gpa: e.target.value }))}
            error={gpaError}
          />

          <Textarea
            id="edu-description"
            label="Description"
            rows={3}
            placeholder="Honours, focus areas, thesis…"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={close}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!canSubmit || Boolean(gpaError)}
              loading={isMutating}
              loadingText="Saving…"
            >
              {editing === "new" ? "Add education" : "Save changes"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
