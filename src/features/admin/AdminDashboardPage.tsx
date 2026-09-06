import { FiArrowRight } from "react-icons/fi";
import { Link } from "react-router-dom";
import { FadeIn } from "../../shared/components/ui";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { useAccountIdentity } from "../../shared/components/layout/useAccountIdentity";
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
  // DES-160: the greeting used to read `ADMIN_PROFILE.firstName`, which is
  // built from the mock member registry, so every real admin on live chrome
  // was greeted as the demo persona. `useAccountIdentity` resolves the
  // signed-in member from `/auth/me` and only falls back to the fixture in
  // demo mode, where that persona IS the signed-in member. While the profile
  // is still loading (and for an account with no profile name yet) it hands
  // back an empty string, so the title greets without a name rather than
  // flashing the wrong one or an empty slot.
  const { firstName } = useAccountIdentity();
  // Fixtures in demo mode, the live `GET /admin/overview` DTO otherwise — the
  // skeleton/count-up/draw animations below key off `isLoading`, same as the
  // old simulated-load shimmer did.
  const { data, isLoading } = useAdminOverview();

  return (
    <AdminShell
      title={
        firstName ? (
          <Translation
            i18nKey="admin:dashboard.title"
            components={{ em: <em /> }}
            values={{ name: firstName }}
          />
        ) : (
          <Translation
            i18nKey="admin:dashboard.titleNameless"
            components={{ em: <em /> }}
          />
        )
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
