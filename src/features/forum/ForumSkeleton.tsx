import { SkeletonLine } from "../../shared/components/ui";
import styles from "./ForumPage.module.css";

/** Mirrors a forum thread row: vote column + badges/title/excerpt/meta. */
function ThreadSkeleton() {
  return (
    <div className={styles.thread} aria-hidden>
      <div className={styles.voteCol}>
        <SkeletonLine width={22} height={22} style={{ borderRadius: 6 }} />
        <SkeletonLine width={20} height={12} style={{ marginTop: 4 }} />
      </div>
      <div>
        <div className={styles.badges}>
          <SkeletonLine width={88} height={20} style={{ borderRadius: 999 }} />
          <SkeletonLine width={56} height={20} style={{ borderRadius: 999 }} />
        </div>
        <SkeletonLine width="70%" height={19} />
        <SkeletonLine width="100%" height={14} style={{ marginTop: 6 }} />
        <SkeletonLine width="55%" height={14} style={{ marginTop: 4 }} />
        <div className={styles.threadMeta}>
          <SkeletonLine width={22} height={22} style={{ borderRadius: 999 }} />
          <SkeletonLine width={140} height={13} />
        </div>
      </div>
    </div>
  );
}

export function ForumThreadListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <ThreadSkeleton key={i} />
      ))}
    </>
  );
}
