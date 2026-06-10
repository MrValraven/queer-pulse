import type { CSSProperties } from 'react'
import styles from './Skeleton.module.css'

interface SkeletonLineProps {
  width?: number | string
  height?: number | string
  style?: CSSProperties
}

export function SkeletonLine({ width = '100%', height = 14, style }: SkeletonLineProps) {
  return <div className={`${styles.shimmer} ${styles.line}`} style={{ width, height, ...style }} />
}

export function SkeletonAvatar({ size = 44 }: { size?: number }) {
  return <div className={`${styles.shimmer} ${styles.avatar}`} style={{ width: size, height: size }} />
}

export function SkeletonCard({ style }: { style?: CSSProperties }) {
  return (
    <div className={styles.card} style={style}>
      <SkeletonLine height={20} width="60%" />
      <SkeletonLine height={14} />
      <SkeletonLine height={46} style={{ borderRadius: 10 }} />
      <SkeletonLine height={14} width="40%" />
    </div>
  )
}
