import { FiArrowRight, FiClock } from "react-icons/fi";
import { routes } from "../../../app/routeMap";
import { useAuth } from "../../../app/providers/authContext";
import { Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import styles from "./StudioLandingCta.module.css";

interface StudioLandingCtaProps {
  placement: "hero" | "closing";
}

/**
 * The landing's one call to action. Signed-out visitors get the invite
 * button. A signed-in member without a Studio grant gets a note about how
 * access opens, and never an invite button, because they already have an
 * account. The note promises no notification: the page simply opens into
 * Studio once access is granted.
 */
export function StudioLandingCta({ placement }: StudioLandingCtaProps) {
  const { t } = useTranslation();
  const { loggedIn } = useAuth();
  const placementClass = placement === "hero" ? styles.hero : styles.closing;
  const memberClass = loggedIn ? ` ${styles.member}` : "";
  return (
    <div className={`${styles.cta} ${placementClass}${memberClass}`}>
      {loggedIn ? (
        <p className={styles.memberNote}>
          <FiClock aria-hidden="true" className={styles.noteIcon} />
          {t("studio:landing.cta.memberNote")}
        </p>
      ) : (
        <Button variant="primary" size="lg" to={routes.requestInvite}>
          {t("studio:landing.cta.requestInvite")}
          <FiArrowRight aria-hidden="true" />
        </Button>
      )}
    </div>
  );
}
