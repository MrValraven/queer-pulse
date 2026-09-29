import {
  ApiError,
  apiGet,
  apiPatch,
  apiPost,
} from "../../../shared/api/client";
import type { AmbassadorFocusArea } from "../../../shared/ambassadors/ambassadorFocusAreas.data";

/** Which side of the roster the page is reading: current ambassadors, or the
 *  revoked grants kept for the record. */
export type AdminAmbassadorStatus = "active" | "past";

export const ADMIN_AMBASSADOR_STATUSES: readonly AdminAmbassadorStatus[] = [
  "active",
  "past",
];

export function isAdminAmbassadorStatus(
  value: unknown,
): value is AdminAmbassadorStatus {
  return value === "active" || value === "past";
}

/** A staff member named on a grant or a revoke. */
export interface AdminAmbassadorActorDTO {
  slug: string;
  name: string;
}

/** One ambassador grant as staff see it, active or revoked. */
export interface AdminAmbassadorDTO {
  /** The grant row's id. A re-grant is a new row with a new id. */
  id: string;
  member: {
    slug: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  };
  focusArea: AmbassadorFocusArea;
  grantedAt: string;
  grantedBy: AdminAmbassadorActorDTO | null;
  grantReason: string;
  revokedAt: string | null;
  revokedBy: AdminAmbassadorActorDTO | null;
  revokeReason: string | null;
  isTagVisible: boolean;
  /** The member's staff-set monthly invite quota. When set it replaces every
   *  bonus, the ambassador's +10 included, so the page flags it. */
  inviteQuotaOverride: number | null;
}

/** The private "QueerPulse Ambassadors" community, as the page summarises it. */
export interface AdminAmbassadorCircleDTO {
  slug: string;
  memberCount: number;
  isViewerMember: boolean;
}

/** The backend's `@Length(3, 500)` on both the grant and the revoke reason,
 *  counted on the trimmed text. The forms gate on these so a too-short reason
 *  never reaches the server as a code-less 400. */
export const AMBASSADOR_REASON_MIN_LENGTH = 3;
export const AMBASSADOR_REASON_MAX_LENGTH = 500;

/** Whether a typed reason is long enough to send once trimmed. */
export function isAmbassadorReasonValid(reason: string): boolean {
  const trimmedLength = reason.trim().length;
  return (
    trimmedLength >= AMBASSADOR_REASON_MIN_LENGTH &&
    trimmedLength <= AMBASSADOR_REASON_MAX_LENGTH
  );
}

export interface GrantAmbassadorBody {
  memberSlug: string;
  focusArea: AmbassadorFocusArea;
  reason: string;
}

/** GET /admin/ambassadors?status=: Admin or the `partnerships` staff grant. */
export const getAdminAmbassadors = (status: AdminAmbassadorStatus) =>
  apiGet<AdminAmbassadorDTO[]>(`/admin/ambassadors?status=${status}`);

/** POST /admin/ambassadors: grants the status and seats the member in the
 *  circle. 409 `ambassador_already_active` when they already hold it. */
export const grantAmbassador = (body: GrantAmbassadorBody) =>
  apiPost<AdminAmbassadorDTO>("/admin/ambassadors", body);

/** PATCH /admin/ambassadors/:id: the focus area is the only editable field. */
export const updateAmbassadorFocus = (
  id: string,
  focusArea: AmbassadorFocusArea,
) => apiPatch<AdminAmbassadorDTO>(`/admin/ambassadors/${id}`, { focusArea });

/** POST /admin/ambassadors/:id/revoke: the reason is required and logged. */
export const revokeAmbassador = (id: string, reason: string) =>
  apiPost<AdminAmbassadorDTO>(`/admin/ambassadors/${id}/revoke`, { reason });

/** GET /admin/ambassadors/circle. */
export const getAmbassadorCircle = () =>
  apiGet<AdminAmbassadorCircleDTO>("/admin/ambassadors/circle");

/** POST /admin/ambassadors/circle/staff-seat: seats the caller as a mod so
 *  they can post previews and polls and restyle the card. */
export const takeAmbassadorCircleStaffSeat = () =>
  apiPost<{ slug: string }>("/admin/ambassadors/circle/staff-seat", {});

/** The coded failures the ambassadors endpoints send, each with its own copy. */
export const AMBASSADOR_ERROR_CODES = [
  "ambassador_already_active",
  "ambassador_not_found",
  "ambassador_member_not_found",
  "ambassador_self_grant",
  "ambassador_ineligible_member",
] as const;

export type AmbassadorErrorCode = (typeof AMBASSADOR_ERROR_CODES)[number];

/**
 * The i18n key for a failed ambassadors call: the coded message when the body
 * names a known code, the generic one for anything else (a network drop, a
 * 500, a code this build does not know yet).
 */
export function ambassadorErrorKey(error: unknown): string {
  const code =
    error instanceof ApiError
      ? (error.data as { code?: unknown } | undefined)?.code
      : undefined;
  return (AMBASSADOR_ERROR_CODES as readonly unknown[]).includes(code)
    ? `admin:ambassadors.errors.${code as AmbassadorErrorCode}`
    : "admin:ambassadors.errors.generic";
}
