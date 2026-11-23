import type {
  CommunityBadgeIconKey,
  CommunityBadgeRuleType,
  CommunityFlairTint,
} from "./communityBadges.catalog";
import { isCommunityGiftKey } from "./communityBadges.catalog";

/** The catalog keys of one rule's lines. `earnKey` and `progressKey` are
 *  plural bases: call `t(key, { count, progress })` and the `_one` / `_other`
 *  form resolves. */
interface CommunityBadgeRuleCopy {
  nameKey: string;
  earnKey: string;
  progressKey: string;
  thresholdLabelKey: string;
  unitKey: string;
}

function ruleCopyKeys(
  ruleType: CommunityBadgeRuleType,
): CommunityBadgeRuleCopy {
  const prefix = `communities:badges.rule.${ruleType}`;
  return {
    nameKey: `${prefix}.name`,
    earnKey: `${prefix}.earn`,
    progressKey: `${prefix}.progress`,
    thresholdLabelKey: `${prefix}.thresholdLabel`,
    unitKey: `${prefix}.unit`,
  };
}

export const COMMUNITY_BADGE_RULE_COPY: Record<
  CommunityBadgeRuleType,
  CommunityBadgeRuleCopy
> = {
  tenure_days: ruleCopyKeys("tenure_days"),
  events_checked_in: ruleCopyKeys("events_checked_in"),
  volunteer_hours: ruleCopyKeys("volunteer_hours"),
  posts_and_replies: ruleCopyKeys("posts_and_replies"),
};

/** Picker labels for the badge icons (`communities:badges.icon.<key>`). */
export const COMMUNITY_BADGE_ICON_LABEL_KEYS: Record<
  CommunityBadgeIconKey,
  string
> = {
  award: "communities:badges.icon.award",
  star: "communities:badges.icon.star",
  heart: "communities:badges.icon.heart",
  sun: "communities:badges.icon.sun",
  moon: "communities:badges.icon.moon",
  zap: "communities:badges.icon.zap",
  feather: "communities:badges.icon.feather",
  coffee: "communities:badges.icon.coffee",
  music: "communities:badges.icon.music",
  headphones: "communities:badges.icon.headphones",
  mic: "communities:badges.icon.mic",
  book_open: "communities:badges.icon.book_open",
  camera: "communities:badges.icon.camera",
  film: "communities:badges.icon.film",
  pen_tool: "communities:badges.icon.pen_tool",
  smile: "communities:badges.icon.smile",
  compass: "communities:badges.icon.compass",
  map_pin: "communities:badges.icon.map_pin",
  flag: "communities:badges.icon.flag",
  calendar: "communities:badges.icon.calendar",
  clock: "communities:badges.icon.clock",
  users: "communities:badges.icon.users",
  message_circle: "communities:badges.icon.message_circle",
  life_buoy: "communities:badges.icon.life_buoy",
};

/** Picker labels for the badge colours (`communities:badges.tint.<tint>`). */
export const COMMUNITY_FLAIR_TINT_LABEL_KEYS: Record<
  CommunityFlairTint,
  string
> = {
  jade: "communities:badges.tint.jade",
  accent: "communities:badges.tint.accent",
  plum: "communities:badges.tint.plum",
  rose: "communities:badges.tint.rose",
  amber: "communities:badges.tint.amber",
  violet: "communities:badges.tint.violet",
};

/** The catalog key of a gift's name. A key this build does not know reads as
 *  the plain word for a gift. */
export function communityGiftNameKey(giftKey: string): string {
  return isCommunityGiftKey(giftKey)
    ? `communities:badges.gift.${giftKey}.name`
    : "communities:badges.gift.unknown.name";
}
