import { Link } from 'react-router-dom'
import { FadeIn } from '../../shared/components/ui'
import { AdminShell } from '../../shared/components/layout/AdminShell'
import { METRICS, QUICK_ACTIONS } from './adminDashboard.data'
import { AdminDashboardCharts } from './AdminDashboardCharts'
import { AdminDashboardFeed } from './AdminDashboardFeed'
import styles from './AdminDashboardPage.module.css'

export function AdminDashboardPage() {
  return (
    <AdminShell title={<>Dashboard</>}>
      <div className={styles.statGrid}>
        {METRICS.map((m, i) => (
          <FadeIn key={m.label} delay={i * 60}>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{m.value}</div>
              <div className={styles.statLabel}>{m.label}</div>
              <div className={[styles.statSub, m.trend === 'up' && styles.trendUp, m.trend === 'down' && styles.trendDown].filter(Boolean).join(' ')}>{m.sub}</div>
            </div>
          </FadeIn>
        ))}
      </div>

      <FadeIn delay={240}>
        <div className={styles.dashRow}>
          <AdminDashboardCharts />
          <AdminDashboardFeed />
        </div>
      </FadeIn>

      <div className={styles.sectionLabel}>Needs attention</div>
      <div className={styles.quickGrid}>
        {QUICK_ACTIONS.map(({ label, count, to, icon: Icon }, i) => (
          <FadeIn key={label} delay={300 + i * 60}>
            <Link to={to} className={styles.quickCard}>
              <Icon aria-hidden />
              <span className={styles.quickLabel}>{label}</span>
              <span className={styles.quickCount}>{count}</span>
            </Link>
          </FadeIn>
        ))}
      </div>
    </AdminShell>
  )
}
