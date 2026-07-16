import { Link } from "react-router-dom";
import { FiHeart } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./Under18Notice.module.css";

interface Under18NoticeProps {
  /** Return to the form/step — the block is a pause, never a dead end. */
  onBack: () => void;
  backLabel?: string;
}

/**
 * The humane under-18 block: a supportive plum panel (not an error page, not an
 * accusation) shown when someone tells us they're not 18 yet. It explains that
 * QueerPulse is 18+ *today*, that this isn't a judgement, points to queer
 * resources that are for them right now, and leaves the door open to come back.
 */
export function Under18Notice({ onBack, backLabel }: Under18NoticeProps) {
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
      </ul>
      <div className={styles.actions}>
        <Button variant="ghost-dark" onClick={onBack}>
          {backLabel ?? t("auth:under18.backDefault")}
        </Button>
      </div>
    </div>
  );
}
