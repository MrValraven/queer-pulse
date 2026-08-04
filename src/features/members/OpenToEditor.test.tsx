import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nProvider } from "../../app/providers/I18nProvider";
import { OpenToEditor } from "./OpenToEditor";
import type { OpenToEntry } from "./openTo.data";

function renderEditor(entries: OpenToEntry[] = []) {
  const onChange = vi.fn();
  render(
    <I18nProvider>
      <OpenToEditor entries={entries} onChange={onChange} />
    </I18nProvider>,
  );
  return onChange;
}

const addField = () => screen.getByRole("textbox");

describe("OpenToEditor", () => {
  it("adds a preset when its chip is tapped", async () => {
    const onChange = renderEditor();
    // The `members` namespace loads lazily (catalogs/index.ts), so the chip's
    // label resolves after the post-commit effect fetches it — await it rather
    // than reading the raw key. Mirrors MemberFilterCards.staffBadge.test.tsx.
    await userEvent.click(
      await screen.findByRole("button", { name: "Collaborating" }),
    );
    expect(onChange).toHaveBeenCalledWith([
      { kind: "preset", id: "collaborating" },
    ]);
  });

  it("removes a preset when its selected chip is tapped again", async () => {
    const onChange = renderEditor([{ kind: "preset", id: "collaborating" }]);
    const chip = await screen.findByRole("button", { name: "Collaborating" });
    expect(chip).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(chip);
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it("adds anything else as a custom entry, in the member's words", async () => {
    const onChange = renderEditor();
    await userEvent.type(
      addField(),
      "A nurse or two for testing nights{enter}",
    );
    expect(onChange).toHaveBeenCalledWith([
      { kind: "custom", label: "A nurse or two for testing nights" },
    ]);
  });

  it("folds a typed preset label into the preset, not a duplicate custom", async () => {
    const onChange = renderEditor();
    await userEvent.type(addField(), "collaborating{enter}");
    expect(onChange).toHaveBeenCalledWith([
      { kind: "preset", id: "collaborating" },
    ]);
  });

  it("ignores a repeated custom entry", async () => {
    const onChange = renderEditor([{ kind: "custom", label: "Archive tips" }]);
    await userEvent.type(addField(), "archive tips{enter}");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("removes a custom entry with its × button", async () => {
    const onChange = renderEditor([{ kind: "custom", label: "Archive tips" }]);
    await userEvent.click(
      await screen.findByRole("button", { name: "Remove Archive tips" }),
    );
    expect(onChange).toHaveBeenCalledWith([]);
  });
});
