import { useMemo } from "react";
import {
  ChartFrame,
  ChartLegend,
  ResponsiveChart,
  useChartTooltip,
} from "../../shared/components/charts";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { ChartTooltip } from "./AdminDashboardChartParts";
import { DetailPlotArea } from "./FeatureUsageDetailChartParts";
import { FeatureUsageReachPlot } from "./FeatureUsageReachPlot";
import { buildReachDays, type ReachDayTip } from "./featureUsageDetail.helpers";
import { formatDayRange, type FeatureUsageWindow } from "./featureUsageRange";
import type { ClassifiedFeature } from "./api/adminFeatureUsage.api";
import chartStyles from "../../shared/components/charts/charts.module.css";
import styles from "./FeatureUsageDetailPanel.module.css";

/**
 * Reach per day over the selected range as accent bars, with the previous
 * period drawn as a dashed line over the same columns (day 1 against day 1).
 * Hovering or dragging anywhere over the plot reads the nearest day, so even
 * a 365-day range with hairline bars stays readable. The bars share one tab
 * stop (a roving tabindex): Tab lands on the newest day, the arrow keys step
 * through the days and Home and End jump to either end.
 */
export function FeatureUsageReachChart({
  feature,
  featureName,
  window,
}: {
  feature: ClassifiedFeature;
  featureName: string;
  window: FeatureUsageWindow;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const tip = useChartTooltip<ReachDayTip>();
  const days = useMemo(
    () =>
      buildReachDays(
        feature.reachDaily,
        feature.reachPreviousDaily,
        window,
        fmt,
        t,
      ),
    [feature.reachDaily, feature.reachPreviousDaily, window, fmt, t],
  );

  return (
    <ChartFrame
      title={t("admin:featureUsage.detail.reach.title")}
      subtitle={t("admin:featureUsage.detail.reach.subtitle", {
        current: formatDayRange(window.rangeStart, window.rangeEnd, fmt, t),
        previous: formatDayRange(
          window.previousRangeStart,
          window.previousRangeEnd,
          fmt,
          t,
        ),
      })}
      legend={
        <ChartLegend
          items={[
            {
              color: "var(--accent)",
              label: t("admin:featureUsage.detail.legend.current"),
            },
            {
              color: "var(--ink-40)",
              label: t("admin:featureUsage.detail.legend.previous"),
              dashed: true,
            },
          ]}
        />
      }
    >
      {/* eslint-disable-next-line react-hooks/refs -- tip.containerRef is visx's callback ref (useTooltipInPortal); this ATTACHES it via the ref attribute and never reads ref.current during render. */}
      <div ref={tip.containerRef} className={chartStyles.plot}>
        {/* eslint-disable-next-line react-hooks/refs -- passing the memoized visx tooltip bundle (which holds the callback ref) so the plot area can close the reading on an outside press; it never reads ref.current during render. */}
        <DetailPlotArea tip={tip}>
          <ResponsiveChart aspect={640 / 220} minHeight={160}>
            {(width, height) => (
              <FeatureUsageReachPlot
                // A new range remounts the plot, so the bars grow in again.
                key={`${window.rangeStart}:${days.length}`}
                days={days}
                width={width}
                height={height}
                tip={tip}
                ariaLabel={t("admin:featureUsage.detail.reach.ariaLabel", {
                  feature: featureName,
                })}
              />
            )}
          </ResponsiveChart>
        </DetailPlotArea>
        {/* eslint-disable-next-line react-hooks/refs -- passing the memoized visx tooltip bundle (which holds the callback ref) to ChartTooltip, which renders it through a portal; not a during-render ref.current read. */}
        <ChartTooltip tip={tip}>
          {(data) => (
            <>
              <div className={chartStyles.tipStrong}>{data.dayLabel}</div>
              {data.currentLabel}
              <div className={styles.tipLine}>{data.previousLine}</div>
            </>
          )}
        </ChartTooltip>
      </div>
    </ChartFrame>
  );
}
