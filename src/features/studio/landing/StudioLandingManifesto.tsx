import { useId } from "react";
import { AnimatePresence, m } from "motion/react";
import { FiMic } from "react-icons/fi";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useScrollReveal } from "../../../shared/hooks/useScrollReveal";
import { useStudioLanding } from "../api/useStudioLanding";
import { STUDIO_EXIT, STUDIO_PANEL_OPEN } from "../studioMotion";
import { STUDIO_LANDING_WHY_PARAGRAPH_KEYS } from "./studioLanding.data";
import { StudioLandingPhoto } from "./StudioLandingPhoto";
import styles from "./StudioLandingManifesto.module.css";

/** Under reduced motion the photo appears and leaves at once. */
const NO_MOTION = { duration: 0 } as const;

/**
 * Why it matters. The pull quote is the section's h2, so it names the section
 * for assistive technology while reading as an editorial quote. The three
 * paragraphs sit beside it on wide screens and below it on phones. When our
 * team has filled the manifesto photo slot, the photo sits between the quote
 * and the paragraphs (after the quote on phones). A photo that lands after the
 * first paint fades in, so the third column arrives gently (at once under
 * reduced motion).
 */
export function StudioLandingManifesto() {
  const { t } = useTranslation();
  const headingId = useId();
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();
  const { landing } = useStudioLanding();
  const photo = landing?.photos.manifesto ?? null;
  const { reducedMotion } = useMotionPrefs();

  return (
    <section className={styles.section} aria-labelledby={headingId}>
      <div
        className={styles.inner}
        ref={ref}
        data-revealed={isVisible}
        data-has-photo={photo ? "true" : "false"}
      >
        <div className={styles.quoteColumn}>
          <p className={styles.eyebrow}>{t("studio:landing.why.eyebrow")}</p>
          <span className={styles.micMark} aria-hidden="true">
            <FiMic />
          </span>
          <h2 id={headingId} className={styles.quote}>
            <Translation
              i18nKey="studio:landing.why.quote"
              components={{ em: <em /> }}
            />
          </h2>
        </div>

        <AnimatePresence initial={false}>
          {photo ? (
            <m.div
              key="manifesto-photo"
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                transition: reducedMotion ? NO_MOTION : STUDIO_PANEL_OPEN,
              }}
              exit={{
                opacity: 0,
                transition: reducedMotion ? NO_MOTION : STUDIO_EXIT,
              }}
            >
              <div className={styles.photoColumn}>
                <StudioLandingPhoto photo={photo} className={styles.photo} />
              </div>
            </m.div>
          ) : null}
        </AnimatePresence>

        <div className={styles.textColumn}>
          {STUDIO_LANDING_WHY_PARAGRAPH_KEYS.map((paragraphKey) => (
            <p key={paragraphKey} className={styles.paragraph}>
              {t(paragraphKey)}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
