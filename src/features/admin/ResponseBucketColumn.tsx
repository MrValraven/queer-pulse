import { useTranslation } from "../../shared/i18n/useTranslation";
import type { DistBucket } from "./adminDashboard.data";
import { roundedTopPath } from "./adminChartGeometry";
import { ColumnHitArea, type TooltipControls } from "./adminBarChartParts";
import styles from "./AdminBarCharts.module.css";

export interface ResponseTip {
  label: string;
  value: number;
  sharePercent: number;
  overSla: boolean;
}

interface ResponseBucketColumnProps {
  bucket: DistBucket;
  bucketIndex: number;
  gradientPrefix: string;
  slaHours: string;
  totalCount: number;
  x: number;
  barWidth: number;
  step: number;
  barTop: number;
  plotTop: number;
  plotBottom: number;
  labelY: number;
  activeIndex: number | null;
  tip: TooltipControls<ResponseTip>;
  onActiveChange: (columnIndex: number | null) => void;
}

export function ResponseBucketColumn(props: ResponseBucketColumnProps) {
  const { bucket, bucketIndex, x, barWidth, step, barTop, plotBottom } = props;
  const { t } = useTranslation();
  const centerX = x + barWidth / 2;
  const bandInset = (step - barWidth) / 2;
  const isActive = props.activeIndex === bucketIndex;
  const dimmedClass =
    props.activeIndex !== null && !isActive ? styles.dimmed : "";
  const sharePercent =
    props.totalCount > 0
      ? Math.round((bucket.value / props.totalCount) * 100)
      : 0;
  const slaText = bucket.overSla
    ? t("admin:dashboard.charts.legend.overSla", { hours: props.slaHours })
    : t("admin:dashboard.charts.legend.withinSla");
  const bandTop = props.plotTop - 8;
  const bandHeight = plotBottom - props.plotTop + 8;

  return (
    <g>
      <rect
        className={`${styles.hoverBand} ${isActive ? styles.hoverBandOn : ""}`}
        x={x - bandInset + 1}
        y={bandTop}
        width={step - 2}
        height={bandHeight}
        rx={10}
      />
      {bucket.value === 0 ? (
        <rect
          className={`${styles.zeroStub} ${dimmedClass}`}
          x={x}
          y={plotBottom - 3}
          width={barWidth}
          height={3}
          rx={1.5}
        />
      ) : (
        <g
          className={styles.barSegEnter}
          style={{ animationDelay: `${bucketIndex * 55}ms` }}
        >
          <path
            className={`${styles.stack} ${dimmedClass}`}
            d={roundedTopPath(x, barTop, barWidth, plotBottom - barTop, 7)}
            fill={`url(#${props.gradientPrefix}-${bucket.overSla ? "amber" : "jade"})`}
          />
        </g>
      )}
      {bucket.value > 0 && (
        <text
          x={centerX}
          y={barTop - 6}
          textAnchor="middle"
          className={`${styles.valueLabel} ${isActive ? styles.totalLabelActive : ""}`}
        >
          {bucket.value}
        </text>
      )}
      <text
        x={centerX}
        y={props.labelY}
        textAnchor="middle"
        className={isActive ? styles.axisWeekStrong : styles.axisWeek}
      >
        {bucket.label}
      </text>
      <ColumnHitArea<ResponseTip>
        columnIndex={bucketIndex}
        x={x - bandInset}
        y={bandTop}
        width={step}
        height={bandHeight}
        ariaLabel={`${bucket.label}: ${bucket.value} (${sharePercent}%) · ${slaText}`}
        datum={{
          label: bucket.label,
          value: bucket.value,
          sharePercent,
          overSla: bucket.overSla,
        }}
        tip={props.tip}
        onActiveChange={props.onActiveChange}
      />
    </g>
  );
}
