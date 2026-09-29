import { apiGet } from "../api/client";
import {
  isAmbassadorFocusArea,
  type AmbassadorFocusArea,
} from "./ambassadorFocusAreas.data";

/** One ambassador on the wire, from `GET /platform/ambassadors`. The backend
 *  only sends active ambassadors whose tag is visible and whose account is
 *  active, so a hidden tag is absent here and therefore absent everywhere. */
export interface PlatformAmbassadorRowDTO {
  slug: string;
  focusArea: AmbassadorFocusArea;
  /** ISO timestamp of the grant. */
  since: string;
}

/** What the roster says about one ambassador. */
export interface AmbassadorIdentity {
  focusArea: AmbassadorFocusArea;
  /** ISO timestamp of the grant. */
  since: string;
}

/**
 * GET /platform/ambassadors: the whole visible ambassador roster, which is a
 * few dozen rows at most.
 *
 * Returned as a slug-keyed map because every caller does a single-slug lookup,
 * the same shape as `getPlatformStaff`. A non-array response (an error
 * envelope, an empty 204) degrades to an empty map: no tag is a safe failure,
 * a thrown error inside a directory card is not.
 *
 * Rows with a focus key this build has no label for, or a `since` that does
 * not parse, are dropped for the same reason. A raw `nightlife_safety` or an
 * "Invalid Date" beside someone's name is worse than no tag at all.
 */
export async function getPlatformAmbassadors(): Promise<
  Record<string, AmbassadorIdentity>
> {
  const rows = await apiGet<PlatformAmbassadorRowDTO[]>(
    "/platform/ambassadors",
  );
  if (!Array.isArray(rows)) return {};
  const ambassadorsBySlug: Record<string, AmbassadorIdentity> = {};
  for (const row of rows) {
    if (!row?.slug) continue;
    if (!isAmbassadorFocusArea(row.focusArea)) continue;
    if (typeof row.since !== "string" || Number.isNaN(Date.parse(row.since))) {
      continue;
    }
    ambassadorsBySlug[row.slug] = {
      focusArea: row.focusArea,
      since: row.since,
    };
  }
  return ambassadorsBySlug;
}
