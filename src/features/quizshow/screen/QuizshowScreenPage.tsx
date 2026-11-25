import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useLocation, useParams, useSearchParams } from "react-router-dom";
import { AnimatePresence, m } from "motion/react";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { routes } from "../../../app/routeMap";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { MAIN_CONTENT_ID } from "../../../shared/components/layout/SkipToContentLink";
import { Button, Spinner } from "../../../shared/components/ui";
import { useScreenWakeLock } from "../../../shared/hooks/useScreenWakeLock";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { PageMeta } from "../../../shared/seo";
import { primeMessageChime } from "../../../shared/lib/messageChime";
import {
  quizshowErrorKeyOf,
  quizshowLoadFailureKeyOf,
  quizshowRefusalActionOf,
  quizshowRefusalKeyOf,
  type QuizshowRefusalAction,
} from "../api/quizshowErrors";
import { hasQuizshowScopeId } from "../api/useQuizshowQuiz";
import { useQuizshowFramelessPage } from "../useQuizshowFramelessPage";
import { useQuizshowSession } from "../realtime/useQuizshowSession";
import type { QuizshowCue } from "../sound/quizshowCues";
import {
  useQuizshowCues,
  useQuizshowSoundLevel,
} from "../sound/useQuizshowCues";
import { QuizshowBackdrop } from "../stage/QuizshowBackdrop";
import { QuizshowConnectionBanner } from "../stage/QuizshowConnectionBanner";
import { QuizshowScreenReactions } from "./QuizshowScreenReactions";
import { QuizshowScreenSoundChip } from "./QuizshowScreenSoundChip";
import { QuizshowScreenStage } from "./QuizshowScreenStage";
import {
  QuizshowScreenToolbar,
  type QuizshowScreenControls,
} from "./QuizshowScreenToolbar";
import {
  hostSessionDemoOptions,
  type QuizshowHostSession,
} from "./quizshowHostSession";
import { useHidePointerWhenStill } from "./useHidePointerWhenStill";
import { useQuizshowEventSession } from "./useQuizshowEventSession";
import { useScreenLocalMute, useScreenTheme } from "./useScreenTheme";
import styles from "./QuizshowScreen.module.css";

const SCREEN_CUES: readonly QuizshowCue[] = [
  "playerJoined",
  "questionOpens",
  "timeAlmostUp",
  "reveal",
  "podium",
  "podiumDrum",
  // The TV only: the phones and the remote leave the wheel's sound out.
  "wheelTick",
  "wheelLand",
];

/** A paired TV's ticket ran out: the socket names it TOKEN_EXPIRED, the TV page reads the coded refusal. */
function screenRefusalCodeOf(
  refusalCode: string | null,
  hasDeviceTicket: boolean,
): string | null {
  return hasDeviceTicket && refusalCode === "TOKEN_EXPIRED"
    ? "quizshow_device_ticket_expired"
    : refusalCode;
}

/** The way out of a refusal; a paired TV has no sign-in of its own, so its back control (a new code) stays. */
function screenRefusalActionOf(
  refusalCode: string | null,
  hasDeviceTicket: boolean,
): QuizshowRefusalAction {
  const action = quizshowRefusalActionOf(refusalCode);
  return hasDeviceTicket && action === "signIn" ? "enterCode" : action;
}

/** The way out a refusal fits: sign in again, reload, or the page's own back link. */
function RefusalActionButton({ action }: { action: "signIn" | "reload" }) {
  const { t } = useTranslation();
  const { pathname, search, hash } = useLocation();
  if (action === "signIn") {
    // The whole location rides along, as the auth gate's own sign-in redirect does.
    const signInHref = `${routes.signIn}?next=${encodeURIComponent(
      `${pathname}${search}${hash}`,
    )}`;
    return (
      <Button variant="stage" to={signInHref}>
        {t("quizshow:player.refused.signIn")}
      </Button>
    );
  }
  return (
    <Button variant="stage" onClick={() => window.location.reload()}>
      {t("quizshow:player.refused.reload")}
    </Button>
  );
}

function QuizshowScreenMessage({
  messageKey,
  hostSession,
  refusalAction = "enterCode",
}: {
  messageKey: string;
  hostSession: QuizshowHostSession;
  /** For a refused connection, the action that fits its cause; a load message keeps the back link. */
  refusalAction?: QuizshowRefusalAction;
}) {
  const { t } = useTranslation();
  if (refusalAction !== "enterCode") {
    return (
      <div className={styles.message}>
        <h1 className={styles.messageTitle}>{t(messageKey)}</h1>
        <RefusalActionButton action={refusalAction} />
      </div>
    );
  }
  // No back link while the event or game behind the page is unknown.
  return (
    <div className={styles.message}>
      <h1 className={styles.messageTitle}>{t(messageKey)}</h1>
      {hasQuizshowScopeId(hostSession.scope) && (
        <Button
          variant="stage-ghost"
          to={hostSession.backPath}
          state={hostSession.backState}
        >
          {t(hostSession.backLabelKey)}
        </Button>
      )}
    </div>
  );
}

interface QuizshowScreenLiveProps {
  hostSession: QuizshowHostSession;
  sessionId: string;
  controls: QuizshowScreenControls;
  /** False until the sound was turned on once on this page load (the chip stays till then). */
  hasTurnedSoundOn: boolean;
  /** The page's slot behind the stage, where the reactions rise; null until drawn. */
  reactionsContainer: HTMLElement | null;
  onSessionRefused?: (refusalCode: string | null) => void;
  onSessionEnded?: () => void;
}

/** One attached screen: keyed by session, so a new game starts a fresh connection. */
function QuizshowScreenLive({
  hostSession,
  sessionId,
  controls,
  hasTurnedSoundOn,
  reactionsContainer,
  onSessionRefused,
  onSessionEnded,
}: QuizshowScreenLiveProps) {
  const { backPath, backLabelKey, backState, playMode } = hostSession;
  const deviceTicket = hostSession.deviceTicket ?? null;
  const { theme, isLocallyMuted, onToggleLocalMute } = controls;
  const scopeOptions = hostSessionDemoOptions(hostSession);
  const { state, clockOffsetMs } = useQuizshowSession({
    sessionId,
    role: "screen",
    gameId: scopeOptions.gameId,
    isAdultsOnly: scopeOptions.isAdultsOnly,
    deviceTicket,
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
  const { isAudioRunning, resumeAudio } = useQuizshowCues(state, {
    isMuted: isScreenMuted || isLocallyMuted,
    clockOffsetMs,
    cues: SCREEN_CUES,
  });
  const turnOnSound = () => {
    resumeAudio();
    if (isLocallyMuted) onToggleLocalMute();
  };

  const isRefused = state.status === "refused";
  const refusalCode = isRefused
    ? screenRefusalCodeOf(state.refusalCode, deviceTicket !== null)
    : null;
  useEffect(() => {
    if (isRefused) onSessionRefused?.(refusalCode);
  }, [isRefused, refusalCode, onSessionRefused]);
  const isEnded =
    state.status === "ended" || state.session?.cursor.phase === "ended";
  useEffect(() => {
    if (isEnded) onSessionEnded?.();
  }, [isEnded, onSessionEnded]);

  return (
    <>
      <QuizshowScreenToolbar
        {...controls}
        backPath={backPath}
        backLabelKey={backLabelKey}
        backState={backState}
        isHostMuted={isScreenMuted}
      />
      <QuizshowScreenSoundChip
        isShown={!isScreenMuted && (!isAudioRunning || !hasTurnedSoundOn)}
        theme={theme}
        onTurnOnSound={turnOnSound}
      />
      <QuizshowScreenReactions
        burst={state.reactionBurst}
        isHidden={controls.isReactionsHidden}
        theme={theme}
        container={reactionsContainer}
      />
      <QuizshowConnectionBanner
        status={state.status}
        hasAttached={state.hasAttached}
        retryCause={state.retryCause}
      />
      {state.status === "refused" ? (
        <QuizshowScreenMessage
          messageKey={quizshowRefusalKeyOf(refusalCode)}
          hostSession={hostSession}
          refusalAction={screenRefusalActionOf(
            refusalCode,
            deviceTicket !== null,
          )}
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
  if (hostSession.hasLoadFailed)
    return quizshowLoadFailureKeyOf(hostSession.loadError);
  if (!hostSession.isOrganizer) return "quizshow:errors.not_organiser";
  if (hostSession.sessionId === null) return hostSession.noGameKeys.screen;
  return null;
}

/**
 * The presenter screen for the venue TV, for an event or a game: chromeless,
 * organisers only, dark by default. The velvet backdrop is drawn here, behind
 * the stage; the stage itself draws none, since the try-out, the remote's
 * preview and the studio each draw their own behind it.
 */
export function QuizshowScreenView({
  hostSession: loadedHostSession,
  onSessionRefused,
  onSessionEnded,
  aside,
}: {
  hostSession: QuizshowHostSession;
  /** Called with each refusal of the live connection (the TV page leaves its pairing on some). */
  onSessionRefused?: (refusalCode: string | null) => void;
  /** Called once the live session has ended (a paired TV then offers a code for the next game). */
  onSessionEnded?: () => void;
  /** Drawn over the stage inside the themed page, such as a paired TV's next pairing code. */
  aside?: ReactNode;
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
  const { soundLevel, changeSoundLevel } = useQuizshowSoundLevel();
  // Per page load: a new session remounts the live body, the switch stays.
  const [isReactionsHidden, setIsReactionsHidden] = useState(false);
  const toggleReactions = useCallback(() => {
    setIsReactionsHidden((current) => !current);
  }, []);
  // The "Turn on sound" chip stays until the sound was on once (the screen starts muted on every load).
  const [hasTurnedSoundOn, setHasTurnedSoundOn] = useState(false);
  if (!isLocallyMuted && !hasTurnedSoundOn) setHasTurnedSoundOn(true);
  // The reactions' slot between the backdrop and the stage; set once drawn.
  const [reactionsContainer, setReactionsContainer] =
    useState<HTMLDivElement | null>(null);
  useHidePointerWhenStill();

  useEffect(() => {
    primeMessageChime();
  }, []);

  const messageKey = hostSession.isLoading ? null : messageKeyOf(hostSession);
  const { sessionId } = hostSession;
  const isSessionOpen =
    !hostSession.isLoading && messageKey === null && sessionId !== null;
  useScreenWakeLock(isSessionOpen);
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
        controls={{
          theme,
          onToggleTheme: toggleTheme,
          isLocallyMuted,
          onToggleLocalMute: toggleLocalMute,
          soundLevel,
          onSoundLevelChange: changeSoundLevel,
          isReactionsHidden,
          onToggleReactions: toggleReactions,
        }}
        hasTurnedSoundOn={hasTurnedSoundOn}
        reactionsContainer={reactionsContainer}
        onSessionRefused={onSessionRefused}
        onSessionEnded={onSessionEnded}
      />
    );
  }

  return (
    <div
      className={styles.page}
      data-theme={theme}
      data-qs-theme={theme}
      data-quizshow-screen=""
    >
      <QuizshowBackdrop variant="stage" />
      {/* Over the backdrop, under the stage: the guests' reactions rise here. */}
      <div
        ref={setReactionsContainer}
        className={styles.reactionsSlot}
        aria-hidden="true"
      />
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
      {aside}
    </div>
  );
}

/** The event's presenter screen at `/gatherings/:slug/quizshow/screen`. */
export function QuizshowScreenPage() {
  const { slug: routeParam } = useParams<{ slug: string }>();
  const hostSession = useQuizshowEventSession(routeParam);
  return <QuizshowScreenView hostSession={hostSession} />;
}
