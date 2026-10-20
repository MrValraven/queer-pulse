import { apiGet } from "../../../shared/api/client";
import type { AvatarTone } from "../ui";

export type Standing = "trusted" | "warned" | "new" | "flagged";
export type AccountKind = "founder" | "staff" | "system" | "member";
export type WeakVoucherReason = "new" | "flagged" | "ring";
export type JoinPathKind = "founder" | "invite" | "application" | "unknown";
export type TrustCaseKind = "ring" | "isolated" | "flagged";

export interface TrustMemberRefDTO {
  slug: string;
  name: string;
}

export interface TrustWeakVoucherDTO extends TrustMemberRefDTO {
  reason: WeakVoucherReason;
}

export interface TrustJoinPathDTO {
  kind: JoinPathKind;
  /** Inviter (invite) or reviewer (application). */
  bySlug: string | null;
  byName: string | null;
  /** ISO: invite usedAt, join request reviewedAt, or joinedAt. */
  at: string | null;
}

export interface TrustTrackRecordDTO {
  /** Distinct vouchees ever, active and withdrawn. */
  vouchesGiven: number;
  /** Of those, currently suspended or standing 'flagged'. */
  laterFlaggedCount: number;
}

export interface TrustNodeDTO {
  id: string;
  /** The member's real account id, distinct from `id`/`slug` (the profile
   *  slug used as the graph's node key). Needed to call an account-level
   *  admin action (e.g. verify) against this node. */
  userId: string;
  slug: string;
  name: string;
  pronouns: string | null;
  initials: string;
  tone: AvatarTone;
  avatarUrl: string | null;
  joinedAt: string;
  standing: Standing;
  /** ADM-23: real cycle detection, distinct from `standing`. */
  inRing: boolean;
  sceneId: string | null;
  role: string | null;
  openReportCount: number;
  verified: boolean;
  private: boolean;
  accountKind: AccountKind;
  ringId: string | null;
  /** Empty when the member is not trust-isolated. */
  isolatedBy: TrustWeakVoucherDTO[];
  joinPath: TrustJoinPathDTO;
  trackRecord: TrustTrackRecordDTO;
  /** Platform-wide count across every member. */
  activeInboundCount: number;
  activeOutboundCount: number;
  /** Every top-level community, primary first. */
  sceneIds: string[];
}

export interface TrustEdgeDTO {
  id: string;
  from: string;
  to: string;
  mutual: boolean;
  withdrawn: boolean;
  createdAt: string;
  relationship: string | null;
  note: string | null;
  anonymous: boolean;
  kind: "invite" | "vouch";
}

export interface SceneDTO {
  id: string;
  label: string;
  color: string;
}

export interface TrustRingDTO {
  /** `ring:${alphabetically first member slug}`. */
  id: string;
  /** The full ring, members outside the view included. */
  memberSlugs: string[];
  memberCount: number;
  /** ISO, earliest member joinedAt. */
  firstJoinedAt: string;
  lastJoinedAt: string;
  /** Outside members vouching for 2+ ring members. */
  sharedVouchers: TrustMemberRefDTO[];
}

export interface TrustCaseDTO {
  /** Ring id, `isolated:${slug}` or `flagged:${slug}`. */
  id: string;
  kind: TrustCaseKind;
  /** Who the graph focuses on when the case is clicked. */
  subjectSlug: string;
  subjectName: string;
  ringId: string | null;
  /** Ring size; 1 for the other kinds. */
  memberCount: number;
  /** Isolated cases only; 0 for the other kinds. */
  weakVoucherCount: number;
  openReportCount: number;
  /** Ring cases only: ceil((last - first joinedAt) / 1h). */
  windowHours: number | null;
  score: number;
}

export interface TrustNetworkDTO {
  nodes: TrustNodeDTO[];
  edges: TrustEdgeDTO[];
  /** Covers every community in any node's sceneIds. */
  scenes: SceneDTO[];
  truncated: boolean;
  /** Rings with at least one member in `nodes`. */
  rings: TrustRingDTO[];
  /** Platform-wide, top 50 by score. */
  cases: TrustCaseDTO[];
  /** Platform-wide total. */
  openCaseCount: number;
  /** ISO. */
  platformStartedAt: string;
  newAccountWindowDays: number;
}

/** Badge and entry point for the trust network, from
 *  `GET /admin/trust-network/summary`. */
export interface TrustNetworkSummaryDTO {
  openCaseCount: number;
  /** Top case subject, else the earliest founder or staff slug, else null. */
  entrySlug: string | null;
}

/** One typeahead result from `GET /admin/trust-network/search`, enough to
 *  render a picker row and jump the graph to `slug` (ADM-10). */
export interface TrustNetworkMemberSearchResultDTO {
  slug: string;
  name: string;
  initials: string;
  avatarUrl: string | null;
}

/**
 * `focus`, when set, pins that member's slug into the returned node set even
 * if their join date falls outside the graph's node cap, so opening the
 * modal for an older member never renders "not found" (ADM-10).
 */
export const getAdminTrustNetwork = (focus?: string) =>
  apiGet<TrustNetworkDTO>(
    `/admin/trust-network${focus ? `?focus=${encodeURIComponent(focus)}` : ""}`,
  );

/** Open case count and entry slug behind the Members header badge. */
export const getAdminTrustNetworkSummary = () =>
  apiGet<TrustNetworkSummaryDTO>("/admin/trust-network/summary");

/** Typeahead behind the graph modal's "find a member" search box (ADM-10). */
export const searchTrustNetworkMembers = (term: string) =>
  apiGet<TrustNetworkMemberSearchResultDTO[]>(
    `/admin/trust-network/search?q=${encodeURIComponent(term)}`,
  );
