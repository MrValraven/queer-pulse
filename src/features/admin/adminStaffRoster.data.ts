import type {
  AdminStaffRoleHolderDTO,
  PlatformStaffRowDTO,
} from "./api/adminStaffRoster.api";
import { DEMO_STAFF_GRANTS } from "../../shared/staff/staffRegistry.data";

/**
 * Demo fallback for the admin staff-roster page (`/admin/staff`). Mirrors
 * `DEMO_STAFF` (`shared/staff/staffRegistry.data.ts`) — same people, same
 * roles — with the name fields the roster needs that the slug-keyed badge
 * map doesn't carry. Kept in sync by hand: the two files serve different
 * shapes of the same underlying `GET /platform/staff` fixture.
 */
export const ADMIN_STAFF_ROSTER_DEMO: PlatformStaffRowDTO[] = [
  {
    slug: "tiago",
    firstName: "Tiago",
    lastName: "Costa",
    platformRole: "admin",
  },
  {
    slug: "mariana",
    firstName: "Mariana",
    lastName: "Loução",
    platformRole: "moderator",
  },
  {
    slug: "rui",
    firstName: "Rui",
    lastName: "Marçal",
    platformRole: "moderator",
  },
  {
    slug: "ana",
    firstName: "Ana",
    lastName: "Reis",
    platformRole: "moderator",
  },
];

/**
 * Demo fallback for `GET /admin/members/staff-roles`. Built from the roster
 * above plus `DEMO_STAFF_GRANTS`, so the two demo fixtures can never drift
 * into naming different people.
 */
export const ADMIN_STAFF_GRANTS_DEMO: AdminStaffRoleHolderDTO[] =
  ADMIN_STAFF_ROSTER_DEMO.filter(
    (staffMember) => DEMO_STAFF_GRANTS[staffMember.slug]?.length,
  ).map((staffMember) => ({
    id: staffMember.slug,
    slug: staffMember.slug,
    firstName: staffMember.firstName,
    lastName: staffMember.lastName,
    platformRole: staffMember.platformRole,
    staffRoles: DEMO_STAFF_GRANTS[staffMember.slug] ?? [],
  }));
