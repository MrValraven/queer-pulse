import { beforeEach, describe, expect, it } from "vitest";
import { ApiError } from "../../../shared/api/client";
import { currentUserSlug } from "../../members/data/members";
import type { CommunityBadgesDemoViewer } from "./communityBadgesDemoStore";
import {
  demoCreateBadge,
  demoDeleteBadge,
  demoGetBadgeAdmin,
  demoGetBadges,
  demoGetGiftAllowance,
  demoListShelf,
  demoMemberDecor,
  demoMemberGifts,
  demoRemoveGift,
  demoSendGift,
  demoSetFlair,
  demoSetGiftHidden,
  demoUpdateBadge,
  getCommunityBadgesDemoVersion,
  resetCommunityBadgesDemo,
} from "./communityBadgesDemoStore";

const RUNNERS = "queer-runners";
const REGULAR_ID = "demo-badge-queer-runners-regular";
const OLD_FRIEND_ID = "demo-badge-queer-runners-old_friend";
const HELPING_HANDS_ID = "demo-badge-queer-runners-helping_hands";
const TRAIL_ID = "demo-badge-queer-runners-trail";

const member: CommunityBadgesDemoViewer = {
  viewerSlug: currentUserSlug,
  role: "member",
  isMember: true,
  isSpace: false,
};
const mod: CommunityBadgesDemoViewer = { ...member, role: "mod" };
const owner: CommunityBadgesDemoViewer = { ...member, role: "owner" };
const visitor: CommunityBadgesDemoViewer = {
  ...member,
  role: null,
  isMember: false,
};

/** Runs a store call that must refuse, and hands back what it threw. */
function refusalOf(call: () => unknown): ApiError {
  try {
    call();
  } catch (error) {
    if (error instanceof ApiError) return error;
    throw error;
  }
  throw new Error("expected the call to refuse");
}

function codeOf(call: () => unknown): unknown {
  return (refusalOf(call).data as { code?: unknown } | undefined)?.code;
}

function viewerShelf() {
  return demoListShelf(RUNNERS, member, 1).items;
}

describe("communityBadgesDemoStore badges", () => {
  beforeEach(() => {
    resetCommunityBadgesDemo();
  });

  it("seeds the four starters in catalog order with Sunrise club after them", () => {
    const badges = demoGetBadges(RUNNERS, member).badges;
    expect(badges.map((badge) => badge.starterKey)).toEqual([
      "regular",
      "old_friend",
      "helping_hands",
      "in_the_conversation",
      null,
    ]);
    expect(badges[4]?.name).toBe("Sunrise club");
    expect(badges.some((badge) => badge.name === "Trail crew")).toBe(false);
  });

  it("shows the viewer's progress and earned badges", () => {
    const badges = demoGetBadges(RUNNERS, member).badges;
    const regular = badges.find((badge) => badge.id === REGULAR_ID);
    const helpingHands = badges.find((badge) => badge.id === HELPING_HANDS_ID);
    expect(regular?.progress).toBe(4);
    expect(regular?.earnedAt).not.toBeNull();
    expect(helpingHands?.progress).toBe(2);
    expect(helpingHands?.earnedAt).toBeNull();
  });

  it("hides progress and earned dates from a visitor", () => {
    const response = demoGetBadges(RUNNERS, visitor);
    expect(response.isMember).toBe(false);
    expect(response.wornBadgeId).toBeNull();
    expect(response.badges.length).toBeGreaterThan(0);
    for (const badge of response.badges) {
      expect(badge.progress).toBeNull();
      expect(badge.earnedAt).toBeNull();
    }
  });

  it("wears an earned badge and shows it on the name line", () => {
    const versionBefore = getCommunityBadgesDemoVersion();
    const response = demoSetFlair(RUNNERS, member, REGULAR_ID);
    expect(response.wornBadgeId).toBe(REGULAR_ID);
    expect(response.flair?.starterKey).toBe("regular");
    expect(demoMemberDecor(RUNNERS, currentUserSlug).flair?.starterKey).toBe(
      "regular",
    );
    expect(demoGetBadges(RUNNERS, member).wornBadgeId).toBe(REGULAR_ID);
    expect(getCommunityBadgesDemoVersion()).toBeGreaterThan(versionBefore);
  });

  it("drops the viewer's worn badge and gift mark from the name line once they leave", () => {
    demoSetFlair(RUNNERS, member, REGULAR_ID);
    const stillMember = demoMemberDecor(RUNNERS, currentUserSlug, member);
    expect(stillMember.flair?.starterKey).toBe("regular");
    expect(stillMember.hasRecentGift).toBe(true);
    const afterLeave = demoMemberDecor(RUNNERS, currentUserSlug, visitor);
    expect(afterLeave).toEqual({ flair: null, hasRecentGift: false });
    expect(demoMemberDecor(RUNNERS, "monica", visitor).flair?.starterKey).toBe(
      "old_friend",
    );
  });

  it("refuses a badge the viewer has not earned", () => {
    expect(codeOf(() => demoSetFlair(RUNNERS, member, HELPING_HANDS_ID))).toBe(
      "flair_badge_not_earned",
    );
  });

  it("refuses to wear a switched-off badge", () => {
    expect(codeOf(() => demoSetFlair(RUNNERS, mod, TRAIL_ID))).toBe(
      "flair_badge_disabled",
    );
  });

  it("drops the worn badge from the name line while the badge is switched off", () => {
    expect(demoMemberDecor(RUNNERS, "monica").flair?.starterKey).toBe(
      "old_friend",
    );
    demoUpdateBadge(RUNNERS, mod, OLD_FRIEND_ID, { isEnabled: false });
    expect(demoMemberDecor(RUNNERS, "monica").flair).toBeNull();
  });

  it("brings it back when the badge is switched on again", () => {
    demoUpdateBadge(RUNNERS, mod, OLD_FRIEND_ID, { isEnabled: false });
    demoUpdateBadge(RUNNERS, mod, OLD_FRIEND_ID, { isEnabled: true });
    expect(demoMemberDecor(RUNNERS, "monica").flair?.starterKey).toBe(
      "old_friend",
    );
  });

  it("clears the worn badge when the badge is deleted", () => {
    const countBefore = demoGetBadgeAdmin(RUNNERS, mod).badges.find(
      (badge) => badge.id === REGULAR_ID,
    )?.holderCount;
    expect(demoMemberDecor(RUNNERS, "carla").flair?.starterKey).toBe("regular");
    const result = demoDeleteBadge(RUNNERS, mod, REGULAR_ID);
    expect(result).toEqual({ id: REGULAR_ID, holderCount: countBefore });
    expect(countBefore).toBe(5);
    expect(demoMemberDecor(RUNNERS, "carla").flair).toBeNull();
    expect(codeOf(() => demoSetFlair(RUNNERS, member, REGULAR_ID))).toBe(
      "badge_not_found",
    );
  });

  it("lets a demo mod manage badges", () => {
    const response = demoGetBadgeAdmin(RUNNERS, mod);
    expect(response.canManage).toBe(true);
    expect(response.limit).toBe(12);
    expect(response.badges).toHaveLength(6);
    expect(
      response.badges.find((badge) => badge.id === TRAIL_ID),
    ).toMatchObject({ isEnabled: false, holderCount: 1 });
  });

  it("refuses badge settings to a plain member", () => {
    const refusal = refusalOf(() => demoGetBadgeAdmin(RUNNERS, member));
    expect(refusal.status).toBe(403);
    expect((refusal.data as { code: string }).code).toBe(
      "badge_settings_staff_only",
    );
  });

  it("refuses a thirteenth badge", () => {
    for (let index = 1; index <= 6; index += 1) {
      demoCreateBadge(RUNNERS, mod, {
        name: `Club ${index}`,
        iconKey: "star",
        tint: "jade",
        ruleType: "posts_and_replies",
        threshold: 50,
      });
    }
    expect(demoGetBadgeAdmin(RUNNERS, mod).badges).toHaveLength(12);
    const refusal = refusalOf(() =>
      demoCreateBadge(RUNNERS, mod, {
        name: "Club 13",
        iconKey: "star",
        tint: "jade",
        ruleType: "posts_and_replies",
        threshold: 50,
      }),
    );
    expect(refusal.data).toMatchObject({
      code: "badge_limit_reached",
      limit: 12,
    });
  });

  it("refuses a name another badge holds in any case", () => {
    expect(
      codeOf(() =>
        demoCreateBadge(RUNNERS, mod, {
          name: "regular",
          iconKey: "star",
          tint: "jade",
          ruleType: "posts_and_replies",
          threshold: 50,
        }),
      ),
    ).toBe("badge_name_taken");
  });

  it("refuses a threshold outside its rule range with the range", () => {
    const refusal = refusalOf(() =>
      demoCreateBadge(RUNNERS, mod, {
        name: "Newcomer",
        iconKey: "star",
        tint: "jade",
        ruleType: "tenure_days",
        threshold: 10,
      }),
    );
    expect(refusal.data).toMatchObject({
      code: "badge_threshold_out_of_range",
      ruleType: "tenure_days",
      min: 30,
      max: 3650,
    });
  });

  it("refuses to change how a badge is earned", () => {
    expect(
      codeOf(() =>
        demoUpdateBadge(RUNNERS, mod, REGULAR_ID, { ruleType: "tenure_days" }),
      ),
    ).toBe("badge_rule_locked");
  });
});

describe("communityBadgesDemoStore gifts and spaces", () => {
  beforeEach(() => {
    resetCommunityBadgesDemo();
  });

  it("counts this week's gifts toward the allowance", () => {
    const allowance = demoGetGiftAllowance(RUNNERS, mod);
    expect(allowance).toMatchObject({ limit: 10, used: 2, remaining: 8 });
    expect(allowance.resetsAt).not.toBeNull();
  });

  it("refuses the eleventh gift in seven days with its reset time", () => {
    for (let index = 0; index < 8; index += 1) {
      demoSendGift(RUNNERS, mod, { recipientSlug: "sofia", giftKey: "star" });
    }
    expect(demoGetGiftAllowance(RUNNERS, mod).remaining).toBe(0);
    const refusal = refusalOf(() =>
      demoSendGift(RUNNERS, mod, { recipientSlug: "sofia", giftKey: "star" }),
    );
    expect(refusal.status).toBe(429);
    expect(refusal.data).toMatchObject({
      code: "gift_weekly_limit_reached",
      limit: 10,
    });
    expect(typeof (refusal.data as { resetsAt?: unknown }).resetsAt).toBe(
      "string",
    );
  });

  it("refuses a gift to yourself and to someone off the roster", () => {
    expect(
      codeOf(() =>
        demoSendGift(RUNNERS, mod, {
          recipientSlug: currentUserSlug,
          giftKey: "heart",
        }),
      ),
    ).toBe("gift_to_self");
    expect(
      codeOf(() =>
        demoSendGift(RUNNERS, mod, {
          recipientSlug: "catarina-vaz",
          giftKey: "heart",
        }),
      ),
    ).toBe("gift_recipient_not_member");
  });

  it("refuses a note that is not text", () => {
    expect(
      codeOf(() =>
        demoSendGift(RUNNERS, mod, {
          recipientSlug: "sofia",
          giftKey: "heart",
          note: 42 as unknown as string,
        }),
      ),
    ).toBe("gift_note_invalid");
  });

  it("shows a gift mark for seven days unless hidden", () => {
    expect(demoMemberDecor(RUNNERS, "sofia").hasRecentGift).toBe(true);
    expect(demoMemberDecor(RUNNERS, "kai").hasRecentGift).toBe(true);
    expect(demoMemberDecor(RUNNERS, currentUserSlug).hasRecentGift).toBe(true);
    const heart = viewerShelf().find((gift) => gift.giftKey === "heart");
    expect(heart).toBeDefined();
    demoSetGiftHidden(RUNNERS, member, heart?.id ?? "", true);
    expect(demoMemberDecor(RUNNERS, currentUserSlug).hasRecentGift).toBe(false);
  });

  it("keeps hidden gifts on the shelf and leaves removed ones out", () => {
    const shelf = viewerShelf();
    expect(shelf.find((gift) => gift.giftKey === "music")?.isHidden).toBe(true);
    const coffee = shelf.find((gift) => gift.giftKey === "coffee");
    expect(coffee?.sender?.slug).toBe("monica");
    const coffeeId = coffee?.id ?? "";
    demoRemoveGift(RUNNERS, owner, coffeeId);
    expect(viewerShelf().some((gift) => gift.id === coffeeId)).toBe(false);
    expect(
      codeOf(() => demoSetGiftHidden(RUNNERS, member, coffeeId, true)),
    ).toBe("gift_not_found");
    expect(codeOf(() => demoRemoveGift(RUNNERS, owner, coffeeId))).toBe(
      "gift_not_found",
    );
  });

  it("lets only the sender or owner-level remove a gift", () => {
    const heartId =
      viewerShelf().find((gift) => gift.giftKey === "heart")?.id ?? "";
    expect(codeOf(() => demoRemoveGift(RUNNERS, member, heartId))).toBe(
      "gift_remove_not_allowed",
    );
    const sentToKai = demoMemberGifts(RUNNERS, member, "kai").gifts[0];
    expect(sentToKai?.canRemove).toBe(true);
    expect(demoRemoveGift(RUNNERS, member, sentToKai?.id ?? "")).toEqual({
      id: sentToKai?.id,
    });
  });

  it("lists a member's visible marks without sender or note", () => {
    const gifts = demoMemberGifts(RUNNERS, member, "sofia").gifts;
    expect(gifts).toHaveLength(1);
    expect(Object.keys(gifts[0] ?? {}).sort()).toEqual([
      "canRemove",
      "giftKey",
      "id",
      "sentAt",
    ]);
    expect(gifts[0]?.giftKey).toBe("star");
    expect(gifts[0]?.canRemove).toBe(false);
  });

  it("refuses every call in a space with the space code", () => {
    const inSpace: CommunityBadgesDemoViewer = { ...mod, isSpace: true };
    const calls: (() => unknown)[] = [
      () => demoGetBadges(RUNNERS, inSpace),
      () => demoGetBadgeAdmin(RUNNERS, inSpace),
      () => demoSetFlair(RUNNERS, inSpace, null),
      () => demoGetGiftAllowance(RUNNERS, inSpace),
      () =>
        demoSendGift(RUNNERS, inSpace, {
          recipientSlug: "sofia",
          giftKey: "heart",
        }),
      () => demoListShelf(RUNNERS, inSpace, 1),
      () => demoMemberGifts(RUNNERS, inSpace, "sofia"),
    ];
    for (const call of calls) {
      expect(codeOf(call)).toBe("SUBCOMMUNITY_FEATURE_UNAVAILABLE");
    }
  });
});
