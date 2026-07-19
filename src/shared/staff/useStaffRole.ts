import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../app/providers/authContext";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import type { StaffRole } from "../components/ui/StaffBadge";
import { getPlatformStaff } from "./staff.api";
import { DEMO_STAFF } from "./staffRegistry.data";

/** Staff membership changes on the order of months, and the payload is a
 *  handful of slugs — so fetch it once and hold it for the session. */
const ONE_HOUR_MS = 60 * 60 * 1000;

/**
 * The whole staff roster as a slug-keyed map.
 *
 * Signed-out visitors always get an empty map. That is the single point where
 * the members-only rule is enforced — the badge is a public statement about who
 * runs the platform, and the open web does not get a scrapable roster of it.
 * Enforcing it here rather than at each call site means no surface can leak it
 * by forgetting.
 */
export function useStaffMap(): Record<string, StaffRole> {
  const { demoMode } = useDemoMode();
  const { loggedIn } = useAuth();
  const { data } = useQuery({
    queryKey: ["platform-staff", demoMode],
    queryFn: async () => (demoMode ? DEMO_STAFF : await getPlatformStaff()),
    enabled: loggedIn,
    staleTime: ONE_HOUR_MS,
    gcTime: ONE_HOUR_MS,
  });
  if (!loggedIn) return {};
  return data ?? {};
}

/**
 * The platform role of one member, or null if they are a plain member, the
 * viewer is signed out, or the roster has not arrived yet. Returning null while
 * in flight means the badge fades in rather than reserving empty space.
 */
export function useStaffRole(
  memberSlug: string | undefined,
): StaffRole | null {
  const staffBySlug = useStaffMap();
  if (!memberSlug) return null;
  return staffBySlug[memberSlug] ?? null;
}
