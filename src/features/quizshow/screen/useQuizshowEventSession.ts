import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useEvent } from "../../gatherings/api/useEvent";
import {
  gatheringPath,
  gatheringSlugFromParam,
} from "../../gatherings/gatheringPaths";
import { quizshowErrorCodeOf } from "../api/quizshowErrors";
import { useQuizshowQuiz } from "../api/useQuizshowQuiz";
import { QUIZSHOW_DEMO_SESSION_ID } from "../quizshow.constants";
import { eventScope, quizshowScopeKey } from "../quizshowScope";
import {
  QUIZSHOW_NO_SESSION_REFETCH_MS,
  isQuizResponseAdultsOnly,
  useHeldLiveSession,
  type QuizshowHostSession,
} from "./quizshowHostSession";

export type { QuizshowEventSession } from "./quizshowHostSession";

/** The event behind `:slug` and its open session, for the screen and the remote. Demo: the demo session. */
export function useQuizshowEventSession(
  routeParam: string | undefined,
): QuizshowHostSession {
  const { demoMode } = useDemoMode();
  const eventQuery = useEvent(routeParam);
  const gathering = eventQuery.data?.gathering;
  const slug = gathering?.slug ?? gatheringSlugFromParam(routeParam ?? "");
  const isOrganizer = demoMode || gathering?.viewerIsOrganizer === true;
  const scope = eventScope(slug);
  const quizQuery = useQuizshowQuiz(scope, {
    isEnabled: isOrganizer && gathering !== undefined,
    noSessionRefetchMs: QUIZSHOW_NO_SESSION_REFETCH_MS,
  });

  const liveSession = useHeldLiveSession(
    quizshowScopeKey(scope),
    quizQuery.data?.liveSession ?? null,
  );
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
    scope,
    slug,
    eventTitle: gathering?.title ?? "",
    gameTitle: "",
    isAdultsOnly: isQuizResponseAdultsOnly(quizQuery.data),
    backPath: gatheringPath(slug),
    backLabelKey: "quizshow:screen.backToEvent",
    noGameKeys: {
      screen: "quizshow:screen.noGame",
      remote: "quizshow:remote.noGame",
    },
    isOrganizer,
    isLoading,
    sessionId,
    errorCode,
    hasLoadFailed: !isSessionHeld && (eventQuery.isError || quizQuery.isError),
    playMode: liveSession?.playMode ?? "solo",
  };
}
