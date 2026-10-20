import { useState } from "react";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type {
  QuizshowErrorCode,
  QuizshowLiveSessionRef,
  QuizshowPlayMode,
} from "../../../shared/contracts/quizshow";
import { useEvent } from "../../gatherings/api/useEvent";
import { gatheringSlugFromParam } from "../../gatherings/gatheringPaths";
import { quizshowErrorCodeOf } from "../api/quizshowErrors";
import { useQuizshowQuiz } from "../api/useQuizshowQuiz";
import { QUIZSHOW_DEMO_SESSION_ID } from "../quizshow.constants";

/** While no session is open, the screen and the remote look for a new lobby this often. */
const NO_SESSION_REFETCH_MS = 15_000;

export interface QuizshowEventSession {
  slug: string;
  eventTitle: string;
  isOrganizer: boolean;
  isLoading: boolean;
  /** Live: the quiz GET's `liveSession.sessionId`, held after the session leaves the event
   *  (it ended, or a refetch failed) until a newer one opens. Demo: the demo session. */
  sessionId: string | null;
  /** A coded refusal, such as `quizshow_cohost_is_playing` from the quiz GET. Null while a session is held. */
  errorCode: QuizshowErrorCode | null;
  /** The event or the quiz could not be read; `errorCode` holds the reason when the server named one. False while a session is held. */
  hasLoadFailed: boolean;
  /** The open session's play mode; solo until a session says otherwise. */
  playMode: QuizshowPlayMode;
}

/** The event behind `:slug` and its open session, for the screen and the remote. Demo: the demo session. */
export function useQuizshowEventSession(
  routeParam: string | undefined,
): QuizshowEventSession {
  const { demoMode } = useDemoMode();
  const eventQuery = useEvent(routeParam);
  const gathering = eventQuery.data?.gathering;
  const slug = gathering?.slug ?? gatheringSlugFromParam(routeParam ?? "");
  const isOrganizer = demoMode || gathering?.viewerIsOrganizer === true;
  const quizQuery = useQuizshowQuiz(slug, {
    isEnabled: isOrganizer && gathering !== undefined,
    noSessionRefetchMs: NO_SESSION_REFETCH_MS,
  });

  // The quiz GET drops `liveSession` once the session ends, and a failed
  // background refetch is an error too: the last session seen stays held, so
  // the game keeps its thank-you screen until a newer session replaces it.
  // It is held per event: moving to another slug starts with nothing held.
  const currentSession = quizQuery.data?.liveSession ?? null;
  const [held, setHeld] = useState<{
    slug: string;
    session: QuizshowLiveSessionRef;
  } | null>(null);
  if (
    currentSession !== null &&
    (held === null ||
      held.slug !== slug ||
      currentSession.sessionId !== held.session.sessionId ||
      currentSession.playMode !== held.session.playMode)
  ) {
    setHeld({ slug, session: currentSession });
  }
  const heldSession = held !== null && held.slug === slug ? held.session : null;
  const liveSession = currentSession ?? heldSession;
  const isSessionHeld = !demoMode && liveSession !== null;

  const errorCode = isSessionHeld
    ? null
    : (quizshowErrorCodeOf(quizQuery.error) ??
      quizshowErrorCodeOf(eventQuery.error) ??
      (eventQuery.isError ? "quizshow_event_not_found" : null));
  const isLoading =
    eventQuery.isLoading || (isOrganizer && quizQuery.isLoading);

  let sessionId: string | null = null;
  if (demoMode) sessionId = QUIZSHOW_DEMO_SESSION_ID;
  else if (liveSession !== null) sessionId = liveSession.sessionId;

  return {
    slug,
    eventTitle: gathering?.title ?? "",
    isOrganizer,
    isLoading,
    sessionId,
    errorCode,
    hasLoadFailed: !isSessionHeld && (eventQuery.isError || quizQuery.isError),
    playMode: liveSession?.playMode ?? "solo",
  };
}
