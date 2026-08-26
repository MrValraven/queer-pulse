import { useState } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Avatar, Button } from "../../shared/components/ui";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { photoOf } from "../communities/communityPeople";
import { communityPostPath } from "../communities/communityPostPath";
import type { HubPost } from "../communities/HubPulseCard";
import { FEED_POST, type FeedPost } from "./feed.data";
import { MoreMenu, ReportModal } from "./FeedModeration";
import { FeedPostActions, FeedReasonLine } from "./FeedPostActions";
import type { FeedReason } from "./api/feed.api";
import type { FeedMuteTarget } from "./api/useFeedMutes";
import {
  FeedActionLink,
  FeedActions,
  FeedAvatarLink,
  FeedCardHead,
  FeedCardShell,
  FeedIdentity,
  FeedQuote,
} from "./FeedCard";
import styles from "./FeedCard.module.css";

/**
 * Compact community-post card — supersedes the feed's old full `PostCard`
 * and the in-feed `HubPulseCard` rendering.
 *
 * SOC-04: it is no longer read-only. `FeedPostActions` hosts a reaction and
 * a reply composer inline, so a member can answer someone without losing
 * their place, and `FeedReasonLine` says why the card is in this feed at all.
 * Both are additive: a card with no signals renders exactly as before.
 *
 * Accepts either a standalone demo `post` (the feed's own mock) or an
 * aggregated `hub` item from the communities hub pulse — both normalize to
 * the same shape below.
 */
export function CommunityPostCard({
  post = FEED_POST,
  hub,
  signals,
  muteTarget,
}: {
  post?: FeedPost;
  hub?: HubPost;
  /** Ranking + interaction state from the live `/feed` item. Absent for the
   *  demo `hub` branch and for any tab the backend doesn't rank. */
  signals?: {
    reason?: FeedReason;
    reasonSubject?: string | null;
    reactionCount?: number;
    replyCount?: number;
    myReaction?: string | null;
  };
  /** The community this post came from, so the card's menu can offer
   *  "show me less of this" (SOC-18). Muting it never leaves the community. */
  muteTarget?: FeedMuteTarget;
}) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const [reporting, setReporting] = useState(false);

  // Normalize the two sources to one shape.
  const authorName = hub ? hub.post.author.name : post.authorName;
  const authorSlug = hub ? hub.post.author.slug : post.slug;
  const authorInitials = hub ? hub.post.author.initials : post.authorInitials;
  const authorTint = hub ? hub.post.author.tint : post.authorTint;
  // For a hub item, `photoOf` resolves the author's photo from the community
  // people registry. For a live `post`, the feed's own `avatarUrl` (mapped
  // from `FeedItem.actor.avatarUrl` in `feedItemToPost`) is passed straight
  // through — `Avatar` itself resolves Google/Unsplash sizing and sets
  // `referrerPolicy="no-referrer"`, same as the feed's other live cards
  // (`MemberCard`, `GatheringCard`, `ForumThreadCard`).
  const avatarSrc = hub
    ? photoOf(hub.post.author, demoMode)
    : (post.avatarUrl ?? undefined);
  const body = hub ? hub.post.body : post.body;
  const communityName = hub ? hub.communityName : post.context;
  const replyCount = hub ? hub.post.replies.length : post.replies.length;
  const reactionCount = hub
    ? hub.post.reactions.reduce((sum, reaction) => sum + reaction.count, 0)
    : post.likeCount;
  // SOC-02: both branches open the POST, not the top of the community
  // timeline it happens to sit in. The live branch already carries the
  // permalink on `post.link`.
  const threadLink = hub
    ? communityPostPath(hub.communitySlug, hub.post.id)
    : (post.link ?? "/communities");
  const time = hub ? hub.post.time : post.time;
  const subjectId = hub ? hub.post.id : post.id;

  return (
    <FeedCardShell accent="ink">
      <div className={styles.postHeadRow}>
        <FeedCardHead
          label={t("feed:card.eyebrow.communityPost")}
          timestamp={time}
        />
        <MoreMenu
          authorName={authorName}
          slug={authorSlug ?? ""}
          onReport={() => setReporting(true)}
          muteTarget={muteTarget}
        />
      </div>
      <FeedIdentity
        lead={
          <FeedAvatarLink slug={authorSlug} name={authorName}>
            <Avatar
              initials={authorInitials}
              tint={authorTint}
              size={46}
              src={avatarSrc}
              alt={authorName}
            />
          </FeedAvatarLink>
        }
        name={
          <span>
            {authorName} <MemberStaffBadge slug={authorSlug} />
          </span>
        }
        meta={t("feed:post.inCommunity", {
          community: communityName,
          count: replyCount,
        })}
      />
      <FeedQuote>{body}</FeedQuote>
      <FeedReasonLine
        reason={signals?.reason}
        subject={signals?.reasonSubject}
      />
      <FeedActions
        primary={
          <Button variant="ghost" size="sm" to={threadLink}>
            {t("feed:action.openThread")}
          </Button>
        }
        secondary={
          // A `hub` card is an aggregate of somebody else's community
          // timeline with no post id the feed can act on, so it keeps the
          // read-only count it always showed.
          hub ? (
            reactionCount > 0 ? (
              <span className={styles.reactionHint}>
                {t("feed:action.countMeIn", { count: reactionCount })}
              </span>
            ) : undefined
          ) : (
            <FeedPostActions
              postId={subjectId}
              reactionCount={signals?.reactionCount ?? reactionCount}
              replyCount={signals?.replyCount ?? replyCount}
              myReaction={signals?.myReaction ?? null}
            />
          )
        }
        link={<FeedActionLink to={threadLink}>{communityName}</FeedActionLink>}
      />
      {reporting && (
        <ReportModal
          authorName={authorName}
          subjectId={subjectId}
          subjectType="post"
          onClose={() => setReporting(false)}
        />
      )}
    </FeedCardShell>
  );
}
