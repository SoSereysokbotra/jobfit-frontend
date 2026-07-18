"use client";

import React, { useState, useEffect } from "react";
import {
  X, MapPin, Clock, Mail, CheckCircle2, AlertTriangle,
  FileText, MessageSquare, ArrowRight, Download, ExternalLink,
} from "lucide-react";
import { cn } from "@/shared/utils/cn";
import MatchScoreBadge from "@/shared/components/data-display/match-score-badge";
import { Badge } from "@/shared/components/data-display/badge";
import { StageMovePicker } from "./StageMovePicker";
import { type Applicant, type ApplicationStage, EMPLOYER_JOBS } from "@/features/employer/api/employer.api";

interface ApplicationDetailPanelProps {
  applicant: Applicant | null;
  onClose: () => void;
  onStageMove: (id: string, stage: ApplicationStage) => void;
  onReject: (id: string) => void;
}

/* Mock match breakdown — in production this comes from GET /api/employer/applications/:id */
const MOCK_SKILLS = [
  { skill: "Python", years: 5, matched: true },
  { skill: "SQL", years: 4, matched: true },
  { skill: "AWS", years: 3, matched: true },
  { skill: "Kubernetes", matched: false },
];

const STAGE_TONE: Record<ApplicationStage, "info" | "primary" | "warning" | "success" | "error"> = {
  Applied:   "info",
  Interview: "primary",
  Offer:     "warning",
  Hired:     "success",
  Rejected:  "error",
};

/**
 * Right-side slide-in detail panel — per Flow 3: Application Detail spec.
 * Shows candidate info, match analysis, submitted materials, stage control, and notes.
 */
export function ApplicationDetailPanel({
  applicant,
  onClose,
  onStageMove,
  onReject,
}: ApplicationDetailPanelProps) {
  const [notes, setNotes] = useState("");
  const [notesSaved, setNotesSaved] = useState(false);
  const [confirmReject, setConfirmReject] = useState(false);

  /* Reset state when applicant changes */
  useEffect(() => {
    setNotes("");
    setNotesSaved(false);
    setConfirmReject(false);
  }, [applicant?.id]);

  /* Close on Escape key */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const jobTitle = EMPLOYER_JOBS.find((j) => j.id === applicant?.jobId)?.title ?? "";

  const handleSaveNotes = () => {
    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 2500);
  };

  const handleReject = () => {
    if (!confirmReject) { setConfirmReject(true); return; }
    if (applicant) { onReject(applicant.id); onClose(); }
  };

  return (
    <>
      {/* Scrim */}
      <div
        role="button"
        tabIndex={-1}
        aria-label="Close detail panel"
        className={cn(
          "fixed inset-0 z-40 transition-opacity duration-300",
          applicant ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        )}
        style={{ background: "var(--color-scrim)" }}
        onClick={onClose}
      />

      {/* Panel */}
      <aside
        aria-label="Application detail"
        className={cn(
          "fixed right-0 top-0 bottom-0 z-50 w-full max-w-lg flex flex-col transition-transform duration-300 ease-in-out overflow-hidden",
          applicant ? "translate-x-0" : "translate-x-full",
        )}
        style={{
          background: "var(--color-bg)",
          borderLeft: "1px solid var(--color-border)",
          boxShadow: "var(--shadow-xl)",
        }}
      >
        {!applicant ? null : (
          <>
            {/* ── Header ─────────────────────────────── */}
            <div
              className="flex items-start justify-between px-6 py-5 border-b shrink-0"
              style={{ borderColor: "var(--color-border)" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-base font-bold shrink-0"
                  style={{ background: "var(--color-primary-100)", color: "var(--color-primary-700)" }}
                >
                  {applicant.initials}
                </div>
                <div>
                  <h2 className="text-base font-bold text-content">{applicant.name}</h2>
                  <p className="text-xs text-content-tertiary">{jobTitle}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close panel"
                className="p-1.5 rounded-md transition-colors hover:bg-neutral-100 text-content-tertiary"
              >
                <X size={18} />
              </button>
            </div>

            {/* ── Scrollable body ─────────────────────── */}
            <div className="flex-1 overflow-y-auto">

              {/* Stage + quick meta */}
              <div className="px-6 py-5 space-y-4 border-b" style={{ borderColor: "var(--color-border)" }}>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-content-tertiary uppercase tracking-wider">Stage</span>
                    <Badge tone={STAGE_TONE[applicant.stage]} dot>{applicant.stage}</Badge>
                  </div>
                  <StageMovePicker
                    current={applicant.stage}
                    onMove={(stage) => onStageMove(applicant.id, stage)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-xs text-content-secondary">
                    <Mail size={14} style={{ color: "var(--color-text-tertiary)" }} />
                    <span className="truncate">{applicant.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-content-secondary">
                    <MapPin size={14} style={{ color: "var(--color-text-tertiary)" }} />
                    {applicant.location}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-content-secondary">
                    <Clock size={14} style={{ color: "var(--color-text-tertiary)" }} />
                    Applied {applicant.appliedAt}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-content-secondary">
                    <ArrowRight size={14} style={{ color: "var(--color-text-tertiary)" }} />
                    Immediately available
                  </div>
                </div>
              </div>

              {/* Match Analysis */}
              <div className="px-6 py-5 border-b" style={{ borderColor: "var(--color-border)" }}>
                <h3 className="text-xs font-bold uppercase tracking-wider text-content-tertiary mb-4">Match Analysis</h3>
                <div className="flex items-center gap-5 mb-4">
                  <MatchScoreBadge score={applicant.match} size="lg" />
                  <div className="space-y-1.5 flex-1">
                    {[
                      { label: "Skills", value: 95 },
                      { label: "Experience", value: 88 },
                      { label: "Location", value: 95 },
                    ].map((m) => (
                      <div key={m.label} className="flex items-center gap-2">
                        <span className="text-xs text-content-tertiary w-20">{m.label}</span>
                        <div className="flex-1 h-1.5 rounded-full" style={{ background: "var(--color-neutral-100)" }}>
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${m.value}%`, background: "var(--color-primary-500)" }}
                          />
                        </div>
                        <span className="text-xs font-bold text-content w-8 text-right">{m.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Skills detail */}
                <div className="space-y-1.5">
                  {MOCK_SKILLS.map((s) => (
                    <div key={s.skill} className="flex items-center gap-2 text-xs">
                      {s.matched
                        ? <CheckCircle2 size={14} style={{ color: "var(--color-success-500)" }} />
                        : <AlertTriangle size={14} style={{ color: "var(--color-warning-500)" }} />
                      }
                      <span className="font-semibold text-content">{s.skill}</span>
                      {s.years && <span className="text-content-tertiary">· {s.years} yrs</span>}
                      {!s.matched && <span className="text-content-tertiary italic">not listed</span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Submitted Materials */}
              <div className="px-6 py-5 border-b" style={{ borderColor: "var(--color-border)" }}>
                <h3 className="text-xs font-bold uppercase tracking-wider text-content-tertiary mb-3">Submitted Materials</h3>
                <div className="space-y-2">
                  <div
                    className="flex items-center justify-between px-3 py-2.5 rounded-md border"
                    style={{ borderColor: "var(--color-border)", background: "var(--color-neutral-50)" }}
                  >
                    <div className="flex items-center gap-2.5">
                      <FileText size={16} style={{ color: "var(--color-primary-500)" }} />
                      <div>
                        <p className="text-xs font-semibold text-content">Resume_v2.pdf</p>
                        <p className="text-xs text-content-tertiary">Current · Jan 15, 2026</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        aria-label="Download resume"
                        className="p-1.5 rounded transition-colors hover:bg-neutral-200 text-content-tertiary"
                      >
                        <Download size={14} />
                      </button>
                      <button
                        aria-label="View resume"
                        className="p-1.5 rounded transition-colors hover:bg-neutral-200 text-content-tertiary"
                      >
                        <ExternalLink size={14} />
                      </button>
                    </div>
                  </div>

                  <div
                    className="px-3 py-2.5 rounded-md border"
                    style={{ borderColor: "var(--color-border)", background: "var(--color-neutral-50)" }}
                  >
                    <div className="flex items-center gap-2.5 mb-2">
                      <MessageSquare size={16} style={{ color: "var(--color-primary-500)" }} />
                      <p className="text-xs font-semibold text-content">Cover Letter</p>
                    </div>
                    <p className="text-xs text-content-secondary italic line-clamp-3">
                      "I'm very interested in this position and believe my background in Python and cloud infrastructure makes me an excellent fit for the team..."
                    </p>
                  </div>
                </div>
              </div>

              {/* Employer Notes */}
              <div className="px-6 py-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-content-tertiary mb-3">Notes</h3>
                <textarea
                  id={`notes-${applicant.id}`}
                  rows={3}
                  placeholder="Add notes about this application..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-md border text-sm outline-none resize-none transition-all duration-200 focus:ring-2 focus:ring-primary-500 focus:ring-offset-1"
                  style={{
                    borderColor: "var(--color-border)",
                    background: "var(--color-bg)",
                    color: "var(--color-text-primary)",
                  }}
                />
                <button
                  onClick={handleSaveNotes}
                  className="mt-2 text-xs font-semibold px-3 py-1.5 rounded-md transition-all duration-200 active:scale-[0.97]"
                  style={{
                    background: notesSaved ? "var(--color-success-100)" : "var(--color-primary-100)",
                    color: notesSaved ? "var(--color-success-600)" : "var(--color-primary-700)",
                  }}
                >
                  {notesSaved ? "✓ Saved" : "Save Notes"}
                </button>
              </div>
            </div>

            {/* ── Footer actions ──────────────────────── */}
            <div
              className="px-6 py-4 border-t shrink-0 flex items-center gap-3"
              style={{ borderColor: "var(--color-border)", background: "var(--color-neutral-50)" }}
            >
              <button
                onClick={() => onStageMove(applicant.id, "Interview")}
                className="flex-1 py-2.5 px-4 rounded-md text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.97]"
                style={{ background: "var(--color-primary-600)" }}
              >
                Move to Interview
              </button>
              <button
                onClick={handleReject}
                className={cn(
                  "py-2.5 px-4 rounded-md text-sm font-semibold transition-all duration-200 active:scale-[0.97]",
                  confirmReject
                    ? "text-white"
                    : "border",
                )}
                style={
                  confirmReject
                    ? { background: "var(--color-error-500)", color: "white" }
                    : { borderColor: "var(--color-border)", color: "var(--color-error-600)", background: "transparent" }
                }
              >
                {confirmReject ? "Confirm Reject?" : "Reject"}
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
