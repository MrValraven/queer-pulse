import type { IconType } from "react-icons";
import { FiTrendingDown, FiTrendingUp } from "react-icons/fi";
import {
  FadeIn,
  SkeletonLine,
  StatGrid,
  StatTile,
} from "../../shared/components/ui";
import { RollingNumber } from "../../shared/components/ui/RollingNumber";
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
    unit,
    trend,
    footKey,
    footValues,
    notMeasured,
    to,
  } = stat;
  // Whole numbers, or tenths for a one-decimal tile.
  const target = decimal ? Math.round(value * 10) : Math.round(value);
  // `Intl` owns the unit mark and the space (if any) in front of it, so the
  // tile reads "3.2 hr" in en and "3,2 h" in pt without a catalog key. It is
  // asked about the tile's real value rather than the rolling figure, so a
  // plural-sensitive mark settles on the form the finished number needs.
  const unitSuffix = unit ? fmt.unitSuffix(value, unit) : "";
  const formatFigure = (figure: number) =>
    decimal
      ? (figure / 10).toFixed(1)
      : comma
        ? fmt.number(figure)
        : String(figure);
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
          // Mounts once the skeleton clears and rolls up from zero; an
          // un-backed metric shows its placeholder, so it never rolls.
          <span className={styles.statNum}>
            {prefix}
            <RollingNumber
              value={formatFigure(target)}
              numericValue={target}
              revealFrom={{ value: formatFigure(0), numericValue: 0 }}
            />
            {unitSuffix && <small>{unitSuffix}</small>}
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
