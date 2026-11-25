import { quizBadgeTextIn } from "../../quizshow/winBadges/quizWinBadgeText";
import type { Language, TFunction } from "../../../shared/i18n/types";

/** A string payload field, or null when it is missing or blank. */
function nonEmptyString(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value : null;
}

/**
 * The sentence of a `badge_earned` row for a quiz win ("You won X at Y."), or
 * null for a platform badge. A payload names a quiz win by carrying an
 * `eventName`. A Portuguese viewer reads `badgeNamePt` when it holds text and
 * the English `badgeName` otherwise.
 */
export function quizBadgeEarnedText(
  payload: unknown,
  t: TFunction,
  language: Language | undefined,
): string | null {
  if (typeof payload !== "object" || payload === null) return null;
  const fields = payload as Record<string, unknown>;
  const eventName = nonEmptyString(fields.eventName);
  if (eventName === null) return null;
  const badgeName = nonEmptyString(fields.badgeName);
  const badgeNamePt = nonEmptyString(fields.badgeNamePt);
  const displayName = quizBadgeTextIn(
    { en: badgeName ?? "", pt: badgeNamePt },
    language ?? "en",
  );
  // No name to show in this language: the row keeps the platform sentence.
  if (displayName.trim() === "") return null;
  return t("notifications:type.badge_earned.quizText", {
    badgeName: displayName,
    eventName,
  });
}
