import { useParams } from "react-router-dom";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { PageShell } from "../../shared/components/layout";
import { SkeletonLine } from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
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
  const simLoading = useSimulatedLoad();
  const { demoMode } = useDemoMode();
  // Detail source: demo returns the scripted mock; live fetches meta + posts.
  const topicQuery = useTopic(tag);
  const topic = topicQuery.data ?? getTopic(tag);
  const loading = demoMode ? simLoading : topicQuery.isLoading;

  return (
    <PageShell>
      <div className={styles.page}>
        {loading ? (
          <TopicSkeleton />
        ) : (
          <>
            <TopicHeader topic={topic} />
            <div className={styles.grid}>
              <TopicFeed topic={topic} />
              <TopicSidebar topic={topic} />
            </div>
          </>
        )}
      </div>
    </PageShell>
  );
}
