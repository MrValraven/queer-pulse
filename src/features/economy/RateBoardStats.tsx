import { euro } from "./economy.data";
import { RB_DISCLAIMER, type RateEntry } from "./rateBoard.data";
import styles from "./RateBoardPage.module.css";

/* ── pure helpers ───────────────────────────────────────────────────────── */

/** Median of a numeric list (0 for empty). */
export function median(nums: number[]): number {
  if (nums.length === 0) return 0;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1]! + sorted[mid]!) / 2
    : sorted[mid]!;
}

export function min(nums: number[]): number {
  return nums.length ? Math.min(...nums) : 0;
}

export function max(nums: number[]): number {
  return nums.length ? Math.max(...nums) : 0;
}

/** Percentile rank (0–100) of `value` within `nums` — share at or below it. */
export function percentile(nums: number[], value: number): number {
  if (nums.length === 0) return 0;
  const atOrBelow = nums.filter((n) => n <= value).length;
  return Math.round((atOrBelow / nums.length) * 100);
}

interface RoleStat {
  role: string;
  count: number;
  med: number;
  lo: number;
  hi: number;
}

function groupByRole(entries: RateEntry[]): RoleStat[] {
  const byRole = new Map<string, number[]>();
  for (const e of entries) {
    const list = byRole.get(e.role) ?? [];
    list.push(e.dayRate);
    byRole.set(e.role, list);
  }
  return [...byRole.entries()]
    .map(([role, rates]) => ({
      role,
      count: rates.length,
      med: median(rates),
      lo: min(rates),
      hi: max(rates),
    }))
    .sort((a, b) => b.med - a.med);
}

/* ── presentation ───────────────────────────────────────────────────────── */

interface RateBoardStatsProps {
  entries: RateEntry[];
  /** The user's own rate to compare, if entered (>0). */
  compareRate: number;
}

export function RateBoardStats({ entries, compareRate }: RateBoardStatsProps) {
  const allRates = entries.map((e) => e.dayRate);
  const overallMedian = median(allRates);
  const roleStats = groupByRole(entries);
  const peakMedian = max(roleStats.map((r) => r.med)) || 1;
  const showCompare = compareRate > 0 && entries.length > 0;
  const pct = showCompare ? percentile(allRates, compareRate) : 0;

  if (entries.length === 0) {
    return (
      <div className={styles.statsEmpty}>
        <h3 className={styles.emptyTitle}>
          Nothing here <em>yet.</em>
        </h3>
        <p className={styles.emptyBody}>
          Be the first to add a rate, or import a JSON file someone shared with
          you. The distribution shows up here as soon as there's data.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.stats}>
      <div className={styles.overall}>
        <span className={styles.overallLabel}>Community median day rate</span>
        <span className={styles.overallVal}>{euro(overallMedian)}</span>
        <span className={styles.overallMeta}>
          across {entries.length} {entries.length === 1 ? "rate" : "rates"} ·{" "}
          {roleStats.length} {roleStats.length === 1 ? "role" : "roles"}
        </span>
      </div>

      {showCompare && (
        <div className={styles.percentile}>
          <span className={styles.pctLabel}>
            Your rate of {euro(compareRate)} sits at the
          </span>
          <span className={styles.pctVal}>{pct}th percentile</span>
          <span className={styles.pctMeta}>
            {pct >= 50
              ? `Above ${pct}% of rates shared here.`
              : `Below most rates here — you may be leaving money on the table.`}
          </span>
        </div>
      )}

      <ul className={styles.bars}>
        {roleStats.map((r) => {
          const width = Math.max(8, Math.round((r.med / peakMedian) * 100));
          return (
            <li key={r.role} className={styles.barRow}>
              <div className={styles.barTop}>
                <span className={styles.barRole}>{r.role}</span>
                <span className={styles.barMed}>{euro(r.med)}</span>
              </div>
              <div className={styles.barTrack}>
                <div
                  className={styles.barFill}
                  style={{ width: `${width}%` }}
                />
              </div>
              <div className={styles.barMeta}>
                <span>
                  {r.count} {r.count === 1 ? "rate" : "rates"}
                </span>
                <span>
                  {euro(r.lo)} – {euro(r.hi)}
                </span>
              </div>
            </li>
          );
        })}
      </ul>

      <p className={styles.disclaimer}>{RB_DISCLAIMER}</p>
    </div>
  );
}
