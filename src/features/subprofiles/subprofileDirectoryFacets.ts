import type { SubprofileCardDTO, SubprofileKind } from "./api/subprofiles.api";

/** The persona availability value the "Open to collabs" toggle narrows to. */
const OPEN_TO_COLLABS = "open_to_collabs";

/**
 * The directory's four narrowing predicates, kept apart from the hook that
 * combines them so each facet's counts can be taken under the OTHER three.
 *
 * That is the whole reason these are separate one-liners rather than a single
 * `matchesAll`: a profession chip's badge has to say how many personas it would
 * yield under the current tags, availability and search, but NOT under the
 * profession selection itself. Counting a facet under its own selection is what
 * makes a multi-select row where every unpicked chip reads 0.
 */
export const matchesKind = (
  card: SubprofileCardDTO,
  kinds: readonly SubprofileKind[],
) => kinds.length === 0 || kinds.includes(card.kind);

export const matchesTags = (card: SubprofileCardDTO, tags: readonly string[]) =>
  tags.length === 0 || card.tags.some((tag) => tags.includes(tag));

export const matchesOpenToCollabs = (
  card: SubprofileCardDTO,
  isOpenToCollabsOnly: boolean,
) => !isOpenToCollabsOnly || card.availability === OPEN_TO_COLLABS;

/** `term` must already be trimmed and lower-cased. An empty term matches all. */
export const matchesQuery = (card: SubprofileCardDTO, term: string) =>
  term === "" ||
  card.displayName.toLowerCase().includes(term) ||
  (card.tagline ?? "").toLowerCase().includes(term);

/** How many of `cards` carry each profession (`kind`). */
export function countByKind(
  cards: readonly SubprofileCardDTO[],
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const card of cards) {
    counts[card.kind] = (counts[card.kind] ?? 0) + 1;
  }
  return counts;
}

/** How many of `cards` carry each tag. A card counts once per distinct tag. */
export function countByTag(
  cards: readonly SubprofileCardDTO[],
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const card of cards) {
    for (const tag of new Set(card.tags)) {
      counts[tag] = (counts[tag] ?? 0) + 1;
    }
  }
  return counts;
}

/**
 * The `cap` most-common tags across the WHOLE fetched set, most-frequent
 * first, ties broken alphabetically so the row is stable between renders.
 *
 * The vocabulary deliberately comes from every persona rather than from the
 * currently filtered ones: chips that vanished as a member narrowed would move
 * the row under their cursor. What moves instead is each chip's count, and a
 * tag that reaches 0 dims in place (`ChipSelect`).
 */
export function topTags(cards: readonly SubprofileCardDTO[], cap: number) {
  const counts = countByTag(cards);
  return Object.keys(counts)
    .sort((a, b) => (counts[b] ?? 0) - (counts[a] ?? 0) || a.localeCompare(b))
    .slice(0, cap);
}
