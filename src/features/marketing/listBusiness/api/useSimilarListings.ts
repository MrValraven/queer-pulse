import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../../app/providers/DemoModeProvider";
import { useDebouncedValue } from "../../../../shared/hooks";
import { findDuplicates } from "../listBusiness.data";
import { getSimilarListings, type SimilarListing } from "./listings.api";

/**
 * Live duplicate detection for the wizard's name field (item #5). Replaces the
 * old always-local `findDuplicates` (a substring match against a hardcoded seed
 * of six places) with a debounced query against the real directory — by name
 * AND, once the member has placed a pin, by proximity — so an already-listed
 * place is actually caught instead of giving a false "you're the first".
 *
 * Demo mode keeps the local seed match (no backend), so the standalone
 * prototype still surfaces a plausible look-alike.
 */
export function useSimilarListings(
  name: string,
  coords?: { latitude: number; longitude: number } | null,
  /** The listing being edited, so it doesn't surface as a duplicate of
   *  itself when the wizard re-checks its own (unchanged) name. */
  excludeRef?: string,
): SimilarListing[] {
  return useSimilarListingsQuery(name, coords, excludeRef).listings;
}

export interface SimilarListingsResult {
  listings: SimilarListing[];
  isLoading: boolean;
  /** True when the look-alike read failed (DES-22). The wizard's hint fails
   *  quietly — it is a courtesy, never the member's answer — but the flag has
   *  to exist so "no look-alikes" is never a disguised outage. */
  isError: boolean;
  /** Re-run the failed read. */
  refetch: () => void;
}

/**
 * The same read as `useSimilarListings`, with the query state attached
 * (DES-22). `useSimilarListings` stays the array-returning convenience for the
 * wizard hint.
 */
export function useSimilarListingsQuery(
  name: string,
  coords?: { latitude: number; longitude: number } | null,
  excludeRef?: string,
): SimilarListingsResult {
  const { demoMode } = useDemoMode();
  const debouncedName = useDebouncedValue(name.trim(), 300);
  const enabled = debouncedName.length >= 3;

  const query = useQuery<SimilarListing[]>({
    queryKey: [
      "listings",
      "similar",
      debouncedName,
      coords?.latitude ?? null,
      coords?.longitude ?? null,
      excludeRef ?? null,
    ],
    enabled: enabled && !demoMode,
    // A stale look-alike list is harmless; don't refetch aggressively.
    staleTime: 60_000,
    // Forward react-query's own cancellation signal into the fetch — a fast
    // retype (new `debouncedName` → new queryKey) cancels the previous
    // keystroke's request at the network layer, not just in the query cache.
    queryFn: ({ signal }) =>
      getSimilarListings(
        debouncedName,
        coords ?? undefined,
        excludeRef,
        signal,
      ),
  });

  const refetch = () => void query.refetch();

  if (!enabled) {
    return { listings: [], isLoading: false, isError: false, refetch };
  }

  if (demoMode) {
    return {
      listings: findDuplicates(debouncedName).map((seed) => ({
        name: seed.name,
        cat: seed.cat,
        hood: seed.hood,
        slug: "",
        distanceM: null,
      })),
      isLoading: false,
      isError: false,
      refetch,
    };
  }

  return {
    listings: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch,
  };
}
