import { useId, useState } from "react";
import { FiDownload } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminSeg, type AdminSegOption } from "./ui";
import { REPORT_SERIES } from "./adminDashboard.data";
import { ReportsByTypeChart } from "./AdminDashboardCharts";
import { MemberGrowthChart } from "./AdminMemberGrowthChart";
import { reportRangeLabel } from "./adminMemberGrowth.helpers";
import {
  DEFAULT_REPORT_RANGE_WEEKS,
  RANGE_OPTIONS,
  type ReportRangeWeeks,
} from "./adminReportsTrends.data";
import { useAdminReportsTrends } from "./api/useAdminReportsTrends";
import {
  downloadGrowthCsv,
  downloadReportsByTypeCsv,
} from "./api/adminReports.api";
import styles from "./AdminReportsPage.module.css";

/** Growth + reports-by-type share one weekly-range control (ADM-17): a
 *  self-contained section that owns its own range state, mirroring
 *  `AdminGovernanceChart`'s own local `range` state for its 4q/6q toggle. */
export function AdminReportsTrendsSection() {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { showToast } = useToast();
  const [weeks, setWeeks] = useState<ReportRangeWeeks>(
    DEFAULT_REPORT_RANGE_WEEKS,
  );
  const { data, isLoading } = useAdminReportsTrends(weeks);
  const headingId = useId();

  const rangeOptions: AdminSegOption[] = RANGE_OPTIONS.map((option) => ({
    value: option.value,
    label: reportRangeLabel(option.weeks, t),
  }));

  // Export the current range as CSV (ADM-19). Demo keeps a confirmation
  // toast (the demo has no backend and writes no file); live streams from
  // the `.csv` sibling route, honouring the same `weeks` the charts show.
  const handleExport = async (series: "growth" | "reportsByType") => {
    if (demoMode) {
      showToast(t("admin:reports.trends.exportToast"), "success");
      return;
    }
    try {
      if (series === "growth") await downloadGrowthCsv(weeks);
      else await downloadReportsByTypeCsv(weeks);
      showToast(t("admin:reports.trends.exportToast"), "success");
    } catch {
      showToast(t("admin:reports.trends.exportError"), "error");
    }
  };

  return (
    <section className={styles.trends} aria-labelledby={headingId}>
      <div className={styles.sectionHead}>
        <div className={styles.sectionHeadText}>
          <h2 id={headingId} className={styles.sectionTitle}>
            {t("admin:reports.trends.title")}
          </h2>
          <p className={styles.sectionSub}>{t("admin:reports.trends.sub")}</p>
        </div>
        <AdminSeg
          options={rangeOptions}
          value={String(weeks)}
          onChange={(value) => setWeeks(Number(value) as ReportRangeWeeks)}
          ariaLabelledby={headingId}
        />
      </div>

      {/* Each chart is the shared ChartFrame; its slot gives the frame the
          admin panel's padding, corner and elevation. */}
      <div className={styles.chartRow}>
        <div className={styles.chartCol}>
          <MemberGrowthChart
            points={data?.growth ?? []}
            subtitle={t("admin:reports.trends.growthSub", { count: weeks })}
            loading={isLoading}
            headAction={
              <span className={styles.chartExport}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => void handleExport("growth")}
                >
                  <FiDownload aria-hidden />{" "}
                  {t("admin:reports.trends.exportGrowth")}
                </Button>
              </span>
            }
          />
        </div>
        <div className={styles.chartCol}>
          <ReportsByTypeChart
            weeks={data?.reportWeeks ?? []}
            series={REPORT_SERIES}
            aspect={360 / 220}
            loading={isLoading}
            headAction={
              <span className={styles.chartExport}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => void handleExport("reportsByType")}
                >
                  <FiDownload aria-hidden />{" "}
                  {t("admin:reports.trends.exportReportsByType")}
                </Button>
              </span>
            }
          />
        </div>
      </div>
    </section>
  );
}
