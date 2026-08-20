import { FiArrowRight } from "react-icons/fi";
import { Link } from "react-router-dom";
import { FadeIn } from "../../shared/components/ui";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { ADMIN_PROFILE } from "../../shared/components/layout/adminNav.data";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { AdminDashboardHeader } from "./AdminDashboardHeader";
import { AdminStatGrid } from "./AdminStatGrid";
import { AdminTriageQueue } from "./AdminTriageQueue";
import {
  ReportsByTypeChart,
  MemberGrowthChart,
  ResponseTimeChart,
} from "./AdminDashboardCharts";
import { AdminDashboardFeed } from "./AdminDashboardFeed";
import { useAdminOverview } from "./api/useAdminOverview";
import styles from "./AdminDashboardPage.module.css";

export function AdminDashboardPage() {
  const { t } = useTranslation();
  // Fixtures in demo mode, the live `GET /admin/overview` DTO otherwise — the
  // skeleton/count-up/draw animations below key off `isLoading`, same as the
  // old simulated-load shimmer did.
  const { data, isLoading } = useAdminOverview();

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
        <AdminDashboardHeader triage={data?.triage ?? []} loading={isLoading} />
      </FadeIn>

      <AdminStatGrid metrics={data?.metrics ?? []} loading={isLoading} />

      <FadeIn delay={120}>
        <div className={styles.dashGrid}>
          <div className={styles.dashLeft}>
            <AdminTriageQueue queue={data?.triage ?? []} />
            <ReportsByTypeChart
              weeks={data?.reportWeeks ?? []}
              series={data?.reportSeries ?? []}
              loading={isLoading}
            />
            <div className={styles.chart2up}>
              <MemberGrowthChart
                points={data?.memberGrowth ?? []}
                loading={isLoading}
              />
              <ResponseTimeChart
                buckets={data?.responseDist ?? null}
                loading={isLoading}
              />
            </div>
            <Link to={routes.adminReports} className={styles.viewReportLink}>
              {t("admin:dashboard.viewFullReport")} <FiArrowRight aria-hidden />
            </Link>
          </div>
          <AdminDashboardFeed feed={data?.feed ?? []} loading={isLoading} />
        </div>
      </FadeIn>
    </AdminShell>
  );
}
