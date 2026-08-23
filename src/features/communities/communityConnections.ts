import { communities } from "../homepage/data/communities";
import { LIVING } from "./livingCommunities.data";

/** Set of member slugs in a living community (empty for non-flagships). */
function memberSlugs(slug: string): Set<string> {
  const community = LIVING[slug];
  if (!community) return new Set();
  return new Set(
    community.roster
      .map((member) => member.slug)
      .filter((memberSlug): memberSlug is string => Boolean(memberSlug)),
  );
}

/**
 * Names of other living communities a given member also belongs to.
 *
 * `LIVING` is a DEMO-ONLY fixture registry (`livingCommunities.data.ts`), not
 * real roster data — pass `demoMode` from the caller's `useDemoMode()`, same
 * convention as `photoOf`. Live mode always returns `[]`: a real community's
 * slug colliding with a demo slug must never render fabricated relationships
 * to real members.
 */
export function alsoIn(
  memberSlug: string | undefined,
  excludeSlug: string,
  demoMode = false,
): string[] {
  if (!demoMode || !memberSlug) return [];
  return Object.keys(LIVING)
    .filter((slug) => slug !== excludeSlug && memberSlugs(slug).has(memberSlug))
    .map(
      (slug) =>
        communities.find((community) => community.slug === slug)?.name ?? slug,
    );
}
