"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Alert } from "@/shared/components/feedback/alert";
import { ApiError } from "@/lib/api/client";
import { useSubmitApplication } from "../hooks/use-applications";

interface ApplyButtonProps {
  jobId: string;
  fullWidth?: boolean;
  className?: string;
}

/**
 * Submits an application for a job (POST /applications). Resume is optional, so
 * this one-click apply sends just the jobId; cover letter / resume selection can
 * be layered on later. Shows a success state that links to the tracker.
 */
export function ApplyButton({ jobId, fullWidth = true, className }: ApplyButtonProps) {
  const submit = useSubmitApplication();
  const [applied, setApplied] = useState(false);

  if (applied || submit.isSuccess) {
    return (
      <div className={className}>
        <div
          className="flex items-center justify-center gap-2 py-2.5 px-5 rounded-md text-sm font-semibold"
          style={{ background: "var(--color-success-50)", color: "var(--color-success-600)" }}
        >
          <Check size={16} /> Application submitted
        </div>
        <Link
          href="/applications"
          className="block text-center text-xs font-semibold mt-2 hover:underline"
          style={{ color: "var(--color-primary-600)" }}
        >
          Track it in your applications →
        </Link>
      </div>
    );
  }

  const errorMessage =
    submit.error instanceof ApiError ? submit.error.message : submit.error ? "Something went wrong." : null;

  return (
    <div className={className}>
      <Button
        variant="primary"
        fullWidth={fullWidth}
        loading={submit.isPending}
        loadingText="Applying…"
        onClick={() => submit.mutate({ jobId }, { onSuccess: () => setApplied(true) })}
      >
        Apply Now
      </Button>
      {errorMessage && (
        <Alert variant="error" className="mt-2">
          {errorMessage}
        </Alert>
      )}
    </div>
  );
}
