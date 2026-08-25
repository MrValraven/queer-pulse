import type { IconType } from "react-icons";
import { FiTrendingDown, FiTrendingUp } from "react-icons/fi";
import {
  FadeIn,
  SkeletonLine,
  StatGrid,
  StatTile,
} from "../../shared/components/ui";
import { useCountUp } from "../../shared/hooks/useCountUp";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import type { StatCard } from "./adminDashboard.data";
import styles from "./AdminDashboardPage.module.css";

/** Decorative direction icon — a symbol, not language content. */
const TREND_ICON: Record<StatCard["trend"]["dir"], IconType | null> = {
  up: FiTrendingUp,
  down: FiTrendingDown,
  warn: null,
};

export function AdminStatGrid({
  metrics,
  loading = false,
}: {
  metrics: StatCard[];
  loading?: boolean;
}) {
  return (
    <StatGrid columns={4} className={styles.statGrid}>
      {metrics.map((metric, index) => (
        <FadeIn key={metric.labelKey} delay={index * 70}>
          <AdminStatCard stat={metric} loading={loading} />
        </FadeIn>
      ))}
    </StatGrid>
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
    to,
  } = stat;
  const target = decimal ? Math.round(value * 10) : value;
  // Hold at the start value until the skeleton clears, then count up on
  // reveal — an un-backed metric has nothing to count up to, so it never
  // animates in the first place.
  const countValue = useCountUp(target, {
    active: !loading && !notMeasured,
    durationMs: 1200,
  });
  const display = decimal
    ? (countValue / 10).toFixed(1)
    : comma
      ? fmt.number(countValue)
      : String(countValue);
  const TrendIcon = TREND_ICON[trend.dir];

  return (
    <StatTile
      to={to}
      label={
        <span className={styles.statLabel}>
          <Icon className={styles.statIcon} aria-hidden />
          {t(labelKey)}
        </span>
      }
      value={
        loading ? (
          <SkeletonLine
            height={30}
            width="68%"
            style={{ margin: "2px 0 4px" }}
          />
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
        )
      }
      hint={
        <span className={styles.statFoot}>
          <span
            className={[styles.trend, styles[`trend_${trend.dir}`]].join(" ")}
          >
            {TrendIcon && <TrendIcon aria-hidden />}{" "}
            {t(trend.key, trend.values)}
          </span>{" "}
          {t(footKey, footValues)}
        </span>
      }
    />
  );
}
