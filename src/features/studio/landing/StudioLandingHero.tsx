import { useId, type MouseEvent } from "react";
import { FiArrowDown, FiMic } from "react-icons/fi";
import { useAuth } from "../../../app/providers/authContext";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  STUDIO_LANDING_GALLERY_HEADING_ID,
  STUDIO_LANDING_GALLERY_ID,
} from "./studioLanding.data";
import { StudioLandingCta } from "./StudioLandingCta";
import { StudioLandingHeroVisual } from "./StudioLandingHeroVisual";
import styles from "./StudioLandingHero.module.css";

/**
 * Opening section of the Studio landing: the page's only `<h1>`, the lede,
 * the access status, the call to action and a link down to the gallery,
 * beside the hero visual. On phones the copy and CTA come first, then the
 * visual. "See inside" scrolls to the gallery and moves focus to its heading.
 * A signed-in member gets the member note from the CTA, which already says
 * how access opens, so the status pill is left out for them and "See inside"
 * sits on the same row as the note.
 */
export function StudioLandingHero() {
  const { t } = useTranslation();
  const { loggedIn } = useAuth();
  const { reducedMotion } = useMotionPrefs();
  const titleId = useId();

  function handleSeeInside(clickEvent: MouseEvent<HTMLAnchorElement>) {
    clickEvent.preventDefault();
    document.getElementById(STUDIO_LANDING_GALLERY_ID)?.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
      block: "start",
    });
    document
      .getElementById(STUDIO_LANDING_GALLERY_HEADING_ID)
      ?.focus({ preventScroll: true });
  }

  return (
    <section className={styles.hero} aria-labelledby={titleId}>
      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>
            <FiMic aria-hidden="true" className={styles.eyebrowIcon} />
            {t("studio:landing.hero.eyebrow")}
          </p>
          <h1 id={titleId} className={styles.title}>
            <Translation
              i18nKey="studio:landing.hero.title"
              components={{ em: <em /> }}
            />
          </h1>
          <p className={styles.lede}>{t("studio:landing.hero.lede")}</p>
          {loggedIn ? null : (
            <p className={styles.status}>
              <span className={styles.statusDot} aria-hidden="true" />
              {t("studio:landing.hero.status")}
            </p>
          )}
          <div
            className={
              loggedIn
                ? `${styles.actions} ${styles.actionsMember}`
                : styles.actions
            }
          >
            <StudioLandingCta placement="hero" />
            <a
              className={styles.seeInside}
              href={`#${STUDIO_LANDING_GALLERY_ID}`}
              onClick={handleSeeInside}
            >
              {t("studio:landing.hero.seeInside")}
              <FiArrowDown aria-hidden="true" />
            </a>
          </div>
        </div>
        <div className={styles.visual}>
          <StudioLandingHeroVisual />
        </div>
      </div>
    </section>
  );
}
