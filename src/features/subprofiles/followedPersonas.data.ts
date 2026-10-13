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
 * ONE SOURCE OF TRUTH. The list is derived from the persona registry alone:
 * a row is every persona whose `viewerFollowing` flag is set, dated by its
 * `viewerFollowedAt`. This module keeps no follow state of its own, so the
 * persona page, the Studio artist hero (`useFollow`) and the unfollow button
 * on this list (`mockUnfollowPersona`) all write the same flag through
 * `mockSetFollowing`, and a follow or an unfollow made on one surface shows
 * on every other one. To start the demo following a persona, set both
 * fields on its registry entry.
 *
 * The registry starts the viewer following three personas so the list shows
 * both link shapes: NIGHTFORM and Casa Corvo (unlinked, so the row carries no
 * owner) and Anika Kovač's poetry (linked, so the row carries its creator's
 * slug and name). Their follow instants are
 * hand-dated into the PAST like every other demo fixture in this repo, so a
 * "followed 3 weeks ago" line reads correctly whenever the demo is opened.
 */

/** Dates a follow the registry holds without a timestamp. */
const UNDATED_FOLLOW_AT = "2025-12-01T12:00:00.000Z";

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
      persona.viewerFollowing,
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
      followedAt: persona.viewerFollowedAt ?? UNDATED_FOLLOW_AT,
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
 * `DELETE /subprofiles/:id/follow` mock for this surface. Clears the registry
 * flag the list is derived from, so the row leaves this list and the
 * persona's own page shows Follow again.
 */
export const mockUnfollowPersona = (personaId: string): void => {
  mockSetFollowing(personaId, false);
};
