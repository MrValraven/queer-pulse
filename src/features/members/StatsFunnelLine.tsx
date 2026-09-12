import { FiArrowRight } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./StatsFunnelLine.module.css";

export interface StatsFunnelLineProps {
  hellos: number;
  replies: number;
  windowDays: number;
  /** Merged onto the root `<p>`, so a caller (the Now section today, the
   *  profile board section soon) can adjust spacing for where it sits without
   *  this component knowing anything about its surroundings. */
  className?: string;
}

/**
 * A two-step funnel line: how many hellos came in, how many were answered,
 * over what window. Started life as the Now card's owner-only figures line
 * (`NowStatsLine`); moved to the `members/` level (spec amendment,
 * 2026-09-12) because the profile's board section reuses it for its own
 * responses funnel. It knows nothing about where its counts came from.
 *
 * Reads as "7 hellos -> 6 replies . 90 days": a bold count and a light label
 * per figure, a `FiArrowRight` carrying the funnel's direction between them
 * (decorative: the word order already says the same thing, so it is
 * `aria-hidden`), then a middle dot and the window.
 *
 * Zero hellos renders nothing rather than a row of zeroes. A quiet profile
 * with no hellos yet has nothing actionable to tell its owner here, and a
 * "0 hellos -> 0 replies" line reads as a scoreboard the member is losing.
 */
export function StatsFunnelLine({
  hellos,
  replies,
  windowDays,
  className,
}: StatsFunnelLineProps) {
  const { t } = useTranslation();
  if (hellos === 0) return null;
  return (
    <p className={[styles.line, className].filter(Boolean).join(" ")}>
      <span className={styles.figure}>
        <strong className={styles.count}>{hellos}</strong>
        <span className={styles.label}>
          {t("members:content.now.stats.hellos", { count: hellos })}
        </span>
      </span>
      <FiArrowRight aria-hidden className={styles.arrow} />
      <span className={styles.figure}>
        <strong className={styles.count}>{replies}</strong>
        <span className={styles.label}>
          {t("members:content.now.stats.replies", { count: replies })}
        </span>
      </span>
      <span className={styles.dot} aria-hidden>
        &middot;
      </span>
      <span className={styles.window}>
        {t("members:content.now.stats.window", { days: windowDays })}
      </span>
    </p>
  );
}
