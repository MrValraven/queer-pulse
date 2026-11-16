import { FiArrowRight } from "react-icons/fi";
import { Link } from "react-router-dom";
import { FadeIn } from "../../shared/components/ui";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { useAccountIdentity } from "../../shared/components/layout/useAccountIdentity";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { AdminPageHeader } from "./ui";
import { useOverviewHeader } from "./useOverviewHeader";
import { AdminStatGrid } from "./AdminStatGrid";
import { AdminTriageQueue } from "./AdminTriageQueue";
import { ReportsByTypeChart, ResponseTimeChart } from "./AdminDashboardCharts";
import { AdminMemberGrowthCard } from "./AdminMemberGrowthCard";
import { AdminDashboardFeed } from "./AdminDashboardFeed";
import { AdminLandingVisitsCard } from "./AdminLandingVisitsCard";
import { useAdminOverview } from "./api/useAdminOverview";
import { hasFailedWithoutData, isRetryingFailedRead } from "./queryLoadFailure";
import styles from "./AdminDashboardPage.module.css";

export function AdminDashboardPage() {
  const { t } = useTranslation();
  // DES-160: the greeting reads the signed-in member from `/auth/me` through
  // `useAccountIdentity`, which falls back to the fixture only in demo mode,
  // where that persona IS the signed-in member. While the profile loads (and
  // for an account with no profile name yet) it hands back an empty string,
  // so the title greets without a name and never flashes the wrong one.
  const { firstName } = useAccountIdentity();
  // Fixtures in demo mode, the live `GET /admin/overview` DTO otherwise. The
  // skeleton, count-up and draw animations below key off `isLoading`.
  const overviewQuery = useAdminOverview();
  const { data, isLoading, refetch } = overviewQuery;
  // DES-424: with no overview at all, the tiles, triage panel, charts and feed
  // would draw empty plots and a "Not measured yet" that read as real zeros.
  // The header carries the error and its Retry alone until data arrives, and
  // keeps them through a retry so focus stays on the Retry button.
  const hasOverviewLoadError = hasFailedWithoutData(overviewQuery);
  // The headline gets the triage rows only once they loaded, so a failed read
  // (a 403, an expired grant) shows the error copy and a Retry. An empty array
  // would read as "all caught up".
  const header = useOverviewHeader({
    triage: data?.triage,
    isError: hasOverviewLoadError,
    isRetrying: isRetryingFailedRead(overviewQuery),
    onRetry: () => void refetch(),
  });

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
        <AdminPageHeader
          size="hero"
          isLive={!hasOverviewLoadError}
          {...header}
        />
      </FadeIn>

      {!hasOverviewLoadError && (
        <FadeIn delay={60}>
          <AdminStatGrid
            metrics={data?.metrics ?? []}
            loading={isLoading}
            label={t("admin:dashboard.statsLabel")}
          />
        </FadeIn>
      )}

      {!hasOverviewLoadError && (
        <FadeIn delay={120}>
          <div className={styles.dashGrid}>
            <div className={styles.dashMain}>
              <AdminTriageQueue queue={data?.triage ?? []} />
              {/* The charts draw the shared ChartFrame; the slot gives it the
                  panel's padding, corner and elevation. */}
              <div className={styles.chartPanel}>
                <ReportsByTypeChart
                  weeks={data?.reportWeeks ?? []}
                  series={data?.reportSeries ?? []}
                  loading={isLoading}
                />
              </div>
              <div className={styles.chartPair}>
                {/* Owns its range toggle and reads the range-aware growth
                    series; the overview's fixed 10-week one goes unused here. */}
                <div className={styles.chartPanel}>
                  <AdminMemberGrowthCard />
                </div>
                <div className={styles.chartPanel}>
                  <ResponseTimeChart
                    buckets={data?.responseDist ?? null}
                    loading={isLoading}
                  />
                </div>
              </div>
              <div className={styles.chartPanel}>
                <AdminLandingVisitsCard />
              </div>
              <Link to={routes.adminReports} className={styles.textLink}>
                {t("admin:dashboard.viewFullReport")}{" "}
                <FiArrowRight aria-hidden />
              </Link>
            </div>
            <AdminDashboardFeed feed={data?.feed ?? []} loading={isLoading} />
          </div>
        </FadeIn>
      )}
    </AdminShell>
  );
}
