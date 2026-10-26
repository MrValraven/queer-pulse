import {
  ApiError,
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
} from "../../../shared/api/client";

/**
 * Admin invite oversight (`/admin/invites`, admin-only). Lists every invite on
 * the platform (who sent it, who if anyone accepted it, its status, and its
 * dates) so staff can audit the vouched-invite graph. The backend scopes this
 * to admins and 403s otherwise; this file only owns the wire shape.
 */

export type AdminInviteStatus = "valid" | "used" | "expired" | "revoked";

export interface AdminInvitePersonDTO {
  slug: string;
  name: string;
  avatarUrl?: string | null;
}

export interface AdminInviteDTO {
  id: string;
  code: string;
  status: AdminInviteStatus;
  /** The member who created the invite. */
  inviter: AdminInvitePersonDTO;
  /** The recipient who accepted it, once `used`. */
  invitee?: AdminInvitePersonDTO | null;
  /** The email the inviter addressed it to, if any. */
  email?: string | null;
  /** The personal message the inviter wrote when sending the invite. */
  note?: string | null;
  /** The inviter's "why I'm inviting you" vouch message. */
  vouch?: string | null;
  /** The inviter's own label for who the invite is for. Seen only by the
   *  inviter and admins. */
  privateNote?: string | null;
  /** ISO timestamp the invite was created. */
  createdAt: string;
  /** ISO timestamp the invite stops working. */
  expiresAt: string;
}

export interface AdminInviteListDTO {
  items: AdminInviteDTO[];
  total: number;
  page: number;
  pageSize: number;
}

/** One sender in the "filter by inviter" dropdown: a member who has minted at
 *  least one invite, with how many they sent. Keyed by `slug`. */
export interface AdminInviteInviterDTO {
  slug: string;
  name: string;
  avatarUrl?: string | null;
  count: number;
  /** This inviter's per-member monthly invite quota override. `null` means no
   *  override: they use the platform-wide default. Set from the invite limits
   *  modal via {@link patchAdminInviteQuota}. */
  inviteMonthlyQuota: number | null;
}

/** Paginated invite list for the admin panel, optionally filtered by status and
 *  a single sender (by slug, resolved server-side). */
export const getAdminInvites = (parameters: {
  page?: number;
  status?: AdminInviteStatus;
  inviterSlug?: string;
}) => {
  const searchParams = new URLSearchParams();
  if (parameters.page) searchParams.set("page", String(parameters.page));
  if (parameters.status) searchParams.set("status", parameters.status);
  if (parameters.inviterSlug)
    searchParams.set("inviterSlug", parameters.inviterSlug);
  const querySuffix = searchParams.toString();
  return apiGet<AdminInviteListDTO>(
    `/admin/invites${querySuffix ? `?${querySuffix}` : ""}`,
  );
};

/** Every member who has sent an invite, for the sender filter's dropdown. */
export const getAdminInviteInviters = () =>
  apiGet<AdminInviteInviterDTO[]>("/admin/invites/inviters");

/** One member in the invite limits list, with this month's usage beside the
 *  limit that applies to them. Keyed by `slug`. */
export interface AdminInviteQuotaMemberDTO {
  slug: string;
  name: string;
  avatarUrl: string | null;
  /** Invites sent since the start of the current UTC month. */
  sentThisMonth: number;
  /** Invites sent since the account was created. */
  sentTotal: number;
  /** The admin override, or `null` when the member has none. */
  inviteMonthlyQuota: number | null;
  /** The limit that applies this month: the override when set, otherwise the
   *  platform default plus any perk or ambassador bonus. */
  monthlyLimit: number;
  /** `false` while the member's invite access is paused: they cannot send
   *  invites whatever their limit says. The limit itself stays editable. */
  hasInviteAccess: boolean;
}

/** One page of the invite limits list. */
export interface AdminInviteQuotaListDTO {
  /** The platform-wide monthly invite allowance before any bonus. */
  defaultMonthlyQuota: number;
  items: AdminInviteQuotaMemberDTO[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * The invite limits list (`GET /admin/invites/quotas`, admin-only), ordered by
 * this month's sends, most first, 20 to a page. With no `q` it holds every
 * member who has sent an invite or carries an override; with `q` it holds any
 * member whose name or handle matches, searched on the server.
 */
export const getAdminInviteQuotas = (parameters: {
  q?: string;
  page?: number;
}) => {
  const searchParams = new URLSearchParams();
  if (parameters.q) searchParams.set("q", parameters.q);
  if (parameters.page) searchParams.set("page", String(parameters.page));
  const querySuffix = searchParams.toString();
  return apiGet<AdminInviteQuotaListDTO>(
    `/admin/invites/quotas${querySuffix ? `?${querySuffix}` : ""}`,
  );
};

/**
 * Revoke any still-valid invite platform-wide, whoever sent it
 * (`DELETE /admin/invites/:id`, admin-only, audited server-side). The
 * member-facing revoke is scoped to its own inviter, so this is the only route
 * that can pull someone else's live invite link.
 *
 * Addressed by the invite's internal `id`, which the list already carries.
 * Returns the invite in its new `revoked` state, so the caller patches the row
 * in place with no refetch of the page.
 *
 * Failure modes the UI must tell apart from a generic error:
 * - `404`: no invite with that id (it was hard-deleted, or the id is stale)
 * - `409`: the invite is no longer valid: already accepted, revoked, or
 *   expired ({@link isInviteNotRevocableError}). Expected whenever the drawer
 *   has been open a while, so it reads as "this moved on".
 */
export const deleteAdminInvite = (inviteId: string) =>
  apiDelete<AdminInviteDTO>(`/admin/invites/${inviteId}`);

/** True when the backend refused a revoke because the invite is not valid any
 *  more. The row simply moved on underneath the open drawer, which is
 *  ordinary. */
export function isInviteNotRevocableError(err: unknown): boolean {
  return err instanceof ApiError && err.status === 409;
}

/**
 * Bring any expired invite back to life platform-wide, whoever sent it
 * (`POST /admin/invites/:id/refresh`, admin-only, no body, audited server-side
 * as the mod action `invite_refreshed`). The invite keeps its `code`, so the
 * link the inviter already shared works again, and its expiry moves to seven
 * days from now.
 *
 * Addressed by the invite's internal `id`, the same as the revoke. Returns the
 * invite in its new `valid` state, so the caller can patch the row in place.
 *
 * Failure modes the UI must tell apart from a generic error:
 * - `404`: no invite with that id (it was hard-deleted, or the id is stale)
 * - `409`: the invite is no longer expired: accepted, revoked, or already
 *   valid again ({@link isInviteNotRefreshableError}). Expected whenever the
 *   drawer has been open a while, so it reads as "this moved on".
 */
export const postAdminInviteRefresh = (inviteId: string) =>
  apiPost<AdminInviteDTO>(`/admin/invites/${inviteId}/refresh`);

/** True when the backend refused a refresh because the invite is not expired
 *  any more. The row moved on underneath the open drawer, which is ordinary. */
export function isInviteNotRefreshableError(err: unknown): boolean {
  return err instanceof ApiError && err.status === 409;
}

/** The most invites one bulk request may name. Mirrors the backend's
 *  `ADMIN_INVITE_BULK_CAP`: the selection on the oversight page never grows
 *  past it, so a request over the cap is never sent. */
export const ADMIN_INVITE_BULK_CAP = 100;

/** What a bulk request does to each invite it names: `refresh` brings an
 *  expired invite back for seven days, `revoke` pulls a pending one. */
export type AdminInviteBulkAction = "refresh" | "revoke";

/** Why the backend left one named invite as it was. `still_valid` answers a
 *  refresh of an invite that had not expired; `expired` answers a revoke of
 *  one that already had. */
export type AdminInviteBulkSkipReason =
  "not_found" | "accepted" | "revoked" | "expired" | "still_valid";

/** One invite a bulk request did not change. `code` is null when the id
 *  matched no invite at all. */
export interface AdminInviteBulkSkippedDTO {
  id: string;
  code: string | null;
  reason: AdminInviteBulkSkipReason;
}

/** The outcome of one bulk request: every invite it changed, in its new
 *  state, and every one it left alone with the reason. */
export interface AdminInviteBulkResultDTO {
  updated: AdminInviteDTO[];
  skipped: AdminInviteBulkSkippedDTO[];
}

/**
 * Refresh or revoke up to {@link ADMIN_INVITE_BULK_CAP} invites in one call
 * (`POST /admin/invites/bulk`, admin-only, audited server-side per invite).
 *
 * Each invite follows the same rules as its single route: `refresh` works only
 * on an expired invite, `revoke` only on a pending (`valid`) one. One invite
 * failing never fails the rest; it comes back in `skipped` with its reason, so
 * the caller can patch every `updated` row in place and name what was left.
 */
export const postAdminInvitesBulk = (
  action: AdminInviteBulkAction,
  inviteIds: string[],
) =>
  apiPost<AdminInviteBulkResultDTO>("/admin/invites/bulk", {
    action,
    ids: inviteIds,
  });

/** How many invites one "refresh every expired invite" call brought back. */
export interface AdminInviteRefreshExpiredResultDTO {
  refreshedCount: number;
}

/**
 * Refresh every expired invite platform-wide, or only those one member sent
 * (`POST /admin/invites/refresh-expired`, admin-only, audited server-side).
 * Each refreshed invite keeps its code and works again for seven days. The
 * response carries only the count, so the caller refetches its lists.
 */
export const postAdminInvitesRefreshExpired = (inviterSlug?: string) =>
  apiPost<AdminInviteRefreshExpiredResultDTO>(
    "/admin/invites/refresh-expired",
    inviterSlug ? { inviterSlug } : {},
  );

/**
 * Ban-evasion signals for the invite review console
 * (`GET /admin/ban-evasion/join-requests`, moderator + admin).
 *
 * ADVISORY ONLY. The backend never blocks anyone on these: it returns a
 * confidence tier and a list of reasons, each one about a specific account that
 * was removed, and the reviewer in front of the queue decides what to do. There
 * is no endpoint anywhere that acts on them.
 *
 * Declared in this file because the only consumer is the invite review
 * queue, the same reason `patchAdminInviteQuota` lives here.
 */

/** How loudly the console asks a reviewer to look. */
export type BanEvasionTier = "none" | "low" | "medium" | "high";

/** Stable reason keys, resolved to copy by the frontend catalogue: the same
 *  shape the queue's existing join-request flags use. */
export type BanEvasionSignalKind =
  | "sign_in_identifier_match"
  | "intake_contact_match"
  | "stated_details_match"
  | "inviter_removed"
  | "inviter_of_removed_account"
  | "reference_removed"
  | "reference_of_removed_account";

export interface BanEvasionSignalDTO {
  kind: BanEvasionSignalKind;
  removalKind: "platform_ban" | "community_ban";
  /** ISO timestamp of the removal. */
  removedAt: string;
  /** Null once the removed account has been erased, which is the ordinary
   *  case: only the date and the kind of removal survive erasure. */
  removedAccountName: string | null;
  removedAccountSlug: string | null;
  /** Named for a community ban; null for a platform ban. */
  communityName: string | null;
}

export interface BanEvasionAssessmentDTO {
  /** The join-request id this assessment is about. */
  subjectId: string;
  tier: BanEvasionTier;
  score: number;
  signals: BanEvasionSignalDTO[];
}

/**
 * Assess a page of the review queue in one call. Addressed by join-request id
 * alone, so this can never serve as a "has this address ever been banned"
 * lookup.
 */
export const getBanEvasionForJoinRequests = (joinRequestIds: string[]) =>
  apiGet<BanEvasionAssessmentDTO[]>(
    `/admin/ban-evasion/join-requests?ids=${encodeURIComponent(joinRequestIds.join(","))}`,
  );

/** The shape returned after setting or clearing a member's invite quota
 *  override. Mirrors the backend's `updateInviteQuota` response. */
export interface AdminInviteQuotaDTO {
  userId: string;
  slug: string;
  inviteMonthlyQuota: number | null;
}

/**
 * Set (or, with `quota: null`, clear) one member's monthly invite quota
 * override. Admin-only. Lives on `AdminMembersController` on the backend
 * (`PATCH /admin/members/:memberSlug/invite-quota`). Declared in this file
 * because its only consumer is the invite limits modal, which reads its rows
 * from {@link getAdminInviteQuotas} beside it.
 */
export const patchAdminInviteQuota = (
  memberSlug: string,
  quota: number | null,
) =>
  apiPatch<AdminInviteQuotaDTO>(`/admin/members/${memberSlug}/invite-quota`, {
    quota,
  });
