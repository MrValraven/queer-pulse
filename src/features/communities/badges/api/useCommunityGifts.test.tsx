import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../../test/TestProviders";
import { resetCommunityBadgesDemo } from "../communityBadgesDemoStore";
import type { CommunityShelfGiftDTO } from "./communityBadges.api";
import { communityBadgeKeys } from "./communityBadgeKeys";
import {
  useCommunityGiftAllowance,
  useMyCommunityGifts,
} from "./useCommunityGifts";
import {
  useSendCommunityGift,
  useSetCommunityGiftHidden,
} from "./useCommunityGiftMutations";

const mocks = vi.hoisted(() => ({
  getMyCommunityGifts: vi.fn(),
  /** When set, every `useDemoMode` reader sees this mode. */
  demoOverride: { demoMode: null as boolean | null },
}));

vi.mock("./communityBadges.api", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  getMyCommunityGifts: mocks.getMyCommunityGifts,
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

function freshClient(): QueryClient {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
}

function wrapperFor(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <TestProviders queryClient={queryClient}>{children}</TestProviders>;
  };
}

function shelfGift(position: number): CommunityShelfGiftDTO {
  return {
    id: `gift-${position}`,
    giftKey: "heart",
    note: null,
    sender: null,
    sentAt: "2026-11-20T10:00:00.000Z",
    markEndsAt: "2026-11-27T10:00:00.000Z",
    isHidden: false,
  };
}

beforeEach(() => {
  mocks.getMyCommunityGifts.mockReset();
  mocks.demoOverride.demoMode = null;
  resetCommunityBadgesDemo();
});

describe("useCommunityGiftAllowance and useSendCommunityGift (demo mode)", () => {
  it("reads the demo allowance after this week's gifts", async () => {
    mocks.demoOverride.demoMode = true;
    const { result } = renderHook(() => useCommunityGiftAllowance(RUNNERS), {
      wrapper: wrapperFor(freshClient()),
    });

    await waitFor(() => expect(result.current.data).toBeDefined());
    expect(result.current.data?.limit).toBe(10);
    expect(result.current.data?.used).toBe(2);
    expect(result.current.data?.remaining).toBe(8);
  });

  it("writes the new allowance straight into the cache after a send", async () => {
    mocks.demoOverride.demoMode = true;
    const queryClient = freshClient();
    const { result } = renderHook(
      () => ({
        allowance: useCommunityGiftAllowance(RUNNERS),
        send: useSendCommunityGift(RUNNERS),
      }),
      { wrapper: wrapperFor(queryClient) },
    );
    await waitFor(() => expect(result.current.allowance.data).toBeDefined());

    let sentRemaining = -1;
    await act(async () => {
      const sent = await result.current.send.mutateAsync({
        recipientSlug: "monica",
        giftKey: "heart",
      });
      sentRemaining = sent.allowance.remaining;
    });

    const cachedAllowances = queryClient
      .getQueryCache()
      .findAll({ queryKey: communityBadgeKeys.all(RUNNERS) })
      .filter((query) => query.queryKey[2] === "allowance");
    expect(sentRemaining).toBe(7);
    expect(cachedAllowances).toHaveLength(1);
    expect(
      (cachedAllowances[0]!.state.data as { remaining: number }).remaining,
    ).toBe(7);
  });

  it("hides a demo gift on the shelf", async () => {
    mocks.demoOverride.demoMode = true;
    const { result } = renderHook(
      () => ({
        shelf: useMyCommunityGifts(RUNNERS),
        hide: useSetCommunityGiftHidden(RUNNERS),
      }),
      { wrapper: wrapperFor(freshClient()) },
    );
    await waitFor(() => expect(result.current.shelf.gifts.length).toBe(3));
    const heartGift = result.current.shelf.gifts.find(
      (gift) => gift.giftKey === "heart",
    )!;
    expect(heartGift.isHidden).toBe(false);

    await act(async () => {
      await result.current.hide.mutateAsync({
        giftId: heartGift.id,
        isHidden: true,
      });
    });

    await waitFor(() =>
      expect(
        result.current.shelf.gifts.find((gift) => gift.id === heartGift.id)
          ?.isHidden,
      ).toBe(true),
    );
  });
});

describe("useMyCommunityGifts (live mode)", () => {
  it("pages the live shelf to its total", async () => {
    mocks.demoOverride.demoMode = false;
    mocks.getMyCommunityGifts.mockImplementation(
      (_slug: string, page: number) =>
        Promise.resolve(
          page === 1
            ? {
                items: Array.from({ length: 20 }, (_, index) =>
                  shelfGift(index),
                ),
                total: 25,
                page: 1,
                pageSize: 20,
              }
            : {
                items: Array.from({ length: 5 }, (_, index) =>
                  shelfGift(20 + index),
                ),
                total: 25,
                page: 2,
                pageSize: 20,
              },
        ),
    );
    const { result } = renderHook(() => useMyCommunityGifts("club"), {
      wrapper: wrapperFor(freshClient()),
    });

    await waitFor(() => expect(result.current.gifts).toHaveLength(20));
    expect(result.current.hasNextPage).toBe(true);
    expect(mocks.getMyCommunityGifts).toHaveBeenCalledWith("club", 1);

    act(() => {
      result.current.fetchNextPage();
    });

    await waitFor(() => expect(result.current.gifts).toHaveLength(25));
    expect(result.current.hasNextPage).toBe(false);
    expect(mocks.getMyCommunityGifts).toHaveBeenLastCalledWith("club", 2);
  });
});
