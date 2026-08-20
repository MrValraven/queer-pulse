import { Link } from "react-router-dom";
import { FiHash } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { topicPath } from "../../app/routeMap";
import { useTopicFollow } from "./api/useTopicFollow";
import type { TopicResponse } from "./api/topics.api";
import styles from "./TopicsDirectoryPage.module.css";

/**
 * One topic in the directory (DISC-4) — the tag, its description, a post
 * count, and a follow toggle. `useTopicFollow` reads/writes the SAME
 * `topic_follows` state `TopicHeader`'s button does, so following from here
 * and from a topic's own page always agree.
 */
export function TopicCard({ topic }: { topic: TopicResponse }) {
  const { t } = useTranslation();
  const { isFollowing, isPending, toggle } = useTopicFollow(topic.tag);

  return (
    <div className={styles.card}>
      <Link to={topicPath(topic.tag)} className={styles.cardLink}>
        <span className={styles.cardIcon} aria-hidden>
          <FiHash />
        </span>
        <div className={styles.cardName}>#{topic.tag}</div>
        {topic.description && (
          <p className={styles.cardDesc}>{topic.description}</p>
        )}
      </Link>
      <div className={styles.cardFoot}>
        <span className={styles.cardCount}>
          {t("topics:directory.postsCount", { count: topic.totalPosts })}
        </span>
        <Button
          size="sm"
          variant={isFollowing ? "ghost" : "primary"}
          onClick={toggle}
          disabled={isPending}
          aria-pressed={isFollowing}
        >
          {t(
            isFollowing
              ? "topics:header.followingCta"
              : "topics:header.followCta",
          )}
        </Button>
      </div>
    </div>
  );
}
