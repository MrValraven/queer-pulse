import { FadeIn } from '../../shared/components/ui'
import { useCountUp } from '../../shared/hooks/useCountUp'
import { METRICS, type StatCard } from './adminDashboard.data'
import styles from './AdminDashboardPage.module.css'

export function AdminStatGrid() {
  return (
    <div className={styles.statGrid}>
      {METRICS.map((m, i) => (
        <FadeIn key={m.label} delay={i * 70}>
          <AdminStatCard stat={m} />
        </FadeIn>
      ))}
    </div>
  )
}

function AdminStatCard({ stat }: { stat: StatCard }) {
  const { label, icon: Icon, value, comma, decimal, prefix, suffix, trend, foot } = stat
  const target = decimal ? Math.round(value * 10) : value
  const n = useCountUp(target, { durationMs: 1200 })
  const display = decimal
    ? (n / 10).toFixed(1)
    : comma
      ? n.toLocaleString('en-US')
      : String(n)

  return (
    <div className={styles.statCard}>
      <span className={styles.statLabel}>
        <Icon className={styles.statIcon} aria-hidden />
        {label}
      </span>
      <span className={styles.statNum}>
        {prefix}
        {display}
        {suffix && <small>{suffix}</small>}
      </span>
      <span className={styles.statFoot}>
        <span className={[styles.trend, styles[`trend_${trend.dir}`]].join(' ')}>{trend.label}</span>{' '}
        {foot}
      </span>
    </div>
  )
}
