"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { TextField } from "@/shared/components/ui/text-field";
import { Alert } from "@/shared/components/feedback/alert";
import { TemplatePicker } from "@/features/resume-builder/components/template-picker";
import {
  useCreateResumeDocument,
  useResumeTemplates,
} from "@/features/resume-builder/hooks/use-resume-builder";

export default function NewResumeDocumentPage() {
  const router = useRouter();
  const { data: templates = [], isLoading, error } = useResumeTemplates();
  const create = useCreateResumeDocument();

  const [title, setTitle] = useState("");
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [createError, setCreateError] = useState("");

  // Preselect the first template so the primary action is reachable in one
  // click for a user who is happy with the default.
  useEffect(() => {
    if (!templateId && templates.length > 0) setTemplateId(templates[0].id);
  }, [templates, templateId]);

  const titleError = submitted && !title.trim() ? "Give this résumé a name." : undefined;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    setCreateError("");

    if (!title.trim() || !templateId) return;

    try {
      const created = await create.mutateAsync({ title: title.trim(), templateId });
      router.push(`/resume-builder/${created.id}/edit`);
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : "Could not create that résumé.");
    }
  };

  return (
    <div
      className="p-4 sm:p-6 lg:p-8 space-y-6 min-h-full"
      style={{ background: "var(--color-bg-secondary)" }}
    >
      <div>
        <Link
          href="/resume-builder"
          className="inline-flex items-center gap-1.5 text-xs font-semibold mb-3"
          style={{ color: "var(--color-text-tertiary)" }}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Resume Builder
        </Link>
        <h1 className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>
          New résumé
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>
          Pick a template and name it — you can change both later
        </p>
      </div>

      {createError && <Alert variant="error">{createError}</Alert>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div
          className="rounded-xl border p-5"
          style={{
            background: "var(--color-card)",
            borderColor: "var(--color-border)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <TextField
            id="resume-title"
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={titleError}
            placeholder="Frontend Engineer — Google"
            hint="Only you see this. Name it after the role you're targeting."
          />
        </div>

        <div>
          <h2 className="text-sm font-bold mb-3" style={{ color: "var(--color-text-primary)" }}>
            Template
          </h2>
          <TemplatePicker
            templates={templates}
            selectedId={templateId}
            onSelect={setTemplateId}
            isLoading={isLoading}
            error={error}
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="submit"
            loading={create.isPending}
            loadingText="Creating…"
            disabled={!templateId}
          >
            Create résumé
          </Button>
          <Link href="/resume-builder">
            <Button variant="ghost" type="button">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
