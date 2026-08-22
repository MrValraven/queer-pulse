import { Link } from "react-router-dom";
import { FiHeart } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./Under18Notice.module.css";

interface Under18NoticeProps {
  /**
   * Return to the form/step — the block is a pause, never a dead end. Omit it
   * where going back would mean silently re-attesting an age the member has
   * just told us is under 18 (the signed-in onboarding wizard); pass `onSignOut`
   * there instead.
   */
  onBack?: () => void;
  backLabel?: string;
  /**
   * Ends the session instead of returning to the attestation. Used once an
   * account already exists, where "back" would let a self-declared minor tick
   * "I'm 18+" and carry on.
   */
  onSignOut?: () => void;
  /** Adds a "talk to us" line to the link list, for anyone who tapped by
   *  mistake or wants to reach a human. */
  shouldShowContactLink?: boolean;
}

/**
 * The humane under-18 block: a supportive plum panel (not an error page, not an
 * accusation) shown when someone tells us they're not 18 yet. It explains that
 * QueerPulse is 18+ *today*, that this isn't a judgement, points to queer
 * resources that are for them right now, and leaves the door open to come back.
 */
export function Under18Notice({
  onBack,
  backLabel,
  onSignOut,
  shouldShowContactLink = false,
}: Under18NoticeProps) {
  const { t } = useTranslation();
  return (
    <div className={styles.panel}>
      <div className={styles.icon}>
        <FiHeart size={26} color="var(--accent)" aria-hidden />
      </div>
      <h2 className={styles.title}>
        <Translation i18nKey="auth:under18.title" components={{ em: <em /> }} />
      </h2>
      <p className={styles.body}>{t("auth:under18.body1")}</p>
      <p className={styles.body}>{t("auth:under18.body2")}</p>
      <ul className={styles.links}>
        <li>
          <Link to={routes.resources}>{t("auth:under18.link.library")}</Link>
        </li>
        <li>
          <Link to={routes.queer101}>{t("auth:under18.link.queer101")}</Link>
        </li>
        <li>
          <Link to={routes.comingOut}>{t("auth:under18.link.comingOut")}</Link>
        </li>
        <li>
          <Link to={routes.resources}>{t("auth:under18.link.resources")}</Link>
        </li>
        <li>
          <Link to={`${routes.terms}#eligibility`}>
            {t("auth:under18.link.eligibility")}
          </Link>
        </li>
        {shouldShowContactLink && (
          <li>
            <Link to={routes.contact}>{t("auth:under18.link.contact")}</Link>
          </li>
        )}
      </ul>
      {onSignOut && (
        <p className={styles.body}>{t("auth:under18.signedIn.body")}</p>
      )}
      <div className={styles.actions}>
        {onBack && (
          <Button variant="ghost-dark" onClick={onBack}>
            {backLabel ?? t("auth:under18.backDefault")}
          </Button>
        )}
        {onSignOut && (
          <Button variant="ghost-dark" onClick={onSignOut}>
            {t("auth:under18.signOut")}
          </Button>
        )}
      </div>
    </div>
  );
}
