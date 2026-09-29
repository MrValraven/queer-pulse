import type {
  SubprofileCardDTO,
  SubprofileKind,
  TableFormat,
  TableVibe,
} from "./api/subprofiles.api";
import { TABLE_VIBES } from "./questTable.data";

/** The persona availability value the "Open to collabs" toggle narrows to. */
const OPEN_TO_COLLABS = "open_to_collabs";

/**
 * The directory's narrowing predicates, kept apart from the hook that combines
 * them so each facet's counts can be taken under the OTHERS.
 *
 * That is the whole reason these are separate one-liners rather than a single
 * `matchesAll`: a profession chip's badge has to say how many personas it would
 * yield under the current tags and availability, but NOT under the profession
 * selection itself. Counting a facet under its own selection is what makes a
 * multi-select row where every unpicked chip reads 0.
 *
 * `matchesTable` is the Quest personas' "At the table" facet (format and table
 * vibe), which only a card carrying a `table` summary can pass once one of its
 * chips is on.
 *
 * There is no free-text predicate here any more. Search is a server param now
 * (`GET /subprofiles/directory?query=`), so the set these run over has already
 * been searched, and a second browser-side spelling of the same ILIKE would be
 * a filter nobody could see running.
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

/** The "At the table" facet. Format chips OR (a "both" table matches either),
 *  vibe chips AND (a table must carry every picked vibe). With any chip on, a
 *  card without table data is out: it has said nothing about how it runs. */
export const matchesTable = (
  card: SubprofileCardDTO,
  formats: readonly TableFormat[],
  vibes: readonly TableVibe[],
) => {
  if (formats.length === 0 && vibes.length === 0) return true;
  const table = card.table;
  if (!table) return false;
  const matchesFormat =
    formats.length === 0 ||
    table.format === "both" ||
    (table.format !== null && formats.includes(table.format));
  return matchesFormat && vibes.every((vibe) => table.vibe.includes(vibe));
};

/** How many `cards` each format chip would keep; a "both" table counts for
 *  online AND in person. `both` itself is never a chip, so it stays 0. */
export function countByTableFormat(
  cards: readonly SubprofileCardDTO[],
): Record<TableFormat, number> {
  const counts: Record<TableFormat, number> = {
    online: 0,
    in_person: 0,
    both: 0,
  };
  for (const card of cards) {
    const format = card.table?.format;
    if (format === "online" || format === "both") counts.online += 1;
    if (format === "in_person" || format === "both") counts.in_person += 1;
  }
  return counts;
}

/** How many `cards` carry each table vibe. A card counts once per vibe. */
export function countByTableVibe(
  cards: readonly SubprofileCardDTO[],
): Record<TableVibe, number> {
  const counts = Object.fromEntries(
    TABLE_VIBES.map((vibe) => [vibe, 0]),
  ) as Record<TableVibe, number>;
  for (const card of cards) {
    for (const vibe of new Set(card.table?.vibe ?? [])) counts[vibe] += 1;
  }
  return counts;
}
