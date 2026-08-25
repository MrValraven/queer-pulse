import { FiArrowRight } from "react-icons/fi";
import { Button, FeatureHelp } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { linkToPath } from "../../app/routeMap";
import { useTopicFollow } from "./api/useTopicFollow";
import type { Topic } from "./topics.data";
import styles from "./TopicPage.module.css";

export function TopicHeader({ topic }: { topic: Topic }) {
  const { t } = useTranslation();
  // P2-15: follow is now backed by `/topics/:slug/follow` in live and keeps the
  // mock toast in demo, so the button is always shown (it used to be demo-only).
  const { isFollowing, isPending, toggle } = useTopicFollow(topic.tag);
  return (
    <header className={styles.head}>
      <div className={styles.eyebrow}>{t(topic.eyebrowKey)}</div>
      <h1 className={styles.h1}>
        {topic.title} <FeatureHelp id="topics.hub" />
      </h1>
      <p className={styles.sub}>{topic.sub}</p>

      <div className={styles.stats}>
        {topic.stats.map((stat) => {
          const value = stat.valueKey ? t(stat.valueKey) : stat.value;
          return (
            <div key={stat.labelKey}>
              <b>{stat.em ? <em>{value}</em> : value}</b>
              {t(stat.labelKey)}
            </div>
          );
        })}
      </div>

      <div className={styles.actions}>
        <Button
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
        <Button variant="ghost" to={linkToPath(topic.writeHref)}>
          {t("topics:header.writePostCta")}
        </Button>
        {topic.resources && (
          <Button variant="ghost" to={linkToPath(topic.resources.href)}>
            {topic.resources.ctaLabel} <FiArrowRight aria-hidden />
          </Button>
        )}
      </div>
    </header>
  );
}
