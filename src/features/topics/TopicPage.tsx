import { FiAlertTriangle, FiHash } from "react-icons/fi";
import { useParams } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { PageShell } from "../../shared/components/layout";
import { EmptyState, SkeletonLine } from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useTopic } from "./api/useTopic";
import { getTopic } from "./topics.data";
import { TopicHeader } from "./TopicHeader";
import { TopicFeed } from "./TopicFeed";
import { TopicSidebar } from "./TopicSidebar";
import styles from "./TopicPage.module.css";

/** One post-card placeholder, matching TopicPostCard's shape (no layout shift). */
function PostSkeleton() {
  return (
    <div className={styles.post} aria-hidden>
      <div className={styles.postHead}>
        <SkeletonLine
          width={32}
          height={32}
          style={{ borderRadius: "50%", flex: "none" }}
        />
        <div style={{ flex: 1 }}>
          <SkeletonLine width="30%" height={12} />
          <SkeletonLine width="45%" height={11} style={{ marginTop: 6 }} />
        </div>
      </div>
      <SkeletonLine width="80%" height={20} style={{ marginTop: 4 }} />
      <SkeletonLine width="95%" height={14} style={{ marginTop: 10 }} />
      <SkeletonLine width="60%" height={14} style={{ marginTop: 6 }} />
    </div>
  );
}

function TopicSkeleton() {
  return (
    <>
      <div className={styles.head} aria-hidden>
        <SkeletonLine width={60} height={12} />
        <SkeletonLine width="55%" height={72} style={{ marginTop: 16 }} />
        <SkeletonLine width="70%" height={16} style={{ marginTop: 18 }} />
        <SkeletonLine width={280} height={40} style={{ marginTop: 24 }} />
      </div>
      <div className={styles.posts}>
        {Array.from({ length: 4 }).map((_, i) => (
          <PostSkeleton key={i} />
        ))}
      </div>
    </>
  );
}

export function TopicPage() {
  const { tag = "" } = useParams();
  const { t } = useTranslation();
  const simLoading = useSimulatedLoad();
  const { demoMode } = useDemoMode();
  // Detail source: demo returns the scripted mock; live fetches meta + a cursor
  // page of posts (further pages append via TopicFeed's "Load more" button).
  const topicQuery = useTopic(tag);
  // Demo returns the scripted mock (curated or a generic fallback — always a
  // value); the `getTopic` fallback is demo-only so a live 404/error for a slug
  // that collides with a curated topic can't leak scripted data into live mode.
  const topic = demoMode ? topicQuery.topic ?? getTopic(tag, t) : topicQuery.topic;
  const loading = demoMode ? simLoading : topicQuery.isLoading;

  return (
    <PageShell>
      <div className={styles.page}>
        {loading ? (
          <TopicSkeleton />
        ) : topic ? (
          <>
            <TopicHeader topic={topic} />
            <div className={styles.grid}>
              <TopicFeed
                topic={topic}
                hasNextPage={topicQuery.hasNextPage}
                fetchNextPage={topicQuery.fetchNextPage}
                isFetchingNextPage={topicQuery.isFetchingNextPage}
              />
              <TopicSidebar topic={topic} />
            </div>
          </>
        ) : topicQuery.isError ? (
          // A 500 / network failure is NOT "this topic doesn't exist": it is
          // retryable, so it gets its own panel with a real retry, mirroring
          // ThreadPage's 404-vs-retryable split.
          <EmptyState
            icon={<FiAlertTriangle />}
            title={t("topics:error.title")}
            description={t("topics:error.description")}
            action={{
              label: t("topics:error.retryCta"),
              onClick: topicQuery.refetch,
            }}
          />
        ) : (
          // Live-only: the fetch resolved with no topic (a genuine 404). Show a
          // real not-found state instead of a scripted mock.
          <EmptyState
            icon={<FiHash />}
            title={t("topics:notFound.title")}
            description={t("topics:notFound.description")}
            action={{ label: t("topics:notFound.backCta"), to: routes.forum }}
          />
        )}
      </div>
    </PageShell>
  );
}
