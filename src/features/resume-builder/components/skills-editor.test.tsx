import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const putSkills = vi.fn();
vi.mock("../api/resume-builder.api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../api/resume-builder.api")>();
  return {
    ...actual,
    resumeBuilderApi: {
      ...actual.resumeBuilderApi,
      putSkills: (...args: unknown[]) => putSkills(...args),
    },
  };
});

import { SkillsEditor } from "./skills-editor";
import { qk } from "@/lib/api/query-keys";
import type {
  BuilderSkillDto,
  ResumeDocumentDetailDto,
} from "../api/resume-builder.api";

const SKILLS: BuilderSkillDto[] = [
  { id: "s1", order: 0, name: "TypeScript", proficiencyLevel: "EXPERT" },
  { id: "s2", order: 1, name: "Postgres", proficiencyLevel: "ADVANCED" },
];

/**
 * The editor writes its edits into the document detail cache — that entry is what
 * the preview renders off — so it needs a real client, not just a provider.
 */
function renderEditor(skills = SKILLS, resetToken = 0) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  client.setQueryData(qk.resumeBuilder.document("doc-1"), {
    id: "doc-1",
    skills,
  } as unknown as ResumeDocumentDetailDto);

  const result = render(
    <QueryClientProvider client={client}>
      <SkillsEditor documentId="doc-1" skills={skills} resetToken={resetToken} />
    </QueryClientProvider>,
  );

  /** The skills the preview would render right now. */
  const previewSkills = () =>
    client.getQueryData<ResumeDocumentDetailDto>(qk.resumeBuilder.document("doc-1"))?.skills ?? [];

  /** Keeps the provider around — a bare rerender would drop the editor's client. */
  const rerenderEditor = (next: BuilderSkillDto[], nextResetToken: number) =>
    result.rerender(
      <QueryClientProvider client={client}>
        <SkillsEditor documentId="doc-1" skills={next} resetToken={nextResetToken} />
      </QueryClientProvider>,
    );

  return { ...result, client, previewSkills, rerenderEditor };
}

/** Row labels, in DOM order — the array order the backend will receive. */
function rowOrder(): string[] {
  return screen
    .getAllByRole("listitem")
    .map((row) => row.querySelector("p")?.textContent ?? "");
}

describe("SkillsEditor", () => {
  beforeEach(() => {
    putSkills.mockReset().mockResolvedValue(undefined);
  });

  it("renders one row per skill", () => {
    renderEditor();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(rowOrder()).toEqual(["TypeScript", "Postgres"]);
  });

  it("adds a row", async () => {
    const user = userEvent.setup();
    renderEditor();

    await user.click(screen.getByRole("button", { name: /add skill/i }));

    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });

  it("removes the chosen row", async () => {
    const user = userEvent.setup();
    renderEditor();

    await user.click(screen.getByRole("button", { name: "Remove TypeScript" }));

    expect(rowOrder()).toEqual(["Postgres"]);
  });

  it("reorders rows", async () => {
    const user = userEvent.setup();
    renderEditor();

    await user.click(screen.getByRole("button", { name: "Move Postgres up" }));

    expect(rowOrder()).toEqual(["Postgres", "TypeScript"]);
  });

  it("saves on blur, sending the section in its current order", async () => {
    const user = userEvent.setup();
    renderEditor();

    await user.click(screen.getByRole("button", { name: "Move Postgres up" }));
    await user.click(screen.getAllByLabelText("Skill")[0]);
    await user.tab();

    await waitFor(() =>
      expect(putSkills).toHaveBeenCalledWith("doc-1", [
        { name: "Postgres", proficiencyLevel: "ADVANCED" },
        { name: "TypeScript", proficiencyLevel: "EXPERT" },
      ]),
    );
  });

  it("holds back a nameless row rather than sending a 400", async () => {
    const user = userEvent.setup();
    renderEditor();

    await user.click(screen.getByRole("button", { name: /add skill/i }));
    await user.click(screen.getAllByLabelText("Skill")[0]);
    await user.tab();

    await waitFor(() => expect(putSkills).toHaveBeenCalled());
    expect(putSkills.mock.calls[0][1]).toHaveLength(2);
    expect(screen.getByText(/one skill needs a name/i)).toBeInTheDocument();
  });

  /**
   * The regression this guards: the preview used to render off a separate GET
   * that only refetched on remount, so an edit was invisible until a page
   * refresh. It now reads the same cache entry the editor writes, and must see
   * the edit before the debounced PUT has fired at all.
   */
  it("updates the preview's cache entry on edit, ahead of the autosave", async () => {
    const user = userEvent.setup();
    const { previewSkills } = renderEditor();

    await user.type(screen.getAllByLabelText("Skill")[0], "!");

    expect(previewSkills().map((s) => s.name)).toEqual(["TypeScript!", "Postgres"]);
    // Still inside the debounce window — the preview did not wait on the server.
    expect(putSkills).not.toHaveBeenCalled();
  });

  it("keeps row ids stable while typing so the preview does not remount rows", async () => {
    const user = userEvent.setup();
    const { previewSkills } = renderEditor();

    await user.type(screen.getAllByLabelText("Skill")[0], "!");

    expect(previewSkills().map((s) => s.id)).toEqual(["s1", "s2"]);
  });

  it("re-seeds from props when the document is replaced by an import", () => {
    const { rerenderEditor } = renderEditor();
    expect(rowOrder()).toEqual(["TypeScript", "Postgres"]);

    const imported: BuilderSkillDto[] = [
      { id: "s9", order: 0, name: "Kubernetes", proficiencyLevel: "BEGINNER" },
    ];
    rerenderEditor(imported, 1);

    expect(rowOrder()).toEqual(["Kubernetes"]);
  });
});
