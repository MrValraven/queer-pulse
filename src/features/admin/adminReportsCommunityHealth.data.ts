import type {
  AdminReportsCommunityHealthDTO,
  AdminReportsCommunityHealthRow,
} from "./api/adminReports.api";

/** Demo fixture for the community-health section's per-community table —
 *  purpose-built for this page's exact row shape rather than reshaping
 *  `adminCommunities.data.ts`'s heavier `Community` fixture (built for the
 *  full communities admin panel, with string fields this table doesn't use). */
export const DEMO_COMMUNITY_HEALTH_ROWS: AdminReportsCommunityHealthRow[] = [
  {
    slug: "trans-friends",
    name: "Trans & Friends",
    healthScore: 91,
    activityLabel: "Busy",
    memberCount: 1204,
    openReportCount: 2,
    needsSupport: false,
  },
  {
    slug: "queer-creatives",
    name: "Queer Creatives",
    healthScore: 84,
    activityLabel: "Active",
    memberCount: 842,
    openReportCount: 1,
    needsSupport: false,
  },
  {
    slug: "lisbon-queers",
    name: "Lisbon Queers",
    healthScore: 68,
    activityLabel: "Steady",
    memberCount: 511,
    openReportCount: 5,
    needsSupport: true,
  },
  {
    slug: "queer-social",
    name: "Queer Social",
    healthScore: 74,
    activityLabel: "Growing",
    memberCount: 320,
    openReportCount: 3,
    needsSupport: true,
  },
  {
    slug: "sapphic-book-club",
    name: "Sapphic Book Club",
    healthScore: 88,
    activityLabel: "Growing",
    memberCount: 176,
    openReportCount: 0,
    needsSupport: false,
  },
];

function averageHealthScore(rows: AdminReportsCommunityHealthRow[]): number {
  return Math.round(
    rows.reduce((sum, row) => sum + row.healthScore, 0) / rows.length,
  );
}

/** Built lazily (not a module-level const) so `generatedAt` reads "now" for
 *  every demo session rather than the moment the module first loaded. */
export function buildDemoCommunityHealth(): AdminReportsCommunityHealthDTO {
  return {
    generatedAt: new Date().toISOString(),
    averageScore: averageHealthScore(DEMO_COMMUNITY_HEALTH_ROWS),
    needingSupportCount: DEMO_COMMUNITY_HEALTH_ROWS.filter(
      (row) => row.needsSupport,
    ).length,
    communities: DEMO_COMMUNITY_HEALTH_ROWS,
  };
}
