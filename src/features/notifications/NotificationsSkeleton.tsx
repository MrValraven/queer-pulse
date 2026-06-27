import { SkeletonLine } from '../../shared/components/ui'
import styles from './NotificationsPage.module.css'

/** Mirrors a notification row: avatar/icon block + text + meta. */
function NotificationSkeleton() {
  return (
    <div className={styles.item} aria-hidden>
      <SkeletonLine width={40} height={40} style={{ borderRadius: 12, flex: 'none' }} />
      <div className={styles.body}>
        <SkeletonLine width="75%" height={15} />
        <SkeletonLine width="35%" height={12} style={{ marginTop: 8 }} />
      </div>
    </div>
  )
}

export function NotificationsListSkeleton({ count = 7 }: { count?: number }) {
  return (
    <div className={styles.list}>
      <div className={styles.day}>Today &amp; recent</div>
      {Array.from({ length: count }).map((_, i) => (
        <NotificationSkeleton key={i} />
      ))}
    </div>
  )
}
