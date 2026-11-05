import { foldForSearch } from "../../../shared/lib/foldForSearch";
import type { CalendarEvent } from "../data";
import { GATHERING_FAMILIES } from "../gatheringCatalog";
import type {
  EventBrowseFacetsDTO,
  EventBrowseFilters,
  EventWhenWindows,
} from "./events.api";

/** A browse filter group a facet count can lift. `when` lifts `from` and
 *  `to` together, since the two bounds are one chip. */
type BrowseFacetGroup = "family" | "when" | "hood" | "type" | "cost";

/** A demo row against one date window. Point-in-time on the start, the way
 *  the demo board has always read `from`/`to`. */
function isInDemoWindow(
  event: CalendarEvent,
  from: string | undefined,
  to: string | undefined,
): boolean {
  const startedAt = event.date.getTime();
  if (from && startedAt < new Date(from).getTime()) return false;
  if (to && startedAt > new Date(to).getTime()) return false;
  return true;
}

/** The lowercased neighbourhood and format, the keys the `hood` and `type`
 *  facets use on the wire. */
const hoodKey = (event: CalendarEvent) => event.hood.toLowerCase();
const typeKey = (event: CalendarEvent) => (event.eventType ?? "").toLowerCase();

/**
 * One demo row against the browse filters (date range, place, kind, cost,
 * free text). `lift` leaves one group's predicate off, which is how
 * `countDemoBrowseFacets` asks "how many would this group's options give,
 * the rest applied". The free text is never lifted.
 */
export function matchesDemoBrowse(
  event: CalendarEvent,
  browse: EventBrowseFilters,
  lift: BrowseFacetGroup | null = null,
): boolean {
  if (lift !== "when" && !isInDemoWindow(event, browse.from, browse.to)) {
    return false;
  }
  if (
    lift !== "hood" &&
    browse.hood &&
    hoodKey(event) !== browse.hood.toLowerCase()
  ) {
    return false;
  }
  if (
    lift !== "family" &&
    browse.family &&
    event.gatheringFamily !== browse.family
  ) {
    return false;
  }
  if (
    lift !== "type" &&
    browse.type &&
    typeKey(event) !== browse.type.toLowerCase()
  ) {
    return false;
  }
  if (lift !== "cost") {
    if (browse.cost === "free" && event.ticketed) return false;
    if (browse.cost === "paid" && !event.ticketed) return false;
  }
  const term = foldForSearch(browse.q?.trim() ?? "");
  if (
    term &&
    !foldForSearch(event.title).includes(term) &&
    !foldForSearch(event.hood).includes(term) &&
    !foldForSearch(event.org).includes(term)
  ) {
    return false;
  }
  return true;
}

/** Adds one to a count map entry, starting it at 0. */
function increment(counts: Record<string, number>, key: string) {
  counts[key] = (counts[key] ?? 0) + 1;
}

/**
 * Demo mode's stand-in for the live `facets`, with the server's rules: each
 * group counted over the rows `matchesDemoBrowse` keeps with that group
 * lifted, `all` a distinct count of those rows, and every date window
 * counted on its own (they overlap, so `all` is counted directly). `events`
 * are the rows the board draws from before the browse filters: the time
 * split and the hidden communities already applied.
 */
export function countDemoBrowseFacets(
  events: readonly CalendarEvent[],
  browse: EventBrowseFilters,
  whenWindows: EventWhenWindows,
): EventBrowseFacetsDTO {
  const familyCounts: Record<string, number> = Object.fromEntries(
    GATHERING_FAMILIES.map((family) => [family.key, 0]),
  );
  const whenCounts: Record<string, number> = Object.fromEntries(
    Object.keys(whenWindows).map((key) => [key, 0]),
  );
  const hoodCounts: Record<string, number> = {};
  const typeCounts: Record<string, number> = {};
  const costCounts: Record<string, number> = { free: 0, paid: 0 };
  const totals = { family: 0, when: 0, hood: 0, type: 0, cost: 0 };
  for (const event of events) {
    if (matchesDemoBrowse(event, browse, "family")) {
      totals.family += 1;
      const family = event.gatheringFamily;
      if (family && family in familyCounts) increment(familyCounts, family);
    }
    if (matchesDemoBrowse(event, browse, "when")) {
      totals.when += 1;
      for (const [key, window] of Object.entries(whenWindows)) {
        if (isInDemoWindow(event, window.from, window.to)) {
          increment(whenCounts, key);
        }
      }
    }
    if (matchesDemoBrowse(event, browse, "hood")) {
      totals.hood += 1;
      if (hoodKey(event)) increment(hoodCounts, hoodKey(event));
    }
    if (matchesDemoBrowse(event, browse, "type")) {
      totals.type += 1;
      if (typeKey(event)) increment(typeCounts, typeKey(event));
    }
    if (matchesDemoBrowse(event, browse, "cost")) {
      totals.cost += 1;
      increment(costCounts, event.ticketed ? "paid" : "free");
    }
  }
  return {
    family: { options: familyCounts, all: totals.family },
    when: { options: whenCounts, all: totals.when },
    hood: { options: hoodCounts, all: totals.hood },
    type: { options: typeCounts, all: totals.type },
    cost: { options: costCounts, all: totals.cost },
  };
}
