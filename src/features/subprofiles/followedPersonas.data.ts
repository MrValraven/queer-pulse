import { DEMO_SUBPROFILES, mockSetFollowing } from "./data/subprofiles.data";
import type {
  FollowedPersonaDTO,
  FollowedPersonasPage,
} from "./api/subprofiles.api";

/**
 * Demo fixture for "the personas you follow" (PRD-208).
 *
 * DEMO ONLY. Nothing here is imported from a live path: `useFollowedPersonas`
 * reaches this module exclusively behind `if (demoMode)`, and the live branch
 * reads the API.
 *
 * WHY A SEED SET AT ALL. `DEMO_SUBPROFILES` ships almost every persona with
 * `viewerFollowing: false`, so deriving the list from the registry alone would
 * show a single row and miss both address shapes the row has to build. The
 * list carries three follows: NIGHTFORM (unlinked, addressed by its global
 * handle `/p/:handle`) is followed in the registry itself, and this set seeds
 * the other two, one linked persona addressed under its creator
 * (`/members/:ownerSlug/:slug`) and one more unlinked venue.
 *
 * A persona the registry already marks followed stays OUT of this set. The
 * persona page and the Studio artist hero unfollow through `useFollow`, which
 * flips only the registry (`mockSetFollowing`); a seed entry for the same id
 * would keep it listed here and make `demoIsFollowingArtist` report it
 * followed again on the next Studio read.
 *
 * ONE SOURCE OF TRUTH FOR THE TOGGLE. Unfollowing in demo goes through
 * `mockUnfollowPersona` below, which flips the shared registry state via
 * `mockSetFollowing` (so the persona's own page agrees) AND drops the id from
 * this seed. Without the second half, a persona seeded here would come back on
 * the next read of the list, which is exactly the kind of demo bug that reads
 * as a broken product.
 */
const seededFollowedIds = new Set<string>([
  // Linked, published, addressed under its creator's profile slug.
  "sp-anika-writer",
  // Unlinked, published, a venue persona.
  "sp-tomas-casa-corvo",
]);

/**
 * The demo instants each starting follow was made at (seeded or already in
 * the registry), hand-dated into the PAST
 * like every other demo fixture in this repo, so a "followed 3 weeks ago" line
 * reads correctly without depending on when the demo is opened.
 */
const seededFollowedAt: Record<string, string> = {
  "sp-diogo-nightform": "2025-11-18T20:10:00.000Z",
  "sp-anika-writer": "2025-10-02T09:25:00.000Z",
  "sp-tomas-casa-corvo": "2025-08-14T18:40:00.000Z",
};

/** Whether the demo viewer follows this persona right now. */
const isDemoFollowed = (personaId: string, viewerFollowing: boolean): boolean =>
  viewerFollowing || seededFollowedIds.has(personaId);

/**
 * `GET /subprofiles/following` mock: every demo persona the viewer follows
 * that is still publicly readable, newest follow first, paged the way the
 * endpoint pages.
 *
 * Applies the same visibility gate the server applies (published + open), so
 * the demo can never show a row the live product would withhold.
 */
export const mockFollowedPersonas = (
  page: number,
  pageSize: number,
): FollowedPersonasPage => {
  const rows: FollowedPersonaDTO[] = DEMO_SUBPROFILES.filter(
    (persona) =>
      persona.status === "published" &&
      persona.visibility === "open" &&
      isDemoFollowed(persona.id, persona.viewerFollowing),
  ).map((persona) => {
    const isLinked = persona.linkVisibility === "linked";
    return {
      id: persona.id,
      displayName: persona.displayName,
      kind: persona.kind,
      tagline: persona.tagline,
      avatarUrl: persona.avatarUrl,
      accent: persona.accent,
      slug: persona.slug,
      // Mirrors the server: a handle always wins the address regardless of
      // link visibility (`personaOwnerAddress`), so it ships for both kinds;
      // only `ownerSlug`/`ownerName` below stay linked-only, on the
      // anonymity rule.
      handle: persona.handle,
      linkVisibility: persona.linkVisibility,
      ownerSlug: isLinked ? persona.ownerSlug : null,
      // Same linked-only rule as `ownerSlug`: only a linked persona lends its
      // owner's name to the row's "Owner Name | Dancer" title.
      ownerName: isLinked ? persona.ownerName : null,
      followerCount: persona.followerCount,
      followedAt: seededFollowedAt[persona.id] ?? "2025-12-01T12:00:00.000Z",
    };
  });
  rows.sort((left, right) => right.followedAt.localeCompare(left.followedAt));
  const start = (page - 1) * pageSize;
  return {
    items: rows.slice(start, start + pageSize),
    total: rows.length,
    page,
    pageSize,
  };
};

/**
 * `DELETE /subprofiles/:id/follow` mock for this surface. Flips the shared
 * registry state so the persona's own page agrees, then drops the seed so the
 * row does not reappear on the next read.
 */
export const mockUnfollowPersona = (personaId: string): void => {
  mockSetFollowing(personaId, false);
  seededFollowedIds.delete(personaId);
};
