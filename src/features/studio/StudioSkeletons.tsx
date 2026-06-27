import type { CSSProperties } from 'react'
import sk from './studioSkeleton.module.css'

/** A single shimmering line, light-on-dark (mirrors SkeletonLine for studio). */
export function StudioLine({
  width = '100%',
  height = 14,
  style,
}: {
  width?: number | string
  height?: number | string
  style?: CSSProperties
}) {
  return <div className={sk.shimmer} style={{ width, height, ...style }} />
}

/** Mirrors studio.module.css .card: square cover + title line + meta line. */
export function StudioCardSkeleton() {
  return (
    <div className={sk.card}>
      <div className={`${sk.shimmer} ${sk.cardCov}`} />
      <StudioLine width="80%" height={15} style={{ marginTop: 2 }} />
      <StudioLine width="50%" height={12} />
    </div>
  )
}

/** Mirrors studio.module.css .setRow: number, cover, title, pay, time. */
export function StudioTrackRowSkeleton() {
  return (
    <div className={sk.setRow}>
      <StudioLine width={14} height={12} />
      <div className={`${sk.shimmer} ${sk.setCov}`} />
      <div>
        <StudioLine width="55%" height={13} />
        <StudioLine width="35%" height={11} style={{ marginTop: 6 }} />
      </div>
      <StudioLine width={64} height={11} />
      <StudioLine width={28} height={11} />
    </div>
  )
}

/** A grid of card skeletons (count mirrors the real result row). */
export function StudioCardGridSkeleton({
  count,
  className,
  style,
}: {
  count: number
  className?: string
  style?: CSSProperties
}) {
  return (
    <div className={className} style={style}>
      {Array.from({ length: count }).map((_, i) => (
        <StudioCardSkeleton key={i} />
      ))}
    </div>
  )
}
