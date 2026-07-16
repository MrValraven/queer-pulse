import { Link } from "react-router-dom";
import { Button } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { SystemStateShell } from "../../shared/components/layout";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./AccountSuspendedPage.module.css";

/** Fixed demo case data — names, dates and case IDs stay as data, not copy. */
const SUSPENSION_DAYS = 7;
const CHANNEL = "#trans-mutual-aid";
const STARTED_AT = "Mon 9 Jun · 14:08 WET";
const LIFTS_AT = "Mon 16 Jun · 14:08";
const REVIEWER_NAME = "Sofia C.";
const CASE_ID = "QP-MOD-2026-1184";
const OVERTURNED_PERCENT = 11;

export function AccountSuspendedPage() {
  const { t } = useTranslation();

  return (
    <SystemStateShell>
      <div className={styles.card}>
        <div className={styles.icon}>
          <svg viewBox="0 0 24 24" aria-hidden>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        <div className={styles.kicker}>
          {t("system:accountSuspended.kicker")}
        </div>
        <h1 className={styles.heading}>
          <Translation
            i18nKey="system:accountSuspended.heading"
            values={{ days: SUSPENSION_DAYS }}
            components={{ em: <em /> }}
          />
        </h1>
        <p className={styles.lead}>
          <Translation
            i18nKey="system:accountSuspended.lead"
            values={{ channel: CHANNEL }}
            components={{ b: <b />, em: <em /> }}
          />
        </p>

        <div className={styles.detailList}>
          <div className={styles.detailRow}>
            <span>{t("system:accountSuspended.details.action")}</span>
            <b>
              {t("system:accountSuspended.details.actionValue", {
                days: SUSPENSION_DAYS,
              })}
            </b>
          </div>
          <div className={styles.detailRow}>
            <span>{t("system:accountSuspended.details.started")}</span>
            <b>{STARTED_AT}</b>
          </div>
          <div className={styles.detailRow}>
            <span>
              {t("system:accountSuspended.details.liftsAutomatically")}
            </span>
            <span className={styles.detailNum}>
              <em>{LIFTS_AT}</em>
            </span>
          </div>
          <div className={styles.detailRow}>
            <span>{t("system:accountSuspended.details.reviewedBy")}</span>
            <b>
              {t("system:accountSuspended.details.reviewedByValue", {
                name: REVIEWER_NAME,
              })}
            </b>
          </div>
          <div className={styles.detailRow}>
            <span>{t("system:accountSuspended.details.caseId")}</span>
            <b>{CASE_ID}</b>
          </div>
        </div>

        <div className={styles.whatStays}>
          <h4>{t("system:accountSuspended.whatStays.title")}</h4>
          <ul>
            <li>{t("system:accountSuspended.whatStays.item1")}</li>
            <li>{t("system:accountSuspended.whatStays.item2")}</li>
            <li>{t("system:accountSuspended.whatStays.item3")}</li>
            <li>{t("system:accountSuspended.whatStays.item4")}</li>
          </ul>
        </div>

        <div className={styles.actions}>
          <Button to={routes.report}>
            {t("system:accountSuspended.actions.appealCta")}
          </Button>
          <Button variant="ghost" to={routes.codeOfConduct}>
            {t("system:accountSuspended.actions.ladderCta")}
          </Button>
          <Button variant="ghost" to={routes.messages}>
            {t("system:accountSuspended.actions.messageModCta")}
          </Button>
        </div>
        <p className={styles.foot}>
          <Translation
            i18nKey="system:accountSuspended.foot"
            values={{ percent: OVERTURNED_PERCENT }}
            components={{ a: <Link to={routes.transparencyReport} /> }}
          />
        </p>
      </div>
    </SystemStateShell>
  );
}
