import { apiGet } from "../../../shared/api/client";
import type { PlatformStaffRowDTO } from "../../../shared/staff/staff.api";
import { isBadgedStaffRoleId } from "../../../shared/staff/badgedStaffRoles";
import type { StaffRoleId } from "../staffRoles.registry";
import { STAFF_ROLE_IDS } from "../staffRoles.registry";

export type { PlatformStaffRowDTO };

/** One member holding at least one additive staff grant. */
export interface AdminStaffRoleHolderDTO {
  id: string;
  slug: string;
  firstName: string;
  lastName: string;
  platformRole: "member" | "moderator" | "admin";
  staffRoles: StaffRoleId[];
}

/**
 * The full staff roster for the admin console's staff page — the same
 * `GET /platform/staff` the member-facing `StaffBadge` map (`useStaffMap`)
 * reads, fetched here as the raw rows instead of reduced to a slug map: the
 * roster renders every row (name, handle, role), not just one lookup.
 *
 * It carries the moderator and admin tiers plus every member holding a
 * badge-earning grant, so a row can arrive with `platformRole: null`. That is
 * someone on the ordinary member tier who is here for what they were handed.
 * Grant ids this build has no label for are dropped rather than rendered raw.
 */
export async function getAdminStaffRoster(): Promise<PlatformStaffRowDTO[]> {
  const rows = await apiGet<PlatformStaffRowDTO[]>("/platform/staff");
  if (!Array.isArray(rows)) return [];
  return rows.map((row) => ({
    ...row,
    badgedStaffRoles: (row.badgedStaffRoles ?? []).filter(isBadgedStaffRoleId),
  }));
}

/**
 * `GET /admin/members/staff-roles`: everyone holding an additive staff grant,
 * with what they hold. Deliberately a different endpoint from the roster
 * above: `/platform/staff` is readable by every active member (it badges
 * moderators and admins across the app), while who holds which functional
 * grant is operational information and stays behind the admin-only members
 * controller. Unknown role ids (a backend that shipped a grant this build does
 * not know yet) are dropped rather than rendered as raw keys.
 */
export async function getAdminStaffRoleHolders(): Promise<
  AdminStaffRoleHolderDTO[]
> {
  const rows = await apiGet<AdminStaffRoleHolderDTO[]>(
    "/admin/members/staff-roles",
  );
  if (!Array.isArray(rows)) return [];
  return rows.map((row) => ({
    ...row,
    staffRoles: (row.staffRoles ?? []).filter(
      (staffRole): staffRole is StaffRoleId =>
        STAFF_ROLE_IDS.includes(staffRole),
    ),
  }));
}
