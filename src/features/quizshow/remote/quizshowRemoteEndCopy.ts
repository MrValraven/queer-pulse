import type {
  QuizshowHostState,
  QuizshowPhase,
} from "../../../shared/contracts/quizshow";

/** The phases of a question before its reveal, when that question has scored nothing yet. */
const BEFORE_REVEAL_PHASES: readonly QuizshowPhase[] = [
  "round_intro",
  "read",
  "open",
  "write",
  "review",
  "vote",
];

/**
 * True while nothing has scored yet, where ending abandons the game with no
 * results (the contract sends a running game to the podium only once a
 * question has scored). A first question that was skipped also scores
 * nothing; the state carries no flag for that case, so the podium copy shows
 * there.
 *
 * The wheel adds three cases. A pick-a-question wheel question is the first
 * score only on the first spin of the first round. The wheel itself is before
 * the first score when no round has started, or when a question wheel sits on
 * its first spin with the first round open. Every other case keeps the
 * first-question rule, with the played-count round number in place of the row
 * index.
 */
export function isBeforeFirstScore(state: QuizshowHostState): boolean {
  const { phase, roundIndex, questionIndex, roundNumber } = state.cursor;
  const { wheel } = state;
  if (
    wheel !== null &&
    wheel.playingRoundIndex !== null &&
    wheel.playingRoundIndex === roundIndex
  ) {
    return (
      wheel.spinNumber === 1 &&
      roundNumber === 1 &&
      BEFORE_REVEAL_PHASES.includes(phase)
    );
  }
  if (phase === "wheel") {
    if (roundNumber === 0) return true;
    return (
      wheel !== null &&
      wheel.pick === "question" &&
      wheel.spinNumber === 1 &&
      roundNumber === 1
    );
  }
  return (
    roundNumber <= 1 &&
    (questionIndex ?? 0) === 0 &&
    BEFORE_REVEAL_PHASES.includes(phase)
  );
}

/** What ending does from here: close the lobby, keep the podium, close with no score, or go to the podium. */
export function endConfirmBodyKeyOf(state: QuizshowHostState): string {
  const { phase } = state.cursor;
  if (phase === "lobby") return "quizshow:remote.endLobbyBody";
  if (phase === "podium") return "quizshow:remote.endPodiumBody";
  if (isBeforeFirstScore(state)) return "quizshow:remote.endUnscoredBody";
  return "quizshow:remote.endConfirmBody";
}
