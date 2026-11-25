import { isWheelRoundKind } from "../quizshowWheel";
import {
  isPlayerState,
  type QuizshowClientState,
} from "../realtime/quizshowClientStore";
import { isRemovedOf } from "./usePlayJoin";

/** Which of the phone's screens the player's state calls for. */
export type QuizshowPlayerScreen =
  "connecting" | "refused" | "join" | "lobby" | "stage" | "end";

/**
 * The phone's screen for this state, shared by the play page and the studio
 * try-out's phone. "join" is the step before the player has a row; the play
 * page puts its 18+ step in front of it.
 */
export function playerScreenOf(
  state: QuizshowClientState,
): QuizshowPlayerScreen {
  const { session } = state;
  if (isRemovedOf(state) || state.sessionEnd !== null) return "end";
  if (state.status === "refused") return "refused";
  if (session?.cursor.phase === "ended") return "end";
  if (session === null || !isPlayerState(session)) return "connecting";
  if (session.me === null) return "join";
  const { phase, roundNumber, roundIndex } = session.cursor;
  // The first title card shows on the big screen while the phone stays on the
  // lobby, unless a wheel opened the game: then the card after it is a stage.
  const hasWheelBefore = session.rounds
    .slice(0, roundIndex ?? 0)
    .some((row) => isWheelRoundKind(row.kind));
  const isLobbyScreen =
    phase === "lobby" ||
    (phase === "round_intro" && roundNumber === 1 && !hasWheelBefore);
  return isLobbyScreen ? "lobby" : "stage";
}
