"use client";

import React from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { useApplicationForJob } from "../hooks/use-applications";

interface AppliedPillProps {
  jobId: string;
  /** Rendered when the user has NOT applied — usually the Apply button. */
  children: React.ReactNode;
}

/**
 * Shows "Applied · <status>" in place of an Apply button once an application exists.
 *
 * The job DETAIL page has done this since it shipped (`ApplyButton`), but every list — search
 * results, saved jobs, recommendations, the dashboard — still offered "Apply" on a job the
 * user had already applied to. Clicking it produced a red error from the unique constraint,
 * which reads as a bug rather than as "you already did this", and the same job looked
 * different depending on which page you met it on.
 *
 * Costs nothing per card: useApplicationForJob reads the one cached applications list, so a
 * page of twenty cards still makes a single request.
 */
export function AppliedPill({ jobId, children }: AppliedPillProps) {
  const { application } = useApplicationForJob(jobId);

  if (!application) return <>{children}</>;

  return (
    <Link
      href={`/applications/${application.id}`}
      title="View your application"
      className="px-3 py-1.5 rounded-md text-xs font-bold inline-flex items-center gap-1.5 transition-colors hover:opacity-80 whitespace-nowrap"
      style={{
        background: "var(--color-neutral-100)",
        color: "var(--color-text-secondary)",
      }}
    >
      <Check size={13} /> Applied · {application.statusMeta.label}
    </Link>
  );
}
