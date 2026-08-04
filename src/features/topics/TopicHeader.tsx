import { Button, FeatureHelp } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { linkToPath } from "../../app/routeMap";
import type { Topic } from "./topics.data";
import styles from "./TopicPage.module.css";

export function TopicHeader({ topic }: { topic: Topic }) {
  const { showToast } = useToast();
  const { t } = useTranslation();
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
          variant="primary"
          onClick={() =>
            showToast(
              t("topics:header.followToast", { tag: topic.tag }),
              "success",
            )
          }
        >
          {t("topics:header.followCta")}
        </Button>
        <Button variant="ghost" to={linkToPath(topic.writeHref)}>
          {t("topics:header.writePostCta")}
        </Button>
        {topic.resources && (
          <Button variant="ghost" to={linkToPath(topic.resources.href)}>
            {topic.resources.ctaLabel}
          </Button>
        )}
      </div>
    </header>
  );
}
