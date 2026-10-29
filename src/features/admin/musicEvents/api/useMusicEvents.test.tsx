import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { ApiError } from "../../../../shared/api/client";
import { isMusicEventNotFound } from "./musicEventErrors";
import type {
  AdminMusicEventListItemDTO,
  AdminMusicEventListPageDTO,
} from "./musicEvents.types";
import { useMusicEventAttention, useMusicEventList } from "./useMusicEvents";

const mocks: {
  isDemo: boolean;
  apiGet: Mock<(path: string) => Promise<unknown>>;
} = vi.hoisted(() => ({
  isDemo: false,
  apiGet: vi.fn<(path: string) => Promise<unknown>>(),
}));

vi.mock("../../../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: mocks.isDemo }),
}));
vi.mock("../../../../shared/api/client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../../../shared/api/client")>()),
  apiGet: (path: string) => mocks.apiGet(path),
  apiPost: vi.fn(),
}));

function liveItem(slug: string): AdminMusicEventListItemDTO {
  return {
    slug,
    title: `Event ${slug}`,
    startAt: "2026-11-20T23:00:00.000Z",
    status: "published",
    eventType: "club-night",
    gatheringFamily: "music",
    lineupCounts: { pending: 1, accepted: 2, declined: 0 },
    pendingInviteRequestCount: 1,
  };
}

function livePage(
  items: AdminMusicEventListItemDTO[],
  page: number,
  hasMore: boolean,
): AdminMusicEventListPageDTO {
  return {
    items,
    page,
    pageSize: 20,
    hasMore,
    attention: { pendingInviteRequestCount: 1, pendingLineupCount: 1 },
  };
}

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, wrapper };
}

beforeEach(() => {
  mocks.apiGet.mockReset();
  mocks.isDemo = false;
});

describe("useMusicEvents", () => {
  it("serves the demo buckets without a request", async () => {
    mocks.isDemo = true;
    const { wrapper } = setup();
    const { result } = renderHook(
      () => ({
        upcoming: useMusicEventList("upcoming"),
        cancelled: useMusicEventList("cancelled"),
      }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.upcoming.rows).toHaveLength(2));
    await waitFor(() => expect(result.current.cancelled.rows).toHaveLength(1));
    expect(result.current.cancelled.rows[0]?.isCancelled).toBe(true);
    expect(result.current.upcoming.hasMore).toBe(false);
    expect(mocks.apiGet).toHaveBeenCalledTimes(0);
  });

  it("keeps the loaded rows when a later page fails", async () => {
    mocks.apiGet.mockImplementation((path) =>
      path.endsWith("page=1")
        ? Promise.resolve(livePage([liveItem("club-night-x1")], 1, true))
        : Promise.reject(new ApiError(500, "Server error")),
    );
    const { wrapper } = setup();
    const { result } = renderHook(() => useMusicEventList("upcoming"), {
      wrapper,
    });
    await waitFor(() => expect(result.current.rows).toHaveLength(1));
    expect(result.current.hasMore).toBe(true);

    act(() => result.current.loadMore());

    await waitFor(() => expect(result.current.isLoadMoreError).toBe(true));
    expect(result.current.rows).toHaveLength(1);
    expect(result.current.rows[0]?.slug).toBe("club-night-x1");
    expect(result.current.isLoadError).toBe(false);
    expect(mocks.apiGet).toHaveBeenCalledWith(
      "/admin/music-events?bucket=upcoming&page=2",
    );
  });

  it("reads attention from the upcoming first page", async () => {
    mocks.isDemo = true;
    const { wrapper } = setup();
    const { result } = renderHook(
      () => ({
        attention: useMusicEventAttention({ isEnabled: true }),
        upcoming: useMusicEventList("upcoming"),
      }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.upcoming.rows).toHaveLength(2));
    const upcomingRows = result.current.upcoming.rows;
    const expectedRequests = upcomingRows.reduce(
      (total, row) => total + row.pendingInviteRequestCount,
      0,
    );
    const expectedLineup = upcomingRows.reduce(
      (total, row) => total + row.lineup.pending,
      0,
    );
    expect(expectedRequests).toBeGreaterThan(0);
    await waitFor(() =>
      expect(result.current.attention).toEqual({
        pendingInviteRequestCount: expectedRequests,
        pendingLineupCount: expectedLineup,
      }),
    );
    expect(mocks.apiGet).toHaveBeenCalledTimes(0);
  });

  it("names a missing event", () => {
    expect(
      isMusicEventNotFound(
        new ApiError(404, "x", { code: "music_event_not_found" }),
      ),
    ).toBe(true);
    expect(isMusicEventNotFound(new ApiError(404, "x"))).toBe(false);
  });
});
