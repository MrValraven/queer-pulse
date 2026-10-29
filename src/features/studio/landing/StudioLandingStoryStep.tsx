import { useEffect } from "react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { useScrollReveal } from "../../../shared/hooks/useScrollReveal";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { StudioLandingScreen } from "./studioLanding.data";
import { StudioLandingDeviceFrame } from "./StudioLandingDeviceFrame";
import { StudioLandingScreenshot } from "./StudioLandingScreenshot";
import styles from "./StudioLandingStory.module.css";

/** A step counts as entered while it crosses the middle tenth of the viewport. */
const STEP_ROOT_MARGIN = "-45% 0px -45% 0px";

/**
 * One step of the scroll story: a number, the screen's title as an `<h3>`
 * and its caption. From 720px the step only reports when it crosses the
 * middle of the viewport (`onEnter`), and the story's sticky frame shows its
 * shot. On phones the step carries its own phone shot under the text and
 * fades in once as it scrolls into view.
 */
export function StudioLandingStoryStep({
  screen,
  index,
  isActive,
  isPhone,
  onEnter,
}: {
  screen: StudioLandingScreen;
  index: number;
  isActive: boolean;
  isPhone: boolean;
  onEnter: (index: number) => void;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const { ref, isVisible } = useScrollReveal<HTMLLIElement>();

  useEffect(() => {
    if (isPhone) return;
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) onEnter(index);
      },
      { rootMargin: STEP_ROOT_MARGIN },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [index, isPhone, onEnter, ref]);

  const stepNumber = String(index + 1).padStart(2, "0");

  return (
    <li
      ref={ref}
      className={styles.step}
      data-active={isPhone || isActive ? "true" : "false"}
      data-revealed={isVisible || reducedMotion ? "true" : "false"}
    >
      <div className={styles.stepText}>
        <span className={styles.stepNumber} aria-hidden="true">
          {stepNumber}
        </span>
        <h3 className={styles.stepTitle}>{t(screen.titleKey)}</h3>
        <p className={styles.stepCaption}>{t(screen.captionKey)}</p>
      </div>
      {isPhone && (
        <div className={styles.stepShot}>
          <StudioLandingDeviceFrame
            device="phone"
            className={styles.stepPhoneFrame}
          >
            <StudioLandingScreenshot shot={screen.phoneShot} />
          </StudioLandingDeviceFrame>
        </div>
      )}
    </li>
  );
}
