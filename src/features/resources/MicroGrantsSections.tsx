import { useState } from "react";
import { Button, HubBackLink } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { requestInvitePath } from "../auth/api/joinRequestSource";
import styles from "./MicroGrantsPage.module.css";

const INVITE = requestInvitePath("micro_grants");
// The last entry ("Other") is chrome and resolves via t(); the currency
// amounts are locale-invariant values, not translated words.
const CONTRIBUTE_AMOUNTS = ["€5", "€10", "€20", "€50"];

export function MicroGrantsHero() {
  const { t } = useTranslation();
  return (
    <header className={styles.hero}>
      <div className="wrap">
        <HubBackLink
          to={routes.grants}
          label={t("resources:microGrants.hero.backLink")}
          tone="dark"
        />
        <div className={styles.eye}>
          {t("resources:microGrants.hero.eyebrow")}
        </div>
        <h1 className={styles.title}>
          {t("resources:microGrants.hero.title.line1")}
          <br />
          <Translation
            i18nKey="resources:microGrants.hero.title.line2"
            components={{ em: <em /> }}
          />
        </h1>
        <p className={styles.sub}>{t("resources:microGrants.hero.lead")}</p>
        <div className={styles.fund}>
          <div className={styles.fundItem}>
            <b>€14,800</b>
            <span>{t("resources:microGrants.hero.stat.awarded.label")}</span>
          </div>
          <div className={styles.fundItem}>
            <b>18</b>
            <span>{t("resources:microGrants.hero.stat.projects.label")}</span>
          </div>
          <div className={styles.fundItem}>
            <b>€3,200</b>
            <span>{t("resources:microGrants.hero.stat.pot.label")}</span>
          </div>
        </div>
        <div className={styles.fundBarWrap}>
          <div className={styles.fundBarLabel}>
            <span>{t("resources:microGrants.hero.fundBar.roundLabel")}</span>
            <span>
              €3,200 / €4,000 {t("resources:microGrants.hero.fundBar.goalLabel")}
            </span>
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
  const { t } = useTranslation();
  const [amount, setAmount] = useState("€20");
  return (
    <div className={styles.contributeStrip}>
      <div className={styles.csInner}>
        <div className={styles.csText}>
          <h3>
            <Translation
              i18nKey="resources:microGrants.contribute.title"
              components={{ em: <em /> }}
            />
          </h3>
          <p>{t("resources:microGrants.contribute.body")}</p>
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
            <button
              type="button"
              className={[
                styles.csAmount,
                amount === "Other" && styles.csAmountSelected,
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => setAmount("Other")}
            >
              {t("resources:microGrants.contribute.otherAmount")}
            </button>
          </div>
        </div>
        <div className={styles.csRight}>
          <Button to={INVITE} variant="primary" size="lg">
            {t("resources:microGrants.contribute.cta")}
          </Button>
          <span className={styles.csNote}>
            {t("resources:microGrants.contribute.note")}
          </span>
        </div>
      </div>
    </div>
  );
}
