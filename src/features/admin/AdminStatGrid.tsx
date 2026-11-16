import { RollingNumber } from "../../shared/components/ui/RollingNumber";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { AdminStat, AdminStatTiles, type AdminStatDelta } from "./ui";
import type { StatCard } from "./adminDashboard.data";
import styles from "./AdminStatGrid.module.css";

/** The kit's delta tones carry the direction icon and its colour. A `warn`
 *  trend asks for a look (oldest report waiting, over the SLA, a quiet
 *  feature), so it takes the coral warn tone; a metric with nothing recorded
 *  yet stays neutral. */
const DELTA_TONE: Record<StatCard["trend"]["dir"], AdminStatDelta["tone"]> = {
  up: "up",
  down: "down",
  warn: "warn",
};
const NO_DATA_TREND_KEY = "admin:dashboard.metrics.trendNoData";

/**
 * Headline stat tiles on the kit's `AdminStatTiles`. The Overview and Feature
 * usage both render it from `StatCard` rows, so the props stay as they were.
 */
export function AdminStatGrid({
  metrics,
  loading = false,
  label,
}: {
  metrics: StatCard[];
  loading?: boolean;
  /** Names the tile list for assistive tech. */
  label?: string;
}) {
  return (
    <div className={styles.statTiles}>
      <AdminStatTiles columns={4} label={label}>
        {metrics.map((metric) => (
          <AdminStatGridTile
            key={metric.labelKey}
            stat={metric}
            loading={loading}
          />
        ))}
      </AdminStatTiles>
    </div>
  );
}

function AdminStatGridTile({
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
    icon,
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
  // asked about the tile's real value and leaves the rolling figure alone, so
  // a plural-sensitive mark settles on the form the finished number needs.
  const unitSuffix = unit ? fmt.unitSuffix(value, unit) : "";
  const formatFigure = (figure: number) =>
    decimal
      ? (figure / 10).toFixed(1)
      : comma
        ? fmt.number(figure)
        : String(figure);

  const figure = notMeasured ? (
    // An un-backed metric shows its placeholder in muted italic, so it never
    // reads as a measured zero and never rolls.
    <span className={styles.notMeasured}>
      {t("admin:dashboard.notMeasuredYet")}
    </span>
  ) : (
    // Mounts once the skeleton clears and rolls up from zero.
    <span className={styles.figure}>
      {prefix}
      <RollingNumber
        value={formatFigure(target)}
        numericValue={target}
        revealFrom={{ value: formatFigure(0), numericValue: 0 }}
      />
      {unitSuffix && <small className={styles.unit}>{unitSuffix}</small>}
    </span>
  );

  const delta: AdminStatDelta = {
    text: t(trend.key, trend.values),
    tone: trend.key === NO_DATA_TREND_KEY ? "flat" : DELTA_TONE[trend.dir],
  };
  const statProps = {
    icon,
    label: t(labelKey),
    value: figure,
    isLoading: loading,
    delta,
    hint: t(footKey, footValues),
  };

  // A tile with a detail view links to it; the kit stretches the label link
  // over the whole tile.
  return to ? (
    <AdminStat {...statProps} to={to} />
  ) : (
    <AdminStat {...statProps} />
  );
}
