import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { cardDtoToPlace } from "../../marketing/api/directory.adapters";
import { getListingsByMember } from "../../marketing/api/directory.api";
import { registryPlacesForMember, type MemberPlace } from "../places.data";

export interface MemberListingsResult {
  /** The member's public places. Empty until the fetch lands. */
  places: MemberPlace[];
  /**
   * True when the live fetch failed. A failure has to be told apart from a
   * member who genuinely runs nothing (DES-22): the caller shows a retryable
   * error panel instead of the "no places" silence.
   */
  isError: boolean;
  /**
   * True while the live fetch is still out, i.e. `places` being empty says
   * nothing yet. The visitor branch of `PlacesSection` renders `null` for an
   * empty list, so without this the mobile profile's Community tab would
   * flash its "nothing here yet" fallback and then replace it with the grid.
   * Always false in demo mode, which resolves synchronously.
   */
  isPending: boolean;
  /** Re-runs the failed fetch. Wire it to the error panel's retry button. */
  refetch: () => void;
}

/**
 * The public places a member runs, for the visitor view of `PlacesSection`.
 *
 * Demo mode resolves against the static `DIRECTORY_PLACES` registry (mock
 * member slugs only) and never hits the network. Live mode fetches the public
 * `GET /directory/by-member/:slug` and maps each redacted card DTO onto the
 * `MemberPlace` view model — so a real member's places show for visitors too,
 * not just for the owner (whose own listings come from `GET /listings/mine`).
 *
 * Returns the places alongside an `isError`/`refetch` pair: an outage must not
 * render as "this member runs nothing" (DES-22).
 */
export function useMemberListings(memberSlug: string): MemberListingsResult {
  const { demoMode } = useDemoMode();
  // Hoisted because `isPending` has to read it too: react-query reports a
  // disabled query as pending forever, so a live-mode call with no slug would
  // otherwise claim to be loading for good.
  const isQueryEnabled = !demoMode && memberSlug.length > 0;
  const listingsQuery = useQuery<MemberPlace[]>({
    queryKey: ["memberListings", demoMode, memberSlug],
    enabled: isQueryEnabled,
    initialData: demoMode ? registryPlacesForMember(memberSlug) : undefined,
    queryFn: async () => {
      if (demoMode) return registryPlacesForMember(memberSlug);
      const cards = await getListingsByMember(memberSlug);
      return cards.map((listing) => ({
        key: listing.slug,
        status: "live" as const,
        ref: undefined,
        place: cardDtoToPlace(listing),
      }));
    },
  });

  // `refetch` off react-query is referentially stable, so the retry handed to
  // the error panel stays stable too.
  const { refetch: refetchListings } = listingsQuery;
  const refetch = useCallback(() => {
    void refetchListings();
  }, [refetchListings]);

  return {
    places: listingsQuery.data ?? [],
    // Demo resolves synchronously off the static registry: nothing to fail
    // and nothing to wait for.
    isError: !demoMode && listingsQuery.isError,
    isPending: isQueryEnabled && listingsQuery.isPending,
    refetch,
  };
}
