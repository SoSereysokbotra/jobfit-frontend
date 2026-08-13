"use client";

import React from "react";
import { FolderGit2 } from "lucide-react";
import { TextField } from "@/shared/components/ui/text-field";
import { Textarea } from "@/shared/components/ui/form-controls";
import {
  resumeBuilderApi,
  type BuilderProjectDto,
  type ProjectItemInput,
} from "../api/resume-builder.api";
import { useDebouncedSectionSave, useSectionDraft } from "../hooks/use-resume-builder";
import { RepeatableList } from "./repeatable-list";
import { SectionShell } from "./section-shell";

interface ProjectsEditorProps {
  documentId: string;
  projects: BuilderProjectDto[];
  resetToken: number;
}

function toDraft(items: BuilderProjectDto[]): ProjectItemInput[] {
  return items.map((item) => ({
    name: item.name,
    description: item.description ?? "",
    technologies: item.technologies ?? [],
    url: item.url ?? "",
  }));
}

function isComplete(item: ProjectItemInput): boolean {
  return item.name.trim().length > 0;
}

/**
 * Projects is the one section with no import: there is no `Project` model to
 * import from, and naming it in an import request is a deliberate 400 rather
 * than a silent no-op. So this editor takes no `action` slot.
 */
export function ProjectsEditor({ documentId, projects, resetToken }: ProjectsEditorProps) {
  const [draft, setDraft] = useSectionDraft(toDraft(projects), resetToken);

  const { status, schedule, saveNow } = useDebouncedSectionSave<ProjectItemInput[]>((items) =>
    resumeBuilderApi.putProjects(
      documentId,
      items.filter(isComplete).map((item) => ({
        ...item,
        description: item.description?.trim() || undefined,
        url: item.url?.trim() || undefined,
      })),
    ),
  );

  const change = (items: ProjectItemInput[]) => {
    setDraft(items);
    schedule(items);
  };

  const incomplete = draft.filter((item) => !isComplete(item)).length;

  return (
    <SectionShell title="Projects" icon={FolderGit2} status={status}>
      <RepeatableList<ProjectItemInput>
        items={draft}
        onChange={change}
        makeEmpty={() => ({ name: "", description: "", technologies: [], url: "" })}
        addLabel="Add project"
        empty={{
          icon: <FolderGit2 className="w-6 h-6" />,
          title: "No projects yet",
          description: "Personal or academic work. This section is manual entry only.",
        }}
        rowLabel={(item, index) => item.name?.trim() || `Project ${index + 1}`}
        renderRow={(item, index, update) => (
          <>
            <TextField
              id={`project-name-${index}`}
              label="Project"
              value={item.name}
              onChange={(e) => update({ name: e.target.value })}
              onBlur={() => void saveNow(draft)}
              placeholder="Portfolio"
            />

            <Textarea
              id={`project-desc-${index}`}
              label="Description"
              rows={2}
              value={item.description ?? ""}
              onChange={(e) => update({ description: e.target.value })}
              onBlur={() => void saveNow(draft)}
              placeholder="Static site generator."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <TextField
                id={`project-tech-${index}`}
                label="Technologies"
                value={(item.technologies ?? []).join(", ")}
                onChange={(e) =>
                  update({
                    technologies: e.target.value
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean),
                  })
                }
                onBlur={() => void saveNow(draft)}
                placeholder="Astro"
                hint="Comma separated."
              />
              <TextField
                id={`project-url-${index}`}
                label="URL"
                type="url"
                value={item.url ?? ""}
                onChange={(e) => update({ url: e.target.value })}
                onBlur={() => void saveNow(draft)}
                placeholder="https://ada.dev"
              />
            </div>
          </>
        )}
      />

      {incomplete > 0 && (
        <p className="mt-3 text-xs" style={{ color: "var(--color-text-tertiary)" }}>
          {incomplete === 1 ? "One project needs" : `${incomplete} projects need`} a name before{" "}
          {incomplete === 1 ? "it is" : "they are"} saved.
        </p>
      )}
    </SectionShell>
  );
}
