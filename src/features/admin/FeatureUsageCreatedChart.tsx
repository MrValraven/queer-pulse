import { useMemo } from "react";
import { ParentSize } from "@visx/responsive";
import { ChartFrame, useChartTooltip } from "../../shared/components/charts";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { ChartTooltip } from "./AdminDashboardChartParts";
import { DetailPlotArea } from "./FeatureUsageDetailChartParts";
import { FeatureUsageCreatedPlot } from "./FeatureUsageCreatedPlot";
import {
  buildCreatedDays,
  type CreatedDay,
} from "./featureUsageDetail.helpers";
import {
  formatDayRange,
  type FeatureUsageRangeSelection,
  type FeatureUsageWindow,
} from "./featureUsageRange";
import { useAdminFeatureUsageDetail } from "./api/useAdminFeatureUsageDetail";
import {
  featureUsageErrorKey,
  type FeatureUsageErrorCode,
} from "./api/featureUsageErrorCode";
import type { ClassifiedFeature } from "./api/adminFeatureUsage.api";
import chartStyles from "../../shared/components/charts/charts.module.css";
import { CREATED_CHART_HEIGHT } from "./adminChartAxis.helpers";
import styles from "./FeatureUsageDetailPanel.module.css";

/**
 * What members created per day over the selected range, fetched lazily the
 * first time a row opens (the panel only mounts this for a feature that has
 * depth, so a reach-only feature never asks). The plot has a fixed height,
 * the same as its loading skeleton, so the open panel holds still while the
 * series loads. While the table above still shows the previous range
 * (`isStale`), the chart holds that skeleton too, so the subtitle and the
 * series always describe the same range. A failure names its cause through
 * `featureUsageErrorKey`: a fetch waiting on a connection reads as the
 * network, and a response without a series as an unknown feature.
 */
export function FeatureUsageCreatedChart({
  feature,
  featureName,
  window,
  selection,
  isStale,
}: {
  feature: ClassifiedFeature;
  featureName: string;
  window: FeatureUsageWindow;
  selection: FeatureUsageRangeSelection;
  isStale: boolean;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const tip = useChartTooltip<CreatedDay>();
  const { createdDaily, rangeStart, isPending, isPaused, isError, errorCode } =
    useAdminFeatureUsageDetail(feature.featureKey, selection, {
      isEnabled: true,
    });
  // Days are labelled from the range the response itself covers, so the
  // labels move with the series the moment a new range lands, even while
  // the table above still shows the previous range.
  const labelRangeStart = rangeStart ?? window.rangeStart;
  const days = useMemo(
    () =>
      createdDaily
        ? buildCreatedDays(createdDaily, labelRangeStart, fmt, t)
        : [],
    [createdDaily, labelRangeStart, fmt, t],
  );
  // A first fetch held back by a lost connection never settles on its own,
  // so it reads as the network. A loaded response without a series means
  // the backend no longer counts rows for this key, which reads as the
  // feature missing from the list.
  const failureCode: FeatureUsageErrorCode | null = isError
    ? (errorCode ?? "unknown")
    : isPending
      ? isPaused
        ? "network"
        : null
      : createdDaily === null
        ? "unknownFeature"
        : null;
  const isWaiting = failureCode === null && (isPending || isStale);

  return (
    <ChartFrame
      title={t("admin:featureUsage.detail.created.title")}
      subtitle={t("admin:featureUsage.detail.created.subtitle", {
        current: formatDayRange(window.rangeStart, window.rangeEnd, fmt, t),
      })}
      loading={isWaiting}
      skeletonHeight={CREATED_CHART_HEIGHT}
      empty={
        failureCode ? (
          <span className={styles.createdEmpty}>
            {t("admin:featureUsage.detail.created.loadError", {
              reason: t(featureUsageErrorKey(failureCode)),
            })}
          </span>
        ) : (
          false
        )
      }
    >
      {/* eslint-disable-next-line react-hooks/refs -- tip.containerRef is visx's callback ref (useTooltipInPortal); this ATTACHES it via the ref attribute and never reads ref.current during render. */}
      <div ref={tip.containerRef} className={chartStyles.plot}>
        {/* eslint-disable-next-line react-hooks/refs -- passing the memoized visx tooltip bundle (which holds the callback ref) so the plot area can close the reading on an outside press; it never reads ref.current during render. */}
        <DetailPlotArea tip={tip}>
          <ParentSize
            parentSizeStyles={{
              position: "relative",
              width: "100%",
              height: CREATED_CHART_HEIGHT,
            }}
          >
            {({ width }) =>
              width > 0 ? (
                <FeatureUsageCreatedPlot
                  // A new range remounts the plot, so the line draws in again.
                  key={`${labelRangeStart}:${days.length}`}
                  days={days}
                  width={width}
                  tip={tip}
                  ariaLabel={t("admin:featureUsage.detail.created.ariaLabel", {
                    feature: featureName,
                  })}
                />
              ) : null
            }
          </ParentSize>
        </DetailPlotArea>
        {/* eslint-disable-next-line react-hooks/refs -- passing the memoized visx tooltip bundle (which holds the callback ref) to ChartTooltip, which renders it through a portal; not a during-render ref.current read. */}
        <ChartTooltip tip={tip}>
          {(data) => (
            <>
              <div className={chartStyles.tipStrong}>{data.dayLabel}</div>
              {data.createdLabel}
            </>
          )}
        </ChartTooltip>
      </div>
    </ChartFrame>
  );
}
