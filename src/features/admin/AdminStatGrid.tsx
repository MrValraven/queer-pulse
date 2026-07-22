import { FadeIn, SkeletonLine } from "../../shared/components/ui";
import { useCountUp } from "../../shared/hooks/useCountUp";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import type { StatCard } from "./adminDashboard.data";
import styles from "./AdminDashboardPage.module.css";

/** Decorative direction glyph — a symbol, not language content. */
const TREND_ARROW: Record<StatCard["trend"]["dir"], string> = {
  up: "▲",
  down: "▼",
  warn: "",
};

export function AdminStatGrid({
  metrics,
  loading = false,
}: {
  metrics: StatCard[];
  loading?: boolean;
}) {
  return (
    <div className={styles.statGrid}>
      {metrics.map((m, i) => (
        <FadeIn key={m.labelKey} delay={i * 70}>
          <AdminStatCard stat={m} loading={loading} />
        </FadeIn>
      ))}
    </div>
  );
}

function AdminStatCard({
  stat,
  loading,
}: {
  stat: StatCard;
  loading: boolean;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const {
    labelKey,
    icon: Icon,
    value,
    comma,
    decimal,
    prefix,
    suffix,
    trend,
    footKey,
    footValues,
    notMeasured,
  } = stat;
  const target = decimal ? Math.round(value * 10) : value;
  // Hold at the start value until the skeleton clears, then count up on
  // reveal — an un-backed metric has nothing to count up to, so it never
  // animates in the first place.
  const n = useCountUp(target, {
    active: !loading && !notMeasured,
    durationMs: 1200,
  });
  const display = decimal
    ? (n / 10).toFixed(1)
    : comma
      ? fmt.number(n)
      : String(n);

  return (
    <div className={styles.statCard}>
      <span className={styles.statLabel}>
        <Icon className={styles.statIcon} aria-hidden />
        {t(labelKey)}
      </span>
      {loading ? (
        <SkeletonLine height={30} width="68%" style={{ margin: "2px 0 4px" }} />
      ) : notMeasured ? (
        <span className={styles.statNumMuted}>
          {t("admin:dashboard.notMeasuredYet")}
        </span>
      ) : (
        <span className={styles.statNum}>
          {prefix}
          {display}
          {suffix && <small>{suffix}</small>}
        </span>
      )}
      <span className={styles.statFoot}>
        <span
          className={[styles.trend, styles[`trend_${trend.dir}`]].join(" ")}
        >
          {TREND_ARROW[trend.dir]} {t(trend.key, trend.values)}
        </span>{" "}
        {t(footKey, footValues)}
      </span>
    </div>
  );
}
