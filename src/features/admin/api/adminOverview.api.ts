import { apiGet } from "../../../shared/api/client";

/**
 * Admin dashboard overview (`/admin/overview`, admin-only). Mirrors the
 * backend's `src/admin-overview/admin-overview-response.ts` `AdminOverviewDTO`
 * field for field. Kept self-contained (no cross-import of the frontend
 * view-model types) the same way `adminMembers.api.ts` is — the adapter file,
 * not this one, reconciles the wire shape with the dashboard view models.
 *
 * `reportsByType.values` is a fixed 4-tuple stacked as
 * [outing, harassment, spam, other]. Un-backed metrics (`memberGrowth[].churned`,
 * `responseTime`/`medianResponseHours` when nothing has been resolved, and
 * `communityHealth.averageScore` when there are no communities yet) arrive as
 * `null` and render as "not measured yet".
 */
export interface AdminOverviewDTO {
  stats: {
    activeMembers: {
      value: number;
      growthPercent: number | null;
      netNewThisMonth: number;
    };
    openReports: {
      value: number;
      oldestOpenHours: number | null;
      emergencies: number;
    };
    medianResponseHours: number | null;
    /** Platform-wide summary of the per-community health score already
     *  computed for the communities admin section. */
    communityHealth: {
      averageScore: number | null;
      needingSupportCount: number;
    };
    verifiedMembers: number;
  };
  triage: {
    emergencies: number;
    openReports: number;
    pendingVerifications: number;
    openAppeals: number;
  };
  reportsByType: {
    weeks: { weekStart: string; values: [number, number, number, number] }[];
  };
  memberGrowth: {
    points: {
      at: string;
      joined: number;
      churned: number | null;
      spike: boolean;
    }[];
  };
  responseTime: {
    medianHours: number | null;
    buckets: { label: string; value: number; overSla: boolean }[];
  } | null;
  feed: {
    id: string;
    type: string;
    actor: string | null;
    target: string | null;
    community: string | null;
    count: number | null;
    at: string;
    route: string;
  }[];
}

/** Platform-wide dashboard metrics, charts, and activity feed. Admin-only — 403s otherwise. */
export const getAdminOverview = () =>
  apiGet<AdminOverviewDTO>("/admin/overview");
