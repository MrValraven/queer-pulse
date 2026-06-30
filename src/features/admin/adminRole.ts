import { createContext, useContext } from "react";

/** Which simulated team role the viewer is acting as. Drives AdminShell's badge
 *  and which admin links AccountMenu surfaces. Prototype-only — no real auth. */
export type AdminRole = "staff" | "mod" | "member";

/** The community a "mod" deep-links into from the account menu (demo). Must
 *  exist as a key in LIVING (livingCommunities.data.ts). */
export const DEMO_MOD_SLUG = "queer-runners";

export interface AdminRoleValue {
  role: AdminRole;
  setRole: (role: AdminRole) => void;
}

export const AdminRoleContext = createContext<AdminRoleValue | null>(null);

export function useAdminRole(): AdminRoleValue {
  const ctx = useContext(AdminRoleContext);
  if (!ctx)
    throw new Error("useAdminRole must be used within AdminRoleProvider");
  return ctx;
}
