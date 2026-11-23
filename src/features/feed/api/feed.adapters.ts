import {
  authorDisplayName,
  isInactiveMemberRef,
  tintForSlug,
} from "../../../shared/api/refs";
import { initialsFromName } from "../../../shared/lib/initials";
import { formatRelative } from "../../../shared/lib/date";
import type { Formatters } from "../../../shared/i18n/format";
import type { TFunction } from "../../../shared/i18n/types";
import type { FeedPost } from "../feed.data";
import type { FeedItem } from "./feed.api";

// Historical name kept for existing importers (e.g. `FeedCards`), now backed by
// the shared `formatRelative` in `shared/lib/date`.
export { formatRelative as relativeTime } from "../../../shared/lib/date";

// Map a backend `FeedItem` onto the EXISTING `FeedPost` view-model the feed
// cards render.
//
// SOC-04: `likeCount` is no longer hardcoded to zero — the aggregate now
// carries `reactionCount`, so the card shows the real number instead of
// pretending nobody has reacted. `replies` stays an empty seed on purpose:
// `FeedPost.replies` is the prototype's full reply LIST, which the feed
// deliberately does not fetch (a card shows the count and opens the thread
// for the rest). The true count rides alongside on `FeedItem.replyCount` and
// is passed to the card as a signal.

const AUTHOR_TINTS = ["jade", "coral", "plum"] as const;

/** Two-letter initials from a "First Last" display name. Exported for reuse
 *  by other cards deriving avatar fallback initials from a plain name string
 *  (e.g. `MemberCard` for a live `new_member` item). */
export function initials(name: string): string {
  return initialsFromName(name);
}

/** GET /feed item → the `FeedPost` a `CommunityPostCard` renders. */
export function feedItemToPost(
  item: FeedItem,
  fmt: Formatters,
  translate?: TFunction,
): FeedPost {
  const actor = item.actor;
  const slug = actor?.handle ?? "";
  // The inactive member's stand-in carries an empty name and handle; the
  // byline reads the inactive label and shows no initials.
  const isInactive = isInactiveMemberRef(actor);
  const name = !actor
    ? "A member"
    : translate
      ? authorDisplayName(actor, translate)
      : actor.displayName;
  const tint = slug ? tintForSlug(slug) : AUTHOR_TINTS[0];
  return {
    id: item.id,
    slug,
    authorName: name,
    authorInitials: isInactive ? "" : initials(name),
    authorTint: tint,
    time: formatRelative(item.createdAt, fmt),
    context: item.title,
    body: item.summary,
    likeCount: item.reactionCount ?? 0,
    replies: [],
    link: item.link,
    avatarUrl: actor?.avatarUrl ?? null,
    studioLink: item.studioLink,
  };
}
