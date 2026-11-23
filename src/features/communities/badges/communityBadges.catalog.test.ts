import { FiAward } from "react-icons/fi";
import { describe, expect, it } from "vitest";
import {
  COMMUNITY_BADGE_ICON_KEYS,
  COMMUNITY_BADGE_RULE_TYPES,
  COMMUNITY_BADGE_RULES,
  COMMUNITY_BADGE_STARTERS,
  COMMUNITY_FLAIR_TINTS,
  COMMUNITY_GIFTS,
  COMMUNITY_GIFT_KEYS,
  communityGiftOf,
  isCommunityBadgeIconKey,
  isCommunityBadgeStarterKey,
  isCommunityGiftKey,
  resolveCommunityFlairTint,
} from "./communityBadges.catalog";
import {
  COMMUNITY_BADGE_ICONS,
  communityBadgeIcon,
} from "./communityBadgeIcons";

describe("community badge catalogue", () => {
  it("holds 24 icon keys, 6 tints, 4 rules and 8 gifts", () => {
    expect(COMMUNITY_BADGE_ICON_KEYS).toHaveLength(24);
    expect(COMMUNITY_FLAIR_TINTS).toHaveLength(6);
    expect(COMMUNITY_BADGE_RULE_TYPES).toHaveLength(4);
    expect(COMMUNITY_GIFT_KEYS).toHaveLength(8);
    expect(COMMUNITY_GIFTS).toHaveLength(8);
  });

  it("keeps the starter set of the contract in order", () => {
    expect(COMMUNITY_BADGE_STARTERS.map((starter) => starter.key)).toEqual([
      "regular",
      "old_friend",
      "helping_hands",
      "in_the_conversation",
    ]);
    expect(COMMUNITY_BADGE_STARTERS[0]).toEqual({
      key: "regular",
      name: "Regular",
      ruleType: "events_checked_in",
      threshold: 3,
      iconKey: "calendar",
      tint: "jade",
    });
  });

  it("fits every starter threshold inside its rule range", () => {
    for (const starter of COMMUNITY_BADGE_STARTERS) {
      const range = COMMUNITY_BADGE_RULES[starter.ruleType];
      expect(starter.threshold).toBeGreaterThanOrEqual(range.min);
      expect(starter.threshold).toBeLessThanOrEqual(range.max);
    }
  });

  it("draws every gift icon and tint from the badge sets", () => {
    for (const gift of COMMUNITY_GIFTS) {
      expect(COMMUNITY_BADGE_ICON_KEYS).toContain(gift.iconKey);
      expect(COMMUNITY_FLAIR_TINTS).toContain(gift.tint);
    }
    expect(COMMUNITY_GIFTS.map((gift) => gift.key)).toEqual([
      ...COMMUNITY_GIFT_KEYS,
    ]);
  });

  it("falls back to jade for an unknown tint", () => {
    expect(resolveCommunityFlairTint("teal")).toBe("jade");
    expect(resolveCommunityFlairTint(undefined)).toBe("jade");
    expect(resolveCommunityFlairTint("plum")).toBe("plum");
  });

  it("recognises known keys and rejects unknown ones", () => {
    expect(isCommunityBadgeIconKey("moon")).toBe(true);
    expect(isCommunityBadgeIconKey("rocket")).toBe(false);
    expect(isCommunityBadgeStarterKey("old_friend")).toBe(true);
    expect(isCommunityBadgeStarterKey(null)).toBe(false);
    expect(isCommunityGiftKey("smile")).toBe(true);
    expect(communityGiftOf("sun")?.tint).toBe("amber");
    expect(communityGiftOf("rocket")).toBeUndefined();
  });

  it("draws an award for an unknown icon key", () => {
    expect(communityBadgeIcon("rocket")).toBe(FiAward);
  });

  it("maps every icon key to a react icon", () => {
    expect(
      COMMUNITY_BADGE_ICON_KEYS.every(
        (iconKey) => typeof COMMUNITY_BADGE_ICONS[iconKey] === "function",
      ),
    ).toBe(true);
  });
});
