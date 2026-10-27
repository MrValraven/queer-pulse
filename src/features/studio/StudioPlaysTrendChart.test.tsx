import type { ReactNode } from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import type { StudioCountView } from "./api/studio.adapters";
import type {
  StudioArtistPlaysDayView,
  StudioArtistPlaysView,
} from "./api/studioDashboardPlays.adapters";
import type { StudioLoadState } from "./api/studioLoadState";
import { StudioPlaysTrendChart } from "./StudioPlaysTrendChart";

interface PlaysResult {
  plays: StudioArtistPlaysView | null;
  loadState: StudioLoadState;
}

const mocks: { plays: PlaysResult | null } = vi.hoisted(() => ({
  plays: null,
}));

vi.mock("./api/useStudioArtistPlays", () => ({
  useStudioArtistPlays: (): PlaysResult =>
    mocks.plays ?? { plays: null, loadState: loadStateOf({ isLoading: true }) },
}));

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

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
const TODAY_TIME = Date.UTC(2026, 9, 27);

const withheld: StudioCountView = { value: null, isBelowThreshold: true };

function exactCount(value: number): StudioCountView {
  return { value, isBelowThreshold: false };
}

function loadStateOf(
  overrides: Partial<StudioLoadState> = {},
): StudioLoadState {
  return {
    isLoading: false,
    isError: false,
    isRetrying: false,
    isNotFound: false,
    isWithdrawn: false,
    isTrackWithheld: false,
    reason: "unknown",
    retry: () => undefined,
    ...overrides,
  };
}

function notFoundLoadState(): StudioLoadState {
  return loadStateOf({ isNotFound: true, reason: "notFound" });
}

/** Days oldest first; the last one is today. */
function playsWith(
  days: { dayKey: string; plays: StudioCountView }[],
  totals: { total?: StudioCountView; total28d?: StudioCountView } = {},
): PlaysResult {
  const dayViews: StudioArtistPlaysDayView[] = days.map((entry, index) => ({
    dayKey: entry.dayKey,
    day: new Date(`${entry.dayKey}T00:00:00.000Z`),
    plays: entry.plays,
    isToday: index === days.length - 1,
  }));
  return {
    plays: {
      days: dayViews,
      total: totals.total ?? exactCount(0),
      total28d: totals.total28d ?? exactCount(0),
    },
    loadState: loadStateOf(),
  };
}

/** `count` days of real zeros, ending today. */
function zeroDays(count: number): { dayKey: string; plays: StudioCountView }[] {
  return Array.from({ length: count }, (_, index) => ({
    dayKey: new Date(TODAY_TIME - (count - 1 - index) * MILLISECONDS_PER_DAY)
      .toISOString()
      .slice(0, 10),
    plays: exactCount(0),
  }));
}

function renderChart() {
  return render(
    <TestProviders>
      <StudioPlaysTrendChart subprofileId="persona-1" />
    </TestProviders>,
  );
}

describe("StudioPlaysTrendChart", () => {
  beforeEach(() => {
    mocks.plays = null;
  });

  it("reads a withheld day as Fewer than 5 and a zero day as 0", () => {
    mocks.plays = playsWith([
      { dayKey: "2026-10-25", plays: withheld },
      { dayKey: "2026-10-26", plays: exactCount(0) },
      { dayKey: "2026-10-27", plays: exactCount(12) },
    ]);
    renderChart();
    fireEvent.click(screen.getByRole("button", { name: "Show data table" }));
    const rows = within(
      screen.getByRole("table", { name: "Plays per day" }),
    ).getAllByRole("row");
    const bodyRows = rows.slice(1);
    expect(
      bodyRows.map((row) => within(row).getByRole("cell").textContent),
    ).toEqual(["12", "0", "Fewer than 5"]);
    expect(
      bodyRows.map((row) => within(row).getByRole("rowheader").textContent),
    ).toEqual([
      "Today",
      expect.stringMatching(/26/),
      expect.stringMatching(/25/),
    ]);
  });

  it("sums up under the chart, floored", () => {
    mocks.plays = playsWith(
      [
        { dayKey: "2026-10-26", plays: exactCount(0) },
        { dayKey: "2026-10-27", plays: exactCount(9) },
      ],
      { total: exactCount(1284), total28d: withheld },
    );
    renderChart();
    expect(
      screen.getByText("All time: 1,284 · Last 28 days: Fewer than 5"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "A play counts after 30 seconds of listening. Plays by you and your co-owners never count",
      ),
    ).toBeInTheDocument();
  });

  it("says when nothing played and shows not found with no Retry", () => {
    mocks.plays = playsWith(zeroDays(28));
    const { unmount } = renderChart();
    expect(
      screen.getByText("No plays in the last 28 days yet"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("All time: 0 · Last 28 days: 0"),
    ).toBeInTheDocument();
    unmount();

    mocks.plays = { plays: null, loadState: notFoundLoadState() };
    renderChart();
    expect(
      screen.getByText(
        "This isn't available anymore. It may have moved or been taken down",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /retry/i })).toBeNull();
    expect(screen.getByText("your plays")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Show data table" }),
    ).toBeNull();
  });
});
