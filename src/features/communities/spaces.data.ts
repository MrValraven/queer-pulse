import type { Community } from "../homepage/data/types";
import type {
  CommunityInheritedRules,
  CommunityParentRef,
} from "./api/communities.api";
import type { SpaceCardModel } from "./community.model";
import type { CommunityDetail } from "./communityDetails";
import { COMMUNITY_DETAILS } from "./communityDetails.data";

/* ----------------------------------------------------------------------------
 * Demo spaces (subcommunities). DEMO-ONLY fixtures: live code reads these only
 * inside a `demoMode` branch. The spaces stay out of the Discover registry
 * (`features/homepage/data/communities.ts`) because a space is found through
 * its parent, and their hub data lives in `LIVING` beside every other flagship.
 * ------------------------------------------------------------------------- */

/** The demo community that hosts spaces. Public, so both a public and a
 *  request-tier space sit at or below its tier. */
export const DEMO_SPACES_PARENT_SLUG = "queer-runners";

/** The parent ref every demo space carries. The demo viewer is a member of
 *  Queer Runners Lisboa, so `isMember` is true. */
export const DEMO_SPACES_PARENT_REF: CommunityParentRef = {
  slug: DEMO_SPACES_PARENT_SLUG,
  name: "Queer Runners Lisboa",
  avatarImageUrl: null,
  isMember: true,
};

/** The parent rules a demo space inherits (a copy of the Queer Runners rules,
 *  kept here so this file does not import the large `LIVING` registry). */
export const DEMO_SPACES_INHERITED_RULES: CommunityInheritedRules = {
  rules: [
    "Every pace belongs. Nobody runs alone and nobody gets left.",
    "The slowest runner sets the warm-up. We regroup at every turn.",
    'No pace-shaming, no body-shaming, no "you should" about anyone\'s training.',
    "What gets shared on a run stays on the run.",
    "Coffee after is not optional (it is, but come anyway).",
  ],
  rulesVersion: 1,
};

export const DEMO_SPACE_PARENTS_SLUG = `${DEMO_SPACES_PARENT_SLUG}-parents`;
export const DEMO_SPACE_FLINTA_SLUG = `${DEMO_SPACES_PARENT_SLUG}-flinta`;

/* The demo viewer moderates Queer Runners Lisboa but holds no roster row in
 * either space, so both cards start with `isMember: false` (the session
 * membership store overrides it once the viewer joins one). */
const PARENTS_SPACE: SpaceCardModel = {
  slug: DEMO_SPACE_PARENTS_SLUG,
  href: `/community/${DEMO_SPACE_PARENTS_SLUG}`,
  type: "sports",
  typeLabel: "Sports",
  name: "Runners with kids",
  description:
    "Buggy-friendly routes and a Saturday park loop for parents who run.",
  count: "18 members",
  joinLabel: "Join",
  accessTier: "public",
  activeThisWeek: 6,
  tags: ["sports-fitness", "parents-family"],
  isMember: false,
};

const FLINTA_SPACE: SpaceCardModel = {
  slug: DEMO_SPACE_FLINTA_SLUG,
  href: `/community/${DEMO_SPACE_FLINTA_SLUG}`,
  type: "sports",
  typeLabel: "Sports",
  name: "FLINTA* night runs",
  description:
    "Evening runs for women, lesbian, intersex, non-binary, trans and agender runners.",
  count: "24 members",
  joinLabel: "Join",
  accessTier: "request",
  activeThisWeek: 9,
  tags: ["sports-fitness", "outdoors-hiking"],
  isMember: false,
};

/** Demo spaces by parent slug, the demo mirror of
 *  `GET /communities/:slug/subcommunities`. A space founded this session is
 *  appended through `appendDemoSpace`. */
export const DEMO_SPACES_BY_PARENT: Record<string, SpaceCardModel[]> = {
  [DEMO_SPACES_PARENT_SLUG]: [PARENTS_SPACE, FLINTA_SPACE],
};

/** Find a demo space card by its own slug, across every parent. */
export function findDemoSpace(slug: string | undefined): Community | undefined {
  if (!slug) return undefined;
  return Object.values(DEMO_SPACES_BY_PARENT)
    .flat()
    .find((space) => space.slug === slug);
}

const PARENT_DETAIL = COMMUNITY_DETAILS[DEMO_SPACES_PARENT_SLUG];

/** Detail records for the demo spaces, built on the parent's so the hub has an
 *  organiser, a next run and a topic thread to show. */
export const DEMO_SPACE_DETAILS: Record<string, CommunityDetail> = PARENT_DETAIL
  ? {
      [DEMO_SPACE_PARENTS_SLUG]: {
        ...PARENT_DETAIL,
        badge: "Running space",
        founded: "Founded June 2026",
        cadence: "Saturdays · 9 AM",
        about: [PARENTS_SPACE.description],
        whoFor: [
          "Parents and carers who run, with or without a buggy",
          "Anyone who needs a route with toilets and a playground halfway",
        ],
        tags: ["Parents", "Buggy-friendly", "Saturdays"],
      },
      [DEMO_SPACE_FLINTA_SLUG]: {
        ...PARENT_DETAIL,
        badge: "Running space",
        founded: "Founded July 2026",
        cadence: "Wednesdays · 7 PM",
        about: [FLINTA_SPACE.description],
        whoFor: [
          "FLINTA* runners who want company on evening routes",
          "Runners who feel safer in a group after dark",
        ],
        tags: ["FLINTA*", "Evenings", "Wednesdays"],
      },
    }
  : {};

/** Record a space founded in demo mode under its parent, for the session. The
 *  space borrows its parent's detail record (organiser, next run) so its hub
 *  page resolves; a parent with no demo detail leaves the space listed only. */
export function appendDemoSpace(
  parentSlug: string,
  space: SpaceCardModel,
  whoFor: string,
): void {
  DEMO_SPACES_BY_PARENT[parentSlug] = [
    ...(DEMO_SPACES_BY_PARENT[parentSlug] ?? []),
    space,
  ];
  const parentDetail = COMMUNITY_DETAILS[parentSlug];
  if (!space.slug || !parentDetail) return;
  DEMO_SPACE_DETAILS[space.slug] = {
    ...parentDetail,
    about: [space.description],
    whoFor: whoFor ? [whoFor] : parentDetail.whoFor,
    tags: [space.typeLabel],
  };
}
