import {
  ChartFrame,
  ChartLegend,
  useChartTooltip,
} from "../../shared/components/charts";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { DistBucket } from "./adminDashboard.data";
import { ChartTooltip } from "./AdminDashboardChartParts";
import { ResponseSlaSummary } from "./ResponseSlaSummary";
import { ResponseTimePlot } from "./ResponseTimePlot";
import type { ResponseTip } from "./ResponseBucketColumn";
import chartStyles from "../../shared/components/charts/charts.module.css";
import styles from "./AdminBarCharts.module.css";

const SLA_HOURS = "6h";

interface ResponseTimeChartProps {
  buckets: DistBucket[] | null;
  loading?: boolean;
}

export function ResponseTimeChart({
  buckets,
  loading = false,
}: ResponseTimeChartProps) {
  const { t } = useTranslation();
  const tip = useChartTooltip<ResponseTip>();
  const { showTooltip, hideTooltip } = tip;
  const totalCount = (buckets ?? []).reduce(
    (sum, bucket) => sum + bucket.value,
    0,
  );
  const withinCount = (buckets ?? []).reduce(
    (sum, bucket) => (bucket.overSla ? sum : sum + bucket.value),
    0,
  );

  return (
    <ChartFrame
      title={t("admin:dashboard.charts.responseTime.title")}
      subtitle={t("admin:dashboard.charts.responseTime.sub")}
      loading={loading}
      skeletonHeight={180}
      empty={buckets === null ? t("admin:dashboard.notMeasuredYet") : false}
    >
      {buckets !== null && (
        <ResponseSlaSummary
          withinCount={withinCount}
          totalCount={totalCount}
          slaHours={SLA_HOURS}
        />
      )}
      {/* eslint-disable-next-line react-hooks/refs -- tip.containerRef is visx's callback ref (useTooltipInPortal); this ATTACHES it via the ref attribute and never reads ref.current during render. */}
      <div ref={tip.containerRef} className={chartStyles.plot}>
        {buckets !== null && (
          <ResponseTimePlot
            buckets={buckets}
            totalCount={totalCount}
            tip={{ showTooltip, hideTooltip }}
          />
        )}
        {/* eslint-disable-next-line react-hooks/refs -- passing the memoized visx tooltip bundle (which holds the callback ref) to ChartTooltip, which renders it through a portal; not a during-render ref.current read. */}
        <ChartTooltip tip={tip}>
          {(data) => (
            <>
              <div className={chartStyles.tipStrong}>{data.label}</div>
              <div className={styles.tipRow}>
                <span
                  className={styles.tipDot}
                  style={{
                    background: data.overSla ? "var(--amber)" : "var(--jade)",
                  }}
                />
                <span className={styles.tipRowLabel}>
                  {data.overSla
                    ? t("admin:dashboard.charts.legend.overSla", {
                        hours: SLA_HOURS,
                      })
                    : t("admin:dashboard.charts.legend.withinSla")}
                </span>
              </div>
              <div className={styles.tipRow}>
                <span className={styles.tipRowLabel}>
                  {t("admin:dashboard.charts.responseTime.tipCount", {
                    count: data.value,
                    percent: data.sharePercent,
                  })}
                </span>
              </div>
            </>
          )}
        </ChartTooltip>
      </div>
      {buckets !== null && (
        <ChartLegend
          items={[
            {
              color: "var(--jade)",
              label: t("admin:dashboard.charts.legend.withinSla"),
            },
            {
              color: "var(--amber)",
              label: t("admin:dashboard.charts.legend.overSla", {
                hours: SLA_HOURS,
              }),
            },
          ]}
        />
      )}
    </ChartFrame>
  );
}
