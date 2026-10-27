import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { QueryClient } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import {
  toListenView,
  type StudioListenView,
} from "./api/studioListening.adapters";
import { demoStudioListeningRecent } from "./api/studioDemoYourListening";
import type { StudioLoadState } from "./api/studioLoadState";
import type { StudioCursorPagesResult } from "./api/useStudioCursorPages";
import type { StudioListeningHistorySwitch } from "./api/useStudioListeningHistorySwitch";
import { StudioListeningRecent } from "./StudioListeningRecent";

interface MocksHolder {
  isMocked: boolean;
  pager: StudioCursorPagesResult<StudioListenView> | null;
  isHistoryOn: boolean;
}

const mocks: MocksHolder = vi.hoisted<MocksHolder>(() => ({
  isMocked: false,
  pager: null,
  isHistoryOn: true,
}));

vi.mock(
  "./api/useStudioListeningHistorySwitch",
  (): {
    useStudioListeningHistorySwitch: () => StudioListeningHistorySwitch;
  } => ({
    useStudioListeningHistorySwitch: () => ({
      isOn: mocks.isHistoryOn,
      isAwaitingRow: false,
      loadState: loadStateOf(),
      setOn: () => undefined,
    }),
  }),
);

vi.mock("./api/useStudioListening", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("./api/useStudioListening")>();
  return {
    ...original,
    useStudioListeningRecent: () =>
      mocks.isMocked && mocks.pager
        ? mocks.pager
        : original.useStudioListeningRecent(),
  };
});

const SHOW_MORE = "Show more of your history";
/** A row's "Played 12 Oct" line, leaving out the "Played lately" heading. */
const PLAYED_ON = /^Played (?!lately)/;

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

const errorLoadState = () => loadStateOf({ isError: true, reason: "server" });

/** A playable listen from the demo history, with the overrides on top. */
function listenView(overrides: Partial<StudioListenView>): StudioListenView {
  const playable = demoStudioListeningRecent(null)
    .items.map(toListenView)
    .find((listen) => listen.track !== null);
  if (!playable) throw new Error("The demo history holds no playable listen");
  return { ...playable, id: "listen-test-1", ...overrides };
}

function pagerWith(
  items: StudioListenView[],
  overrides: Partial<StudioCursorPagesResult<StudioListenView>> = {},
): StudioCursorPagesResult<StudioListenView> {
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

let testQueryClient = new QueryClient();

/** One client per test; unmocked, it renders the demo history. */
function mockedTree() {
  return (
    <TestProviders queryClient={testQueryClient}>
      <StudioListeningRecent />
    </TestProviders>
  );
}

function renderMocked() {
  mocks.isMocked = true;
  return render(mockedTree());
}

/** Show more while it can still be pressed: a footer folding away is inert. */
function liveShowMoreButton(): HTMLElement | null {
  const button = screen.queryByRole("button", { name: SHOW_MORE });
  return button && !button.closest("[inert]") ? button : null;
}

beforeEach(() => {
  testQueryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  mocks.isMocked = false;
  mocks.pager = null;
  mocks.isHistoryOn = true;
});

describe("StudioListeningRecent", () => {
  it("lists the history newest first with when each played", async () => {
    render(mockedTree());
    expect(
      await screen.findByRole("heading", { name: "Played lately" }),
    ).toBeInTheDocument();
    expect((await screen.findAllByText(PLAYED_ON)).length).toBeGreaterThan(0);
  });

  it("shows more of the history and moves focus to the first new row on the last page", async () => {
    render(mockedTree());
    await screen.findByRole("button", { name: SHOW_MORE });
    for (let page = 0; page < 10 && liveShowMoreButton(); page += 1) {
      const before = screen.getAllByRole("listitem").length;
      const button = screen.getByRole("button", { name: SHOW_MORE });
      button.focus();
      fireEvent.click(button);
      await waitFor(() =>
        expect(screen.getAllByRole("listitem").length).toBeGreaterThan(before),
      );
    }
    await waitFor(() =>
      expect(screen.queryByRole("button", { name: SHOW_MORE })).toBeNull(),
    );
    expect(document.activeElement?.closest("li")).not.toBeNull();
  });

  it("says a track is no longer available", () => {
    mocks.pager = pagerWith([listenView({ track: null })]);
    renderMocked();
    expect(
      screen.getByText("This track is no longer available"),
    ).toBeInTheDocument();
    expect(screen.getByText(PLAYED_ON)).toBeInTheDocument();
  });

  it("keeps the loaded rows when the next page fails, and shows the empty line", () => {
    mocks.pager = pagerWith([listenView({})], {
      isFetchNextPageError: true,
      fetchNextPageError: new TypeError("Failed to fetch"),
      loadState: errorLoadState(),
    });
    const { unmount } = renderMocked();
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
    expect(screen.queryByText(/your listening history/)).toBeNull();
    expect(
      screen.getByRole("button", { name: "Try again" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "We couldn't load more right now. We couldn't reach Studio. Check your connection, or try again in a moment",
      ),
    ).toBeInTheDocument();
    unmount();
    mocks.pager = pagerWith([]);
    const { unmount: unmountEmpty } = renderMocked();
    expect(
      screen.getByText("Play a track for 30 seconds and it lands here"),
    ).toBeInTheDocument();
    unmountEmpty();
    mocks.pager = pagerWith([], { loadState: errorLoadState() });
    renderMocked();
    expect(screen.getByText(/your listening history/)).toBeInTheDocument();
  });

  it("moves focus into an unavailable listen when it is the first new row", () => {
    const fetchNextPage = vi.fn();
    const firstPage = [listenView({ id: "listen-page-1" })];
    mocks.pager = pagerWith(firstPage, { hasMore: true, fetchNextPage });
    const { rerender } = renderMocked();
    const showMore = screen.getByRole("button", { name: SHOW_MORE });
    showMore.focus();
    fireEvent.click(showMore);
    expect(fetchNextPage).toHaveBeenCalledTimes(1);
    mocks.pager = pagerWith(
      [
        ...firstPage,
        listenView({ id: "listen-page-2-unavailable", track: null }),
        listenView({ id: "listen-page-2-playable" }),
      ],
      { hasMore: false, fetchNextPage },
    );
    rerender(mockedTree());
    expect(document.activeElement?.closest("li")).toHaveTextContent(
      "This track is no longer available",
    );
  });

  it("says new plays stay out of the list while history is paused", () => {
    mocks.isHistoryOn = false;
    mocks.pager = pagerWith([]);
    renderMocked();
    expect(
      screen.getByText(
        "Your history is paused, so new plays stay out of this list",
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Play a track for 30 seconds and it lands here"),
    ).not.toBeInTheDocument();
  });

  it("drops the release from a row whose release shares the track's title", () => {
    const listen = listenView({});
    if (!listen.track) throw new Error("The test listen has no track");
    const track = listen.track;
    mocks.pager = pagerWith([
      listenView({
        track: {
          ...track,
          title: "Pedro on the 25",
          release: { ...track.release, title: " pedro ON the 25 " },
        },
      }),
    ]);
    renderMocked();
    const row = screen.getByRole("listitem");
    expect(
      within(row).getAllByRole("link", { name: /pedro on the 25/i }),
    ).toHaveLength(1);
    expect(
      within(row).getByRole("link", { name: track.release.artist.name }),
    ).toBeInTheDocument();
  });
});
