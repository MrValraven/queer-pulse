import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useAuth } from "../../../app/providers/authContext";
import {
  getConnectionRelationships,
  type ConnectionRelationshipsDTO,
} from "./connections.api";

/**
 * Every relationship the signed-in member holds
 * (`GET /connections/relationships`): who they are connected to, who has asked
 * them, and who they have asked.
 *
 * ONE call for the whole app (PRD-03). It replaces the accepted-slugs-only
 * fetch this hook used to make, which is why the profile hero could tell
 * "connected" from "stranger" and could not tell either from "this person has
 * already asked you". Fetching per profile view would be a request per card on
 * every members grid, so it stays session-scoped (`staleTime: Infinity`) and
 * every subscriber shares the one cached result.
 *
 * The key sits under the `["connections"]` prefix on purpose: every connection
 * mutation already invalidates that prefix, so accepting, declining, sending or
 * withdrawing refreshes this without a second invalidation to remember.
 *
 * Live mode only, and only when signed in. A 403 for a pending member is
 * routine, so errors are swallowed; `undefined` leaves the store's own state
 * alone rather than clearing it.
 */
export function useConnectionRelationships() {
  const { demoMode } = useDemoMode();
  const { loggedIn } = useAuth();

  return useQuery<ConnectionRelationshipsDTO>({
    queryKey: ["connections", "relationships", demoMode],
    enabled: !demoMode && loggedIn,
    staleTime: Infinity,
    retry: false,
    meta: { silentError: true },
    queryFn: getConnectionRelationships,
  });
}
