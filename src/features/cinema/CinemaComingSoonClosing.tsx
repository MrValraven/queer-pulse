import { useId } from "react";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./CinemaComingSoonClosing.module.css";

/**
 * Closing scene of the live-mode Cinema teaser: a marquee panel with two rows
 * of dim bulbs, lit from behind by the last of the projector's glow. It points
 * people to the magazine, the neighbouring surface that already publishes, and
 * back home. No offer is made here: the cinema has nothing on sale yet.
 */
export function CinemaComingSoonClosing() {
  const { t } = useTranslation();
  const titleId = useId();
  return (
    <section className={styles.closing} aria-labelledby={titleId}>
      <div className={styles.glow} aria-hidden="true" />
      <div className={styles.marquee}>
        <span
          className={`${styles.bulbs} ${styles.bulbsTop}`}
          aria-hidden="true"
        />
        <h2 id={titleId} className={styles.title}>
          <Translation
            i18nKey="cinema:comingSoon.closing.title"
            components={{ em: <em /> }}
          />
        </h2>
        <p className={styles.body}>{t("cinema:comingSoon.closing.body")}</p>
        <div className={styles.actions}>
          <Button
            variant="primary"
            size="lg"
            to={routes.magazine}
            className={`${styles.action} ${styles.primaryAction}`}
          >
            {t("cinema:comingSoon.magazineCta")}
            <FiArrowRight aria-hidden="true" />
          </Button>
          <Button
            variant="ghost-dark"
            size="lg"
            to={routes.homepage}
            className={styles.action}
          >
            <FiArrowLeft aria-hidden="true" />
            {t("cinema:comingSoon.backHome")}
          </Button>
        </div>
        <span
          className={`${styles.bulbs} ${styles.bulbsBottom}`}
          aria-hidden="true"
        />
      </div>
    </section>
  );
}
