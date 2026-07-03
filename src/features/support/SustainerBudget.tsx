import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { BUDGET_ROWS, BUDGET_TOTAL, type BudgetTint } from "./sustainer.data";
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
  return (
    <div className={styles.budgetBlock} ref={ref}>
      <div className={styles.budgetHead}>
        <div className={styles.budgetTitle}>Where the money actually goes</div>
        <div className={styles.budgetPeriod}>Typical month · 2026</div>
      </div>
      <p className={styles.budgetIntro}>
        We said transparency isn't negotiable, so here's the real thing. This is
        roughly what it costs to run QueerPulse each month. No marketing budget,
        no office, no investors to pay back.
      </p>
      <div className={styles.budgetRows}>
        {BUDGET_ROWS.map((row) => (
          <div key={row.name} className={styles.budgetItem}>
            <div className={styles.biName}>{row.name}</div>
            <div className={styles.biBar}>
              <div
                className={FILL_CLASS[row.tint]}
                style={{ width: `${row.pct}%` }}
              />
            </div>
            <div className={styles.biAmt}>{row.amount}</div>
          </div>
        ))}
      </div>
      <div className={styles.budgetTotal}>
        <div className={styles.btLabel}>Monthly running cost</div>
        <div className={styles.btAmt}>{BUDGET_TOTAL}</div>
      </div>
      <p className={styles.budgetFoot}>
        Full quarterly figures live in our{" "}
        <Link to={routes.transparencyReport}>transparency report</Link>. Any
        surplus goes to the mental-health fund and micro-grants — never to
        profit.
      </p>
    </div>
  );
});
SustainerBudget.displayName = "SustainerBudget";
