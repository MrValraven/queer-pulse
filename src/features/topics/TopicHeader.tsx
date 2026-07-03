import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { linkToPath } from "../../app/routeMap";
import type { Topic } from "./topics.data";
import styles from "./TopicPage.module.css";

export function TopicHeader({ topic }: { topic: Topic }) {
  const { showToast } = useToast();
  return (
    <header className={styles.head}>
      <div className={styles.eyebrow}>{topic.eyebrow}</div>
      <h1 className={styles.h1}>{topic.title}</h1>
      <p className={styles.sub}>{topic.sub}</p>

      <div className={styles.stats}>
        {topic.stats.map((stat) => (
          <div key={stat.label}>
            <b>{stat.em ? <em>{stat.value}</em> : stat.value}</b>
            {stat.label}
          </div>
        ))}
      </div>

      <div className={styles.actions}>
        <Button
          variant="primary"
          onClick={() => showToast(`Now following #${topic.tag}`, "success")}
        >
          Follow topic
        </Button>
        <Button variant="ghost" to={linkToPath(topic.writeHref)}>
          Write a post
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
