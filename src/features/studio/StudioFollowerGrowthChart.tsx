import { useMemo } from "react";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioFollowerGrowthWeekView } from "./api/studioDashboard.adapters";
import { StudioBarChart } from "./StudioBarChart";
import type { StudioBarBucket } from "./studioBarBuckets";

/** Weeks start on a UTC Monday: formatting in UTC keeps that Monday from
 *  reading as Sunday west of Greenwich. */
const WEEK_DATE: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
};
/** A date under every third week, counted back from the current one. */
const AXIS_LABEL_STEP = 3;
/** Wide plot (about 280px tall at 1166px wide); the 200px minimum height
 *  gives phones the 360/200 shape. */
const GROWTH_ASPECT = 1166 / 280;
const GROWTH_MINIMUM_PLOT_HEIGHT = 200;

/** Live dashboard chart: new followers per week who still follow, the last
 *  12 weeks ending with the current partial week. Follower growth has no
 *  floor, so every week reads its exact count and draws its bar. */
export function StudioFollowerGrowthChart({
  weeks,
}: {
  weeks: StudioFollowerGrowthWeekView[];
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const buckets = useMemo<StudioBarBucket[]>(
    () =>
      weeks.map((week) => ({
        key: week.weekKey,
        date: week.weekStart,
        count: week.newFollowers,
        isCurrent: week.isCurrentWeek,
      })),
    [weeks],
  );
  const hasNoNewFollowers = buckets.every((bucket) => bucket.count === 0);

  const weekLabelOf = (bucket: StudioBarBucket) =>
    bucket.isCurrent
      ? t("studio:numbers.growth.thisWeek")
      : t("studio:numbers.growth.weekOf", {
          date: fmt.date(bucket.date, WEEK_DATE),
        });
  const axisLabelOf = (bucket: StudioBarBucket, index: number) =>
    bucket.isCurrent || (buckets.length - 1 - index) % AXIS_LABEL_STEP === 0
      ? fmt.date(bucket.date, WEEK_DATE)
      : undefined;

  return (
    <StudioBarChart
      buckets={buckets}
      floor={null}
      labels={{
        title: t("studio:numbers.growth.title"),
        subtitle: t("studio:numbers.growth.sub"),
        ariaLabel: t("studio:numbers.growth.ariaLabel"),
        tableCaption: t("studio:numbers.growth.tableCaption"),
        bucketColumn: t("studio:numbers.growth.weekColumn"),
        countColumn: t("studio:numbers.growth.countColumn"),
        showTable: t("studio:numbers.chart.showTable"),
        hideTable: t("studio:numbers.chart.hideTable"),
      }}
      bucketLabelOf={weekLabelOf}
      axisLabelOf={axisLabelOf}
      isLoading={false}
      aspect={GROWTH_ASPECT}
      minimumPlotHeight={GROWTH_MINIMUM_PLOT_HEIGHT}
      empty={hasNoNewFollowers ? t("studio:numbers.growth.empty") : false}
    />
  );
}
