import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
} from "../../../shared/api/client";

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
  "Quiet" | "Growing" | "Steady" | "Active" | "High" | "Busy";

/** The backend's `ReportSeverity` enum, over the wire as its string values. */
export type AdminCommunityQueueSeverity =
  "emergency" | "high" | "medium" | "low";

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
  avatarUrl: string | null;
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
  /** Whether joining requires a second existing member's vouch. Persisted;
   *  not yet enforced in the join flow. */
  requiresSecondVouch: boolean;
  /** Whether the community auto-freezes when open reports pile up. Persisted;
   *  enforcement is a follow-up. */
  autoFreezeOnReports: boolean;
  /** Whether this is the platform-wide featured community shown as the hero
   *  card at the top of the Discover page. A singleton: the backend clears
   *  every other community's flag transactionally when this one is set true. */
  isFeatured: boolean;
  /** True while the community is currently auto-frozen pending report review.
   *  An admin can also freeze/unfreeze it directly (see the override actions
   *  below), in addition to staff lifting it from the community's own mod
   *  panel. */
  frozen: boolean;
  /** True once an admin (or the owner, via the member-facing endpoint) has
   *  archived the community. Reversible via the admin-only unarchive action
   *  below (COM-18) — archiving is no longer a one-way door. */
  archived: boolean;
  resolvedPercentage: number;
  moderators: AdminCommunityModeratorDTO[];
  scopedQueue: AdminCommunityQueueItemDTO[];
  /** True when the backend's report scan hit its scan cap while building this
   *  community's detail — some of its reports may not be reflected in
   *  `scopedQueue`/the health numbers above. Mirrors
   *  `AdminCommunityListDTO.truncated`. */
  truncated: boolean;
}

/** The full `GET /admin/communities` payload: the cards, plus whether either
 *  scan behind them (communities themselves, or the platform-wide report
 *  scan feeding their health numbers) hit its cap. */
export interface AdminCommunityListDTO {
  items: AdminCommunityCardDTO[];
  truncated: boolean;
}

/** The safety-policy fields the admin Settings tab can PATCH. Every field is
 *  optional so a single toggle sends only what it changed. */
export interface UpdateAdminCommunitySettingsDto {
  requiresSecondVouch?: boolean;
  autoFreezeOnReports?: boolean;
  /** Set true to feature this community on Discover (clears every other
   *  community's flag server-side); set false to unfeature it. */
  isFeatured?: boolean;
}

/** Every community on the platform, for the admin grid. Admin-only — 403s otherwise. */
export const getAdminCommunities = () =>
  apiGet<AdminCommunityListDTO>("/admin/communities");

/** One community, with its moderators and scoped report queue. */
export const getAdminCommunity = (slug: string) =>
  apiGet<AdminCommunityDetailDTO>(`/admin/communities/${slug}`);

/** Update a community's safety-policy settings (admin-only). Returns the full
 *  refreshed detail so the caller re-renders from authoritative state. */
export const updateAdminCommunitySettings = (
  slug: string,
  dto: UpdateAdminCommunitySettingsDto,
) => apiPatch<AdminCommunityDetailDTO>(`/admin/communities/${slug}`, dto);

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

// ── Moderation-of-last-resort overrides ─────────────────────────────────────
// The five actions below all bypass a community's own owner/mod authorization
// on purpose — see `AdminCommunitiesController`'s doc comment on the backend.
// They exist for the case a community's own leadership can't be reached or
// trusted, which is exactly what the health-score/report-scope data already
// shown on `AdminCommunityDetail` surfaces without giving the admin anything
// to act on.

/** Admin override: freeze a community regardless of who owns/moderates it (or
 *  whether it has an owner at all). Idempotent — freezing an already-frozen
 *  community is a no-op. Returns the refreshed detail. */
export const freezeAdminCommunity = (slug: string) =>
  apiPost<AdminCommunityDetailDTO>(`/admin/communities/${slug}/freeze`);

/** Admin override: lift a community's freeze regardless of who owns/moderates
 *  it. Idempotent — unfreezing a community that isn't frozen is a no-op.
 *  Returns the refreshed detail. */
export const unfreezeAdminCommunity = (slug: string) =>
  apiPost<AdminCommunityDetailDTO>(`/admin/communities/${slug}/unfreeze`);

/** Admin override: archive a community regardless of its ownership state.
 *  Idempotent — archiving an already-archived community is a no-op. Returns
 *  the refreshed detail. Reversible via {@link unarchiveAdminCommunity}
 *  (COM-18) — archiving is no longer a one-way door. */
export const archiveAdminCommunity = (slug: string) =>
  apiPost<AdminCommunityDetailDTO>(`/admin/communities/${slug}/archive`);

/** Admin override: reverse an archive regardless of the community's
 *  ownership state. Idempotent — unarchiving a community that isn't archived
 *  is a no-op. Returns the refreshed detail. */
export const unarchiveAdminCommunity = (slug: string) =>
  apiPost<AdminCommunityDetailDTO>(`/admin/communities/${slug}/unarchive`);

/** Admin override: hand ownership to any roster member (by profile slug),
 *  even when the community currently has no owner. 404s if `memberSlug` isn't
 *  on this community's roster; 400s if the target is the house account.
 *  Returns the refreshed detail. */
export const reassignAdminCommunityOwner = (slug: string, memberSlug: string) =>
  apiPost<AdminCommunityDetailDTO>(
    `/admin/communities/${slug}/reassign-owner`,
    {
      memberSlug,
    },
  );

/** Admin override: remove any roster member outright (by profile slug), not
 *  just demote a moderator. 404s if `memberSlug` isn't on this community's
 *  roster; 400s if the target is the current owner — reassign ownership
 *  first. */
export const removeAdminCommunityMember = (slug: string, memberSlug: string) =>
  apiDelete<void>(`/admin/communities/${slug}/members/${memberSlug}`);
