import { useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../../app/providers/authContext";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useCommunityMembership } from "../../../app/providers/useCommunityMembership";
import { useDirectoryListingsActions } from "../../../app/providers/useDirectoryListingsActions";
import { getAccountDependencies } from "./accountDependencies.api";

export interface AccountDependencyCommunity {
  slug: string;
  name: string;
}

export interface AccountDependencyListing {
  ref: string;
  name: string;
}

export interface AccountDependencies {
  /** Communities the caller owns. They never block erasure: an ownership
   *  offer needs someone else to accept it, and the backend hands an erased
   *  owner's community to its longest-standing co-owner, then mod, then (for
   *  a space) the parent community's owner, or flags it for our team to
   *  review. The gate lists them with an optional ownership offer. */
  communities: AccountDependencyCommunity[];
  /** The caller's own listings that are publicly live right now. They never
   *  block erasure: the backend keeps them live without an owner so whoever
   *  runs the place can claim them. The gate lists them as information with an
   *  optional delete. */
  listings: AccountDependencyListing[];
  /** True while the live check is still resolving its first fetch. Callers
   *  hold erasure while it is true, the only thing that holds it. */
  isLoading: boolean;
  /** True when the live check failed and no earlier answer is on hand, so the
   *  two empty lists above mean "unknown". Callers keep erasure available
   *  (the backend hands on or releases whatever the member owns) and
   *  `AccountDependencyGate` says the check could not load. */
  isError?: boolean;
  /** True when the member cannot act on these lists: their account is not
   *  active (suspended or deactivated), and every remedy (ownership offer,
   *  roster read, listing delete) sits behind the active-member guard. The
   *  lists still arrive and `AccountDependencyGate` shows them as information
   *  only. */
  isInformational?: boolean;
}

export const ACCOUNT_DEPENDENCIES_QUERY_KEY = ["account", "dependencies"];

const EMPTY_COMMUNITIES: AccountDependencyCommunity[] = [];
const EMPTY_LISTINGS: AccountDependencyListing[] = [];

/**
 * Whether the signed-in member can run the remedies at all. Every one of them
 * is guarded by `ActiveMemberGuard` on the backend, so only an `active` status
 * can. Logged out (`null`) is not informational: there is nothing to show.
 */
function useIsInformationalOnly(): boolean {
  const { status } = useAuth();
  return status !== null && status !== "active";
}

/** The one live read behind both hooks below, so they share a cache entry. */
function useAccountDependenciesQuery() {
  const { demoMode } = useDemoMode();
  const { loggedIn } = useAuth();
  return useQuery({
    queryKey: ACCOUNT_DEPENDENCIES_QUERY_KEY,
    enabled: !demoMode && loggedIn,
    queryFn: getAccountDependencies,
  });
}

/**
 * Everything erasing this account would hand on or leave live.
 *
 * Live mode reads `GET /account/dependencies`, one request answering both
 * lists. It used to be composed from `GET /me/communities` and
 * `GET /listings/mine`, and both of those sit behind the active-member guard:
 * a banned or suspended member, whom the delete-account page still admits, got
 * two 403s, two empty lists, and no ownership warning at all. The account
 * controller carries no such guard, so every signed-in member gets a real
 * answer. The backend applies the same rules the composition did:
 *
 * - Communities: the caller's memberships whose roster role is `owner`, with
 *   private-tier communities and spaces kept IN. (`useMyCommunityCards` drops
 *   private-tier communities for the profile's public picker, which here would
 *   silently hide an owned private community and let its sole owner request
 *   erasure anyway.)
 * - Listings: the caller's own listings whose status is `live`. A listing still
 *   in review isn't publicly reachable yet, so the gate leaves it out.
 *
 * A listing deleted this session through the gate drops out at once through
 * the provider's `withdrawn` set, before the refetch lands.
 *
 * A member whose account is not active (suspended or deactivated) still
 * gets both lists, flagged `isInformational`: they cannot offer or delete
 * anything, so the gate shows the rows without their buttons.
 *
 * Demo mode keeps its no-network composition: the session membership store
 * filtered to owned communities, and the session's listing overlay filtered to
 * live ones.
 */
export function useAccountDependencies(): AccountDependencies {
  const { demoMode } = useDemoMode();
  const { memberships } = useCommunityMembership();
  const { local, withdrawn } = useDirectoryListingsActions();
  const query = useAccountDependenciesQuery();
  const isInformational = useIsInformationalOnly();
  const liveData = query.data;

  const communities = useMemo<AccountDependencyCommunity[]>(() => {
    if (!demoMode) return liveData?.communities ?? EMPTY_COMMUNITIES;
    return Object.entries(memberships)
      .filter(([, membership]) => membership.role === "owner")
      .map(([slug, membership]) => ({
        slug,
        name: membership.name ?? slug,
      }));
  }, [demoMode, liveData, memberships]);

  const listings = useMemo<AccountDependencyListing[]>(() => {
    if (!demoMode) {
      return (liveData?.listings ?? EMPTY_LISTINGS).filter(
        (listing) => !withdrawn.has(listing.ref),
      );
    }
    return local
      .filter((listing) => listing.status === "live")
      .map((listing) => ({ ref: listing.ref, name: listing.name }));
  }, [demoMode, liveData, local, withdrawn]);

  return {
    communities,
    listings,
    isLoading: !demoMode && query.isLoading,
    isError: !demoMode && query.isError && liveData === undefined,
    isInformational,
  };
}

/**
 * For `AccountDependencyGate`, which renders the lists its caller hands it:
 * whether the live check failed (same rule as `isError` above), whether the
 * member can act on the rows at all (same rule as `isInformational`), and a
 * `refresh` to re-read it once a row's optional step has run. An accepted
 * ownership offer invalidates the communities caches only, so without this a
 * community that changed hands would stay listed until the next fetch.
 * Subscribing here dedupes against the caller's `useAccountDependencies`
 * query.
 */
export function useAccountDependenciesCheck() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const query = useAccountDependenciesQuery();
  const isInformational = useIsInformationalOnly();
  const refresh = useCallback(() => {
    if (demoMode) return;
    void queryClient.invalidateQueries({
      queryKey: ACCOUNT_DEPENDENCIES_QUERY_KEY,
    });
  }, [demoMode, queryClient]);

  return {
    isError: !demoMode && query.isError && query.data === undefined,
    isInformational,
    refresh,
  };
}
