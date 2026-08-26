import {
  ApiError,
  apiDelete,
  apiGet,
  apiPatch,
} from "../../../shared/api/client";

/**
 * Admin invite oversight (`/admin/invites`, admin-only). Lists every invite on
 * the platform — who sent it, who (if anyone) accepted it, its status, and its
 * dates — so staff can audit the vouched-invite graph. The backend scopes this
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
   *  override — they use the platform-wide default. Editable inline from the
   *  oversight page via {@link patchAdminInviteQuota}. */
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

/**
 * Revoke any still-valid invite platform-wide, whoever sent it
 * (`DELETE /admin/invites/:id`, admin-only, audited server-side). The
 * member-facing revoke is scoped to its own inviter, so this is the only route
 * that can pull someone else's live invite link.
 *
 * Addressed by the invite's internal `id` (the list already carries it), never
 * the shared `code`. Returns the invite in its new `revoked` state, so the
 * caller can patch the row rather than refetch the page.
 *
 * Failure modes the UI must tell apart from a generic error:
 * - `404` — no invite with that id (it was hard-deleted, or the id is stale)
 * - `409` — the invite is no longer valid: already accepted, revoked, or
 *   expired ({@link isInviteNotRevocableError}). Expected whenever the drawer
 *   has been open a while, so it reads as "this moved on", never as a fault.
 */
export const deleteAdminInvite = (inviteId: string) =>
  apiDelete<AdminInviteDTO>(`/admin/invites/${inviteId}`);

/** True when the backend refused a revoke because the invite is not valid any
 *  more. A conflict, not a failure — the row simply moved on underneath the
 *  open drawer. */
export function isInviteNotRevocableError(err: unknown): boolean {
  return err instanceof ApiError && err.status === 409;
}

/**
 * Ban-evasion signals for the invite review console
 * (`GET /admin/ban-evasion/join-requests`, moderator + admin).
 *
 * ADVISORY ONLY. The backend never blocks anyone on these: it returns a
 * confidence tier and a list of reasons, each one about a specific account that
 * was removed, and the reviewer in front of the queue decides what to do. There
 * is no endpoint anywhere that acts on them.
 *
 * Declared here rather than in a file of its own because the only consumer is
 * the invite review queue, the same reason `patchAdminInviteQuota` lives here.
 */

/** How loudly the console asks a reviewer to look. */
export type BanEvasionTier = "none" | "low" | "medium" | "high";

/** Stable reason keys, resolved to copy by the frontend catalogue — the same
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
 * Assess a page of the review queue in one call. Addressed by join-request id,
 * never by a raw email, so this can never be used as a "has this address ever
 * been banned" lookup.
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
 * (`PATCH /admin/members/:memberSlug/invite-quota`) — declared here rather
 * than in `adminMembers.api.ts` because the only consumer is this page's
 * inviter list, which already carries `inviteMonthlyQuota` on each row.
 */
export const patchAdminInviteQuota = (
  memberSlug: string,
  quota: number | null,
) =>
  apiPatch<AdminInviteQuotaDTO>(`/admin/members/${memberSlug}/invite-quota`, {
    quota,
  });
