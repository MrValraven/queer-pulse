import { useState } from "react";
import { Button, HubBackLink } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import styles from "./MicroGrantsPage.module.css";

const INVITE = routes.requestInvite;
const CONTRIBUTE_AMOUNTS = ["€5", "€10", "€20", "€50", "Other"];

export function MicroGrantsHero() {
  return (
    <header className={styles.hero}>
      <div className="wrap">
        <HubBackLink to={routes.grants} label="Grants" tone="dark" />
        <div className={styles.eye}>Community fund</div>
        <h1 className={styles.title}>
          Small money.
          <br />
          <em>Real impact.</em>
        </h1>
        <p className={styles.sub}>
          Micro-grants of €200–2000 for queer community projects in Lisbon.
          Funded by members, allocated by members, reported back to members. No
          gatekeepers.
        </p>
        <div className={styles.fund}>
          <div className={styles.fundItem}>
            <b>€14,800</b>
            <span>awarded to date</span>
          </div>
          <div className={styles.fundItem}>
            <b>18</b>
            <span>projects funded</span>
          </div>
          <div className={styles.fundItem}>
            <b>€3,200</b>
            <span>in this quarter's pot</span>
          </div>
        </div>
        <div className={styles.fundBarWrap}>
          <div className={styles.fundBarLabel}>
            <span>Q2 2026 funding round</span>
            <span>€3,200 / €4,000 goal</span>
          </div>
          <div className={styles.fundBar}>
            <div className={styles.fundBarFill} />
          </div>
        </div>
      </div>
    </header>
  );
}

export function ContributeStrip() {
  const [amount, setAmount] = useState("€20");
  return (
    <div className={styles.contributeStrip}>
      <div className={styles.csInner}>
        <div className={styles.csText}>
          <h3>
            Add to the <em>pot.</em>
          </h3>
          <p>
            The fund is sustained by members who contribute what they can. There
            is no minimum. Every amount makes the next round possible.
          </p>
          <div className={styles.csAmounts}>
            {CONTRIBUTE_AMOUNTS.map((a) => (
              <button
                key={a}
                type="button"
                className={[
                  styles.csAmount,
                  amount === a && styles.csAmountSelected,
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setAmount(a)}
              >
                {a}
              </button>
            ))}
          </div>
        </div>
        <div className={styles.csRight}>
          <Button to={INVITE} variant="primary" size="lg">
            Contribute to the fund
          </Button>
          <span className={styles.csNote}>
            Contributions are voluntary. Members only. Not tax-deductible under
            current Portuguese law.
          </span>
        </div>
      </div>
    </div>
  );
}
