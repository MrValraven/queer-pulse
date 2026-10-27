import { useState } from "react";
import { ChartFrame, useChartTooltip } from "../../shared/components/charts";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { WeekBar } from "./adminDashboard.data";
import { ChartTooltip } from "./AdminDashboardChartParts";
import {
  ReportsByTypeLegend,
  type ReportSeriesItem,
} from "./ReportsByTypeLegend";
import { ReportsByTypePlot } from "./ReportsByTypePlot";
import type { ReportTip } from "./reportsByTypeTypes";
import chartStyles from "../../shared/components/charts/charts.module.css";
import styles from "./AdminBarCharts.module.css";

interface ReportsByTypeChartProps {
  weeks: WeekBar[];
  series: readonly ReportSeriesItem[];
  /** Plot width / height; defaults to the wide dashboard shape. */
  aspect?: number;
  loading?: boolean;
}

export function ReportsByTypeChart({
  weeks,
  series,
  aspect = 640 / 240,
  loading = false,
}: ReportsByTypeChartProps) {
  const { t } = useTranslation();
  const tip = useChartTooltip<ReportTip>();
  const { showTooltip, hideTooltip } = tip;
  const [hiddenIds, setHiddenIds] = useState<ReadonlySet<string>>(new Set());

  const toggleSeries = (seriesId: string) =>
    setHiddenIds((previous) => {
      const next = new Set(previous);
      if (next.has(seriesId)) next.delete(seriesId);
      else next.add(seriesId);
      return next;
    });

  return (
    <ChartFrame
      title={t("admin:dashboard.charts.reportsByType.title")}
      subtitle={t("admin:dashboard.charts.reportsByType.sub")}
      legend={
        <ReportsByTypeLegend
          series={series}
          hiddenIds={hiddenIds}
          onToggle={toggleSeries}
        />
      }
      loading={loading}
    >
      {/* eslint-disable-next-line react-hooks/refs -- tip.containerRef is visx's callback ref (useTooltipInPortal); this ATTACHES it via the ref attribute and never reads ref.current during render. */}
      <div ref={tip.containerRef} className={chartStyles.plot}>
        <ReportsByTypePlot
          weeks={weeks}
          series={series}
          hiddenIds={hiddenIds}
          aspect={aspect}
          tip={{ showTooltip, hideTooltip }}
        />
        {/* eslint-disable-next-line react-hooks/refs -- passing the memoized visx tooltip bundle (which holds the callback ref) to ChartTooltip, which renders it through a portal; not a during-render ref.current read. */}
        <ChartTooltip tip={tip}>
          {(data) => (
            <>
              <div className={chartStyles.tipStrong}>{data.weekLabel}</div>
              {data.rows.map((row) => (
                <div key={row.id} className={styles.tipRow}>
                  <span
                    className={styles.tipDot}
                    style={{ background: row.color }}
                  />
                  <span className={styles.tipRowLabel}>{row.label}</span>
                  <span className={styles.tipRowValue}>{row.value}</span>
                </div>
              ))}
              <div className={`${styles.tipRow} ${styles.tipTotal}`}>
                <span className={styles.tipRowLabel}>
                  {t("admin:dashboard.charts.reportsByType.total")}
                </span>
                <span className={styles.tipRowValue}>{data.total}</span>
              </div>
            </>
          )}
        </ChartTooltip>
      </div>
    </ChartFrame>
  );
}
