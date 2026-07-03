import { Link } from "react-router-dom";
import { Avatar, Button } from "../../shared/components/ui";
import { linkToPath, routes, topicPath } from "../../app/routeMap";
import type { Topic } from "./topics.data";
import styles from "./TopicPage.module.css";

export function TopicSidebar({ topic }: { topic: Topic }) {
  return (
    <aside className={styles.side}>
      {topic.resources && (
        <div className={styles.resources}>
          <h5>{topic.resources.title}</h5>
          <p>{topic.resources.body}</p>
          <Link to={linkToPath(topic.resources.href)}>
            {topic.resources.ctaLabel}
          </Link>
        </div>
      )}

      {topic.relatedTopics.length > 0 && (
        <div className={styles.sideCard}>
          <h4>Related topics</h4>
          <div className={styles.relatedList}>
            {topic.relatedTopics.map((related) => (
              <Link key={related.tag} to={topicPath(related.tag)}>
                <span>
                  <span className={styles.hash}>#</span>
                  {related.tag}
                </span>
                <span className={styles.count}>{related.count}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {topic.topVoices.length > 0 && (
        <div className={styles.sideCard}>
          <h4>Top voices here</h4>
          <div className={styles.topPeople}>
            {topic.topVoices.map((voice) => (
              <Link
                key={voice.name}
                to={linkToPath(voice.href)}
                className={styles.person}
              >
                <Avatar initials={voice.initials} tint={voice.tone} size={32} />
                <div className={styles.personText}>
                  <div className={styles.personName}>{voice.name}</div>
                  <div className={styles.personDetail}>{voice.detail}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {topic.crisisCard && (
        <div className={styles.crisis}>
          <p>In crisis? Don't wait for the thread.</p>
          <Button
            variant="primary"
            to={linkToPath(routes.crisisChat)}
            className={styles.crisisBtn}
          >
            Open crisis chat
          </Button>
        </div>
      )}
    </aside>
  );
}
