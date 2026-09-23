import type { AccessTier } from "./api/communities.api";

/** Access tiers, loosest first. A space's tier can only sit at or past its
 *  parent's position on this scale (PRD: a space keeps out everyone the
 *  parent already keeps out). */
export const TIER_ORDER: AccessTier[] = [
  "public",
  "request",
  "invite",
  "private",
];

/** Whether `tier` is legal for a space whose parent sits at `parentTier`: at
 *  the parent's own strictness or any stricter tier. */
export function isTierSelectable(
  tier: AccessTier,
  parentTier: AccessTier,
): boolean {
  return TIER_ORDER.indexOf(tier) >= TIER_ORDER.indexOf(parentTier);
}
