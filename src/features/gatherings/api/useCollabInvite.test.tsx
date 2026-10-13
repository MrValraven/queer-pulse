import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createFormatters } from "../../../shared/i18n/format";
import { DEMO_COLLAB_INVITE } from "../collabInvite.data";
import {
  DEMO_GATHERING_SLUGS,
  gatheringDetails,
  type GatheringDetail,
} from "../data";
import { demoGuestCommunitiesFor } from "../eventGuestCommunities.data";
import { demoInitialState } from "../manageGatheringState";
import type { EventCommunityInviteDetailDTO } from "./eventCommunities.api";
import { eventKeys } from "./eventKeys";
import type { EventResult } from "./useEvent";
import {
  useCollabInvite,
  useLeaveCollab,
  useRespondCollabInvite,
  useSyncAfterLeaveCollab,
} from "./useCollabInvite";

const harness = vi.hoisted(() => ({
  isDemoMode: true,
  getCollabInvite: vi.fn(),
  respondCollabInvite: vi.fn(),
  leaveCollab: vi.fn(),
}));

vi.mock("../../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({
    demoMode: harness.isDemoMode,
    available: true,
    setDemoMode: () => {},
    toggle: () => {},
  }),
}));

vi.mock("./eventCommunities.api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./eventCommunities.api")>()),
  getCollabInvite: harness.getCollabInvite,
  respondCollabInvite: harness.respondCollabInvite,
  leaveCollab: harness.leaveCollab,
}));

const LIVE_PENDING_INVITE: EventCommunityInviteDetailDTO = {
  ...DEMO_COLLAB_INVITE,
  id: "invite-1",
};

const LIVE_ANSWERED_INVITE: EventCommunityInviteDetailDTO = {
  ...LIVE_PENDING_INVITE,
  status: "accepted",
  respondedByName: "Rui",
  canRespond: false,
};

let queryClient: QueryClient;

function wrapper({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

/** The cached detail a gathering page reads, as `useEvent` keys it. */
function seedDetail(slug: string, isDemoMode: boolean): void {
  queryClient.setQueryData<EventResult>(eventKeys.detail(slug, isDemoMode), {
    gathering: gatheringDetails[slug] as GatheringDetail,
  });
}

function cachedGuestSlugs(slug: string, isDemoMode: boolean): string[] {
  const cached = queryClient.getQueryData<EventResult>(
    eventKeys.detail(slug, isDemoMode),
  );
  return (cached?.gathering.guestCommunities ?? []).map((guest) => guest.slug);
}

beforeEach(() => {
  harness.isDemoMode = true;
  queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
});

afterEach(() => {
  harness.getCollabInvite.mockReset();
  harness.respondCollabInvite.mockReset();
  harness.leaveCollab.mockReset();
  queryClient.clear();
});

describe("useRespondCollabInvite in demo mode", () => {
  it("keeps the invite answered after the hosting readers refresh", async () => {
    const { result } = renderHook(
      () => ({
        invite: useCollabInvite("collab-portfolio-night"),
        respond: useRespondCollabInvite(),
      }),
      { wrapper },
    );
    await waitFor(() =>
      expect(result.current.invite.data?.status).toBe("pending"),
    );
    await act(async () => {
      await result.current.respond.mutateAsync({
        id: "collab-portfolio-night",
        decision: "accept",
      });
    });
    await waitFor(() =>
      expect(result.current.invite.data?.status).toBe("accepted"),
    );
    expect(result.current.invite.data?.canRespond).toBe(false);
  });
});

describe("useRespondCollabInvite in live mode", () => {
  it("refetches the invite when the answer is refused, so the page shows who answered", async () => {
    harness.isDemoMode = false;
    harness.getCollabInvite
      .mockResolvedValueOnce(LIVE_PENDING_INVITE)
      .mockResolvedValue(LIVE_ANSWERED_INVITE);
    harness.respondCollabInvite.mockRejectedValue(new Error("Conflict"));
    const { result } = renderHook(
      () => ({
        invite: useCollabInvite("invite-1"),
        respond: useRespondCollabInvite(),
      }),
      { wrapper },
    );
    await waitFor(() =>
      expect(result.current.invite.data?.status).toBe("pending"),
    );
    await act(async () => {
      await expect(
        result.current.respond.mutateAsync({
          id: "invite-1",
          decision: "accept",
        }),
      ).rejects.toThrow("Conflict");
    });
    await waitFor(() =>
      expect(result.current.invite.data?.status).toBe("accepted"),
    );
    expect(harness.getCollabInvite).toHaveBeenCalledTimes(2);
  });
});

describe("useLeaveCollab", () => {
  it("refetches the live invite when the removal is refused", async () => {
    harness.isDemoMode = false;
    harness.getCollabInvite
      .mockResolvedValueOnce(LIVE_PENDING_INVITE)
      .mockResolvedValue(LIVE_ANSWERED_INVITE);
    harness.leaveCollab.mockRejectedValue(new Error("Conflict"));
    const { result } = renderHook(
      () => ({
        invite: useCollabInvite("invite-1"),
        leave: useLeaveCollab(),
      }),
      { wrapper },
    );
    await waitFor(() =>
      expect(result.current.invite.data?.status).toBe("pending"),
    );
    await act(async () => {
      await expect(
        result.current.leave.mutateAsync({ id: "invite-1" }),
      ).rejects.toThrow("Conflict");
    });
    await waitFor(() =>
      expect(harness.getCollabInvite).toHaveBeenCalledTimes(2),
    );
  });

  it("drops the guest from the cached gathering detail in demo mode", async () => {
    seedDetail("queer-runners-run", true);
    const { result } = renderHook(() => useLeaveCollab(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync({
        id: "demo-collab-trans-hub-run",
        eventSlug: "queer-runners-run",
      });
    });
    expect(cachedGuestSlugs("queer-runners-run", true)).toEqual([]);
    expect(harness.leaveCollab).not.toHaveBeenCalled();
  });

  it("drops the guest from the cached detail in live mode before any refetch", async () => {
    harness.isDemoMode = false;
    harness.leaveCollab.mockResolvedValue(undefined);
    seedDetail("queer-runners-run", false);
    seedDetail("portfolio-night", false);
    const { result } = renderHook(() => useLeaveCollab(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync({
        id: "demo-collab-trans-hub-run",
        eventSlug: "queer-runners-run",
      });
    });
    expect(harness.leaveCollab).toHaveBeenCalledWith(
      "demo-collab-trans-hub-run",
    );
    expect(cachedGuestSlugs("queer-runners-run", false)).toEqual([]);
    expect(cachedGuestSlugs("portfolio-night", false)).toEqual([
      "queer-runners",
    ]);
  });
});

describe("useLeaveCollab with the sync left to its caller", () => {
  it("keeps the guest in the cached detail until the caller syncs", async () => {
    seedDetail("queer-runners-run", true);
    const { result } = renderHook(
      () => ({
        leave: useLeaveCollab({ shouldSyncOnSuccess: false }),
        syncAfterLeave: useSyncAfterLeaveCollab(),
      }),
      { wrapper },
    );
    const variables = {
      id: "demo-collab-trans-hub-run",
      eventSlug: "queer-runners-run",
    };
    await act(async () => {
      await result.current.leave.mutateAsync(variables);
    });
    expect(cachedGuestSlugs("queer-runners-run", true)).toEqual(["trans-hub"]);
    act(() => result.current.syncAfterLeave(variables));
    expect(cachedGuestSlugs("queer-runners-run", true)).toEqual([]);
  });
});

describe("the demo collab invite and its gathering", () => {
  it("opens a gathering with the invite's title, start, lead and guest", () => {
    const gathering = gatheringDetails[DEMO_COLLAB_INVITE.event.slug];
    expect(gathering?.title).toBe(DEMO_COLLAB_INVITE.event.title);
    expect(gathering?.date.toISOString()).toBe(
      DEMO_COLLAB_INVITE.event.startAt,
    );
    expect(gathering?.community?.name).toBe(
      DEMO_COLLAB_INVITE.leadCommunity?.name,
    );
    expect(gathering?.guestCommunities?.map((guest) => guest.slug)).toContain(
      DEMO_COLLAB_INVITE.community.slug,
    );
  });

  it("leads the demo Manage gathering with a community apart from its guests", () => {
    const managed = gatheringDetails["pride-brunch-jun"];
    expect(managed?.communitySlug).toBe("queer-runners");
    expect(
      demoGuestCommunitiesFor("pride-brunch-jun").map(
        (guest) => guest.community.slug,
      ),
    ).not.toContain(managed?.communitySlug);
  });

  it("opens the demo Manage page on that gathering's lead", () => {
    const seeded = demoInitialState(createFormatters("en-GB"), (key) => key);
    expect(seeded.communitySlug).toBe(
      gatheringDetails[DEMO_GATHERING_SLUGS.manage]?.communitySlug,
    );
    expect(seeded.communitySlug).toBe("queer-runners");
  });
});
