import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { ADMIN_RESOURCE_LISTINGS_DEMO } from "../adminResourceListings.data";
import {
  getAdminResourceListings,
  type AdminResourceListingDTO,
  type ResourceListingCategory,
} from "./adminResourceListings.api";

export const ADMIN_RESOURCE_LISTINGS_KEY = "admin-resource-listings";

/** Every resource listing (active or archived), for the admin CRUD table.
 *  Demo mode returns the (deliberately empty) colocated fixture and never
 *  hits the network — CNT-14 demands zero fabricated listing entries, ever,
 *  so the demo directory is honestly empty rather than pretend-populated
 *  (mirrors `useAdminOrgTiers`/`ADMIN_ORG_TIERS_DEMO`). */
export function useAdminResourceListings(category?: ResourceListingCategory) {
  const { demoMode } = useDemoMode();
  return useQuery<AdminResourceListingDTO[]>({
    queryKey: [ADMIN_RESOURCE_LISTINGS_KEY, demoMode, category],
    initialData: demoMode ? ADMIN_RESOURCE_LISTINGS_DEMO : undefined,
    queryFn: () =>
      demoMode
        ? ADMIN_RESOURCE_LISTINGS_DEMO
        : getAdminResourceListings(category),
  });
}
