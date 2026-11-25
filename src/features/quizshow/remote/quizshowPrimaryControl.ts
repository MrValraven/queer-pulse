import type {
  QuizshowQuestionView,
  QuizshowSessionState,
  QuizshowStateBase,
} from "../../../shared/contracts/quizshow";
import {
  wheelSliceTitleOf,
  type QuizshowTranslate,
} from "../stage/quizshowWheelCopy";
import { pickQuizshowText, primaryLanguageOf } from "../stage/quizshowText";
import {
  drawnWheelSlicesOf,
  landedWheelSliceOf,
} from "../stage/quizshowWheelView";
import { isWheelSpinLanded } from "../quizshowWheel";

/**
 * The fields the big button reads; the host state and the screen state both
 * carry them (Try it passes its screen-role state). `role` tells a withheld
 * podium (screen, players) from the host's full one.
 */
export type QuizshowPrimaryControlState = Pick<
  QuizshowStateBase,
  "cursor" | "wheel" | "rounds" | "round" | "screenLanguage" | "podium"
> & {
  question: Pick<QuizshowQuestionView, "type"> | null;
  role?: QuizshowSessionState["role"];
};

export interface QuizshowPrimaryControl {
  name: "host:start" | "host:showAnswers" | "host:next" | "host:spin";
  labelKey: string;
  labelValues?: Record<string, string | number>;
  isBlocked: boolean;
}

type PodiumPlace = 1 | 2 | 3;

const PRIMARY = "quizshow:remote.primary";
const PODIUM_PLACES_IN_ORDER: readonly PodiumPlace[] = [3, 2, 1];
/** Above 3rd place: with nothing shown yet, every place is still to come. */
const NO_PLACE_SHOWN = 4;
const PODIUM_LABEL_KEYS: Record<PodiumPlace, string> = {
  3: `${PRIMARY}.revealThird`,
  2: `${PRIMARY}.revealSecond`,
  1: `${PRIMARY}.revealWinner`,
};

function nextControl(
  labelKey: string,
  labelValues?: Record<string, string | number>,
): QuizshowPrimaryControl {
  return labelValues === undefined
    ? { name: "host:next", labelKey, isBlocked: false }
    : { name: "host:next", labelKey, labelValues, isBlocked: false };
}

/**
 * The podium steps as the host sees them (contract 6.7): the distinct places,
 * 3rd first, a tie sharing a step. The screen and players see only the places
 * shown so far, so for them every place below the lowest one shown counts as
 * a step still to come.
 */
function podiumStepsOf(state: QuizshowPrimaryControlState): PodiumPlace[] {
  const places = new Set((state.podium ?? []).map((entry) => entry.place));
  const shownSteps = PODIUM_PLACES_IN_ORDER.filter((place) =>
    places.has(place),
  );
  const isWithheld = state.role === "screen" || state.role === "player";
  if (!isWithheld) return shownSteps;
  const lowestShownPlace: number = shownSteps.at(-1) ?? NO_PLACE_SHOWN;
  return [
    ...shownSteps,
    ...PODIUM_PLACES_IN_ORDER.filter((place) => place < lowestShownPlace),
  ];
}

/** Reveal 3rd, 2nd and the winner, one step per tap, then Finish the game. A null count means every place is out. */
function podiumControlOf(
  state: QuizshowPrimaryControlState,
): QuizshowPrimaryControl {
  const steps = podiumStepsOf(state);
  const revealedCount = state.cursor.podiumRevealedCount ?? steps.length;
  const nextPlace = steps[revealedCount];
  return nextPlace === undefined
    ? nextControl(`${PRIMARY}.finishGame`)
    : nextControl(PODIUM_LABEL_KEYS[nextPlace]);
}

/**
 * Where `host:next` goes once a question is done: back to a pick-a-question
 * wheel while it still has questions, the round's next question, or the end
 * of the round.
 */
function afterQuestionControlOf(
  state: QuizshowPrimaryControlState,
): QuizshowPrimaryControl {
  const { cursor, wheel } = state;
  // A warm-up reads by its name (C6.19): its last question ends the warm-up.
  const endRound =
    state.round?.isWarmUp === true
      ? nextControl(`${PRIMARY}.endWarmUp`)
      : nextControl(`${PRIMARY}.endRound`, { n: cursor.roundNumber });
  if (
    wheel !== null &&
    wheel.pick === "question" &&
    wheel.playingRoundIndex !== null
  ) {
    return drawnWheelSlicesOf(wheel).length > 0
      ? nextControl(`${PRIMARY}.openWheel`)
      : endRound;
  }
  const questionCount = state.round?.questionCount ?? 0;
  const { questionIndex } = cursor;
  if (questionIndex !== null && questionIndex + 1 < questionCount) {
    return nextControl(`${PRIMARY}.nextQuestion`, {
      n: questionIndex + 2,
      total: questionCount,
    });
  }
  return endRound;
}

/** A quiz question's reveal shows scores, unless it scored nobody: a warm-up round or a poll (contract 6.19, 6.22). */
function revealControlOf(
  state: QuizshowPrimaryControlState,
): QuizshowPrimaryControl {
  const isQuizRound = state.round?.kind === "quiz";
  const skipsScores =
    state.round?.isWarmUp === true || state.question?.type === "poll";
  return isQuizRound && !skipsScores
    ? nextControl(`${PRIMARY}.showScores`)
    : afterQuestionControlOf(state);
}

/**
 * Between rounds, by `cursor.upNext`: the next round by number and title
 * ("Start round 2" alone while its title is blank in both languages), the
 * wheel, or the podium.
 */
function leaderboardControlOf(
  state: QuizshowPrimaryControlState,
): QuizshowPrimaryControl {
  const { upNext, roundNumber } = state.cursor;
  if (upNext?.kind === "round") {
    const card = state.rounds.find(
      (round) => round.roundIndex === upNext.roundIndex,
    );
    const title =
      card === undefined
        ? ""
        : pickQuizshowText(
            card.title,
            primaryLanguageOf(state.screenLanguage),
          ).trim();
    return title === ""
      ? nextControl(`${PRIMARY}.startRoundUntitled`, { n: roundNumber + 1 })
      : nextControl(`${PRIMARY}.startRound`, { n: roundNumber + 1, title });
  }
  if (upNext?.kind === "wheel") return nextControl(`${PRIMARY}.openWheel`);
  return nextControl(`${PRIMARY}.showPodium`);
}

/**
 * The wheel's button: Spin, Spinning (blocked), then Play the landed round or
 * Play the question once it lands. A spin counts as landed at
 * `serverNowMs >= startedAt + durationMs`, with no tolerance, so the caller
 * re-renders at that moment.
 */
function wheelControlOf(
  state: QuizshowPrimaryControlState,
  serverNowMs: number,
  translate: QuizshowTranslate,
): QuizshowPrimaryControl {
  const { wheel } = state;
  if (wheel === null || wheel.spin === null) {
    return {
      name: "host:spin",
      labelKey: "quizshow:remote.wheel.spin",
      isBlocked: wheel === null,
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
    return nextControl("quizshow:remote.wheel.playQuestion");
  }
  const landedSlice = landedWheelSliceOf(wheel);
  if (landedSlice === null) {
    return nextControl("quizshow:remote.wheel.playQuestion");
  }
  return nextControl(`${PRIMARY}.playSlice`, {
    title: wheelSliceTitleOf(
      landedSlice,
      state.rounds,
      primaryLanguageOf(state.screenLanguage),
      translate,
    ),
  });
}

/**
 * The big button names what the next tap does (contract 9.2 item 7): Start
 * the game, Show the first question, Take answers now, Close answers, Close
 * writing, Show answers in review, Show scores, Next question (n of total) or
 * End round n (End the warm-up after a warm-up), the next round, the wheel or the podium, one podium place at a
 * time, then Finish the game. A slice with no title yet reads "Round N".
 */
export function quizshowPrimaryControlOf(
  state: QuizshowPrimaryControlState,
  serverNowMs: number,
  translate: QuizshowTranslate,
): QuizshowPrimaryControl {
  const { phase } = state.cursor;
  switch (phase) {
    case "lobby":
      return {
        name: "host:start",
        labelKey: `${PRIMARY}.start`,
        isBlocked: false,
      };
    case "round_intro":
      return nextControl(`${PRIMARY}.showFirstQuestion`);
    case "read":
      return nextControl(`${PRIMARY}.takeAnswers`);
    case "open":
    case "vote":
      return nextControl(`${PRIMARY}.closeAnswers`);
    case "write":
      return nextControl(`${PRIMARY}.closeWriting`);
    case "review":
      return {
        name: "host:showAnswers",
        labelKey: "quizshow:remote.showAnswers",
        isBlocked: false,
      };
    case "reveal":
      return revealControlOf(state);
    case "scores":
      return afterQuestionControlOf(state);
    case "leaderboard":
      return leaderboardControlOf(state);
    case "wheel":
      return wheelControlOf(state, serverNowMs, translate);
    case "podium":
      return podiumControlOf(state);
    case "ended":
      return { ...nextControl(`${PRIMARY}.finishGame`), isBlocked: true };
  }
}
