import { FiCheck } from "react-icons/fi";
import { euro } from "./economy.data";
import { estimateTakeHome, type TaxYear } from "./tax.calc";
import {
  SIMPLIFIED_COEFFICIENTS,
  SS_RATE_ENI,
  SS_RATE_FREELANCER,
  TAX_DISCLAIMER,
} from "./tax.constants";
import type { ActivityKey, StartupYear, WorkerStatus } from "./takeHome.data";
import styles from "./TakeHomeCalculatorPage.module.css";

export interface TakeHomeResultProps {
  gross: string;
  activity: ActivityKey;
  year: TaxYear;
  startupYear: StartupYear;
  status: WorkerStatus;
}

const safeNumber = (raw: string): number => {
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) && n > 0 ? n : 0;
};

/** Live breakdown card: gross → −SS → taxable → −IRS → net (annual + monthly). */
export function TakeHomeResult({
  gross,
  activity,
  year,
  startupYear,
  status,
}: TakeHomeResultProps) {
  const grossNum = safeNumber(gross);
  const ssRate = status === "eni" ? SS_RATE_ENI : SS_RATE_FREELANCER;

  const result = estimateTakeHome({
    gross: grossNum,
    coefficient: SIMPLIFIED_COEFFICIENTS[activity],
    year,
    ssRate,
    startupYear,
    firstYear: startupYear === 1,
  });

  const ratePct = Math.round(result.effectiveRate * 1000) / 10;
  // Width of the kept (net) slice of the gross, for the visual bar.
  const keptPct =
    grossNum > 0
      ? Math.max(0, Math.min(100, (result.net / grossNum) * 100))
      : 0;

  return (
    <div className={styles.result}>
      <div className={styles.netPanel}>
        <span className={styles.netIcon} aria-hidden>
          <FiCheck />
        </span>
        <p className={styles.netLabel}>
          You take home, after IRS &amp; Segurança Social
        </p>
        <p className={styles.netValue}>{euro(result.net)}</p>
        <p className={styles.netMonthly}>
          ≈ <strong>{euro(result.net / 12)}</strong> a month
        </p>

        <div
          className={styles.bar}
          role="img"
          aria-label={`You keep ${Math.round(keptPct)}% of your gross income`}
        >
          <div
            className={styles.barKept}
            style={{ transform: `scaleX(${keptPct / 100})` }}
          />
        </div>
        <p className={styles.barCaption}>
          You keep <em>{Math.round(keptPct)}%</em> of every euro you bill.
          Effective IRS + SS rate: {ratePct}%.
        </p>
      </div>

      <dl className={styles.breakdown}>
        <div className={styles.row}>
          <dt>Annual gross</dt>
          <dd>{euro(result.gross)}</dd>
        </div>
        <div className={`${styles.row} ${styles.deduct}`}>
          <dt>− Segurança Social</dt>
          <dd>−{euro(result.ss)}</dd>
        </div>
        <div className={`${styles.row} ${styles.subtotal}`}>
          <dt>Taxable income</dt>
          <dd>{euro(result.taxable)}</dd>
        </div>
        <div className={`${styles.row} ${styles.deduct}`}>
          <dt>− IRS</dt>
          <dd>−{euro(result.irs)}</dd>
        </div>
        <div className={`${styles.row} ${styles.total}`}>
          <dt>Net take-home</dt>
          <dd>{euro(result.net)}</dd>
        </div>
      </dl>

      <p className={styles.disclaimer}>{TAX_DISCLAIMER}</p>
    </div>
  );
}
