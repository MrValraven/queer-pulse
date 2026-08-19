import type { Badge } from "./badges.data";

const RARITY_RANK: Record<Badge["rarity"], number> = {
  common: 0,
  rare: 1,
  legendary: 2,
};

/** i18n key for a rarity's display label — the one place this mapping lives. */
export const RARITY_LABEL_KEY: Record<Badge["rarity"], string> = {
  common: "members:badges.case.rarityCommon",
  rare: "members:badges.case.rarityRare",
  legendary: "members:badges.case.rarityLegendary",
};

/** 0..100 progress toward a locked badge's target. 0 when the backend hasn't
 *  wired progress tracking for it yet, rather than guessing a number. */
export function progressPercent(badge: Badge): number {
  if (!badge.progress || badge.progress.target <= 0) return 0;
  return Math.min(
    100,
    Math.round((badge.progress.units / badge.progress.target) * 100),
  );
}

/** How many units are left to reach the target, or `null` when there's no
 *  progress data to compute it from. */
export function unitsRemaining(badge: Badge): number | null {
  if (!badge.progress) return null;
  return Math.max(0, badge.progress.target - badge.progress.units);
}

/** The highest-rarity badge in a list, or `null` if it's empty. */
export function rarestBadge(badges: Badge[]): Badge | null {
  if (badges.length === 0) return null;
  return badges.reduce((rarest, badge) =>
    RARITY_RANK[badge.rarity] > RARITY_RANK[rarest.rarity] ? badge : rarest,
  );
}

/** Locked badges outside the muted categories, nearest-progress first. */
export function closestToEarning(
  lockedBadges: Badge[],
  mutedCategories: string[] = [],
): Badge[] {
  return lockedBadges
    .filter((badge) => !mutedCategories.includes(badge.category))
    .slice()
    .sort((a, b) => progressPercent(b) - progressPercent(a));
}
