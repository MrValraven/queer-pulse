import { apiGet } from "../../../shared/api/client";
import { API_BASE_URL } from "../../../shared/api/config";
import type { ActivityLabel } from "./adminCommunities.api";

/**
 * Live-mode shapes for the consolidated `/admin/reports` page
 * (ADM-17 adjustable date ranges, ADM-19 CSV export). Mirrors the backend's
 * `src/admin-reports/admin-reports-response.ts` DTOs field for field. Kept
 * self-contained (no cross-import of the frontend view-model types) the same
 * way `adminOverview.api.ts` is — `adminReports.adapters.ts`, not this one,
 * reconciles the wire shape with the dashboard view models this page reuses
 * from `adminDashboard.data.ts`.
 */

export const REPORT_WEEK_RANGES = [4, 8, 12, 26] as const;
export type ReportWeekRange = (typeof REPORT_WEEK_RANGES)[number];

export interface AdminReportsGrowthPoint {
  at: string;
  joined: number;
  churned: null;
  spike: boolean;
}

export interface AdminReportsGrowthDTO {
  range: ReportWeekRange;
  points: AdminReportsGrowthPoint[];
}

export interface AdminReportsByTypeWeek {
  weekStart: string;
  values: [number, number, number, number];
}

export interface AdminReportsByTypeDTO {
  range: ReportWeekRange;
  weeks: AdminReportsByTypeWeek[];
}

export interface AdminReportsCommunityHealthRow {
  slug: string;
  name: string;
  healthScore: number;
  activityLabel: ActivityLabel;
  memberCount: number;
  openReportCount: number;
  needsSupport: boolean;
}

/** A CURRENT snapshot only (`generatedAt`, no time axis) — there is no
 *  historical community-health table on the platform. The section that
 *  renders this must label it "as of now", never imply a trend. */
export interface AdminReportsCommunityHealthDTO {
  generatedAt: string;
  averageScore: number | null;
  needingSupportCount: number;
  communities: AdminReportsCommunityHealthRow[];
}

/** Member growth over an adjustable weekly range (ADM-17). Admin/moderator-only. */
export const getAdminReportsGrowth = (weeks: ReportWeekRange) =>
  apiGet<AdminReportsGrowthDTO>(`/admin/reports/growth?weeks=${weeks}`);

/** Reports filed by type over an adjustable weekly range (ADM-17). Admin/moderator-only. */
export const getAdminReportsByType = (weeks: ReportWeekRange) =>
  apiGet<AdminReportsByTypeDTO>(
    `/admin/reports/reports-by-type?weeks=${weeks}`,
  );

/** Platform-wide community health, current snapshot. Admin/moderator-only. */
export const getAdminReportsCommunityHealth = () =>
  apiGet<AdminReportsCommunityHealthDTO>("/admin/reports/community-health");

// The API version prefix `request()` in `client.ts` applies to every versioned
// call (`/v1/...`). A CSV export is a binary/text attachment, not the JSON the
// `api*` helpers parse, so it goes through a direct `fetch` — but must still
// hit the same versioned path. Mirrors `adminAudit.api.ts`'s `downloadAuditCsv`
// exactly, including the version-prefix duplication note there.
const API_VERSION_PREFIX = "/v1";

async function downloadReportCsv(
  path: string,
  filename: string,
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}${API_VERSION_PREFIX}${path}`, {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error(`Report export failed with status ${response.status}`);
  }
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  try {
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

/** Download the member-growth series as a CSV attachment (ADM-19), honouring
 *  the current weekly range. GET, so no CSRF token is needed. Throws on a
 *  non-2xx so the caller can surface an honest error toast. */
export const downloadGrowthCsv = (weeks: ReportWeekRange) =>
  downloadReportCsv(
    `/admin/reports/growth.csv?weeks=${weeks}`,
    "member-growth.csv",
  );

/** Download the reports-by-type series as a CSV attachment (ADM-19),
 *  honouring the current weekly range. */
export const downloadReportsByTypeCsv = (weeks: ReportWeekRange) =>
  downloadReportCsv(
    `/admin/reports/reports-by-type.csv?weeks=${weeks}`,
    "reports-by-type.csv",
  );
