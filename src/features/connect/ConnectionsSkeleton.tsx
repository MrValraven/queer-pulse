import { SkeletonLine } from '../../shared/components/ui'
import styles from './ConnectionsPage.module.css'

/** Mirrors a connection card: head (avatar + name/pron/role), tags, meta, actions. */
function ConnectionCardSkeleton() {
  return (
    <div className={styles.card} aria-hidden>
      <div className={styles.cardHead}>
        <SkeletonLine width={54} height={54} style={{ borderRadius: 999, flex: 'none' }} />
        <div style={{ flex: 1 }}>
          <SkeletonLine width="60%" height={16} />
          <SkeletonLine width={48} height={11} style={{ marginTop: 6 }} />
          <SkeletonLine width="80%" height={12} style={{ marginTop: 6 }} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <SkeletonLine width={64} height={22} style={{ borderRadius: 999 }} />
        <SkeletonLine width={80} height={22} style={{ borderRadius: 999 }} />
      </div>
      <SkeletonLine width="55%" height={12} />
      <div style={{ display: 'flex', gap: 8 }}>
        <SkeletonLine width={96} height={36} style={{ borderRadius: 999 }} />
        <SkeletonLine width={110} height={36} style={{ borderRadius: 999 }} />
      </div>
    </div>
  )
}

export function ConnectionsGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className={styles.grid}>
      {Array.from({ length: count }).map((_, i) => (
        <ConnectionCardSkeleton key={i} />
      ))}
    </div>
  )
}
