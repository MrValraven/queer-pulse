import { FiHeart } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { RollingNumber } from "../../shared/components/ui/RollingNumber";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFeedPostActions } from "./api/useFeedPostActions";
import type { FeedItem } from "./api/feed.api";

/**
 * FEED-LIKE: like a `forum_thread` card straight from the feed by casting
 * the same vote the thread page's opening-post heart casts, through
 * `useFeedPostActions().likeThread` (`POST /forum/posts/:id/vote`). Renders
 * nothing when the item carries no `opPostId` (an older server, or a
 * tombstoned opening post), which is the card's only gate: forum-thread feed
 * cards are live-only, so there is no demo-local overlay to keep here the way
 * `FeedPostActions` keeps one for community posts.
 */
export function ForumThreadLikeButton({ item }: { item: FeedItem }) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { likeThread } = useFeedPostActions();

  if (!item.opPostId) return null;

  const openingPostId = item.opPostId;
  const hasLiked = item.myReaction != null;
  const count = item.reactionCount ?? 0;

  return (
    <Button
      variant="ghost"
      size="sm"
      aria-pressed={hasLiked}
      aria-label={t(
        hasLiked
          ? "feed:card.forumThread.unlikeAria"
          : "feed:card.forumThread.likeAria",
      )}
      onClick={() =>
        likeThread({
          threadId: item.id,
          postId: openingPostId,
          liked: !hasLiked,
        })
      }
    >
      <FiHeart aria-hidden />{" "}
      <RollingNumber value={fmt.number(count)} numericValue={count} />
    </Button>
  );
}
