import { FiRadio } from "react-icons/fi";
import { AnimatePresence, m } from "motion/react";
import { useMotionPrefs } from "../../../../app/providers/motionPrefs";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { StudioRadioSession } from "../studioPlayerContext";
import { radioFilterLabelKey } from "../studioQueue";
import styles from "../../StudioPlayer.module.css";

/** "Radio · Fado" under the title while a station plays. It fades in and
 *  out with the station. */
export function StudioPlayerRadioLine({
  radio,
}: {
  radio: StudioRadioSession | null;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  return (
    <AnimatePresence initial={false}>
      {radio && (
        <m.span
          key="radio"
          className={styles.radioLabel}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.2 }}
        >
          <FiRadio aria-hidden />
          {/* The text sits in its own span: a flex container's loose text
              never ellipsizes. */}
          <span className={styles.radioText}>
            {t("studio:radio.playerLabel", {
              name: t(radioFilterLabelKey(radio.filter)),
            })}
          </span>
        </m.span>
      )}
    </AnimatePresence>
  );
}
