import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../app/providers/authContext";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import type { StaffRole } from "../components/ui/StaffBadge";
import type { BadgedStaffRoleId } from "./badgedStaffRoles";
import { getPlatformStaff, type StaffIdentity } from "./staff.api";
import { DEMO_STAFF } from "./staffRegistry.data";

/** Staff membership changes on the order of months, and the payload is a
 *  handful of slugs — so fetch it once and hold it for the session. */
const ONE_HOUR_MS = 60 * 60 * 1000;

/** Nobody: the answer for a signed-out viewer and for a slug off the roster. */
const NO_STAFF_IDENTITY: StaffIdentity = { tier: null, badgedStaffRoles: [] };

/**
 * The whole staff roster as a slug-keyed map.
 *
 * Signed-out visitors always get an empty map. That is the single point where
 * the members-only rule is enforced — the badge is a public statement about who
 * runs the platform, and the open web does not get a scrapable roster of it.
 * Enforcing it here rather than at each call site means no surface can leak it
 * by forgetting.
 *
 * Each entry carries the account tier AND the badged staff grants that person
 * holds (ENG-28), because a member handed the housing queue or the magazine
 * desk is staff to everyone whose listing or piece they decide on, and used to
 * appear on this map as nobody at all.
 */
export function useStaffMap(): Record<string, StaffIdentity> {
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
 * Everything the roster says about one member: their tier and their badged
 * grants. Returns the empty identity (rather than null) for the overwhelming
 * majority of members, so call sites read one shape whatever the answer is.
 */
export function useStaffIdentity(
  memberSlug: string | undefined,
): StaffIdentity {
  const staffBySlug = useStaffMap();
  if (!memberSlug) return NO_STAFF_IDENTITY;
  return staffBySlug[memberSlug] ?? NO_STAFF_IDENTITY;
}

/**
 * The platform ACCOUNT TIER of one member, or null if they are on the ordinary
 * member tier, the viewer is signed out, or the roster has not arrived yet.
 * Returning null while in flight means the badge fades in rather than reserving
 * empty space.
 *
 * Unchanged in meaning by the grant work: a grant is not a tier, and a member
 * who holds one still answers null here. Ask `useStaffIdentity` when you want
 * the grants too.
 */
export function useStaffRole(memberSlug: string | undefined): StaffRole | null {
  return useStaffIdentity(memberSlug).tier;
}

/** The badged grants one member holds, in registry order. Empty for most. */
export function useStaffBadgedRoles(
  memberSlug: string | undefined,
): BadgedStaffRoleId[] {
  return useStaffIdentity(memberSlug).badgedStaffRoles;
}
