import { DEMO_SUBPROFILES, mockDirectory } from "./data/subprofiles.data";
import type {
  FollowedPersonaDTO,
  FollowedPersonasPage,
  SubprofileCardDTO,
} from "./api/subprofiles.api";

/**
 * Demo fixture for "the personas you follow" (PRD-208).
 *
 * DEMO ONLY. Nothing here is imported from a live path:
 * `useFollowedPersonasInfinite` reaches this module exclusively behind
 * `if (demoMode)`, and the live branch reads the API.
 *
 * ONE SOURCE OF TRUTH. The list is derived from the persona registry alone:
 * a row is every persona whose `viewerFollowing` flag is set, dated by its
 * `viewerFollowedAt`. This module keeps no follow state of its own, so the
 * persona page, the Studio artist hero and the Follow button on this list's
 * cards (all through `useFollow`) write the same flag through
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

/** Joins a row's sort key into the opaque `nextCursor` the demo hands out. */
const CURSOR_SEPARATOR = "|";

/**
 * The directory card's fields for a followed row, copied from the demo
 * directory's own card for the same persona, so the "You follow" tab draws
 * exactly the card "Everyone" draws (picture, pill, tags, credits). A persona
 * the directory leaves out (owner-removed) gets the card's defaults.
 */
function cardFieldsFor(
  card: SubprofileCardDTO | undefined,
): Partial<FollowedPersonaDTO> {
  if (!card) {
    return {
      coverUrl: null,
      availability: null,
      tags: [],
      viewerFollowing: true,
      viewerIsMember: false,
    };
  }
  return {
    ...(card.table ? { table: card.table } : {}),
    coverUrl: card.coverUrl,
    crop: card.crop ?? null,
    coverCrop: card.coverCrop ?? null,
    availability: card.availability,
    availabilityUpdatedAt: card.availabilityUpdatedAt ?? null,
    tags: card.tags,
    viewerFollowing: card.viewerFollowing ?? true,
    viewerIsMember: card.viewerIsMember ?? false,
    ...(card.credits ? { credits: card.credits } : {}),
  };
}

/**
 * Every demo persona the viewer follows that is still publicly readable,
 * newest follow first, ties broken by id so the order (and so the cursor) is
 * total. Applies the same visibility gate the server applies (published +
 * open), so the demo can never show a row the live product would withhold.
 */
function followedRows(): FollowedPersonaDTO[] {
  const directoryCardsById = new Map<string | undefined, SubprofileCardDTO>(
    mockDirectory().map((card) => [card.id, card]),
  );
  const rows: FollowedPersonaDTO[] = DEMO_SUBPROFILES.filter(
    (persona) =>
      persona.status === "published" &&
      persona.visibility === "open" &&
      persona.viewerFollowing,
  ).map((persona) => {
    const isLinked = persona.linkVisibility === "linked";
    return {
      ...cardFieldsFor(directoryCardsById.get(persona.id)),
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
  rows.sort(
    (left, right) =>
      compareCodeUnits(right.followedAt, left.followedAt) ||
      compareCodeUnits(right.id, left.id),
  );
  return rows;
}

/** Plain code-unit order, the same order the cursor's `<` checks read, so
 *  the sort and the keyset can never disagree the way a locale-aware compare
 *  could over hyphens or case. */
const compareCodeUnits = (left: string, right: string): number =>
  left < right ? -1 : left > right ? 1 : 0;

const cursorFor = (row: FollowedPersonaDTO): string =>
  `${row.followedAt}${CURSOR_SEPARATOR}${row.id}`;

/** One page of `rows` starting at `startIndex`, with the cursor for the next
 *  page, or null when this page reaches the end. */
function pageOf(
  rows: FollowedPersonaDTO[],
  startIndex: number,
  pageSize: number,
): FollowedPersonasPage {
  const items = rows.slice(startIndex, startIndex + pageSize);
  const lastItem = items.at(-1);
  const hasMoreRows = startIndex + pageSize < rows.length;
  return {
    items,
    total: rows.length,
    page: Math.floor(startIndex / pageSize) + 1,
    pageSize,
    nextCursor: hasMoreRows && lastItem ? cursorFor(lastItem) : null,
  };
}

/** `GET /subprofiles/following?page=` mock, paged the way the endpoint pages
 *  by number. */
export const mockFollowedPersonas = (
  page: number,
  pageSize: number,
): FollowedPersonasPage =>
  pageOf(followedRows(), (page - 1) * pageSize, pageSize);

/**
 * `GET /subprofiles/following?before=` mock: the rows strictly after the
 * cursor's (followedAt, id) key, read from the key itself rather than from
 * the row it came from. That is what makes it keyset paging: a row unfollowed
 * in place has left the registry's list, and the next page still starts in
 * the right place.
 */
export const mockFollowedPersonasAfter = (
  cursor: string,
  pageSize: number,
): FollowedPersonasPage => {
  const separatorIndex = cursor.indexOf(CURSOR_SEPARATOR);
  const cursorFollowedAt = cursor.slice(0, separatorIndex);
  const cursorId = cursor.slice(separatorIndex + 1);
  const rows = followedRows();
  const startIndex = rows.findIndex(
    (row) =>
      row.followedAt < cursorFollowedAt ||
      (row.followedAt === cursorFollowedAt && row.id < cursorId),
  );
  return pageOf(rows, startIndex === -1 ? rows.length : startIndex, pageSize);
};
