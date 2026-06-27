import { SkeletonLine, SkeletonAvatar } from '../../shared/components/ui'
import styles from './BarterDetailPage.module.css'

/** Mirrors BarterDetailPage's header + provider row + 2-col grid so there's zero shift on swap. */
export function BarterDetailSkeleton() {
  return (
    <>
      <header className={styles.head}>
        <SkeletonLine width="40%" height={11} style={{ marginBottom: 16 }} />
        <SkeletonLine width="70%" height={44} style={{ marginBottom: 12 }} />
        <SkeletonLine width="55%" height={16} />
      </header>

      <div className={styles.provider}>
        <SkeletonAvatar size={56} />
        <div>
          <SkeletonLine width={160} height={18} style={{ marginBottom: 6 }} />
          <SkeletonLine width={120} height={13} />
        </div>
      </div>

      <div className={styles.grid}>
        <main>
          {[0, 1].map((i) => (
            <section key={i} className={styles.sec}>
              <SkeletonLine width="45%" height={26} style={{ marginBottom: 14 }} />
              <div className={styles.block}>
                <SkeletonLine width={90} height={11} style={{ marginBottom: 8 }} />
                <SkeletonLine width="50%" height={20} style={{ marginBottom: 8 }} />
                <SkeletonLine width="100%" height={14} style={{ marginBottom: 6 }} />
                <SkeletonLine width="85%" height={14} />
              </div>
            </section>
          ))}

          <section className={styles.sec}>
            <SkeletonLine width="40%" height={26} style={{ marginBottom: 14 }} />
            <div className={styles.steps}>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className={styles.stepCard}>
                  <SkeletonLine width={36} height={32} style={{ marginBottom: 8 }} />
                  <SkeletonLine width="60%" height={14} style={{ marginBottom: 6 }} />
                  <SkeletonLine width="100%" height={12} style={{ marginBottom: 4 }} />
                  <SkeletonLine width="80%" height={12} />
                </div>
              ))}
            </div>
          </section>
        </main>

        <aside className={styles.side}>
          <div className={styles.sideCard}>
            <SkeletonLine width="50%" height={20} style={{ marginBottom: 14 }} />
            <SkeletonLine width="100%" height={86} style={{ borderRadius: 10, marginBottom: 12 }} />
            <SkeletonLine width="100%" height={40} style={{ borderRadius: 10 }} />
          </div>

          <div className={styles.sideCard}>
            <SkeletonLine width="40%" height={14} style={{ marginBottom: 14 }} />
            {[0, 1, 2].map((i) => (
              <div key={i} className={styles.infoRow}>
                <SkeletonLine width={70} height={13} />
                <SkeletonLine width={90} height={13} />
              </div>
            ))}
          </div>

          <div className={styles.sideCard}>
            <SkeletonLine width="50%" height={14} style={{ marginBottom: 14 }} />
            <div className={styles.tagsRow}>
              {[60, 80, 70, 90].map((w, i) => (
                <SkeletonLine key={i} width={w} height={24} style={{ borderRadius: 999 }} />
              ))}
            </div>
          </div>
        </aside>
      </div>
    </>
  )
}
