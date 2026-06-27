import { SkeletonLine } from '../../shared/components/ui'
import styles from './EmployerReviewsPage.module.css'

// Mirrors EmployerReviewCard's shape so there's zero layout shift on swap.
export function EmployerReviewSkeleton() {
  return (
    <div className={styles.companyCard} aria-hidden>
      <div className={styles.coTop}>
        <SkeletonLine width={44} height={44} style={{ borderRadius: 12 }} />
        <div style={{ flex: 1, paddingLeft: 14 }}>
          <SkeletonLine width="65%" height={21} />
          <SkeletonLine width="45%" height={13} style={{ marginTop: 6 }} />
        </div>
        <div className={styles.coScore} style={{ minWidth: 88 }}>
          <SkeletonLine width={48} height={32} style={{ marginLeft: 'auto' }} />
          <SkeletonLine width={90} height={11} style={{ marginTop: 8, marginLeft: 'auto' }} />
        </div>
      </div>
      <div className={styles.coBars}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div className={styles.barRow} key={i}>
            <SkeletonLine width={120} height={12} />
            <div className={styles.barTrack} style={{ background: 'transparent' }}>
              <SkeletonLine width="100%" height={5} style={{ borderRadius: 3 }} />
            </div>
            <SkeletonLine width={18} height={12} />
          </div>
        ))}
      </div>
      <SkeletonLine width="100%" height={62} style={{ borderRadius: 10 }} />
      <SkeletonLine width="55%" height={12} />
      <div className={styles.coFoot}>
        <SkeletonLine width={150} height={34} style={{ borderRadius: 999 }} />
        <SkeletonLine width={110} height={34} style={{ borderRadius: 999 }} />
      </div>
    </div>
  )
}
