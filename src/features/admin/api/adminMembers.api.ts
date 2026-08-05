import { apiDelete, apiGet, apiPatch, apiPost } from "../../../shared/api/client";

/**
 * Admin members panel (`/admin/members`, admin-only). Mirrors the backend's
 * `src/admin-members/admin-members-response.ts` field for field. Kept
 * self-contained (no cross-import of the frontend view-model types) the same
 * way `adminCommunities.api.ts` is — the adapter file, not this one, is
 * responsible for reconciling the wire shape with the view model.
 */

export type BadgeTone = "plum" | "coral" | "jade" | "violet" | "amber";
export type ModerationState = "under_review" | "frozen" | "limited";

/** The member's platform role — mirrors the backend `UserRole` enum values. */
export type MemberRole = "member" | "moderator" | "admin";

export interface VouchAvatarDTO {
  initials: string;
  tone: BadgeTone;
  slug: string;
  avatarUrl: string | null;
}

/** Which way a vouch runs relative to the center member: `inbound` = they
 *  vouched FOR the member, `outbound` = the member vouched FOR them, `mutual`
 *  = both. */
export type VouchDirection = "inbound" | "outbound" | "mutual";

export interface VouchGraphNodeDTO extends VouchAvatarDTO {
  direction: VouchDirection;
}

export interface AdminMemberCardDTO {
  id: string;
  slug: string;
  name: string;
  initials: string;
  tone: BadgeTone;
  pronouns: string | null;
  verified: boolean;
  role: MemberRole;
  openReportCount: number;
  joinedAt: string;
  tagline: string | null;
  communities: string[];
  avatarUrl: string | null;
  vouchCount: number;
  vouchedBy: VouchAvatarDTO[];
  /** Additive functional grants on top of `role` (e.g. `magazine_editor`) —
   *  see `staffRoles.registry.ts`. Raw strings here; the adapter narrows to
   *  known `StaffRoleId`s. */
  staffRoles: string[];
}

export interface AdminMemberListDTO {
  items: AdminMemberCardDTO[];
  total: number;
  page: number;
  pageSize: number;
}

export interface FlaggedMemberDTO {
  id: string;
  slug: string;
  handle: string;
  initials: string;
  tone: BadgeTone;
  avatarUrl: string | null;
  openReportCount: number;
  topReasonCode: string | null;
  moderationState: ModerationState;
  joinedAt: string;
  latestReportDetail: string | null;
}

export interface AdminMemberModerationEntryDTO {
  tone: "good" | "neutral" | "bad";
  action: string;
  reasonCode: string | null;
  actorName: string | null;
  note: string | null;
  at: string;
  reportId: string | null;
}

export interface AdminMemberDetailDTO {
  id: string;
  slug: string;
  name: string;
  initials: string;
  tone: BadgeTone;
  pronouns: string | null;
  verified: boolean;
  role: MemberRole;
  isSystem: boolean;
  /** True while the member is under an active suspension. */
  suspended?: boolean;
  avatarUrl: string | null;
  vouchCount: number;
  outboundVouchCount: number;
  joinedAt: string;
  openReportCount: number;
  communities: { name: string; role: "owner" | "mod" | "member" }[];
  contributions: { kind: string; detail: string | null; at: string }[];
  moderationTimeline: AdminMemberModerationEntryDTO[];
  graph: { center: VouchAvatarDTO; nodes: VouchGraphNodeDTO[] };
  /** Additive functional grants on top of `role` (e.g. `magazine_editor`) —
   *  see `staffRoles.registry.ts`. Raw strings here; the adapter narrows to
   *  known `StaffRoleId`s. */
  staffRoles: string[];
}

/** Paginated member grid for the admin panel, optionally filtered. Admin-only — 403s otherwise. */
export const getAdminMembers = (parameters: {
  page?: number;
  filter?: "all" | "verified" | "new";
}) => {
  const searchParams = new URLSearchParams();
  if (parameters.page) searchParams.set("page", String(parameters.page));
  if (parameters.filter && parameters.filter !== "all") {
    searchParams.set("filter", parameters.filter);
  }
  const querySuffix = searchParams.toString();
  return apiGet<AdminMemberListDTO>(
    `/admin/members${querySuffix ? `?${querySuffix}` : ""}`,
  );
};

/** Every member with at least one open report, for the flagged-members queue. */
export const getAdminFlagged = () =>
  apiGet<FlaggedMemberDTO[]>("/admin/members/flagged");

/** One member's detail view, including their moderation timeline and vouch graph. */
export const getAdminMember = (memberId: string) =>
  apiGet<AdminMemberDetailDTO>(`/admin/members/${memberId}`);

/** The shape returned after a role change, so the roster/drawer can patch in
 *  place. Mirrors the backend `AdminMemberRoleDTO`. */
export interface AdminMemberRoleDTO {
  id: string;
  slug: string;
  role: MemberRole;
  isSystem: boolean;
}

/** Grant or revoke `moderator` / `admin` on one member. Admin-only; the backend
 *  enforces the guardrails (no self-change, no house account, never the last
 *  admin) and 403/409s otherwise. */
export const patchAdminMemberRole = (memberId: string, role: MemberRole) =>
  apiPatch<AdminMemberRoleDTO>(`/admin/members/${memberId}/role`, { role });

/**
 * Lift a member's active suspension (reinstate them), consuming the backend's
 * moderator endpoint `PATCH /mod/users/:userId/suspension` (liftSuspension).
 * Moderator/admin-only; the backend enforces the guardrails and 403s otherwise.
 */
export const liftUserSuspension = (userId: string) =>
  apiPatch<void>(`/mod/users/${userId}/suspension`, { action: "lift" });

/** The shape returned after verifying a member. Mirrors the backend
 *  `VerifiedMemberDTO`. */
export interface VerifiedMemberDTO {
  id: string;
  slug: string;
  verified: boolean;
  verifiedAt: string | null;
}

/** Verify a member (stamps who/when). Moderator/admin-only; the backend 404s an
 *  unknown member and is idempotent (verifying twice is a no-op). */
export const verifyMember = (memberId: string) =>
  apiPost<VerifiedMemberDTO>(`/admin/members/${memberId}/verify`, {});

/** The shape returned after restricting a member. Mirrors the backend
 *  `RestrictedMemberDTO`. */
export interface RestrictedMemberDTO {
  id: string;
  status: string;
  /** ISO expiry; `null` = permanent (a ban). */
  suspendedUntil: string | null;
}

/** The `POST /admin/members/:id/restrict` body. `duration` omitted = permanent
 *  (a ban); `"7d"`/`"24h"`/`"30d"` = a time-boxed suspension. `reasonCode` is a
 *  shared reason-catalogue code; `note` is the member-facing text. */
export interface RestrictMemberInput {
  reasonCode: string;
  note: string;
  duration?: string;
}

/** Restrict a member platform-wide. Moderator/admin-only; the backend enforces
 *  the guardrails (not yourself, not a staff/house account) and 403/404s
 *  otherwise, surfaced by the global mutation-error toast. */
export const restrictMember = (memberId: string, input: RestrictMemberInput) =>
  apiPost<RestrictedMemberDTO>(`/admin/members/${memberId}/restrict`, input);

/** The shape returned after a staff-role grant/revoke, so the roster/drawer
 *  can patch in place. Mirrors the backend's grant/revoke response. */
export interface AdminStaffRolesDTO {
  userId: string;
  slug: string;
  staffRoles: string[];
}

/** Grant one additive staff role (e.g. `magazine_editor`) to a member.
 *  Admin-only; the backend enforces the guardrails (no house account) and
 *  403/404s otherwise. */
export const grantStaffRole = (memberId: string, role: string) =>
  apiPost<AdminStaffRolesDTO>(`/admin/members/${memberId}/staff-roles`, {
    role,
  });

/** Revoke one additive staff role from a member. Admin-only. */
export const revokeStaffRole = (memberId: string, role: string) =>
  apiDelete<AdminStaffRolesDTO>(
    `/admin/members/${memberId}/staff-roles/${role}`,
  );
