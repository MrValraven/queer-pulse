import type {
  QuizshowQuiz,
  QuizshowRematch,
} from "../../../shared/contracts/quizshow";

/**
 * Carries the two demo store events a running demo engine must hear (plan
 * D8): a lobby refresh (C6.10, item 18) and a rematch (C6.17, item 38). The
 * demo stores are modules and the demo engine is a per-page hook, so the
 * stores emit here and `useQuizshowDemoEngine` subscribes. Pure and in memory:
 * nothing is stored or sent.
 */

export interface QuizshowDemoLobbyRefreshed {
  sessionId: string;
  quiz: QuizshowQuiz;
  sourceUpdatedAt: string;
}

type LobbyRefreshedListener = (event: QuizshowDemoLobbyRefreshed) => void;
type RematchListener = (rematch: QuizshowRematch) => void;

const lobbyRefreshedListeners = new Set<LobbyRefreshedListener>();
const rematchListeners = new Set<RematchListener>();

/** Calls every listener on a copy of the set, so a listener that unsubscribes while it runs never skips another. */
function notifyEach<Payload>(
  listeners: ReadonlySet<(payload: Payload) => void>,
  payload: Payload,
): void {
  for (const listener of [...listeners]) listener(payload);
}

export function emitDemoLobbyRefreshed(
  event: QuizshowDemoLobbyRefreshed,
): void {
  notifyEach(lobbyRefreshedListeners, event);
}

/** Returns the unsubscribe; calling it twice is harmless. */
export function onDemoLobbyRefreshed(
  listener: LobbyRefreshedListener,
): () => void {
  lobbyRefreshedListeners.add(listener);
  return () => {
    lobbyRefreshedListeners.delete(listener);
  };
}

export function emitDemoRematch(rematch: QuizshowRematch): void {
  notifyEach(rematchListeners, rematch);
}

/** Returns the unsubscribe; calling it twice is harmless. */
export function onDemoRematch(listener: RematchListener): () => void {
  rematchListeners.add(listener);
  return () => {
    rematchListeners.delete(listener);
  };
}
