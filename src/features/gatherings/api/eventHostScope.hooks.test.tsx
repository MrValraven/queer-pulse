import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import {
  EventHostScopeContext,
  MEMBER_HOST_SCOPE,
  type EventHostScope,
} from "../eventHostScope";
import type { AttendeeRow } from "./events.adapters";
import type { AttendeesPageDTO, EventLineupDTO } from "./events.api";
import { eventKeys } from "./eventKeys";
import { useAttendeePages } from "./useAttendeePages";
import { useAttendees, type AttendeesResult } from "./useAttendees";
import { useEvent } from "./useEvent";
import { useRemoveAttendee } from "./useEventMutations";
import { useEventLineup } from "./useEventLineup";
import { useApproveInviteRequest } from "./useMemberInviteMutations";

const mocks: {
  apiGet: Mock<(path: string) => Promise<unknown>>;
  apiPost: Mock<(path: string, body?: unknown) => Promise<unknown>>;
  apiDelete: Mock<(path: string) => Promise<unknown>>;
} = vi.hoisted(() => ({
  apiGet: vi.fn<(path: string) => Promise<unknown>>(),
  apiPost: vi.fn<(path: string, body?: unknown) => Promise<unknown>>(),
  apiDelete: vi.fn<(path: string) => Promise<unknown>>(),
}));

vi.mock("../../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: false }),
}));
vi.mock("../../../app/providers/authContext", () => ({
  useAuth: () => ({ loggedIn: true, checking: false, status: "active" }),
}));
vi.mock("../../../shared/i18n/useTranslation", () => ({
  useTranslation: () => ({
    language: "en",
    setLanguage: () => undefined,
    t: (key: string) => key,
    translateIn: () => undefined,
  }),
}));
vi.mock("../../../shared/api/client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../../shared/api/client")>()),
  apiGet: (path: string) => mocks.apiGet(path),
  apiPost: (path: string, body?: unknown) => mocks.apiPost(path, body),
  apiDelete: (path: string) => mocks.apiDelete(path),
}));

const MUSIC_ADMIN_TEST_SCOPE: EventHostScope = {
  ...MEMBER_HOST_SCOPE,
  apiTarget: "musicAdmin",
  isHouseEvent: true,
  doorRefetchIntervalMs: 10_000,
};

const HOUSE_SLUG = "club-night-x1";

/** `staleTime` keeps a seeded cache from refetching on mount, so only an
 *  invalidation can replace it. */
function setup(scope: EventHostScope | null, staleTime = 0) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {scope ? (
        <EventHostScopeContext.Provider value={scope}>
          {children}
        </EventHostScopeContext.Provider>
      ) : (
        children
      )}
    </QueryClientProvider>
  );
  return { queryClient, wrapper };
}

function rosterRow(slug: string): AttendeeRow {
  return {
    id: `att-${slug}`,
    slug,
    initials: slug.slice(0, 2).toUpperCase(),
    background: "var(--cream)",
    color: "var(--plum)",
    name: slug,
  };
}

function rosterWith(slugs: string[]): AttendeesResult {
  const going = slugs.map(rosterRow);
  return {
    going,
    waitlist: [],
    goingCount: going.length,
    waitlistCount: 0,
    seatsTaken: going.length,
    checkedInCount: 0,
    goingPage: 1,
    hasMoreGoing: false,
    waitlistPage: 1,
    hasMoreWaitlist: false,
  };
}

function emptyAttendeesPage(): AttendeesPageDTO {
  return {
    items: [],
    total: 0,
    page: 1,
    pageSize: 20,
    goingCount: 0,
    seatsTaken: 0,
    waitlistCount: 0,
    checkedInCount: 0,
  };
}

function goingSlugs(roster: AttendeesResult | undefined): string[] {
  return roster?.going.map((attendee) => attendee.slug) ?? [];
}

beforeEach(() => {
  mocks.apiGet.mockReset();
  mocks.apiPost.mockReset();
  mocks.apiDelete.mockReset();
});

describe("organizer hooks inside the music admin scope", () => {
  it("reads the admin detail inside the music admin scope", async () => {
    mocks.apiGet.mockResolvedValue({});
    const { queryClient, wrapper } = setup(MUSIC_ADMIN_TEST_SCOPE);
    renderHook(() => useEvent(HOUSE_SLUG), { wrapper });

    await waitFor(() =>
      expect(mocks.apiGet).toHaveBeenCalledWith(
        `/admin/music-events/${HOUSE_SLUG}`,
      ),
    );
    const detailQueries = queryClient
      .getQueryCache()
      .findAll({ queryKey: eventKeys.detailRoot });
    expect(detailQueries).toHaveLength(1);
    expect(detailQueries[0]?.queryKey.at(-1)).toBe("musicAdmin");
  });

  it("fetches the admin lineup even with the member lineup cached", async () => {
    const acceptedLineup: EventLineupDTO = {
      entries: [
        {
          id: "lineup-1",
          slug: "dj-mare",
          name: "DJ Maré",
          avatarUrl: null,
          role: "DJ",
          status: "accepted",
        },
      ],
      viewerEntry: null,
    };
    mocks.apiGet.mockResolvedValue({ entries: [], viewerEntry: null });
    const { queryClient, wrapper } = setup(MUSIC_ADMIN_TEST_SCOPE);
    queryClient.setQueryData(
      eventKeys.lineup(HOUSE_SLUG, false),
      acceptedLineup,
    );
    const { result } = renderHook(() => useEventLineup(HOUSE_SLUG), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mocks.apiGet).toHaveBeenCalledWith(
      `/admin/music-events/${HOUSE_SLUG}/lineup`,
    );
    expect(result.current.data?.entries).toEqual([]);
    expect(
      queryClient.getQueryData(eventKeys.lineup(HOUSE_SLUG, false)),
    ).toEqual(acceptedLineup);
  });

  it("patches the admin attendees cache and leaves the member cache as seeded", async () => {
    mocks.apiGet.mockResolvedValue(emptyAttendeesPage());
    mocks.apiDelete.mockResolvedValue({ ok: true });
    const { queryClient, wrapper } = setup(
      MUSIC_ADMIN_TEST_SCOPE,
      Number.POSITIVE_INFINITY,
    );
    const adminKey = eventKeys.attendees(HOUSE_SLUG, false, "musicAdmin");
    const memberKey = eventKeys.attendees(HOUSE_SLUG, false);
    queryClient.setQueryData(adminKey, rosterWith(["ana", "bea"]));
    queryClient.setQueryData(memberKey, rosterWith(["ana", "bea"]));

    const { result } = renderHook(
      () => ({
        roster: useAttendees(HOUSE_SLUG),
        removeAttendee: useRemoveAttendee(HOUSE_SLUG),
      }),
      { wrapper },
    );
    expect(mocks.apiGet).not.toHaveBeenCalled();
    await act(async () => {
      await result.current.removeAttendee.mutateAsync("ana");
    });

    expect(mocks.apiDelete).toHaveBeenCalledWith(
      `/admin/music-events/${HOUSE_SLUG}/attendees/ana`,
    );
    await waitFor(() =>
      expect(
        goingSlugs(queryClient.getQueryData<AttendeesResult>(adminKey)),
      ).not.toContain("ana"),
    );
    expect(
      goingSlugs(queryClient.getQueryData<AttendeesResult>(memberKey)),
    ).toEqual(["ana", "bea"]);
    expect(queryClient.getQueryState(memberKey)?.isInvalidated).toBe(false);
  });

  it("posts an invite decision to the event's admin route", async () => {
    mocks.apiGet.mockResolvedValue([]);
    mocks.apiPost.mockResolvedValue({ id: "request-7", status: "pending" });
    const { wrapper } = setup(MUSIC_ADMIN_TEST_SCOPE);
    const { result } = renderHook(() => useApproveInviteRequest(HOUSE_SLUG), {
      wrapper,
    });

    await act(async () => {
      await result.current.mutateAsync("request-7");
    });

    expect(mocks.apiPost).toHaveBeenCalledWith(
      `/admin/music-events/${HOUSE_SLUG}/invite-requests/request-7/approve`,
      undefined,
    );
  });

  it("refetches the door groups on the scope's interval", async () => {
    mocks.apiGet.mockResolvedValue(emptyAttendeesPage());
    const { queryClient, wrapper } = setup(MUSIC_ADMIN_TEST_SCOPE);
    renderHook(
      () =>
        useAttendeePages(
          HOUSE_SLUG,
          { status: "going", arrival: "expected" },
          { refetchIntervalMs: MUSIC_ADMIN_TEST_SCOPE.doorRefetchIntervalMs },
        ),
      { wrapper },
    );

    await waitFor(() =>
      expect(mocks.apiGet).toHaveBeenCalledWith(
        `/admin/music-events/${HOUSE_SLUG}/attendees?status=going&page=1&arrival=expected`,
      ),
    );
    const doorQuery = queryClient.getQueryCache().find({
      queryKey: [
        ...eventKeys.attendees(HOUSE_SLUG, false, "musicAdmin"),
        "pages",
      ],
    });
    expect(doorQuery?.observers[0]?.options.refetchInterval).toBe(10_000);
  });
});

describe("organizer hooks outside a scope", () => {
  it("keeps member paths and keys outside the scope", async () => {
    mocks.apiGet.mockResolvedValue({});
    const { queryClient, wrapper } = setup(null);
    renderHook(() => useEvent("brunch-ab12"), { wrapper });

    await waitFor(() =>
      expect(mocks.apiGet).toHaveBeenCalledWith("/events/brunch-ab12"),
    );
    const detailQueries = queryClient
      .getQueryCache()
      .findAll({ queryKey: eventKeys.detailRoot });
    expect(detailQueries.map((query) => query.queryKey)).toEqual([
      ["event", "brunch-ab12", false],
    ]);
  });
});
