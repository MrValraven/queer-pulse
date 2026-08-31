import type {
  AdminStaffRoleHolderDTO,
  PlatformStaffRowDTO,
} from "./api/adminStaffRoster.api";
import { DEMO_STAFF_GRANTS } from "../../shared/staff/staffRegistry.data";
import { isBadgedStaffRoleId } from "../../shared/staff/badgedStaffRoles";

/** Who is on the demo roster, and under what name. */
const DEMO_ROSTER_PEOPLE: {
  slug: string;
  firstName: string;
  lastName: string;
  platformRole: PlatformStaffRowDTO["platformRole"];
}[] = [
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
  // On the ordinary member tier, on the roster only for the housing queue she
  // was handed. `platformRole` is null for exactly this person, the way the
  // live endpoint sends it.
  {
    slug: "ines",
    firstName: "Inês",
    lastName: "Tavares",
    platformRole: null,
  },
];

/**
 * Demo fallback for the admin staff-roster page (`/admin/staff`). Mirrors
 * `DEMO_STAFF` (`shared/staff/staffRegistry.data.ts`) — same people, same
 * roles — with the name fields the roster needs that the slug-keyed badge
 * map doesn't carry. The badged grants are read from the same
 * `DEMO_STAFF_GRANTS` the badge map uses, so the two fixtures cannot drift
 * into disagreeing about who holds what.
 */
export const ADMIN_STAFF_ROSTER_DEMO: PlatformStaffRowDTO[] =
  DEMO_ROSTER_PEOPLE.map((person) => ({
    ...person,
    badgedStaffRoles: (DEMO_STAFF_GRANTS[person.slug] ?? []).filter(
      isBadgedStaffRoleId,
    ),
  }));

/**
 * Demo fallback for `GET /admin/members/staff-roles`. Built from the roster
 * above plus `DEMO_STAFF_GRANTS`, so the two demo fixtures can never drift
 * into naming different people. This one carries EVERY grant a person holds,
 * badged or not, because the admin console is where the unbadged ones are
 * administered.
 */
export const ADMIN_STAFF_GRANTS_DEMO: AdminStaffRoleHolderDTO[] =
  ADMIN_STAFF_ROSTER_DEMO.filter(
    (staffMember) => DEMO_STAFF_GRANTS[staffMember.slug]?.length,
  ).map((staffMember) => ({
    id: staffMember.slug,
    slug: staffMember.slug,
    firstName: staffMember.firstName,
    lastName: staffMember.lastName,
    platformRole: staffMember.platformRole ?? "member",
    staffRoles: DEMO_STAFF_GRANTS[staffMember.slug] ?? [],
  }));
