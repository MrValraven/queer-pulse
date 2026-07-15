import { apiGet, apiPost } from "../../../shared/api/client";
import { toPage } from "../../../shared/api/pagination";
import type { FeedItem, Paginated } from "../../../shared/contracts/contracts";
import type { FeedTab } from "../feed.data";

// ── Feed DTOs + raw calls ────────────────────────────────────────────────────
// The feed is a READ-TIME AGGREGATION — `FeedItem` (contracts.ts) is the union
// of community_post | forum_thread | gathering. PAGINATION: cursor-based
// (infinite scroll). Post interactions target the underlying community-posts
// domain, which the backend owns; we call those endpoints directly here.

export type { FeedItem };

/** Map the page's tab chips onto the backend `tab` query param. */
function tabParam(tab: FeedTab): string | undefined {
  switch (tab) {
    case "Communities":
      return "communities";
    case "Gatherings":
      return "gatherings";
    case "People":
      return "people";
    case "Posts":
      return "posts";
    default:
      return undefined; // "All"
  }
}

/** GET /feed?tab=&cursor= — a cursor page of aggregated feed items. */
export async function getFeed(tab: FeedTab, cursor?: string) {
  const q = new URLSearchParams();
  const t = tabParam(tab);
  if (t) q.set("tab", t);
  if (cursor) q.set("cursor", cursor);
  const qs = q.toString();
  const res = await apiGet<FeedItem[] | Paginated<FeedItem>>(
    `/feed${qs ? `?${qs}` : ""}`,
  );
  return toPage(res);
}

/** POST /community-posts — publish a new post (optionally into a community). */
export const createPost = (body: string, communitySlug?: string) =>
  apiPost<{ id: string }>("/community-posts", { body, communitySlug });

/** POST /community-posts/:id/like — like/unlike toggle. */
export const likePost = (id: string, liked: boolean) =>
  apiPost<{ liked: boolean; likeCount: number }>(
    `/community-posts/${id}/like`,
    { liked },
  );

/** POST /community-posts/:id/replies — reply to a feed post. */
export const replyToPost = (id: string, body: string) =>
  apiPost<{ id: string }>(`/community-posts/${id}/replies`, { body });
