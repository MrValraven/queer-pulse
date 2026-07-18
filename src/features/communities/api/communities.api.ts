import {
  apiGet,
  apiPost,
  apiPatch,
  apiDelete,
} from "../../../shared/api/client";
import { toItemsPage } from "../../../shared/api/pagination";
import type { MemberRefDTO, Paginated } from "../../../shared/api/refs";

// ── Backend DTOs ─────────────────────────────────────────────────────────────
// Shapes the NestJS communities domain returns. `MemberRef` (author / owner /
// steward) is the shared `MemberRefDTO`; lists come back in the shared
// `Paginated<T>` envelope. Only fields the prototype pages actually render are
// typed richly; the adapters default the prototype-only extras gracefully.

export type CommunityType =
  "social" | "arts" | "activism" | "support" | "sports" | "professional";
export type AccessTier = "public" | "request" | "invite" | "private";
export type RosterRole = "owner" | "mod" | "member";
export type ReactionKey = "heart" | "celebrate" | "support" | "fire";
export type JoinRequestStatus = "pending" | "approved" | "declined";

export interface CommunityCardDTO {
  slug: string;
  name: string;
  type: CommunityType;
  tagline: string;
  accessTier: AccessTier;
  ref: string; // e.g. "QP-C-0003"
  memberCount: number;
  activeThisWeek: number;
  postsThisWeek: number; // derived
  myRole: RosterRole | null; // viewer's roster role, or null
}
export interface CommunityDetailDTO extends CommunityCardDTO {
  purpose: string;
  whoFor: string;
  rosterVisible: boolean;
  features: string[]; // ⊆ "discussion"|"events"|"rooms"|"roster"|"library"
  rules: string[];
  owner: MemberRefDTO | null;
  createdAt: string;
  myJoinRequestStatus: JoinRequestStatus | null;
}
export interface CommunityReactionSummary {
  key: ReactionKey;
  count: number;
  mine: boolean;
} // always all 4 keys
export interface CommunityReplyDTO {
  id: string;
  author: MemberRefDTO | null;
  text: string;
  createdAt: string;
}
export interface CommunityPostDTO {
  id: string;
  author: MemberRefDTO | null;
  body: string;
  image: string | null;
  kind: "post" | "announcement";
  pinned: boolean;
  createdAt: string;
  reactions: CommunityReactionSummary[];
  replies: CommunityReplyDTO[];
  replyCount: number;
}
export interface RosterEntryDTO {
  member: MemberRefDTO;
  role: RosterRole;
  joinedAt: string;
}
export interface CommunityJoinRequestDTO {
  id: string;
  member: MemberRefDTO;
  note: string | null;
  status: JoinRequestStatus;
  createdAt: string;
}
export interface JoinResultDTO {
  outcome: "joined" | "requested";
  role: "member" | null;
  request: CommunityJoinRequestDTO | null;
}

/** One row of `GET /me/communities` — the viewer's complete membership list. */
export interface MyCommunityDTO {
  slug: string;
  name: string;
  role: RosterRole;
  joinedAt: string;
}

export interface CreateCommunityDto {
  name: string;
  purpose: string;
  type: CommunityType;
  whoFor: string;
  accessTier: AccessTier;
  rosterVisible: boolean;
  features: string[];
  rules: string[];
  tagline: string;
  handle: string; // desired slug
  stewards?: string[]; // member slugs → seeded as "mod"
  invites?: string[]; // ⚠ accepted but NOT persisted yet
}
export type UpdateCommunityDto = Partial<CreateCommunityDto>; // `handle` ignored on PATCH
export interface CreatePostDto {
  body: string;
  image?: string;
  kind?: "post" | "announcement";
}
export interface UpdatePostDto {
  body?: string;
  kind?: "post" | "announcement";
  pinned?: boolean;
}

// ── Raw calls (one per endpoint) ─────────────────────────────────────────────

export interface CommunitiesQuery {
  /** `discover` (default) or `mine`. */
  filter?: "discover" | "mine";
  type?: CommunityType;
  access?: AccessTier;
  page?: number;
}

export async function getCommunities(params: CommunitiesQuery = {}) {
  const q = new URLSearchParams();
  if (params.filter) q.set("filter", params.filter);
  if (params.type) q.set("type", params.type);
  if (params.access) q.set("access", params.access);
  if (params.page) q.set("page", String(params.page));
  const qs = q.toString();
  const res = await apiGet<CommunityCardDTO[] | Paginated<CommunityCardDTO>>(
    `/communities${qs ? `?${qs}` : ""}`,
  );
  return toItemsPage(res);
}

export const getCommunity = (slug: string) =>
  apiGet<CommunityDetailDTO>(`/communities/${slug}`);

export const createCommunity = (dto: CreateCommunityDto) =>
  apiPost<CommunityDetailDTO>("/communities", dto);

export const updateCommunity = (slug: string, dto: UpdateCommunityDto) =>
  apiPatch<CommunityDetailDTO>(`/communities/${slug}`, dto);

export async function getCommunityPosts(slug: string, page?: number) {
  const q = new URLSearchParams();
  if (page) q.set("page", String(page));
  const qs = q.toString();
  const res = await apiGet<CommunityPostDTO[] | Paginated<CommunityPostDTO>>(
    `/communities/${slug}/posts${qs ? `?${qs}` : ""}`,
  );
  return toItemsPage(res);
}

export const createPost = (slug: string, dto: CreatePostDto) =>
  apiPost<CommunityPostDTO>(`/communities/${slug}/posts`, dto);

export const updatePost = (slug: string, id: string, dto: UpdatePostDto) =>
  apiPatch<CommunityPostDTO>(`/communities/${slug}/posts/${id}`, dto);

export const reactToPost = (slug: string, id: string, key: ReactionKey) =>
  apiPost<CommunityPostDTO>(`/communities/${slug}/posts/${id}/reactions`, {
    key,
  });

export const unreactToPost = (slug: string, id: string, key: ReactionKey) =>
  apiDelete<CommunityPostDTO>(
    `/communities/${slug}/posts/${id}/reactions/${key}`,
  );

export const replyToPost = (slug: string, id: string, text: string) =>
  apiPost<CommunityReplyDTO>(`/communities/${slug}/posts/${id}/replies`, {
    text,
  });

export const getRoster = (slug: string) =>
  apiGet<RosterEntryDTO[]>(`/communities/${slug}/roster`);

export const joinCommunity = (slug: string, note?: string) =>
  apiPost<JoinResultDTO>(`/communities/${slug}/join`, note ? { note } : {});

export const getJoinRequests = (slug: string) =>
  apiGet<CommunityJoinRequestDTO[]>(`/communities/${slug}/join-requests`);

export const reviewJoinRequest = (
  slug: string,
  id: string,
  action: "approve" | "decline",
) =>
  apiPatch<CommunityJoinRequestDTO>(
    `/communities/${slug}/join-requests/${id}`,
    { action },
  );

export const removeMember = (slug: string, memberSlug: string) =>
  apiDelete<void>(`/communities/${slug}/members/${memberSlug}`);

/** PATCH /communities/:slug/members/:memberSlug — promote to mod / demote to member. */
export const setMemberRole = (
  slug: string,
  memberSlug: string,
  role: "member" | "mod",
) =>
  apiPatch<{ slug: string; memberSlug: string; role: "member" | "mod" }>(
    `/communities/${slug}/members/${memberSlug}`,
    { role },
  );

/** GET /me/communities — every community the viewer belongs to. Deliberately a
 *  bare array, not paginated: it's the whole membership map in one call, which
 *  is the only way to get it (filtering paginated community pages can only ever
 *  reconstruct the subset of pages already fetched). */
export const getMyCommunities = () =>
  apiGet<MyCommunityDTO[]>("/me/communities");
