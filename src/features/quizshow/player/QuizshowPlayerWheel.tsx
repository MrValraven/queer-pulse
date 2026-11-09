import type { ReactNode } from "react";
import { AnimatePresence, m } from "motion/react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { Collapse } from "../../../shared/components/ui/Collapse";
import type {
  QuizshowLanguage,
  QuizshowMe,
  QuizshowPlayMode,
  QuizshowWheelBonusView,
  QuizshowWheelSlice,
  QuizshowWheelView,
} from "../../../shared/contracts/quizshow";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { QuizshowStageWheel } from "../stage/QuizshowStageWheel";
import {
  QuizshowWheelBonusChip,
  QuizshowWheelContentChip,
} from "../stage/QuizshowWheelChips";
import {
  wheelSliceTitleOf,
  type QuizshowRoundKindRows,
} from "../stage/quizshowWheelCopy";
import { QUIZSHOW_WHEEL_PANEL_DELAY_MS } from "../stage/quizshowWheelMotion";
import {
  drawnWheelSlicesOf,
  landedWheelSliceOf,
} from "../stage/quizshowWheelView";
import { useQuizshowWheelClock } from "../stage/useQuizshowWheelClock";
import { QuizshowPhoneWheelBonus } from "./QuizshowPhoneWheelBonus";
import { useQuizshowHeadingFocus } from "./useQuizshowHeadingFocus";
import styles from "./QuizshowPlayerWheel.module.css";

/** The heading cross-fade, in seconds. */
const HEADING_FADE_SECONDS = 0.15;

export interface QuizshowPlayerWheelProps {
  wheel: QuizshowWheelView;
  wheelBonus: QuizshowWheelBonusView | null;
  /** The session's round rows (or the studio's draft rows): a blank slice title reads "Round N". */
  rounds: QuizshowRoundKindRows;
  me: QuizshowMe | null;
  playMode: QuizshowPlayMode;
  language: QuizshowLanguage;
  clockOffsetMs: number;
  phaseId: string;
}

/** What the heading says: nothing in the air yet, a spin in the air, or the landed slice. */
function headingOf(
  wheel: QuizshowWheelView,
  landedSlice: QuizshowWheelSlice | null,
  isLanded: boolean,
): { key: string; messageKey: string } {
  if (wheel.spin === null) {
    return { key: "waiting", messageKey: "quizshow:player.wheel.waiting" };
  }
  if (!isLanded || landedSlice === null) {
    return { key: "spinning", messageKey: "quizshow:player.wheel.spinning" };
  }
  return {
    key: `landed-${landedSlice.roundIndex}`,
    messageKey: "quizshow:player.wheel.upNext",
  };
}

/**
 * The player's phone while the wheel is on: the bonus moment on top, a heading
 * that says what the wheel is doing, the compact disc, and under it the chips
 * for the slice that landed. Nothing to tap.
 */
export function QuizshowPlayerWheel({
  wheel,
  wheelBonus,
  rounds,
  me,
  playMode,
  language,
  clockOffsetMs,
  phaseId,
}: QuizshowPlayerWheelProps): ReactNode {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const headingRef = useQuizshowHeadingFocus(phaseId);
  // The phone turns with the TV: the landing shows 250 ms after the stop.
  const { isLanded } = useQuizshowWheelClock(
    wheel.spin,
    clockOffsetMs,
    QUIZSHOW_WHEEL_PANEL_DELAY_MS,
  );
  const landedSlice = isLanded ? landedWheelSliceOf(wheel) : null;
  const heading = headingOf(wheel, landedSlice, isLanded);
  const headingText = t(heading.messageKey, {
    title:
      landedSlice === null
        ? ""
        : wheelSliceTitleOf(landedSlice, rounds, language, t),
  });
  return (
    <div className={styles.screen}>
      <QuizshowPhoneWheelBonus
        bonus={wheelBonus}
        rounds={rounds}
        me={me}
        playMode={playMode}
        language={language}
      />
      <div aria-live="polite" className={styles.headingLive}>
        <h1 ref={headingRef} tabIndex={-1} className={styles.heading}>
          <AnimatePresence mode="wait" initial={false}>
            <m.span
              key={heading.key}
              className={styles.headingText}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: reducedMotion ? 0 : HEADING_FADE_SECONDS,
              }}
            >
              {headingText}
            </m.span>
          </AnimatePresence>
        </h1>
      </div>
      <div className={styles.wheelSlot}>
        <QuizshowStageWheel
          slices={drawnWheelSlicesOf(wheel)}
          rounds={rounds}
          spin={wheel.spin}
          clockOffsetMs={clockOffsetMs}
          language={language}
          size="phone"
        />
      </div>
      <Collapse isOpen={landedSlice !== null} className={styles.chipsFold}>
        {landedSlice !== null && (
          <div className={styles.chips} data-testid="quizshow-wheel-chips">
            {landedSlice.wheelBonus > 0 && (
              <QuizshowWheelBonusChip
                points={landedSlice.wheelBonus}
                labelKey="quizshow:player.wheel.bonusChip"
              />
            )}
            {wheel.pick === "question" && (
              <QuizshowWheelContentChip
                contentLabel={landedSlice.contentLabel}
              />
            )}
          </div>
        )}
      </Collapse>
    </div>
  );
}
