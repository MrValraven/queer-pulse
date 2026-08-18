import { apiGet, apiPatch } from "../../../shared/api/client";

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
  apiPatch<AdminInviteQuotaDTO>(
    `/admin/members/${memberSlug}/invite-quota`,
    { quota },
  );
