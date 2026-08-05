import { apiDelete, apiGet, apiPost } from "../../../shared/api/client";

/**
 * Admin communities panel (`/admin/communities`, admin-only). Mirrors the
 * backend's `src/admin-communities/admin-communities-response.ts` field for
 * field. Kept self-contained (no cross-import of the frontend view-model
 * types) the same way `moderation.api.ts` / `jobs.api.ts` are — the adapter
 * file, not this one, is responsible for reconciling the wire shape with the
 * `Community` view model.
 */

export type BadgeTone = "plum" | "coral" | "jade" | "violet" | "amber";
export type AdminCommunityVisibility = "private" | "public" | "network";
export type ActivityLabel =
  | "Quiet"
  | "Growing"
  | "Steady"
  | "Active"
  | "High"
  | "Busy";

/** The backend's `ReportSeverity` enum, over the wire as its string values. */
export type AdminCommunityQueueSeverity = "emergency" | "high" | "medium" | "low";

export interface AdminCommunityHealthBreakdownDTO {
  memberActivity: number;
  reportResolution: number;
  /**
   * Always null today — nothing on the platform measures member sentiment
   * yet. Kept in the shape (rather than omitted) so the admin UI can say
   * "not measured yet" instead of silently presenting a three-signal score
   * as a four-signal one.
   */
  memberSentiment: number | null;
  safetyLoad: number;
}

export interface AdminCommunityCardDTO {
  slug: string;
  name: string;
  initials: string;
  tone: BadgeTone;
  tag: string;
  memberCount: number;
  activityLabel: ActivityLabel;
  activePercentage: number;
  openReportCount: number;
  healthScore: number;
  healthBreakdown: AdminCommunityHealthBreakdownDTO;
  activitySparkline: number[];
  needsSupport: boolean;
}

export interface AdminCommunityModeratorDTO {
  /** The moderator's user id — the roster identity add/remove act on. */
  userId: string;
  slug: string;
  name: string;
  initials: string;
  role: "owner" | "mod";
  joinedAt: string;
}

/** A roster member eligible to be promoted to moderator (a plain member). */
export interface AdminModeratorCandidateDTO {
  userId: string;
  slug: string;
  name: string;
  initials: string;
}

export interface AdminCommunityQueueItemDTO {
  id: string;
  severity: AdminCommunityQueueSeverity;
  reasonCode: string;
  detail: string | null;
  status: string;
  overdue: boolean;
  createdAt: string;
}

export interface AdminCommunityDetailDTO extends AdminCommunityCardDTO {
  description: string;
  foundedAt: string;
  visibility: AdminCommunityVisibility;
  resolvedPercentage: number;
  moderators: AdminCommunityModeratorDTO[];
  scopedQueue: AdminCommunityQueueItemDTO[];
}

/** Every community on the platform, for the admin grid. Admin-only — 403s otherwise. */
export const getAdminCommunities = () =>
  apiGet<AdminCommunityCardDTO[]>("/admin/communities");

/** One community, with its moderators and scoped report queue. */
export const getAdminCommunity = (slug: string) =>
  apiGet<AdminCommunityDetailDTO>(`/admin/communities/${slug}`);

/** The roster members eligible to be promoted to moderator (plain members). */
export const getAdminCommunityModeratorCandidates = (slug: string) =>
  apiGet<AdminModeratorCandidateDTO[]>(
    `/admin/communities/${slug}/moderators/candidates`,
  );

/** Promote a roster member (`memberId` = their user id) to moderator. */
export const addAdminCommunityModerator = (slug: string, memberId: string) =>
  apiPost<AdminCommunityModeratorDTO>(`/admin/communities/${slug}/moderators`, {
    memberId,
  });

/** Demote a moderator (`memberId` = their user id) back to a plain member. */
export const removeAdminCommunityModerator = (slug: string, memberId: string) =>
  apiDelete<void>(`/admin/communities/${slug}/moderators/${memberId}`);
