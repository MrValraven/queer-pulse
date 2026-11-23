import { ApiError } from "../../../shared/api/client";
import type {
  CommunityBadgeAdminDTO,
  CommunityFlairDTO,
  CreateCommunityBadgeBody,
  UpdateCommunityBadgeBody,
} from "./api/communityBadges.api";
import {
  COMMUNITY_BADGE_NAME_MAX_LENGTH,
  COMMUNITY_BADGE_RULES,
  isCommunityBadgeIconKey,
  resolveCommunityFlairTint,
  type CommunityBadgeIconKey,
  type CommunityBadgeRuleType,
  type CommunityBadgeStarterKey,
  type CommunityFlairTint,
} from "./communityBadges.catalog";

/**
 * The create and edit form of a community badge, as plain data. The threshold
 * stays the text the owner typed until it is sent, so a half-typed number
 * never snaps back under their cursor.
 */
export interface CommunityBadgeDraft {
  name: string;
  iconKey: CommunityBadgeIconKey;
  tint: CommunityFlairTint;
  ruleType: CommunityBadgeRuleType;
  threshold: string;
  isEnabled: boolean;
}

/** The form fields a refusal can point at. */
export type CommunityBadgeFormField = "name" | "threshold" | "icon" | "tint";

export type CommunityBadgeDraftProblemCode =
  | "badge_name_required"
  | "badge_name_too_long"
  | "badge_threshold_out_of_range";

export interface CommunityBadgeDraftProblem {
  code: CommunityBadgeDraftProblemCode;
  field: "name" | "threshold";
}

/** The field each server refusal belongs under. A code missing here shows
 *  as a toast. */
const REFUSAL_FIELDS: Record<string, CommunityBadgeFormField> = {
  badge_name_required: "name",
  badge_name_too_long: "name",
  badge_name_taken: "name",
  badge_threshold_out_of_range: "threshold",
  badge_icon_unknown: "icon",
  badge_tint_unknown: "tint",
};

export function emptyCommunityBadgeDraft(): CommunityBadgeDraft {
  return {
    name: "",
    iconKey: "award",
    tint: "jade",
    ruleType: "events_checked_in",
    threshold: "3",
    isEnabled: true,
  };
}

/** An icon or tint this build does not know opens as an award in jade. */
export function draftFromAdminBadge(
  badge: CommunityBadgeAdminDTO,
): CommunityBadgeDraft {
  return {
    name: badge.name,
    iconKey: isCommunityBadgeIconKey(badge.iconKey) ? badge.iconKey : "award",
    tint: resolveCommunityFlairTint(badge.tint),
    ruleType: badge.ruleType,
    threshold: String(badge.threshold),
    isEnabled: badge.isEnabled,
  };
}

function thresholdNumber(draft: CommunityBadgeDraft): number {
  return Number(draft.threshold.trim());
}

export function createBodyFromDraft(
  draft: CommunityBadgeDraft,
): CreateCommunityBadgeBody {
  return {
    name: draft.name.trim(),
    iconKey: draft.iconKey,
    tint: draft.tint,
    ruleType: draft.ruleType,
    threshold: thresholdNumber(draft),
    isEnabled: draft.isEnabled,
  };
}

/** The fields that changed since the badge was loaded. The rule stays out:
 *  it is fixed once a badge exists. */
export function updateBodyFromDraft(
  draft: CommunityBadgeDraft,
  badge: CommunityBadgeAdminDTO,
): UpdateCommunityBadgeBody {
  const original = draftFromAdminBadge(badge);
  const body: UpdateCommunityBadgeBody = {};
  const name = draft.name.trim();
  if (name !== original.name) body.name = name;
  if (draft.iconKey !== original.iconKey) body.iconKey = draft.iconKey;
  if (draft.tint !== original.tint) body.tint = draft.tint;
  const threshold = thresholdNumber(draft);
  if (threshold !== badge.threshold) body.threshold = threshold;
  if (draft.isEnabled !== original.isEnabled) body.isEnabled = draft.isEnabled;
  return body;
}

function isWholeNumberText(text: string): boolean {
  return /^\d+$/.test(text.trim());
}

/** The fields the form checks itself, on blur and again on submit. */
export type CommunityBadgeCheckedField = CommunityBadgeDraftProblem["field"];

/** The problem with one field on its own, checked the way the server does:
 *  the name in code points after a trim, the threshold as a whole number
 *  inside its rule's range. */
export function draftFieldProblem(
  draft: CommunityBadgeDraft,
  field: CommunityBadgeCheckedField,
): CommunityBadgeDraftProblem | null {
  if (field === "name") {
    const nameLength = [...draft.name.trim()].length;
    if (nameLength === 0) return { code: "badge_name_required", field };
    if (nameLength > COMMUNITY_BADGE_NAME_MAX_LENGTH)
      return { code: "badge_name_too_long", field };
    return null;
  }
  const range = COMMUNITY_BADGE_RULES[draft.ruleType];
  const threshold = thresholdNumber(draft);
  const isInRange =
    isWholeNumberText(draft.threshold) &&
    threshold >= range.min &&
    threshold <= range.max;
  return isInRange ? null : { code: "badge_threshold_out_of_range", field };
}

/** Every problem the form would refuse, name first. */
export function draftProblems(
  draft: CommunityBadgeDraft,
): CommunityBadgeDraftProblem[] {
  return (["name", "threshold"] as const)
    .map((field) => draftFieldProblem(draft, field))
    .filter((problem) => problem !== null);
}

/** The first thing the form would refuse. */
export function draftProblem(
  draft: CommunityBadgeDraft,
): CommunityBadgeDraftProblem | null {
  return draftProblems(draft)[0] ?? null;
}

/** A new badge moved to another rule. A number the new rule cannot take
 *  starts over at that rule's smallest one. */
export function draftWithRule(
  draft: CommunityBadgeDraft,
  ruleType: CommunityBadgeRuleType,
): CommunityBadgeDraft {
  const range = COMMUNITY_BADGE_RULES[ruleType];
  const threshold = thresholdNumber(draft);
  const isInRange =
    isWholeNumberText(draft.threshold) &&
    threshold >= range.min &&
    threshold <= range.max;
  return {
    ...draft,
    ruleType,
    threshold: isInRange ? draft.threshold : String(range.min),
  };
}

/** Lowering a threshold awards the badge to members who now qualify. */
export function isThresholdLowered(
  draft: CommunityBadgeDraft,
  badge: CommunityBadgeAdminDTO,
): boolean {
  return (
    isWholeNumberText(draft.threshold) &&
    thresholdNumber(draft) < badge.threshold
  );
}

/** The chip the preview draws. A starter keeps its key, so an untouched
 *  starter name reads in the viewer's language, as it does on name lines. */
export function previewFlairFromDraft(
  draft: CommunityBadgeDraft,
  starterKey: CommunityBadgeStarterKey | null,
): CommunityFlairDTO {
  return {
    name: draft.name.trim(),
    starterKey,
    iconKey: draft.iconKey,
    tint: draft.tint,
  };
}

/** The form field a refused save names, or null when the refusal belongs in
 *  a toast. */
export function refusalField(error: unknown): CommunityBadgeFormField | null {
  if (!(error instanceof ApiError)) return null;
  const data = error.data as { code?: unknown } | null | undefined;
  const code = data?.code;
  if (typeof code !== "string") return null;
  return Object.prototype.hasOwnProperty.call(REFUSAL_FIELDS, code)
    ? REFUSAL_FIELDS[code]!
    : null;
}
