import { apiGet } from "../../../shared/api/client";

/**
 * Admin members panel (`/admin/members`, admin-only). Mirrors the backend's
 * `src/admin-members/admin-members-response.ts` field for field. Kept
 * self-contained (no cross-import of the frontend view-model types) the same
 * way `adminCommunities.api.ts` is — the adapter file, not this one, is
 * responsible for reconciling the wire shape with the view model.
 */

export type BadgeTone = "plum" | "coral" | "jade" | "violet" | "amber";
export type ModerationState = "under_review" | "frozen" | "limited";

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
  openReportCount: number;
  joinedAt: string;
  tagline: string | null;
  communities: string[];
  avatarUrl: string | null;
  vouchCount: number;
  vouchedBy: VouchAvatarDTO[];
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
  avatarUrl: string | null;
  vouchCount: number;
  outboundVouchCount: number;
  joinedAt: string;
  openReportCount: number;
  communities: { name: string; role: "owner" | "mod" | "member" }[];
  contributions: { kind: string; detail: string | null; at: string }[];
  moderationTimeline: AdminMemberModerationEntryDTO[];
  graph: { center: VouchAvatarDTO; nodes: VouchGraphNodeDTO[] };
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
