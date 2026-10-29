import { useCallback, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { FiInfo } from "react-icons/fi";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { useMediaQuery } from "../../../shared/hooks/useMediaQuery";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { STUDIO_EXIT, STUDIO_FADE, STUDIO_SPRING } from "../studioMotion";
import {
  STUDIO_LANDING_PHONE_QUERY,
  STUDIO_LANDING_SCREENS,
  STUDIO_LANDING_STORY_HEADING_ID,
  STUDIO_LANDING_STORY_ID,
} from "./studioLanding.data";
import { StudioLandingDeviceFrame } from "./StudioLandingDeviceFrame";
import { StudioLandingScreenshot } from "./StudioLandingScreenshot";
import { StudioLandingStoryStep } from "./StudioLandingStoryStep";
import styles from "./StudioLandingStory.module.css";

const REDUCED_FADE = { duration: 0.12 } as const;

/**
 * "How it works": each Studio screen paired with what it does, told as the
 * visitor scrolls. From 720px the steps run down the left column and a
 * sticky device frame on the right shows the shot of the step crossing the
 * middle of the viewport, crossfading in one grid cell and switching to a
 * phone frame for the phone-only screens. On phones every step stacks with
 * its own phone shot. Reduced motion keeps a short crossfade and drops the
 * rise. The heading takes focus from the hero's "See inside" link, so it
 * carries `tabIndex={-1}`.
 */
export function StudioLandingStory() {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const isPhone = useMediaQuery(STUDIO_LANDING_PHONE_QUERY);
  const [activeIndex, setActiveIndex] = useState(0);
  const handleStepEnter = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);
  const activeShot = STUDIO_LANDING_SCREENS[activeIndex]?.shot;

  return (
    <section
      id={STUDIO_LANDING_STORY_ID}
      className={styles.story}
      aria-labelledby={STUDIO_LANDING_STORY_HEADING_ID}
    >
      <div className={styles.inner}>
        <header>
          <p className={styles.eyebrow}>
            {t("studio:landing.gallery.eyebrow")}
          </p>
          <h2
            id={STUDIO_LANDING_STORY_HEADING_ID}
            className={styles.title}
            tabIndex={-1}
          >
            <Translation
              i18nKey="studio:landing.gallery.title"
              components={{ em: <em /> }}
            />
          </h2>
        </header>
        <div className={styles.layout}>
          {/* eslint-disable-next-line jsx-a11y/no-redundant-roles -- list-style none drops the list role in Safari */}
          <ol className={styles.steps} role="list">
            {STUDIO_LANDING_SCREENS.map((screen, index) => (
              <StudioLandingStoryStep
                key={screen.screenId}
                screen={screen}
                index={index}
                isActive={index === activeIndex}
                isPhone={isPhone}
                onEnter={handleStepEnter}
              />
            ))}
          </ol>
          {!isPhone && (
            <div className={styles.stageColumn}>
              <div className={styles.stage}>
                <AnimatePresence initial={false}>
                  {activeShot && (
                    <m.div
                      key={activeShot.fileBase}
                      className={styles.stageShot}
                      initial={
                        reducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }
                      }
                      animate={{ opacity: 1, y: 0 }}
                      exit={{
                        opacity: 0,
                        transition: reducedMotion ? REDUCED_FADE : STUDIO_EXIT,
                      }}
                      transition={
                        reducedMotion
                          ? REDUCED_FADE
                          : { ...STUDIO_SPRING, opacity: STUDIO_FADE }
                      }
                    >
                      <StudioLandingDeviceFrame
                        device={activeShot.device}
                        className={
                          activeShot.device === "phone"
                            ? styles.stagePhoneFrame
                            : styles.stageLaptopFrame
                        }
                      >
                        <StudioLandingScreenshot shot={activeShot} />
                      </StudioLandingDeviceFrame>
                    </m.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
        <p className={styles.sampleNote}>
          <FiInfo aria-hidden="true" className={styles.sampleNoteIcon} />
          {t("studio:landing.gallery.sampleNote")}
        </p>
      </div>
    </section>
  );
}
