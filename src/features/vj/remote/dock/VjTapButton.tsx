import type { MouseEvent, PointerEvent } from "react";
import { m } from "motion/react";
import { useMotionPrefs } from "../../../../app/providers/motionPrefs";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { useVjMidiLearnTarget } from "../midi/useVjMidiLearnTarget";
import styles from "./VjDockRows.module.css";

/** The app's ease-out token (--ease-out) at the fast duration (--dur-fast). */
const VJ_TAP_SQUEEZE_TRANSITION = {
  duration: 0.15,
  ease: [0.16, 1, 0.3, 1] as const,
};
const VJ_TAP_SQUEEZE = { scale: 0.9 };

export interface VjTapButtonProps {
  isBlocked: boolean;
  /** One call per tap; the dispatcher keeps the tap register. */
  onTap: () => void;
  /** The status line naming why the controls are blocked and, while help is
   *  on, the Tap help caption, for aria-describedby. */
  describedBy?: string;
}

/**
 * Tap tempo. A pointer tap counts on press (the click lands a finger lift
 * later, which would smear the timing); Enter or Space count through the
 * keyboard click. Each press answers with a short squeeze, none under
 * reduced motion. MIDI learn can pick it as the tap tempo target.
 */
export function VjTapButton({
  isBlocked,
  onTap,
  describedBy,
}: VjTapButtonProps) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const { learnProps } = useVjMidiLearnTarget({ kind: "tapTempo" });

  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0 || isBlocked) return;
    onTap();
  };
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    // detail 0 is a keyboard click; a pointer tap already counted on press.
    if (event.detail !== 0 || isBlocked) return;
    onTap();
  };

  return (
    <m.button
      type="button"
      className={styles.chip}
      data-vj-tap=""
      aria-label={t("vj:tempo.tapAria")}
      aria-disabled={isBlocked || undefined}
      aria-describedby={describedBy}
      whileTap={reducedMotion || isBlocked ? undefined : VJ_TAP_SQUEEZE}
      transition={VJ_TAP_SQUEEZE_TRANSITION}
      onPointerDown={handlePointerDown}
      onClick={handleClick}
      {...learnProps}
    >
      {t("vj:tempo.tap")}
    </m.button>
  );
}
