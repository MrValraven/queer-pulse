import type { StaffRole } from "../components/ui/StaffBadge";

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
