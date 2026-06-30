import { FadeIn, SkeletonLine } from "../../shared/components/ui";
import { useCountUp } from "../../shared/hooks/useCountUp";
import { METRICS, type StatCard } from "./adminDashboard.data";
import styles from "./AdminDashboardPage.module.css";

export function AdminStatGrid({ loading = false }: { loading?: boolean }) {
  return (
    <div className={styles.statGrid}>
      {METRICS.map((m, i) => (
        <FadeIn key={m.label} delay={i * 70}>
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
  const {
    label,
    icon: Icon,
    value,
    comma,
    decimal,
    prefix,
    suffix,
    trend,
    foot,
  } = stat;
  const target = decimal ? Math.round(value * 10) : value;
  // Hold at the start value until the skeleton clears, then count up on reveal.
  const n = useCountUp(target, { active: !loading, durationMs: 1200 });
  const display = decimal
    ? (n / 10).toFixed(1)
    : comma
      ? n.toLocaleString("en-US")
      : String(n);

  return (
    <div className={styles.statCard}>
      <span className={styles.statLabel}>
        <Icon className={styles.statIcon} aria-hidden />
        {label}
      </span>
      {loading ? (
        <SkeletonLine height={30} width="68%" style={{ margin: "2px 0 4px" }} />
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
          {trend.label}
        </span>{" "}
        {foot}
      </span>
    </div>
  );
}
