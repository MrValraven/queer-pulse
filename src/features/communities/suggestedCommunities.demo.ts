import { communities } from "../homepage/data/communities";
import type { Community } from "../homepage/data/types";
import { LIVING } from "./livingCommunities.data";

/** Mirrors the backend's own `SUGGESTED_COMMUNITIES_LIMIT`, so the demo band
 *  can never be longer than the live one. */
export const SUGGESTED_COMMUNITIES_LIMIT = 6;

/** The member slugs on a demo flagship's roster (empty for any other slug). */
function rosterSlugs(communitySlug: string): Set<string> {
  const living = LIVING[communitySlug];
  if (!living) return new Set();
  return new Set(
    living.roster
      .map((member) => member.slug)
      .filter((memberSlug): memberSlug is string => Boolean(memberSlug)),
  );
}

/**
 * The DEMO mirror of `GET /communities/suggested`, computed from fixtures the
 * prototype already ships: the `LIVING` flagship rosters
 * (`livingCommunities.data.ts`), the session membership store, and the
 * connection slugs `ConnectionsProvider` seeds. Nothing here reaches the API.
 *
 * It reproduces the endpoint's semantics rather than hand-picking a list, so
 * the demo band answers the same question the live one does: communities the
 * viewer has NOT joined where people they are connected to already are,
 * most-connected-in first. Private communities are dropped (a private
 * community the viewer is not in can never be a legitimate suggestion), and
 * an empty result is a normal answer, not an error.
 *
 * `connectedMemberSlugs` is demo-only truth (`useConnections().connected`
 * starts empty in live mode), which is exactly why the caller must gate this
 * behind `demoMode`, same convention as `photoOf` and `alsoIn`.
 */
export function demoSuggestedCommunities(
  connectedMemberSlugs: string[],
  isMemberOf: (communitySlug: string) => boolean,
): Community[] {
  if (connectedMemberSlugs.length === 0) return [];
  const connected = new Set(connectedMemberSlugs);

  return (
    Object.keys(LIVING)
      .filter(
        (communitySlug) =>
          !isMemberOf(communitySlug) &&
          LIVING[communitySlug]?.accessTier !== "private",
      )
      .map((communitySlug) => ({
        communitySlug,
        connectionCount: [...rosterSlugs(communitySlug)].filter((memberSlug) =>
          connected.has(memberSlug),
        ).length,
      }))
      .filter((candidate) => candidate.connectionCount > 0)
      // Overlap first, then slug, so the demo order is deterministic across
      // renders instead of depending on registry key order alone.
      .sort(
        (first, second) =>
          second.connectionCount - first.connectionCount ||
          first.communitySlug.localeCompare(second.communitySlug),
      )
      .map((candidate) =>
        communities.find(
          (community) => community.slug === candidate.communitySlug,
        ),
      )
      .filter((community): community is Community => Boolean(community))
      .slice(0, SUGGESTED_COMMUNITIES_LIMIT)
  );
}
