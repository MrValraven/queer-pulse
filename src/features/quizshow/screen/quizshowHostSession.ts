import { useState } from "react";
import type {
  QuizshowErrorCode,
  QuizshowLiveSessionRef,
  QuizshowPlayMode,
  QuizshowQuizResponse,
} from "../../../shared/contracts/quizshow";
import { hasAdultsRound } from "../api/quizshowDemoQuizzes";
import type { QuizshowDemoEngineOptions } from "../engine/useQuizshowDemoEngine";
import type { QuizshowScope } from "../quizshowScope";

/** While no session is open, the screen and the remote look for a new lobby this often. */
export const QUIZSHOW_NO_SESSION_REFETCH_MS = 15_000;

/** The event or game behind the screen and the remote, and its open session. */
export interface QuizshowHostSession {
  scope: QuizshowScope;
  /** The event's slug; null for a game. */
  slug: string | null;
  /** The event's title; null for a game. */
  eventTitle: string | null;
  /** The game's quiz title; "" for an event. */
  gameTitle: string;
  /** The scope's 18+ flag, or an adults round in its quiz: a first join then needs consent. */
  isAdultsOnly: boolean;
  /** The event page or the game page. */
  backPath: string;
  backLabelKey: "quizshow:screen.backToEvent" | "quizshow:screen.backToGame";
  /** What the screen and the remote say while no lobby is open. */
  noGameKeys: { screen: string; remote: string };
  isOrganizer: boolean;
  isLoading: boolean;
  /** Live: the quiz GET's `liveSession.sessionId`, held after the session leaves the scope
   *  (it ended, or a refetch failed) until a newer one opens. Demo: the demo session. */
  sessionId: string | null;
  /** A coded refusal, such as `quizshow_cohost_is_playing` from the quiz GET. Null while a session is held. */
  errorCode: QuizshowErrorCode | null;
  /** The event, game or quiz could not be read; `errorCode` holds the reason when the server named one. False while a session is held. */
  hasLoadFailed: boolean;
  /** The open session's play mode; solo until a session says otherwise. */
  playMode: QuizshowPlayMode;
}

/** The name the event screen and remote have always used. */
export type QuizshowEventSession = QuizshowHostSession;

/**
 * The quiz GET drops `liveSession` once the session ends, and a failed
 * background refetch is an error too: the last session seen stays held, so
 * the game keeps its thank-you screen until a newer session replaces it.
 * It is held per scope: moving to another event or game starts with nothing held.
 */
export function useHeldLiveSession(
  scopeKey: string,
  current: QuizshowLiveSessionRef | null,
): QuizshowLiveSessionRef | null {
  const [held, setHeld] = useState<{
    scopeKey: string;
    session: QuizshowLiveSessionRef;
  } | null>(null);
  if (
    current !== null &&
    (held === null ||
      held.scopeKey !== scopeKey ||
      current.sessionId !== held.session.sessionId ||
      current.playMode !== held.session.playMode)
  ) {
    setHeld({ scopeKey, session: current });
  }
  const heldSession =
    held !== null && held.scopeKey === scopeKey ? held.session : null;
  return current ?? heldSession;
}

/** The scope's 18+ flag, or an adults round in its quiz. A missing quiz reads false. */
export function isQuizResponseAdultsOnly(
  response: QuizshowQuizResponse | undefined,
): boolean {
  if (response === undefined) return false;
  if (response.isAdultsEvent) return true;
  return response.quiz !== null && hasAdultsRound(response.quiz);
}

/** The scope fields the demo engine plays from: the event's slug and title, or the game's id. */
export function hostSessionDemoOptions(
  hostSession: QuizshowHostSession,
): Pick<
  QuizshowDemoEngineOptions,
  "eventSlug" | "eventTitle" | "gameId" | "isAdultsOnly"
> {
  const { scope } = hostSession;
  return {
    eventSlug: scope.kind === "event" ? scope.eventSlug : null,
    eventTitle: scope.kind === "event" ? hostSession.eventTitle : null,
    gameId: scope.kind === "game" ? scope.gameId : null,
    isAdultsOnly: hostSession.isAdultsOnly,
  };
}
