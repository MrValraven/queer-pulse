import { AnimatePresence, m } from "motion/react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { useMediaQuery } from "../../../shared/hooks/useMediaQuery";
import type { StudioLandingPhotoView } from "../api/studioLanding.adapters";
import { STUDIO_EXIT, STUDIO_FADE, STUDIO_SPRING_SOFT } from "../studioMotion";
import {
  STUDIO_LANDING_HERO_SHOTS,
  STUDIO_LANDING_PHONE_QUERY,
} from "./studioLanding.data";
import { StudioLandingDeviceFrame } from "./StudioLandingDeviceFrame";
import { StudioLandingPhoto } from "./StudioLandingPhoto";
import { StudioLandingScreenshot } from "./StudioLandingScreenshot";
import styles from "./StudioLandingHeroVisual.module.css";

/** Under reduced motion the photo swap still fades, briefly. */
const REDUCED_FADE = { duration: 0.12, ease: "linear" } as const;

/**
 * The hero's visual. Without a hero photo it is the screenshot pair: Studio
 * home in a laptop, with the phone's Now playing screen overlapping the
 * laptop's lower right corner. Once our team fills the hero photo slot, the
 * photo takes the laptop's place in a box of the same shape, so nothing
 * shifts, and the phone overlaps the photo the same way. The two crossfade.
 * Everything rises in once on load, then the phone floats slowly. Every
 * image is a priority load.
 *
 * Below 720px without a photo only the phone renders, centred: leaving the
 * laptop out of the tree means its image is never fetched, so the phone is
 * the eager image. With a photo, the photo spans the width and a smaller
 * phone overlaps its lower right.
 */
export function StudioLandingHeroVisual({
  photo,
}: {
  photo: StudioLandingPhotoView | null;
}) {
  const isPhoneViewport = useMediaQuery(STUDIO_LANDING_PHONE_QUERY);
  const { reducedMotion } = useMotionPrefs();
  const isSlotShown = photo !== null || !isPhoneViewport;
  const visualClass = photo
    ? `${styles.visual} ${styles.withPhoto}`
    : styles.visual;

  return (
    <div className={visualClass}>
      <AnimatePresence initial={false}>
        {isSlotShown ? (
          <m.div
            key={photo ? `photo-${photo.url}` : "laptop"}
            className={styles.slot}
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              transition: reducedMotion ? REDUCED_FADE : STUDIO_FADE,
            }}
            exit={{
              opacity: 0,
              transition: reducedMotion ? REDUCED_FADE : STUDIO_EXIT,
            }}
          >
            {photo ? (
              <StudioLandingPhoto
                photo={photo}
                isPriority
                className={styles.photo}
              />
            ) : (
              <StudioLandingDeviceFrame
                device="laptop"
                className={styles.laptop}
              >
                <StudioLandingScreenshot
                  shot={STUDIO_LANDING_HERO_SHOTS.laptop}
                  isPriority
                />
              </StudioLandingDeviceFrame>
            )}
          </m.div>
        ) : null}
      </AnimatePresence>
      <m.div
        className={styles.phone}
        layout={reducedMotion ? false : "position"}
        transition={STUDIO_SPRING_SOFT}
      >
        <StudioLandingDeviceFrame device="phone" className={styles.phoneFloat}>
          <StudioLandingScreenshot
            shot={STUDIO_LANDING_HERO_SHOTS.phone}
            isPriority
          />
        </StudioLandingDeviceFrame>
      </m.div>
    </div>
  );
}
