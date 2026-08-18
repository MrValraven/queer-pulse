import { useMemo } from "react";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  useMyCommunities,
  useMyCommunitiesResolving,
} from "../../communities/api/useMyCommunities";
import { useDirectoryListings } from "../../marketing/listBusiness/api/useDirectoryListings";
import { useAllMyListings } from "../../marketing/listBusiness/api/useListings";

export interface AccountDependencyCommunity {
  slug: string;
  name: string;
}

export interface AccountDependencyListing {
  ref: string;
  name: string;
}

export interface AccountDependencies {
  /** Communities the caller owns — a community requires an owner and this
   *  codebase has no anonymous-owner state, so each one blocks erasure. */
  communities: AccountDependencyCommunity[];
  /** The caller's own listings that are publicly live right now. */
  listings: AccountDependencyListing[];
  /** True while either source is still resolving its first live fetch. */
  isLoading: boolean;
  hasDependencies: boolean;
}

/**
 * Everything that would be stranded by erasing this account, composed from
 * the two hooks the rest of the app already reads these facts from — no new
 * backend endpoint.
 *
 * - Communities: `useMyCommunities()`, the live `GET /me/communities`
 *   membership map behind the communities hub, filtered to `role === "owner"`.
 *   Deliberately NOT `useMyCommunityCards` — that hook drops private-tier
 *   communities from its result (by design, for the profile's public
 *   "featured communities" picker), which would silently hide an owned
 *   private community from this gate and let its sole owner request erasure
 *   anyway.
 * - Listings: `useDirectoryListings()`, the same "mine" overlay
 *   `PlacesSection` reads for the owner view (`GET /listings/mine` plus the
 *   session's optimistic additions), filtered to `status === "live"` — a
 *   listing still in review isn't publicly reachable yet, so it doesn't need
 *   a transfer/close step before erasure. This is NOT `useMemberListings`
 *   (the brief's original guess): that hook backs the *visitor* view of
 *   `PlacesSection` off the public `GET /directory/by-member/:slug` and
 *   hardcodes every row's status to `"live"`, so it can't actually tell a
 *   pending listing from a published one.
 */
export function useAccountDependencies(): AccountDependencies {
  const { demoMode } = useDemoMode();
  const memberships = useMyCommunities();
  const communitiesLoading = useMyCommunitiesResolving();
  const { submitted } = useDirectoryListings();
  // Subscribes to the same `["listings", "mine", "all", demoMode]` query
  // `useDirectoryListings` already composes over, purely to read its
  // `isLoading` flag (which that hook doesn't expose) — react-query dedupes
  // this against the existing subscription rather than firing a second
  // `GET /listings/mine`.
  const listingsQuery = useAllMyListings();
  const listingsLoading = !demoMode && listingsQuery.isLoading;

  const communities = useMemo<AccountDependencyCommunity[]>(
    () =>
      Object.entries(memberships)
        .filter(([, membership]) => membership.role === "owner")
        .map(([slug, membership]) => ({
          slug,
          name: membership.name ?? slug,
        })),
    [memberships],
  );

  const listings = useMemo<AccountDependencyListing[]>(
    () =>
      submitted
        .filter((listing) => listing.status === "live")
        .map((listing) => ({ ref: listing.ref, name: listing.name })),
    [submitted],
  );

  return {
    communities,
    listings,
    isLoading: communitiesLoading || listingsLoading,
    hasDependencies: communities.length > 0 || listings.length > 0,
  };
}
