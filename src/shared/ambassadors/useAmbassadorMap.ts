import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../app/providers/authContext";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { DEMO_AMBASSADORS } from "./ambassadorRegistry.data";
import {
  getPlatformAmbassadors,
  type AmbassadorIdentity,
} from "./ambassadors.api";

/** Ambassadors are granted by hand, a few a month at most, and the payload is
 *  a short list of slugs, so fetch it once and hold it for the session. */
const ONE_HOUR_MS = 60 * 60 * 1000;

/**
 * The visible ambassador roster as a slug-keyed map.
 *
 * Signed-out visitors always get an empty map, the same members-only rule as
 * `useStaffMap`, enforced here once so no surface can leak the roster to the
 * open web by forgetting. Nothing is fetched while signed out.
 */
export function useAmbassadorMap(): Record<string, AmbassadorIdentity> {
  const { demoMode } = useDemoMode();
  const { loggedIn } = useAuth();
  const { data } = useQuery({
    queryKey: ["platform-ambassadors", demoMode],
    queryFn: async () =>
      demoMode ? DEMO_AMBASSADORS : await getPlatformAmbassadors(),
    enabled: loggedIn,
    staleTime: ONE_HOUR_MS,
    gcTime: ONE_HOUR_MS,
  });
  if (!loggedIn) return {};
  return data ?? {};
}

/**
 * One member's ambassador identity, or null for the overwhelming majority who
 * are not ambassadors, for a hidden tag, for a signed-out viewer, and while the
 * roster is in flight (so the tag fades in rather than reserving space).
 */
export function useAmbassadorIdentity(
  memberSlug: string | undefined,
): AmbassadorIdentity | null {
  const ambassadorsBySlug = useAmbassadorMap();
  if (!memberSlug) return null;
  return ambassadorsBySlug[memberSlug] ?? null;
}
