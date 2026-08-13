import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace: vi.fn(), back: vi.fn() }),
  useParams: () => ({ id: "doc-1" }),
  usePathname: () => "/resume-builder/new",
}));

const templates = vi.fn();
const create = vi.fn();
vi.mock("../api/resume-builder.api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../api/resume-builder.api")>();
  return {
    ...actual,
    resumeBuilderApi: {
      ...actual.resumeBuilderApi,
      templates: (...args: unknown[]) => templates(...args),
      create: (...args: unknown[]) => create(...args),
    },
  };
});

import NewResumeDocumentPage from "@/app/(seeker)/resume-builder/new/page";

const TEMPLATES = [
  {
    id: "tpl-classic",
    name: "Classic ATS",
    category: "ats-friendly",
    thumbnailUrl: "/templates/classic-ats.svg",
    isAtsFriendly: true,
  },
];

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <NewResumeDocumentPage />
    </QueryClientProvider>,
  );
}

describe("create résumé flow", () => {
  beforeEach(() => {
    push.mockReset();
    templates.mockReset().mockResolvedValue(TEMPLATES);
    create.mockReset().mockResolvedValue({ id: "doc-99", title: "Frontend Engineer" });
  });

  it("creates the document and redirects to its editor", async () => {
    const user = userEvent.setup();
    renderPage();

    // The first template is preselected, so only a title is required.
    await screen.findByText("Classic ATS");
    await user.type(screen.getByLabelText(/title/i), "Frontend Engineer");
    await user.click(screen.getByRole("button", { name: /create résumé/i }));

    await waitFor(() =>
      expect(create).toHaveBeenCalledWith({
        title: "Frontend Engineer",
        templateId: "tpl-classic",
      }),
    );
    await waitFor(() => expect(push).toHaveBeenCalledWith("/resume-builder/doc-99/edit"));
  });

  it("refuses to submit without a title and does not redirect", async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByText("Classic ATS");
    await user.click(screen.getByRole("button", { name: /create résumé/i }));

    expect(await screen.findByText("Give this résumé a name.")).toBeInTheDocument();
    expect(create).not.toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
  });

  it("trims the title before sending it", async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByText("Classic ATS");
    await user.type(screen.getByLabelText(/title/i), "   Padded   ");
    await user.click(screen.getByRole("button", { name: /create résumé/i }));

    await waitFor(() =>
      expect(create).toHaveBeenCalledWith({ title: "Padded", templateId: "tpl-classic" }),
    );
  });

  it("surfaces a failure and stays on the page", async () => {
    const user = userEvent.setup();
    create.mockRejectedValue(new Error("Template is not active"));
    renderPage();

    await screen.findByText("Classic ATS");
    await user.type(screen.getByLabelText(/title/i), "Frontend Engineer");
    await user.click(screen.getByRole("button", { name: /create résumé/i }));

    expect(await screen.findByText("Template is not active")).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });
});
