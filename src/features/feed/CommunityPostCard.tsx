import { useState } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Avatar, Button } from "../../shared/components/ui";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { photoOf } from "../communities/communityPeople";
import { communityPath } from "../../app/routeMap";
import type { HubPost } from "../communities/HubPulseCard";
import { FEED_POST, type FeedPost } from "./feed.data";
import { MoreMenu, ReportModal } from "./FeedModeration";
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
 * and the in-feed `HubPulseCard` rendering. Reads-only: opens the real
 * thread instead of hosting an inline composer/reply list.
 *
 * Accepts either a standalone demo `post` (the feed's own mock) or an
 * aggregated `hub` item from the communities hub pulse — both normalize to
 * the same shape below.
 */
export function CommunityPostCard({
  post = FEED_POST,
  hub,
}: {
  post?: FeedPost;
  hub?: HubPost;
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
  const threadLink = hub
    ? communityPath(hub.communitySlug)
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
      <FeedActions
        primary={
          <Button variant="ghost" size="sm" to={threadLink}>
            {t("feed:action.openThread")}
          </Button>
        }
        secondary={
          reactionCount > 0 ? (
            <span className={styles.reactionHint}>
              {t("feed:action.countMeIn", { count: reactionCount })}
            </span>
          ) : undefined
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
