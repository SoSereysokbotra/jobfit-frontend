"use client";

import React, { useState } from "react";
import { Briefcase, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { TextField } from "@/shared/components/ui/text-field";
import { Select, Textarea } from "@/shared/components/ui/form-controls";
import { EmptyState } from "@/shared/components/data-display/empty-state";
import { Skeleton } from "@/shared/components/feedback/skeleton";
import { Alert } from "@/shared/components/feedback/alert";
import { ApiError } from "@/lib/api/client";
import type { AddExperienceInput, EmploymentType, JobLevel } from "../api/profile.api";
import {
  EMPLOYMENT_TYPE_LABELS,
  JOB_LEVEL_LABELS,
  asOptions,
  fromDateInputValue,
  toDateInputValue,
  type ExperienceView,
} from "../api/profile.mappers";

const JOB_LEVEL_OPTIONS = asOptions(JOB_LEVEL_LABELS);
const EMPLOYMENT_TYPE_OPTIONS = asOptions(EMPLOYMENT_TYPE_LABELS);

interface ExperienceFormState {
  company: string;
  title: string;
  jobLevel: JobLevel;
  employmentType: EmploymentType;
  industry: string;
  description: string;
  isCurrentJob: boolean;
  startDate: string;
  endDate: string;
  technologies: string;
}

const EMPTY_FORM: ExperienceFormState = {
  company: "", title: "", jobLevel: "MID", employmentType: "FULL_TIME",
  industry: "", description: "", isCurrentJob: false,
  startDate: "", endDate: "", technologies: "",
};

function toFormState(item: ExperienceView): ExperienceFormState {
  return {
    company: item.company,
    title: item.title,
    jobLevel: item.jobLevel,
    employmentType: item.employmentType,
    industry: item.industry,
    description: item.description ?? "",
    isCurrentJob: item.isCurrentJob,
    startDate: toDateInputValue(item.startDate),
    endDate: toDateInputValue(item.endDate),
    technologies: (item.technologies ?? []).join(", "),
  };
}

function toInput(form: ExperienceFormState): AddExperienceInput {
  const technologies = form.technologies.split(",").map((t) => t.trim()).filter(Boolean);
  return {
    company: form.company.trim(),
    title: form.title.trim(),
    jobLevel: form.jobLevel,
    employmentType: form.employmentType,
    industry: form.industry.trim(),
    description: form.description.trim() || undefined,
    isCurrentJob: form.isCurrentJob,
    startDate: fromDateInputValue(form.startDate)!,
    // A current job has no end date — sending one would contradict the flag.
    endDate: form.isCurrentJob ? undefined : fromDateInputValue(form.endDate),
    technologies: technologies.length ? technologies : undefined,
  };
}

interface ExperienceListProps {
  experience: ExperienceView[];
  isLoading?: boolean;
  onAdd: (input: AddExperienceInput) => Promise<unknown>;
  onUpdate: (expId: string, input: Partial<AddExperienceInput>) => Promise<unknown>;
  onRemove: (expId: string) => Promise<unknown>;
  isMutating?: boolean;
  error?: unknown;
}

/** Work history — GET/POST/PATCH/DELETE /profiles/{userId}/experience. */
export function ExperienceList({
  experience,
  isLoading = false,
  onAdd,
  onUpdate,
  onRemove,
  isMutating = false,
  error,
}: ExperienceListProps) {
  // null = closed, "new" = adding, otherwise the id being edited.
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<ExperienceFormState>(EMPTY_FORM);

  const openNew = () => {
    setForm(EMPTY_FORM);
    setEditing("new");
  };
  const openEdit = (item: ExperienceView) => {
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

  const canSubmit =
    form.company.trim() && form.title.trim() && form.industry.trim() && form.startDate;

  const errorMessage =
    error instanceof ApiError ? error.messages.join(" ") : error ? "Could not save this role." : "";

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[0, 1].map((i) => (
          <div key={i} className="rounded-lg border border-neutral-200 p-4 space-y-2">
            <Skeleton className="h-4 w-2/5" />
            <Skeleton className="h-3 w-1/4" />
            <Skeleton className="h-3 w-3/5" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {errorMessage && <Alert variant="error">{errorMessage}</Alert>}

      {experience.length === 0 && editing !== "new" ? (
        <EmptyState
          icon={<Briefcase className="w-6 h-6" />}
          title="No work experience yet"
          description="Add the roles you've held so employers can see your background."
          action={
            <Button onClick={openNew}>
              <Plus className="w-4 h-4" /> Add experience
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {experience.map((item) =>
            editing === item.id ? null : (
              <div
                key={item.id}
                className="rounded-lg border border-border bg-card p-4 shadow-sm transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-neutral-900 truncate">{item.title}</p>
                    <p className="text-sm text-neutral-600 truncate">{item.company}</p>
                    <p className="text-xs text-neutral-400 mt-0.5">{item.dateRangeLabel}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => openEdit(item)}
                      aria-label={`Edit ${item.title}`}
                      className="p-1.5 rounded-md text-neutral-400 hover:bg-neutral-50 hover:text-neutral-600 transition-colors duration-200"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => void onRemove(item.id)}
                      disabled={isMutating}
                      aria-label={`Delete ${item.title}`}
                      className="p-1.5 rounded-md text-neutral-400 hover:bg-error-50 hover:text-error-600 transition-colors duration-200 disabled:opacity-40"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-3">
                  <Badge variant="primary">{item.jobLevelLabel}</Badge>
                  <Badge variant="neutral">{item.employmentTypeLabel}</Badge>
                  {item.isCurrentJob && <Badge variant="success">Current</Badge>}
                </div>

                {item.description && (
                  <p className="text-sm text-neutral-600 mt-3 whitespace-pre-line">
                    {item.description}
                  </p>
                )}

                {item.technologies && item.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {item.technologies.map((tech) => (
                      <Badge key={tech} variant="info">{tech}</Badge>
                    ))}
                  </div>
                )}
              </div>
            ),
          )}

          {editing === null && (
            <Button variant="outline" onClick={openNew}>
              <Plus className="w-4 h-4" /> Add experience
            </Button>
          )}
        </div>
      )}

      {editing !== null && (
        <form onSubmit={handleSubmit} className="rounded-lg border border-border bg-card p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField
              id="exp-title"
              label="Job Title"
              required
              placeholder="Frontend Engineer"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
            <TextField
              id="exp-company"
              label="Company"
              required
              placeholder="Acme Inc"
              value={form.company}
              onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              id="exp-level"
              label="Level"
              options={JOB_LEVEL_OPTIONS}
              value={form.jobLevel}
              onChange={(v) => setForm((f) => ({ ...f, jobLevel: v }))}
            />
            <Select
              id="exp-type"
              label="Employment Type"
              options={EMPLOYMENT_TYPE_OPTIONS}
              value={form.employmentType}
              onChange={(v) => setForm((f) => ({ ...f, employmentType: v }))}
            />
            <TextField
              id="exp-industry"
              label="Industry"
              required
              placeholder="Technology"
              value={form.industry}
              onChange={(e) => setForm((f) => ({ ...f, industry: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField
              id="exp-start"
              label="Start Date"
              type="date"
              required
              value={form.startDate}
              onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
            />
            <TextField
              id="exp-end"
              label="End Date"
              type="date"
              disabled={form.isCurrentJob}
              value={form.isCurrentJob ? "" : form.endDate}
              onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
              hint={form.isCurrentJob ? "Not needed for a current role." : undefined}
            />
          </div>

          <div className="flex items-center">
            <input
              id="exp-current"
              type="checkbox"
              checked={form.isCurrentJob}
              onChange={(e) => setForm((f) => ({ ...f, isCurrentJob: e.target.checked }))}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-200 rounded bg-white"
            />
            <label htmlFor="exp-current" className="ml-2 text-xs text-neutral-500">
              I currently work here
            </label>
          </div>

          <Textarea
            id="exp-description"
            label="Description"
            rows={3}
            placeholder="What did you work on?"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />

          <TextField
            id="exp-tech"
            label="Technologies"
            placeholder="React, TypeScript, Node.js"
            value={form.technologies}
            onChange={(e) => setForm((f) => ({ ...f, technologies: e.target.value }))}
            hint="Separate with commas."
          />

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={close}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit} loading={isMutating} loadingText="Saving…">
              {editing === "new" ? "Add experience" : "Save changes"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
