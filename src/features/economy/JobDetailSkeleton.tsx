import { SkeletonLine } from '../../shared/components/ui'
import styles from './JobDetailPage.module.css'

/** Mirrors JobDetailPage's header + 2-col layout so there's no shift on swap. */
export function JobDetailSkeleton() {
  return (
    <>
      <div className={styles.header} aria-hidden>
        <div className={styles.headerTop}>
          <SkeletonLine width="55%" height={48} />
          <SkeletonLine width={40} height={40} style={{ borderRadius: '50%' }} />
        </div>
        <SkeletonLine width={220} height={17} style={{ marginBottom: 14 }} />
        <div className={styles.chips}>
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonLine key={i} width={120} height={30} style={{ borderRadius: 8 }} />
          ))}
        </div>
      </div>

      <div className={styles.layout}>
        <div>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={styles.section}>
              <SkeletonLine width="40%" height={22} style={{ marginBottom: 18 }} />
              <SkeletonLine height={14} />
              <SkeletonLine height={14} style={{ marginTop: 10 }} />
              <SkeletonLine width="80%" height={14} style={{ marginTop: 10 }} />
            </div>
          ))}
        </div>

        <aside className={styles.sidebar}>
          <div className={styles.card}>
            <SkeletonLine width={64} height={64} style={{ borderRadius: 16, marginBottom: 14 }} />
            <SkeletonLine width="60%" height={17} style={{ marginBottom: 16 }} />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={styles.detailRow}>
                <SkeletonLine width={70} height={12} />
                <SkeletonLine width={90} height={13} />
              </div>
            ))}
            <SkeletonLine height={44} style={{ marginTop: 18, borderRadius: 999 }} />
          </div>
        </aside>
      </div>
    </>
  )
}
