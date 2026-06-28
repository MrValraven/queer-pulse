import { FadeIn } from '../../shared/components/ui'
import { AdminShell } from '../../shared/components/layout/AdminShell'
import { AdminDashboardHeader } from './AdminDashboardHeader'
import { AdminStatGrid } from './AdminStatGrid'
import { AdminTriageQueue } from './AdminTriageQueue'
import {
  ReportsByTypeChart,
  MemberGrowthChart,
  ResponseTimeChart,
} from './AdminDashboardCharts'
import { AdminDashboardFeed } from './AdminDashboardFeed'
import styles from './AdminDashboardPage.module.css'

export function AdminDashboardPage() {
  return (
    <AdminShell title={<>Overview · <em>good morning, Júlia</em></>}>
      <FadeIn>
        <AdminDashboardHeader />
      </FadeIn>

      <AdminStatGrid />

      <FadeIn delay={120}>
        <div className={styles.dashGrid}>
          <div className={styles.dashLeft}>
            <AdminTriageQueue />
            <ReportsByTypeChart />
            <div className={styles.chart2up}>
              <MemberGrowthChart />
              <ResponseTimeChart />
            </div>
          </div>
          <AdminDashboardFeed />
        </div>
      </FadeIn>
    </AdminShell>
  )
}
