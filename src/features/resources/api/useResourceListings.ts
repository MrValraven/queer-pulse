import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  getResourceListings,
  type ResourceListingResponseDTO,
} from "./resources.api";

/** Stable empty array so a "nothing published" render keeps its identity. */
const EMPTY_LISTINGS: ResourceListingResponseDTO[] = [];

export interface ResourceListingsResult {
  listings: ResourceListingResponseDTO[];
  /** True while the live fetch is in flight. */
  isLoading: boolean;
  /** True when the request failed, so the caller can say so instead of
   *  rendering an empty directory. */
  isError: boolean;
  /** Re-runs the failed request. Wire it to `LoadErrorState`'s `onRetry`. */
  refetch: () => void;
}

/**
 * Real `ResourceListing` rows for one directory category ("legal_aid" |
 * "sexual_health_testing" — CNT-14). Demo mode never calls this: the Legal
 * and Sexual Health pages keep their own colocated mock arrays for the demo
 * branch unchanged, so the query is simply disabled there (`enabled:
 * !demoMode`) rather than returning a synthetic fixture. Live mode fetches
 * `GET /resources/listings?category=`.
 *
 * `isError` is part of the contract because it has to be (DES-24). This hook
 * backs the sexual-health testing directory: for a while a failed fetch here
 * fell into the same empty array as a successful one, so the page told
 * someone looking for HIV or STI testing that the clinic directory did not
 * exist yet. Callers must branch on `isError` before they render any "coming
 * soon" copy.
 */
export function useResourceListings(category: string): ResourceListingsResult {
  const { demoMode } = useDemoMode();
  const query = useQuery<ResourceListingResponseDTO[]>({
    queryKey: ["resource-listings", category],
    enabled: !demoMode,
    queryFn: () => getResourceListings(category),
  });
  return {
    listings: query.data ?? EMPTY_LISTINGS,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: () => void query.refetch(),
  };
}
