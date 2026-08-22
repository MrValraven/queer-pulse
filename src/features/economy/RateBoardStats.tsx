import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import { RB_DISCLAIMER_KEY, type RateEntry } from "./rateBoard.data";
import { median, min, max, percentile } from "./rateBoardStats.helpers";
import styles from "./RateBoardPage.module.css";

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
  const { t } = useTranslation();
  const fmt = useFormat();
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
          <Translation
            i18nKey="economy:rateBoard.stats.emptyTitle"
            components={{ em: <em /> }}
          />
        </h3>
        <p className={styles.emptyBody}>
          {t("economy:rateBoard.stats.emptyBody")}
        </p>
      </div>
    );
  }

  return (
    <div className={styles.stats}>
      <div className={styles.overall}>
        {/* `entries` is the on-device store, so this median describes the rates
            on this board alone. The catalog string was reworded to match;
            the key name is kept so nothing else has to move. */}
        <span className={styles.overallLabel}>
          {t("economy:rateBoard.stats.communityMedian")}
        </span>
        <span className={styles.overallVal}>{fmt.currency(overallMedian)}</span>
        <span className={styles.overallMeta}>
          {t("economy:rateBoard.stats.across")}{" "}
          {t("economy:rateBoard.stats.rateCount", { count: entries.length })} ·{" "}
          {t("economy:rateBoard.stats.roleCount", { count: roleStats.length })}
        </span>
      </div>

      {showCompare && (
        <div className={styles.percentile}>
          <span className={styles.pctLabel}>
            {t("economy:rateBoard.stats.yourRateSits", {
              rate: fmt.currency(compareRate),
            })}
          </span>
          <span className={styles.pctVal}>
            {t("economy:rateBoard.stats.percentileValue", { percentile: pct })}
          </span>
          <span className={styles.pctMeta}>
            {pct >= 50
              ? t("economy:rateBoard.stats.aboveMost", { percent: pct })
              : t("economy:rateBoard.stats.belowMost")}
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
                <span className={styles.barMed}>{fmt.currency(r.med)}</span>
              </div>
              <div className={styles.barTrack}>
                <div
                  className={styles.barFill}
                  style={{ transform: `scaleX(${width / 100})` }}
                />
              </div>
              <div className={styles.barMeta}>
                <span>
                  {t("economy:rateBoard.stats.rateCount", { count: r.count })}
                </span>
                <span>
                  {fmt.currency(r.lo)} – {fmt.currency(r.hi)}
                </span>
              </div>
            </li>
          );
        })}
      </ul>

      <p className={styles.disclaimer}>{t(RB_DISCLAIMER_KEY)}</p>
    </div>
  );
}
