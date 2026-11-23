import type { TFunction } from "../../../shared/i18n/types";
import {
  COMMUNITY_BADGE_STARTERS,
  isCommunityBadgeStarterKey,
} from "./communityBadges.catalog";

/**
 * The only place a badge name becomes on-screen text (the sheet, the chip, the
 * mod pane, the form preview, the delete dialog, toasts and the notification
 * row). An untouched starter badge carries its English catalog name in the
 * database, so it reads in the viewer's language here. A starter an owner
 * renamed, and every custom badge, shows exactly as stored in both languages.
 * The governance log and the data export keep the stored name.
 */
export function communityBadgeDisplayName(
  badge: { name: string; starterKey?: string | null },
  t: TFunction,
): string {
  const starterKey = badge.starterKey;
  if (!isCommunityBadgeStarterKey(starterKey)) return badge.name;
  const starter = COMMUNITY_BADGE_STARTERS.find(
    (candidate) => candidate.key === starterKey,
  );
  if (starter === undefined || badge.name !== starter.name) return badge.name;
  return t(`communities:badges.starter.${starterKey}`);
}
