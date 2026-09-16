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

/** Reserves the filter-tab row's (`InboxTabs`) own footprint while the inbox's
 *  first load is in flight, so the header doesn't grow by a tab row's height
 *  the moment the tabs mount (DES-192). `showTabs` is false throughout the
 *  loading window, so without this the search box and rows below it jump
 *  down under the finger on mobile the instant loading settles. Pill widths
 *  are rough stand-ins for All/Unread/Favorites/Groups plus the two
 *  icon-only tabs, kept approximate rather than echoing the real labels. */
export function FilterTabRowSkeleton() {
  return (
    <div className={styles.tabRowSkeleton} aria-hidden>
      {[52, 76, 84, 68, 32, 32].map((width, i) => (
        <SkeletonLine
          key={i}
          width={width}
          height={30}
          style={{ borderRadius: 999 }}
        />
      ))}
    </div>
  );
}
