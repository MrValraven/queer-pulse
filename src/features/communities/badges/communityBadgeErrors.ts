import { ApiError } from "../../../shared/api/client";
import type { CauseErrorCopy } from "../../../shared/api/causeErrorKey";
import type { Formatters } from "../../../shared/i18n/format";
import type { TFunction } from "../../../shared/i18n/types";
import { communityCause } from "../communityErrors";
import { COMMUNITY_BADGE_RULE_COPY } from "./communityBadgeCopy.data";
import {
  COMMUNITY_BADGE_LIMIT,
  COMMUNITY_BADGE_NAME_MAX_LENGTH,
  COMMUNITY_BADGE_RULES,
  COMMUNITY_BADGE_RULE_TYPES,
  COMMUNITY_GIFT_NOTE_MAX_LENGTH,
  COMMUNITY_GIFT_WEEKLY_LIMIT,
  type CommunityBadgeRuleType,
} from "./communityBadges.catalog";

/**
 * Every reason code the badge, gift and worn-badge routes can refuse with, and
 * the HTTP status each arrives under (contract section 8). The demo store
 * throws the same codes through `communityBadgeRefusal`.
 */
export const COMMUNITY_BADGE_REASON_STATUS = {
  badge_limit_reached: 409,
  badge_threshold_out_of_range: 400,
  badge_name_taken: 409,
  badge_name_required: 400,
  badge_name_too_long: 400,
  badge_icon_unknown: 400,
  badge_tint_unknown: 400,
  badge_rule_unknown: 400,
  badge_rule_locked: 400,
  badge_enabled_invalid: 400,
  badge_not_found: 404,
  badge_manage_owner_only: 403,
  badge_settings_staff_only: 403,
  gift_sender_not_staff: 403,
  gift_recipient_not_member: 400,
  gift_recipient_unavailable: 403,
  gift_to_self: 400,
  gift_weekly_limit_reached: 429,
  gift_unknown: 400,
  gift_note_too_long: 400,
  gift_note_invalid: 400,
  gift_not_found: 404,
  gift_remove_not_allowed: 403,
  gift_hidden_invalid: 400,
  flair_badge_id_invalid: 400,
  flair_badge_disabled: 400,
  flair_badge_not_earned: 400,
} as const;

export type CommunityBadgeReasonCode =
  keyof typeof COMMUNITY_BADGE_REASON_STATUS;

/** Reason code to its own catalog line (`communities:badges.error.<code>`). */
export const COMMUNITY_BADGE_ERROR_KEYS: Record<
  CommunityBadgeReasonCode,
  string
> = {
  badge_limit_reached: "communities:badges.error.badge_limit_reached",
  badge_threshold_out_of_range:
    "communities:badges.error.badge_threshold_out_of_range",
  badge_name_taken: "communities:badges.error.badge_name_taken",
  badge_name_required: "communities:badges.error.badge_name_required",
  badge_name_too_long: "communities:badges.error.badge_name_too_long",
  badge_icon_unknown: "communities:badges.error.badge_icon_unknown",
  badge_tint_unknown: "communities:badges.error.badge_tint_unknown",
  badge_rule_unknown: "communities:badges.error.badge_rule_unknown",
  badge_rule_locked: "communities:badges.error.badge_rule_locked",
  badge_enabled_invalid: "communities:badges.error.badge_enabled_invalid",
  badge_not_found: "communities:badges.error.badge_not_found",
  badge_manage_owner_only: "communities:badges.error.badge_manage_owner_only",
  badge_settings_staff_only:
    "communities:badges.error.badge_settings_staff_only",
  gift_sender_not_staff: "communities:badges.error.gift_sender_not_staff",
  gift_recipient_not_member:
    "communities:badges.error.gift_recipient_not_member",
  gift_recipient_unavailable:
    "communities:badges.error.gift_recipient_unavailable",
  gift_to_self: "communities:badges.error.gift_to_self",
  gift_weekly_limit_reached:
    "communities:badges.error.gift_weekly_limit_reached",
  gift_unknown: "communities:badges.error.gift_unknown",
  gift_note_too_long: "communities:badges.error.gift_note_too_long",
  gift_note_invalid: "communities:badges.error.gift_note_invalid",
  gift_not_found: "communities:badges.error.gift_not_found",
  gift_remove_not_allowed: "communities:badges.error.gift_remove_not_allowed",
  gift_hidden_invalid: "communities:badges.error.gift_hidden_invalid",
  flair_badge_id_invalid: "communities:badges.error.flair_badge_id_invalid",
  flair_badge_disabled: "communities:badges.error.flair_badge_disabled",
  flair_badge_not_earned: "communities:badges.error.flair_badge_not_earned",
};

/** The line for a space, where badges and gifts do not exist. */
export const COMMUNITY_BADGE_SPACES_ERROR_KEY =
  "communities:badges.error.spaces";

/** How the weekly gift limit names the moment a gift frees up again. */
export const GIFT_RESET_FORMAT: Intl.DateTimeFormatOptions = {
  weekday: "long",
  day: "numeric",
  month: "long",
  hour: "numeric",
  minute: "2-digit",
};

function isBadgeReasonCode(code: unknown): code is CommunityBadgeReasonCode {
  return (
    typeof code === "string" &&
    Object.prototype.hasOwnProperty.call(COMMUNITY_BADGE_REASON_STATUS, code)
  );
}

function isRuleType(value: unknown): value is CommunityBadgeRuleType {
  return (
    typeof value === "string" &&
    (COMMUNITY_BADGE_RULE_TYPES as readonly string[]).includes(value)
  );
}

/** A number or text field of the error body, or the catalog's own value when
 *  the body left it out, so a line never shows a bare `{limit}`. */
function bodyValue(
  body: Record<string, unknown>,
  field: string,
  fallback: string | number,
): string | number {
  const value = body[field];
  return typeof value === "number" || typeof value === "string"
    ? value
    : fallback;
}

function thresholdValues(
  body: Record<string, unknown>,
  t: TFunction,
): Record<string, string | number> {
  const ruleType = isRuleType(body.ruleType) ? body.ruleType : null;
  const range = ruleType === null ? null : COMMUNITY_BADGE_RULES[ruleType];
  return {
    min: bodyValue(body, "min", range?.min ?? ""),
    max: bodyValue(body, "max", range?.max ?? ""),
    unit:
      ruleType === null ? "" : t(COMMUNITY_BADGE_RULE_COPY[ruleType].unitKey),
  };
}

function giftResetText(body: Record<string, unknown>, fmt: Formatters): string {
  const { resetsAt } = body;
  if (typeof resetsAt !== "string" && typeof resetsAt !== "number") return "";
  const resetDate = new Date(resetsAt);
  return Number.isNaN(resetDate.getTime())
    ? ""
    : fmt.date(resetDate, GIFT_RESET_FORMAT);
}

function valuesFor(
  code: CommunityBadgeReasonCode,
  body: Record<string, unknown>,
  t: TFunction,
  fmt: Formatters,
): Record<string, string | number> | undefined {
  switch (code) {
    case "badge_limit_reached":
      return { limit: bodyValue(body, "limit", COMMUNITY_BADGE_LIMIT) };
    case "badge_name_too_long":
      return {
        maxLength: bodyValue(
          body,
          "maxLength",
          COMMUNITY_BADGE_NAME_MAX_LENGTH,
        ),
      };
    case "gift_note_too_long":
      return {
        maxLength: bodyValue(body, "maxLength", COMMUNITY_GIFT_NOTE_MAX_LENGTH),
      };
    case "badge_threshold_out_of_range":
      return thresholdValues(body, t);
    case "gift_weekly_limit_reached":
      return {
        limit: bodyValue(body, "limit", COMMUNITY_GIFT_WEEKLY_LIMIT),
        resetsAt: giftResetText(body, fmt),
      };
    default:
      return undefined;
  }
}

/**
 * The cause line for a failed badge, gift or worn-badge call. A badge reason
 * code gets its own line with the numbers its sentence names (`limit`,
 * `maxLength`, the threshold range and unit, the weekly reset time). Every
 * other failure goes through `communityCause`, so offline, signed-out and
 * restriction lines keep working; a space refusal gets the spaces line.
 */
export function communityBadgeErrorCopy(
  error: unknown,
  t: TFunction,
  fmt: Formatters,
): CauseErrorCopy {
  const body: Record<string, unknown> =
    error instanceof ApiError &&
    typeof error.data === "object" &&
    error.data !== null
      ? (error.data as Record<string, unknown>)
      : {};
  if (isBadgeReasonCode(body.code)) {
    const values = valuesFor(body.code, body, t, fmt);
    return values === undefined
      ? { key: COMMUNITY_BADGE_ERROR_KEYS[body.code] }
      : { key: COMMUNITY_BADGE_ERROR_KEYS[body.code], values };
  }
  return communityCause(error, {
    ...COMMUNITY_BADGE_ERROR_KEYS,
    SUBCOMMUNITY_FEATURE_UNAVAILABLE: COMMUNITY_BADGE_SPACES_ERROR_KEY,
  });
}

/** The ready-to-show text for a failed badge, gift or worn-badge call. */
export function communityBadgeErrorText(
  error: unknown,
  t: TFunction,
  fmt: Formatters,
): string {
  const copy = communityBadgeErrorCopy(error, t, fmt);
  return t(copy.key, copy.values);
}

/**
 * The refusal the demo store throws, shaped like the backend's body so the
 * same `communityBadgeErrorCopy` reads it in both modes.
 */
export function communityBadgeRefusal(
  code:
    | CommunityBadgeReasonCode
    | "SUBCOMMUNITY_FEATURE_UNAVAILABLE"
    | "COMMUNITY_MEMBERS_ONLY",
  extras?: Record<string, string | number>,
): ApiError {
  const status =
    code === "SUBCOMMUNITY_FEATURE_UNAVAILABLE"
      ? 400
      : code === "COMMUNITY_MEMBERS_ONLY"
        ? 403
        : COMMUNITY_BADGE_REASON_STATUS[code];
  return new ApiError(status, code, {
    statusCode: status,
    message: code,
    code,
    ...extras,
  });
}
