import { FiAlertCircle, FiBriefcase, FiCheck, FiUser } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import {
  estimateSalariedNet,
  estimateTakeHome,
  type TakeHome,
  type TaxYear,
} from "./tax.calc";
import { SIMPLIFIED_COEFFICIENTS, TAX_DISCLAIMER } from "./tax.constants";
import {
  HIDDEN_COSTS,
  type ActivityKey,
  type StartupYear,
} from "./comparator.data";
import styles from "./ComparatorPage.module.css";

export interface ComparatorResultProps {
  gross: string;
  activity: ActivityKey;
  year: TaxYear;
  startupYear: StartupYear;
}

const safeNumber = (raw: string): number => {
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) && n > 0 ? n : 0;
};

const ratePct = (r: TakeHome) => Math.round(r.effectiveRate * 1000) / 10;

interface ColumnProps {
  label: string;
  icon: React.ReactNode;
  result: TakeHome;
  highlight: boolean;
}

function ResultColumn({ label, icon, result, highlight }: ColumnProps) {
  const { t } = useTranslation();
  const fmt = useFormat();
  return (
    <div className={`${styles.col} ${highlight ? styles.colHi : ""}`}>
      <p className={styles.colLabel}>
        <span className={styles.colIcon} aria-hidden>
          {icon}
        </span>
        {label}
      </p>
      <p className={styles.colNet}>{fmt.currency(result.net)}</p>
      <p className={styles.colMonthly}>
        ≈ <strong>{fmt.currency(result.net / 12)}</strong>{" "}
        {t("economy:comparator.result.perMonth")}
      </p>
      <dl className={styles.colBreakdown}>
        <div className={styles.colRow}>
          <dt>{t("economy:comparator.result.segurancaSocial")}</dt>
          <dd>−{fmt.currency(result.ss)}</dd>
        </div>
        <div className={styles.colRow}>
          <dt>{t("economy:comparator.result.irs")}</dt>
          <dd>−{fmt.currency(result.irs)}</dd>
        </div>
        <div className={styles.colRow}>
          <dt>{t("economy:comparator.result.effectiveRate")}</dt>
          <dd>{ratePct(result)}%</dd>
        </div>
      </dl>
    </div>
  );
}

/** Side-by-side freelance vs salaried net, the net difference, and hidden costs. */
export function ComparatorResult({
  gross,
  activity,
  year,
  startupYear,
}: ComparatorResultProps) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const grossNum = safeNumber(gross);

  const freelance = estimateTakeHome({
    gross: grossNum,
    coefficient: SIMPLIFIED_COEFFICIENTS[activity],
    year,
    startupYear,
    firstYear: startupYear === 1,
  });
  const salaried = estimateSalariedNet({ gross: grossNum, year });

  const diff = freelance.net - salaried.net;
  const diffAbs = Math.abs(diff);
  const freelanceMore = diff >= 0;

  return (
    <div className={styles.result}>
      <div className={styles.cols}>
        <ResultColumn
          label={t("economy:comparator.result.freelanceLabel")}
          icon={<FiUser />}
          result={freelance}
          highlight={freelanceMore}
        />
        <ResultColumn
          label={t("economy:comparator.result.salariedLabel")}
          icon={<FiBriefcase />}
          result={salaried}
          highlight={!freelanceMore}
        />
      </div>

      <div className={styles.diffPanel}>
        <span className={styles.diffIcon} aria-hidden>
          <FiCheck />
        </span>
        <p className={styles.diffLabel}>
          {t("economy:comparator.result.bottomLine")}
        </p>
        <p className={styles.diffValue}>
          <Translation
            i18nKey={
              freelanceMore
                ? "economy:comparator.result.summaryMore"
                : "economy:comparator.result.summaryLess"
            }
            components={{ em: <em /> }}
            values={{ amount: fmt.currency(diffAbs) }}
          />
        </p>
        <p className={styles.diffSub}>
          {t(
            freelanceMore
              ? "economy:comparator.result.subMore"
              : "economy:comparator.result.subLess",
            {
              gross: fmt.currency(grossNum),
              monthly: fmt.currency(diffAbs / 12),
            },
          )}
        </p>
      </div>

      <div className={styles.costs}>
        <h3 className={styles.costsTitle}>
          <Translation
            i18nKey="economy:comparator.result.costsTitle"
            components={{ em: <em /> }}
          />
        </h3>
        <ul className={styles.costsList}>
          {HIDDEN_COSTS.map((c) => (
            <li
              key={c.textKey}
              className={c.positive ? styles.costPos : styles.costNeg}
            >
              <span className={styles.costIcon} aria-hidden>
                {c.positive ? <FiCheck /> : <FiAlertCircle />}
              </span>
              {t(c.textKey)}
            </li>
          ))}
        </ul>
      </div>

      <p className={styles.disclaimer}>{TAX_DISCLAIMER}</p>
    </div>
  );
}
