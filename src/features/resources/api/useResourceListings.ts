import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  getResourceListings,
  type ResourceListingResponseDTO,
} from "./resources.api";

/**
 * Real `ResourceListing` rows for one directory category ("legal_aid" |
 * "sexual_health_testing" — CNT-14). Demo mode never calls this: the Legal
 * and Sexual Health pages keep their own colocated mock arrays for the demo
 * branch unchanged, so the query is simply disabled there (`enabled:
 * !demoMode`) rather than returning a synthetic fixture. Live mode fetches
 * `GET /resources/listings?category=`.
 */
export function useResourceListings(category: string) {
  const { demoMode } = useDemoMode();
  const query = useQuery<ResourceListingResponseDTO[]>({
    queryKey: ["resource-listings", category],
    enabled: !demoMode,
    queryFn: () => getResourceListings(category),
  });
  return {
    listings: query.data ?? [],
    isLoading: query.isLoading,
  };
}
