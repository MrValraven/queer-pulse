import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { DEMO_DEFAULT_RELEASE_ID } from "./api/studioDemoMe.data";
import { resetDemoPurchases } from "./api/studioDemoPurchaseStore";
import type { StudioWallEntryView } from "./api/studioPurchases.adapters";
import type { StudioCursorPagesResult } from "./api/useStudioCursorPages";
import { StudioReleaseWall } from "./StudioReleaseWall";

const mocks: {
  isMocked: boolean;
  wall: StudioCursorPagesResult<StudioWallEntryView> | null;
} = vi.hoisted(() => ({ isMocked: false, wall: null }));

vi.mock("./api/useStudioPurchaseLists", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("./api/useStudioPurchaseLists")>();
  return {
    ...original,
    useStudioReleaseWall: (
      ...args: Parameters<typeof original.useStudioReleaseWall>
    ) =>
      mocks.isMocked && mocks.wall
        ? mocks.wall
        : original.useStudioReleaseWall(...args),
  };
});

/** One client per test, so a test never reads another's cache. */
let testQueryClient = new QueryClient();

function renderWall(releaseId: string, releaseTitle: string) {
  return render(
    <TestProviders queryClient={testQueryClient}>
      <StudioReleaseWall releaseId={releaseId} releaseTitle={releaseTitle} />
    </TestProviders>,
  );
}

function entryOf(index: number): StudioWallEntryView {
  return {
    key: `account:entry-${index}`,
    identity: {
      kind: "account",
      key: "account",
      name: `Member ${index}`,
      avatarUrl: null,
      initials: "M",
      tint: "plum",
      href: `/members/member-${index}`,
    },
  };
}

function pagerOf(
  overrides: Partial<StudioCursorPagesResult<StudioWallEntryView>>,
): StudioCursorPagesResult<StudioWallEntryView> {
  return {
    items: [],
    loadState: {
      isLoading: false,
      isError: false,
      isRetrying: false,
      isNotFound: false,
      isWithdrawn: false,
      isTrackWithheld: false,
      reason: "unknown",
      retry: () => undefined,
    },
    hasMore: false,
    isFetchingNextPage: false,
    isFetchNextPageError: false,
    fetchNextPage: () => undefined,
    ...overrides,
  };
}

beforeEach(() => {
  resetDemoPurchases();
  testQueryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  mocks.isMocked = false;
  mocks.wall = null;
});

describe("StudioReleaseWall", () => {
  it("shows the first 24 supporters, newest first, linked where they can be", async () => {
    renderWall(DEMO_DEFAULT_RELEASE_ID, "Cidade dos santos");
    expect(
      await screen.findByRole("heading", { name: "Supported by" }),
    ).toBeInTheDocument();
    const list = screen.getByRole("list", {
      name: "Members who bought Cidade dos santos",
    });
    expect(within(list).getAllByRole("listitem")).toHaveLength(24);
    expect(within(list).getByText("Rita Ferreira").closest("a")).toBeNull();
    expect(within(list).getAllByRole("link").length).toBeGreaterThan(0);
    expect(screen.queryByText(/€/)).toBeNull();
  });

  it("expands in place to every supporter on Show all", async () => {
    const user = userEvent.setup();
    renderWall(DEMO_DEFAULT_RELEASE_ID, "Cidade dos santos");
    const showAll = await screen.findByRole("button", {
      name: "Show all supporters",
    });
    expect(showAll).toHaveAttribute("aria-expanded", "false");
    const list = screen.getByRole("list", {
      name: "Members who bought Cidade dos santos",
    });
    expect(showAll).toHaveAttribute("aria-controls", list.id);
    await user.click(showAll);
    await waitFor(() =>
      expect(within(list).getAllByRole("listitem")).toHaveLength(26),
    );
    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: "Show all supporters" }),
      ).toBeNull(),
    );
    const twentyFifth = within(list).getAllByRole("listitem")[24];
    await waitFor(() =>
      expect(twentyFifth?.contains(document.activeElement)).toBe(true),
    );
  });

  it("hides the whole section when nobody is on the wall", () => {
    mocks.isMocked = true;
    mocks.wall = pagerOf({ items: [] });
    renderWall("release-1", "Quiet release");
    expect(screen.queryByRole("heading", { name: "Supported by" })).toBeNull();
    expect(screen.queryByRole("list")).toBeNull();
  });

  it("keeps the loaded entries and names a failed next page", async () => {
    const user = userEvent.setup();
    const fetchNextPage = vi.fn();
    mocks.isMocked = true;
    mocks.wall = pagerOf({
      items: Array.from({ length: 24 }, (_, index) => entryOf(index)),
      hasMore: true,
      isFetchNextPageError: true,
      fetchNextPageError: new TypeError("Failed to fetch"),
      fetchNextPage,
    });
    renderWall("release-1", "Long release");
    const list = await screen.findByRole("list", {
      name: "Members who bought Long release",
    });
    expect(within(list).getAllByRole("listitem")).toHaveLength(24);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "We couldn't load more supporters. We couldn't reach Studio",
    );
    await user.click(
      screen.getByRole("button", { name: "Show all supporters" }),
    );
    expect(fetchNextPage).toHaveBeenCalled();
    expect(within(list).getAllByRole("listitem")).toHaveLength(24);
  });
});
