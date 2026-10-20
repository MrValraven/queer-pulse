import { AnimatePresence, m } from "motion/react";
import { useMemo, type ReactNode } from "react";
import { useLocation, useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "../../../app/providers/authContext";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { MAIN_CONTENT_ID } from "../../../shared/components/layout/SkipToContentLink";
import { Button } from "../../../shared/components/ui/Button";
import { Spinner } from "../../../shared/components/ui/Spinner";
import {
  QUIZSHOW_ERROR_CODES,
  QUIZSHOW_LIMITS,
  type QuizshowJoinResponse,
  type QuizshowPlayMode,
} from "../../../shared/contracts/quizshow";
import { PageMeta } from "../../../shared/seo/PageMeta";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { demoGetQuiz } from "../api/quizshowDemoStore";
import { quizshowErrorKeyOf } from "../api/quizshowErrors";
import {
  isJoinCodeShaped,
  normaliseJoinCode,
  quizshowPlayPath,
} from "../quizshowPaths";
import { isPlayerState } from "../realtime/quizshowClientStore";
import { QuizshowConnectionBanner } from "../stage/QuizshowConnectionBanner";
import { useQuizshowFramelessPage } from "../useQuizshowFramelessPage";
import { isRemovedOf } from "./usePlayJoin";
import {
  useQuizshowSession,
  type QuizshowSessionController,
} from "../realtime/useQuizshowSession";
import { QuizshowCodeForm } from "./QuizshowCodeForm";
import { QuizshowJoinForm } from "./QuizshowJoinForm";
import styles from "./QuizshowPlay.module.css";
import { QuizshowPlayerEnd, QuizshowRemovedNotice } from "./QuizshowPlayerEnd";
import { QuizshowPlayerLobby } from "./QuizshowPlayerLobby";
import { QuizshowPlayerStage } from "./QuizshowPlayerStage";
import { usePlayJoin, useRememberedPlace } from "./usePlayJoin";

type PlayScreen = "connecting" | "refused" | "join" | "lobby" | "stage" | "end";

function screenOf(controller: QuizshowSessionController): PlayScreen {
  const { state } = controller;
  const { session } = state;
  if (isRemovedOf(state) || state.sessionEnd !== null) return "end";
  if (state.status === "refused") return "refused";
  if (session?.cursor.phase === "ended") return "end";
  if (session === null || !isPlayerState(session)) return "connecting";
  if (session.me === null) return "join";
  const { phase, roundIndex } = session.cursor;
  const isLobbyScreen =
    phase === "lobby" || (phase === "round_intro" && roundIndex === 0);
  return isLobbyScreen ? "lobby" : "stage";
}

function Fade({ children }: { children: ReactNode }) {
  const { reducedMotion } = useMotionPrefs();
  const duration = reducedMotion ? 0 : 0.2;
  return (
    <m.div
      className={styles.column}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration, ease: [0.22, 0.68, 0.16, 1] }}
    >
      {children}
    </m.div>
  );
}

function Connecting() {
  const { t } = useTranslation();
  return (
    <div className={styles.loading} role="status">
      <Spinner />
      <span className={styles.visuallyHidden}>
        {t("quizshow:stage.reconnecting")}
      </span>
    </div>
  );
}

function RefusedNotice({
  controller,
}: {
  controller: QuizshowSessionController;
}) {
  const { t } = useTranslation();
  const code = QUIZSHOW_ERROR_CODES.find(
    (candidate) => candidate === controller.state.refusalCode,
  );
  return (
    <div className={styles.endStack}>
      <h1 className={styles.title} role="alert">
        {t(quizshowErrorKeyOf(code ?? null))}
      </h1>
      <Button to={quizshowPlayPath()} size="lg">
        {t("quizshow:player.codeTitle")}
      </Button>
    </div>
  );
}

function PlayGame({ join }: { join: QuizshowJoinResponse }) {
  const { user } = useAuth();
  const { demoMode } = useDemoMode();
  const [searchParams] = useSearchParams();
  const firstName = user?.profile.firstName.trim() ?? "";
  // The design review's switch to see team UI in demo; otherwise the open session's mode.
  const isDemoTeamsOverride =
    demoMode && searchParams.get("demoPlayMode") === "teams";
  const playMode = useMemo<QuizshowPlayMode>(() => {
    if (!demoMode) return "solo";
    if (isDemoTeamsOverride) return "teams";
    return demoGetQuiz(join.eventSlug).liveSession?.playMode ?? "solo";
  }, [demoMode, isDemoTeamsOverride, join.eventSlug]);
  const controller = useQuizshowSession({
    sessionId: join.sessionId,
    role: "player",
    demo: {
      eventSlug: join.eventSlug,
      eventTitle: join.eventTitle,
      isAutoHost: true,
      hasSelfPlayer: true,
      playMode,
      suggestedScreenName: firstName.slice(0, QUIZSHOW_LIMITS.screenNameMax),
      shouldLoop: false,
    },
  });
  const finalPlace = useRememberedPlace(controller.state);
  const screen = screenOf(controller);
  return (
    <>
      <QuizshowConnectionBanner status={controller.state.status} />
      <AnimatePresence mode="wait">
        <Fade key={screen}>
          {screen === "connecting" && <Connecting />}
          {screen === "refused" && <RefusedNotice controller={controller} />}
          {screen === "join" && <QuizshowJoinForm controller={controller} />}
          {screen === "lobby" && (
            <QuizshowPlayerLobby controller={controller} />
          )}
          {screen === "stage" && (
            <QuizshowPlayerStage controller={controller} />
          )}
          {screen === "end" && (
            <QuizshowPlayerEnd
              state={controller.state}
              eventSlug={join.eventSlug}
              finalPlace={finalPlace}
              onPlayAgain={
                controller.isDemo ? controller.restartDemo : undefined
              }
            />
          )}
        </Fade>
      </AnimatePresence>
    </>
  );
}

/** `/play` asks for a code; `/play/:code` joins that game and walks the player through it. */
export function QuizshowPlayPage() {
  const { t } = useTranslation();
  useQuizshowFramelessPage();
  const { code: codeParam } = useParams();
  const { key: locationKey } = useLocation();
  const typedCode =
    codeParam === undefined ? null : normaliseJoinCode(codeParam);
  const isShaped = typedCode !== null && isJoinCodeShaped(typedCode);
  const { join, errorCode, isPending, hasUnknownFailure } = usePlayJoin(
    isShaped ? typedCode : null,
    locationKey,
  );
  const shownErrorCode =
    typedCode !== null && !isShaped
      ? "quizshow_join_code_not_found"
      : errorCode;

  let viewKey = "code";
  if (join !== null) viewKey = `game:${join.sessionId}`;
  else if (shownErrorCode === "quizshow_player_removed") viewKey = "removed";
  else if (isPending) viewKey = "joining";

  return (
    <main id={MAIN_CONTENT_ID} tabIndex={-1} className={styles.page}>
      <PageMeta title={t("quizshow:player.metaTitle")} noIndex />
      <AnimatePresence mode="wait">
        <Fade key={viewKey}>
          {viewKey === "joining" && <Connecting />}
          {viewKey === "removed" && <QuizshowRemovedNotice eventSlug={null} />}
          {join !== null && <PlayGame key={viewKey} join={join} />}
          {viewKey === "code" && (
            <QuizshowCodeForm
              initialErrorCode={shownErrorCode}
              hasUnknownFailure={hasUnknownFailure}
            />
          )}
        </Fade>
      </AnimatePresence>
    </main>
  );
}
