import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../../app/providers/DemoModeProvider";
import { useAuth } from "../../../../app/providers/authContext";
import {
  getListingClaimPolicy,
  getMyListingClaims,
  type ListingClaimPolicyDTO,
  type MyListingClaimDTO,
} from "./listingClaims.api";

/**
 * Data hooks for the claimant's side of "claim this listing": the claims this
 * member has filed, and the published policy the claim form promises against.
 *
 * Demo mode never reaches the network, matching `useCoManagerInvites` and
 * `useClaimListing` next door. A demo persona files claims that resolve
 * locally and are never stored, so there is nothing server-side to list: both
 * queries stay disabled and answer with their empty value, which the claims
 * page renders as its ordinary empty state.
 */

/** Cache key for the caller's own claims. Sits under the `["listings"]` prefix
 *  so `useListingMutations`' broad invalidation refreshes it too. */
export const MY_LISTING_CLAIMS_KEY = ["listings", "claims", "mine"];

/**
 * Cache key for the published claim policy. Deliberately its OWN root rather
 * than a third segment under `["listings"]`: `useListingMutations` and
 * `useListingCoManagers` both invalidate that whole prefix, so parking the
 * policy there would throw the day-long `staleTime` below away every time
 * anybody created, edited or deleted a listing while a consumer was mounted.
 * The policy answers to nothing a listing mutation can change.
 */
export const LISTING_CLAIM_POLICY_KEY = ["listing-claim-policy"];

/**
 * A whole day, and it holds: the key above sits outside every prefix this
 * app invalidates. The policy is a compile-time constant on the server with
 * no database read behind it, so re-asking on every mount is pure waste. One
 * fetch per session is plenty, and a turnaround change ships with a deploy.
 */
const CLAIM_POLICY_STALE_TIME_MS = 24 * 60 * 60 * 1000;

/** The caller's own ownership claims, newest first (GET /listings/claims/mine). */
export function useMyListingClaims() {
  const { demoMode } = useDemoMode();
  const { loggedIn } = useAuth();
  const query = useQuery<MyListingClaimDTO[]>({
    queryKey: MY_LISTING_CLAIMS_KEY,
    enabled: !demoMode && loggedIn,
    queryFn: getMyListingClaims,
  });
  return {
    claims: query.data ?? [],
    isLoading: !demoMode && loggedIn && query.isLoading,
    isError: query.isError,
    refetch: () => void query.refetch(),
  };
}

/**
 * The published review turnaround and the evidence hints (GET
 * /listings/claim-policy). Read by the claim form before submission and by the
 * claim's own status line afterwards, so both quote the same number.
 */
export function useListingClaimPolicy() {
  const { demoMode } = useDemoMode();
  const { loggedIn } = useAuth();
  const query = useQuery<ListingClaimPolicyDTO>({
    queryKey: LISTING_CLAIM_POLICY_KEY,
    enabled: !demoMode && loggedIn,
    queryFn: getListingClaimPolicy,
    staleTime: CLAIM_POLICY_STALE_TIME_MS,
  });
  return { policy: query.data ?? null, isLoading: query.isLoading };
}
