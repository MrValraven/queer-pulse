import { tintForSlug } from "../../../shared/api/refs";
import type { Formatters } from "../../../shared/i18n/format";
import type { FeedPost } from "../feed.data";
import type { FeedItem } from "./feed.api";

// Map a backend `FeedItem` onto the EXISTING `FeedPost` view-model the feed
// cards render. Interaction fields the aggregate doesn't carry (likeCount,
// replies) default to empty seeds — the card layers local interaction state,
// exactly as the prototype does.

const AUTHOR_TINTS = ["jade", "coral", "plum"] as const;

/**
 * "2 hours ago" style relative label from an ISO timestamp, through
 * `fmt.relativeTime` — previously a hand-rolled, English-only string (`"2
 * hours ago"`, always, regardless of app language). Exported so other feed
 * cards (e.g. `NewMemberCard`'s live "Joined …" line) can reuse the same
 * phrasing instead of re-deriving it.
 */
export function relativeTime(iso: string, fmt: Formatters): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const diffSeconds = Math.round((Date.now() - date.getTime()) / 1000);
  if (diffSeconds < 60) return fmt.relativeTime(-diffSeconds, "second");
  const diffMinutes = Math.round(diffSeconds / 60);
  if (diffMinutes < 60) return fmt.relativeTime(-diffMinutes, "minute");
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return fmt.relativeTime(-diffHours, "hour");
  const diffDays = Math.round(diffHours / 24);
  return fmt.relativeTime(-diffDays, "day");
}

/** Two-letter initials from a "First Last" display name. Exported for reuse
 *  by other cards deriving avatar fallback initials from a plain name string
 *  (e.g. `NewMemberCard` for a live `new_member` item). */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return `${parts[0]?.[0] ?? ""}${parts.length > 1 ? (parts.at(-1)?.[0] ?? "") : ""}`.toUpperCase();
}

/** GET /feed item → the `FeedPost` a `PostCard` renders. */
export function feedItemToPost(item: FeedItem, fmt: Formatters): FeedPost {
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
    time: relativeTime(item.createdAt, fmt),
    context: item.title,
    body: item.summary,
    likeCount: 0,
    replies: [],
  };
}
