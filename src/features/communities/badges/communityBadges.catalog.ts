/**
 * Frontend mirror of the backend's community badge catalogues
 * (`src/community-badges/community-badges.catalog.ts`). Same names, same
 * values. A change on either side lands in both, and the contract file
 * `QUEERPULSE-COMMUNITY-BADGES-CONTRACT-2026-11-22.md` section 2 is the
 * reference.
 *
 * Wire DTOs type `iconKey` and `tint` as plain strings. A key this build does
 * not know renders as an award in jade (`communityBadgeIcon`,
 * `resolveCommunityFlairTint`), so a newer backend never breaks an older
 * frontend.
 */

export const COMMUNITY_BADGE_LIMIT = 12;
/** Code points, after sanitise and trim. */
export const COMMUNITY_BADGE_NAME_MAX_LENGTH = 32;
/** Code points, after sanitise and trim. */
export const COMMUNITY_GIFT_NOTE_MAX_LENGTH = 140;
/** Gifts one sender may send in one community inside the window. */
export const COMMUNITY_GIFT_WEEKLY_LIMIT = 10;
/** Cap window and gift-mark window, in days. */
export const COMMUNITY_GIFT_WINDOW_DAYS = 7;

export const COMMUNITY_BADGE_ICON_KEYS = [
  "award",
  "star",
  "heart",
  "sun",
  "moon",
  "zap",
  "feather",
  "coffee",
  "music",
  "headphones",
  "mic",
  "book_open",
  "camera",
  "film",
  "pen_tool",
  "smile",
  "compass",
  "map_pin",
  "flag",
  "calendar",
  "clock",
  "users",
  "message_circle",
  "life_buoy",
] as const;
export type CommunityBadgeIconKey = (typeof COMMUNITY_BADGE_ICON_KEYS)[number];

export const COMMUNITY_FLAIR_TINTS = [
  "jade",
  "accent",
  "plum",
  "rose",
  "amber",
  "violet",
] as const;
export type CommunityFlairTint = (typeof COMMUNITY_FLAIR_TINTS)[number];

export const COMMUNITY_BADGE_RULE_TYPES = [
  "tenure_days",
  "events_checked_in",
  "volunteer_hours",
  "posts_and_replies",
] as const;
export type CommunityBadgeRuleType =
  (typeof COMMUNITY_BADGE_RULE_TYPES)[number];

/** The inclusive threshold range each rule accepts. */
export const COMMUNITY_BADGE_RULES: Record<
  CommunityBadgeRuleType,
  { min: number; max: number }
> = {
  tenure_days: { min: 30, max: 3650 },
  events_checked_in: { min: 1, max: 500 },
  volunteer_hours: { min: 1, max: 1000 },
  posts_and_replies: { min: 1, max: 5000 },
};

export const COMMUNITY_BADGE_STARTER_KEYS = [
  "regular",
  "old_friend",
  "helping_hands",
  "in_the_conversation",
] as const;
export type CommunityBadgeStarterKey =
  (typeof COMMUNITY_BADGE_STARTER_KEYS)[number];

export interface CommunityBadgeStarter {
  key: CommunityBadgeStarterKey;
  /** The English name the backend seeds. It is stored literally and editable. */
  name: string;
  ruleType: CommunityBadgeRuleType;
  threshold: number;
  iconKey: CommunityBadgeIconKey;
  tint: CommunityFlairTint;
}

export const COMMUNITY_BADGE_STARTERS: readonly CommunityBadgeStarter[] = [
  {
    key: "regular",
    name: "Regular",
    ruleType: "events_checked_in",
    threshold: 3,
    iconKey: "calendar",
    tint: "jade",
  },
  {
    key: "old_friend",
    name: "Old friend",
    ruleType: "tenure_days",
    threshold: 365,
    iconKey: "clock",
    tint: "plum",
  },
  {
    key: "helping_hands",
    name: "Helping hands",
    ruleType: "volunteer_hours",
    threshold: 5,
    iconKey: "life_buoy",
    tint: "amber",
  },
  {
    key: "in_the_conversation",
    name: "In the conversation",
    ruleType: "posts_and_replies",
    threshold: 10,
    iconKey: "message_circle",
    tint: "accent",
  },
];

export const COMMUNITY_GIFT_KEYS = [
  "heart",
  "star",
  "coffee",
  "feather",
  "sun",
  "life_buoy",
  "music",
  "smile",
] as const;
export type CommunityGiftKey = (typeof COMMUNITY_GIFT_KEYS)[number];

export interface CommunityGiftEntry {
  key: CommunityGiftKey;
  iconKey: CommunityBadgeIconKey;
  tint: CommunityFlairTint;
}

/** Names are copy keyed by `key`; icons come from the badge icon map. */
export const COMMUNITY_GIFTS: readonly CommunityGiftEntry[] = [
  { key: "heart", iconKey: "heart", tint: "rose" },
  { key: "star", iconKey: "star", tint: "amber" },
  { key: "coffee", iconKey: "coffee", tint: "accent" },
  { key: "feather", iconKey: "feather", tint: "violet" },
  { key: "sun", iconKey: "sun", tint: "amber" },
  { key: "life_buoy", iconKey: "life_buoy", tint: "jade" },
  { key: "music", iconKey: "music", tint: "plum" },
  { key: "smile", iconKey: "smile", tint: "jade" },
];

export function isCommunityBadgeIconKey(
  value: string,
): value is CommunityBadgeIconKey {
  return (COMMUNITY_BADGE_ICON_KEYS as readonly string[]).includes(value);
}

export function isCommunityFlairTint(
  value: string,
): value is CommunityFlairTint {
  return (COMMUNITY_FLAIR_TINTS as readonly string[]).includes(value);
}

export function isCommunityBadgeStarterKey(
  value: unknown,
): value is CommunityBadgeStarterKey {
  return (
    typeof value === "string" &&
    (COMMUNITY_BADGE_STARTER_KEYS as readonly string[]).includes(value)
  );
}

export function isCommunityGiftKey(value: string): value is CommunityGiftKey {
  return (COMMUNITY_GIFT_KEYS as readonly string[]).includes(value);
}

/** An unknown or missing tint renders as jade. */
export function resolveCommunityFlairTint(
  tint: string | undefined,
): CommunityFlairTint {
  return tint !== undefined && isCommunityFlairTint(tint) ? tint : "jade";
}

export function communityGiftOf(
  giftKey: string,
): CommunityGiftEntry | undefined {
  return COMMUNITY_GIFTS.find((gift) => gift.key === giftKey);
}
