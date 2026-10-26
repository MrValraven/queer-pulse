import { apiGet } from "../../../shared/api/client";

/**
 * Anonymous landing-page visit counts (`/admin/landing/visits`, admin-only).
 * Mirrors the backend's `AdminLandingVisitsDTO` field for field. The backend
 * stores only (day, source, visits): no IP, no user agent, no cookie and no
 * per-visit row, so a day count is the finest grain this card can show.
 *
 * The backend accepts exactly 30 or 90 for `rangeDays`; any other value is a
 * 400 with `reason: 'invalid_range'`.
 */
export type LandingVisitsRangeDays = 30 | 90;

export interface LandingVisitsDay {
  /** UTC calendar day, `YYYY-MM-DD`. */
  day: string;
  visits: number;
}

export interface LandingVisitsSource {
  /** Normalized source: a `utm_source`, a referrer hostname without `www.`,
   *  or `direct` when neither was present. */
  source: string;
  visits: number;
}

export interface AdminLandingVisitsDTO {
  rangeDays: LandingVisitsRangeDays;
  total: number;
  /** Zero-filled, oldest first, one row per UTC day in the range. */
  days: LandingVisitsDay[];
  /** The ten busiest sources over the range, busiest first. */
  topSources: LandingVisitsSource[];
}

/** Daily landing visits over `rangeDays`. Admin-only; returns 403 for other users. */
export const getAdminLandingVisits = (rangeDays: LandingVisitsRangeDays) =>
  apiGet<AdminLandingVisitsDTO>(`/admin/landing/visits?rangeDays=${rangeDays}`);
