import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useAuth } from "../../../app/providers/authContext";
import { getAcceptedConnections } from "./connections.api";

/**
 * Slugs of the signed-in member's accepted connections (`GET /connections/accepted`).
 *
 * Mirrors `useGivenVouches`: fires on first subscribe, once per session
 * (`staleTime: Infinity`), only in live mode when logged in. Used to hydrate
 * `ConnectionsProvider.connected` so `isConnected(slug)` is reliable app-wide
 * (the provider itself starts empty in live mode). A 403 for a pending member
 * is routine, so errors are swallowed.
 */
export function useAcceptedConnections() {
  const { demoMode } = useDemoMode();
  const { loggedIn } = useAuth();

  return useQuery<string[]>({
    queryKey: ["acceptedConnections", demoMode],
    enabled: !demoMode && loggedIn,
    staleTime: Infinity,
    retry: false,
    meta: { silentError: true },
    queryFn: getAcceptedConnections,
  });
}
