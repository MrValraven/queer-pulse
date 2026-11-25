import type { ReactNode } from "react";
import {
  FiEye,
  FiFlag,
  FiPause,
  FiPlay,
  FiPlusCircle,
  FiRefreshCw,
  FiRotateCcw,
  FiRotateCw,
  FiSkipForward,
  FiStopCircle,
} from "react-icons/fi";
import {
  QUIZSHOW_TIMED_PHASES,
  type QuizshowHostState,
  type QuizshowPhase,
} from "../../../shared/contracts/quizshow";
import { QUIZSHOW_REMOTE_ADD_TIME_SECONDS } from "../quizshow.constants";
import type { QuizshowHostFrameName } from "../engine/quizshowEngineTypes";
import { isWheelSpinLanded } from "../quizshowWheel";
import type { useQuizshowHostCommand } from "./useQuizshowHostCommand";
import type { QuizshowSkipTarget } from "./useSkipHold";

const TIMED_PHASES: readonly QuizshowPhase[] = [...QUIZSHOW_TIMED_PHASES];
const REVEAL_PHASES: readonly QuizshowPhase[] = ["open", "vote"];
const SKIP_PHASES: readonly QuizshowPhase[] = [
  "read",
  "open",
  "write",
  "review",
  "vote",
];
const UNPAUSABLE_PHASES: readonly QuizshowPhase[] = ["lobby", "ended"];
/** Pause and Resume share one slot, so the button keeps focus when it flips. */
const PAUSE_RESUME_KEY = "pauseResume";

export interface SecondaryControl {
  key: string;
  name: QuizshowHostFrameName;
  labelKey: string;
  icon: ReactNode;
  isBlocked: boolean;
  /** Where it goes first when the bar is narrow: a higher number folds earlier; a control without one stays in view. */
  foldRank?: number;
  onActivate: () => void;
}

/** The controls a narrow bar fits in one row before the foldable ones move behind "More controls". */
export const NARROW_BAR_MAX_CONTROLS = 4;

/**
 * Splits the controls for a bar too narrow for them all: past
 * NARROW_BAR_MAX_CONTROLS, the foldable ones (Add time) go behind "More
 * controls", which takes a fifth, narrower place in the row. End game, Pause,
 * Reveal and Skip always stay in view.
 */
export function splitControlsForNarrowBar(controls: SecondaryControl[]): {
  visible: SecondaryControl[];
  folded: SecondaryControl[];
} {
  const foldable = controls
    .filter((control) => control.foldRank !== undefined)
    .sort((first, second) => (second.foldRank ?? 0) - (first.foldRank ?? 0));
  const foldedKeys = new Set<string>();
  for (const control of foldable) {
    if (controls.length - foldedKeys.size <= NARROW_BAR_MAX_CONTROLS) break;
    foldedKeys.add(control.key);
  }
  return {
    visible: controls.filter((control) => !foldedKeys.has(control.key)),
    folded: controls.filter((control) => foldedKeys.has(control.key)),
  };
}

type RunHostCommand = ReturnType<typeof useQuizshowHostCommand>["run"];

export interface SecondaryControlHandlers {
  onEnd: () => void;
  onFinishWheel: () => void;
  /** Skip waits for an Undo first (useSkipHold), so it gets the phase id the tap was made in. */
  onSkip: (phaseId: string, target: QuizshowSkipTarget) => void;
  /** What the Skip waiting for its Undo passes over; null when none waits. */
  heldSkipTarget: QuizshowSkipTarget | null;
  /** Takes the waiting Skip back. */
  onUndoSkip: () => void;
}

/** Pause while running, Resume while paused, nothing in the lobby and after the end. */
function pauseResumeControlOf(
  state: QuizshowHostState,
  run: RunHostCommand,
): SecondaryControl | null {
  const { phase, status, phaseId } = state.cursor;
  if (status === "paused") {
    return {
      key: PAUSE_RESUME_KEY,
      name: "host:resume",
      labelKey: "quizshow:remote.resume",
      icon: <FiPlay aria-hidden="true" fill="none" />,
      isBlocked: false,
      onActivate: () => void run("host:resume", { phaseId }),
    };
  }
  if (status === "running" && !UNPAUSABLE_PHASES.includes(phase)) {
    return {
      key: PAUSE_RESUME_KEY,
      name: "host:pause",
      labelKey: "quizshow:remote.pause",
      icon: <FiPause aria-hidden="true" fill="none" />,
      isBlocked: false,
      onActivate: () => void run("host:pause", { phaseId }),
    };
  }
  return null;
}

/**
 * The wheel's own controls: Spin again once a spin landed and Finish the wheel
 * in the wheel phase, then Spin for the next round on an eligible leaderboard.
 * All of them wait while the game is paused.
 */
function wheelControlsOf(
  state: QuizshowHostState,
  serverNowMs: number,
  run: RunHostCommand,
  onFinishWheel: () => void,
): SecondaryControl[] {
  const { cursor, wheel } = state;
  const { phase, phaseId, status } = cursor;
  const isBlocked = status !== "running";
  const controls: SecondaryControl[] = [];
  if (phase === "wheel") {
    if (wheel !== null && wheel.spin !== null) {
      if (isWheelSpinLanded(wheel.spin, serverNowMs)) {
        controls.push({
          key: "spinAgain",
          name: "host:spin",
          labelKey: "quizshow:remote.wheel.spinAgain",
          icon: <FiRotateCw aria-hidden="true" fill="none" />,
          isBlocked,
          onActivate: () => void run("host:spin", { phaseId }),
        });
      }
    }
    controls.push({
      key: "finishWheel",
      name: "host:finishWheel",
      labelKey: "quizshow:remote.wheel.finish",
      icon: <FiFlag aria-hidden="true" fill="none" />,
      isBlocked,
      onActivate: onFinishWheel,
    });
  }
  if (phase === "leaderboard" && cursor.canSpinForNextRound) {
    controls.push({
      key: "spinForNextRound",
      name: "host:spin",
      labelKey: "quizshow:remote.wheel.spinForNextRound",
      icon: <FiRefreshCw aria-hidden="true" fill="none" />,
      isBlocked,
      onActivate: () => void run("host:spin", { phaseId }),
    });
  }
  return controls;
}

/** Add time, Reveal and Skip, where the contract allows them. */
function questionControlsOf(
  state: QuizshowHostState,
  run: RunHostCommand,
  skipHandlers: Pick<
    SecondaryControlHandlers,
    "onSkip" | "heldSkipTarget" | "onUndoSkip"
  >,
): SecondaryControl[] {
  const { phase, status, phaseId, deadline } = state.cursor;
  const isRunning = status === "running";
  const controls: SecondaryControl[] = [];
  if (isRunning && TIMED_PHASES.includes(phase) && deadline !== null) {
    controls.push({
      key: "addTime",
      name: "host:addTime",
      labelKey: "quizshow:remote.addTime",
      icon: <FiPlusCircle aria-hidden="true" fill="none" />,
      isBlocked: false,
      foldRank: 1,
      onActivate: () =>
        void run("host:addTime", {
          phaseId,
          seconds: QUIZSHOW_REMOTE_ADD_TIME_SECONDS,
          expectedDeadline: deadline,
        }),
    });
  }
  if (REVEAL_PHASES.includes(phase)) {
    controls.push({
      key: "reveal",
      name: "host:reveal",
      labelKey: "quizshow:remote.reveal",
      icon: <FiEye aria-hidden="true" fill="none" />,
      isBlocked: !isRunning,
      onActivate: () => void run("host:reveal", { phaseId }),
    });
  }
  const isQuizReveal = phase === "reveal" && state.round?.kind === "quiz";
  // From a quiz reveal Skip passes over the scores step, which a warm-up or a poll does not have.
  const hasScoresStep =
    isQuizReveal &&
    state.round?.isWarmUp !== true &&
    state.question?.type !== "poll";
  if (SKIP_PHASES.includes(phase) || isQuizReveal) {
    // While a Skip waits for its Undo, the button itself is the Undo, under the thumb.
    if (skipHandlers.heldSkipTarget !== null) {
      controls.push({
        key: "skip",
        name: "host:skip",
        labelKey: "quizshow:remote.skipUndoAction",
        icon: <FiRotateCcw aria-hidden="true" fill="none" />,
        isBlocked: false,
        onActivate: skipHandlers.onUndoSkip,
      });
    } else {
      controls.push({
        key: "skip",
        name: "host:skip",
        labelKey: hasScoresStep
          ? "quizshow:remote.skipScores"
          : "quizshow:remote.skip",
        icon: <FiSkipForward aria-hidden="true" fill="none" />,
        isBlocked: !isRunning,
        onActivate: () =>
          skipHandlers.onSkip(phaseId, hasScoresStep ? "scores" : "question"),
      });
    }
  }
  return controls;
}

/**
 * Which secondary controls the contract allows in this phase and status, in
 * order: Pause or Resume, the wheel's controls, Add time, Reveal, Skip, End.
 * `serverNowMs` decides whether a spin has landed, so Spin again appears at the
 * stop.
 */
export function secondaryControlsOf(
  state: QuizshowHostState,
  serverNowMs: number,
  run: RunHostCommand,
  handlers: SecondaryControlHandlers,
): SecondaryControl[] {
  const pauseResume = pauseResumeControlOf(state, run);
  return [
    ...(pauseResume === null ? [] : [pauseResume]),
    ...wheelControlsOf(state, serverNowMs, run, handlers.onFinishWheel),
    ...questionControlsOf(state, run, handlers),
    {
      key: "end",
      name: "host:end",
      labelKey: "quizshow:remote.end",
      icon: <FiStopCircle aria-hidden="true" fill="none" />,
      isBlocked: false,
      onActivate: handlers.onEnd,
    },
  ];
}
