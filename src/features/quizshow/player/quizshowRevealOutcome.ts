import type {
  QuizshowMyReveal,
  QuizshowPlayerState,
} from "../../../shared/contracts/quizshow";

/** How many entrants rank: teams in teams mode, players in solo. */
export function entrantTotalOf(state: QuizshowPlayerState): number {
  return state.playMode === "teams"
    ? state.lobby.teams.length
    : state.lobby.playerCount;
}

/** An order answer that missed the full order but put at least one item in its place. */
export function isPartialOrder(myReveal: QuizshowMyReveal): boolean {
  return (
    myReveal.hasAnswered &&
    myReveal.isCorrect === false &&
    myReveal.correctPositions !== null &&
    myReveal.correctPositions > 0
  );
}

/** The outcome line a reveal opens with, as a translation key. */
export function outcomeKeyOf(myReveal: QuizshowMyReveal): string | null {
  if (!myReveal.hasAnswered) return "quizshow:player.noAnswer";
  if (myReveal.isCorrect === true) return "quizshow:player.right";
  if (isPartialOrder(myReveal)) return "quizshow:player.someInPlace";
  if (myReveal.isCorrect === false) return "quizshow:player.wrong";
  return null;
}
