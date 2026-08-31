import type { StaffRole } from "../components/ui/StaffBadge";
import type { StaffRoleId } from "../../features/admin/staffRoles.registry";
import { isBadgedStaffRoleId } from "./badgedStaffRoles";
import type { StaffIdentity } from "./staff.api";

/**
 * Who holds which ADDITIVE staff grant, in demo mode.
 *
 * Separate axis from the account tiers below: a plain member can hold a grant,
 * and an admin holds every grant implicitly without a row. Keys are member
 * slugs from `features/members/data/members.ts`.
 *
 * `ines` is here on the ordinary member tier on purpose. She is the demo of the
 * case ENG-28 was about: someone handed the housing queue, deciding on other
 * members' listings, who carried no badge anywhere until grants joined the
 * roster. `ana` is the other side of it: `partnerships` is not a badged grant,
 * so she wears her moderator tier and nothing else.
 */
export const DEMO_STAFF_GRANTS: Record<string, StaffRoleId[]> = {
  mariana: ["directory_moderator", "communities"],
  rui: ["editorial", "resource_curator"],
  ana: ["partnerships"],
  ines: ["housing_moderator"],
};

/**
 * The badge-earning ACCOUNT TIERS in demo mode. The three moderators mirror
 * `MOD_ROLE_KEY` in `features/forum/forum.data.ts`.
 */
const DEMO_STAFF_TIERS: Record<string, StaffRole> = {
  tiago: "admin",
  mariana: "moderator",
  rui: "moderator",
  ana: "moderator",
};

/**
 * Who works for QueerPulse, in demo mode.
 *
 * This file is the demo fallback for `GET /platform/staff` — the live-mode
 * shape is identical, so anything true of one must stay true of the other.
 * Built from the two maps above rather than written out a third time, which is
 * also what keeps the unbadged grants (`partnerships`, `magazine_writer`) from
 * being badged here by hand while the backend refuses to badge them.
 */
export const DEMO_STAFF: Record<string, StaffIdentity> = Object.fromEntries(
  [
    ...new Set([
      ...Object.keys(DEMO_STAFF_TIERS),
      ...Object.keys(DEMO_STAFF_GRANTS),
    ]),
  ].map((slug) => [
    slug,
    {
      tier: DEMO_STAFF_TIERS[slug] ?? null,
      badgedStaffRoles: (DEMO_STAFF_GRANTS[slug] ?? []).filter(
        isBadgedStaffRoleId,
      ),
    },
  ]),
);
