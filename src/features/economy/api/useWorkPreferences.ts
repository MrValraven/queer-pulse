import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useAuth } from "../../../app/providers/authContext";
import { getWorkPreferences, type WorkPreferencesDTO } from "./workPreferences.api";

export interface WorkPreferencesResult {
  /** The stored preferences, once they arrive. `undefined` in demo mode and
   *  while signed out — there is nothing stored to read. */
  data: WorkPreferencesDTO | undefined;
  /** True while the first read is in flight (live mode only). */
  isLoading: boolean;
}

/**
 * The member's stored work-profile safety preferences.
 *
 * Lifted out of `WorkProfileProvider` so the request fires when a page that
 * actually reads these preferences mounts — react-query fetches on first
 * subscribe — rather than on every route in the app.
 *
 * The key is unchanged (`["workPreferences", demoMode]`): the provider's
 * `save()` writes the confirmed response straight into this cache entry with
 * `setQueryData`, so renaming it would silently break write-through.
 *
 * Dual-mode: demo mode leaves the query disabled and never touches the network,
 * so `data` stays `undefined` and the provider keeps `DEFAULT_WORK_PREFERENCES`
 * — exactly the prototype's in-memory session behaviour.
 */
export function useWorkPreferences(): WorkPreferencesResult {
  const { demoMode } = useDemoMode();
  const { loggedIn } = useAuth();
  // `loggedIn` is false while the session is still being determined, so this
  // also parks the fetch until GET /auth/me resolves rather than racing it.
  const live = !demoMode && loggedIn;

  const query = useQuery<WorkPreferencesDTO>({
    queryKey: ["workPreferences", demoMode],
    enabled: live,
    queryFn: getWorkPreferences,
  });

  return { data: query.data, isLoading: live && query.isLoading };
}
