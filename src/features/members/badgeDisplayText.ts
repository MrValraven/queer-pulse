import type { Language, TFunction } from "../../shared/i18n/types";
import { badgeDisplayMetaFor } from "./badgeCatalog.data";
import type { Badge } from "./badges.data";
import { isQuizBadge, quizBadgeDescription, quizBadgeName } from "./quizBadges";

/** The one place a badge's name resolves: a quiz badge reads its own text in
 *  the viewer's language, a catalogue badge reads its translated name, and any
 *  other badge keeps the server's English. */
export function badgeNameFor(
  badge: Badge,
  t: TFunction,
  language: Language,
): string {
  if (isQuizBadge(badge)) return quizBadgeName(badge, language);
  const displayMeta = badgeDisplayMetaFor(badge.key);
  return displayMeta ? t(displayMeta.nameKey) : badge.name;
}

/** The one place a badge's "what it takes" line resolves, with the same order
 *  as `badgeNameFor`. */
export function badgeCriteriaFor(
  badge: Badge,
  t: TFunction,
  language: Language,
): string {
  if (isQuizBadge(badge)) return quizBadgeDescription(badge, language);
  const displayMeta = badgeDisplayMetaFor(badge.key);
  return displayMeta
    ? t(displayMeta.lockedContextKey)
    : (badge.criteria ?? badge.when);
}
