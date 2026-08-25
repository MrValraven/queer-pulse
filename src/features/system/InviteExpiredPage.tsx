import { Link } from "react-router-dom";
import { Button } from "../../shared/components/ui";
import { SystemStateShell } from "../../shared/components/layout";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import type { InviteView } from "../auth/api/useInvite";
import {
  INVITE_STATE_CONFIG,
  DEMO_EXPIRED_INVITE,
  reasonFromInvite,
  type InviteStateCta,
} from "./inviteState.data";
import styles from "./InviteExpiredPage.module.css";

interface InviteExpiredPageProps {
  /** The resolved invite. Undefined ⇒ bad code / 404 / network error → the `notFound` state. */
  invite?: InviteView;
  /** True only for the `/system/invite-expired` simulations preview, which shows a demo expired card. */
  preview?: boolean;
}

export function InviteExpiredPage({
  invite,
  preview,
}: InviteExpiredPageProps = {}) {
  const { t } = useTranslation();

  const resolved = preview ? DEMO_EXPIRED_INVITE : invite;

  const reason = reasonFromInvite(resolved);
  const config = INVITE_STATE_CONFIG[reason];
  const inviter = config.showInviter ? resolved?.inviter : undefined;

  const renderCta = (cta: InviteStateCta, variant: "primary" | "ghost") => {
    // A CTA that names the inviter ("Ask {name} to re-send") is meaningless
    // without one, so skip it rather than render a bare "{name}" placeholder —
    // the other CTA still carries a usable action.
    if (cta.withInviterName && !inviter) return null;
    const label = cta.withInviterName
      ? t(cta.labelKey, { name: inviter!.firstName })
      : t(cta.labelKey);
    return (
      <Button variant={variant} to={cta.to}>
        {label}
      </Button>
    );
  };

  const showDetails = config.showExpiry || Boolean(inviter);

  return (
    <SystemStateShell>
      <div className={styles.card}>
        <div className={styles.stamp}>{config.stamp}</div>

        <div className={styles.eyebrow}>{t(config.eyebrowKey)}</div>
        <h1 className={styles.heading}>
          <Translation
            i18nKey={config.headingKey}
            components={{ em: <em /> }}
          />
        </h1>
        <p className={styles.lead}>{t(config.leadKey)}</p>

        {showDetails && (
          <div className={styles.inviteDetails}>
            {config.showExpiry && resolved?.expiryLabel && (
              <div className={styles.inviteRow}>
                <span className={styles.inviteRowLabel}>
                  {t("system:inviteState.details.expiredOn")}
                </span>
                <span className={styles.expiredDate}>
                  {resolved.expiryLabel}
                </span>
              </div>
            )}
            {inviter && (
              <div className={`${styles.inviteRow} ${styles.inviteRowVouched}`}>
                <span className={styles.inviteRowLabel}>
                  {t("system:inviteState.details.vouchedBy")}
                </span>
                <span>
                  <span className={styles.inviteAvatar}>
                    {inviter.initials}
                  </span>
                  <b>{inviter.name}</b>
                </span>
              </div>
            )}
          </div>
        )}

        <div className={styles.actions}>
          {renderCta(config.primary, "primary")}
          {renderCta(config.secondary, "ghost")}
        </div>

        <div className={styles.foot}>
          <div>
            <Translation
              i18nKey="system:inviteState.foot.alreadyMember"
              components={{ a: <Link to={routes.signIn} /> }}
            />
          </div>
          <div>
            <Translation
              i18nKey="system:inviteState.foot.needHelp"
              components={{ a: <Link to={routes.help} /> }}
            />
          </div>
        </div>
      </div>
    </SystemStateShell>
  );
}
