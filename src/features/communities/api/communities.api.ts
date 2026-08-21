import {
  apiGet,
  apiPost,
  apiPatch,
  apiDelete,
} from "../../../shared/api/client";
import { toItemsPage } from "../../../shared/api/pagination";
import type { MemberRefDTO, Paginated } from "../../../shared/api/refs";
import type { ReasonCode } from "../../safety/reportReasons";

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
  /** Resolved cover-image URL, or null when the community has no cover. The
   *  Discover-grid/featured cards render this; the owner's edit modal seeds
   *  its `ImageUploadField` from the same field on the detail DTO. */
  coverImageUrl: string | null;
  /** Curated tag ids (⊆ `COMMUNITY_TAGS`, `communityTags.data.ts`) the owner/
   *  mod picked for this community. Every card variant renders these as
   *  pills; absent/empty when none picked yet. */
  tags?: string[];
}
export interface CommunityDetailDTO extends CommunityCardDTO {
  purpose: string;
  whoFor: string;
  rosterVisible: boolean;
  features: string[]; // ⊆ "discussion"|"events"|"rooms"|"roster"|"library"
  rules: string[];
  owner: MemberRefDTO | null;
  createdAt: string;
  /** True once an owner has archived the community. Only ever present for the
   *  community's own owner/mods (outsiders 404 an archived community). */
  archived?: boolean;
  /** True while the community is auto-frozen pending report review. Unlike
   *  `archived`, a frozen community stays visible, so this reaches all viewers. */
  frozen?: boolean;
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
  editedAt: string | null;
  deleted: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canRestore: boolean;
  canViewHistory: boolean;
}
export interface CommunityPostDTO {
  id: string;
  author: MemberRefDTO | null;
  body: string;
  image: string | null;
  kind: "post" | "announcement";
  pinned: boolean;
  createdAt: string;
  editedAt: string | null;
  deleted: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canRestore: boolean;
  canViewHistory: boolean;
  reactions: CommunityReactionSummary[];
  /** A bounded PREVIEW (oldest-first, capped server-side), NOT every reply —
   *  compare `replies.length < replyCount` to know whether more exist, and
   *  fetch them via `getPostReplies` (`useCommunityReplies`). */
  replies: CommunityReplyDTO[];
  /** The TRUE total reply count, independent of the `replies` preview above. */
  replyCount: number;
}
export interface CommunityPostHistoryEntry {
  id: string;
  author: MemberRefDTO | null;
  previousBody: string;
  createdAt: string;
}
export interface CommunityPostHistoryResponse {
  revisions: CommunityPostHistoryEntry[];
}
export interface CommunityReplyHistoryEntry {
  id: string;
  author: MemberRefDTO | null;
  previousText: string;
  createdAt: string;
}
export interface CommunityReplyHistoryResponse {
  revisions: CommunityReplyHistoryEntry[];
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
  /** Cover image — a storage key from the `community-cover` upload, an https
   *  URL, or "" / null to clear. Optional; omit to leave unchanged on PATCH. */
  coverImageUrl?: string | null;
  handle: string; // desired slug
  stewards?: string[]; // member slugs → seeded as "mod"
  invites?: string[]; // ⚠ accepted but NOT persisted yet
  /** Curated tag ids (⊆ `COMMUNITY_TAGS`, `communityTags.data.ts`), capped at
   *  `MAX_COMMUNITY_TAGS`. Optional; omit to leave unchanged on PATCH. */
  tags?: string[];
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
  /** Free-text search over name/tagline/purpose, ANDed with the filters above
   *  (mirrors the backend's `ListCommunitiesQuery.q`). */
  q?: string;
  /** `newest` (default, `created_at DESC`) or `name` (A→Z, tie-broken by id so
   *  pagination doesn't reshuffle) — mirrors the backend's
   *  `ListCommunitiesQuery.sort`. Omit for the default. */
  sort?: "newest" | "name";
  /** Curated tag ids to narrow to (⊆ `COMMUNITY_TAGS`) — ANDed with the other
   *  filters, OR'd against each other (a community matches if it carries any
   *  of the given tags). Mirrors the backend's `ListCommunitiesQuery.tags`. */
  tags?: string[];
}

export async function getCommunities(params: CommunitiesQuery = {}) {
  const query = new URLSearchParams();
  if (params.filter) query.set("filter", params.filter);
  if (params.type) query.set("type", params.type);
  if (params.access) query.set("access", params.access);
  if (params.page) query.set("page", String(params.page));
  if (params.q) query.set("q", params.q);
  if (params.sort) query.set("sort", params.sort);
  if (params.tags?.length) query.set("tags", params.tags.join(","));
  const qs = query.toString();
  const res = await apiGet<CommunityCardDTO[] | Paginated<CommunityCardDTO>>(
    `/communities${qs ? `?${qs}` : ""}`,
  );
  return toItemsPage(res);
}

export const getCommunity = (slug: string) =>
  apiGet<CommunityDetailDTO>(`/communities/${slug}`);

/** GET /communities/featured — the admin-chosen platform-wide featured
 *  community, or null when none is set. See `CommunitiesService.getFeatured`. */
export const getFeaturedCommunity = () =>
  apiGet<CommunityCardDTO | null>("/communities/featured");

export const createCommunity = (dto: CreateCommunityDto) =>
  apiPost<CommunityDetailDTO>("/communities", dto);

export const updateCommunity = (slug: string, dto: UpdateCommunityDto) =>
  apiPatch<CommunityDetailDTO>(`/communities/${slug}`, dto);

/** POST /communities/:slug/archive — owner takes the community down. Idempotent;
 *  returns the (now archived) detail. */
export const archiveCommunity = (slug: string) =>
  apiPost<CommunityDetailDTO>(`/communities/${slug}/archive`, {});

/** POST /communities/:slug/unfreeze — an owner/mod lifts an auto-freeze once
 *  the reports are handled. Idempotent; returns the (now unfrozen) detail. */
export const unfreezeCommunity = (slug: string) =>
  apiPost<CommunityDetailDTO>(`/communities/${slug}/unfreeze`, {});

/** POST /communities/:slug/freeze — an owner/mod manually pauses a community
 *  ahead of a moderation review, symmetric to `unfreezeCommunity`. Idempotent;
 *  returns the (now frozen) detail. */
export const freezeCommunity = (slug: string) =>
  apiPost<CommunityDetailDTO>(`/communities/${slug}/freeze`, {});

/** POST /communities/:slug/transfer — owner hands the community to another
 *  member (who becomes owner; the caller is demoted to mod). */
export const transferCommunityOwnership = (slug: string, memberSlug: string) =>
  apiPost<CommunityDetailDTO>(`/communities/${slug}/transfer`, { memberSlug });

/** One open report on this community's own posts/replies (`GET
 *  /communities/:slug/reports`, owner/mod-only). Deliberately leaner than the
 *  platform admin queue's `ModReportDTO` (`features/admin/api/moderation.api.ts`):
 *  no reporter/reported identity or content excerpt, just enough to triage —
 *  see `communityReportToModReport`. */
export interface CommunityReportDTO {
  id: string;
  subjectType: "post" | "reply";
  subjectId: string;
  reasonCode: ReasonCode;
  severity: "emergency" | "high" | "medium" | "low";
  status: "open" | "resolved" | "escalated";
  createdAt: string;
  slaDueAt: string;
  acknowledgement: string;
}

/** GET /communities/:slug/reports — open reports whose subject is a post or
 *  reply in this community (owner/mod only). */
export const getCommunityReports = (slug: string) =>
  apiGet<CommunityReportDTO[]>(`/communities/${slug}/reports`);

/** PATCH /mod/reports/:id — dismiss a report from a community's reports
 *  queue. Reuses the platform-wide moderation-action endpoint with a fixed
 *  "dismiss" action and generic reason/note, mirroring the admin queue's own
 *  plain-dismiss default (`useModerationQueue.ts`'s `resolveReport`).
 *
 *  NOTE: that endpoint is gated to a platform Moderator/Admin role
 *  (`RolesGuard`), which a community-level owner/mod does not necessarily
 *  hold — a plain community mod calling this can get a 403. That's a real,
 *  unresolved backend authorization gap, not something to paper over here:
 *  the call goes through as-is and a 403 surfaces as the normal global error
 *  toast (`useCommunityMutations.ts`'s `useDismissCommunityReport`). */
export const dismissReport = (id: string) =>
  apiPatch<{ id: string; status: string }>(`/mod/reports/${id}`, {
    action: "dismiss",
    reasonCode: "other",
    note: "",
  });

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

/** GET /communities/:slug/posts/:id/replies?page= — every reply beyond the
 *  post's bounded preview, oldest-first. `page=1` is deliberately the SAME
 *  window the preview already embeds (same page size, same order), so a
 *  "load more" click starts at `page=2` — see `useCommunityReplies`. */
export async function getPostReplies(
  slug: string,
  postId: string,
  page: number,
) {
  const res = await apiGet<
    CommunityReplyDTO[] | Paginated<CommunityReplyDTO>
  >(`/communities/${slug}/posts/${postId}/replies?page=${page}`);
  return toItemsPage(res);
}

/** DELETE /communities/:slug/posts/:id — soft tombstone (author or owner/mod). */
export const deleteCommunityPost = (slug: string, id: string) =>
  apiDelete<CommunityPostDTO>(`/communities/${slug}/posts/${id}`);

/** POST /communities/:slug/posts/:id/restore — clear the tombstone. */
export const restoreCommunityPost = (slug: string, id: string) =>
  apiPost<CommunityPostDTO>(`/communities/${slug}/posts/${id}/restore`);

/** GET /communities/:slug/posts/:id/history — post-body revisions. */
export const getCommunityPostHistory = (slug: string, id: string) =>
  apiGet<CommunityPostHistoryResponse>(
    `/communities/${slug}/posts/${id}/history`,
  );

/** PATCH /communities/:slug/posts/:id/replies/:replyId — author edits a reply. */
export const editCommunityReply = (
  slug: string,
  postId: string,
  replyId: string,
  text: string,
) =>
  apiPatch<CommunityReplyDTO>(
    `/communities/${slug}/posts/${postId}/replies/${replyId}`,
    { text },
  );

/** DELETE /communities/:slug/posts/:id/replies/:replyId — soft tombstone. */
export const deleteCommunityReply = (
  slug: string,
  postId: string,
  replyId: string,
) =>
  apiDelete<CommunityReplyDTO>(
    `/communities/${slug}/posts/${postId}/replies/${replyId}`,
  );

/** POST /communities/:slug/posts/:id/replies/:replyId/restore — clear tombstone. */
export const restoreCommunityReply = (
  slug: string,
  postId: string,
  replyId: string,
) =>
  apiPost<CommunityReplyDTO>(
    `/communities/${slug}/posts/${postId}/replies/${replyId}/restore`,
  );

/** GET /communities/:slug/posts/:id/replies/:replyId/history — reply revisions. */
export const getCommunityReplyHistory = (
  slug: string,
  postId: string,
  replyId: string,
) =>
  apiGet<CommunityReplyHistoryResponse>(
    `/communities/${slug}/posts/${postId}/replies/${replyId}/history`,
  );

export async function getRoster(slug: string, page?: number) {
  const q = new URLSearchParams();
  if (page) q.set("page", String(page));
  const qs = q.toString();
  const res = await apiGet<RosterEntryDTO[] | Paginated<RosterEntryDTO>>(
    `/communities/${slug}/roster${qs ? `?${qs}` : ""}`,
  );
  return toItemsPage(res);
}

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

// ── Community pulse (upcoming events / recent threads / open opportunities) ──
// Lean, hand-picked subsets of each feature module's own response shape
// (`EventSummary`/`ForumThreadResponse`/`OpportunityCardDTO` on the backend) —
// only the fields this compact surface renders, the same "richly type only
// what's rendered" approach the rest of this file follows.

export interface CommunityPulseEventDTO {
  slug: string;
  title: string;
  startAt: string;
  venue: string | null;
  isOnline: boolean;
  goingCount: number;
}

export interface CommunityPulseAuthorDTO {
  handle: string;
  displayName: string;
  avatarUrl: string | null;
}

export interface CommunityPulseThreadDTO {
  id: string;
  slug: string;
  title: string;
  author: CommunityPulseAuthorDTO;
  replyCount: number;
}

export interface CommunityPulseOpportunityDTO {
  slug: string;
  org: string;
  role: string;
}

export interface CommunityPulseDTO {
  upcomingEvents: CommunityPulseEventDTO[];
  recentThreads: CommunityPulseThreadDTO[];
  openOpportunities: CommunityPulseOpportunityDTO[];
}

/** GET /communities/:slug/pulse — the community's own upcoming events, recent
 *  discussion threads, and open volunteer opportunities (any roster member). */
export const getCommunityPulse = (slug: string) =>
  apiGet<CommunityPulseDTO>(`/communities/${slug}/pulse`);

/** `GET /communities/:slug/insights` response — plain aggregate counts
 *  (owner/mod only). */
export interface CommunityInsightsDTO {
  memberCount: number;
  newMembersThisWeek: number;
  newMembersThisMonth: number;
  postCount: number;
  postsThisWeek: number;
  activeMemberCount7d: number;
}

/** GET /communities/:slug/insights — aggregate membership/post-volume stats,
 *  owner/mod only (403 for anyone else on the roster). */
export const getCommunityInsights = (slug: string) =>
  apiGet<CommunityInsightsDTO>(`/communities/${slug}/insights`);

// ── Similar communities / curated-tag requests ────────────────────────────

/** GET /communities/:slug/related — up to 4 communities ranked by shared
 *  curated-tag overlap with this one (any viewer). Response items are plain
 *  `CommunityCardDTO`s — map through `cardDtoToCommunity` like every other
 *  card list in this file. */
export const getRelatedCommunities = (slug: string) =>
  apiGet<CommunityCardDTO[]>(`/communities/${slug}/related`);

export interface SuggestCommunityTagDto {
  /** The tag the owner/mod wants — capped at 60 chars client-side
   *  (`SuggestCommunityTagModal`), mirrors the backend's own cap. */
  label: string;
  note?: string;
}

/** POST /communities/:slug/tag-requests — owner/mod suggests a curated tag
 *  that doesn't exist yet in `COMMUNITY_TAGS`. Fire-and-forget from the
 *  submitter's side (mirrors `useSuggestEdit`'s directory equivalent): an
 *  admin reviews and resolves it later on the
 *  `AdminCommunityTagRequestsPage` review queue
 *  (`admin/api/communityTagRequests.api.ts`), which owns the richer DTO — the
 *  response here isn't rendered anywhere, so it stays untyped. */
export const suggestCommunityTag = (
  slug: string,
  dto: SuggestCommunityTagDto,
) => apiPost<void>(`/communities/${slug}/tag-requests`, dto);
