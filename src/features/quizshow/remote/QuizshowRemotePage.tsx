import { AnimatePresence, m } from "motion/react";
import { useEffect, useState, type CSSProperties } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { FiUsers, FiVolume2, FiVolumeX } from "react-icons/fi";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { MAIN_CONTENT_ID } from "../../../shared/components/layout/SkipToContentLink";
import { Button } from "../../../shared/components/ui/Button";
import { Collapse } from "../../../shared/components/ui/Collapse";
import { IconButton } from "../../../shared/components/ui/IconButton";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { primeMessageChime } from "../../../shared/lib/messageChime";
import { PageMeta } from "../../../shared/seo/PageMeta";
import {
  QUIZSHOW_ERROR_CODES,
  QUIZSHOW_LIMITS,
  type QuizshowErrorCode,
  type QuizshowHostState,
  type QuizshowPlayMode,
} from "../../../shared/contracts/quizshow";
import { quizshowErrorKeyOf } from "../api/quizshowErrors";
import {
  isHostState,
  type QuizshowClientState,
} from "../realtime/quizshowClientStore";
import {
  useQuizshowSession,
  type QuizshowSessionController,
} from "../realtime/useQuizshowSession";
import {
  hostSessionDemoOptions,
  type QuizshowHostSession,
} from "../screen/quizshowHostSession";
import { useQuizshowEventSession } from "../screen/useQuizshowEventSession";
import type { QuizshowCue } from "../sound/quizshowCues";
import { useQuizshowCues } from "../sound/useQuizshowCues";
import { QuizshowConnectionBanner } from "../stage/QuizshowConnectionBanner";
import { QuizshowCountdownBar } from "../stage/QuizshowCountdownBar";
import { QuizshowPausedNote } from "../stage/QuizshowPausedNote";
import { useQuizshowFramelessPage } from "../useQuizshowFramelessPage";
import { QuizshowRemoteAnswerKey } from "./QuizshowRemoteAnswerKey";
import {
  QuizshowRemoteControls,
  QuizshowRemoteErrorLine,
} from "./QuizshowRemoteControls";
import { QuizshowRemotePlayers } from "./QuizshowRemotePlayers";
import { QuizshowRemotePreview } from "./QuizshowRemotePreview";
import { QuizshowRemoteReview } from "./QuizshowRemoteReview";
import { useQuizshowHostCommand } from "./useQuizshowHostCommand";
import styles from "./QuizshowRemote.module.css";

/** The remote plays its cues quietly and locally: the last seconds and the reveal. */
const REMOTE_CUES: readonly QuizshowCue[] = ["timeAlmostUp", "reveal"];
const KNOWN_ERROR_CODES: ReadonlySet<string> = new Set(QUIZSHOW_ERROR_CODES);
/** Stays mounted while the players panel folds, so the toggle's aria-controls always resolves. */
const PLAYERS_PANEL_ID = "quizshow-remote-players-panel";

function refusalKeyOf(refusalCode: QuizshowClientState["refusalCode"]): string {
  if (refusalCode !== null && KNOWN_ERROR_CODES.has(refusalCode)) {
    return quizshowErrorKeyOf(refusalCode as QuizshowErrorCode);
  }
  return "quizshow:errors.generic";
}

/**
 * The phase's standard limit in ms, so a countdown bar that mounts during a
 * pause sits at the frozen place. Read is fixed; open and write use the
 * question's effective limit. The wire carries no per-round vote limit, so
 * vote uses the default vote time, as the phone and the screen do. Untimed
 * phases give null.
 */
function standardLimitMsOf(
  phase: QuizshowHostState["cursor"]["phase"],
  question: QuizshowHostState["question"],
): number | null {
  if (phase === "read") return QUIZSHOW_LIMITS.readPhaseMs;
  if ((phase === "open" || phase === "write") && question !== null) {
    return question.timeLimitSeconds * 1000;
  }
  if (phase === "vote") return QUIZSHOW_LIMITS.voteSecondsDefault * 1000;
  return null;
}

function answerCountKeyOf(phase: QuizshowHostState["cursor"]["phase"]) {
  // Review counts the submissions the hosts are checking, which were written.
  if (phase === "write" || phase === "review") return "quizshow:stage.written";
  if (phase === "vote") return "quizshow:stage.voted";
  return "quizshow:stage.answered";
}

function RemoteMessage({
  messageKey,
  backPath,
  backLabelKey,
}: {
  messageKey: string;
  backPath: string;
  backLabelKey: string;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.message}>
      <h1 className={styles.messageTitle}>{t(messageKey)}</h1>
      <Button to={backPath} variant="ghost">
        {t(backLabelKey)}
      </Button>
    </div>
  );
}

function RemoteHeader({
  controller,
  session,
  isPlayersOpen,
  onTogglePlayers,
}: {
  controller: QuizshowSessionController;
  session: QuizshowHostState;
  isPlayersOpen: boolean;
  onTogglePlayers: () => void;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const { run, isPending, lastErrorKey } = useQuizshowHostCommand(controller);
  const { cursor, round, question, answerCount, isScreenMuted, lobby } =
    session;
  const isMuteBusy = isPending("host:setScreenMuted");
  const fade = { duration: reducedMotion ? 0 : 0.2 };
  const isPaused = cursor.status === "paused";
  const metaKey = `${cursor.phaseId}:${answerCount === null ? "none" : "count"}`;
  // The polite line a screen reader hears on every phase change and on pause.
  const spokenPhase = [
    t(`quizshow:remote.phase.${cursor.phase}`),
    isPaused ? t("quizshow:stage.paused") : null,
  ]
    .filter((part) => part !== null)
    .join(", ");

  const toggleScreenMute = () => {
    // A tap is the gesture browsers want before they play the remote's own cues.
    primeMessageChime();
    if (isMuteBusy) return;
    void run("host:setScreenMuted", { isMuted: !isScreenMuted });
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerRow}>
        <AnimatePresence mode="wait" initial={false}>
          <m.h1
            key={cursor.phase}
            className={styles.phase}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={fade}
          >
            {t(`quizshow:remote.phase.${cursor.phase}`)}
          </m.h1>
        </AnimatePresence>
        <div className={styles.headerActions}>
          <IconButton
            aria-label={t("quizshow:remote.muteScreen")}
            aria-pressed={isScreenMuted}
            aria-disabled={isMuteBusy}
            onClick={toggleScreenMute}
          >
            <AnimatePresence mode="wait" initial={false}>
              <m.span
                key={isScreenMuted ? "muted" : "sounding"}
                className={styles.iconSwap}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={fade}
              >
                {isScreenMuted ? (
                  <FiVolumeX aria-hidden="true" fill="none" />
                ) : (
                  <FiVolume2 aria-hidden="true" fill="none" />
                )}
              </m.span>
            </AnimatePresence>
          </IconButton>
          <Button
            variant="ghost"
            size="md"
            aria-expanded={isPlayersOpen}
            aria-controls={PLAYERS_PANEL_ID}
            onClick={onTogglePlayers}
          >
            <FiUsers aria-hidden="true" fill="none" />
            {t("quizshow:live.players", { count: lobby.playerCount })}
          </Button>
        </div>
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <m.p
          key={metaKey}
          className={styles.meta}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={fade}
        >
          {round !== null && (
            <span>
              {t("quizshow:stage.roundOf", {
                number: round.roundIndex + 1,
                total: cursor.roundCount,
              })}
            </span>
          )}
          {round !== null && question !== null && (
            <span>
              {t("quizshow:stage.questionOf", {
                number: question.questionIndex + 1,
                total: round.questionCount,
              })}
            </span>
          )}
          {answerCount !== null && (
            <span className={styles.count}>
              {t(answerCountKeyOf(cursor.phase), answerCount)}
            </span>
          )}
        </m.p>
      </AnimatePresence>
      <QuizshowCountdownBar
        cursor={cursor}
        clockOffsetMs={controller.clockOffsetMs}
        hasExtraTime={false}
        size="phone"
        standardLimitMs={standardLimitMsOf(cursor.phase, question)}
      />
      <QuizshowPausedNote isPaused={isPaused} />
      <span role="status" className={styles.visuallyHidden}>
        {spokenPhase}
      </span>
      <QuizshowRemoteErrorLine errorKey={lastErrorKey} />
    </header>
  );
}

function RemoteConsole({
  controller,
  session,
  backPath,
  backLabelKey,
  onBarHeightChange,
}: {
  controller: QuizshowSessionController;
  session: QuizshowHostState;
  backPath: string;
  backLabelKey: string;
  onBarHeightChange: (height: number) => void;
}) {
  const { t, language } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const [isPlayersOpen, setIsPlayersOpen] = useState(false);
  const { cursor, question, reveal } = session;
  const { phase } = cursor;
  const isReviewShown =
    phase === "review" ||
    phase === "vote" ||
    (phase === "reveal" && reveal?.distribution.kind === "votes");

  return (
    <>
      <RemoteHeader
        controller={controller}
        session={session}
        isPlayersOpen={isPlayersOpen}
        onTogglePlayers={() => setIsPlayersOpen((isOpen) => !isOpen)}
      />
      <div id={PLAYERS_PANEL_ID}>
        <Collapse isOpen={isPlayersOpen}>
          <QuizshowRemotePlayers
            controller={controller}
            lobby={session.lobby}
            playMode={session.playMode}
          />
        </Collapse>
      </div>
      <QuizshowRemotePreview
        state={controller.demoScreenState}
        clockOffsetMs={controller.clockOffsetMs}
      />
      <Collapse isOpen={question !== null && question.answerKey !== null}>
        <AnimatePresence mode="wait" initial={false}>
          <m.div
            key={question?.questionId ?? "none"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.2 }}
          >
            {question !== null && (
              <QuizshowRemoteAnswerKey
                question={question}
                language={language}
              />
            )}
          </m.div>
        </AnimatePresence>
      </Collapse>
      <Collapse isOpen={isReviewShown}>
        <QuizshowRemoteReview controller={controller} state={session} />
      </Collapse>
      <Collapse isOpen={phase === "ended"}>
        <Button to={backPath} variant="ghost">
          {t(backLabelKey)}
        </Button>
      </Collapse>
      <QuizshowRemoteControls
        controller={controller}
        state={session}
        onBarHeightChange={onBarHeightChange}
      />
    </>
  );
}

type RemoteView =
  | { kind: "loading" }
  | { kind: "message"; messageKey: string }
  | { kind: "console"; session: QuizshowHostState };

/** The remote of one hosted session, an event's or a game's. */
export function QuizshowRemoteView({
  hostSession,
}: {
  hostSession: QuizshowHostSession;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const [searchParams] = useSearchParams();
  const { demoMode } = useDemoMode();
  const [barHeight, setBarHeight] = useState(0);
  useQuizshowFramelessPage();
  const { isOrganizer, isLoading, sessionId, errorCode, hasLoadFailed } =
    hostSession;
  // The design review's switch to see team UI in demo; otherwise the open session's mode.
  const playMode: QuizshowPlayMode =
    demoMode && searchParams.get("demoPlayMode") === "teams"
      ? "teams"
      : hostSession.playMode;
  const scopeOptions = hostSessionDemoOptions(hostSession);
  const controller = useQuizshowSession({
    sessionId: isOrganizer ? sessionId : null,
    role: "host",
    gameId: scopeOptions.gameId,
    isAdultsOnly: scopeOptions.isAdultsOnly,
    demo: {
      ...scopeOptions,
      isAutoHost: false,
      hasSelfPlayer: false,
      playMode,
      suggestedScreenName: "",
      shouldLoop: false,
    },
  });
  const { state, clockOffsetMs } = controller;
  const session = isHostState(state.session) ? state.session : null;
  useQuizshowCues(state, {
    isMuted: session?.isScreenMuted ?? false,
    clockOffsetMs,
    cues: REMOTE_CUES,
  });

  // Unlocks audio on the first tap or key press anywhere, as the screen does.
  useEffect(() => {
    primeMessageChime();
  }, []);

  let view: RemoteView = { kind: "loading" };
  if (isLoading) view = { kind: "loading" };
  else if (errorCode !== null)
    view = { kind: "message", messageKey: quizshowErrorKeyOf(errorCode) };
  else if (hasLoadFailed)
    view = { kind: "message", messageKey: "quizshow:errors.generic" };
  else if (!isOrganizer)
    view = { kind: "message", messageKey: "quizshow:errors.not_organiser" };
  // A demo game with no open lobby has no session to drive either; the demo event always has one.
  else if (
    sessionId === null &&
    (!controller.isDemo || hostSession.scope.kind === "game")
  )
    view = { kind: "message", messageKey: hostSession.noGameKeys.remote };
  else if (state.status === "refused")
    view = { kind: "message", messageKey: refusalKeyOf(state.refusalCode) };
  else if (session !== null) view = { kind: "console", session };
  const viewKey = view.kind === "message" ? view.messageKey : view.kind;
  // The measured control bar, so the last section always clears it; 0 keeps the CSS fallback.
  const pageStyle =
    barHeight > 0
      ? ({
          "--quizshow-remote-bar-space": `${barHeight}px`,
        } as CSSProperties)
      : undefined;

  return (
    <div className={styles.page} style={pageStyle}>
      <PageMeta title={t("quizshow:remote.metaTitle")} noIndex />
      <QuizshowConnectionBanner status={state.status} />
      <main
        id={MAIN_CONTENT_ID}
        tabIndex={-1}
        className={styles.main}
        aria-busy={view.kind === "loading"}
      >
        <AnimatePresence mode="wait" initial={false}>
          <m.div
            key={viewKey}
            className={styles.view}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.2 }}
          >
            {view.kind === "message" && (
              <RemoteMessage
                messageKey={view.messageKey}
                backPath={hostSession.backPath}
                backLabelKey={hostSession.backLabelKey}
              />
            )}
            {view.kind === "console" && (
              <RemoteConsole
                controller={controller}
                session={view.session}
                backPath={hostSession.backPath}
                backLabelKey={hostSession.backLabelKey}
                onBarHeightChange={setBarHeight}
              />
            )}
          </m.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export function QuizshowRemotePage() {
  const params = useParams();
  const hostSession = useQuizshowEventSession(params.slug);
  return <QuizshowRemoteView hostSession={hostSession} />;
}
