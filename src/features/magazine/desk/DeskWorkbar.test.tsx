import { createRef, useState } from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import type { Editor, Stage } from "../data/desk.data";
import type { DeskGroupBy } from "./pipelineGroups";
import type {
  DeskDensity,
  PieceFormatFilter,
  PieceSortOption,
} from "./useDeskState";
import { DeskWorkbar, type DeskWorkbarProps } from "./DeskWorkbar";

// Reads the exact English copy from the catalog, so this passes once the
// relevant keys are added.

const EDITORS: Editor[] = [
  { id: "ed-1", name: "Rita Faria", initials: "RF", tint: "coral", cap: 6 },
  { id: "ed-2", name: "Joana Paz", initials: "JP", tint: "jade", cap: 5 },
];

/** The workbar with its own state, the way the desk page holds it. */
function StatefulWorkbar(overrides: Partial<DeskWorkbarProps>) {
  const [query, setQuery] = useState("");
  const [format, setFormat] = useState<PieceFormatFilter>("all");
  const [sectionFilter, setSectionFilter] = useState<string[]>([]);
  const [stageFilter, setStageFilter] = useState<Stage[]>([]);
  const [editorFilter, setEditorFilter] = useState<string | null>(null);
  const [sort, setSort] = useState<PieceSortOption>("due");
  const [groupBy, setGroupBy] = useState<DeskGroupBy>("waiting");
  const [density, setDensity] = useState<DeskDensity>("comfortable");
  return (
    <DeskWorkbar
      query={query}
      onQuery={setQuery}
      layout="list"
      onLayout={vi.fn()}
      isCalendarAvailable={false}
      format={format}
      onFormat={setFormat}
      sections={["Culture", "Politics"]}
      sectionFilter={sectionFilter}
      onSectionFilter={setSectionFilter}
      stages={["Drafting", "Edit"]}
      stageFilter={stageFilter}
      onStageFilter={setStageFilter}
      editors={EDITORS}
      editorFilter={editorFilter}
      onEditorFilter={setEditorFilter}
      sort={sort}
      onSort={setSort}
      groupBy={groupBy}
      onGroupBy={setGroupBy}
      density={density}
      onDensity={setDensity}
      onShortcuts={vi.fn()}
      {...overrides}
    />
  );
}

function renderWorkbar(overrides: Partial<DeskWorkbarProps> = {}) {
  render(
    <TestProviders>
      <StatefulWorkbar {...overrides} />
    </TestProviders>,
  );
}

describe("DeskWorkbar", () => {
  it("forwards the search ref so the desk can focus the field", () => {
    const searchInputRef = createRef<HTMLInputElement>();
    renderWorkbar({ searchInputRef });
    expect(searchInputRef.current).toBe(
      screen.getByPlaceholderText("Search pieces, writers, sections"),
    );
  });

  it("offers the calendar layout only while it is available", () => {
    renderWorkbar();
    expect(screen.queryByRole("button", { name: "Calendar" })).toBeNull();
  });

  it("shows the calendar layout when it is available", () => {
    renderWorkbar({ isCalendarAvailable: true });
    expect(screen.getByRole("button", { name: "Calendar" })).toBeVisible();
  });

  it("keeps the Filter menu open across checkboxes and counts them", async () => {
    const user = userEvent.setup();
    renderWorkbar();
    await user.click(screen.getByRole("button", { name: "Filter" }));
    await user.click(screen.getByRole("menuitemcheckbox", { name: "Culture" }));
    await user.click(screen.getByRole("menuitemcheckbox", { name: "Edit" }));
    expect(screen.getByRole("menu", { name: "Filter pieces" })).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Filter, 2 active" }),
    ).toBeVisible();
  });

  it("spells active filters out as tokens that remove one filter each", async () => {
    const user = userEvent.setup();
    renderWorkbar();
    await user.click(screen.getByRole("button", { name: "Filter" }));
    await user.click(screen.getByRole("menuitemradio", { name: "Joana" }));

    const token = screen.getByRole("button", { name: /Editor: Joana/ });
    await user.click(token);
    expect(screen.queryByRole("button", { name: /Editor: Joana/ })).toBeNull();
    // Focus comes back inside a requestAnimationFrame, so the assertion has to
    // wait for it rather than check the instant after the click resolves.
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Filter" })).toHaveFocus(),
    );
  });

  it("clears every filter at once", async () => {
    const user = userEvent.setup();
    renderWorkbar();
    await user.click(screen.getByRole("button", { name: "Filter" }));
    await user.click(screen.getByRole("menuitemradio", { name: "Decks" }));
    await user.click(screen.getByRole("button", { name: "Clear all" }));
    expect(screen.queryByRole("button", { name: /Format: Decks/ })).toBeNull();
    expect(screen.getByRole("button", { name: "Filter" })).toBeVisible();
  });

  it("names the current sort on the Sort trigger and changes it", async () => {
    const user = userEvent.setup();
    renderWorkbar();
    const sortTrigger = screen.getByRole("button", { name: /Sort/ });
    expect(sortTrigger).toHaveTextContent("Due date");

    await user.click(sortTrigger);
    const sortGroup = screen.getByRole("group", { name: "Sort by" });
    await user.click(
      within(sortGroup).getByRole("menuitemradio", { name: "Section" }),
    );
    expect(screen.getByRole("button", { name: /Sort/ })).toHaveTextContent(
      "Section",
    );
  });

  it("opens the shortcuts sheet from the help button", async () => {
    const user = userEvent.setup();
    const onShortcuts = vi.fn();
    renderWorkbar({ onShortcuts });
    await user.click(
      screen.getByRole("button", { name: "Keyboard shortcuts" }),
    );
    expect(onShortcuts).toHaveBeenCalledOnce();
  });
});
