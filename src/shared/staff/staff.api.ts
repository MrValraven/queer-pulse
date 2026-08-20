import { apiGet } from "../api/client";
import type { StaffRole } from "../components/ui/StaffBadge";

/** One staff member on the wire. `firstName`/`lastName` are unused by the
 *  slug-keyed map this file builds, but are part of the response shape — the
 *  admin staff-roster page fetches the same endpoint directly for them. */
export interface PlatformStaffRowDTO {
  slug: string;
  firstName: string;
  lastName: string;
  platformRole: StaffRole;
}

/**
 * GET /platform/staff — the full staff roster, which is a handful of rows.
 *
 * Returned as a slug-keyed map rather than the raw array because every caller
 * does a single-slug lookup. A non-array response (an error envelope, an empty
 * 204) degrades to an empty map: no badges is a safe failure, a thrown error
 * inside a directory card is not.
 */
export async function getPlatformStaff(): Promise<Record<string, StaffRole>> {
  const rows = await apiGet<PlatformStaffRowDTO[]>("/platform/staff");
  if (!Array.isArray(rows)) return {};
  const staffBySlug: Record<string, StaffRole> = {};
  for (const row of rows) {
    if (row?.slug) staffBySlug[row.slug] = row.platformRole;
  }
  return staffBySlug;
}
