import { FadeIn } from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { ADMIN_PROFILE } from "../../shared/components/layout/adminNav.data";
import { Translation } from "../../shared/i18n/Translation";
import { AdminDashboardHeader } from "./AdminDashboardHeader";
import { AdminStatGrid } from "./AdminStatGrid";
import { AdminTriageQueue } from "./AdminTriageQueue";
import {
  ReportsByTypeChart,
  MemberGrowthChart,
  ResponseTimeChart,
} from "./AdminDashboardCharts";
import { AdminDashboardFeed } from "./AdminDashboardFeed";
import styles from "./AdminDashboardPage.module.css";

export function AdminDashboardPage() {
  // Short skeleton pass: stat numbers, charts and the feed shimmer in, then the
  // real content reveals and its count-up / draw animations play.
  const loading = useSimulatedLoad(900);

  return (
    <AdminShell
      title={
        <Translation
          i18nKey="admin:dashboard.title"
          components={{ em: <em /> }}
          values={{ name: ADMIN_PROFILE.firstName }}
        />
      }
    >
      <FadeIn>
        <AdminDashboardHeader />
      </FadeIn>

      <AdminStatGrid loading={loading} />

      <FadeIn delay={120}>
        <div className={styles.dashGrid}>
          <div className={styles.dashLeft}>
            <AdminTriageQueue />
            <ReportsByTypeChart loading={loading} />
            <div className={styles.chart2up}>
              <MemberGrowthChart loading={loading} />
              <ResponseTimeChart loading={loading} />
            </div>
          </div>
          <AdminDashboardFeed loading={loading} />
        </div>
      </FadeIn>
    </AdminShell>
  );
}
