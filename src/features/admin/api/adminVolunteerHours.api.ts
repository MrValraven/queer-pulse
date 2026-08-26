import { apiGet } from "../../../shared/api/client";

/** One opportunity's share of the confirmed hours. */
export interface AdminVolunteerHoursOpportunityRowDTO {
  opportunitySlug: string;
  role: string;
  org: string;
  sessionCount: number;
  hoursContributed: number;
}

/** One community's share. `communitySlug`/`communityName` are null when the id
 *  no longer resolves to a community; the row still appears, because its hours
 *  are already inside the platform total. */
export interface AdminVolunteerHoursCommunityRowDTO {
  communityId: string;
  communitySlug: string | null;
  communityName: string | null;
  sessionCount: number;
  hoursContributed: number;
}

/**
 * `GET /admin/volunteering/hours` (SUS-05, `@Roles(Moderator, Admin)`) —
 * mirrors `AdminVolunteerHoursDTO` on the backend.
 *
 * Aggregates only. There is no per-member row and no ranking: this reports
 * what the platform contributed, never what any one person did.
 */
export interface AdminVolunteerHoursDTO {
  from: string | null;
  to: string | null;
  sessionCount: number;
  hoursContributed: number;
  volunteerCount: number;
  byOpportunity: AdminVolunteerHoursOpportunityRowDTO[];
  byCommunity: AdminVolunteerHoursCommunityRowDTO[];
  /** How many rows a breakdown list can hold at most. The totals above are
   *  exact regardless. */
  breakdownLimit: number;
  isOpportunityBreakdownCapped: boolean;
  isCommunityBreakdownCapped: boolean;
}

export interface AdminVolunteerHoursParams {
  /** ISO 8601 inclusive start. Omitted means unbounded. */
  from?: string;
  /** ISO 8601 EXCLUSIVE end. Omitted means "up to now". */
  to?: string;
  communityId?: string;
}

export function getAdminVolunteerHours(
  params: AdminVolunteerHoursParams = {},
): Promise<AdminVolunteerHoursDTO> {
  const query = new URLSearchParams();
  if (params.from) query.set("from", params.from);
  if (params.to) query.set("to", params.to);
  if (params.communityId) query.set("communityId", params.communityId);
  const queryString = query.toString();
  return apiGet<AdminVolunteerHoursDTO>(
    `/admin/volunteering/hours${queryString ? `?${queryString}` : ""}`,
  );
}
