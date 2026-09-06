import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiClock,
  FiLock,
  FiShield,
  FiUnlock,
} from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { StatusCard } from "../../shared/components/ui";
import { SystemStateShell } from "../../shared/components/layout";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import styles from "./AccountLockedPage.module.css";

/**
 * The temporary account-lock screen.
 *
 * It used to print `Incident QP-8423-LOCK · 14:08 WET` in its footer. Nothing
 * mints that reference: it was two hard-coded strings, identical for every
 * member and every lock. A member quoting it to support would be quoting a
 * number that means nothing, on the one screen where being able to trust what
 * is written matters most. There is no incident-id endpoint to derive a real
 * one from, so the line is gone and the footer leads with the next step that
 * does exist: writing to the team.
 *
 * DEMO vs LIVE. Nothing in the product locks an account: there is no lockout
 * counter, no sign-in-attempt threshold, no geo check, and no timed release.
 * The three-row reason list below is a demo showcase of exactly those things
 * ("5 failed sign-in attempts in the last 12 minutes, from two devices", "a
 * new location: Madrid, Spain", "lifts automatically in 23 minutes"), and it
 * is gated on `demoMode` accordingly. On the live build the page keeps the
 * shape it has and says only what is true: the account is locked and the team
 * is the way through. The route stays, because it is linked from elsewhere and
 * because a lockout state is the kind of thing a platform eventually needs.
 */
export function AccountLockedPage() {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();

  return (
    <SystemStateShell>
      <StatusCard
        icon={<FiLock aria-hidden />}
        kicker={t("system:accountLocked.kicker")}
        heading={
          <Translation
            i18nKey="system:accountLocked.heading"
            components={{ em: <em /> }}
          />
        }
        lead={t(
          demoMode
            ? "system:accountLocked.lead"
            : "system:accountLocked.leadLive",
        )}
      >
        {demoMode && (
          <div className={styles.reasonList}>
            <div className={styles.reasonRow}>
              <div className={styles.reasonIcon}>
                <FiClock aria-hidden />
              </div>
              <div className={styles.reasonText}>
                <Translation
                  i18nKey="system:accountLocked.reason1"
                  components={{ b: <b /> }}
                />
              </div>
            </div>
            <div className={styles.reasonRow}>
              <div className={styles.reasonIcon}>
                <FiShield aria-hidden />
              </div>
              <div className={styles.reasonText}>
                <Translation
                  i18nKey="system:accountLocked.reason2"
                  components={{ b: <b /> }}
                />
              </div>
            </div>
            <div className={styles.reasonRow}>
              <div className={styles.reasonIcon}>
                <FiUnlock aria-hidden />
              </div>
              <div className={styles.reasonText}>
                <Translation
                  i18nKey="system:accountLocked.reason3"
                  components={{ b: <b /> }}
                />
              </div>
            </div>
          </div>
        )}

        <div className={styles.whatNow}>
          <Link to={routes.contact} className={styles.wnRow}>
            <div className={styles.wnNum}>1</div>
            <div className={styles.wnText}>
              <div className={styles.wnTitle}>
                {t("system:accountLocked.whatNow.contact.title")}
              </div>
              <div className={styles.wnDesc}>
                {t("system:accountLocked.whatNow.contact.desc")}
              </div>
            </div>
            <span className={styles.wnArrow} aria-hidden>
              <FiArrowRight />
            </span>
          </Link>
        </div>

        <div className={styles.foot}>
          <span>
            <Link to={routes.help}>
              {t("system:accountLocked.foot.whyLink")}
            </Link>
          </span>
        </div>
      </StatusCard>
    </SystemStateShell>
  );
}
