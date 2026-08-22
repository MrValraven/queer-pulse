import { apiGet } from "../../../shared/api/client";
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
    case "Connections":
      return "connections";
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
  const tabQueryValue = tabParam(tab);
  if (tabQueryValue) q.set("tab", tabQueryValue);
  if (cursor) q.set("cursor", cursor);
  const qs = q.toString();
  const res = await apiGet<FeedItem[] | Paginated<FeedItem>>(
    `/feed${qs ? `?${qs}` : ""}`,
  );
  return toPage(res);
}

// `likePost` / `replyToPost` used to live here, behind `useFeedMutations`'s
// `useLikePost` / `useReplyToPost`. Neither hook ever had a consumer: the feed
// cards route their like and reply actions through the COMMUNITIES feature's
// `useCommunityMutations` instead. Both the hooks and these two calls were
// removed rather than left as a second, divergent path to the same endpoints.
