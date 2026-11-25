import { useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, m } from "motion/react";
import { FiVolume2 } from "react-icons/fi";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { QuizshowScreenTheme } from "./useScreenTheme";
import styles from "./QuizshowScreenSound.module.css";

interface QuizshowScreenSoundChipProps {
  isShown: boolean;
  theme: QuizshowScreenTheme;
  /** The tap: turns the screen's sound on and asks the browser to start audio. */
  onTurnOnSound: () => void;
}

/**
 * Set on <html> while the chip shows, so the stage lifts its join chip above
 * it and the compact view keeps that height clear (QuizshowScreen.module.css).
 */
const SOUND_CHIP_SHOWN_ATTRIBUTE = "data-quizshow-sound-chip";

/**
 * "Turn on sound", bottom left, while the TV's audio context does not run
 * yet (item 39): browsers start audio only after a tap on the page. It fades
 * in and out; portaled to the body, as the toolbar is, since route
 * transitions transform the page. The stage's join chip stacks above it in
 * the same corner, so the bottom centre stays free.
 */
export function QuizshowScreenSoundChip({
  isShown,
  theme,
  onTurnOnSound,
}: QuizshowScreenSoundChipProps) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  useEffect(() => {
    if (!isShown) return undefined;
    const root = document.documentElement;
    root.setAttribute(SOUND_CHIP_SHOWN_ATTRIBUTE, "true");
    return () => {
      root.removeAttribute(SOUND_CHIP_SHOWN_ATTRIBUTE);
    };
  }, [isShown]);
  return createPortal(
    <AnimatePresence initial={false}>
      {isShown && (
        <m.div
          key="sound-chip"
          className={styles.chipDock}
          data-theme={theme}
          data-qs-theme={theme}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.2 }}
        >
          <Button variant="stage-ghost" onClick={onTurnOnSound}>
            <span className={styles.chipIcon} aria-hidden="true">
              <FiVolume2 fill="none" />
            </span>
            {t("quizshow:screen.soundChip")}
          </Button>
        </m.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
