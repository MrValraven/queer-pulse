import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { HOUSING_LISTINGS, type HousingListing } from "../housingListings";
import { getHousingListings } from "./housingListing.api";
import { listingDtoToHousingListing } from "./housingListing.adapters";

const HOUSING_LISTINGS_KEY = "housing-listings";

/** The housing board. Demo returns the colocated fixture (optionally filtered
 * by type) and never hits the network; live queries the member-only directory.
 * An empty array is an honest live state (empty board). */
export function useHousingListings(filter = "all") {
  const { demoMode } = useDemoMode();
  return useQuery<HousingListing[]>({
    queryKey: [HOUSING_LISTINGS_KEY, demoMode, filter],
    initialData: demoMode ? filterListings(HOUSING_LISTINGS, filter) : undefined,
    queryFn: async () => {
      if (demoMode) return filterListings(HOUSING_LISTINGS, filter);
      const page = await getHousingListings({ type: filter });
      return page.items.map(listingDtoToHousingListing);
    },
  });
}

function filterListings(
  listings: HousingListing[],
  filter: string,
): HousingListing[] {
  if (filter === "all") return listings;
  return listings.filter((listing) => listing.type === filter);
}
