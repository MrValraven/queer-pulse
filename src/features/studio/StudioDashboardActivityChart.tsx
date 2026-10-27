import { type ReactNode, useMemo, useState } from "react";
import { Button } from "../../shared/components/ui";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { StudioBarChart } from "./StudioBarChart";
import { activityBucketsOf, type StudioBarBucket } from "./studioBarBuckets";
import {
  CHART_RANGES,
  DEFAULT_CHART_RANGE_DAYS,
  type ChartRange,
  DEFAULT_CHART_RANGE_ID,
  STUDIO_COUNT_FLOOR,
} from "./studioDashboard.data";
import { DAY_MONTH } from "./studioFixtureDate";
import styles from "./StudioDashboardActivityChart.module.css";

/** Demo dashboard chart: saves and playlist adds per day, on the shared
 *  `StudioBarChart`. The showcase chart counts saves and playlist adds, and
 *  a day under the floor of 5 reads "Fewer than 5" (and draws as an empty bar, so its height cannot
 *  reveal the exact figure). Every bar is a focusable mark with a text label,
 *  and a data table mirrors the series. `footer` closes the card under the
 *  plot (the peak and top-track lines). */
export function StudioDashboardActivityChart({
  isLoading,
  footer,
}: {
  isLoading: boolean;
  footer?: ReactNode;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const [rangeId, setRangeId] = useState(DEFAULT_CHART_RANGE_ID);
  const range: ChartRange = CHART_RANGES.find(
    (candidate) => candidate.id === rangeId,
  ) ?? { id: DEFAULT_CHART_RANGE_ID, days: DEFAULT_CHART_RANGE_DAYS };
  const days = useMemo(() => activityBucketsOf(range.days), [range.days]);
  const labelStep = range.days <= 7 ? 1 : range.days <= 14 ? 2 : 5;

  const dayLabelOf = (day: StudioBarBucket) =>
    day.isCurrent
      ? t("studio:demo.dashboard.activity.today")
      : fmt.date(day.date, DAY_MONTH);
  const axisLabelOf = (day: StudioBarBucket, index: number) =>
    index % labelStep === 0 || day.isCurrent
      ? fmt.date(day.date, { day: "numeric" })
      : undefined;

  const rangeButtons = (
    <div
      className={styles.range}
      role="group"
      aria-label={t("studio:demo.dashboard.activity.rangeLabel")}
    >
      {CHART_RANGES.map((candidate) => (
        <Button
          key={candidate.id}
          variant={candidate.id === rangeId ? "primary" : "quiet"}
          size="sm"
          aria-pressed={candidate.id === rangeId}
          aria-label={t("studio:demo.dashboard.activity.rangeAria", {
            count: candidate.days,
          })}
          onClick={() => setRangeId(candidate.id)}
        >
          {fmt.number(candidate.days, {
            style: "unit",
            unit: "day",
            unitDisplay: "long",
          })}
        </Button>
      ))}
    </div>
  );

  return (
    <div className={styles.frame}>
      <StudioBarChart
        buckets={days}
        floor={STUDIO_COUNT_FLOOR}
        labels={{
          title: t("studio:demo.dashboard.activity.title"),
          subtitle: t("studio:demo.dashboard.activity.sub", {
            count: range.days,
          }),
          ariaLabel: t("studio:demo.dashboard.activity.ariaLabel", {
            count: range.days,
          }),
          tableCaption: t("studio:demo.dashboard.activity.tableCaption", {
            count: range.days,
          }),
          bucketColumn: t("studio:demo.dashboard.activity.dayColumn"),
          countColumn: t("studio:demo.dashboard.activity.countColumn"),
          showTable: t("studio:demo.dashboard.activity.showTable"),
          hideTable: t("studio:demo.dashboard.activity.hideTable"),
        }}
        bucketLabelOf={dayLabelOf}
        axisLabelOf={axisLabelOf}
        legend={rangeButtons}
        isLoading={isLoading}
        footer={footer}
      />
    </div>
  );
}
