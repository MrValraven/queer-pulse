import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import type { Editor } from "../data/desk.data";
import { DeskActiveFilters } from "./DeskActiveFilters";

const EDITORS: Editor[] = [
  { id: "ed-1", name: "Rita Faria", initials: "RF", tint: "coral", cap: 6 },
];

function renderActiveFilters(
  overrides: Partial<Parameters<typeof DeskActiveFilters>[0]> = {},
) {
  render(
    <TestProviders>
      <DeskActiveFilters
        format="all"
        onFormat={vi.fn()}
        sectionFilter={[]}
        onSectionFilter={vi.fn()}
        stageFilter={[]}
        onStageFilter={vi.fn()}
        editors={EDITORS}
        editorFilter={null}
        onEditorFilter={vi.fn()}
        {...overrides}
      />
    </TestProviders>,
  );
}

describe("DeskActiveFilters editor token", () => {
  it("names the editor once the directory has loaded with a match", () => {
    renderActiveFilters({ editorFilter: "ed-1" });
    expect(
      screen.getByRole("button", { name: /^Editor: Rita/ }),
    ).toBeInTheDocument();
  });

  it("shows a neutral label while the directory is still loading, keeping the raw id out of view", () => {
    renderActiveFilters({
      editors: [],
      editorFilter: "ed-1",
      isEditorDirectoryLoading: true,
    });
    const token = screen.getByRole("button", { name: /^Editor\b/ });
    expect(token).not.toHaveTextContent("ed-1");
    expect(token).not.toHaveTextContent(":");
  });

  it("names a departed editor 'Former editor' once the directory has loaded with no match, keeping the raw id out of view", () => {
    renderActiveFilters({
      editors: [],
      editorFilter: "departed-editor-id",
      isEditorDirectoryLoading: false,
    });
    const token = screen.getByRole("button", { name: /^Former editor/ });
    expect(token).not.toHaveTextContent("departed-editor-id");
  });
});
