import { useId } from "react";
import { FiBookOpen } from "react-icons/fi";
import { Link } from "react-router-dom";
import { routes } from "../../../app/routeMap";
import { useAuth } from "../../../app/providers/authContext";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { StudioLandingCta } from "./StudioLandingCta";
import type { StudioLandingAudience } from "./studioLanding.data";
import styles from "./StudioLandingClosing.module.css";

interface StudioLandingClosingProps {
  audience: StudioLandingAudience;
}

/**
 * Closing section of the Studio landing: a short invitation, the same call
 * to action as the hero (it follows the audience switch and the member
 * state), and a quiet link to the magazine. The body line
 * invites people to ask for access, so signed-in members do not see it.
 */
export function StudioLandingClosing({ audience }: StudioLandingClosingProps) {
  const { t } = useTranslation();
  const { loggedIn } = useAuth();
  const titleId = useId();
  return (
    <section className={styles.closing} aria-labelledby={titleId}>
      <div className={styles.glow} aria-hidden="true" />
      <div className={styles.inner}>
        <h2 id={titleId} className={styles.title}>
          <Translation
            i18nKey="studio:landing.closing.title"
            components={{ em: <em /> }}
          />
        </h2>
        {loggedIn ? null : (
          <p className={styles.body}>{t("studio:landing.closing.body")}</p>
        )}
        <StudioLandingCta placement="closing" audience={audience} />
        <Link className={styles.magazineLink} to={routes.magazine}>
          <FiBookOpen aria-hidden="true" />
          {t("studio:landing.closing.magazineLink")}
        </Link>
      </div>
    </section>
  );
}
