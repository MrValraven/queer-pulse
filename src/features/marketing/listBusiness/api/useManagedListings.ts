import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../../app/providers/DemoModeProvider";
import { useAuth } from "../../../../app/providers/authContext";
import {
  getManagedListings,
  type ManagedListingItem,
} from "./managedListings.api";
import { DEMO_MANAGED_LISTINGS } from "./managedListings.data";

/** Under the `["listings"]` prefix, so anything that refreshes the member's
 *  own listings (a claim, a co-manager invite accepted) refreshes this too. */
export const MANAGED_LISTINGS_KEY = ["listings", "managed"] as const;

/**
 * The listings the signed-in member owns or co-manages. Demo reads the
 * fixture and never hits the network; a signed-out visitor asks nothing.
 * `isResolving` is true while a live read is loading or has failed before any
 * data arrived, when an empty list means "not known", so a consumer never reads it as "manages
 * nothing".
 */
export function useManagedListings(): {
  items: ManagedListingItem[];
  isResolving: boolean;
} {
  const { demoMode } = useDemoMode();
  const { loggedIn } = useAuth();
  const query = useQuery<ManagedListingItem[]>({
    queryKey: MANAGED_LISTINGS_KEY,
    enabled: !demoMode && loggedIn,
    queryFn: () => getManagedListings(),
  });
  if (demoMode) return { items: DEMO_MANAGED_LISTINGS, isResolving: false };
  return {
    items: query.data ?? [],
    isResolving: loggedIn && query.data === undefined,
  };
}
