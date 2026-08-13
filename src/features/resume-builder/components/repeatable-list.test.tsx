import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RepeatableList } from "./repeatable-list";

/**
 * Add / remove / reorder is the mechanism every section editor shares, so it is
 * tested once here against the generic rather than six times through the
 * editors. What matters is that the ARRAY comes back in the right order —
 * the backend derives `order` from the array index, so a wrong order here is a
 * wrong résumé.
 */

interface Row {
  name: string;
}

function renderList(initial: Row[]) {
  const onChange = vi.fn();
  render(
    <RepeatableList<Row>
      items={initial}
      onChange={onChange}
      makeEmpty={() => ({ name: "" })}
      addLabel="Add row"
      empty={{ icon: null, title: "Nothing yet", description: "Add one." }}
      rowLabel={(item, index) => item.name || `Row ${index + 1}`}
      renderRow={(item, index, update) => (
        <input
          aria-label={`name-${index}`}
          value={item.name}
          onChange={(e) => update({ name: e.target.value })}
        />
      )}
    />,
  );
  return { onChange };
}

describe("RepeatableList", () => {
  it("shows the empty state and adds the first row from it", async () => {
    const user = userEvent.setup();
    const { onChange } = renderList([]);

    expect(screen.getByText("Nothing yet")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /add row/i }));

    expect(onChange).toHaveBeenCalledWith([{ name: "" }]);
  });

  it("appends a new row at the end", async () => {
    const user = userEvent.setup();
    const { onChange } = renderList([{ name: "A" }, { name: "B" }]);

    await user.click(screen.getByRole("button", { name: /add row/i }));

    expect(onChange).toHaveBeenCalledWith([{ name: "A" }, { name: "B" }, { name: "" }]);
  });

  it("removes the row that was clicked, not the last one", async () => {
    const user = userEvent.setup();
    const { onChange } = renderList([{ name: "A" }, { name: "B" }, { name: "C" }]);

    await user.click(screen.getByRole("button", { name: "Remove B" }));

    expect(onChange).toHaveBeenCalledWith([{ name: "A" }, { name: "C" }]);
  });

  it("moves a row up by swapping it with its predecessor", async () => {
    const user = userEvent.setup();
    const { onChange } = renderList([{ name: "A" }, { name: "B" }, { name: "C" }]);

    await user.click(screen.getByRole("button", { name: "Move B up" }));

    expect(onChange).toHaveBeenCalledWith([{ name: "B" }, { name: "A" }, { name: "C" }]);
  });

  it("moves a row down by swapping it with its successor", async () => {
    const user = userEvent.setup();
    const { onChange } = renderList([{ name: "A" }, { name: "B" }, { name: "C" }]);

    await user.click(screen.getByRole("button", { name: "Move B down" }));

    expect(onChange).toHaveBeenCalledWith([{ name: "A" }, { name: "C" }, { name: "B" }]);
  });

  it("disables the moves that would fall off either end", () => {
    renderList([{ name: "A" }, { name: "B" }]);

    expect(screen.getByRole("button", { name: "Move A up" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Move B down" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Move A down" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Move B up" })).toBeEnabled();
  });

  it("edits only the row that changed", async () => {
    const user = userEvent.setup();
    const { onChange } = renderList([{ name: "A" }, { name: "B" }]);

    await user.type(screen.getByLabelText("name-1"), "!");

    expect(onChange).toHaveBeenCalledWith([{ name: "A" }, { name: "B!" }]);
  });
});
