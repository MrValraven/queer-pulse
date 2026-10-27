import { useId, useState } from "react";
import { FiRefreshCw } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { describeError } from "../../shared/api/errorMessage";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminSeg } from "./ui";
import { MemberGrowthChart } from "./AdminMemberGrowthChart";
import { reportRangeLabel } from "./adminMemberGrowth.helpers";
import {
  DASHBOARD_GROWTH_RANGE_WEEKS,
  DEFAULT_DASHBOARD_GROWTH_WEEKS,
  type DashboardGrowthRangeWeeks,
} from "./adminReportsTrends.data";
import { useAdminReportsGrowth } from "./api/useAdminReportsGrowth";
import { hasFailedWithoutData, isRetryingFailedRead } from "./queryLoadFailure";
import styles from "./AdminMemberGrowthCard.module.css";

/**
 * The Overview dashboard's member-growth card, with its own range toggle
 * (a month, a quarter, half a year, a year). It reads the range-aware
 * `/admin/reports/growth` series; the overview's fixed 10-week series is left
 * for the Overview DTO's other readers.
 *
 * The toggle sits in the frame head and stays mounted through loading and
 * errors, so a reader can always switch back. While the other range loads the
 * previous line stays on screen, dimmed.
 */
export function AdminMemberGrowthCard() {
  const { t } = useTranslation();
  const [weeks, setWeeks] = useState<DashboardGrowthRangeWeeks>(
    DEFAULT_DASHBOARD_GROWTH_WEEKS,
  );
  const growthQuery = useAdminReportsGrowth(weeks);
  const { data, error, isLoading, isPlaceholderData, refetch } = growthQuery;
  const hasLoadError = hasFailedWithoutData(growthQuery);
  const isRetrying = isRetryingFailedRead(growthQuery);
  const rangeLabelId = useId();

  const rangeToggle = (
    <div className={styles.range}>
      <span id={rangeLabelId} className="visuallyHidden">
        {t("admin:dashboard.charts.memberGrowth.rangeLabel")}
      </span>
      <AdminSeg
        options={DASHBOARD_GROWTH_RANGE_WEEKS.map((option) => ({
          value: String(option),
          label: reportRangeLabel(option, t),
        }))}
        value={String(weeks)}
        onChange={(next) => setWeeks(Number(next) as DashboardGrowthRangeWeeks)}
        ariaLabelledby={rangeLabelId}
      />
    </div>
  );

  // A failed read with nothing loaded names its reason and offers a Retry
  // where the plot would be. An empty plot would read as no members at all.
  const loadError = hasLoadError ? (
    <span role="status" className={styles.loadError}>
      <span>
        {describeError(
          t("admin:dashboard.charts.memberGrowth.loadError"),
          error,
          t("shared:apiError.tryAgainTail"),
        )}
      </span>
      <Button
        variant="ghost"
        size="sm"
        aria-disabled={isRetrying || undefined}
        onClick={isRetrying ? undefined : () => void refetch()}
      >
        <FiRefreshCw aria-hidden />{" "}
        {isRetrying
          ? t("shared:loadError.retryingCta")
          : t("admin:dashboard.charts.memberGrowth.retry")}
      </Button>
    </span>
  ) : (
    false
  );

  return (
    <MemberGrowthChart
      points={data ?? []}
      subtitle={t("admin:dashboard.charts.memberGrowth.subRange", {
        count: weeks,
      })}
      headAction={rangeToggle}
      isStale={isPlaceholderData}
      loading={isLoading && !hasLoadError}
      empty={loadError}
    />
  );
}
