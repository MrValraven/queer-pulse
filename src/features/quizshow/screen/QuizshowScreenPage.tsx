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
import { gatheringPath } from "../../gatherings/gatheringPaths";
import { quizshowErrorKeyOf } from "../api/quizshowErrors";
import type { QuizshowClientState } from "../realtime/quizshowClientStore";
import { useQuizshowFramelessPage } from "../useQuizshowFramelessPage";
import { useQuizshowSession } from "../realtime/useQuizshowSession";
import type { QuizshowCue } from "../sound/quizshowCues";
import { useQuizshowCues } from "../sound/useQuizshowCues";
import { QuizshowConnectionBanner } from "../stage/QuizshowConnectionBanner";
import { QuizshowScreenStage } from "./QuizshowScreenStage";
import { QuizshowScreenToolbar } from "./QuizshowScreenToolbar";
import {
  useQuizshowEventSession,
  type QuizshowEventSession,
} from "./useQuizshowEventSession";
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
  slug,
}: {
  messageKey: string;
  slug: string;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.message}>
      <h1 className={styles.messageTitle}>{t(messageKey)}</h1>
      {slug !== "" && (
        <Button variant="ghost" to={gatheringPath(slug)}>
          {t("quizshow:screen.backToEvent")}
        </Button>
      )}
    </div>
  );
}

interface QuizshowScreenLiveProps {
  eventSession: QuizshowEventSession;
  sessionId: string;
  theme: QuizshowScreenTheme;
  onToggleTheme: () => void;
  isLocallyMuted: boolean;
  onToggleLocalMute: () => void;
}

/** One attached screen: keyed by session, so a new game starts a fresh connection. */
function QuizshowScreenLive({
  eventSession,
  sessionId,
  theme,
  onToggleTheme,
  isLocallyMuted,
  onToggleLocalMute,
}: QuizshowScreenLiveProps) {
  const { slug, eventTitle, playMode } = eventSession;
  const { state, clockOffsetMs } = useQuizshowSession({
    sessionId,
    role: "screen",
    demo: {
      eventSlug: slug,
      eventTitle,
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
        slug={slug}
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
          slug={slug}
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

/** Load failures first: an event that failed to load has no organiser to check. */
function messageKeyOf(eventSession: QuizshowEventSession): string | null {
  if (eventSession.errorCode !== null)
    return quizshowErrorKeyOf(eventSession.errorCode);
  if (eventSession.hasLoadFailed) return "quizshow:errors.generic";
  if (!eventSession.isOrganizer) return "quizshow:errors.not_organiser";
  if (eventSession.sessionId === null) return "quizshow:screen.noGame";
  return null;
}

/** The presenter screen for the venue TV: chromeless, organisers only, dark by default. */
export function QuizshowScreenPage() {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const { slug: routeParam } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const { demoMode } = useDemoMode();
  const loadedEventSession = useQuizshowEventSession(routeParam);
  // The design review's switch to see team UI in demo; otherwise the open session's mode.
  const eventSession: QuizshowEventSession =
    demoMode && searchParams.get("demoPlayMode") === "teams"
      ? { ...loadedEventSession, playMode: "teams" }
      : loadedEventSession;
  useQuizshowFramelessPage();
  const { theme, toggleTheme } = useScreenTheme();
  // Once per page load: a new session remounts the live body, the mute stays.
  const { isLocallyMuted, toggleLocalMute } = useScreenLocalMute();

  useEffect(() => {
    primeMessageChime();
  }, []);

  const messageKey = eventSession.isLoading ? null : messageKeyOf(eventSession);
  const { sessionId } = eventSession;
  let viewKey = "loading";
  let body = (
    <div className={styles.message}>
      <Spinner />
    </div>
  );
  if (!eventSession.isLoading && messageKey !== null) {
    viewKey = `message-${messageKey}`;
    body = (
      <QuizshowScreenMessage messageKey={messageKey} slug={eventSession.slug} />
    );
  } else if (!eventSession.isLoading && sessionId !== null) {
    viewKey = `screen-${sessionId}`;
    body = (
      <QuizshowScreenLive
        key={`screen-${sessionId}`}
        eventSession={eventSession}
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
