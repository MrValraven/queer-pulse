import type { ReactNode } from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../../../shared/api/client";
import { TestProviders } from "../../../../test/TestProviders";
import { useCommunityMembership } from "../../../../app/providers/useCommunityMembership";
import { currentUserSlug } from "../../../members/data/members";
import { DEMO_SPACE_PARENTS_SLUG } from "../../spaces.data";
import {
  demoMemberDecor,
  resetCommunityBadgesDemo,
} from "../communityBadgesDemoStore";
import { useCommunityBadges } from "./useCommunityBadges";
import {
  useCreateCommunityBadge,
  useWearCommunityBadge,
} from "./useCommunityBadgeMutations";

const mocks = vi.hoisted(() => ({
  putCommunityFlair: vi.fn(),
  createCommunityBadge: vi.fn(),
  /** When set, every `useDemoMode` reader sees this mode. */
  demoOverride: { demoMode: null as boolean | null },
}));

vi.mock("./communityBadges.api", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  putCommunityFlair: mocks.putCommunityFlair,
  createCommunityBadge: mocks.createCommunityBadge,
}));

vi.mock(
  "../../../../app/providers/DemoModeProvider",
  async (importOriginal) => {
    const original =
      await importOriginal<
        typeof import("../../../../app/providers/DemoModeProvider")
      >();
    return {
      ...original,
      useDemoMode: () => {
        const value = original.useDemoMode();
        const overrideMode = mocks.demoOverride.demoMode;
        return overrideMode === null
          ? value
          : { ...value, demoMode: overrideMode };
      },
    };
  },
);

const RUNNERS = "queer-runners";
const REGULAR_ID = "demo-badge-queer-runners-regular";

function newQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
}

function wrapperFor(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <TestProviders queryClient={queryClient}>{children}</TestProviders>;
  };
}

beforeEach(() => {
  resetCommunityBadgesDemo();
  mocks.putCommunityFlair.mockReset();
  mocks.createCommunityBadge.mockReset();
  mocks.demoOverride.demoMode = null;
});

describe("community badge hooks (demo mode)", () => {
  beforeEach(() => {
    mocks.demoOverride.demoMode = true;
  });

  it("reads the demo badges for the demo viewer", async () => {
    const { result } = renderHook(() => useCommunityBadges(RUNNERS), {
      wrapper: wrapperFor(newQueryClient()),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.isMember).toBe(true);
    expect(result.current.data?.badges).toHaveLength(5);
  });

  it("wears a demo badge and updates the store", async () => {
    const { result } = renderHook(() => useWearCommunityBadge(), {
      wrapper: wrapperFor(newQueryClient()),
    });

    await act(async () => {
      await result.current.mutateAsync({ slug: RUNNERS, badgeId: REGULAR_ID });
    });

    expect(demoMemberDecor(RUNNERS, currentUserSlug).flair).not.toBeNull();
    expect(mocks.putCommunityFlair).not.toHaveBeenCalled();
  });

  it("re-reads the sheet query after a demo wear", async () => {
    const { result } = renderHook(
      () => ({
        badges: useCommunityBadges(RUNNERS),
        wear: useWearCommunityBadge(),
      }),
      { wrapper: wrapperFor(newQueryClient()) },
    );
    await waitFor(() => expect(result.current.badges.isSuccess).toBe(true));
    expect(result.current.badges.data?.wornBadgeId).toBeNull();

    await act(async () => {
      await result.current.wear.mutateAsync({
        slug: RUNNERS,
        badgeId: REGULAR_ID,
      });
    });

    await waitFor(() =>
      expect(result.current.badges.data?.wornBadgeId).toBe(REGULAR_ID),
    );
  });

  it("shows the visitor view after a demo leave and the member view after a join", async () => {
    const { result } = renderHook(
      () => ({
        badges: useCommunityBadges(RUNNERS),
        membership: useCommunityMembership(),
      }),
      { wrapper: wrapperFor(newQueryClient()) },
    );
    await waitFor(() =>
      expect(result.current.badges.data?.isMember).toBe(true),
    );

    act(() => {
      result.current.membership.leave(RUNNERS);
    });
    await waitFor(() =>
      expect(result.current.badges.data?.isMember).toBe(false),
    );
    expect(result.current.badges.data?.badges[0]?.progress).toBeNull();

    act(() => {
      result.current.membership.join(RUNNERS);
    });
    await waitFor(() =>
      expect(result.current.badges.data?.isMember).toBe(true),
    );
  });

  it("surfaces the space refusal as the query error", async () => {
    const { result } = renderHook(
      () => useCommunityBadges(DEMO_SPACE_PARENTS_SLUG),
      { wrapper: wrapperFor(newQueryClient()) },
    );

    await waitFor(() => expect(result.current.isError).toBe(true));

    const error = result.current.error;
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).data).toMatchObject({
      code: "SUBCOMMUNITY_FEATURE_UNAVAILABLE",
    });
  });
});

describe("community badge hooks (live mode)", () => {
  beforeEach(() => {
    mocks.demoOverride.demoMode = false;
  });

  it("sends the wear to the flair route live", async () => {
    mocks.putCommunityFlair.mockResolvedValue({
      wornBadgeId: "b1",
      flair: null,
    });
    const { result } = renderHook(() => useWearCommunityBadge(), {
      wrapper: wrapperFor(newQueryClient()),
    });

    await act(async () => {
      await result.current.mutateAsync({ slug: "club", badgeId: "b1" });
    });

    expect(mocks.putCommunityFlair).toHaveBeenCalledWith("club", "b1");
  });

  it("re-reads the roster and posts after a live wear", async () => {
    mocks.putCommunityFlair.mockResolvedValue({
      wornBadgeId: null,
      flair: null,
    });
    const queryClient = newQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useWearCommunityBadge(), {
      wrapper: wrapperFor(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync({ slug: "club", badgeId: null });
    });

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["roster", "club"],
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["community-posts", "club"],
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["community-badges", "club"],
    });
  });

  it("re-reads the badge lists after a create", async () => {
    mocks.createCommunityBadge.mockResolvedValue({ id: "b2" });
    const queryClient = newQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useCreateCommunityBadge("club"), {
      wrapper: wrapperFor(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync({
        name: "Trail crew",
        iconKey: "award",
        tint: "jade",
        ruleType: "tenure_days",
        threshold: 7,
      });
    });

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["community-badges", "club"],
    });
    expect(invalidateSpy).not.toHaveBeenCalledWith({
      queryKey: ["roster", "club"],
    });
  });
});
