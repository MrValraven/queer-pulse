import { apiGet } from "../api/client";
import type { StaffRole } from "../components/ui/StaffBadge";
import {
  BADGED_STAFF_ROLE_IDS,
  isBadgedStaffRoleId,
  type BadgedStaffRoleId,
} from "./badgedStaffRoles";

/** One staff member on the wire. `firstName`/`lastName` are unused by the
 *  slug-keyed map this file builds, but are part of the response shape — the
 *  admin staff-roster page fetches the same endpoint directly for them. */
export interface PlatformStaffRowDTO {
  slug: string;
  firstName: string;
  lastName: string;
  /**
   * The badge-earning ACCOUNT tier, or null for someone who is on the roster
   * only because of a grant and sits on the ordinary member tier.
   */
  platformRole: StaffRole | null;
  /** The additive grants this person holds that earn a badge, registry order. */
  badgedStaffRoles: BadgedStaffRoleId[];
}

/**
 * What the roster says about one person: their account tier if they have a
 * badge-earning one, and every badged grant they hold. Both can be present at
 * once. An admin who was also handed the housing queue is both things.
 */
export interface StaffIdentity {
  tier: StaffRole | null;
  badgedStaffRoles: BadgedStaffRoleId[];
}

/**
 * GET /platform/staff — the full staff roster, which is a handful of rows.
 *
 * Returned as a slug-keyed map rather than the raw array because every caller
 * does a single-slug lookup. A non-array response (an error envelope, an empty
 * 204) degrades to an empty map: no badges is a safe failure, a thrown error
 * inside a directory card is not.
 *
 * Unknown grant ids (a backend that shipped a grant this build has no label
 * for) are dropped for the same reason. A raw `housing_moderator` painted next
 * to someone's name is worse than no badge at all.
 */
export async function getPlatformStaff(): Promise<
  Record<string, StaffIdentity>
> {
  const rows = await apiGet<PlatformStaffRowDTO[]>("/platform/staff");
  if (!Array.isArray(rows)) return {};
  const staffBySlug: Record<string, StaffIdentity> = {};
  for (const row of rows) {
    if (!row?.slug) continue;
    const badgedStaffRoles = (row.badgedStaffRoles ?? []).filter(
      (staffRoleId): staffRoleId is BadgedStaffRoleId =>
        isBadgedStaffRoleId(staffRoleId),
    );
    // Registry order, so a person holding several reads the same way here as on
    // the roster page however the backend happened to serialise them.
    badgedStaffRoles.sort(
      (first, second) =>
        BADGED_STAFF_ROLE_IDS.indexOf(first) -
        BADGED_STAFF_ROLE_IDS.indexOf(second),
    );
    staffBySlug[row.slug] = {
      tier: row.platformRole ?? null,
      badgedStaffRoles,
    };
  }
  return staffBySlug;
}
