import { useMemo } from "react";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import type { DirectoryFacetCountsDTO } from "./api/directoryFacets.api";
import {
  addFacetCounts,
  countLocalFacets,
  facetCountsFromServer,
  keepKnownZeros,
  UNKNOWN_FACET_COUNTS,
  type LocalFacetCounts,
} from "./directoryFacetCounts";
import {
  appendUniquePlaces,
  filterLocalPlaces,
  type LocalFilters,
  type LocalPlace,
} from "./localPlaces";

/** Where the directory's availability counts come from. */
export interface DirectoryFacetSources {
  /** The public grid's places loaded so far (the merged fixture in demo). */
  publicPlaces: LocalPlace[];
  /** True once the public set is whole: loaded, no error, no page to come. */
  isPublicSetComplete: boolean;
  /** The server's counts for the public grid, live only. */
  serverFacets: DirectoryFacetCountsDTO | undefined;
  /** The member-only 18+ places, before any refine filter narrows them. */
  adultCandidates: LocalPlace[];
  /** True while a member has asked for the 18+ shops. */
  isAdultShown: boolean;
  /** True once the 18+ list has loaded without error. */
  isAdultSettled: boolean;
}

/**
 * The directory's availability counts, under one rule for every option: a
 * number is drawn only when it is final, and a count that is not known stays
 * missing (see `directoryFacetCounts`).
 *
 * Demo counts the whole fixture in the browser, with the server's semantics.
 * Live reads the server's `facets`, which cover every filter but "Open now".
 * The 18+ shops come from their own members-only read, complete in one go,
 * so their counts are taken here and added to the server's (the two pools
 * never share a listing). "Open now" is worked out on each place's own clock
 * in the browser, so live it is counted over the loaded places and only once
 * the whole set is in; while it is on, the server's counts cannot know it,
 * and only their zeros stay final (`keepKnownZeros`).
 */
export function useDirectoryFacetCounts(
  sources: DirectoryFacetSources,
  filters: LocalFilters,
): LocalFacetCounts {
  const { demoMode } = useDemoMode();
  const {
    publicPlaces,
    isPublicSetComplete,
    serverFacets,
    adultCandidates,
    isAdultShown,
    isAdultSettled,
  } = sources;
  const isAdultPending = isAdultShown && !isAdultSettled;

  return useMemo(() => {
    if (demoMode) {
      if (!isPublicSetComplete || isAdultPending) return UNKNOWN_FACET_COUNTS;
      const shownPlaces = isAdultShown
        ? appendUniquePlaces(publicPlaces, adultCandidates)
        : publicPlaces;
      return countLocalFacets(shownPlaces, filters);
    }

    let counts = serverFacets
      ? facetCountsFromServer(serverFacets)
      : UNKNOWN_FACET_COUNTS;
    if (isAdultShown) {
      counts = addFacetCounts(
        counts,
        isAdultPending
          ? UNKNOWN_FACET_COUNTS
          : countLocalFacets(adultCandidates, filters),
      );
    }
    if (filters.openNow) counts = keepKnownZeros(counts);
    const openNowCount = isPublicSetComplete
      ? filterLocalPlaces(publicPlaces, { ...filters, openNow: true }).length
      : undefined;
    return {
      ...counts,
      chipCounts: { ...counts.chipCounts, openNow: openNowCount },
    };
  }, [
    demoMode,
    publicPlaces,
    isPublicSetComplete,
    serverFacets,
    adultCandidates,
    isAdultShown,
    isAdultPending,
    filters,
  ]);
}
