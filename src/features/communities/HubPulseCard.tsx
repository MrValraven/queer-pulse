import { Link } from "react-router-dom";
import { FiHeart, FiCornerUpLeft, FiArrowRight } from "react-icons/fi";
import { Avatar } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import { communityPath } from "../../app/routeMap";
import type { Post } from "./community.model";
import { photoOf } from "./communityPeople";
import { useCommunityTime } from "./communityTime";
import styles from "./CommunitiesHomePage.module.css";

export interface HubPost {
  post: Post;
  communityName: string;
  communitySlug: string;
}

/** Compact, read-only pulse card for the aggregated hub feed (links into the
 *  community for the full, interactive version). */
export function HubPulseCard({ item }: { item: HubPost }) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const communityTime = useCommunityTime();
  const { post, communityName, communitySlug } = item;
  const reactionTotal = post.reactions.reduce((sum, r) => sum + r.count, 0);
  return (
    <article className={styles.pulseCard}>
      <Link to={`/community/${communitySlug}`} className={styles.pulseFrom}>
        {communityName}
        {post.kind === "announcement" && (
          <span className={styles.announce}>
            {t("communities:hub.pulseCard.announcement")}
          </span>
        )}
      </Link>
      <div className={styles.pulseHead}>
        <Avatar
          initials={post.author.initials}
          tint={post.author.tint}
          src={photoOf(post.author, demoMode)}
          size={36}
          alt={post.author.name}
        />
        <div>
          <div className={styles.pulseName}>
            <span className={styles.nameRow}>
              {post.author.name}
              <MemberStaffBadge slug={post.author.slug} />
            </span>
          </div>
          <div className={styles.pulseTime}>{communityTime.ago(post)}</div>
        </div>
      </div>
      <p className={styles.pulseBody}>{post.body}</p>
      <div className={styles.pulseFoot}>
        <span className={styles.pulseStat}>
          <FiHeart aria-hidden /> {reactionTotal}
        </span>
        <span className={styles.pulseStat}>
          <FiCornerUpLeft aria-hidden /> {post.replies.length}
        </span>
        <Link to={`/community/${communitySlug}`} className={styles.pulseOpen}>
          {t("communities:hub.pulseCard.open")} <FiArrowRight aria-hidden />
        </Link>
      </div>
    </article>
  );
}

/** One post excerpt from `GET /me/communities/digest`, with the community it
 *  came from. */
export interface HubExcerpt {
  postId: string;
  kind: "post" | "announcement";
  excerpt: string;
  createdAt: string;
  communityName: string;
  communitySlug: string;
}

/**
 * The live counterpart to `HubPulseCard`: one representative post from the
 * weekly digest.
 *
 * It shows less than the demo card does, and every omission is the endpoint
 * being honest. The digest strips author identity on purpose, so there is no
 * avatar and no name to render: a summary of the community rather than a
 * report on who has been talking. It carries no reaction or reply counts
 * either, so the footer is the link into the community and nothing else. The
 * body is the server-truncated 160-character excerpt, which is why the card
 * always links out to read the rest.
 */
export function HubExcerptCard({ item }: { item: HubExcerpt }) {
  const { t } = useTranslation();
  const communityTime = useCommunityTime();
  const { excerpt, kind, createdAt, communityName, communitySlug } = item;
  return (
    <article className={styles.pulseCard}>
      <Link to={communityPath(communitySlug)} className={styles.pulseFrom}>
        {communityName}
        {kind === "announcement" && (
          <span className={styles.announce}>
            {t("communities:hub.pulseCard.announcement")}
          </span>
        )}
      </Link>
      <div className={styles.pulseTime}>{communityTime.ago({ createdAt })}</div>
      <p className={styles.pulseBody}>{excerpt}</p>
      <div className={styles.pulseFoot}>
        <Link to={communityPath(communitySlug)} className={styles.pulseOpen}>
          {t("communities:hub.pulseCard.open")} <FiArrowRight aria-hidden />
        </Link>
      </div>
    </article>
  );
}
