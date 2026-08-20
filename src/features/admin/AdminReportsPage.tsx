import { FadeIn } from "../../shared/components/ui";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminPageHeader } from "./ui";
import { AdminReportsTrendsSection } from "./AdminReportsTrendsSection";
import { AdminReportsFinanceSection } from "./AdminReportsFinanceSection";
import { AdminReportsCommunityHealthSection } from "./AdminReportsCommunityHealthSection";
import styles from "./AdminReportsPage.module.css";

/**
 * The consolidated platform-reports page (ADM-17 real adjustable date
 * ranges, ADM-19 CSV export): member growth + reports-by-type share one
 * weekly-range control, governance finance renders its own real quarterly
 * history, and community health renders a current, honestly-labelled
 * snapshot. `AdminDashboardPage`'s own small charts link in here rather than
 * growing their own range controls (see that page's "view full report" link).
 */
export function AdminReportsPage() {
  const { t } = useTranslation();

  return (
    <AdminShell
      title={
        <Translation
          i18nKey="admin:reports.title"
          components={{ em: <em /> }}
        />
      }
    >
      <FadeIn>
        <AdminPageHeader
          eyebrow={t("admin:reports.header.eyebrow")}
          title={
            <Translation
              i18nKey="admin:reports.header.title"
              components={{ em: <em /> }}
            />
          }
          sub={t("admin:reports.header.sub")}
        />
      </FadeIn>

      <div className={styles.sections}>
        <FadeIn delay={60}>
          <AdminReportsTrendsSection />
        </FadeIn>
        <FadeIn delay={120}>
          <AdminReportsFinanceSection />
        </FadeIn>
        <FadeIn delay={180}>
          <AdminReportsCommunityHealthSection />
        </FadeIn>
      </div>
    </AdminShell>
  );
}
