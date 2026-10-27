import { useId, useState } from "react";
import {
  CHART_INK,
  ResponsiveChart,
  bandScale,
  linearScale,
  wholeNumberTicks,
} from "../../shared/components/charts";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { DistBucket } from "./adminDashboard.data";
import { chartMax } from "./api/adminOverview.adapters";
import type { TooltipControls } from "./adminBarChartParts";
import { ResponseBucketColumn, type ResponseTip } from "./ResponseBucketColumn";
import { ResponseSlaMarker } from "./ResponseSlaMarker";
import styles from "./AdminBarCharts.module.css";

const PAD_LEFT = 36;
const PAD_RIGHT = 8;
const PAD_TOP = 40;
const PAD_BOTTOM = 30;
const SLA_HOURS = "6h";

interface ResponseTimePlotProps {
  buckets: DistBucket[];
  totalCount: number;
  tip: TooltipControls<ResponseTip>;
}

export function ResponseTimePlot({
  buckets,
  totalCount,
  tip,
}: ResponseTimePlotProps) {
  const { t } = useTranslation();
  const gradientPrefix = useId().replace(/[^a-zA-Z0-9]/g, "");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <ResponsiveChart aspect={360 / 230}>
      {(width, height) => {
        const plotBottom = height - PAD_BOTTOM;
        const valueScale = linearScale(
          chartMax(buckets.map((bucket) => bucket.value)),
          PAD_TOP,
          plotBottom,
        );
        const columnScale = bandScale(
          buckets.length,
          PAD_LEFT,
          width - PAD_RIGHT,
          0.36,
        );
        const gapHalf = (columnScale.step() - columnScale.bandwidth()) / 2;
        const slaIndex = buckets.findIndex((bucket) => bucket.overSla);
        const slaX =
          (columnScale(slaIndex) ?? 0) - (slaIndex > 0 ? gapHalf : 0);

        return (
          <svg
            viewBox={`0 0 ${width} ${height}`}
            width="100%"
            role="group"
            aria-label={t("admin:dashboard.charts.responseTime.ariaLabel")}
          >
            <defs>
              {(["jade", "amber"] as const).map((tone) => (
                <linearGradient
                  key={tone}
                  id={`${gradientPrefix}-${tone}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={`var(--${tone})`} />
                  <stop
                    offset="100%"
                    stopColor={`var(--${tone})`}
                    stopOpacity={0.62}
                  />
                </linearGradient>
              ))}
            </defs>
            {wholeNumberTicks(valueScale, 3).map((tick) => (
              <g key={tick}>
                <line
                  x1={PAD_LEFT}
                  x2={width - PAD_RIGHT}
                  y1={valueScale(tick)}
                  y2={valueScale(tick)}
                  stroke={CHART_INK.grid}
                  strokeDasharray={tick === 0 ? undefined : "2 5"}
                />
                <text
                  x={PAD_LEFT - 9}
                  y={valueScale(tick) + 4}
                  textAnchor="end"
                  className={styles.axisValue}
                >
                  {tick}
                </text>
              </g>
            ))}
            {buckets.map((bucket, bucketIndex) => (
              <ResponseBucketColumn
                key={bucket.label}
                bucket={bucket}
                bucketIndex={bucketIndex}
                gradientPrefix={gradientPrefix}
                slaHours={SLA_HOURS}
                totalCount={totalCount}
                x={columnScale(bucketIndex) ?? 0}
                barWidth={columnScale.bandwidth()}
                step={columnScale.step()}
                barTop={valueScale(bucket.value)}
                plotTop={PAD_TOP}
                plotBottom={plotBottom}
                labelY={height - 10}
                activeIndex={activeIndex}
                tip={tip}
                onActiveChange={setActiveIndex}
              />
            ))}
            {slaIndex >= 0 && (
              <ResponseSlaMarker
                label={t("admin:dashboard.charts.responseTime.slaLabel", {
                  hours: SLA_HOURS,
                })}
                lineX={slaX}
                plotBottom={plotBottom}
                minX={PAD_LEFT}
                maxX={width - PAD_RIGHT}
              />
            )}
          </svg>
        );
      }}
    </ResponsiveChart>
  );
}
