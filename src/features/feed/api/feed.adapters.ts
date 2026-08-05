import { tintForSlug } from "../../../shared/api/refs";
import { initialsFromName } from "../../../shared/lib/initials";
import { formatRelative } from "../../../shared/lib/date";
import type { Formatters } from "../../../shared/i18n/format";
import type { FeedPost } from "../feed.data";
import type { FeedItem } from "./feed.api";

// Historical name kept for existing importers (e.g. `FeedCards`), now backed by
// the shared `formatRelative` in `shared/lib/date`.
export { formatRelative as relativeTime } from "../../../shared/lib/date";

// Map a backend `FeedItem` onto the EXISTING `FeedPost` view-model the feed
// cards render. Interaction fields the aggregate doesn't carry (likeCount,
// replies) default to empty seeds — the card layers local interaction state,
// exactly as the prototype does.

const AUTHOR_TINTS = ["jade", "coral", "plum"] as const;

/** Two-letter initials from a "First Last" display name. Exported for reuse
 *  by other cards deriving avatar fallback initials from a plain name string
 *  (e.g. `MemberCard` for a live `new_member` item). */
export function initials(name: string): string {
  return initialsFromName(name);
}

/** GET /feed item → the `FeedPost` a `CommunityPostCard` renders. */
export function feedItemToPost(item: FeedItem, fmt: Formatters): FeedPost {
  const actor = item.actor;
  const slug = actor?.handle ?? "";
  const name = actor?.displayName ?? "A member";
  const tint = slug ? tintForSlug(slug) : AUTHOR_TINTS[0];
  return {
    id: item.id,
    slug,
    authorName: name,
    authorInitials: initials(name),
    authorTint: tint,
    time: formatRelative(item.createdAt, fmt),
    context: item.title,
    body: item.summary,
    likeCount: 0,
    replies: [],
    link: item.link,
    avatarUrl: actor?.avatarUrl ?? null,
  };
}
