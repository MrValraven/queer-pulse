import { Link } from "react-router-dom";
import { FiHeart, FiCornerUpLeft, FiArrowRight } from "react-icons/fi";
import { Avatar } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import type { Post } from "./community.model";
import { photoOf } from "./communityPeople";
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
          <div className={styles.pulseTime}>
            {t("communities:common.timeAgo", { time: post.time })}
          </div>
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
