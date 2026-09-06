import {
  apiDelete,
  apiGet,
  apiGetNullable,
  apiPost,
} from "../../../shared/api/client";

/**
 * Wire shapes for the safe-space GOVERNANCE backend: the nomination review
 * queue, the member flag mechanism, badge suspensions and the annual
 * re-review. Mirrors `queerpulse-backend/src/safe-space-nominations/` exactly
 * (`safe-space-nomination-response.ts`, `safe-space-badge-response.ts` and the
 * three `Admin*` controllers).
 *
 * PRIVACY: `AdminSafeSpaceFlagDTO` is the only shape here that carries a
 * flagger's id or their written detail, and it is served only from
 * moderator-guarded routes. Nothing on a member-facing or owner-facing surface
 * may render either field, and no member-facing shape carries a flag count.
 */

// ── Policy constants, as the backend states them ──────────────────────────
// Carried on every payload too; these are the fallbacks a demo fixture uses.
export const SAFE_SPACE_REQUIRED_VISITS = 3;
export const SAFE_SPACE_ACKNOWLEDGEMENT_HOURS = 48;
export const SAFE_SPACE_FLAG_THRESHOLD = 3;

// ── Member-facing: the honest badge state ─────────────────────────────────

/** The states a badge can honestly be in. `verified` is the only one that may
 *  render as a verified badge. */
export type SafeSpaceBadgeState =
  "none" | "under_review" | "verified" | "suspended" | "removed";

/** `GET /safe-spaces/:slug/badge-state`. Carries no flag count and no flagger. */
export interface SafeSpaceBadgeStateDTO {
  listingId: string;
  slug: string;
  state: SafeSpaceBadgeState;
  tier: number | null;
  verifier: string | null;
  badgeAwardedAt: string | null;
  reReviewDueAt: string | null;
  isDueForReReview: boolean;
  isUnderReview: boolean;
  suspendedAt: string | null;
  suspensionReason: string | null;
  visits: {
    independentVisitCount: number;
    requiredVisitCount: number;
    hasMetVisitBar: boolean;
  };
  flagThreshold: number;
  viewerHasFlagged: boolean;
}

/** Why a member is flagging a badged space. Closed set, matches the entity. */
export type SafeSpaceFlagReason =
  | "not_safe"
  | "discrimination"
  | "staff_conduct"
  | "accessibility"
  | "closed_or_changed"
  | "other";

export type SafeSpaceFlagState = "open" | "withdrawn" | "resolved";
export type SafeSpaceFlagResolution = "upheld" | "dismissed";

/** What a flagger is told about their own flag. Nobody else receives this. */
export interface MemberSafeSpaceFlagDTO {
  id: string;
  listingSlug: string;
  reasonCode: SafeSpaceFlagReason;
  state: SafeSpaceFlagState;
  createdAt: string;
  resolvedAt: string | null;
  resolution: SafeSpaceFlagResolution | null;
  wasAlreadyFlagged: boolean;
}

export const getSafeSpaceBadgeState = (slug: string) =>
  apiGet<SafeSpaceBadgeStateDTO>(
    `/safe-spaces/${encodeURIComponent(slug)}/badge-state`,
  );

export const getMySafeSpaceFlag = (slug: string) =>
  apiGetNullable<MemberSafeSpaceFlagDTO>(
    `/safe-spaces/${encodeURIComponent(slug)}/flag`,
  );

export const flagSafeSpace = (
  slug: string,
  body: { reasonCode: SafeSpaceFlagReason; detail?: string },
) =>
  apiPost<MemberSafeSpaceFlagDTO>(
    `/safe-spaces/${encodeURIComponent(slug)}/flag`,
    {
      reasonCode: body.reasonCode,
      ...(body.detail ? { detail: body.detail } : {}),
    },
  );

export const withdrawSafeSpaceFlag = (slug: string) =>
  apiDelete<{ ok: true }>(`/safe-spaces/${encodeURIComponent(slug)}/flag`);

// ── Member-facing: my own nominations ─────────────────────────────────────

export interface SafeSpaceNominationDTO {
  id: string;
  placeName: string;
  address: string | null;
  placeType: string | null;
  listingRef: string | null;
  reason: string | null;
  status: SafeSpaceNominationStatus;
  createdAt: string;
  receivedAt: string;
  acknowledgementDueAt: string;
  acknowledgedAt: string | null;
  decidedAt: string | null;
  decisionReason: string | null;
  awardedTier: number | null;
}

export const getMyNominations = () =>
  apiGet<{ items: SafeSpaceNominationDTO[] }>("/safe-space-nominations/mine");

// ── Moderator-facing: the nomination queue ────────────────────────────────

export type SafeSpaceNominationStatus =
  "pending" | "acknowledged" | "in_review" | "approved" | "rejected";

export type AdminNominationScope = "open" | "decided" | "all";
export type AdminNominationSort = "oldest" | "newest";

export interface AdminNominationListingSummaryDTO {
  id: string;
  ref: string;
  slug: string;
  name: string;
  safeSpaceStatus: string;
  isBadgeSuspended: boolean;
  badgeAwardedAt: string | null;
  reReviewDueAt: string | null;
  isDueForReReview: boolean;
  openFlagCount: number;
}

export interface AdminSafeSpaceNominationDTO extends SafeSpaceNominationDTO {
  /** ABSENT for a reader holding the `directory_moderator` staff grant without
   *  the Moderator/Admin tier: the place, the nominator's own written reason,
   *  the 48-hour clock and the visit tally are the review; who nominated is
   *  not. Nothing renders it, so it is optional rather than removed. */
  nominatorId?: string | null;
  acknowledgedBy: string | null;
  assignedAt: string | null;
  assignedBy: string | null;
  assignmentNote: string | null;
  decidedBy: string | null;
  reopenedAt: string | null;
  listingId: string | null;
  ageHours: number;
  acknowledgementWindowHours: number;
  hasBreachedAcknowledgement: boolean;
  wasAcknowledgedLate: boolean;
  visits: {
    independentVisitCount: number;
    requiredVisitCount: number;
    hasMetVisitBar: boolean;
    notIndependentVouchCount: number;
  } | null;
  listing: AdminNominationListingSummaryDTO | null;
}

export interface AdminNominationsQueryInput {
  status?: SafeSpaceNominationStatus;
  scope?: AdminNominationScope;
  breachedOnly?: boolean;
  assignedOnly?: boolean;
  sort?: AdminNominationSort;
  search?: string;
  limit?: number;
  offset?: number;
}

/** One row of the moderator-only audit trail. */
export interface SafeSpaceAuditDTO {
  id: string;
  subjectType: string;
  subjectId: string;
  listingId: string | null;
  action: string;
  actorId: string | null;
  reason: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

type QueryValue = string | number | boolean | undefined;

function toQueryString(query: Record<string, QueryValue>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === "") continue;
    params.set(key, String(value));
  }
  const serialized = params.toString();
  return serialized ? `?${serialized}` : "";
}

export const getAdminNominations = (query: AdminNominationsQueryInput = {}) =>
  apiGet<{ items: AdminSafeSpaceNominationDTO[]; total: number }>(
    `/admin/safe-space-nominations${toQueryString({ ...query })}`,
  );

export const getAdminNomination = (id: string) =>
  apiGet<AdminSafeSpaceNominationDTO>(`/admin/safe-space-nominations/${id}`);

export const getAdminNominationAudit = (id: string) =>
  apiGet<SafeSpaceAuditDTO[]>(`/admin/safe-space-nominations/${id}/audit`);

export const acknowledgeNomination = (id: string, body: { note?: string }) =>
  apiPost<AdminSafeSpaceNominationDTO>(
    `/admin/safe-space-nominations/${id}/acknowledge`,
    body.note ? { note: body.note } : {},
  );

export const assignNomination = (
  id: string,
  body: { listingRef: string; note?: string },
) =>
  apiPost<AdminSafeSpaceNominationDTO>(
    `/admin/safe-space-nominations/${id}/assign`,
    {
      listingRef: body.listingRef,
      ...(body.note ? { note: body.note } : {}),
    },
  );

export interface DecideNominationInput {
  outcome: "award" | "decline";
  reason: string;
  tier?: number;
  verifierLabel?: string;
  /**
   * Why a badge is being granted below the three-independent-visit bar. The
   * backend refuses the award without it (`SAFE_SPACE_VISIT_BAR_NOT_MET`) and
   * writes it onto the audit row when it is used, so this is the only way past
   * a published guarantee and it is never silent.
   */
  belowVisitBarReason?: string;
}

export const decideNomination = (id: string, body: DecideNominationInput) =>
  apiPost<AdminSafeSpaceNominationDTO>(
    `/admin/safe-space-nominations/${id}/decide`,
    {
      outcome: body.outcome,
      reason: body.reason,
      ...(body.tier ? { tier: body.tier } : {}),
      ...(body.verifierLabel ? { verifierLabel: body.verifierLabel } : {}),
      ...(body.belowVisitBarReason
        ? { belowVisitBarReason: body.belowVisitBarReason }
        : {}),
    },
  );

export const reopenNomination = (id: string, body: { reason: string }) =>
  apiPost<AdminSafeSpaceNominationDTO>(
    `/admin/safe-space-nominations/${id}/reopen`,
    body,
  );

// ── Moderator-facing: the flag queue and badge suspensions ────────────────

export type AdminFlagState = "open" | "resolved" | "all";

/** The ONLY shape carrying a flagger's id or their written detail. */
export interface AdminSafeSpaceFlagDTO {
  id: string;
  listingId: string;
  listingSlug: string | null;
  listingName: string | null;
  flaggerId: string | null;
  reasonCode: SafeSpaceFlagReason;
  detail: string | null;
  state: SafeSpaceFlagState;
  createdAt: string;
  withdrawnAt: string | null;
  resolvedAt: string | null;
  resolvedBy: string | null;
  resolution: SafeSpaceFlagResolution | null;
  resolutionNote: string | null;
}

export interface AdminFlagsQueryInput {
  state?: AdminFlagState;
  reasonCode?: SafeSpaceFlagReason;
  listingRef?: string;
  suspendedOnly?: boolean;
  limit?: number;
  offset?: number;
}

/** One space whose badge has been speaking for itself for over a year. */
export interface SafeSpaceReReviewDueDTO {
  listingId: string;
  ref: string;
  slug: string;
  name: string;
  tier: number | null;
  badgeAwardedAt: string | null;
  reReviewDueAt: string | null;
  daysOverdue: number;
  isBadgeSuspended: boolean;
  openFlagCount: number;
}

export interface AdminSafeSpaceSuspensionDTO {
  id: string;
  listingId: string;
  cause: "flag_threshold" | "moderator";
  flagCountAtSuspension: number;
  suspendedBy: string | null;
  reason: string | null;
  createdAt: string;
  liftedAt: string | null;
  liftedBy: string | null;
  liftReason: string | null;
  isOpen: boolean;
}

export const getAdminFlags = (query: AdminFlagsQueryInput = {}) =>
  apiGet<{ items: AdminSafeSpaceFlagDTO[]; total: number }>(
    `/admin/safe-space-flags${toQueryString({ ...query })}`,
  );

export const resolveFlag = (
  id: string,
  body: { resolution: SafeSpaceFlagResolution; note?: string },
) =>
  apiPost<AdminSafeSpaceFlagDTO>(`/admin/safe-space-flags/${id}/resolve`, {
    resolution: body.resolution,
    ...(body.note ? { note: body.note } : {}),
  });

export const getReReviewDue = () =>
  apiGet<SafeSpaceReReviewDueDTO[]>("/admin/safe-spaces/re-review-due");

export const suspendBadge = (ref: string, body: { reason: string }) =>
  apiPost<AdminSafeSpaceSuspensionDTO>(
    `/admin/safe-spaces/${encodeURIComponent(ref)}/badge/suspend`,
    body,
  );

export const restoreBadge = (ref: string, body: { reason: string }) =>
  apiPost<AdminSafeSpaceSuspensionDTO>(
    `/admin/safe-spaces/${encodeURIComponent(ref)}/badge/restore`,
    body,
  );

export const getBadgeAudit = (ref: string) =>
  apiGet<SafeSpaceAuditDTO[]>(
    `/admin/safe-spaces/${encodeURIComponent(ref)}/audit`,
  );
