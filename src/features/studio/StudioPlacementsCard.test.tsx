import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import type { StudioPlacementView } from "./api/studioDashboard.adapters";
import { DEMO_ARTIST_MARIANA } from "./api/studioDemoMe.data";
import type { StudioCursorPagesResult } from "./api/useStudioCursorPages";
import type { StudioLoadState } from "./api/studioLoadState";
import { StudioPlacementsCard } from "./StudioPlacementsCard";

interface MocksHolder {
  isMocked: boolean;
  pager: StudioCursorPagesResult<StudioPlacementView> | null;
}

const mocks = vi.hoisted<MocksHolder>(() => ({
  isMocked: false,
  pager: null,
}));

vi.mock("./api/useStudioPlacements", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("./api/useStudioPlacements")>();
  return {
    ...original,
    useStudioPlacements: (
      ...args: Parameters<typeof original.useStudioPlacements>
    ) =>
      mocks.isMocked
        ? (mocks.pager ?? original.useStudioPlacements(...args))
        : original.useStudioPlacements(...args),
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

function errorLoadState(overrides: Partial<StudioLoadState> = {}) {
  return loadStateOf({ isError: true, reason: "server", ...overrides });
}

function placementView({
  titles,
  hiddenTrackCount = 0,
  id = "playlist-1",
  name = "Late night loops",
}: {
  titles: string[];
  hiddenTrackCount?: number;
  id?: string;
  name?: string;
}): StudioPlacementView {
  return {
    playlist: {
      id,
      name,
      credit: { kind: "member", id: "member-1", name: "Rui" },
      coverUrls: [],
      tint: "default",
      href: `/studio/collection?id=${id}`,
    },
    tracks: titles.map((title, index) => ({
      id: `track-${index}`,
      title,
      href: `/studio/track?id=track-${index}`,
    })),
    hiddenTrackCount,
    latestAddedAt: new Date("2026-10-20T10:00:00.000Z"),
  } as unknown as StudioPlacementView;
}

function pagerWith(
  items: StudioPlacementView[],
  overrides: Partial<StudioCursorPagesResult<StudioPlacementView>> = {},
): StudioCursorPagesResult<StudioPlacementView> {
  return {
    items,
    loadState: loadStateOf(),
    hasMore: false,
    isFetchingNextPage: false,
    isFetchNextPageError: false,
    fetchNextPage: () => undefined,
    ...overrides,
  };
}

/** One client per test, so a rerender keeps the providers it mounted. */
let testQueryClient = new QueryClient();

function mockedCard() {
  return (
    <TestProviders queryClient={testQueryClient}>
      <StudioPlacementsCard subprofileId="persona-1" />
    </TestProviders>
  );
}

function renderMocked() {
  mocks.isMocked = true;
  return render(mockedCard());
}

const EMPTY_LINE =
  "When a member adds one of your tracks to a public playlist, it shows up here";

beforeEach(() => {
  testQueryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  mocks.isMocked = false;
  mocks.pager = null;
});

describe("StudioPlacementsCard", () => {
  it("lists Mariana's placements, each row opening its playlist", async () => {
    render(
      <TestProviders>
        <StudioPlacementsCard subprofileId={DEMO_ARTIST_MARIANA.id} />
      </TestProviders>,
    );
    expect(
      await screen.findByRole("heading", { name: "Where your music lives" }),
    ).toBeInTheDocument();
    const links = await screen.findAllByRole("link");
    expect(links[0]).toHaveAttribute(
      "href",
      expect.stringMatching(/^\/studio\/collection\?id=/),
    );
    expect(screen.getAllByText(/^Your tracks here: /).length).toBeGreaterThan(
      0,
    );
  });

  it("shows more playlists on request", async () => {
    render(
      <TestProviders>
        <StudioPlacementsCard subprofileId={DEMO_ARTIST_MARIANA.id} />
      </TestProviders>,
    );
    const showMore = await screen.findByRole("button", {
      name: "Show more playlists",
    });
    const before = screen.getAllByRole("listitem").length;
    fireEvent.click(showMore);
    await waitFor(() =>
      expect(screen.getAllByRole("listitem").length).toBeGreaterThan(before),
    );
  });

  it("names the hidden tracks after five titles", () => {
    mocks.pager = pagerWith([
      placementView({ titles: ["A", "B", "C", "D", "E"], hiddenTrackCount: 3 }),
    ]);
    renderMocked();
    expect(
      screen.getByText("Your tracks here: A, B, C, D, E, and 3 more tracks"),
    ).toBeInTheDocument();
  });

  it("keeps the loaded rows when the next page fails and names the reason", () => {
    mocks.pager = pagerWith([placementView({ titles: ["A"] })], {
      isFetchNextPageError: true,
      fetchNextPageError: new TypeError("Failed to fetch"),
      loadState: errorLoadState(),
    });
    renderMocked();
    expect(screen.getByText("Your tracks here: A")).toBeInTheDocument();
    expect(screen.queryByText(/where your music lives$/)).toBeNull();
    expect(
      screen.getByText(
        "We couldn't load more playlists. We couldn't reach Studio. Check your connection, or try again in a moment",
      ),
    ).toBeInTheDocument();
  });

  it("keeps focus on Try again while a failed page retries", () => {
    const fetchNextPage = vi.fn();
    const rows = [placementView({ titles: ["A"] })];
    mocks.pager = pagerWith(rows, {
      isFetchNextPageError: true,
      fetchNextPageError: new TypeError("Failed to fetch"),
      fetchNextPage,
    });
    const { rerender } = renderMocked();
    const retry = screen.getByRole("button", { name: "Try again" });
    retry.focus();
    fireEvent.click(retry);
    expect(fetchNextPage).toHaveBeenCalledTimes(1);
    mocks.pager = pagerWith(rows, {
      isFetchNextPageError: true,
      fetchNextPageError: new TypeError("Failed to fetch"),
      fetchNextPage,
    });
    rerender(mockedCard());
    expect(screen.getByRole("button", { name: "Try again" })).toHaveFocus();
  });

  it("animates the first page of rows in from collapsed", () => {
    mocks.pager = pagerWith([placementView({ titles: ["A"] })]);
    renderMocked();
    // Without LazyMotion in the test providers a row keeps its `initial`
    // inline style, so a collapsed first paint proves the reveal runs.
    expect(screen.getByRole("listitem")).toHaveStyle({ opacity: "0" });
  });

  it("moves focus to the first new row when Show more folds away", () => {
    const fetchNextPage = vi.fn();
    const firstPage = [placementView({ titles: ["A"] })];
    mocks.pager = pagerWith(firstPage, { hasMore: true, fetchNextPage });
    const { rerender } = renderMocked();
    const showMore = screen.getByRole("button", {
      name: "Show more playlists",
    });
    showMore.focus();
    fireEvent.click(showMore);
    expect(fetchNextPage).toHaveBeenCalledTimes(1);
    mocks.pager = pagerWith(
      [
        ...firstPage,
        placementView({ titles: ["B"], id: "playlist-2", name: "Sunday" }),
        placementView({ titles: ["C"], id: "playlist-3", name: "Night" }),
      ],
      { hasMore: false, fetchNextPage },
    );
    rerender(mockedCard());
    expect(screen.getByRole("link", { name: "Sunday" })).toHaveFocus();
  });

  it("shows a not-found panel with no Retry for a persona that is gone", () => {
    mocks.pager = pagerWith([], {
      loadState: loadStateOf({ isNotFound: true, reason: "notFound" }),
    });
    renderMocked();
    expect(
      screen.getByText(
        "This isn't available anymore. It may have moved or been taken down",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText(EMPTY_LINE)).toBeNull();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("keeps Show more working when a page came back empty with a cursor", () => {
    mocks.pager = pagerWith([], { hasMore: true });
    renderMocked();
    expect(
      screen.getByRole("button", { name: "Show more playlists" }),
    ).toBeInTheDocument();
    expect(screen.queryByText(EMPTY_LINE)).toBeNull();
  });

  it("shows the empty line and the load error with its reason", () => {
    mocks.pager = pagerWith([]);
    const { unmount } = renderMocked();
    expect(screen.getByText(EMPTY_LINE)).toBeInTheDocument();
    unmount();
    mocks.pager = pagerWith([], {
      loadState: errorLoadState({ reason: "offline" }),
    });
    renderMocked();
    expect(screen.getByText(/where your music lives/)).toBeInTheDocument();
  });
});
