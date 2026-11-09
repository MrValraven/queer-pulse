import { useState, type CSSProperties, type ReactNode } from "react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { appHost } from "../../../shared/lib/inviteUrl";
import type {
  QuizshowLanguage,
  QuizshowPlayMode,
  QuizshowWheelBonusView,
  QuizshowWheelSlice,
  QuizshowWheelSpin,
  QuizshowWheelView,
} from "../../../shared/contracts/quizshow";
import { serverNow } from "../realtime/quizshowClock";
import { wheelSpinLandsAt } from "../quizshowWheel";
import { QuizshowStageWheel } from "../stage/QuizshowStageWheel";
import {
  wheelPillCopy,
  wheelSliceTitleOf,
  type QuizshowRoundKindRows,
} from "../stage/quizshowWheelCopy";
import {
  QUIZSHOW_WHEEL_PANEL_DELAY_MS,
  QUIZSHOW_WHEEL_PANEL_FADE_MS,
} from "../stage/quizshowWheelMotion";
import {
  drawnWheelSlicesOf,
  landedWheelSliceOf,
} from "../stage/quizshowWheelView";
import { useQuizshowWheelClock } from "../stage/useQuizshowWheelClock";
import { wheelSpinIdentity } from "../stage/useQuizshowWheelSpin";
import type { QuizshowScreenStageSize } from "./QuizshowScreenStage";
import { WheelChoosePanel, WheelResultPanel } from "./QuizshowScreenWheelPanel";
import styles from "./QuizshowScreenWheel.module.css";

export interface QuizshowScreenWheelProps {
  wheel: QuizshowWheelView;
  wheelBonus: QuizshowWheelBonusView | null;
  /** The session's round rows (or the studio's draft rows): a blank slice title reads "Round N". */
  rounds: QuizshowRoundKindRows;
  /** null hides the join line (Try it, the studio). */
  joinCode: string | null;
  language: QuizshowLanguage;
  /** Part of the shared view shape; the award copy reads each winner's own kind. */
  playMode: QuizshowPlayMode;
  clockOffsetMs: number;
  size: QuizshowScreenStageSize;
}

/**
 * True when the spin has already stopped by the clock right now. Judged at the
 * stop itself, as the disc and the cues judge it, so a screen that first sees
 * the spin inside the panel's 250 ms delay still gets a still landing.
 */
function isSpinStopPast(
  spin: QuizshowWheelSpin | null,
  clockOffsetMs: number,
): boolean {
  if (spin === null) return false;
  return serverNow(Date.now(), clockOffsetMs) >= wheelSpinLandsAt(spin);
}

/**
 * Whether "Up next" shows, 250 ms after the stop in live play, and whether the
 * spin had already stopped when this screen first saw it (a mount, attach or
 * reconnect after the stop): that one shows at once, with no wait and no
 * cross-fade (contract 7.3). Judged per spin, so "spin again" fades back as usual.
 */
function useWheelPanelLanding(
  spin: QuizshowWheelSpin | null,
  clockOffsetMs: number,
): { isLanded: boolean; isLandedOnArrival: boolean } {
  const clock = useQuizshowWheelClock(
    spin,
    clockOffsetMs,
    QUIZSHOW_WHEEL_PANEL_DELAY_MS,
  );
  const spinIdentity = wheelSpinIdentity(spin);
  const [arrival, setArrival] = useState(() => ({
    spinIdentity,
    isLanded: isSpinStopPast(spin, clockOffsetMs),
  }));
  let isLandedOnArrival = arrival.isLanded;
  // A new spin: judge its arrival now, during render, so the first paint is right.
  if (arrival.spinIdentity !== spinIdentity) {
    isLandedOnArrival = isSpinStopPast(spin, clockOffsetMs);
    setArrival({ spinIdentity, isLanded: isLandedOnArrival });
  }
  return { isLanded: isLandedOnArrival || clock.isLanded, isLandedOnArrival };
}

/**
 * The slice the result panel draws. Shown: the landed slice. Hidden: the slice
 * it last showed, so a "spin again" fades the previous result out without
 * printing the next one; before any result, the landed slice, so the panel is
 * laid out before it fades in.
 */
function useResultSlice(
  landedSlice: QuizshowWheelSlice | null,
  isLanded: boolean,
): QuizshowWheelSlice | null {
  const [heldSlice, setHeldSlice] = useState(isLanded ? landedSlice : null);
  if (
    isLanded &&
    landedSlice !== null &&
    landedSlice.roundIndex !== heldSlice?.roundIndex
  ) {
    setHeldSlice(landedSlice);
  }
  if (isLanded) return landedSlice;
  return heldSlice ?? landedSlice;
}

/** The glass pill on the left of the top bar: "Wheel · spin 2 of 5". */
function WheelTopBar({
  wheel,
  joinCode,
}: {
  wheel: QuizshowWheelView;
  joinCode: string | null;
}) {
  const { t } = useTranslation();
  const pill = wheelPillCopy(wheel);
  return (
    <div className={styles.topBar}>
      <p className={styles.pill}>
        <span className={styles.pillDot} aria-hidden="true" />
        <span className={styles.pillText}>{t(pill.key, pill.values)}</span>
      </p>
      {joinCode !== null && (
        <p className={styles.join}>
          {t("quizshow:screen.joinAt", { host: appHost() })}{" "}
          <strong className={styles.joinCode}>{joinCode}</strong>
        </p>
      )}
    </div>
  );
}

/**
 * The TV's wheel phase, after the approved mockup: the top bar, the left
 * panel that cross-fades from "Still on the wheel" to "Up next" at the
 * landing, and the disc on the right. Pure of session state, so the TV, the
 * remote's preview, Try it and the studio canvas all mount it.
 */
export function QuizshowScreenWheel({
  wheel,
  wheelBonus,
  rounds,
  joinCode,
  language,
  clockOffsetMs,
  size,
}: QuizshowScreenWheelProps): ReactNode {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const { isLanded, isLandedOnArrival } = useWheelPanelLanding(
    wheel.spin,
    clockOffsetMs,
  );
  const landedSlice = landedWheelSliceOf(wheel);
  const resultSlice = useResultSlice(landedSlice, isLanded);
  const fadeStyle = {
    "--wheel-panel-fade": `${QUIZSHOW_WHEEL_PANEL_FADE_MS}ms`,
  } as CSSProperties;
  return (
    <div
      className={styles.wheelView}
      style={fadeStyle}
      data-quizshow-screen-wheel=""
      data-size={size}
      data-landed={String(isLanded)}
      data-instant={String(isLandedOnArrival)}
      data-reduced-motion={String(reducedMotion)}
    >
      <WheelTopBar wheel={wheel} joinCode={joinCode} />
      <div className={styles.panels}>
        <WheelChoosePanel
          wheel={wheel}
          wheelBonus={wheelBonus}
          rounds={rounds}
          language={language}
          isShown={!isLanded}
        />
        <WheelResultPanel
          slice={resultSlice}
          rounds={rounds}
          pick={wheel.pick}
          language={language}
          isShown={isLanded}
        />
      </div>
      <div className={styles.discFrame}>
        <QuizshowStageWheel
          slices={drawnWheelSlicesOf(wheel)}
          rounds={rounds}
          spin={wheel.spin}
          clockOffsetMs={clockOffsetMs}
          language={language}
          size={size}
        />
      </div>
      <p className={styles.visuallyHidden} role="status">
        {isLanded && landedSlice !== null
          ? t("quizshow:stage.wheel.landedOn", {
              title: wheelSliceTitleOf(landedSlice, rounds, language, t),
            })
          : ""}
      </p>
    </div>
  );
}
