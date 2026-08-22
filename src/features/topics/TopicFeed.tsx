import { useMemo, useState } from "react";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
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

/**
 * The topic's post feed. The "older posts" affordance below the list is
 * dual-mode: in DEMO it stays the prototype's scripted client-side reveal
 * (`setLoadedOlder`, gated on the mock's `totalPosts - posts.length`) so the
 * demo experience is unchanged; in LIVE it really pages `GET
 * /topics/:slug/posts?cursor=` through `fetchNextPage`, showing only while the
 * cursor query still has a next page.
 */
export function TopicFeed({
  topic,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
}: {
  topic: Topic;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
}) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const [filter, setFilter] = useState<Filter>("all");
  const [loadedOlder, setLoadedOlder] = useState(false);

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: topic.posts.length };
    for (const post of topic.posts)
      map[post.category] = (map[post.category] ?? 0) + 1;
    return map;
  }, [topic.posts]);

  // A STABLE key per post, so a filter change or an appended page reuses the
  // right DOM node. `FadeIn key={index}` re-keyed every card whenever the
  // filtered slice shifted, replaying stagger delays on the wrong ones. Posts
  // carry no id, so identity is composed from href + author, with a counter
  // disambiguating the demo mock's repeated `routes.forum` hrefs.
  const keyedPosts = useMemo(() => {
    const seen = new Map<string, number>();
    return topic.posts.map((post) => {
      const base = `${post.href}|${post.author}`;
      const repeat = seen.get(base) ?? 0;
      seen.set(base, repeat + 1);
      return { post, key: repeat === 0 ? base : `${base}#${repeat}` };
    });
  }, [topic.posts]);

  const visible = keyedPosts.filter(
    ({ post }) => filter === "all" || post.category === filter,
  );

  // DEMO holds the whole topic in one array, so per-bucket counts are true and
  // a bucket with no posts genuinely has none. LIVE only ever holds the pages
  // fetched so far: a count would undercount and grow as you page, and a
  // category whose posts start on page 3 would have no chip at all. So live
  // shows every bucket, unlabelled by a number, rather than a wrong one.
  const chips = demoMode
    ? FILTERS.filter((f) => f.id === "all" || counts[f.id])
    : FILTERS;

  const older = topic.totalPosts - topic.posts.length;

  return (
    <div>
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
            {demoMode ? `${t(f.labelKey)} · ${counts[f.id] ?? 0}` : t(f.labelKey)}
          </button>
        ))}
      </div>

      <div className={styles.posts}>
        {visible.map(({ post, key }, index) => (
          <FadeIn key={key} delay={Math.min(index, 8) * 60}>
            <TopicPostCard post={post} topicTag={topic.tag} />
          </FadeIn>
        ))}

        {demoMode
          ? older > 0 &&
            !loadedOlder && (
              <div className={styles.loadMore}>
                <Button variant="ghost" onClick={() => setLoadedOlder(true)}>
                  {t("topics:feed.loadOlder", { count: older })}
                </Button>
              </div>
            )
          : hasNextPage && (
              <div className={styles.loadMore}>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={isFetchingNextPage}
                  onClick={fetchNextPage}
                >
                  {isFetchingNextPage
                    ? t("topics:feed.loadingMore")
                    : t("topics:feed.loadMoreCta")}
                </Button>
              </div>
            )}
      </div>
    </div>
  );
}
