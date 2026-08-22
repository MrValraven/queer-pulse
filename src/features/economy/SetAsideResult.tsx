import { useMemo } from "react";
import { FiShield } from "react-icons/fi";
import { TAX_DISCLAIMER_KEY } from "./tax.constants";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
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

  return (
    <div className={styles.result}>
      <div className={styles.panel}>
        <FiShield className={styles.panelIcon} aria-hidden />
        <p className={styles.panelKicker}>
          {t("economy:setAside.result.parkKicker")}
        </p>
        <p className={styles.bigPct}>{setAsidePct}%</p>
        <h2 className={styles.panelTitle}>
          <Translation
            i18nKey="economy:setAside.result.title"
            components={{ em: <em /> }}
            values={{ percent: setAsidePct }}
          />
        </h2>
        <p className={styles.panelBody}>
          {t("economy:setAside.result.body", {
            gross: fmt.currency(gross),
            monthly: fmt.currency(monthlyPark),
          })}
        </p>
      </div>

      <div className={styles.statRow}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>
            {t("economy:setAside.result.parkPerMonth")}
          </span>
          <span className={styles.statVal}>{fmt.currency(monthlyPark)}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>
            {t("economy:setAside.result.parkThisYear")}
          </span>
          <span className={styles.statVal}>{fmt.currency(annualPark)}</span>
        </div>
      </div>

      <div className={styles.potCard}>
        <div className={styles.potHead}>
          <span className={styles.potLabel}>
            {t("economy:setAside.result.potLabel")}
          </span>
          <span className={styles.potCount}>
            {t("economy:setAside.result.potCount", { count: pot.length })}
          </span>
        </div>
        <p className={styles.potTotal}>{fmt.currency(potOwed)}</p>
        <p className={styles.potSub}>
          {pot.length === 0
            ? t("economy:setAside.result.potEmpty")
            : t("economy:setAside.result.potSub", {
                percent: setAsidePct,
                logged: fmt.currency(logged),
              })}
        </p>
      </div>

      <p className={styles.disclaimer}>{t(TAX_DISCLAIMER_KEY)}</p>
    </div>
  );
}
