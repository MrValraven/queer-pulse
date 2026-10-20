import { useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { AnimatePresence, m } from "motion/react";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { MAIN_CONTENT_ID } from "../../../shared/components/layout/SkipToContentLink";
import { Button, Spinner } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { PageMeta } from "../../../shared/seo";
import { primeMessageChime } from "../../../shared/lib/messageChime";
import {
  QUIZSHOW_ERROR_CODES,
  type QuizshowErrorCode,
} from "../../../shared/contracts/quizshow";
import { quizshowErrorKeyOf } from "../api/quizshowErrors";
import { hasQuizshowScopeId } from "../api/useQuizshowQuiz";
import type { QuizshowClientState } from "../realtime/quizshowClientStore";
import { useQuizshowFramelessPage } from "../useQuizshowFramelessPage";
import { useQuizshowSession } from "../realtime/useQuizshowSession";
import type { QuizshowCue } from "../sound/quizshowCues";
import { useQuizshowCues } from "../sound/useQuizshowCues";
import { QuizshowConnectionBanner } from "../stage/QuizshowConnectionBanner";
import { QuizshowScreenStage } from "./QuizshowScreenStage";
import { QuizshowScreenToolbar } from "./QuizshowScreenToolbar";
import {
  hostSessionDemoOptions,
  type QuizshowHostSession,
} from "./quizshowHostSession";
import { useQuizshowEventSession } from "./useQuizshowEventSession";
import {
  useScreenLocalMute,
  useScreenTheme,
  type QuizshowScreenTheme,
} from "./useScreenTheme";
import styles from "./QuizshowScreen.module.css";

const SCREEN_CUES: readonly QuizshowCue[] = [
  "playerJoined",
  "questionOpens",
  "timeAlmostUp",
  "reveal",
  "podium",
];
const KNOWN_ERROR_CODES: ReadonlySet<string> = new Set(QUIZSHOW_ERROR_CODES);

function refusalKeyOf(refusalCode: QuizshowClientState["refusalCode"]): string {
  const code =
    refusalCode !== null && KNOWN_ERROR_CODES.has(refusalCode)
      ? (refusalCode as QuizshowErrorCode)
      : null;
  return quizshowErrorKeyOf(code);
}

function QuizshowScreenMessage({
  messageKey,
  hostSession,
}: {
  messageKey: string;
  hostSession: QuizshowHostSession;
}) {
  const { t } = useTranslation();
  // No back link while the event or game behind the page is unknown.
  return (
    <div className={styles.message}>
      <h1 className={styles.messageTitle}>{t(messageKey)}</h1>
      {hasQuizshowScopeId(hostSession.scope) && (
        <Button variant="ghost" to={hostSession.backPath}>
          {t(hostSession.backLabelKey)}
        </Button>
      )}
    </div>
  );
}

interface QuizshowScreenLiveProps {
  hostSession: QuizshowHostSession;
  sessionId: string;
  theme: QuizshowScreenTheme;
  onToggleTheme: () => void;
  isLocallyMuted: boolean;
  onToggleLocalMute: () => void;
}

/** One attached screen: keyed by session, so a new game starts a fresh connection. */
function QuizshowScreenLive({
  hostSession,
  sessionId,
  theme,
  onToggleTheme,
  isLocallyMuted,
  onToggleLocalMute,
}: QuizshowScreenLiveProps) {
  const { backPath, backLabelKey, playMode } = hostSession;
  const scopeOptions = hostSessionDemoOptions(hostSession);
  const { state, clockOffsetMs } = useQuizshowSession({
    sessionId,
    role: "screen",
    gameId: scopeOptions.gameId,
    isAdultsOnly: scopeOptions.isAdultsOnly,
    demo: {
      ...scopeOptions,
      isAutoHost: true,
      hasSelfPlayer: false,
      playMode,
      suggestedScreenName: "",
      shouldLoop: true,
    },
  });
  const isScreenMuted = state.session?.isScreenMuted === true;
  useQuizshowCues(state, {
    isMuted: isScreenMuted || isLocallyMuted,
    clockOffsetMs,
    cues: SCREEN_CUES,
  });

  return (
    <>
      <QuizshowScreenToolbar
        backPath={backPath}
        backLabelKey={backLabelKey}
        theme={theme}
        onToggleTheme={onToggleTheme}
        isLocallyMuted={isLocallyMuted}
        isHostMuted={isScreenMuted}
        onToggleLocalMute={onToggleLocalMute}
      />
      <QuizshowConnectionBanner status={state.status} />
      {state.status === "refused" ? (
        <QuizshowScreenMessage
          messageKey={refusalKeyOf(state.refusalCode)}
          hostSession={hostSession}
        />
      ) : (
        <QuizshowScreenStage
          state={state}
          clockOffsetMs={clockOffsetMs}
          size="screen"
        />
      )}
    </>
  );
}

/** Load failures first: an event or game that failed to load has no organiser to check. */
function messageKeyOf(hostSession: QuizshowHostSession): string | null {
  if (hostSession.errorCode !== null)
    return quizshowErrorKeyOf(hostSession.errorCode);
  if (hostSession.hasLoadFailed) return "quizshow:errors.generic";
  if (!hostSession.isOrganizer) return "quizshow:errors.not_organiser";
  if (hostSession.sessionId === null) return hostSession.noGameKeys.screen;
  return null;
}

/** The presenter screen for the venue TV, for an event or a game: chromeless, organisers only, dark by default. */
export function QuizshowScreenView({
  hostSession: loadedHostSession,
}: {
  hostSession: QuizshowHostSession;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const [searchParams] = useSearchParams();
  const { demoMode } = useDemoMode();
  // The design review's switch to see team UI in demo; otherwise the open session's mode.
  const hostSession: QuizshowHostSession =
    demoMode && searchParams.get("demoPlayMode") === "teams"
      ? { ...loadedHostSession, playMode: "teams" }
      : loadedHostSession;
  useQuizshowFramelessPage();
  const { theme, toggleTheme } = useScreenTheme();
  // Once per page load: a new session remounts the live body, the mute stays.
  const { isLocallyMuted, toggleLocalMute } = useScreenLocalMute();

  useEffect(() => {
    primeMessageChime();
  }, []);

  const messageKey = hostSession.isLoading ? null : messageKeyOf(hostSession);
  const { sessionId } = hostSession;
  let viewKey = "loading";
  let body = (
    <div className={styles.message}>
      <Spinner />
    </div>
  );
  if (!hostSession.isLoading && messageKey !== null) {
    viewKey = `message-${messageKey}`;
    body = (
      <QuizshowScreenMessage
        messageKey={messageKey}
        hostSession={hostSession}
      />
    );
  } else if (!hostSession.isLoading && sessionId !== null) {
    viewKey = `screen-${sessionId}`;
    body = (
      <QuizshowScreenLive
        key={`screen-${sessionId}`}
        hostSession={hostSession}
        sessionId={sessionId}
        theme={theme}
        onToggleTheme={toggleTheme}
        isLocallyMuted={isLocallyMuted}
        onToggleLocalMute={toggleLocalMute}
      />
    );
  }

  return (
    <div className={styles.page} data-theme={theme} data-quizshow-screen="">
      <PageMeta title={t("quizshow:screen.metaTitle")} noIndex />
      <AnimatePresence mode="wait" initial={false}>
        <m.main
          key={viewKey}
          id={MAIN_CONTENT_ID}
          tabIndex={-1}
          className={styles.pageBody}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.25 }}
        >
          {body}
        </m.main>
      </AnimatePresence>
    </div>
  );
}

/** The event's presenter screen at `/gatherings/:slug/quizshow/screen`. */
export function QuizshowScreenPage() {
  const { slug: routeParam } = useParams<{ slug: string }>();
  const hostSession = useQuizshowEventSession(routeParam);
  return <QuizshowScreenView hostSession={hostSession} />;
}
