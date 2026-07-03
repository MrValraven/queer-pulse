import { useMemo, useState } from "react";
import { Button, FadeIn } from "../../shared/components/ui";
import type { PostCategory, Topic } from "./topics.data";
import { TopicPostCard } from "./TopicPostCard";
import styles from "./TopicPage.module.css";

type Filter = "all" | PostCategory;

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "thread", label: "Threads" },
  { id: "recommendation", label: "Recommendations" },
  { id: "article", label: "Articles" },
  { id: "event", label: "Events" },
  { id: "resource", label: "Resources" },
];

export function TopicFeed({ topic }: { topic: Topic }) {
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
            {f.label} · {counts[f.id] ?? 0}
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
              Load {older} older posts
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
