import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  apiPut,
} from "../../../../shared/api/client";
import type { MemberRefDTO, Paginated } from "../../../../shared/api/refs";
import type {
  CommunityBadgeRuleType,
  CommunityBadgeStarterKey,
} from "../communityBadges.catalog";

/**
 * Community badges, gifts and flair
 * (`/communities/:slug/badges`, `/flair`, `/gifts`, `/members/:memberSlug/gifts`).
 *
 * Wire types mirror the backend's `src/community-badges/community-badge-response.ts`
 * (contract section 3). Dates are ISO strings. `iconKey` and `tint` are plain
 * strings on the wire; an unknown value renders as an award in jade.
 *
 * Every route answers `SUBCOMMUNITY_FEATURE_UNAVAILABLE` inside a space, so no
 * caller mounts these hooks in one.
 */

export type MemberRef = MemberRefDTO;

export interface CommunityFlairDTO {
  name: string;
  starterKey: CommunityBadgeStarterKey | null;
  iconKey: string;
  tint: string;
}

/** Member and visitor view of one badge. */
export interface CommunityBadgeDTO {
  id: string;
  name: string;
  starterKey: CommunityBadgeStarterKey | null;
  iconKey: string;
  tint: string;
  ruleType: CommunityBadgeRuleType;
  threshold: number;
  /** The viewer's current count, uncapped. Null for non-members. */
  progress: number | null;
  /** Null when not earned, or for a non-member. */
  earnedAt: string | null;
}

export interface CommunityBadgesResponse {
  isMember: boolean;
  /** Null for a non-member, nothing worn, or a worn badge that is switched off. */
  wornBadgeId: string | null;
  /** Enabled badges only, oldest first. */
  badges: CommunityBadgeDTO[];
}

/** Staff view of one badge. */
export interface CommunityBadgeAdminDTO {
  id: string;
  starterKey: CommunityBadgeStarterKey | null;
  name: string;
  iconKey: string;
  tint: string;
  ruleType: CommunityBadgeRuleType;
  threshold: number;
  isEnabled: boolean;
  /** Live count of award holders currently on the roster. */
  holderCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityBadgeAdminResponse {
  /** The caller is owner-level. */
  canManage: boolean;
  limit: number;
  /** All badges, enabled or not. */
  badges: CommunityBadgeAdminDTO[];
}

export interface CommunityGiftAllowanceDTO {
  limit: number;
  /** Gifts this caller sent here in the last 7 days, removed ones included. */
  used: number;
  remaining: number;
  /** Oldest counted gift's sentAt plus 7 days. Null when nothing is used. */
  resetsAt: string | null;
}

export interface CommunitySentGiftDTO {
  id: string;
  giftKey: string;
  note: string | null;
  recipient: MemberRef;
  sentAt: string;
  allowance: CommunityGiftAllowanceDTO;
}

/** The recipient's own view of a gift. */
export interface CommunityShelfGiftDTO {
  id: string;
  giftKey: string;
  note: string | null;
  /** Null is an erased account, shown as a deleted member. */
  sender: MemberRef | null;
  sentAt: string;
  /** sentAt plus 7 days. */
  markEndsAt: string;
  isHidden: boolean;
}

/** What anyone who can read the community sees of a gift mark. */
export interface CommunityMemberGiftDTO {
  id: string;
  giftKey: string;
  sentAt: string;
  /** The caller is the sender or owner-level. */
  canRemove: boolean;
}

export interface CommunityFlairResponse {
  wornBadgeId: string | null;
  flair: CommunityFlairDTO | null;
}

export interface CreateCommunityBadgeBody {
  name: string;
  iconKey: string;
  tint: string;
  ruleType: CommunityBadgeRuleType;
  threshold: number;
  isEnabled?: boolean;
}

/** The rule type is fixed after create, so it has no place here. */
export type UpdateCommunityBadgeBody = Partial<{
  name: string;
  iconKey: string;
  tint: string;
  threshold: number;
  isEnabled: boolean;
}>;

export interface DeleteCommunityBadgeResult {
  id: string;
  holderCount: number;
}

export interface SendCommunityGiftBody {
  recipientSlug: string;
  giftKey: string;
  note?: string;
}

export interface CommunityMemberGiftsResponse {
  gifts: CommunityMemberGiftDTO[];
}

const badgesPath = (slug: string) => `/communities/${slug}/badges`;
const giftsPath = (slug: string) => `/communities/${slug}/gifts`;

export const getCommunityBadges = (slug: string) =>
  apiGet<CommunityBadgesResponse>(badgesPath(slug));

export const getCommunityBadgeAdmin = (slug: string) =>
  apiGet<CommunityBadgeAdminResponse>(`${badgesPath(slug)}/manage`);

export const createCommunityBadge = (
  slug: string,
  body: CreateCommunityBadgeBody,
) => apiPost<CommunityBadgeAdminDTO>(badgesPath(slug), body);

export const updateCommunityBadge = (
  slug: string,
  badgeId: string,
  body: UpdateCommunityBadgeBody,
) => apiPatch<CommunityBadgeAdminDTO>(`${badgesPath(slug)}/${badgeId}`, body);

export const deleteCommunityBadge = (slug: string, badgeId: string) =>
  apiDelete<DeleteCommunityBadgeResult>(`${badgesPath(slug)}/${badgeId}`);

/** A null badge id stops wearing. */
export const putCommunityFlair = (slug: string, badgeId: string | null) =>
  apiPut<CommunityFlairResponse>(`/communities/${slug}/flair`, { badgeId });

export const getCommunityGiftAllowance = (slug: string) =>
  apiGet<CommunityGiftAllowanceDTO>(`${giftsPath(slug)}/allowance`);

export const sendCommunityGift = (slug: string, body: SendCommunityGiftBody) =>
  apiPost<CommunitySentGiftDTO>(giftsPath(slug), body);

export const getMyCommunityGifts = (slug: string, page: number) =>
  apiGet<Paginated<CommunityShelfGiftDTO>>(
    `${giftsPath(slug)}/mine?page=${page}`,
  );

export const updateCommunityGift = (
  slug: string,
  giftId: string,
  isHidden: boolean,
) =>
  apiPatch<CommunityShelfGiftDTO>(`${giftsPath(slug)}/${giftId}`, {
    isHidden,
  });

export const removeCommunityGift = (slug: string, giftId: string) =>
  apiDelete<{ id: string }>(`${giftsPath(slug)}/${giftId}`);

export const getCommunityMemberGifts = (slug: string, memberSlug: string) =>
  apiGet<CommunityMemberGiftsResponse>(
    `/communities/${slug}/members/${memberSlug}/gifts`,
  );
