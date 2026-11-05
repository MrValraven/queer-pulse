import type {
  FlatmateFacets,
  FlatmateFilters,
} from "./api/flatmateProfile.api";
import { LIFESTYLE_TAGS, NEIGHBOURHOODS, type Profile } from "./flatmates.data";

/** The budget band ids `?budgetBand=` takes, which are also the sidebar's
 *  option values. Each range matches the backend's `budgetBandClause`. */
export type FlatmateBudgetBand =
  "upTo700" | "700to900" | "900to1100" | "1100plus";

const BUDGET_BAND_RANGES: Record<
  FlatmateBudgetBand,
  { above: number; upTo: number }
> = {
  upTo700: { above: -Infinity, upTo: 700 },
  "700to900": { above: 700, upTo: 900 },
  "900to1100": { above: 900, upTo: 1100 },
  "1100plus": { above: 1100, upTo: Infinity },
};

function isBudgetBand(value: string): value is FlatmateBudgetBand {
  return value in BUDGET_BAND_RANGES;
}

function isInBudgetBand(budgetEuros: number, band: FlatmateBudgetBand) {
  const range = BUDGET_BAND_RANGES[band];
  return budgetEuros > range.above && budgetEuros <= range.upTo;
}

/** A band's ceiling, sent as `budgetMax` beside `budgetBand` so a server that
 *  predates the band still narrows to everything at or below its top. The
 *  open-ended top band has no ceiling. */
export function budgetCeilingFor(budget: string): number | undefined {
  if (!isBudgetBand(budget)) return undefined;
  const ceiling = BUDGET_BAND_RANGES[budget].upTo;
  return Number.isFinite(ceiling) ? ceiling : undefined;
}

const MOVE_IN_MONTH_KEYS = [
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec",
];

/** Today as `YYYY-MM-DD` in the member's own calendar. */
function todayIsoDate(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

/**
 * The move-in window a live profile sits in, the same windows the backend's
 * `moveInWindowClause` draws: flexible timing or no date is `flex` (the card
 * reads "Flexible" for both), a date today or earlier is `now`, and a later
 * date is its month's key. Demo profiles carry their key in the mock.
 */
export function flatmateMoveInWindow(
  moveInFrom: string | null,
  isFlexibleTiming: boolean,
): string {
  if (isFlexibleTiming || !moveInFrom) return "flex";
  if (moveInFrom <= todayIsoDate()) return "now";
  const monthIndex = Number(moveInFrom.slice(5, 7)) - 1;
  return MOVE_IN_MONTH_KEYS[monthIndex] ?? "";
}

/** One filter group, the unit a facet count lifts. */
type FlatmateFacetGroup =
  "type" | "neighbourhood" | "budget" | "moveIn" | "tags";

/**
 * Whether a profile passes the board's filters, with `lift` leaving one
 * group's own predicates off. The predicates are the directory's
 * (`FlatmateDirectoryService.filteredQb`): neighbourhood compares without
 * case, budget applies the band and its ceiling, and tags read `tagMatch`
 * (`all` needs every chosen tag, the default `any` needs one). The board
 * never sends `moveInBy`, so it has no mirror here.
 */
export function matchesFlatmateFilters(
  profile: Profile,
  filters: FlatmateFilters,
  lift: FlatmateFacetGroup | null = null,
): boolean {
  const { type, neighbourhood, budgetBand, budgetMax, moveIn, tags } = filters;
  if (lift !== "type" && type && profile.type !== type) return false;
  if (
    lift !== "neighbourhood" &&
    neighbourhood &&
    profile.neighbourhood.toLowerCase() !== neighbourhood.toLowerCase()
  )
    return false;
  if (lift !== "budget") {
    if (budgetMax !== undefined && profile.budgetRange > budgetMax)
      return false;
    if (
      budgetBand &&
      isBudgetBand(budgetBand) &&
      !isInBudgetBand(profile.budgetRange, budgetBand)
    )
      return false;
  }
  if (lift !== "moveIn" && moveIn && profile.moveinKey !== moveIn) return false;
  if (lift !== "tags" && tags && tags.length > 0) {
    const hasTag = (tag: string) => profile.tags.includes(tag);
    const isTagMatch =
      filters.tagMatch === "all" ? tags.every(hasTag) : tags.some(hasTag);
    if (!isTagMatch) return false;
  }
  return true;
}

/**
 * Demo mode's stand-in for the directory's `facets`, over the whole mock with
 * the same rules: each group counted with its own predicates lifted and the
 * rest applied, the "Any" totals counted (never summed), neighbourhoods keyed
 * lowercased, and a profile counted once under each of its tags. Tags count
 * against the full selection under `tagMatch=all`, the way the server does.
 */
export function countDemoFlatmateFacets(
  profiles: readonly Profile[],
  filters: FlatmateFilters,
): FlatmateFacets {
  const facets: FlatmateFacets = {
    type: { seeking: 0, offering: 0 },
    allTypes: 0,
    neighbourhood: {},
    allNeighbourhoods: 0,
    budget: { upTo700: 0, "700to900": 0, "900to1100": 0, "1100plus": 0 },
    allBudgets: 0,
    moveIn: {},
    allMoveIns: 0,
    tags: {},
  };
  const tagLift = filters.tagMatch === "all" ? null : "tags";
  const increment = (counts: Record<string, number>, key: string) => {
    counts[key] = (counts[key] ?? 0) + 1;
  };
  for (const profile of profiles) {
    if (matchesFlatmateFilters(profile, filters, "type")) {
      increment(facets.type, profile.type);
      facets.allTypes += 1;
    }
    if (matchesFlatmateFilters(profile, filters, "neighbourhood")) {
      const neighbourhoodKey = profile.neighbourhood.toLowerCase();
      if (neighbourhoodKey) increment(facets.neighbourhood, neighbourhoodKey);
      facets.allNeighbourhoods += 1;
    }
    if (matchesFlatmateFilters(profile, filters, "budget")) {
      for (const band of Object.keys(BUDGET_BAND_RANGES)) {
        if (isBudgetBand(band) && isInBudgetBand(profile.budgetRange, band))
          increment(facets.budget, band);
      }
      facets.allBudgets += 1;
    }
    if (matchesFlatmateFilters(profile, filters, "moveIn")) {
      if (profile.moveinKey) increment(facets.moveIn, profile.moveinKey);
      facets.allMoveIns += 1;
    }
    if (matchesFlatmateFilters(profile, filters, tagLift)) {
      for (const tag of new Set(profile.tags)) increment(facets.tags, tag);
    }
  }
  return facets;
}

/** Per-option counts for one sidebar group, keyed by option value with
 *  `"all"` for its "Any" row. A missing entry draws no number. */
export type FlatmatesGroupCounts = Partial<Record<string, number>>;

export interface FlatmatesOptionCounts {
  type: FlatmatesGroupCounts | undefined;
  neighbourhood: FlatmatesGroupCounts | undefined;
  budget: FlatmatesGroupCounts | undefined;
  moveIn: FlatmatesGroupCounts | undefined;
  tags: FlatmatesGroupCounts | undefined;
}

/** Counts for a fixed option list out of a facet map that leaves zeros out
 *  (neighbourhoods and tags): an option absent from the map has nobody. */
function countsForOptions(
  options: readonly string[],
  counts: Record<string, number>,
  keyFor: (option: string) => string,
): Record<string, number> {
  return Object.fromEntries(
    options.map((option) => [option, counts[keyFor(option)] ?? 0]),
  );
}

/**
 * The sidebar's counts out of the read's facets. Undefined facets (first page
 * in flight, a failed read, a server that predates them) leave every group
 * undefined, and a group the server left out stays undefined on its own, so
 * no row ever draws a 0 nobody counted.
 */
export function flatmatesOptionCounts(
  facets: FlatmateFacets | undefined,
): FlatmatesOptionCounts {
  const withAny = (
    counts: Record<string, number> | undefined,
    anyCount: number | undefined,
  ): FlatmatesGroupCounts | undefined =>
    counts ? { ...counts, all: anyCount } : undefined;
  const neighbourhoodCounts = facets?.neighbourhood
    ? countsForOptions(NEIGHBOURHOODS, facets.neighbourhood, (name) =>
        name.toLowerCase(),
      )
    : undefined;
  const tagCounts = facets?.tags
    ? countsForOptions(LIFESTYLE_TAGS, facets.tags, (tag) => tag)
    : undefined;
  return {
    type: withAny(facets?.type, facets?.allTypes),
    neighbourhood: withAny(neighbourhoodCounts, facets?.allNeighbourhoods),
    budget: withAny(facets?.budget, facets?.allBudgets),
    // A window nobody sits in is left out of the map, so it reads as 0 once
    // the group is counted at all.
    moveIn: facets?.moveIn
      ? withAny(
          { now: 0, jul: 0, aug: 0, flex: 0, ...facets.moveIn },
          facets.allMoveIns,
        )
      : undefined,
    tags: tagCounts,
  };
}
