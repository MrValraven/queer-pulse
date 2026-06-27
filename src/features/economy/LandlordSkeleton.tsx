import { SkeletonLine } from '../../shared/components/ui'
import s from './LandlordPage.module.css'

/** Mirrors LandlordPage's hero + 2-col grid so there's no layout shift on swap. */
export function LandlordSkeleton() {
  return (
    <>
      <header className={s.hero} aria-hidden>
        <SkeletonLine width={160} height={160} style={{ borderRadius: 16 }} />
        <div>
          <SkeletonLine width={180} height={11} />
          <SkeletonLine width="60%" height={48} style={{ marginTop: 12 }} />
          <SkeletonLine width={220} height={15} style={{ marginTop: 14 }} />
          <SkeletonLine width="80%" height={14} style={{ marginTop: 14 }} />
        </div>
        <div className={s.heroAction}>
          <SkeletonLine width={170} height={44} style={{ borderRadius: 999 }} />
          <SkeletonLine width={140} height={13} style={{ marginTop: 8 }} />
        </div>
      </header>

      <div className={s.grid}>
        <main>
          <section className={s.sec}>
            <SkeletonLine width="40%" height={24} />
            <SkeletonLine height={14} style={{ marginTop: 16 }} />
            <SkeletonLine height={14} style={{ marginTop: 10 }} />
            <SkeletonLine width="85%" height={14} style={{ marginTop: 10 }} />
          </section>

          <section className={s.sec}>
            <SkeletonLine width="35%" height={24} />
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonLine key={i} width="55%" height={15} style={{ marginTop: 12 }} />
            ))}
          </section>

          <section className={s.sec}>
            <SkeletonLine width="45%" height={24} style={{ marginBottom: 16 }} />
            <div className={s.recs}>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={s.rec}>
                  <div className={s.recHead}>
                    <SkeletonLine width={34} height={34} style={{ borderRadius: '50%' }} />
                    <div style={{ flex: 1 }}>
                      <SkeletonLine width={120} height={13} />
                      <SkeletonLine width={80} height={11} style={{ marginTop: 6 }} />
                    </div>
                  </div>
                  <SkeletonLine height={14} style={{ marginTop: 4 }} />
                  <SkeletonLine width="70%" height={14} style={{ marginTop: 8 }} />
                </div>
              ))}
            </div>
          </section>
        </main>

        <aside className={s.side}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={s.sideCard}>
              <SkeletonLine width="50%" height={12} style={{ marginBottom: 16 }} />
              <SkeletonLine height={14} />
              <SkeletonLine width="80%" height={14} style={{ marginTop: 10 }} />
              <SkeletonLine height={40} style={{ marginTop: 16, borderRadius: 999 }} />
            </div>
          ))}
        </aside>
      </div>
    </>
  )
}
