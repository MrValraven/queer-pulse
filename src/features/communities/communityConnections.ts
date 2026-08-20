import { communities } from "../homepage/data/communities";
import type { Community } from "../homepage/data/types";
import { LIVING } from "./livingCommunities.data";

/** Set of member slugs in a living community (empty for non-flagships). */
function memberSlugs(slug: string): Set<string> {
  const c = LIVING[slug];
  if (!c) return new Set();
  return new Set(
    c.roster.map((m) => m.slug).filter((s): s is string => Boolean(s)),
  );
}

/** How many members two communities share. */
export function sharedCount(a: string, b: string): number {
  const sa = memberSlugs(a);
  const sb = memberSlugs(b);
  let n = 0;
  for (const s of sa) if (sb.has(s)) n++;
  return n;
}

export interface SisterCommunity {
  community: Community;
  shared: number;
}

/**
 * Other communities that share members with `slug`, most-connected first.
 *
 * `LIVING` is a DEMO-ONLY fixture registry (`livingCommunities.data.ts`), not
 * real roster data — pass `demoMode` from the caller's `useDemoMode()`, same
 * convention as `photoOf`. Live mode always returns `[]`: a real community's
 * slug colliding with a demo slug must never render fabricated sister-
 * community relationships to real members.
 */
export function sisterCommunities(
  slug: string,
  demoMode = false,
): SisterCommunity[] {
  if (!demoMode) return [];
  return Object.keys(LIVING)
    .filter((other) => other !== slug)
    .map((other) => ({
      community: communities.find((c) => c.slug === other),
      shared: sharedCount(slug, other),
    }))
    .filter((x): x is SisterCommunity => Boolean(x.community) && x.shared > 0)
    .sort((a, b) => b.shared - a.shared);
}

/**
 * Names of other living communities a given member also belongs to.
 *
 * Same DEMO-ONLY caveat as {@link sisterCommunities} — pass `demoMode` from
 * the caller's `useDemoMode()`; live mode always returns `[]`.
 */
export function alsoIn(
  memberSlug: string | undefined,
  excludeSlug: string,
  demoMode = false,
): string[] {
  if (!demoMode || !memberSlug) return [];
  return Object.keys(LIVING)
    .filter((slug) => slug !== excludeSlug && memberSlugs(slug).has(memberSlug))
    .map((slug) => communities.find((c) => c.slug === slug)?.name ?? slug);
}
