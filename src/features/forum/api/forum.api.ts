import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
} from "../../../shared/api/client";
import { toPage } from "../../../shared/api/pagination";
import type {
  AuthorSummary,
  ForumPostHistoryResponse,
  ForumPostResponse,
  ForumThreadResponse,
  Paginated,
} from "../../../shared/contracts/contracts";

// ── Forum DTOs + raw calls ───────────────────────────────────────────────────
// Shapes come from src/shared/contracts/contracts.ts. PAGINATION: cursor-based
// (`Paginated<T>` = { data, pageInfo }) for both the thread list and a thread's
// posts — both are infinite. A thread's opening post is the FIRST item of its
// posts page; the remainder are replies.

export type {
  ForumThreadResponse,
  ForumPostResponse,
  ForumPostHistoryResponse,
};

/** Server-supported orderings for the thread list. */
export type ForumSort = "new" | "top" | "active" | "unanswered";

/** Optional list filters/ordering, folded into the query string alongside
 *  `category`/`cursor`. */
export interface GetThreadsOptions {
  sort?: ForumSort;
  tag?: string;
  q?: string;
}

/** GET /forum/threads?category=&cursor=&sort=&tag=&q= — a cursor page of
 *  threads. */
export async function getThreads(
  category?: string,
  cursor?: string,
  opts?: GetThreadsOptions,
) {
  const params = new URLSearchParams();
  if (category && category !== "all") params.set("category", category);
  if (cursor) params.set("cursor", cursor);
  if (opts?.sort) params.set("sort", opts.sort);
  if (opts?.tag) params.set("tag", opts.tag);
  if (opts?.q) params.set("q", opts.q);
  const qs = params.toString();
  const res = await apiGet<
    ForumThreadResponse[] | Paginated<ForumThreadResponse>
  >(`/forum/threads${qs ? `?${qs}` : ""}`);
  return toPage(res);
}

/** Per-category thread counts plus an `all` total, block-filtered like the
 *  list. Category keys mirror the list's `category` values. */
export interface ForumThreadCounts {
  all: number;
  [category: string]: number;
}

/** Wire shape of `GET /forum/threads/counts` — the per-category counts plus
 *  whether the caller has EVER posted (any thread or reply), kept as a
 *  separate `boolean` field rather than folded into `counts` so it doesn't
 *  have to share a type with the `Record<string, number>` category tally. */
export interface ForumThreadCountsResponse {
  counts: ForumThreadCounts;
  hasPosted: boolean;
}

/** GET /forum/threads/counts?q=&tag= — counts for the sidebar + list header,
 *  plus the truthful "has this member ever posted" signal the first-post
 *  prompt gates on (see `useForumPageState`). Piggybacks on this existing
 *  page-load request rather than costing a dedicated round-trip. */
export async function getThreadCounts(q?: string, tag?: string) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (tag) params.set("tag", tag);
  const qs = params.toString();
  return apiGet<ForumThreadCountsResponse>(
    `/forum/threads/counts${qs ? `?${qs}` : ""}`,
  );
}

/** GET /forum/threads/:slug — thread meta (title, author, counts). */
export const getThread = (slug: string) =>
  apiGet<ForumThreadResponse>(`/forum/threads/${slug}`);

/** GET /forum/threads/:slug/posts?cursor= — OP + replies, oldest-first. */
export async function getThreadPosts(slug: string, cursor?: string) {
  const q = new URLSearchParams();
  if (cursor) q.set("cursor", cursor);
  const qs = q.toString();
  const res = await apiGet<ForumPostResponse[] | Paginated<ForumPostResponse>>(
    `/forum/threads/${slug}/posts${qs ? `?${qs}` : ""}`,
  );
  return toPage(res);
}

export interface CreateThreadDto {
  title: string;
  body: string;
  category: string;
  /** Optional free-text tags collected by ComposeThreadModal; the backend
   *  already persists them. */
  tags?: string[];
  /** Attach the thread to one of the author's communities. Omitted (or
   *  undefined) keeps it a global thread, as before. */
  communitySlug?: string;
  /** Publish under the "QueerPulse Official" byline instead of the caller.
   *  Only an admin's value is actually honored — the backend silently
   *  coerces it to `false` for anyone else. */
  isOfficial?: boolean;
}

/** POST /forum/threads — ComposeThreadModal. */
export const createThread = (dto: CreateThreadDto) =>
  apiPost<ForumThreadResponse>("/forum/threads", dto);

/** POST /forum/threads/:slug/posts — ThreadComposer reply. `parentPostId`
 *  nests the reply under an existing post (nested-replies feature); omitted
 *  (or null) for a top-level reply to the thread. */
export const replyToThread = (
  slug: string,
  body: string,
  parentPostId?: string | null,
) =>
  apiPost<ForumPostResponse>(`/forum/threads/${slug}/posts`, {
    body,
    ...(parentPostId ? { parentPostId } : {}),
  });

/** POST /forum/posts/:id/vote — cast (`value: 1`) or clear (`value: 0`) the
 *  viewer's upvote on a post (idempotent). Returns the post with the updated
 *  `voteCount` + `myVote`. */
export const votePost = (id: string, value: 0 | 1) =>
  apiPost<ForumPostResponse>(`/forum/posts/${id}/vote`, { value });

/** PATCH /forum/posts/:id — author edits a post body. */
export const editPost = (id: string, body: string) =>
  apiPatch<ForumPostResponse>(`/forum/posts/${id}`, { body });

/** DELETE /forum/posts/:id — soft tombstone (author or staff). */
export const deletePost = (id: string) =>
  apiDelete<ForumPostResponse>(`/forum/posts/${id}`);

/** POST /forum/posts/:id/restore — clear the tombstone (author or staff). */
export const restorePost = (id: string) =>
  apiPost<ForumPostResponse>(`/forum/posts/${id}/restore`);

/** PATCH /forum/threads/:slug — author edits the thread title. */
export const editThreadTitle = (slug: string, title: string) =>
  apiPatch<ForumThreadResponse>(`/forum/threads/${slug}`, { title });

/** POST /forum/threads/:slug/lock — moderator closes the thread to replies,
 *  with an optional note explaining why (shown on the locked banner). Returns
 *  the updated thread. */
export const lockThread = (slug: string, reason?: string) =>
  apiPost<ForumThreadResponse>(`/forum/threads/${slug}/lock`, {
    ...(reason?.trim() ? { reason: reason.trim() } : {}),
  });

/** POST /forum/threads/:slug/unlock — moderator reopens the thread. Returns
 *  the updated thread. */
export const unlockThread = (slug: string) =>
  apiPost<ForumThreadResponse>(`/forum/threads/${slug}/unlock`);

/** POST /forum/threads/:slug/pin — moderator pins the thread to the sticky
 *  bucket above the list. Returns the updated thread. */
export const pinThread = (slug: string) =>
  apiPost<ForumThreadResponse>(`/forum/threads/${slug}/pin`);

/** POST /forum/threads/:slug/unpin — moderator unpins the thread. Returns the
 *  updated thread. */
export const unpinThread = (slug: string) =>
  apiPost<ForumThreadResponse>(`/forum/threads/${slug}/unpin`);

/** PATCH /admin/forum/threads/:slug/official — admin-only, toggles a
 *  published thread between its real author and "QueerPulse Official".
 *  Returns the updated thread. */
export const setThreadOfficial = (slug: string, isOfficial: boolean) =>
  apiPatch<ForumThreadResponse>(`/admin/forum/threads/${slug}/official`, {
    isOfficial,
  });

/** GET /forum/threads/pinned?category= — the small, unpaginated sticky bucket
 *  rendered above the thread list. Most-recently-pinned first. */
export function getPinnedThreads(category?: string) {
  const params = new URLSearchParams();
  if (category && category !== "all") params.set("category", category);
  const qs = params.toString();
  return apiGet<ForumThreadResponse[]>(
    `/forum/threads/pinned${qs ? `?${qs}` : ""}`,
  );
}

// The backend serializes each revision's editor as `editor` (see
// queerpulse-backend's ForumPostHistoryEntry), but the FE contract names the
// same field `author` (matching ForumThreadResponse/ForumPostResponse). This
// raw type mirrors the wire shape so the mapping below type-checks without
// touching the backend or the FE contract.
interface RawForumPostHistoryEntry {
  id: string;
  previousBody: string;
  previousTitle: string | null;
  editor: AuthorSummary;
  createdAt: string;
}

interface RawForumPostHistoryResponse {
  revisions: RawForumPostHistoryEntry[];
}

/** GET /forum/posts/:id/history — edit revisions (author or staff). Maps the
 *  backend's `editor` field to the FE contract's `author`. */
export async function getPostHistory(
  id: string,
): Promise<ForumPostHistoryResponse> {
  const raw = await apiGet<RawForumPostHistoryResponse>(
    `/forum/posts/${id}/history`,
  );
  return {
    revisions: raw.revisions.map((revision) => ({
      id: revision.id,
      previousBody: revision.previousBody,
      previousTitle: revision.previousTitle,
      author: revision.editor,
      createdAt: revision.createdAt,
    })),
  };
}
