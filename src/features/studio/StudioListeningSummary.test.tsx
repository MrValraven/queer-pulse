import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { demoStudioListeningSummary } from "./api/studioDemoYourListening";
import {
  toListeningSummaryView,
  type StudioListeningSummaryView,
} from "./api/studioListening.adapters";
import type { StudioListeningRange } from "./api/studioListening.types";
import type { StudioLoadState } from "./api/studioLoadState";
import { StudioListeningSummary } from "./StudioListeningSummary";

interface SummaryResult {
  summary: StudioListeningSummaryView | null;
  loadState: StudioLoadState;
  isRefreshing: boolean;
}

const mocks = vi.hoisted<{ isMocked: boolean; summary: SummaryResult | null }>(
  () => ({ isMocked: false, summary: null }),
);

vi.mock("./api/useStudioListening", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("./api/useStudioListening")>();
  return {
    ...original,
    useStudioListeningSummary: (
      ...args: Parameters<typeof original.useStudioListeningSummary>
    ) =>
      mocks.isMocked && mocks.summary
        ? mocks.summary
        : original.useStudioListeningSummary(...args),
  };
});

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

function summaryWith(
  overrides: Partial<StudioListeningSummaryView>,
): SummaryResult {
  return {
    summary: {
      range: "4w",
      totalListens: 0,
      listeningDays: 0,
      topArtists: [],
      topTracks: [],
      isEmpty: false,
      ...overrides,
    },
    loadState: loadStateOf(),
    isRefreshing: false,
  };
}

function renderSummary(
  range: StudioListeningRange,
  onRangeChange: (next: StudioListeningRange) => void = () => undefined,
  isHistoryPaused = false,
) {
  return render(
    <TestProviders>
      <StudioListeningSummary
        range={range}
        onRangeChange={onRangeChange}
        isHistoryPaused={isHistoryPaused}
      />
    </TestProviders>,
  );
}

describe("StudioListeningSummary", () => {
  it("ranks the demo listener's artists and tracks with exact counts", async () => {
    mocks.isMocked = false;
    renderSummary("4w");
    const artists = await screen.findByRole("list", { name: "Top artists" });
    expect(within(artists).getAllByRole("listitem")[0]).toHaveTextContent(
      "NIGHTFORM",
    );
    expect(within(artists).getAllByRole("listitem")[0]).toHaveTextContent(
      /\d+ listens?$/,
    );
    expect(
      screen.getByRole("list", { name: "Top tracks" }),
    ).toBeInTheDocument();
  });

  it("puts a top track's listen count under its title, beside the artist line", async () => {
    mocks.isMocked = false;
    renderSummary("4w");
    const tracks = await screen.findByRole("list", { name: "Top tracks" });
    const firstTrackTitle = within(
      within(tracks).getAllByRole("listitem")[0] as HTMLElement,
    ).getByRole("heading");
    expect(firstTrackTitle.parentElement).toHaveTextContent(/\d+ listens?$/);
  });

  it("marks the chosen range and asks for another", async () => {
    mocks.isMocked = false;
    const onRangeChange = vi.fn();
    renderSummary("4w", onRangeChange);
    expect(
      await screen.findByRole("button", { name: "4 weeks" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByRole("group", { name: "Time range" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "6 months" }));
    expect(onRangeChange).toHaveBeenCalledWith("6m");
  });

  it("says a listener with 3 plays has 3 listens", () => {
    mocks.isMocked = true;
    mocks.summary = summaryWith({ totalListens: 3, listeningDays: 1 });
    renderSummary("4w");
    expect(screen.getByText("3 listens")).toBeInTheDocument();
    expect(screen.getByText("1 day with music")).toBeInTheDocument();
  });

  it("hides the totals for a range with no listens and no days", () => {
    mocks.isMocked = true;
    mocks.summary = summaryWith({ isEmpty: true });
    renderSummary("4w");
    expect(screen.queryByText("0 listens")).not.toBeInTheDocument();
    expect(screen.queryByText("0 days with music")).not.toBeInTheDocument();
  });

  it("says new plays stay out of an empty range while history is paused", () => {
    mocks.isMocked = true;
    mocks.summary = summaryWith({ isEmpty: true });
    renderSummary("4w", () => undefined, true);
    expect(
      screen.getByText(
        "Your history is paused, so new plays stay out of this list",
        { selector: "p:not([role])" },
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        "Nothing in this range yet. Play something and it shows up here",
      ),
    ).not.toBeInTheDocument();
  });

  it("shows the empty line for a range with nothing, and the load error with its reason", () => {
    mocks.isMocked = true;
    mocks.summary = summaryWith({ isEmpty: true });
    const { unmount } = renderSummary("4w");
    // The live region announces the same line, so match the visible one.
    expect(
      screen.getByText(
        "Nothing in this range yet. Play something and it shows up here",
        { selector: "p:not([role])" },
      ),
    ).toBeInTheDocument();
    unmount();
    mocks.summary = {
      summary: null,
      loadState: loadStateOf({ isError: true, reason: "offline" }),
      isRefreshing: false,
    };
    renderSummary("4w");
    expect(screen.getByText(/your listening/)).toBeInTheDocument();
  });

  it("drops the release from a top track whose release shares its title", () => {
    const demoTopTrack = toListeningSummaryView(
      demoStudioListeningSummary("12m"),
      "12m",
    ).topTracks[0];
    if (!demoTopTrack) throw new Error("The demo summary ranks no track");
    const { track } = demoTopTrack;
    mocks.isMocked = true;
    mocks.summary = summaryWith({
      totalListens: 3,
      listeningDays: 1,
      topTracks: [
        {
          listens: 3,
          track: {
            ...track,
            title: "Pedro on the 25",
            release: { ...track.release, title: " pedro ON the 25 " },
          },
        },
      ],
    });
    renderSummary("12m");
    const tracks = screen.getByRole("list", { name: "Top tracks" });
    const row = within(tracks).getByRole("listitem");
    expect(
      within(row).getAllByRole("link", { name: /pedro on the 25/i }),
    ).toHaveLength(1);
    expect(
      within(row).getByRole("link", { name: track.release.artist.name }),
    ).toBeInTheDocument();
  });
});
