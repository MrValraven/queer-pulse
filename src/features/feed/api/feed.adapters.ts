import { tintForSlug } from "../../../shared/api/refs";
import type { FeedPost } from "../feed.data";
import type { FeedItem } from "./feed.api";

// Map a backend `FeedItem` onto the EXISTING `FeedPost` view-model the feed
// cards render. Interaction fields the aggregate doesn't carry (likeCount,
// replies) default to empty seeds — the card layers local interaction state,
// exactly as the prototype does.

const AUTHOR_TINTS = ["jade", "coral", "plum"] as const;

/** "2 hours ago" style relative label from an ISO timestamp. */
function relativeTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const secs = Math.max(0, (Date.now() - d.getTime()) / 1000);
  if (secs < 60) return "just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? "" : "s"} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return `${parts[0]?.[0] ?? ""}${parts.length > 1 ? (parts.at(-1)?.[0] ?? "") : ""}`.toUpperCase();
}

/** GET /feed item → the `FeedPost` a `PostCard` renders. */
export function feedItemToPost(item: FeedItem): FeedPost {
  const actor = item.actor;
  const slug = actor?.handle ?? "";
  const name = actor?.displayName ?? "A member";
  const tint = slug
    ? (tintForSlug(slug) as FeedPost["authorTint"])
    : AUTHOR_TINTS[0];
  return {
    id: item.id,
    slug,
    authorName: name,
    authorInitials: initials(name),
    authorTint: tint,
    time: relativeTime(item.createdAt),
    context: item.title,
    body: item.summary,
    likeCount: 0,
    replies: [],
  };
}
