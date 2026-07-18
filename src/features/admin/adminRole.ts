import { useSyncExternalStore } from "react";
import { useAuth } from "../../app/providers/authContext";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import type { MemberRole } from "../auth/api/auth.api";

/**
 * The viewer's team role on the platform.
 *
 * This used to be a simulated role held in `AdminRoleProvider`, defaulting to
 * `"staff"` — a value that isn't even in the backend's role enum. Because it
 * defaulted to staff for *everyone*, every signed-in member in live mode was
 * shown the Magazine-editor and Admin links in their account menu, all of which
 * dead-end at the `useAuthGateRedirect` bounce back to the homepage. Live mode
 * now reads the real `useAuth().role`, the same value the route gate and the
 * backend `RolesGuard` enforce, so the links appear only where they work.
 *
 * Demo mode keeps a simulated role so the prototype's admin/mod surfaces stay
 * explorable (the demo session's real role is `"member"`). It lives in a
 * module-level store instead of a context provider because it's a demo-only
 * affordance with no live counterpart — `canSwitch` is the flag every UI uses to
 * decide whether to render a role switcher at all.
 */
export type TeamRole = MemberRole;

/** The community a moderator deep-links into from the account menu (demo). Must
 *  exist as a key in LIVING (livingCommunities.data.ts). */
export const DEMO_MOD_SLUG = "queer-runners";

/** Demo default: admin, so the admin panel is immediately demoable. */
let demoRole: TeamRole = "admin";
const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

function getSnapshot(): TeamRole {
  return demoRole;
}

function setDemoRole(role: TeamRole) {
  if (demoRole === role) return;
  demoRole = role;
  for (const listener of listeners) listener();
}

const NOOP = () => {};

export interface TeamRoleValue {
  role: TeamRole;
  /** Switch the simulated role. No-op in live mode — see `canSwitch`. */
  setRole: (role: TeamRole) => void;
  /** True only in demo mode, where the role is a fiction the viewer may change. */
  canSwitch: boolean;
}

export function useTeamRole(): TeamRoleValue {
  const { demoMode } = useDemoMode();
  const { role: authRole } = useAuth();
  const simulated = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  if (demoMode) {
    return { role: simulated, setRole: setDemoRole, canSwitch: true };
  }
  // Signed-out visitors have no role; treat them as a plain member so nothing
  // privileged renders before the session probe settles.
  return { role: authRole ?? "member", setRole: NOOP, canSwitch: false };
}
