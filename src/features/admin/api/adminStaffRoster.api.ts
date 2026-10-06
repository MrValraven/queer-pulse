import { apiGet } from "../../../shared/api/client";
import type { PlatformStaffRowDTO } from "../../../shared/staff/staff.api";
import { STAFF_ROLE_IDS, type StaffRoleId } from "../staffRoles.registry";

export type { PlatformStaffRowDTO };

/** One additive staff grant on a roster row, with when it was handed over. */
export interface AdminStaffGrantDTO {
  role: StaffRoleId;
  grantedAt: string;
}

/** One person on the admin staff roster, with everything the page shows. */
export interface AdminStaffRosterRowDTO {
  id: string;
  slug: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  platformRole: "member" | "moderator" | "admin";
  status: "active" | "suspended" | "deactivated";
  /** ISO timestamp of when the account was created. */
  joinedAt: string;
  /** Every grant the person holds, in registry order. */
  grants: AdminStaffGrantDTO[];
}

/** Sorts grants into the order `STAFF_ROLES` lists them, which is the order
 *  the roster renders them in. Used by demo patches that add a grant. */
export function inStaffRegistryOrder(
  grants: AdminStaffGrantDTO[],
): AdminStaffGrantDTO[] {
  return [...grants].sort(
    (firstGrant, secondGrant) =>
      STAFF_ROLE_IDS.indexOf(firstGrant.role) -
      STAFF_ROLE_IDS.indexOf(secondGrant.role),
  );
}

/**
 * `GET /admin/members/staff-roster`: one row per staff person (moderators,
 * admins, and every member holding an additive grant) with the photo, account
 * status, join date and dated grants the staff page renders. Admin-only.
 * Grant ids this build does not know yet are dropped so the page only renders
 * roles it has a label for.
 */
export async function getAdminStaffRosterRows(): Promise<
  AdminStaffRosterRowDTO[]
> {
  const rows = await apiGet<AdminStaffRosterRowDTO[]>(
    "/admin/members/staff-roster",
  );
  if (!Array.isArray(rows)) return [];
  return rows.map((row) => ({
    ...row,
    grants: (row.grants ?? []).filter((grant) =>
      STAFF_ROLE_IDS.includes(grant.role),
    ),
  }));
}
