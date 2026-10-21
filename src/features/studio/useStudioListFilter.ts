import { useMemo } from "react";

/** How a Studio list orders itself. `custom` keeps the order it came in
 *  (a playlist's own order, or the server's newest first). */
export type StudioListSort =
  "custom" | "title" | "artist" | "added" | "duration";

/** Where each sort reads its value. Any accessor left out falls back to the
 *  field names Studio views share (see `defaultAccessors`). */
export interface StudioListSortAccessors<Item> {
  title?: (item: Item) => string | null | undefined;
  artist?: (item: Item) => string | null | undefined;
  /** An ISO date or a timestamp; the newest comes first. */
  added?: (item: Item) => string | number | null | undefined;
  /** Seconds; the shortest comes first. */
  duration?: (item: Item) => number | null | undefined;
}

type FieldBag = Record<string, unknown>;

function fieldOf(value: unknown, ...path: string[]): unknown {
  let current: unknown = value;
  for (const segment of path) {
    if (current === null || typeof current !== "object") return undefined;
    current = (current as FieldBag)[segment];
  }
  return current;
}

function firstText(...candidates: unknown[]): string | null {
  for (const candidate of candidates)
    if (typeof candidate === "string" && candidate.length > 0) return candidate;
  return null;
}

function firstNumber(...candidates: unknown[]): number | null {
  for (const candidate of candidates)
    if (typeof candidate === "number" && Number.isFinite(candidate))
      return candidate;
  return null;
}

/** The field names Studio's views use: a track row or a playlist entry
 *  (`track.title`, `track.release.artist.name`, `addedAt`), a playlist card
 *  (`name`, `credit.name`, `updatedAt`) and a save (`title`, `meta`). */
const defaultAccessors: Required<StudioListSortAccessors<unknown>> = {
  title: (item) =>
    firstText(
      fieldOf(item, "title"),
      fieldOf(item, "name"),
      fieldOf(item, "track", "title"),
    ),
  artist: (item) =>
    firstText(
      fieldOf(item, "artistName"),
      fieldOf(item, "artist", "name"),
      fieldOf(item, "release", "artist", "name"),
      fieldOf(item, "track", "artistName"),
      fieldOf(item, "track", "release", "artist", "name"),
      fieldOf(item, "credit", "name"),
      fieldOf(item, "meta"),
    ),
  added: (item) =>
    firstText(
      fieldOf(item, "addedAt"),
      fieldOf(item, "savedAt"),
      fieldOf(item, "likedAt"),
      fieldOf(item, "updatedAt"),
    ),
  duration: (item) =>
    firstNumber(
      fieldOf(item, "durationSeconds"),
      fieldOf(item, "track", "durationSeconds"),
    ),
};

/** Lower case with the accents taken off, so "sao" finds "São" and "AMOR"
 *  finds "amor". */
export function normalizeStudioFilterText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase()
    .trim();
}

const collator = new Intl.Collator(undefined, {
  sensitivity: "base",
  numeric: true,
});

function timeOf(value: string | number | null | undefined): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string") return null;
  const time = Date.parse(value);
  return Number.isNaN(time) ? null : time;
}

/** Compares two values where a missing one always sorts last. */
function compareMissingLast<Value>(
  left: Value | null,
  right: Value | null,
  compare: (left: Value, right: Value) => number,
): number {
  if (left === null && right === null) return 0;
  if (left === null) return 1;
  if (right === null) return -1;
  return compare(left, right);
}

function comparatorOf<Item>(
  sort: Exclude<StudioListSort, "custom">,
  accessors: StudioListSortAccessors<Item> | undefined,
): (left: Item, right: Item) => number {
  const read = { ...defaultAccessors, ...accessors } as Required<
    StudioListSortAccessors<Item>
  >;
  if (sort === "title" || sort === "artist") {
    const textOf = (item: Item) => {
      const text = read[sort](item);
      return text ? text : null;
    };
    return (left, right) =>
      compareMissingLast(textOf(left), textOf(right), (a, b) =>
        collator.compare(a, b),
      );
  }
  if (sort === "added")
    return (left, right) =>
      compareMissingLast(
        timeOf(read.added(left)),
        timeOf(read.added(right)),
        (a, b) => b - a,
      );
  return (left, right) =>
    compareMissingLast(
      read.duration(left) ?? null,
      read.duration(right) ?? null,
      (a, b) => a - b,
    );
}

/**
 * Filters a list by every word of `query` (each must appear somewhere in
 * `getText(item)`, accents and case ignored), then orders it. Ties keep the
 * order the list came in. Pure, so a test or a non-React caller can use it.
 */
export function filterStudioList<Item>(
  items: readonly Item[],
  query: string,
  sort: StudioListSort,
  getText: (item: Item) => string,
  accessors?: StudioListSortAccessors<Item>,
): Item[] {
  const words = normalizeStudioFilterText(query).split(/\s+/).filter(Boolean);
  const matching =
    words.length === 0
      ? [...items]
      : items.filter((item) => {
          const text = normalizeStudioFilterText(getText(item));
          return words.every((word) => text.includes(word));
        });
  if (sort === "custom") return matching;
  const compare = comparatorOf(sort, accessors);
  // Array.prototype.sort is stable, so equal values keep the incoming order.
  return matching.sort(compare);
}

/**
 * The in-list search and sort for Studio lists (Library, the rail, a
 * playlist, Liked songs). Every item stays in memory, so it covers the whole
 * set the caller has loaded; callers that page load the rest first. Pass a
 * stable `getText` (module level or `useCallback`) to keep the result
 * stable between renders.
 *
 * ```ts
 * const shown = useStudioListFilter(entries, query, "title", entryText);
 * ```
 */
export function useStudioListFilter<Item>(
  items: Item[],
  query: string,
  sort: StudioListSort,
  getText: (item: Item) => string,
  accessors?: StudioListSortAccessors<Item>,
): Item[] {
  return useMemo(
    () => filterStudioList(items, query, sort, getText, accessors),
    [items, query, sort, getText, accessors],
  );
}
