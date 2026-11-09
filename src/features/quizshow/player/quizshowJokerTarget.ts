import type {
  QuizshowRoundCard,
  QuizshowStateBase,
} from "../../../shared/contracts/quizshow";
import { displayRoundNumber, isWheelRoundKind } from "../quizshowWheel";

export type QuizshowLobbyJokerTarget =
  | { kind: "round"; round: QuizshowRoundCard }
  | { kind: "wheel" } // show player.jokerOnRoundCard in place of the button
  | { kind: "none" };

const NO_JOKER_TARGET: QuizshowLobbyJokerTarget = { kind: "none" };

function jokerRoundTargetOf(
  rounds: ReadonlyArray<QuizshowRoundCard>,
  roundIndex: number | null,
): QuizshowLobbyJokerTarget {
  if (roundIndex === null) return NO_JOKER_TARGET;
  const round = rounds.find((candidate) => candidate.roundIndex === roundIndex);
  if (round === undefined) return NO_JOKER_TARGET;
  if (isWheelRoundKind(round.kind) || !round.isJokerAllowed) {
    return NO_JOKER_TARGET;
  }
  return { kind: "round", round };
}

/**
 * Where the phone may offer the joker, mirroring the server's joker moment.
 * lobby and leaderboard: from cursor.upNext (a round with isJokerAllowed, the
 * wheel, else none). round_intro: the cursor's own round when isJokerAllowed.
 * Any other phase: none.
 */
export function lobbyJokerTargetOf(
  session: Pick<QuizshowStateBase, "cursor" | "rounds">,
): QuizshowLobbyJokerTarget {
  const { cursor, rounds } = session;
  if (cursor.phase === "lobby" || cursor.phase === "leaderboard") {
    const { upNext } = cursor;
    if (upNext === null) return NO_JOKER_TARGET;
    if (upNext.kind === "wheel") return { kind: "wheel" };
    if (upNext.kind === "round") {
      return jokerRoundTargetOf(rounds, upNext.roundIndex);
    }
    return NO_JOKER_TARGET;
  }
  if (cursor.phase === "round_intro") {
    return jokerRoundTargetOf(rounds, cursor.roundIndex);
  }
  return NO_JOKER_TARGET;
}

/** "Joker played on round {number}": displayRoundNumber over the rounds. */
export function jokerRoundNumberOf(
  rounds: ReadonlyArray<QuizshowRoundCard>,
  roundIndex: number,
): number {
  return displayRoundNumber(rounds, roundIndex);
}
