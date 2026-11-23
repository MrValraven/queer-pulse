import { describe, expect, it } from "vitest";
import type {
  CommunityBadgeDTO,
  CommunityShelfGiftDTO,
} from "./api/communityBadges.api";
import {
  badgeProgressView,
  isMarkShowing,
  readBadgeSheetParams,
  withBadgeSheetClosed,
  withBadgeSheetOpen,
} from "./communityBadgeSheet.model";

const NOW = Date.parse("2026-11-23T12:00:00.000Z");

function badgeWith(overrides: Partial<CommunityBadgeDTO>): CommunityBadgeDTO {
  return {
    id: "b1",
    name: "In the conversation",
    starterKey: "in_the_conversation",
    iconKey: "message_circle",
    tint: "accent",
    ruleType: "posts_and_replies",
    threshold: 10,
    progress: 0,
    earnedAt: null,
    ...overrides,
  };
}

function giftWith(
  overrides: Partial<CommunityShelfGiftDTO>,
): CommunityShelfGiftDTO {
  return {
    id: "g1",
    giftKey: "heart",
    note: null,
    sender: null,
    sentAt: "2026-11-21T12:00:00.000Z",
    markEndsAt: "2026-11-28T12:00:00.000Z",
    isHidden: false,
    ...overrides,
  };
}

describe("readBadgeSheetParams", () => {
  it("opens on the badge list at badges=open", () => {
    expect(readBadgeSheetParams(new URLSearchParams("?badges=open"))).toEqual({
      isOpen: true,
      tab: "badges",
      focusBadgeId: null,
    });
  });

  it("opens on the shelf at badges=gifts with a focus id", () => {
    expect(
      readBadgeSheetParams(new URLSearchParams("?badges=gifts&badge=b1")),
    ).toEqual({ isOpen: true, tab: "gifts", focusBadgeId: "b1" });
  });

  it("stays closed for any other value", () => {
    expect(
      readBadgeSheetParams(new URLSearchParams("?badges=yes")).isOpen,
    ).toBe(false);
    expect(readBadgeSheetParams(new URLSearchParams("")).isOpen).toBe(false);
  });
});

describe("withBadgeSheetOpen and withBadgeSheetClosed", () => {
  it("keeps other params when it opens and drops both when it closes", () => {
    const opened = withBadgeSheetOpen(new URLSearchParams("?tab=pulse"));
    expect(opened.toString()).toBe("tab=pulse&badges=open");

    const focused = new URLSearchParams(opened);
    focused.set("badge", "b1");
    expect(withBadgeSheetClosed(focused).toString()).toBe("tab=pulse");
  });

  it("opens on the gifts tab when asked", () => {
    expect(
      withBadgeSheetOpen(new URLSearchParams(""), "gifts").toString(),
    ).toBe("badges=gifts");
  });
});

describe("badgeProgressView", () => {
  it("caps the progress ratio at one", () => {
    expect(
      badgeProgressView(
        badgeWith({ progress: 12, earnedAt: "2026-11-20T12:00:00.000Z" }),
      ),
    ).toEqual({ isEarned: true, progressCount: 12, ratio: 1 });
    expect(badgeProgressView(badgeWith({ progress: 4 }))).toEqual({
      isEarned: false,
      progressCount: 4,
      ratio: 0.4,
    });
  });

  it("answers null for a visitor", () => {
    expect(badgeProgressView(badgeWith({ progress: null }))).toBeNull();
  });
});

describe("isMarkShowing", () => {
  it("reads a hidden gift's mark as off", () => {
    expect(isMarkShowing(giftWith({ isHidden: true }), NOW)).toBe(false);
  });

  it("reads a visible gift inside its seven days as on", () => {
    expect(isMarkShowing(giftWith({}), NOW)).toBe(true);
  });

  it("reads an expired mark as off", () => {
    expect(
      isMarkShowing(giftWith({ markEndsAt: "2026-11-22T12:00:00.000Z" }), NOW),
    ).toBe(false);
  });
});
