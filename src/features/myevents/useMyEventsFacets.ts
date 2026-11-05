import { useMemo } from "react";
import type { FilterKey, MyEvent, Pill } from "./myEvents.types";
import { countFilterFacets, countPillFacets } from "./myEvents.facets";

interface FacetDeps {
  events: MyEvent[];
  pill: Pill;
  selectedDate: string | null;
  searchTerm: string;
  activeFilters: Record<FilterKey, boolean>;
  viewY: number;
  viewM: number;
  /** Whether `events` is the member's whole list, loaded without error. */
  isCountable: boolean;
}

export interface MyEventsFacets {
  /** Events each bucket pill would list. Undefined while the list is loading,
   *  failed, or arrived only in part, which draws no number. */
  pillCounts: Record<Pill, number> | undefined;
  /** Events each filter chip would list, on the same terms. */
  filterCounts: Record<FilterKey, number> | undefined;
}

/**
 * The availability counts the "Refine" drawer draws beside each pill and
 * chip. Both run over the local mirror, so an optimistic RSVP moves them at
 * once. They stay undefined until the list is whole: a count over part of a
 * member's events would read as fewer than they have, and only a counted
 * zero may take a choice away.
 */
export function useMyEventsFacets({
  events,
  pill,
  selectedDate,
  searchTerm,
  activeFilters,
  viewY,
  viewM,
  isCountable,
}: FacetDeps): MyEventsFacets {
  return useMemo(() => {
    if (!isCountable) return { pillCounts: undefined, filterCounts: undefined };
    const state = { searchTerm, activeFilters, viewY, viewM };
    return {
      pillCounts: countPillFacets(events, state),
      filterCounts: countFilterFacets(events, pill, selectedDate, state),
    };
  }, [
    events,
    pill,
    selectedDate,
    searchTerm,
    activeFilters,
    viewY,
    viewM,
    isCountable,
  ]);
}
