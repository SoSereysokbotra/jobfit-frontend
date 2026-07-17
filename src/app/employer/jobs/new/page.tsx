"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { Button } from "@/shared/components/ui/button";
import { Alert } from "@/shared/components/feedback/alert";
import { useCreateJob, usePublishJob } from "@/features/employer/hooks/use-employer";
import type { CreateJobInput } from "@/features/employer/api/employer.api";

const REMOTE_TYPES: { label: string; value: CreateJobInput["remoteType"] }[] = [
  { label: "On-site", value: "ON_SITE" },
  { label: "Hybrid", value: "HYBRID" },
  { label: "Remote", value: "REMOTE" },
];

const INPUT = "w-full px-3 py-2.5 rounded-md border border-border bg-background text-content text-sm outline-none transition-all focus:ring-2 focus:ring-primary-500 focus:border-transparent";

export default function CreateJobPage() {
  const router = useRouter();
  const createJob = useCreateJob();
  const publishJob = usePublishJob();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [location, setLocation] = useState("");
  const [minSalary, setMinSalary] = useState("");
  const [maxSalary, setMaxSalary] = useState("");
  const [remote, setRemote] = useState<CreateJobInput["remoteType"]>("HYBRID");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<null | "draft" | "publish">(null);

  const buildInput = (): CreateJobInput | null => {
    if (title.trim().length === 0 || description.trim().length === 0) {
      setError("Title and description are required.");
      return null;
    }
    setError(null);
    const fullDescription = requirements.trim()
      ? `${description.trim()}\n\nRequirements:\n${requirements.trim()}`
      : description.trim();
    // Form collects $K; the backend stores absolute yearly amounts.
    return {
      title: title.trim(),
      description: fullDescription,
      remoteType: remote,
      location: location.trim() || undefined,
      minSalary: minSalary ? Number(minSalary) * 1000 : undefined,
      maxSalary: maxSalary ? Number(maxSalary) * 1000 : undefined,
    };
  };

  const submit = async (mode: "draft" | "publish") => {
    const input = buildInput();
    if (!input) return;
    setBusy(mode);
    try {
      const created = await createJob.mutateAsync(input);
      if (mode === "publish") await publishJob.mutateAsync(created.id);
      router.push(`/employer/jobs/${created.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save the job.");
      setBusy(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      <Link href="/employer/jobs" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 transition-colors hover:underline">
        <ArrowLeft size={15} /> Back to Jobs
      </Link>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-content">Create New Job</h1>
        <p className="text-sm mt-1 text-content-secondary">Fill in the details. Save as draft or publish when ready.</p>
      </div>

      <div className="rounded-lg border border-border bg-card shadow-sm p-5 sm:p-6 space-y-5">
        <Field label="Job Title"><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Senior Software Engineer" className={INPUT} /></Field>
        <Field label="Job Description"><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Describe the role, team, and mission…" className={cn(INPUT, "resize-y")} /></Field>
        <Field label="Requirements"><textarea value={requirements} onChange={(e) => setRequirements(e.target.value)} rows={3} placeholder="e.g. 5+ years experience, strong Python skills…" className={cn(INPUT, "resize-y")} /></Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Salary Min ($K)"><input value={minSalary} onChange={(e) => setMinSalary(e.target.value)} type="number" placeholder="150" className={INPUT} /></Field>
          <Field label="Salary Max ($K)"><input value={maxSalary} onChange={(e) => setMaxSalary(e.target.value)} type="number" placeholder="190" className={INPUT} /></Field>
        </div>

        <Field label="Location"><input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. San Francisco, CA" className={INPUT} /></Field>

        <Field label="Remote Type">
          <div className="flex flex-wrap gap-2">
            {REMOTE_TYPES.map((o) => (
              <button key={o.value} onClick={() => setRemote(o.value)} className={cn("px-3.5 py-1.5 rounded-md text-xs font-semibold border transition-colors", remote === o.value ? "bg-primary-50 border-primary-200 text-primary-700" : "bg-background border-border text-content-secondary")}>
                {o.label}
              </button>
            ))}
          </div>
        </Field>

        {error && <Alert variant="error">{error}</Alert>}
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" loading={busy === "draft"} loadingText="Saving…" onClick={() => submit("draft")}>Save Draft</Button>
        <Button variant="primary" loading={busy === "publish"} loadingText="Publishing…" onClick={() => submit("publish")}>Publish Job</Button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-content-tertiary">{label}</label>
      {children}
    </div>
  );
}
