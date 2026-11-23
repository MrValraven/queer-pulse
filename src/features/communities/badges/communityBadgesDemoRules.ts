import {
  COMMUNITY_BADGE_NAME_MAX_LENGTH,
  COMMUNITY_BADGE_RULE_TYPES,
  COMMUNITY_BADGE_RULES,
  COMMUNITY_GIFT_NOTE_MAX_LENGTH,
  isCommunityBadgeIconKey,
  isCommunityFlairTint,
  isCommunityGiftKey,
  type CommunityBadgeIconKey,
  type CommunityBadgeRuleType,
  type CommunityFlairTint,
  type CommunityGiftKey,
} from "./communityBadges.catalog";
import { communityBadgeRefusal } from "./communityBadgeErrors";

/**
 * The field checks of the demo badges store, in the contract's order (name,
 * iconKey, tint, ruleType, threshold, isEnabled). The first failure wins and
 * throws the server's reason code with its extras (contract sections 4 and 9),
 * so the demo forms show the same lines live mode does.
 */

export interface DemoBadgeFields {
  name: string;
  iconKey: CommunityBadgeIconKey;
  tint: CommunityFlairTint;
  ruleType: CommunityBadgeRuleType;
  threshold: number;
  isEnabled: boolean;
}

export type DemoBadgeChanges = Partial<
  Pick<DemoBadgeFields, "name" | "iconKey" | "tint" | "threshold" | "isEnabled">
>;

/** A badge body as it arrives: any field may be missing or mistyped. */
export interface DemoBadgeBodyInput {
  name?: unknown;
  iconKey?: unknown;
  tint?: unknown;
  ruleType?: unknown;
  threshold?: unknown;
  isEnabled?: unknown;
}

/** A gift body as it arrives. */
export interface DemoGiftBodyInput {
  recipientSlug?: unknown;
  giftKey?: unknown;
  note?: unknown;
}

export interface DemoGiftSendFields {
  recipientSlug: string;
  giftKey: CommunityGiftKey;
  note: string | null;
}

/** Length in code points, the way the server counts. */
export function codePointLength(value: string): number {
  return [...value].length;
}

export function checkBadgeName(value: unknown): string {
  const name = typeof value === "string" ? value.trim() : "";
  if (name === "") throw communityBadgeRefusal("badge_name_required");
  if (codePointLength(name) > COMMUNITY_BADGE_NAME_MAX_LENGTH) {
    throw communityBadgeRefusal("badge_name_too_long", {
      maxLength: COMMUNITY_BADGE_NAME_MAX_LENGTH,
    });
  }
  return name;
}

export function checkBadgeIconKey(value: unknown): CommunityBadgeIconKey {
  if (typeof value === "string" && isCommunityBadgeIconKey(value)) return value;
  throw communityBadgeRefusal("badge_icon_unknown");
}

export function checkBadgeTint(value: unknown): CommunityFlairTint {
  if (typeof value === "string" && isCommunityFlairTint(value)) return value;
  throw communityBadgeRefusal("badge_tint_unknown");
}

export function checkBadgeRuleType(value: unknown): CommunityBadgeRuleType {
  const ruleType = COMMUNITY_BADGE_RULE_TYPES.find((rule) => rule === value);
  if (ruleType === undefined) throw communityBadgeRefusal("badge_rule_unknown");
  return ruleType;
}

/** A whole number inside the rule's range, else the range in the refusal. */
export function checkBadgeThreshold(
  value: unknown,
  ruleType: CommunityBadgeRuleType,
): number {
  const { min, max } = COMMUNITY_BADGE_RULES[ruleType];
  if (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= min &&
    value <= max
  ) {
    return value;
  }
  throw communityBadgeRefusal("badge_threshold_out_of_range", {
    ruleType,
    min,
    max,
  });
}

export function checkBadgeEnabled(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  throw communityBadgeRefusal("badge_enabled_invalid");
}

/** `POST /badges`: every field, `isEnabled` defaulting to on. */
export function checkBadgeCreate(body: DemoBadgeBodyInput): DemoBadgeFields {
  const name = checkBadgeName(body.name);
  const iconKey = checkBadgeIconKey(body.iconKey);
  const tint = checkBadgeTint(body.tint);
  const ruleType = checkBadgeRuleType(body.ruleType);
  const threshold = checkBadgeThreshold(body.threshold, ruleType);
  const isEnabled =
    body.isEnabled === undefined ? true : checkBadgeEnabled(body.isEnabled);
  return { name, iconKey, tint, ruleType, threshold, isEnabled };
}

/** `PATCH /badges/:badgeId`: only the fields the body carries. A body that
 *  carries `ruleType` at all answers `badge_rule_locked` at its slot. */
export function checkBadgeUpdate(
  body: DemoBadgeBodyInput,
  storedRuleType: CommunityBadgeRuleType,
): DemoBadgeChanges {
  const changes: DemoBadgeChanges = {};
  if (body.name !== undefined) changes.name = checkBadgeName(body.name);
  if (body.iconKey !== undefined) {
    changes.iconKey = checkBadgeIconKey(body.iconKey);
  }
  if (body.tint !== undefined) changes.tint = checkBadgeTint(body.tint);
  if (body.ruleType !== undefined) {
    throw communityBadgeRefusal("badge_rule_locked");
  }
  if (body.threshold !== undefined) {
    changes.threshold = checkBadgeThreshold(body.threshold, storedRuleType);
  }
  if (body.isEnabled !== undefined) {
    changes.isEnabled = checkBadgeEnabled(body.isEnabled);
  }
  return changes;
}

/** Names are unique per community in any letter case. */
export function assertBadgeNameFree(
  name: string,
  badges: readonly { id: string; name: string }[],
  ownBadgeId: string | null,
): void {
  const folded = name.toLowerCase();
  const isTaken = badges.some(
    (badge) => badge.id !== ownBadgeId && badge.name.toLowerCase() === folded,
  );
  if (isTaken) throw communityBadgeRefusal("badge_name_taken");
}

/** `PUT /flair`: null stops wearing; anything else must be a badge id. */
export function checkFlairBadgeId(value: unknown): string | null {
  if (value === null) return null;
  if (typeof value === "string" && value.trim() !== "") return value.trim();
  throw communityBadgeRefusal("flair_badge_id_invalid");
}

/** The note is trimmed, and an empty one reads as no note. */
export function checkGiftNote(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== "string")
    throw communityBadgeRefusal("gift_note_invalid");
  const note = value.trim();
  if (note === "") return null;
  if (codePointLength(note) > COMMUNITY_GIFT_NOTE_MAX_LENGTH) {
    throw communityBadgeRefusal("gift_note_too_long", {
      maxLength: COMMUNITY_GIFT_NOTE_MAX_LENGTH,
    });
  }
  return note;
}

/** `POST /gifts` body: recipient slug, catalog gift, note. Membership and
 *  self are the store's checks, after these. */
export function checkGiftSend(body: DemoGiftBodyInput): DemoGiftSendFields {
  const recipientSlug =
    typeof body.recipientSlug === "string" ? body.recipientSlug.trim() : "";
  if (recipientSlug === "") {
    throw communityBadgeRefusal("gift_recipient_not_member");
  }
  const giftKey = body.giftKey;
  if (typeof giftKey !== "string" || !isCommunityGiftKey(giftKey)) {
    throw communityBadgeRefusal("gift_unknown");
  }
  return { recipientSlug, giftKey, note: checkGiftNote(body.note) };
}

export function checkGiftHidden(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  throw communityBadgeRefusal("gift_hidden_invalid");
}
