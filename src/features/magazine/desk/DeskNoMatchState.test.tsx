import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import {
  DeskNoMatchState,
  type DeskNoMatchStateProps,
} from "./DeskNoMatchState";

function renderState(overrides: Partial<DeskNoMatchStateProps> = {}) {
  const onClearAll = vi.fn();
  render(
    <TestProviders>
      <DeskNoMatchState
        query="zzzz"
        hasFilters={false}
        scopePieceCount={9}
        onClearAll={onClearAll}
        {...overrides}
      />
    </TestProviders>,
  );
  return { onClearAll };
}

describe("DeskNoMatchState", () => {
  it("quotes the search and names it as what hides the pieces", async () => {
    renderState();
    expect(
      await screen.findByRole("heading", { name: "No pieces match “zzzz”" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("9 pieces here are hidden by this search."),
    ).toBeInTheDocument();
  });

  it("names the filters when no search is on, and offers to clear them", async () => {
    renderState({ query: "  ", hasFilters: true });
    expect(
      await screen.findByRole("heading", {
        name: "No pieces match these filters",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("9 pieces here are hidden by these filters."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Clear filters" }),
    ).toBeInTheDocument();
  });

  it("clears everything from one button", async () => {
    const user = userEvent.setup();
    const { onClearAll } = renderState({ hasFilters: true });
    await user.click(
      await screen.findByRole("button", { name: "Clear search and filters" }),
    );
    expect(onClearAll).toHaveBeenCalledTimes(1);
  });
});
