import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useAuth } from "../../../app/providers/authContext";
import {
  DEMO_MY_GROUP_LISTINGS,
  type MyGroupListing,
} from "../housingGroups.data";
import { getMyGroupListings } from "./housingGroups.api";
import { myListingDtoToMyGroupListing } from "./housingGroups.adapters";
import { economyKeys } from "./economyKeys";

/**
 * The caller's own rooms in one vetted group, in whatever state each is in
 * (LOC-19).
 *
 * The group page shows only what a moderator has cleared, so a member who
 * submitted a room watched it disappear with nothing anywhere able to say
 * whether it was waiting, had gone up, had a question against it, or had been
 * refused. `GET /housing-groups/:slug/listings/mine` is that answer.
 *
 * Gated the way the backend is: `ActiveMemberGuard` means an active signed-in
 * member, so the query stays parked while the session is still being
 * determined and never fires for a signed-out reader. Demo mode reads the
 * colocated fixture and never reaches the network.
 */
export function useMyGroupListings(slug: string | undefined) {
  const { demoMode } = useDemoMode();
  const { loggedIn, checking, status } = useAuth();
  const isActiveMember = !checking && loggedIn && status === "active";
  return useQuery<MyGroupListing[]>({
    queryKey: economyKeys.myGroupListings(slug, demoMode),
    enabled: Boolean(slug) && (demoMode || isActiveMember),
    queryFn: async () => {
      if (demoMode) return DEMO_MY_GROUP_LISTINGS[slug!] ?? [];
      const dtos = await getMyGroupListings(slug!);
      return dtos.map(myListingDtoToMyGroupListing);
    },
  });
}

/**
 * Whether the signed-in person may post a room into a group at all, mirroring
 * the backend's `ActiveMemberGuard` client-side.
 *
 * The mirror is for honesty rather than security: the two gates the backend
 * adds on top (the LGBTQ+ affirming pledge and a phone-verified account) are
 * answered as errors and caught by the submit modal, because only the server
 * knows where the member stands on either.
 */
export function useCanPostGroupListing(): boolean {
  const { demoMode } = useDemoMode();
  const { loggedIn, checking, status } = useAuth();
  if (demoMode) return true;
  return !checking && loggedIn && status === "active";
}
