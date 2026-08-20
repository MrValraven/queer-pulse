import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { DEMO_MY_HOUSING_LISTINGS, type MyHousingListingRow } from "../myHousingListings.data";
import { economyKeys } from "./economyKeys";
import { dtoToMyHousingListingRow } from "./housingListing.adapters";
import { getMyHousingListings } from "./housingListing.api";

/** HSG-1: the member's own housing listings (any status, filled or not — the
 * owner needs to see and manage everything they've posted). Demo reads the
 * colocated fixture; live fetches `GET /housing-listings/mine`. */
export function useMyHousingListings() {
  const { demoMode } = useDemoMode();
  return useQuery<MyHousingListingRow[]>({
    queryKey: economyKeys.myHousingListings(demoMode),
    initialData: demoMode ? DEMO_MY_HOUSING_LISTINGS : undefined,
    queryFn: async () => {
      if (demoMode) return DEMO_MY_HOUSING_LISTINGS;
      const page = await getMyHousingListings();
      return page.items.map(dtoToMyHousingListingRow);
    },
  });
}
