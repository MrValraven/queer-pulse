import type { QuizshowStateBase } from "../../../shared/contracts/quizshow";
import {
  wheelSliceTitleOf,
  type QuizshowTranslate,
} from "../stage/quizshowWheelCopy";
import { landedWheelSliceOf } from "../stage/quizshowWheelView";
import { isWheelSpinLanded } from "../quizshowWheel";

/** The fields the big button reads; the host state and the screen state both carry them (Try it passes its screen-role state). */
export type QuizshowPrimaryControlState = Pick<
  QuizshowStateBase,
  "cursor" | "wheel" | "rounds" | "screenLanguage"
>;

export interface QuizshowPrimaryControl {
  name: "host:start" | "host:showAnswers" | "host:next" | "host:spin";
  labelKey: string;
  labelValues?: Record<string, string>;
  isBlocked: boolean;
}

/**
 * The big button: Start game in the lobby, Show answers in review, the wheel's
 * Spin, Spinning (blocked) and Start round or Play question once it landed,
 * Next elsewhere. A slice with no title yet reads "Round N". A spin counts as landed at `serverNowMs >= startedAt + durationMs`,
 * with no tolerance, so the caller re-renders at that moment.
 */
export function quizshowPrimaryControlOf(
  state: QuizshowPrimaryControlState,
  serverNowMs: number,
  translate: QuizshowTranslate,
): QuizshowPrimaryControl {
  const { phase } = state.cursor;
  if (phase === "lobby") {
    return {
      name: "host:start",
      labelKey: "quizshow:remote.start",
      isBlocked: false,
    };
  }
  if (phase === "review") {
    return {
      name: "host:showAnswers",
      labelKey: "quizshow:remote.showAnswers",
      isBlocked: false,
    };
  }
  const { wheel } = state;
  if (phase === "wheel" && wheel !== null) {
    if (wheel.spin === null) {
      return {
        name: "host:spin",
        labelKey: "quizshow:remote.wheel.spin",
        isBlocked: false,
      };
    }
    if (!isWheelSpinLanded(wheel.spin, serverNowMs)) {
      return {
        name: "host:spin",
        labelKey: "quizshow:remote.wheel.spinning",
        isBlocked: true,
      };
    }
    if (wheel.pick === "question") {
      return {
        name: "host:next",
        labelKey: "quizshow:remote.wheel.playQuestion",
        isBlocked: false,
      };
    }
    const landedSlice = landedWheelSliceOf(wheel);
    if (landedSlice !== null) {
      return {
        name: "host:next",
        labelKey: "quizshow:remote.wheel.startRound",
        labelValues: {
          title: wheelSliceTitleOf(
            landedSlice,
            state.rounds,
            state.screenLanguage,
            translate,
          ),
        },
        isBlocked: false,
      };
    }
  }
  return {
    name: "host:next",
    labelKey: "quizshow:remote.next",
    isBlocked: false,
  };
}
