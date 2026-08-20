import type { PlatformStaffRowDTO } from "./api/adminStaffRoster.api";

/**
 * Demo fallback for the admin staff-roster page (`/admin/staff`). Mirrors
 * `DEMO_STAFF` (`shared/staff/staffRegistry.data.ts`) — same people, same
 * roles — with the name fields the roster needs that the slug-keyed badge
 * map doesn't carry. Kept in sync by hand: the two files serve different
 * shapes of the same underlying `GET /platform/staff` fixture.
 */
export const ADMIN_STAFF_ROSTER_DEMO: PlatformStaffRowDTO[] = [
  { slug: "tiago", firstName: "Tiago", lastName: "Costa", platformRole: "admin" },
  { slug: "mariana", firstName: "Mariana", lastName: "Loução", platformRole: "moderator" },
  { slug: "rui", firstName: "Rui", lastName: "Marçal", platformRole: "moderator" },
  { slug: "ana", firstName: "Ana", lastName: "Reis", platformRole: "moderator" },
];
