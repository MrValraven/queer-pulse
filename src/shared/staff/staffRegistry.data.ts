import type { StaffRole } from "../components/ui/StaffBadge";
import type { StaffRoleId } from "../../features/admin/staffRoles.registry";

/**
 * Who works for QueerPulse, in demo mode.
 *
 * This file is the demo fallback for `GET /platform/staff` — the live-mode
 * shape is identical, so anything true of one must stay true of the other.
 * Keys are member slugs from `features/members/data/members.ts`; the three
 * moderators mirror `MOD_ROLE_KEY` in `features/forum/forum.data.ts`.
 */
export const DEMO_STAFF: Record<string, StaffRole> = {
  tiago: "admin",
  mariana: "moderator",
  rui: "moderator",
  ana: "moderator",
};

/**
 * Who holds which ADDITIVE staff grant, in demo mode.
 *
 * The tier map above answers "does this person get a staff badge?"; this
 * answers "which admin sections has this person been handed?" (OPS-03). They
 * are separate axes on purpose: a plain member can hold a grant, and an admin
 * holds every grant implicitly without a row. Keys are the same member slugs.
 */
export const DEMO_STAFF_GRANTS: Record<string, StaffRoleId[]> = {
  mariana: ["directory_moderator", "communities"],
  rui: ["editorial", "resource_curator"],
  ana: ["partnerships"],
};
