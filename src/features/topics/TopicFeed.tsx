import { useMemo, useState } from "react";
import { Button, FadeIn } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { PostCategory, Topic } from "./topics.data";
import { TopicPostCard } from "./TopicPostCard";
import styles from "./TopicPage.module.css";

type Filter = "all" | PostCategory;

const FILTERS: { id: Filter; labelKey: string }[] = [
  { id: "all", labelKey: "topics:feed.filters.all" },
  { id: "thread", labelKey: "topics:feed.filters.threads" },
  { id: "recommendation", labelKey: "topics:feed.filters.recommendations" },
  { id: "article", labelKey: "topics:feed.filters.articles" },
  { id: "event", labelKey: "topics:feed.filters.events" },
  { id: "resource", labelKey: "topics:feed.filters.resources" },
];

export function TopicFeed({ topic }: { topic: Topic }) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<Filter>("all");
  const [loadedOlder, setLoadedOlder] = useState(false);

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: topic.posts.length };
    for (const post of topic.posts)
      map[post.category] = (map[post.category] ?? 0) + 1;
    return map;
  }, [topic.posts]);

  const visible = topic.posts.filter(
    (post) => filter === "all" || post.category === filter,
  );

  // Chips only show buckets the topic actually has (besides "All").
  const chips = FILTERS.filter((f) => f.id === "all" || counts[f.id]);

  const older = topic.totalPosts - topic.posts.length;

  return (
    <main>
      <div className={styles.chips}>
        {chips.map((f) => (
          <button
            key={f.id}
            type="button"
            className={[styles.chip, filter === f.id && styles.chipActive]
              .filter(Boolean)
              .join(" ")}
            onClick={() => setFilter(f.id)}
          >
            {t(f.labelKey)} · {counts[f.id] ?? 0}
          </button>
        ))}
      </div>

      <div className={styles.posts}>
        {visible.map((post, i) => (
          <FadeIn key={i} delay={Math.min(i, 8) * 60}>
            <TopicPostCard post={post} topicTag={topic.tag} />
          </FadeIn>
        ))}

        {older > 0 && !loadedOlder && (
          <div className={styles.loadMore}>
            <Button variant="ghost" onClick={() => setLoadedOlder(true)}>
              {t("topics:feed.loadOlder", { count: older })}
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
