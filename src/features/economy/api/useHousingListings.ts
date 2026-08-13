import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { HOUSING_LISTINGS, type HousingListing } from "../housingListings";
import {
  EMPTY_HOUSING_FILTERS,
  matchesHousingFilters,
  type HousingFilters,
} from "../housingFilters";
import { getHousingListings } from "./housingListing.api";
import { listingDtoToHousingListing } from "./housingListing.adapters";

const HOUSING_LISTINGS_KEY = "housing-listings";

/** The housing board. Demo returns the colocated fixture (filtered client-side
 * by the same criteria the backend applies) and never hits the network; live
 * queries the member-only directory with the filters as server-side query
 * params. An empty array is an honest live state (empty board). */
export function useHousingListings(
  filters: HousingFilters = EMPTY_HOUSING_FILTERS,
) {
  const { demoMode } = useDemoMode();
  return useQuery<HousingListing[]>({
    // The full filter set is part of the key so demo + live both refetch/
    // re-derive when any filter changes; demoMode keeps the two caches apart.
    queryKey: [HOUSING_LISTINGS_KEY, demoMode, filters],
    initialData: demoMode
      ? HOUSING_LISTINGS.filter((listing) =>
          matchesHousingFilters(listing, filters),
        )
      : undefined,
    queryFn: async () => {
      if (demoMode) {
        return HOUSING_LISTINGS.filter((listing) =>
          matchesHousingFilters(listing, filters),
        );
      }
      const page = await getHousingListings(filters);
      return page.items.map(listingDtoToHousingListing);
    },
    placeholderData: keepPreviousData,
  });
}
