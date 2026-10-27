import type { ReactNode } from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { toFollowerGrowthViews } from "./api/studioDashboard.adapters";
import { StudioFollowerGrowthChart } from "./StudioFollowerGrowthChart";

// jsdom measures every element at 0 wide, and the chart draws nothing at 0:
// give the plot a fixed size so its bars render.
vi.mock("@visx/responsive", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@visx/responsive")>()),
  ParentSize: ({
    children,
  }: {
    children: (size: { width: number; height: number }) => ReactNode;
  }) => children({ width: 360, height: 200 }),
}));

/** Twelve Monday-start weeks, oldest first, ending with the current week. */
const WEEK_STARTS = [
  "2026-08-10",
  "2026-08-17",
  "2026-08-24",
  "2026-08-31",
  "2026-09-07",
  "2026-09-14",
  "2026-09-21",
  "2026-09-28",
  "2026-10-05",
  "2026-10-12",
  "2026-10-19",
  "2026-10-26",
];
const COUNTS = [6, 8, 3, 7, 9, 12, 10, 14, 11, 16, 13, 5];

const weeks = toFollowerGrowthViews(
  WEEK_STARTS.map((weekStart, index) => ({
    weekStart,
    newFollowers: COUNTS[index] ?? 0,
  })),
);
const zeroWeeks = toFollowerGrowthViews(
  WEEK_STARTS.map((weekStart) => ({ weekStart, newFollowers: 0 })),
);

describe("StudioFollowerGrowthChart", () => {
  it("draws a focusable bar per week with its exact count, no floor", () => {
    render(
      <TestProviders>
        <StudioFollowerGrowthChart weeks={weeks} />
      </TestProviders>,
    );
    expect(
      screen.getByText("New followers who still follow"),
    ).toBeInTheDocument();
    const underFiveBar = screen.getByLabelText(/Week of .*: 3$/);
    expect(underFiveBar).toBeInTheDocument();
    expect(underFiveBar).toHaveAttribute("tabindex", "0");
    expect(screen.getByLabelText("This week: 5")).toBeInTheDocument();
    expect(screen.queryByText("Fewer than 5")).toBeNull();
  });

  it("opens the data table with every week, newest first", () => {
    render(
      <TestProviders>
        <StudioFollowerGrowthChart weeks={weeks} />
      </TestProviders>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Show data table" }));
    expect(
      screen.getByRole("button", { name: "Hide data table" }),
    ).toHaveAttribute("aria-expanded", "true");
    const rows = within(screen.getByRole("table")).getAllByRole("row");
    expect(rows).toHaveLength(13);
    expect(within(rows[1]!).getByRole("rowheader")).toHaveTextContent(
      "This week",
    );
    expect(within(rows[1]!).getByRole("cell")).toHaveTextContent("5");
  });

  it("says nobody new followed when every week is zero", () => {
    render(
      <TestProviders>
        <StudioFollowerGrowthChart weeks={zeroWeeks} />
      </TestProviders>,
    );
    expect(
      screen.getByText("Nobody new followed in the last 12 weeks"),
    ).toBeInTheDocument();
  });
});
