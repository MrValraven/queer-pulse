import { SkeletonAvatar, SkeletonLine } from "../../shared/components/ui";
import styles from "./MessagesPage.module.css";

/** Mirrors a thread row: avatar + name/time header + preview line. */
function ThreadRowSkeleton() {
  return (
    <div className={styles.threadRow} aria-hidden>
      <div className={styles.trAv}>
        <SkeletonAvatar size={42} />
      </div>
      <div className={styles.trBody}>
        <div className={styles.trHeader}>
          <SkeletonLine width="45%" height={14} />
          <SkeletonLine width={36} height={11} />
        </div>
        <SkeletonLine width="80%" height={13} style={{ marginTop: 4 }} />
      </div>
    </div>
  );
}

export function MessageThreadListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <ThreadRowSkeleton key={i} />
      ))}
    </>
  );
}

/** Mirrors a search hit row (`MessageHitRow`'s `.hitRow` shape): sender + time
 *  header, then a snippet line. Shown in place of the "searching…" status
 *  text while a message-body search is pending, so the results area never
 *  reads as empty before it has actually settled. */
function MessageHitRowSkeleton() {
  return (
    <div className={styles.hitRow} aria-hidden>
      <div className={styles.hitHeader}>
        <SkeletonLine width="40%" height={13} />
        <SkeletonLine width={30} height={11} />
      </div>
      <SkeletonLine width="90%" height={14} style={{ marginTop: 4 }} />
    </div>
  );
}

export function MessageHitListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <MessageHitRowSkeleton key={i} />
      ))}
    </>
  );
}
