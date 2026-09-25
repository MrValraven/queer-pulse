import { useMemo } from "react";
import { FiShield } from "react-icons/fi";
import { TAX_DISCLAIMER_KEY } from "./tax.constants";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import { RollingNumber } from "../../shared/components/ui/RollingNumber";
import type { PotEntry } from "./setAside.data";
import styles from "./SetAsidePlannerPage.module.css";

interface SetAsideResultProps {
  gross: number;
  setAsidePct: number;
  pot: PotEntry[];
}

export function SetAsideResult({
  gross,
  setAsidePct,
  pot,
}: SetAsideResultProps) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const frac = setAsidePct / 100;
  const annualPark = gross * frac;
  const monthlyPark = annualPark / 12;

  const { logged, potOwed } = useMemo(() => {
    const total = pot.reduce((sum, e) => sum + e.amount, 0);
    return { logged: total, potOwed: total * frac };
  }, [pot, frac]);

  // The figures follow the form and the pot, so each one rolls.
  const rollCurrency = (amount: number) => (
    <RollingNumber value={fmt.currency(amount)} numericValue={amount} />
  );
  const percentFigure = (
    <RollingNumber value={fmt.number(setAsidePct)} numericValue={setAsidePct} />
  );

  return (
    <div className={styles.result}>
      <div className={styles.panel}>
        <FiShield className={styles.panelIcon} aria-hidden />
        <p className={styles.panelKicker}>
          {t("economy:setAside.result.parkKicker")}
        </p>
        <p className={styles.bigPct}>{percentFigure}%</p>
        <h2 className={styles.panelTitle}>
          <Translation
            i18nKey="economy:setAside.result.title"
            components={{ em: <em /> }}
            slots={{ percent: percentFigure }}
          />
        </h2>
        <p className={styles.panelBody}>
          <Translation
            i18nKey="economy:setAside.result.body"
            // The gross echoes what is being typed, so only the monthly
            // figure rolls.
            values={{ gross: fmt.currency(gross) }}
            slots={{ monthly: rollCurrency(monthlyPark) }}
          />
        </p>
      </div>

      <div className={styles.statRow}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>
            {t("economy:setAside.result.parkPerMonth")}
          </span>
          <span className={styles.statVal}>{rollCurrency(monthlyPark)}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>
            {t("economy:setAside.result.parkThisYear")}
          </span>
          <span className={styles.statVal}>{rollCurrency(annualPark)}</span>
        </div>
      </div>

      <div className={styles.potCard}>
        <div className={styles.potHead}>
          <span className={styles.potLabel}>
            {t("economy:setAside.result.potLabel")}
          </span>
          <span className={styles.potCount}>
            <Translation
              i18nKey="economy:setAside.result.potCount"
              values={{ count: pot.length }}
              slots={{
                count: (
                  <RollingNumber
                    value={fmt.number(pot.length)}
                    numericValue={pot.length}
                  />
                ),
              }}
            />
          </span>
        </div>
        <p className={styles.potTotal}>{rollCurrency(potOwed)}</p>
        <p className={styles.potSub}>
          {pot.length === 0 ? (
            t("economy:setAside.result.potEmpty")
          ) : (
            <Translation
              i18nKey="economy:setAside.result.potSub"
              slots={{ percent: percentFigure, logged: rollCurrency(logged) }}
            />
          )}
        </p>
      </div>

      <p className={styles.disclaimer}>{t(TAX_DISCLAIMER_KEY)}</p>
    </div>
  );
}
