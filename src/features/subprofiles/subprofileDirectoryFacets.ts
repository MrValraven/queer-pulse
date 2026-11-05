import type {
  SubprofileCardDTO,
  SubprofileDirectoryFacetsDTO,
  SubprofileDirectoryRefinement,
  SubprofileKind,
  TableChipFormat,
  TableFormat,
  TableVibe,
} from "./api/subprofiles.api";
import { TABLE_VIBES } from "./questTable.data";
import { KIND_LABEL_KEYS } from "./subprofile-kinds";
import { AVAILABILITY_OPTIONS } from "./subprofilePresence.data";

/** How many of the directory's most-used tags the sidebar is offered; the
 *  endpoint's `DIRECTORY_FACET_TAG_CAP`. */
export const DIRECTORY_FACET_TAG_CAP = 20;

const TABLE_CHIP_FORMATS: readonly TableChipFormat[] = ["online", "in_person"];

/** A facet group, named as its server param. */
export type DirectoryFacetGroup = keyof SubprofileDirectoryRefinement;

/**
 * The directory's narrowing predicates, the demo mirror of the endpoint's
 * `subprofile-directory-refinement.ts`. Live mode filters and counts on the
 * server (`GET /subprofiles/directory` takes every group as a param and
 * returns a `facets` block); demo mode runs these over the mock directory
 * inside the query function, so both modes hand the page the same shape:
 * an already-narrowed set plus its facet counts.
 *
 * They stay separate one-liners so each
 * facet's counts can be taken under the OTHERS: a profession chip's badge has
 * to say how many personas it would yield under the current tags and
 * availability, but NOT under the profession selection itself. Counting a
 * facet under its own selection is what makes a multi-select row where every
 * unpicked chip reads 0.
 *
 * `matchesTable` is the Quest personas' "At the table" facet (format and table
 * vibe), which only a card carrying a `table` summary can pass once one of its
 * chips is on.
 *
 * There is no free-text predicate here. Search is a server param
 * (`?query=`), and the demo fixture applies its own copy of it
 * (`mockDirectory`), so the set these run over has already been searched.
 */
export const matchesKind = (
  card: SubprofileCardDTO,
  kinds: readonly SubprofileKind[],
) => kinds.length === 0 || kinds.includes(card.kind);

export const matchesTags = (card: SubprofileCardDTO, tags: readonly string[]) =>
  tags.length === 0 || card.tags.some((tag) => tags.includes(tag));

export const matchesAvailability = (
  card: SubprofileCardDTO,
  availability: string | undefined,
) => !availability || card.availability === availability;

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

/** Every refinement group except `lift`, so a count can lift its own group. */
export function matchesRefinement(
  card: SubprofileCardDTO,
  refinement: SubprofileDirectoryRefinement,
  lift?: DirectoryFacetGroup,
): boolean {
  return (
    (lift === "kinds" || matchesKind(card, refinement.kinds ?? [])) &&
    (lift === "tags" || matchesTags(card, refinement.tags ?? [])) &&
    (lift === "availability" ||
      matchesAvailability(card, refinement.availability)) &&
    matchesTable(
      card,
      lift === "tableFormats" ? [] : (refinement.tableFormats ?? []),
      lift === "tableVibes" ? [] : (refinement.tableVibes ?? []),
    )
  );
}

/** Each of `options` keyed to its count in `counts`, 0 when absent, so the
 *  map carries the full vocabulary the way the endpoint's does. */
function fillCounts<Option extends string>(
  options: readonly Option[],
  counts: Record<string, number>,
): Record<Option, number> {
  return Object.fromEntries(
    options.map((option) => [option, counts[option] ?? 0]),
  ) as Record<Option, number>;
}

/**
 * The demo directory's `facets` block, with the endpoint's semantics
 * (`countSubprofileDirectoryFacets`): every group counted over `searchedPool`
 * with its own selection lifted and the others applied, the AND vibe group
 * counted under the vibes already picked, and the tag vocabulary drawn from
 * `visibleDirectory` (the whole unsearched directory) plus any picked tag.
 */
export function countDirectoryFacets(
  searchedPool: readonly SubprofileCardDTO[],
  visibleDirectory: readonly SubprofileCardDTO[],
  refinement: SubprofileDirectoryRefinement,
): SubprofileDirectoryFacetsDTO {
  const poolWithout = (lift?: DirectoryFacetGroup) =>
    searchedPool.filter((card) => matchesRefinement(card, refinement, lift));
  const tagVocabulary = [
    ...new Set([
      ...topTags(visibleDirectory, DIRECTORY_FACET_TAG_CAP),
      ...(refinement.tags ?? []),
    ]),
  ];
  const tagCounts = countByTag(poolWithout("tags"));
  const availabilityCounts: Record<string, number> = {};
  for (const card of poolWithout("availability")) {
    if (card.availability === null) continue;
    availabilityCounts[card.availability] =
      (availabilityCounts[card.availability] ?? 0) + 1;
  }
  return {
    kinds: fillCounts(
      Object.keys(KIND_LABEL_KEYS) as SubprofileKind[],
      countByKind(poolWithout("kinds")),
    ),
    tags: tagVocabulary.map((tag) => ({ tag, count: tagCounts[tag] ?? 0 })),
    availability: fillCounts(
      AVAILABILITY_OPTIONS.map((option) => option.value),
      availabilityCounts,
    ),
    tableFormats: fillCounts(
      TABLE_CHIP_FORMATS,
      countByTableFormat(poolWithout("tableFormats")),
    ),
    tableVibes: countByTableVibe(poolWithout()),
  };
}
