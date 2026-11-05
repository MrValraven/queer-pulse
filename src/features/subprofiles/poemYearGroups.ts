import type { SubprofileItemView } from "./api/subprofiles.adapters";

/** A stored poem date the contents can place: `yyyy-mm` or `yyyy-mm-dd`. */
const POEM_DATE_PATTERN = /^(\d{4})-(\d{2})(?:-\d{2})?$/;

export interface PoemDate {
  year: number;
  /** 1 to 12. */
  month: number;
}

/** The year and month of a poem's `date`, or null for anything else (empty,
 *  free text, a bare year). Those poems go to the Undated group. */
export function parsePoemDate(
  value: string | null | undefined,
): PoemDate | null {
  const match = POEM_DATE_PATTERN.exec(value ?? "");
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (month < 1 || month > 12) return null;
  return { year, month };
}

export interface PoemYearGroup {
  /** Null for the Undated group, always the last one. */
  year: number | null;
  items: SubprofileItemView[];
}

/**
 * The poems grouped by year for the contents: newest year first, the
 * persona's own order kept inside each year, and every poem without a usable
 * date gathered in one Undated group at the end.
 */
export function groupPoemsByYear(items: SubprofileItemView[]): PoemYearGroup[] {
  const itemsByYear = new Map<number, SubprofileItemView[]>();
  const undatedItems: SubprofileItemView[] = [];
  for (const item of items) {
    const poemDate = parsePoemDate(item.date);
    if (!poemDate) {
      undatedItems.push(item);
      continue;
    }
    const yearItems = itemsByYear.get(poemDate.year) ?? [];
    yearItems.push(item);
    itemsByYear.set(poemDate.year, yearItems);
  }
  const datedGroups: PoemYearGroup[] = [...itemsByYear.entries()]
    .sort(([leftYear], [rightYear]) => rightYear - leftYear)
    .map(([year, yearItems]) => ({ year, items: yearItems }));
  return undatedItems.length > 0
    ? [...datedGroups, { year: null, items: undatedItems }]
    : datedGroups;
}

/** The earliest and latest year among the poems, or null when none has a
 *  usable date. `from` equals `to` when every dated poem shares one year. */
export function poemsYearSpan(
  items: SubprofileItemView[],
): { from: number; to: number } | null {
  const years = items
    .map((item) => parsePoemDate(item.date)?.year)
    .filter((year): year is number => year !== undefined);
  if (years.length === 0) return null;
  return { from: Math.min(...years), to: Math.max(...years) };
}

/** A short month name for a poem row ("Feb", "fev."), or null when the poem
 *  has no usable date. UTC on both ends, so no time zone shifts the month. */
export function poemMonthLabel(
  value: string | null | undefined,
  language: string,
): string | null {
  const poemDate = parsePoemDate(value);
  if (!poemDate) return null;
  return new Intl.DateTimeFormat(language, {
    month: "short",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(poemDate.year, poemDate.month - 1, 1)));
}
