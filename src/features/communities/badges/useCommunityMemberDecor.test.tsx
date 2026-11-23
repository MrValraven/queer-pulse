import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { currentUserSlug } from "../../members/data/members";
import type { CommunityFlairDTO } from "./api/communityBadges.api";
import {
  demoSetFlair,
  resetCommunityBadgesDemo,
  type CommunityBadgesDemoViewer,
} from "./communityBadgesDemoStore";
import { useCommunityMemberDecor } from "./useCommunityMemberDecor";

const mocks = vi.hoisted(() => ({
  /** When set, every `useDemoMode` reader sees this mode. */
  demoOverride: { demoMode: null as boolean | null },
}));

vi.mock("../../../app/providers/DemoModeProvider", async (importOriginal) => {
  const original =
    await importOriginal<
      typeof import("../../../app/providers/DemoModeProvider")
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
});

const RUNNERS = "queer-runners";
const REGULAR_ID = "demo-badge-queer-runners-regular";

const demoViewer: CommunityBadgesDemoViewer = {
  viewerSlug: currentUserSlug,
  role: "member",
  isMember: true,
  isSpace: false,
};

const liveFlair: CommunityFlairDTO = {
  name: "Trail crew",
  starterKey: null,
  iconKey: "star",
  tint: "coral",
};

beforeEach(() => {
  mocks.demoOverride.demoMode = null;
  resetCommunityBadgesDemo();
});

describe("useCommunityMemberDecor", () => {
  it("reads the live fields off the member", () => {
    mocks.demoOverride.demoMode = false;
    const { result } = renderHook(
      () =>
        useCommunityMemberDecor("club", {
          slug: "ana",
          flair: liveFlair,
          hasRecentGift: true,
        }),
      { wrapper: TestProviders },
    );

    expect(result.current.flair).toEqual(liveFlair);
    expect(result.current.hasRecentGift).toBe(true);
  });

  it("answers none for a live member the backend sent no fields for", () => {
    mocks.demoOverride.demoMode = false;
    const { result } = renderHook(
      () => useCommunityMemberDecor("club", { slug: "ana" }),
      { wrapper: TestProviders },
    );

    expect(result.current).toEqual({ flair: null, hasRecentGift: false });
  });

  it("joins the demo store by member slug", () => {
    mocks.demoOverride.demoMode = true;
    const { result } = renderHook(
      () => useCommunityMemberDecor(RUNNERS, { slug: "monica" }),
      { wrapper: TestProviders },
    );

    expect(result.current.flair?.starterKey).toBe("old_friend");
  });

  it("re-renders when the demo store changes", () => {
    mocks.demoOverride.demoMode = true;
    const { result } = renderHook(
      () => useCommunityMemberDecor(RUNNERS, { slug: currentUserSlug }),
      { wrapper: TestProviders },
    );
    expect(result.current.flair).toBeNull();

    act(() => {
      demoSetFlair(RUNNERS, demoViewer, REGULAR_ID);
    });

    expect(result.current.flair?.starterKey).toBe("regular");

    act(() => {
      demoSetFlair(RUNNERS, demoViewer, null);
    });

    expect(result.current.flair).toBeNull();
  });

  it("answers none for a member without a slug", () => {
    mocks.demoOverride.demoMode = true;
    const { result: demoResult } = renderHook(
      () => useCommunityMemberDecor(RUNNERS, {}),
      { wrapper: TestProviders },
    );
    expect(demoResult.current).toEqual({ flair: null, hasRecentGift: false });

    mocks.demoOverride.demoMode = false;
    const { result: liveResult } = renderHook(
      () =>
        useCommunityMemberDecor("club", {
          flair: liveFlair,
          hasRecentGift: true,
        }),
      { wrapper: TestProviders },
    );
    expect(liveResult.current).toEqual({ flair: null, hasRecentGift: false });
  });
});
