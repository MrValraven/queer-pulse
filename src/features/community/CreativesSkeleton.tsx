import { SkeletonLine } from '../../shared/components/ui'
import styles from './CreativesPage.module.css'

/** Mirrors ArtCard inside the masonry column flow (break-inside + margin kept). */
export function ArtCardSkeleton({ imgH = 200 }: { imgH?: number }) {
  return (
    <article className={styles.artCard} aria-hidden>
      <SkeletonLine width="100%" height={imgH} style={{ borderRadius: 0 }} />
      <div className={styles.artCardBody}>
        <SkeletonLine width={90} height={12} />
        <SkeletonLine width="75%" height={19} style={{ marginTop: 12 }} />
        <SkeletonLine width="100%" height={13} style={{ marginTop: 10 }} />
        <SkeletonLine width="80%" height={13} style={{ marginTop: 4 }} />
        <div className={styles.artFoot} style={{ marginTop: 16 }}>
          <SkeletonLine width={40} height={40} style={{ borderRadius: 10 }} />
          <div style={{ flex: 1 }}>
            <SkeletonLine width="50%" height={13} />
            <SkeletonLine width="35%" height={11} style={{ marginTop: 6 }} />
          </div>
        </div>
      </div>
    </article>
  )
}

/** Mirrors MusicCard's two-column row. */
export function MusicCardSkeleton() {
  return (
    <article className={styles.musicCard} aria-hidden>
      <div className={styles.mcLeft}>
        <SkeletonLine width="100%" height={200} style={{ borderRadius: 16 }} />
        <div>
          <SkeletonLine width="60%" height={18} />
          <SkeletonLine width="40%" height={13} style={{ marginTop: 8 }} />
          <SkeletonLine width="50%" height={12} style={{ marginTop: 6 }} />
        </div>
        <SkeletonLine width={120} height={36} style={{ borderRadius: 999 }} />
      </div>
      <div className={styles.mcRight}>
        <SkeletonLine width="100%" height={14} />
        <SkeletonLine width="92%" height={14} />
        <SkeletonLine width="100%" height={64} style={{ borderRadius: 12 }} />
      </div>
    </article>
  )
}

/** Varied heights so the masonry skeleton reads like real art cards. */
const ART_HEIGHTS = [220, 180, 260, 200, 240, 190]

export function ArtGridSkeleton() {
  return (
    <>
      {ART_HEIGHTS.map((h, i) => (
        <ArtCardSkeleton key={i} imgH={h} />
      ))}
    </>
  )
}

export function MusicGridSkeleton() {
  return (
    <>
      {Array.from({ length: 4 }).map((_, i) => (
        <MusicCardSkeleton key={i} />
      ))}
    </>
  )
}
