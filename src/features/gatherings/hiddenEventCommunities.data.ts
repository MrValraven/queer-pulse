import type { AccessTier } from "../communities/membership.types";
import { communities } from "../homepage/data/communities";

/**
 * Demo data for hiding events by community.
 *
 * This file must never import `./data.ts`: `data.ts` imports `demoCommunityId`
 * from here to give its calendar rows a hosting community, so the reverse
 * import would close a cycle.
 */

/** The demo id of a community, derived from its slug. Demo communities carry
 *  no server id, so every demo surface builds the same one from the slug. */
export function demoCommunityId(slug: string): string {
  return `demo-community-${slug}`;
}

/** A community the demo can name on an event card, hide, and find in the
 *  Browse refine search. */
export interface DemoEventCommunity {
  id: string;
  slug: string;
  name: string;
  avatarImageUrl: string | null;
  accessTier: AccessTier;
}

/** The lead community of the Barreiro demo events. It has no demo community
 *  page, so cards name it while the event pages leave it out. */
export const DEMO_QUEER_BARREIRO: DemoEventCommunity = {
  id: demoCommunityId("queer-barreiro"),
  slug: "queer-barreiro",
  name: "Queer Barreiro",
  avatarImageUrl: null,
  accessTier: "public",
};

/** Every community the demo can hide: Queer Barreiro plus the homepage
 *  community roster, keyed by slug. Also the demo search corpus. */
export const DEMO_EVENT_COMMUNITIES: DemoEventCommunity[] = [
  DEMO_QUEER_BARREIRO,
  ...communities.flatMap((community) =>
    community.slug
      ? [
          {
            id: demoCommunityId(community.slug),
            slug: community.slug,
            name: community.name,
            avatarImageUrl: null,
            accessTier: community.accessTier ?? "public",
          },
        ]
      : [],
  ),
];

/** The accepted guest communities of each demo event, keyed by event slug.
 *  Mirrors `guestCommunities` on the matching `gatheringDetails` entries, so
 *  the demo applies the same hiding rule as the server: an event stays shown
 *  while any of its hosts is still shown. */
export const DEMO_EVENT_GUEST_COMMUNITY_IDS: Readonly<
  Record<string, readonly string[]>
> = {
  "portfolio-night": [demoCommunityId("queer-runners")],
  "queer-runners-run": [demoCommunityId("trans-hub")],
};
