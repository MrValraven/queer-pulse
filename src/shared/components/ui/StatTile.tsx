import type { ComponentType, ReactNode } from 'react'
import { SkeletonLine } from './Skeleton'
import styles from './StatTile.module.css'

interface StatTileProps {
  label: ReactNode
  /** Pre-formatted value (string or number). Wrap a `useCountUp` result here if animating. */
  value: ReactNode
  icon?: ComponentType<{ className?: string; 'aria-hidden'?: boolean }>
  /** Small trailing unit shown after the value (e.g. "%"). */
  suffix?: ReactNode
  /** Footnote line under the value; pair with `trend` for a coloured prefix. */
  foot?: ReactNode
  trend?: { dir: 'up' | 'down' | 'flat'; label: string }
  loading?: boolean
}

/** A single metric tile: label + big number + optional trend footnote. */
export function StatTile({ label, value, icon: Icon, suffix, foot, trend, loading = false }: StatTileProps) {
  return (
    <div className={styles.tile}>
      <span className={styles.label}>
        {Icon && <Icon className={styles.icon} aria-hidden />}
        {label}
      </span>
      {loading ? (
        <SkeletonLine height={30} width="68%" style={{ margin: '2px 0 4px' }} />
      ) : (
        <span className={styles.num}>
          {value}
          {suffix && <small>{suffix}</small>}
        </span>
      )}
      {(foot || trend) && (
        <span className={styles.foot}>
          {trend && <span className={[styles.trend, styles[`trend_${trend.dir}`]].join(' ')}>{trend.label}</span>}{' '}
          {foot}
        </span>
      )}
    </div>
  )
}

/** Responsive grid wrapper for a set of `<StatTile>`s. */
export function StatGrid({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={[styles.grid, className].filter(Boolean).join(' ')}>{children}</div>
}
