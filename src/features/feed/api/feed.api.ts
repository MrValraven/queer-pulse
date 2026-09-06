import { apiGet, apiPost } from "../../../shared/api/client";
import { toPage } from "../../../shared/api/pagination";
import type {
  FeedItem as ContractFeedItem,
  Paginated,
} from "../../../shared/contracts/contracts";
import type { FeedTab } from "../feed.data";

// ── Feed DTOs + raw calls ────────────────────────────────────────────────────
// The feed is a READ-TIME AGGREGATION. `FeedItem` (contracts.ts) is the union
// of community_post | forum_thread | gathering | new_member | article, and the
// interface below adds only the ranking and interaction signals the feed alone
// consumes. PAGINATION: cursor-based
// (infinite scroll). Post interactions target the underlying community-posts
// domain, which the backend owns; we call those endpoints directly here.

/**
 * Why an item is in this member's feed (SOC-04). The backend ranks the "All"
 * tab on three explicit facts the member created — they joined a community,
 * they accepted a connection, they followed a topic — and names the strongest
 * one here so the card can say it out loud. `recent` means no fact matched:
 * the item is simply new. Absent on the scoped tabs, where the tab is the
 * explanation.
 *
 * There is no behavioural input behind any of this, and there must never be.
 */
export type FeedReason = "membership" | "connection" | "topic" | "recent";

/**
 * The feed item the backend actually sends, which is the shared contract plus
 * the ranking and interaction signals the feed alone consumes (SOC-04).
 * Declared here rather than in `shared/contracts/contracts.ts` because no
 * other feature reads them.
 *
 * Every added field is OPTIONAL: a `gathering` carries no reaction count, a
 * scoped tab carries no reason, and an older backend carries neither.
 */
/** A source the member can turn down in their own feed (SOC-18). Muting it
 *  never touches membership: it quiets the room in this one member's feed. */
export interface FeedItemSource {
  kind: "community" | "forum_thread";
  id: string;
  name: string;
}

/** PRD-107: the magazine credit on an `article` item.
 *
 *  Kept apart from `actor` because it is not a member account: `slug`
 *  addresses `/magazine/author/:slug`, and plenty of contributors are credited
 *  by name only and hold no account at all. `actor` is still filled in when the
 *  byline is linked to a member, which is what the block/mute filter below
 *  reads. */
export interface FeedArticleByline {
  name: string;
  slug: string;
  avatarUrl: string | null;
}

/** The feed's own item type, re-exported from the shared contract so the cards
 *  can keep importing it from here. `"article"` (PRD-107, a published magazine
 *  piece) now lives in the contract itself. */
export type { FeedItemType } from "../../../shared/contracts/contracts";

export interface FeedItem extends ContractFeedItem {
  /** Present on every tab, since muting is a reader's preference rather than
   *  a ranking concept. Null for a flat item with no room behind it. */
  source?: FeedItemSource | null;
  reason?: FeedReason;
  /** The community, person or topic `reason` names, ready to render. */
  reasonSubject?: string | null;
  /** Likes on a `community_post` — the counter the inline action toggles. */
  reactionCount?: number;
  /** Replies on a `community_post`, or a `forum_thread`'s stored count. */
  replyCount?: number;
  /** The viewer's own reaction key, or null when they haven't reacted. */
  myReaction?: string | null;
  /** PRD-107, `article` only: the magazine's own furniture. `title` is the
   *  headline and `summary` the dek; these carry what the shared shape has no
   *  room for. */
  kicker?: string;
  section?: string;
  readMinutes?: number;
  /** The piece's lead art, or null when the desk set none. */
  imageUrl?: string | null;
  /** The language of the row the card is showing, so a reader served the
   *  original where no translation exists can be told which one they got. */
  locale?: string;
  byline?: FeedArticleByline | null;
  // PRD-167's `excerpt` (a `forum_thread`'s opening post) is inherited from the
  // shared contract, which is where it is documented.
}

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

/**
 * GET /feed?tab=&cursor=&lang=&joinedWithinDays=: a cursor page of aggregated
 * feed items.
 *
 * PRD-107: `lang` is the reader's chosen language and reaches the magazine
 * source alone. A piece with a published translation in it comes back
 * translated, at the translation's own slug; a piece without one stays as
 * written. A language the magazine does not publish in is simply ignored.
 *
 * PRD-168: `joinedWithinDays` bounds the `new_member` and
 * `community_new_member` sources to people who joined that recently, and
 * touches nothing else. Only the sidebar's "New this week" widget sends it
 * (as 7); the People TAB omits it and keeps its unbounded behaviour. The
 * spelling matters: the backend validates the query with
 * `forbidNonWhitelisted`, so any other parameter name is a 400.
 */
export async function getFeed(
  tab: FeedTab,
  cursor?: string,
  lang?: string,
  joinedWithinDays?: number,
) {
  const q = new URLSearchParams();
  const tabQueryValue = tabParam(tab);
  if (tabQueryValue) q.set("tab", tabQueryValue);
  if (cursor) q.set("cursor", cursor);
  if (lang) q.set("lang", lang);
  if (joinedWithinDays) q.set("joinedWithinDays", String(joinedWithinDays));
  const qs = q.toString();
  const res = await apiGet<FeedItem[] | Paginated<FeedItem>>(
    `/feed${qs ? `?${qs}` : ""}`,
  );
  return toPage(res);
}

// ── Inline card actions (SOC-04) ────────────────────────────────────────────
// The feed's cards used to be read-only: the adapter hardcoded a zero like
// count and an empty reply list, so reacting or replying meant leaving the
// page. These two calls hit the FLAT `community-posts` aliases rather than the
// slug-scoped `/communities/:slug/posts/...` routes, because a feed card holds
// a post id and a permalink, not always a community slug (a flat/global post
// has no community at all).
//
// `POST /community-posts/:id/like` is an idempotent toggle that returns the
// authoritative count, which is what the optimistic update rolls back to.

export interface FeedLikeResponse {
  liked: boolean;
  likeCount: number;
}

export const likeFeedPost = (postId: string, liked: boolean) =>
  apiPost<FeedLikeResponse>(`/community-posts/${postId}/like`, { liked });

export const replyToFeedPost = (postId: string, body: string) =>
  apiPost<{ id: string }>(`/community-posts/${postId}/replies`, { body });
