"use client";

import React, { useEffect, useState } from "react";
import { Modal } from "@/shared/components/ui/modal";
import { Alert } from "@/shared/components/feedback/alert";
import {
  STAGE_META,
  TRACKER_STAGES,
  type TrackedJob,
  type TrackerStage,
} from "../api/tracker.api";

const INPUT =
  "w-full px-3 py-2 rounded-md border text-sm outline-none transition-all focus:ring-2 focus:ring-primary-500 focus:border-transparent";

interface TrackerCardModalProps {
  open: boolean;
  /** The card being edited, or null when adding. */
  job: TrackedJob | null;
  error: string | null;
  onClose: () => void;
  onAdd: (input: {
    title: string;
    companyName: string;
    url?: string;
    location?: string;
    stage: TrackerStage;
  }) => void;
  onSave: (
    id: string,
    input: {
      title: string;
      companyName: string;
      url?: string;
      location?: string;
      minSalary?: number;
      maxSalary?: number;
      notes?: string;
    },
  ) => void;
  onMoveStage: (id: string, stage: TrackerStage) => void;
}

/**
 * Add a job, or edit one.
 *
 * The stage select is here as well as on the board because HTML5 drag does not work on
 * touch — without it the board is unusable on a phone.
 */
export function TrackerCardModal({
  open,
  job,
  error,
  onClose,
  onAdd,
  onSave,
  onMoveStage,
}: TrackerCardModalProps) {
  const editing = job !== null;

  const [title, setTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [url, setUrl] = useState("");
  const [location, setLocation] = useState("");
  const [minSalary, setMinSalary] = useState("");
  const [maxSalary, setMaxSalary] = useState("");
  const [notes, setNotes] = useState("");
  const [stage, setStage] = useState<TrackerStage>("SAVED");

  // Refill whenever the dialog opens on a different card, so a previous card's values
  // never leak into the next one.
  useEffect(() => {
    if (!open) return;
    setTitle(job?.title ?? "");
    setCompanyName(job?.companyName ?? "");
    setUrl(job?.url ?? "");
    setLocation(job?.location ?? "");
    setMinSalary(job?.minSalary != null ? String(job.minSalary) : "");
    setMaxSalary(job?.maxSalary != null ? String(job.maxSalary) : "");
    setNotes(job?.notes ?? "");
    setStage(job?.stage ?? "SAVED");
  }, [open, job]);

  const canSubmit = title.trim().length > 0 && companyName.trim().length > 0;
  const num = (v: string): number | undefined => {
    const n = Number.parseInt(v, 10);
    return Number.isFinite(n) && n >= 0 ? n : undefined;
  };

  const submit = () => {
    if (!canSubmit) return;
    if (editing && job) {
      onSave(job.id, {
        title: title.trim(),
        companyName: companyName.trim(),
        url: url.trim() || undefined,
        location: location.trim() || undefined,
        minSalary: num(minSalary),
        maxSalary: num(maxSalary),
        notes: notes.trim() || undefined,
      });
      if (stage !== job.stage) onMoveStage(job.id, stage);
    } else {
      onAdd({
        title: title.trim(),
        companyName: companyName.trim(),
        url: url.trim() || undefined,
        location: location.trim() || undefined,
        stage,
      });
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? "Edit this job" : "Add a job to track"}
      subtitle={
        editing
          ? undefined
          : "For a job you found somewhere else — paste what you know, fill the rest in later."
      }
      footer={
        <>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md text-xs font-bold border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={!canSubmit}
            className="px-4 py-2 rounded-md text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {editing ? "Save changes" : "Add to tracker"}
          </button>
        </>
      }
    >
      <div className="space-y-3">
        {error && <Alert variant="error">{error}</Alert>}

        <Field label="Job title" required>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Khmer Interpreter"
            className={INPUT}
            style={{ borderColor: "var(--color-border)", background: "var(--color-bg)" }}
          />
        </Field>

        <Field label="Company" required>
          <input
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="e.g. White Mist"
            className={INPUT}
            style={{ borderColor: "var(--color-border)", background: "var(--color-bg)" }}
          />
        </Field>

        <Field label="Link to the posting">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://…"
            className={INPUT}
            style={{ borderColor: "var(--color-border)", background: "var(--color-bg)" }}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Location">
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Phnom Penh"
              className={INPUT}
              style={{ borderColor: "var(--color-border)", background: "var(--color-bg)" }}
            />
          </Field>
          <Field label="Stage">
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value as TrackerStage)}
              className={INPUT}
              style={{ borderColor: "var(--color-border)", background: "var(--color-bg)" }}
            >
              {TRACKER_STAGES.map((s) => (
                <option key={s} value={s}>
                  {STAGE_META[s].title}
                </option>
              ))}
            </select>
          </Field>
        </div>

        {/* Salary and notes only make sense once the card exists — on the add form they
            would be four more fields between the user and the thing they came to do. */}
        {editing && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Salary from (yearly)">
                <input
                  value={minSalary}
                  onChange={(e) => setMinSalary(e.target.value)}
                  type="number"
                  min={0}
                  placeholder="40000"
                  className={INPUT}
                  style={{ borderColor: "var(--color-border)", background: "var(--color-bg)" }}
                />
              </Field>
              <Field label="Salary to (yearly)">
                <input
                  value={maxSalary}
                  onChange={(e) => setMaxSalary(e.target.value)}
                  type="number"
                  min={0}
                  placeholder="65000"
                  className={INPUT}
                  style={{ borderColor: "var(--color-border)", background: "var(--color-bg)" }}
                />
              </Field>
            </div>

            <Field label="Notes">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Recruiter's name, what you sent, what to follow up on…"
                className={`${INPUT} resize-y`}
                style={{ borderColor: "var(--color-border)", background: "var(--color-bg)" }}
              />
            </Field>
          </>
        )}
      </div>
    </Modal>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span
        className="block text-[11px] font-bold uppercase tracking-wider mb-1.5"
        style={{ color: "var(--color-text-tertiary)" }}
      >
        {label}
        {required && <span style={{ color: "var(--color-error-500)" }}> *</span>}
      </span>
      {children}
    </label>
  );
}
