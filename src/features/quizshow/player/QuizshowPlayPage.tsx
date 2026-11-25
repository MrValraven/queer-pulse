import { AnimatePresence, m } from "motion/react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { useAuth } from "../../../app/providers/authContext";
import { routes } from "../../../app/routeMap";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { MAIN_CONTENT_ID } from "../../../shared/components/layout/SkipToContentLink";
import { Button } from "../../../shared/components/ui/Button";
import { Collapse } from "../../../shared/components/ui/Collapse";
import { Spinner } from "../../../shared/components/ui/Spinner";
import { useScreenWakeLock } from "../../../shared/hooks/useScreenWakeLock";
import {
  QUIZSHOW_LIMITS,
  QUIZSHOW_OPEN_SESSION_STATUSES,
  type QuizshowJoinResponse,
  type QuizshowPlayMode,
} from "../../../shared/contracts/quizshow";
import { PageMeta } from "../../../shared/seo/PageMeta";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { demoGameIdForSession } from "../api/quizshowDemoGames";
import { demoJoinPlayMode } from "../api/quizshowDemoStore";
import {
  quizshowRefusalActionOf,
  quizshowRefusalKeyOf,
} from "../api/quizshowErrors";
import {
  isJoinCodeShaped,
  normaliseJoinCode,
  quizshowPlayPath,
} from "../quizshowPaths";
import { isPlayerState } from "../realtime/quizshowClientStore";
import { QuizshowBackdrop } from "../stage/QuizshowBackdrop";
import { QuizshowConnectionBanner } from "../stage/QuizshowConnectionBanner";
import { useQuizshowFramelessPage } from "../useQuizshowFramelessPage";
import {
  useQuizshowSession,
  type QuizshowSessionController,
} from "../realtime/useQuizshowSession";
import { QuizshowPlayHome } from "../games/QuizshowPlayHome";
import { QuizshowAdultConsent } from "./QuizshowAdultConsent";
import { QuizshowHostCard } from "./QuizshowHostCard";
import { QuizshowJoinForm } from "./QuizshowJoinForm";
import { QuizshowJoinPreviewCard } from "./QuizshowJoinPreviewCard";
import styles from "./QuizshowPlay.module.css";
import { QuizshowPlayerEnd, QuizshowRemovedNotice } from "./QuizshowPlayerEnd";
import { QuizshowPlayerLobby } from "./QuizshowPlayerLobby";
import { QuizshowPlayerStage } from "./QuizshowPlayerStage";
import { playerScreenOf } from "./quizshowPlayerScreen";
import { isRemovedOf, usePlayJoin, useRememberedPlace } from "./usePlayJoin";

/** `left`: the player left this game and the page is on its way back to the code entry. */
type PlayScreen =
  | "connecting"
  | "refused"
  | "consent"
  | "join"
  | "lobby"
  | "stage"
  | "end"
  | "left";

/** How long a player who left waits on the empty screen before the join form comes back (a leave that never navigated). */
const LEFT_HOLD_MS = 3_000;

/** `needsConsent`: an 18+ game this player has not joined before and has not confirmed yet. */
function screenOf(
  controller: QuizshowSessionController,
  { needsConsent }: { needsConsent: boolean },
): PlayScreen {
  const screen = playerScreenOf(controller.state);
  return screen === "join" && needsConsent ? "consent" : screen;
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

/** The spinner's spoken line: "Connecting" until the first attach, "Reconnecting" only for a real reconnect. */
function Connecting({ lineKey }: { lineKey: string }) {
  const { t } = useTranslation();
  return (
    <div className={styles.loading} role="status">
      <Spinner />
      <span className={styles.visuallyHidden}>{t(lineKey)}</span>
    </div>
  );
}

/** The refusal's named line, with the one action that fits its cause (sign in, reload, or a new code). */
function RefusedNotice({ refusalCode }: { refusalCode: string | null }) {
  const { t } = useTranslation();
  const { pathname, search, hash } = useLocation();
  const action = quizshowRefusalActionOf(refusalCode);
  // The whole location rides along, as the auth gate's own sign-in redirect does.
  const signInHref = `${routes.signIn}?next=${encodeURIComponent(
    `${pathname}${search}${hash}`,
  )}`;
  return (
    <div className={`${styles.endStack} ${styles.sheet}`}>
      <h1 className={styles.title} role="alert">
        {t(quizshowRefusalKeyOf(refusalCode))}
      </h1>
      {action === "signIn" && (
        <Button to={signInHref} variant="stage" size="lg">
          {t("quizshow:player.refused.signIn")}
        </Button>
      )}
      {action === "reload" && (
        <Button
          variant="stage"
          size="lg"
          onClick={() => window.location.reload()}
        >
          {t("quizshow:player.refused.reload")}
        </Button>
      )}
      {action === "enterCode" && (
        <Button to={quizshowPlayPath()} variant="stage" size="lg">
          {t("quizshow:player.codeTitle")}
        </Button>
      )}
    </div>
  );
}

/**
 * True from a finished end until `rematchWindowMs` later (contract 6.17): the
 * socket stays in the old session's rooms that long for `session:rematch`.
 */
function useIsRematchWindowOpen(isFinishedEnd: boolean): boolean {
  const [hasWindowPassed, setHasWindowPassed] = useState(false);
  useEffect(() => {
    if (!isFinishedEnd) return;
    const windowTimer = window.setTimeout(
      () => setHasWindowPassed(true),
      QUIZSHOW_LIMITS.rematchWindowMs,
    );
    return () => window.clearTimeout(windowTimer);
  }, [isFinishedEnd]);
  return isFinishedEnd && !hasWindowPassed;
}

/**
 * The screen after a leave: once the player had a row, a state without one
 * means they left, and the page is navigating back to the code entry. The
 * join form would flash during that fade, so an empty screen holds instead;
 * after LEFT_HOLD_MS with no navigation the join form comes back.
 */
function useScreenAfterLeave(screen: PlayScreen): PlayScreen {
  const [hasJoined, setHasJoined] = useState(false);
  if ((screen === "lobby" || screen === "stage") && !hasJoined) {
    setHasJoined(true);
  }
  const isLeft = screen === "join" && hasJoined;
  useEffect(() => {
    if (!isLeft) return;
    const holdTimer = window.setTimeout(
      () => setHasJoined(false),
      LEFT_HOLD_MS,
    );
    return () => window.clearTimeout(holdTimer);
  }, [isLeft]);
  return isLeft ? "left" : screen;
}

/**
 * Whether the 18+ step comes before the name step. The join response reads the
 * flag from the game or event today and the session holds the flag it loaded
 * with, so either one asks. A rejoin skips it, unless the server asked for it.
 */
function needsConsentOf({
  join,
  state,
  hasAcceptedAdultContent,
  isConsentAskedByServer,
}: {
  join: QuizshowJoinResponse;
  state: QuizshowSessionController["state"];
  hasAcceptedAdultContent: boolean;
  isConsentAskedByServer: boolean;
}): boolean {
  if (hasAcceptedAdultContent) return false;
  if (isConsentAskedByServer) return true;
  const isSessionAdultsOnly =
    isPlayerState(state.session) && state.session.isAdultsOnly;
  return (join.isAdultsOnly || isSessionAdultsOnly) && !join.isRejoin;
}

function readStoredRematchTeamName(storageKey: string | null): string | null {
  if (storageKey === null) return null;
  try {
    return window.sessionStorage.getItem(storageKey);
  } catch {
    return null;
  }
}

/**
 * The old team's name PH3 stores when the player taps "Join the rematch" (D7).
 * The page is the key's only reader: it reads it once per code, passes it down
 * to `QuizshowJoinForm`, and removes it once the join for that code resolves
 * or fails, so it never outlives the join it was meant for (a rejoin skips the
 * form).
 */
function useRematchTeamName(
  code: string | null,
  hasJoinSettled: boolean,
): string | null {
  const storageKey = code === null ? null : `quizshow.rematchTeamName.${code}`;
  // Read once per code: the state holds what this code's key held when the page first saw it.
  const [readName, setReadName] = useState(() => ({
    storageKey,
    teamName: readStoredRematchTeamName(storageKey),
  }));
  if (readName.storageKey !== storageKey) {
    setReadName({
      storageKey,
      teamName: readStoredRematchTeamName(storageKey),
    });
  }
  useEffect(() => {
    if (storageKey === null || !hasJoinSettled) return;
    try {
      window.sessionStorage.removeItem(storageKey);
    } catch {
      // Blocked storage holds nothing to clear.
    }
  }, [storageKey, hasJoinSettled]);
  return readName.storageKey === storageKey ? readName.teamName : null;
}

function PlayGame({
  join,
  rematchTeamName,
}: {
  join: QuizshowJoinResponse;
  rematchTeamName: string | null;
}) {
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
    return demoJoinPlayMode(join);
  }, [demoMode, isDemoTeamsOverride, join]);
  const navigate = useNavigate();
  // The 18+ step is answered once per join; a rejoin already has a player row.
  const [hasAcceptedAdultContent, setHasAcceptedAdultContent] = useState(false);
  const [isConsentAskedByServer, setIsConsentAskedByServer] = useState(false);
  const controller = useQuizshowSession({
    sessionId: join.sessionId,
    role: "player",
    gameId: demoMode ? demoGameIdForSession(join.sessionId) : null,
    isAdultsOnly: join.isAdultsOnly,
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
  const screen = useScreenAfterLeave(
    screenOf(controller, {
      needsConsent: needsConsentOf({
        join,
        state: controller.state,
        hasAcceptedAdultContent,
        isConsentAskedByServer,
      }),
    }),
  );
  // The phone stays awake while the game is open and this player is still in
  // it (item 2), and after a finished game while a rematch can still arrive.
  const cursorStatus = controller.state.session?.cursor.status ?? null;
  const isSessionOpen =
    screen !== "end" &&
    screen !== "refused" &&
    screen !== "left" &&
    QUIZSHOW_OPEN_SESSION_STATUSES.some((status) => status === cursorStatus);
  const isFinishedEnd =
    controller.state.sessionEnd?.status === "finished" &&
    !isRemovedOf(controller.state);
  const isRematchWindowOpen = useIsRematchWindowOpen(isFinishedEnd);
  const isWaitingForRematch =
    isRematchWindowOpen && controller.state.rematch === null;
  useScreenWakeLock(isSessionOpen || isWaitingForRematch);
  // Outside the keyed fade, so the card stays put from the 18+ step to the name step.
  const isHostCardShown =
    join.host !== null && (screen === "consent" || screen === "join");
  return (
    <>
      <QuizshowConnectionBanner
        status={controller.state.status}
        hasAttached={controller.state.hasAttached}
        retryCause={controller.state.retryCause}
      />
      <Collapse isOpen={isHostCardShown}>
        {join.host !== null && (
          <QuizshowHostCard host={join.host} quizTitle={join.quizTitle} />
        )}
      </Collapse>
      <AnimatePresence mode="wait">
        <Fade key={screen}>
          {screen === "connecting" && (
            <Connecting
              lineKey={
                controller.state.hasAttached
                  ? "quizshow:stage.reconnecting"
                  : "quizshow:stage.connecting"
              }
            />
          )}
          {screen === "refused" && (
            <RefusedNotice refusalCode={controller.state.refusalCode} />
          )}
          {screen === "consent" && (
            <QuizshowAdultConsent
              host={join.host}
              quizTitle={join.quizTitle}
              onAccept={() => setHasAcceptedAdultContent(true)}
              onLeave={() => void navigate(quizshowPlayPath())}
            />
          )}
          {screen === "join" && (
            <QuizshowJoinForm
              controller={controller}
              hasAcceptedAdultContent={hasAcceptedAdultContent}
              rematchTeamName={rematchTeamName}
              onConsentRequired={() => {
                setIsConsentAskedByServer(true);
                setHasAcceptedAdultContent(false);
              }}
            />
          )}
          {screen === "lobby" && (
            <QuizshowPlayerLobby controller={controller} />
          )}
          {screen === "stage" && (
            <QuizshowPlayerStage controller={controller} />
          )}
          {screen === "end" && (
            <QuizshowPlayerEnd
              state={controller.state}
              kind={join.kind}
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

/**
 * `/play` is the Pulse Live home (the code form, then My games); `/play/:code`
 * joins that game and walks the player through it, 18+ step included. Signed
 * out, `/play/:code` shows the public join card instead: no join and no socket
 * (item 29).
 */
export function QuizshowPlayPage() {
  const { t } = useTranslation();
  const { user, loggedIn, checking } = useAuth();
  // The phone sits on the velvet stage, so the page behind it takes the stage base too.
  useQuizshowFramelessPage({ shouldPaintStageBase: true });
  const { code: codeParam } = useParams();
  const { key: locationKey } = useLocation();
  const typedCode =
    codeParam === undefined ? null : normaliseJoinCode(codeParam);
  const isShaped = typedCode !== null && isJoinCodeShaped(typedCode);
  // Demo sets `user` a commit after `loggedIn`, so signed out reads `loggedIn`
  // alone and the join waits for both.
  const isSignedOut = !checking && !loggedIn;
  const isSignedIn = !checking && loggedIn && user !== null;
  const { join, errorCode, isPending, hasUnknownFailure } = usePlayJoin(
    isShaped && isSignedIn ? typedCode : null,
    locationKey,
  );
  const rematchTeamName = useRematchTeamName(
    isShaped ? typedCode : null,
    join !== null || errorCode !== null || hasUnknownFailure,
  );
  const shownErrorCode =
    typedCode !== null && !isShaped
      ? "quizshow_join_code_not_found"
      : errorCode;

  let viewKey = "code";
  if (typedCode !== null && isSignedOut) viewKey = "preview";
  else if (typedCode !== null && !isSignedIn) viewKey = "joining";
  else if (join !== null) viewKey = `game:${join.sessionId}`;
  else if (shownErrorCode === "quizshow_player_removed") viewKey = "removed";
  else if (isPending) viewKey = "joining";

  return (
    // The phone sits on the velvet stage in either app theme, so shared controls read their dark tokens.
    <main
      id={MAIN_CONTENT_ID}
      tabIndex={-1}
      className={styles.page}
      data-theme="dark"
    >
      <PageMeta title={t("quizshow:player.metaTitle")} noIndex />
      <div className={styles.backdrop}>
        <QuizshowBackdrop variant="phone" />
      </div>
      <AnimatePresence mode="wait">
        <Fade key={viewKey}>
          {viewKey === "joining" && (
            <Connecting lineKey="quizshow:stage.connecting" />
          )}
          {viewKey === "preview" && typedCode !== null && (
            <QuizshowJoinPreviewCard code={typedCode} isShaped={isShaped} />
          )}
          {viewKey === "removed" && (
            <QuizshowRemovedNotice kind={null} eventSlug={null} />
          )}
          {join !== null && (
            <PlayGame
              key={viewKey}
              join={join}
              rematchTeamName={rematchTeamName}
            />
          )}
          {viewKey === "code" && (
            <QuizshowPlayHome
              initialErrorCode={shownErrorCode}
              hasUnknownFailure={hasUnknownFailure}
            />
          )}
        </Fade>
      </AnimatePresence>
    </main>
  );
}
