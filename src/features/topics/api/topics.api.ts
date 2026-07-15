import { apiGet } from "../../../shared/api/client";
import { toPage } from "../../../shared/api/pagination";
import type {
  Paginated,
  TopicDetailResponse,
  TopicPostResponse,
  TopicResponse,
} from "../../../shared/contracts/contracts";

// ── Topics DTOs + raw calls ─────────────────────────────────────────────────
// Shapes come from src/shared/contracts/contracts.ts, mirroring the backend's
// `queerpulse-backend/src/content` topics endpoints. PAGINATION: cursor-based
// (`Paginated<T>` = { data, pageInfo }) for the post feed, same envelope as
// `forum.api.ts`'s thread/post lists.

export type { TopicResponse, TopicDetailResponse, TopicPostResponse };

/** GET /topics — the full topic directory (not currently consumed by the
 * `topics` feature's pages, which are always deep-linked by tag, but kept
 * here alongside the other two calls for parity with the backend contract). */
export const getTopics = () => apiGet<TopicResponse[]>("/topics");

/** GET /topics/:slug — one topic's meta (name, description, follower/post
 * counts, related topics) for `TopicHeader`/`TopicSidebar`. */
export const getTopicDetail = (slug: string) =>
  apiGet<TopicDetailResponse>(`/topics/${slug}`);

/** GET /topics/:slug/posts?cursor= — that topic's post feed, newest first. */
export async function getTopicPosts(slug: string, cursor?: string) {
  const q = new URLSearchParams();
  if (cursor) q.set("cursor", cursor);
  const qs = q.toString();
  const res = await apiGet<TopicPostResponse[] | Paginated<TopicPostResponse>>(
    `/topics/${slug}/posts${qs ? `?${qs}` : ""}`,
  );
  return toPage(res);
}
