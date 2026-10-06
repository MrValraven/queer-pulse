import { SkeletonAvatar, SkeletonLine } from "../../shared/components/ui";
import styles from "./ThreadPage.module.css";

/** Mirrors a top-level reply: avatar + name line + body paragraphs, inside the
 *  same root wrapper a real conversation gets, for its padding and hairline. */
function ReplySkeleton() {
  return (
    <div className={`${styles.replyNode} ${styles.replyRoot}`} aria-hidden>
      <div className={styles.reply}>
        <SkeletonAvatar size={40} />
        <div>
          <div className={styles.replyTop}>
            <SkeletonLine width={120} height={14} />
            <SkeletonLine width={64} height={12} />
          </div>
          <SkeletonLine width="100%" height={14} style={{ marginTop: 4 }} />
          <SkeletonLine width="92%" height={14} style={{ marginTop: 6 }} />
          <SkeletonLine width="40%" height={14} style={{ marginTop: 6 }} />
        </div>
      </div>
    </div>
  );
}

export function ThreadRepliesSkeleton({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <ReplySkeleton key={i} />
      ))}
    </>
  );
}
