import { useId, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { FiInfo } from "react-icons/fi";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { Tabs, tabPanelProps } from "../../../shared/components/ui";
import { useMediaQuery } from "../../../shared/hooks/useMediaQuery";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { STUDIO_EXIT, STUDIO_FADE, STUDIO_SPRING } from "../studioMotion";
import {
  STUDIO_LANDING_GALLERY_HEADING_ID,
  STUDIO_LANDING_GALLERY_ID,
  STUDIO_LANDING_PHONE_QUERY,
  STUDIO_LANDING_SCREENS,
  type StudioLandingScreenId,
} from "./studioLanding.data";
import { StudioLandingDeviceFrame } from "./StudioLandingDeviceFrame";
import { StudioLandingScreenshot } from "./StudioLandingScreenshot";
import styles from "./StudioLandingGallery.module.css";

const REDUCED_FADE = { duration: 0.12 } as const;

/**
 * "A look inside": a real tablist of Studio screens (the shared `Tabs`, so
 * arrow keys, Home and End move the selection) over one framed screenshot
 * at a time. A switch crossfades the outgoing and incoming figures in one
 * grid cell, and the frame becomes a phone for the phone shots. Below
 * 720px every tab shows its phone shot, so the stage holds one phone height
 * there and one laptop height above it. Reduced motion keeps the crossfade
 * and drops the rise. The heading takes focus
 * from the hero's "See inside" link, so it carries `tabIndex={-1}`.
 */
export function StudioLandingGallery() {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const tabsIdPrefix = useId();
  const isPhoneViewport = useMediaQuery(STUDIO_LANDING_PHONE_QUERY);
  const [activeScreenId, setActiveScreenId] =
    useState<StudioLandingScreenId>("home");
  const activeScreen = STUDIO_LANDING_SCREENS.find(
    (screen) => screen.screenId === activeScreenId,
  );
  const activeShot = isPhoneViewport
    ? activeScreen?.phoneShot
    : activeScreen?.shot;

  const tabs = STUDIO_LANDING_SCREENS.map((screen) => ({
    id: screen.screenId,
    label: t(screen.tabKey),
  }));

  function handleTabChange(tabId: string) {
    const nextScreen = STUDIO_LANDING_SCREENS.find(
      (screen) => screen.screenId === tabId,
    );
    if (nextScreen) setActiveScreenId(nextScreen.screenId);
  }

  return (
    <section
      id={STUDIO_LANDING_GALLERY_ID}
      className={styles.gallery}
      aria-labelledby={STUDIO_LANDING_GALLERY_HEADING_ID}
    >
      <div className={styles.inner}>
        <p className={styles.eyebrow}>{t("studio:landing.gallery.eyebrow")}</p>
        <h2
          id={STUDIO_LANDING_GALLERY_HEADING_ID}
          className={styles.title}
          tabIndex={-1}
        >
          <Translation
            i18nKey="studio:landing.gallery.title"
            components={{ em: <em /> }}
          />
        </h2>
        <Tabs
          variant="pill"
          idPrefix={tabsIdPrefix}
          label={t("studio:landing.gallery.tabsLabel")}
          tabs={tabs}
          active={activeScreenId}
          onChange={handleTabChange}
          className={styles.chipRow}
        />
        <div
          {...tabPanelProps(tabsIdPrefix, activeScreenId)}
          className={styles.panel}
        >
          <div className={styles.stage}>
            <AnimatePresence initial={false}>
              {activeScreen && activeShot && (
                <m.figure
                  key={activeShot.fileBase}
                  className={styles.figure}
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
                  <div className={styles.frameSlot}>
                    <StudioLandingDeviceFrame
                      device={activeShot.device}
                      className={
                        activeShot.device === "phone"
                          ? styles.phoneFrame
                          : styles.laptopFrame
                      }
                    >
                      <StudioLandingScreenshot shot={activeShot} />
                    </StudioLandingDeviceFrame>
                  </div>
                  <figcaption className={styles.caption}>
                    <span className={styles.captionTitle}>
                      {t(activeScreen.tabKey)}
                    </span>
                    <span className={styles.captionText}>
                      {t(activeScreen.captionKey)}
                    </span>
                  </figcaption>
                </m.figure>
              )}
            </AnimatePresence>
          </div>
        </div>
        <p className={styles.sampleNote}>
          <FiInfo aria-hidden="true" className={styles.sampleNoteIcon} />
          {t("studio:landing.gallery.sampleNote")}
        </p>
      </div>
    </section>
  );
}
