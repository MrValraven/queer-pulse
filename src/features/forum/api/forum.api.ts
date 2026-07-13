import { apiGet, apiPost } from "../../../shared/api/client";
import type {
  ForumPostResponse,
  ForumThreadResponse,
  Paginated,
} from "../../../shared/contracts/contracts";

// ── Forum DTOs + raw calls ───────────────────────────────────────────────────
// Shapes come from src/shared/contracts/contracts.ts. PAGINATION: cursor-based
// (`Paginated<T>` = { data, pageInfo }) for both the thread list and a thread's
// posts — both are infinite. A thread's opening post is the FIRST item of its
// posts page; the remainder are replies.

export type { ForumThreadResponse, ForumPostResponse };

/** GET /forum/threads?category=&cursor= — a cursor page of threads. */
export function getThreads(category?: string, cursor?: string) {
  const q = new URLSearchParams();
  if (category && category !== "all") q.set("category", category);
  if (cursor) q.set("cursor", cursor);
  const qs = q.toString();
  return apiGet<Paginated<ForumThreadResponse>>(
    `/forum/threads${qs ? `?${qs}` : ""}`,
  );
}

/** GET /forum/threads/:slug — thread meta (title, author, counts). */
export const getThread = (slug: string) =>
  apiGet<ForumThreadResponse>(`/forum/threads/${slug}`);

/** GET /forum/threads/:slug/posts?cursor= — OP + replies, oldest-first. */
export function getThreadPosts(slug: string, cursor?: string) {
  const q = new URLSearchParams();
  if (cursor) q.set("cursor", cursor);
  const qs = q.toString();
  return apiGet<Paginated<ForumPostResponse>>(
    `/forum/threads/${slug}/posts${qs ? `?${qs}` : ""}`,
  );
}

export interface CreateThreadDto {
  title: string;
  body: string;
  category: string;
}

/** POST /forum/threads — ComposeThreadModal. */
export const createThread = (dto: CreateThreadDto) =>
  apiPost<ForumThreadResponse>("/forum/threads", dto);

/** POST /forum/threads/:slug/posts — ThreadComposer reply. */
export const replyToThread = (slug: string, body: string) =>
  apiPost<ForumPostResponse>(`/forum/threads/${slug}/posts`, { body });

/** POST /forum/posts/:id/vote — upvote toggle. `value` is +1 / 0. */
export const votePost = (id: string, value: number) =>
  apiPost<{ voteCount: number; myVote: number }>(`/forum/posts/${id}/vote`, {
    value,
  });
