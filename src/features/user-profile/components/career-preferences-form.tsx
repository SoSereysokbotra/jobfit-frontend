"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { TextField } from "@/shared/components/ui/text-field";
import { PillMultiSelect } from "@/shared/components/ui/form-controls";
import { Alert } from "@/shared/components/feedback/alert";
import { ApiError } from "@/lib/api/client";
import type { EmploymentType, JobLevel, RemoteType } from "../api/profile.api";
import {
  EMPLOYMENT_TYPE_LABELS,
  JOB_LEVEL_LABELS,
  REMOTE_TYPE_LABELS,
  asOptions,
  type ProfileView,
} from "../api/profile.mappers";

const JOB_LEVEL_OPTIONS = asOptions(JOB_LEVEL_LABELS);
const REMOTE_TYPE_OPTIONS = asOptions(REMOTE_TYPE_LABELS);
const EMPLOYMENT_TYPE_OPTIONS = asOptions(EMPLOYMENT_TYPE_LABELS);

interface CareerPreferencesFormProps {
  profile: ProfileView | null;
  /** PATCH /profiles/{userId}/preferences */
  onSavePreferences: (prefs: {
    jobLevels: JobLevel[];
    remoteTypes: RemoteType[];
    employmentTypes: EmploymentType[];
    industries: string[];
  }) => Promise<unknown>;
  /** PATCH /profiles/{userId}/salary — a separate endpoint on the backend. */
  onSaveSalary: (range: { minSalary: number; maxSalary: number }) => Promise<unknown>;
  isSubmitting?: boolean;
  error?: unknown;
}

/**
 * Work preferences + salary expectations.
 *
 * These are two endpoints, not one: the profile PATCH deliberately ignores
 * preferences and salary, so saving fans out to both.
 */
export function CareerPreferencesForm({
  profile,
  onSavePreferences,
  onSaveSalary,
  isSubmitting = false,
  error,
}: CareerPreferencesFormProps) {
  const [jobLevels, setJobLevels] = useState<JobLevel[]>([]);
  const [remoteTypes, setRemoteTypes] = useState<RemoteType[]>([]);
  const [employmentTypes, setEmploymentTypes] = useState<EmploymentType[]>([]);
  const [industriesText, setIndustriesText] = useState("");
  const [minSalary, setMinSalary] = useState("");
  const [maxSalary, setMaxSalary] = useState("");
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    if (!profile) return;
    setJobLevels(profile.desiredJobLevels);
    setRemoteTypes(profile.desiredRemoteTypes);
    setEmploymentTypes(profile.desiredEmploymentTypes);
    setIndustriesText(profile.desiredIndustries.join(", "));
    setMinSalary(profile.salaryRange ? String(profile.salaryRange.min) : "");
    setMaxSalary(profile.salaryRange ? String(profile.salaryRange.max) : "");
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    const min = Number(minSalary);
    const max = Number(maxSalary);
    const hasSalary = minSalary !== "" && maxSalary !== "";

    if (hasSalary && (Number.isNaN(min) || Number.isNaN(max))) {
      setLocalError("Salary expectations must be numbers.");
      return;
    }
    if (hasSalary && min > max) {
      setLocalError("Minimum salary cannot be greater than the maximum.");
      return;
    }

    await onSavePreferences({
      jobLevels,
      remoteTypes,
      employmentTypes,
      industries: industriesText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    });

    if (hasSalary) await onSaveSalary({ minSalary: min, maxSalary: max });
  };

  const errorMessage =
    localError ||
    (error instanceof ApiError
      ? error.messages.join(" ")
      : error
        ? "Could not save your preferences."
        : "");

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {errorMessage && <Alert variant="error">{errorMessage}</Alert>}

      <PillMultiSelect
        label="Desired Job Levels"
        options={JOB_LEVEL_OPTIONS}
        value={jobLevels}
        onChange={setJobLevels}
      />

      <PillMultiSelect
        label="Work Arrangement"
        options={REMOTE_TYPE_OPTIONS}
        value={remoteTypes}
        onChange={setRemoteTypes}
      />

      <PillMultiSelect
        label="Employment Types"
        options={EMPLOYMENT_TYPE_OPTIONS}
        value={employmentTypes}
        onChange={setEmploymentTypes}
      />

      <TextField
        id="industries"
        label="Industries"
        placeholder="Technology, Finance"
        value={industriesText}
        onChange={(e) => setIndustriesText(e.target.value)}
        hint="Separate multiple industries with commas."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField
          id="minSalary"
          label="Minimum Salary"
          type="number"
          min={0}
          placeholder="60000"
          value={minSalary}
          onChange={(e) => setMinSalary(e.target.value)}
          hint="Yearly, before tax."
        />
        <TextField
          id="maxSalary"
          label="Maximum Salary"
          type="number"
          min={0}
          placeholder="90000"
          value={maxSalary}
          onChange={(e) => setMaxSalary(e.target.value)}
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" loading={isSubmitting} loadingText="Saving…">
          Save preferences
        </Button>
      </div>
    </form>
  );
}
