import { TAX_DISCLAIMER_KEY } from "./tax.constants";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
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
  const { t } = useTranslation();
  const fmt = useFormat();
  return (
    <div className={styles.result}>
      <div className={styles.resultHead}>
        {t("economy:dayRate.result.heading")}
      </div>

      <div className={styles.cards}>
        <div className={`${styles.card} ${styles.cardPrimary}`}>
          <div className={styles.cardLabel}>
            {t("economy:dayRate.result.minLabel")}
          </div>
          <div className={styles.cardVal}>{fmt.currency(base)}</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardLabel}>
            {t("economy:dayRate.result.withIvaLabel")}
          </div>
          <div className={styles.cardValSm}>{fmt.currency(withIva)}</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardLabel}>
            {t("economy:dayRate.result.hourlyLabel")}
          </div>
          <div className={styles.cardValSm}>{fmt.currency(hourly)}</div>
        </div>
      </div>

      <p className={styles.note}>{t("economy:dayRate.result.note")}</p>
      <p className={styles.disclaimer}>{t(TAX_DISCLAIMER_KEY)}</p>
    </div>
  );
}
