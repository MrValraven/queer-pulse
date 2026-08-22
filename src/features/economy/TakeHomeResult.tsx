import { FiCheck } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import { estimateTakeHome, type TaxYear } from "./tax.calc";
import {
  SIMPLIFIED_COEFFICIENTS,
  SS_RATE_ENI,
  SS_RATE_FREELANCER,
  TAX_DISCLAIMER_KEY,
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
  const { t } = useTranslation();
  const fmt = useFormat();
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
          {t("economy:takeHome.result.netLabel")}
        </p>
        <p className={styles.netValue}>{fmt.currency(result.net)}</p>
        <p className={styles.netMonthly}>
          ≈ <strong>{fmt.currency(result.net / 12)}</strong>{" "}
          {t("economy:takeHome.result.perMonth")}
        </p>

        <div
          className={styles.bar}
          role="img"
          aria-label={t("economy:takeHome.result.barAriaLabel", {
            percent: Math.round(keptPct),
          })}
        >
          <div
            className={styles.barKept}
            style={{ transform: `scaleX(${keptPct / 100})` }}
          />
        </div>
        <p className={styles.barCaption}>
          <Translation
            i18nKey="economy:takeHome.result.keepCaption"
            components={{ em: <em /> }}
            values={{ percent: Math.round(keptPct), rate: ratePct }}
          />
        </p>
      </div>

      <dl className={styles.breakdown}>
        <div className={styles.row}>
          <dt>{t("economy:takeHome.result.annualGross")}</dt>
          <dd>{fmt.currency(result.gross)}</dd>
        </div>
        <div className={`${styles.row} ${styles.deduct}`}>
          <dt>{t("economy:takeHome.result.segurancaSocial")}</dt>
          <dd>−{fmt.currency(result.ss)}</dd>
        </div>
        <div className={`${styles.row} ${styles.subtotal}`}>
          <dt>{t("economy:takeHome.result.taxableIncome")}</dt>
          <dd>{fmt.currency(result.taxable)}</dd>
        </div>
        <div className={`${styles.row} ${styles.deduct}`}>
          <dt>{t("economy:takeHome.result.irs")}</dt>
          <dd>−{fmt.currency(result.irs)}</dd>
        </div>
        <div className={`${styles.row} ${styles.total}`}>
          <dt>{t("economy:takeHome.result.netTakeHome")}</dt>
          <dd>{fmt.currency(result.net)}</dd>
        </div>
      </dl>

      <p className={styles.disclaimer}>{t(TAX_DISCLAIMER_KEY)}</p>
    </div>
  );
}
