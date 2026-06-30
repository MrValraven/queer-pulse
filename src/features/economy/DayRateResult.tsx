import { TAX_DISCLAIMER } from "./tax.constants";
import { euro } from "./economy.data";
import styles from "./DayRateCalculatorPage.module.css";

interface DayRateResultProps {
  /** Minimum day rate excluding IVA. */
  base: number;
  /** Day rate including IVA. */
  withIva: number;
  /** Hourly rate excluding IVA. */
  hourly: number;
}

/** The live plum-panel preview: three emphasized rate cards plus disclaimers. */
export function DayRateResult({ base, withIva, hourly }: DayRateResultProps) {
  return (
    <div className={styles.result}>
      <div className={styles.resultHead}>Your day rate</div>

      <div className={styles.cards}>
        <div className={`${styles.card} ${styles.cardPrimary}`}>
          <div className={styles.cardLabel}>Minimum day rate (excl. IVA)</div>
          <div className={styles.cardVal}>{euro(base)}</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardLabel}>Including IVA</div>
          <div className={styles.cardValSm}>{euro(withIva)}</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardLabel}>Hourly (excl. IVA)</div>
          <div className={styles.cardValSm}>{euro(hourly)}</div>
        </div>
      </div>

      <p className={styles.note}>
        A starting point — adjust for your sector and market.
      </p>
      <p className={styles.disclaimer}>{TAX_DISCLAIMER}</p>
    </div>
  );
}
