import { SkeletonLine } from '../../shared/components/ui'
import s from './HousingListingPage.module.css'

/** Mirrors HousingListingPage's gallery + head + 2-col grid so there's no shift on swap. */
export function HousingListingSkeleton() {
  return (
    <>
      <div className={s.gallery} aria-hidden>
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonLine key={i} width="100%" height="100%" style={{ borderRadius: 0 }} />
        ))}
      </div>

      <header className={s.head} aria-hidden>
        <SkeletonLine width={90} height={24} style={{ borderRadius: 7 }} />
        <SkeletonLine width="55%" height={40} style={{ marginTop: 14 }} />
        <div className={s.metaRow} style={{ marginTop: 16 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonLine key={i} width={110} height={30} style={{ borderRadius: 8 }} />
          ))}
        </div>
      </header>

      <div className={s.grid}>
        <main>
          <section className={s.sec}>
            <SkeletonLine width="40%" height={24} />
            <SkeletonLine height={14} style={{ marginTop: 16 }} />
            <SkeletonLine height={14} style={{ marginTop: 10 }} />
            <SkeletonLine width="80%" height={14} style={{ marginTop: 10 }} />
          </section>

          <section className={s.sec}>
            <SkeletonLine width="30%" height={24} style={{ marginBottom: 16 }} />
            <div className={s.features}>
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonLine key={i} width={100} height={34} style={{ borderRadius: 999 }} />
              ))}
            </div>
          </section>

          <section className={s.sec}>
            <SkeletonLine width="30%" height={24} style={{ marginBottom: 16 }} />
            <div className={s.facts}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className={s.factRow}>
                  <SkeletonLine width={120} height={14} />
                  <SkeletonLine width={70} height={14} />
                </div>
              ))}
            </div>
          </section>

          <section className={s.sec}>
            <SkeletonLine width="30%" height={24} style={{ marginBottom: 16 }} />
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonLine key={i} width="60%" height={15} style={{ marginTop: 12 }} />
            ))}
          </section>
        </main>

        <aside className={s.side}>
          <div className={s.priceCard}>
            <SkeletonLine width="50%" height={40} />
            <SkeletonLine width="80%" height={13} style={{ marginTop: 10 }} />
            <SkeletonLine height={40} style={{ marginTop: 16, borderRadius: 999 }} />
          </div>

          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={s.sideCard}>
              <SkeletonLine width="45%" height={12} style={{ marginBottom: 16 }} />
              <SkeletonLine height={14} />
              <SkeletonLine width="75%" height={14} style={{ marginTop: 10 }} />
            </div>
          ))}
        </aside>
      </div>
    </>
  )
}
