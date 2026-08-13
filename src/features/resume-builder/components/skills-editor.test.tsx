import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

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
import type { BuilderSkillDto } from "../api/resume-builder.api";

const SKILLS: BuilderSkillDto[] = [
  { id: "s1", order: 0, name: "TypeScript", proficiencyLevel: "EXPERT" },
  { id: "s2", order: 1, name: "Postgres", proficiencyLevel: "ADVANCED" },
];

function renderEditor(skills = SKILLS, resetToken = 0) {
  return render(
    <SkillsEditor documentId="doc-1" skills={skills} resetToken={resetToken} />,
  );
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

  it("re-seeds from props when the document is replaced by an import", () => {
    const { rerender } = renderEditor();
    expect(rowOrder()).toEqual(["TypeScript", "Postgres"]);

    const imported: BuilderSkillDto[] = [
      { id: "s9", order: 0, name: "Kubernetes", proficiencyLevel: "BEGINNER" },
    ];
    rerender(<SkillsEditor documentId="doc-1" skills={imported} resetToken={1} />);

    expect(rowOrder()).toEqual(["Kubernetes"]);
  });
});
