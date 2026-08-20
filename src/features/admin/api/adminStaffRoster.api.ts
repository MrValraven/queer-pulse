import { apiGet } from "../../../shared/api/client";
import type { PlatformStaffRowDTO } from "../../../shared/staff/staff.api";

export type { PlatformStaffRowDTO };

/**
 * The full staff roster for the admin console's staff page — the same
 * `GET /platform/staff` the member-facing `StaffBadge` map (`useStaffMap`)
 * reads, fetched here as the raw rows instead of reduced to a slug map: the
 * roster renders every row (name, handle, role), not just one lookup.
 */
export async function getAdminStaffRoster(): Promise<PlatformStaffRowDTO[]> {
  const rows = await apiGet<PlatformStaffRowDTO[]>("/platform/staff");
  return Array.isArray(rows) ? rows : [];
}
