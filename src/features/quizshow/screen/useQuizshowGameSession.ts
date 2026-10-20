import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { quizshowErrorCodeOf } from "../api/quizshowErrors";
import { useQuizshowQuiz } from "../api/useQuizshowQuiz";
import { quizshowGamePath } from "../quizshowPaths";
import { gameScope, quizshowScopeKey } from "../quizshowScope";
import {
  QUIZSHOW_NO_SESSION_REFETCH_MS,
  isQuizResponseAdultsOnly,
  useHeldLiveSession,
  type QuizshowHostSession,
} from "./quizshowHostSession";

/**
 * The game behind `:gameId` and its open lobby, for the screen and the remote.
 * Only the owner reads a game, so a successful read is the organiser check;
 * anyone else gets 404 `quizshow_game_not_found`. Demo: the game's demo lobby, when it has one.
 */
export function useQuizshowGameSession(
  gameId: string | undefined,
): QuizshowHostSession {
  const { demoMode } = useDemoMode();
  const scope = gameScope(gameId ?? "");
  const gameQuery = useQuizshowQuiz(scope, {
    isEnabled: gameId !== undefined,
    noSessionRefetchMs: QUIZSHOW_NO_SESSION_REFETCH_MS,
  });

  const liveSession = useHeldLiveSession(
    quizshowScopeKey(scope),
    gameQuery.data?.liveSession ?? null,
  );
  const isSessionHeld = !demoMode && liveSession !== null;
  // A held session came from a successful read, so a failed refetch keeps the owner in.
  const isOrganizer = demoMode || gameQuery.isSuccess || isSessionHeld;

  let errorCode = isSessionHeld ? null : quizshowErrorCodeOf(gameQuery.error);
  if (gameId === undefined) errorCode = "quizshow_game_not_found";

  // Demo reads the game's demo lobby the same way: a game with no open lobby shows the no-lobby state.
  const sessionId =
    gameId !== undefined && liveSession !== null ? liveSession.sessionId : null;

  return {
    scope,
    slug: null,
    eventTitle: null,
    gameTitle: gameQuery.data?.quiz?.title ?? "",
    isAdultsOnly: isQuizResponseAdultsOnly(gameQuery.data),
    backPath: quizshowGamePath(gameId ?? ""),
    backLabelKey: "quizshow:screen.backToGame",
    noGameKeys: {
      screen: "quizshow:screen.noGameForGame",
      remote: "quizshow:remote.noGameForGame",
    },
    isOrganizer,
    isLoading: gameQuery.isLoading,
    sessionId,
    errorCode,
    hasLoadFailed: !isSessionHeld && gameQuery.isError,
    playMode: liveSession?.playMode ?? "solo",
  };
}
