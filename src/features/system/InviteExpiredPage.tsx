import { Link } from "react-router-dom";
import { Button } from "../../shared/components/ui";
import { SystemStateShell } from "../../shared/components/layout";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import styles from "./InviteExpiredPage.module.css";

/** Fixed demo invite data — names, emails, dates stay as data, not copy. */
const INVITED_EMAIL = "tomas@example.com";
const SENT_DATE = "23 May 2026";
const EXPIRED_DATE = "6 Jun 2026";
const VOUCHER_NAME = "Catarina Vaz";
const VOUCHER_INITIALS = "CV";
const VOUCHER_FIRST_NAME = "Catarina";

export function InviteExpiredPage() {
  const { t } = useTranslation();

  return (
    <SystemStateShell>
      <div className={styles.card}>
        <div className={styles.stamp}>
          <svg viewBox="0 0 24 24" aria-hidden>
            <circle cx="12" cy="12" r="9" />
            <polyline points="12 7 12 12 15 14" />
            <path d="m18 6-2 2" />
          </svg>
        </div>

        <div className={styles.eyebrow}>{t("system:inviteExpired.eyebrow")}</div>
        <h1 className={styles.heading}>
          <Translation
            i18nKey="system:inviteExpired.heading"
            components={{ em: <em /> }}
          />
        </h1>
        <p className={styles.lead}>{t("system:inviteExpired.lead")}</p>

        <div className={styles.inviteDetails}>
          <div className={styles.inviteRow}>
            <span className={styles.inviteRowLabel}>
              {t("system:inviteExpired.details.invitedAs")}
            </span>
            <b>{INVITED_EMAIL}</b>
          </div>
          <div className={styles.inviteRow}>
            <span className={styles.inviteRowLabel}>
              {t("system:inviteExpired.details.sent")}
            </span>
            <span>{SENT_DATE}</span>
          </div>
          <div className={styles.inviteRow}>
            <span className={styles.inviteRowLabel}>
              {t("system:inviteExpired.details.expired")}
            </span>
            <span className={styles.expiredDate}>{EXPIRED_DATE}</span>
          </div>
          <div className={`${styles.inviteRow} ${styles.inviteRowVouched}`}>
            <span className={styles.inviteRowLabel}>
              {t("system:inviteExpired.details.vouchedBy")}
            </span>
            <span>
              <span className={styles.inviteAvatar}>{VOUCHER_INITIALS}</span>
              <b>{VOUCHER_NAME}</b>
            </span>
          </div>
        </div>

        <div className={styles.actions}>
          <Button to={routes.contact}>
            {t("system:inviteExpired.actions.resendCta", {
              name: VOUCHER_FIRST_NAME,
            })}
          </Button>
          <Button variant="ghost" to={routes.requestInvite}>
            {t("system:inviteExpired.actions.freshInviteCta")}
          </Button>
        </div>

        <div className={styles.foot}>
          <div>
            <Translation
              i18nKey="system:inviteExpired.foot.alreadyMember"
              components={{ a: <Link to={routes.signIn} /> }}
            />
          </div>
          <div>
            <Translation
              i18nKey="system:inviteExpired.foot.needHelp"
              components={{ a: <Link to={routes.help} /> }}
            />
          </div>
        </div>
      </div>
    </SystemStateShell>
  );
}
