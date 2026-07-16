import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { routes } from "../../app/routeMap";
import {
  BUDGET_ROWS,
  BUDGET_TOTAL_EUR,
  type BudgetTint,
} from "./sustainer.data";
import styles from "./sustainer.module.css";

const FILL_CLASS: Record<BudgetTint, string> = {
  plum: styles.biFill!,
  accent: `${styles.biFill} ${styles.biFillAccent}`,
  jade: `${styles.biFill} ${styles.biFillJade}`,
  plumSoft: `${styles.biFill} ${styles.biFillPlumSoft}`,
  ink: `${styles.biFill} ${styles.biFillInk}`,
};

/** "Where the money actually goes" — the transparency budget breakdown. */
export const SustainerBudget = forwardRef<HTMLDivElement>((_props, ref) => {
  const { t } = useTranslation();
  const fmt = useFormat();
  return (
    <div className={styles.budgetBlock} ref={ref}>
      <div className={styles.budgetHead}>
        <div className={styles.budgetTitle}>{t("support:budget.title")}</div>
        <div className={styles.budgetPeriod}>{t("support:budget.period")}</div>
      </div>
      <p className={styles.budgetIntro}>{t("support:budget.intro")}</p>
      <div className={styles.budgetRows}>
        {BUDGET_ROWS.map((row) => (
          <div key={row.nameKey} className={styles.budgetItem}>
            <div className={styles.biName}>{t(row.nameKey)}</div>
            <div className={styles.biBar}>
              <div
                className={FILL_CLASS[row.tint]}
                style={{ width: `${row.pct}%` }}
              />
            </div>
            <div className={styles.biAmt}>{fmt.currency(row.amountEur)}</div>
          </div>
        ))}
      </div>
      <div className={styles.budgetTotal}>
        <div className={styles.btLabel}>{t("support:budget.totalLabel")}</div>
        <div className={styles.btAmt}>{fmt.currency(BUDGET_TOTAL_EUR)}</div>
      </div>
      <p className={styles.budgetFoot}>
        <Translation
          i18nKey="support:budget.foot"
          components={{ link: <Link to={routes.transparencyReport} /> }}
        />
      </p>
    </div>
  );
});
SustainerBudget.displayName = "SustainerBudget";
