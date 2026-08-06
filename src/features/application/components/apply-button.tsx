"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, ExternalLink } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Alert } from "@/shared/components/feedback/alert";
import { ApiError } from "@/lib/api/client";
import { useSubmitApplication } from "../hooks/use-applications";

interface ApplyButtonProps {
  jobId: string;
  /** EXTERNAL jobs cannot be applied to in-app. Defaults to INTERNAL when unknown. */
  sourceType?: "INTERNAL" | "EXTERNAL";
  /** The original posting, for EXTERNAL jobs. */
  externalUrl?: string;
  fullWidth?: boolean;
  className?: string;
}

/**
 * The single place that decides how a job is applied to.
 *
 * INTERNAL — POST /applications, tracked in JobFits.
 * EXTERNAL — ingested from another site. No employer here receives the application and the
 * real posting lives elsewhere, so the server REJECTS the submission. Sending the user to
 * the original posting is the only honest action; showing "Apply Now" would produce an
 * error, or worse, imply they had applied when they had not.
 */
export function ApplyButton({
  jobId,
  sourceType = "INTERNAL",
  externalUrl,
  fullWidth = true,
  className,
}: ApplyButtonProps) {
  const submit = useSubmitApplication();
  const [applied, setApplied] = useState(false);

  if (sourceType === "EXTERNAL") {
    return (
      <ExternalApply externalUrl={externalUrl} fullWidth={fullWidth} className={className} />
    );
  }

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

/**
 * Sends the user to the original posting. Deliberately NOT styled as the primary apply
 * action: leaving JobFits is a different thing from applying here, and the application
 * cannot be tracked once they go.
 */
function ExternalApply({
  externalUrl,
  fullWidth,
  className,
}: {
  externalUrl?: string;
  fullWidth: boolean;
  className?: string;
}) {
  // A missing URL is a data gap in ingestion. Say so plainly rather than rendering a
  // dead button or, worse, falling back to an in-app apply that the server will reject.
  if (!externalUrl) {
    return (
      <div className={className}>
        <Alert variant="warning">
          This job is posted on another site, but we don&apos;t have the link to it.
        </Alert>
      </div>
    );
  }

  const site = hostnameOf(externalUrl);

  return (
    <div className={className}>
      <a
        href={externalUrl}
        target="_blank"
        // noopener/noreferrer: the target is a third-party site we do not control.
        rel="noopener noreferrer"
        className={`inline-flex items-center justify-center gap-2 py-2.5 px-5 rounded-md text-sm font-semibold border transition-colors ${
          fullWidth ? "w-full" : ""
        }`}
        style={{
          borderColor: "var(--color-primary-600)",
          color: "var(--color-primary-600)",
        }}
      >
        Apply Externally
        <ExternalLink size={15} />
      </a>
      <p className="text-center text-xs mt-2" style={{ color: "var(--color-neutral-500)" }}>
        {site ? `Posted on ${site}.` : "Posted on another site."} You&apos;ll finish your
        application there, so we can&apos;t track it here.
      </p>
    </div>
  );
}

/** "https://www.themuse.com/jobs/1" -> "themuse.com". Empty if the URL is unparseable. */
function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}
