import { AnimatePresence, m } from "motion/react";
import {
  useEffect,
  useId,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { FiMonitor, FiSmartphone } from "react-icons/fi";
import {
  Button,
  SegmentedControl,
  Spinner,
  Toggle,
} from "../../../shared/components/ui";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { Collapse } from "../../../shared/components/ui/Collapse";
import { useDismiss } from "../../../shared/components/ui/useDismiss";
import { useInertWhileCovered } from "../../../shared/components/ui/modalStack";
import {
  useFocusHandBack,
  useModalExit,
} from "../../../shared/components/ui/useModalExit";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  useQuizshowDemoEngine,
  type QuizshowDemoEngine,
} from "../engine/useQuizshowDemoEngine";
import { QuizshowPlayerEnd } from "../player/QuizshowPlayerEnd";
import { QuizshowPlayerLobby } from "../player/QuizshowPlayerLobby";
import { QuizshowPlayerStage } from "../player/QuizshowPlayerStage";
import { playerScreenOf } from "../player/quizshowPlayerScreen";
import { QuizshowTryOutContext } from "../player/quizshowTryOutContext";
import { useRememberedPlace } from "../player/usePlayJoin";
import {
  applyQuizshowFrame,
  createQuizshowClientState,
  isHostState,
  isScreenState,
  type QuizshowClientState,
} from "../realtime/quizshowClientStore";
import { quizshowPrimaryControlOf } from "../remote/quizshowPrimaryControl";
import { QuizshowScreenStage } from "../screen/QuizshowScreenStage";
import { displayRoundNumber } from "../quizshowWheel";
import { QuizshowBackdrop } from "../stage/QuizshowBackdrop";
import { useQuizshowWheelClock } from "../stage/useQuizshowWheelClock";
import { type QuizshowDraft } from "./quizshowDraft";
import { QuizshowBlockedTip } from "./QuizshowBlockedTip";
import { useQuizshowBlockedTip } from "./useQuizshowBlockedTip";
import {
  DRY_RUN_ID,
  dryRunQuizOf,
  type QuizshowDryRunSlice,
} from "./quizshowDryRunQuiz";
import { useCanvasScale } from "./useQuizshowDryRunScale";
import { useDryRunPlayerController } from "./useDryRunPlayerController";
import lobbyStyles from "./QuizshowLobby.module.css";
import styles from "./QuizshowDryRun.module.css";

interface QuizshowDryRunProps {
  draft: QuizshowDraft;
  /** The draft's own previews of pictures picked in this edit, by picture key. */
  pickedPreviewUrls?: ReadonlyMap<string, string>;
  /** Try this round or Try from this question (item 21); left out, the whole draft. */
  slice?: QuizshowDryRunSlice;
  onClose: () => void;
}

type DryRunViewer = "screen" | "phone";

const NO_PICKED_PREVIEWS: ReadonlyMap<string, string> = new Map();
/** Teams play in the try-out spreads the pretend players over four teams (item 55). */
const DRY_RUN_TEAM_COUNT = 4;

/** The big screen, drawn on a viewport-tall canvas and scaled into the frame. */
function DryRunScreenView({ state }: { state: QuizshowClientState }) {
  const { frameRef, canvasRef, scale } = useCanvasScale();
  return (
    <div ref={frameRef} className={styles.frame}>
      <div
        ref={canvasRef}
        className={styles.canvas}
        style={{ transform: `scale(${scale})` }}
      >
        <QuizshowBackdrop variant="stage" />
        <div className={styles.canvasStage}>
          <QuizshowScreenStage
            state={state}
            clockOffsetMs={0}
            size="screen"
            isJoinHidden
          />
        </div>
      </div>
    </div>
  );
}

/**
 * The player's phone, joined as "You", on the same demo engine the host bar
 * drives. Its screens are picked as the play page picks them; until "You"
 * has a row (a restart takes a few seconds) it says "Starting…" with a
 * spinner. Inside the try-out context the phone keeps
 * the player in the try-out and leaves focus on the host bar.
 */
function DryRunPhoneView({ demoEngine }: { demoEngine: QuizshowDemoEngine }) {
  const { t } = useTranslation();
  const controller = useDryRunPlayerController(demoEngine);
  const finalPlace = useRememberedPlace(controller.state);
  const playerScreen = playerScreenOf(controller.state);
  const isWaiting =
    playerScreen === "connecting" ||
    playerScreen === "refused" ||
    playerScreen === "join";
  return (
    <div className={styles.phone}>
      <QuizshowBackdrop variant="phone" />
      <div className={styles.phoneScroll}>
        <QuizshowTryOutContext.Provider value>
          <div className={styles.phoneColumn} data-dry-run-phone>
            <div
              key={isWaiting ? "waiting" : playerScreen}
              className={`${styles.phoneScreen} ${styles.viewIn}`}
            >
              {isWaiting && (
                <p className={styles.phoneWaiting} role="status">
                  {playerScreen === "refused" ? (
                    t("quizshow:player.getReady")
                  ) : (
                    <>
                      <Spinner /> {t("quizshow:dryRun.starting")}
                    </>
                  )}
                </p>
              )}
              {playerScreen === "lobby" && (
                <QuizshowPlayerLobby controller={controller} />
              )}
              {playerScreen === "stage" && (
                <QuizshowPlayerStage controller={controller} />
              )}
              {playerScreen === "end" && (
                <QuizshowPlayerEnd
                  state={controller.state}
                  kind={controller.state.session?.kind ?? "event"}
                  eventSlug={null}
                  finalPlace={finalPlace}
                />
              )}
            </div>
          </div>
        </QuizshowTryOutContext.Provider>
      </div>
    </div>
  );
}

/** The screen or the phone; a switch fades the old view out and the new one in. */
function DryRunView({
  viewer,
  children,
}: {
  viewer: DryRunViewer;
  children: ReactNode;
}) {
  const { reducedMotion } = useMotionPrefs();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <m.div
        key={viewer}
        className={styles.view}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reducedMotion ? 0 : 0.2 }}
      >
        {children}
      </m.div>
    </AnimatePresence>
  );
}

/**
 * Screen or Phone, and Teams: a Teams change restarts the try-out with the new
 * setup, so it is held (with its reason) once the game has started.
 */
function DryRunViewControls({
  viewer,
  isTeams,
  isTeamsLocked,
  onViewerChange,
  onTeamsChange,
}: {
  viewer: DryRunViewer;
  isTeams: boolean;
  isTeamsLocked: boolean;
  onViewerChange: (viewer: DryRunViewer) => void;
  onTeamsChange: (isTeams: boolean) => void;
}) {
  const { t } = useTranslation();
  const teamsSwitchId = useId();
  const teamsLockedId = useId();
  return (
    <div className={styles.viewBar}>
      <SegmentedControl
        className={styles.viewerSwitch}
        label={t("quizshow:dryRun.viewer.label")}
        value={viewer}
        options={[
          {
            value: "screen",
            label: t("quizshow:dryRun.viewer.screen"),
            icon: <FiMonitor />,
          },
          {
            value: "phone",
            label: t("quizshow:dryRun.viewer.phone"),
            icon: <FiSmartphone />,
          },
        ]}
        onChange={(value) =>
          onViewerChange(value === "phone" ? "phone" : "screen")
        }
      />
      <div className={styles.teamsSwitch}>
        <label
          htmlFor={teamsSwitchId}
          className={styles.teamsLabel}
          data-locked={isTeamsLocked}
        >
          {t("quizshow:dryRun.teams")}
        </label>
        <Toggle
          id={teamsSwitchId}
          checked={isTeams}
          label={t("quizshow:dryRun.teams")}
          disabled={isTeamsLocked}
          aria-describedby={isTeamsLocked ? teamsLockedId : undefined}
          onChange={onTeamsChange}
        />
      </div>
      <Collapse isOpen={isTeamsLocked} className={styles.teamsLocked}>
        <p id={teamsLockedId} className={styles.teamsLockedText}>
          {t("quizshow:dryRun.teamsLocked")}
        </p>
      </Collapse>
    </div>
  );
}

/**
 * The host bar's main button: the next step, read from the host's view of
 * the same engine as the remote does (only it holds the whole podium, so the
 * podium steps are never guessed); at the end it plays the try-out again.
 */
function useDryRunNextControl(
  demoEngine: QuizshowDemoEngine | null,
  screenState: ReturnType<typeof screenStateOf>,
  onPlayAgain: () => void,
) {
  const { t } = useTranslation();
  const noPlayersTip = useQuizshowBlockedTip();
  const cursor = screenState?.cursor ?? null;
  const phase = cursor?.phase ?? null;
  const isEnded = phase === "ended";
  // The try-out clock is the local one, so the offset is 0. The shared wheel
  // clock re-renders this frame at the landing, which flips "Spinning" to the
  // landed control.
  const { serverNowMs } = useQuizshowWheelClock(
    screenState?.wheel?.spin ?? null,
    0,
  );
  const hostState =
    demoEngine === null || screenState === null
      ? null
      : demoEngine.sessionStateFor("host");
  const nextControl =
    screenState === null || isEnded
      ? null
      : quizshowPrimaryControlOf(
          isHostState(hostState) ? hostState : screenState,
          serverNowMs,
          t,
        );
  const hasNoPlayers =
    phase === "lobby" &&
    screenState !== null &&
    screenState.lobby.playerCount === 0;
  const isNextBlocked =
    nextControl === null || nextControl.isBlocked || hasNoPlayers;
  const label = isEnded
    ? t("quizshow:dryRun.playAgain")
    : t(
        nextControl?.labelKey ?? "quizshow:remote.next",
        nextControl?.labelValues,
      );

  function handleNext() {
    if (demoEngine === null) return;
    if (isEnded) {
      demoEngine.restart();
      onPlayAgain();
      return;
    }
    if (cursor === null || nextControl === null || nextControl.isBlocked) {
      return;
    }
    if (hasNoPlayers) {
      noPlayersTip.pin();
      return;
    }
    void demoEngine.send(nextControl.name, { phaseId: cursor.phaseId });
  }

  return {
    label,
    isEnded,
    isNextBlocked,
    hasNoPlayers,
    noPlayersTip,
    handleNext,
  };
}

/** The bar's title: the whole quiz, one round, or one round from a question on. */
function useDryRunTitle(
  draft: QuizshowDraft,
  slice: QuizshowDryRunSlice | undefined,
): string {
  const { t } = useTranslation();
  if (slice === undefined) return t("quizshow:dryRun.title");
  // A wheel row is no round, so the number skips the wheels before it.
  const round = displayRoundNumber(draft.rounds, slice.roundIndex);
  if (slice.fromQuestionIndex === undefined) {
    return t("quizshow:dryRun.titleRound", { round });
  }
  return t("quizshow:dryRun.titleFromQuestion", {
    question: slice.fromQuestionIndex + 1,
    round,
  });
}

function screenStateOf(state: QuizshowClientState) {
  return isScreenState(state.session) ? state.session : null;
}

/**
 * The builder's try-out: the draft (or one slice of it) as it stood when
 * opened, played by the twelve simulated players, in a full-screen dark
 * overlay with a slim control bar (Next, Close the try-out; at the end, Play
 * it again and Close the try-out). It runs the demo engine in every mode (the
 * try-out is always local), so it sends no request and opens no socket, and
 * nothing it plays is saved. Nobody can join it, so the lobby shows no join
 * code or QR. "Screen" draws the big screen on a viewport-tall canvas scaled
 * into the frame; "Phone" shows the player's phone, joined as "You"; "Teams"
 * plays it in teams over four teams. The host bar drives either view.
 */
export function QuizshowDryRun({
  draft,
  pickedPreviewUrls = NO_PICKED_PREVIEWS,
  slice,
  onClose,
}: QuizshowDryRunProps) {
  const { t } = useTranslation();
  const titleId = useId();
  const title = useDryRunTitle(draft, slice);
  const noPlayersTipId = useId();
  const [quiz] = useState(() => dryRunQuizOf(draft, pickedPreviewUrls, slice));
  const [viewer, setViewer] = useState<DryRunViewer>("screen");
  const [isTeams, setIsTeams] = useState(false);
  // Each play from the lobby gets a fresh phone, so last run's night is gone.
  const [runCount, setRunCount] = useState(0);
  const isPhone = viewer === "phone";
  const demoEngine = useQuizshowDemoEngine(
    {
      // One engine per run: "You" joins in both views and the screen view
      // reads the engine through subscribeScreen, so Screen and Phone only
      // switch which view is drawn and never restart the run.
      role: "player",
      eventSlug: DRY_RUN_ID,
      eventTitle: draft.title,
      isAutoHost: true,
      hasSelfPlayer: false,
      playMode: isTeams ? "teams" : "solo",
      ...(isTeams ? { teamCount: DRY_RUN_TEAM_COUNT } : {}),
      selfScreenName: t("quizshow:dryRun.you"),
      suggestedScreenName: "",
      shouldLoop: false,
      quiz,
    },
    true,
  );
  const [state, dispatch] = useReducer(
    applyQuizshowFrame,
    "screen",
    createQuizshowClientState,
  );
  const exit = useModalExit(onClose);
  const dialogRef = useDismiss(exit.close);
  useFocusHandBack(exit, dialogRef);
  // The layer is a different element from the dialog that carries `inert`
  // while closing, the same split `Modal` makes between its scrim and dialog.
  const layerRef = useRef<HTMLDivElement>(null);
  useInertWhileCovered(layerRef, exit.isClosing);

  // The host bar reads the big screen's view in either viewer. A fresh
  // engine is a fresh session: nothing of the last one carries over.
  useEffect(() => {
    if (demoEngine === null) return undefined;
    dispatch({ event: "local:reset" });
    dispatch({
      event: "session:state",
      payload: demoEngine.sessionStateFor("screen"),
    });
    return demoEngine.subscribeScreen(dispatch);
  }, [demoEngine]);

  const next = useDryRunNextControl(demoEngine, screenStateOf(state), () =>
    setRunCount((count) => count + 1),
  );
  // Past the lobby and before the end, a Teams change would throw the run away.
  const runPhase = screenStateOf(state)?.cursor.phase ?? "lobby";
  const isTeamsLocked = runPhase !== "lobby" && runPhase !== "ended";

  return createPortal(
    <div ref={layerRef} className={styles.layer}>
      <div
        ref={dialogRef}
        className={`${styles.root} ${exit.isClosing ? styles.closing : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        inert={exit.isClosing}
        data-theme="dark"
        onAnimationEnd={exit.handleExitAnimationEnd}
      >
        <header className={styles.bar}>
          <div className={styles.barText}>
            <h2 id={titleId} className={styles.barTitle}>
              {title}
            </h2>
            <p className={styles.barSub}>{t("quizshow:dryRun.sub")}</p>
          </div>
          <div className={styles.barActions}>
            <span className={lobbyStyles.studioWrap}>
              <Button
                variant={next.isEnded ? "stage-ghost" : "stage"}
                size="sm"
                type="button"
                aria-disabled={next.isEnded ? undefined : next.isNextBlocked}
                aria-describedby={
                  next.hasNoPlayers ? noPlayersTipId : undefined
                }
                onClick={next.handleNext}
              >
                {next.label}
              </Button>
              {next.hasNoPlayers && (
                <QuizshowBlockedTip
                  id={noPlayersTipId}
                  isPinned={next.noPlayersTip.isPinned}
                  isDismissed={next.noPlayersTip.isDismissed}
                  onDismiss={next.noPlayersTip.dismiss}
                  onReset={next.noPlayersTip.reset}
                  isShownOnFocus={false}
                >
                  {t("quizshow:errors.no_players")}
                </QuizshowBlockedTip>
              )}
            </span>
            <Button
              variant={next.isEnded ? "stage" : "stage-ghost"}
              size="sm"
              type="button"
              onClick={exit.close}
            >
              {t("quizshow:dryRun.close")}
            </Button>
          </div>
        </header>
        <DryRunViewControls
          viewer={viewer}
          isTeams={isTeams}
          isTeamsLocked={isTeamsLocked}
          onViewerChange={setViewer}
          onTeamsChange={setIsTeams}
        />
        <div className={styles.stageArea}>
          <DryRunView viewer={viewer}>
            {isPhone ? (
              demoEngine !== null && (
                <DryRunPhoneView key={runCount} demoEngine={demoEngine} />
              )
            ) : (
              <DryRunScreenView state={state} />
            )}
          </DryRunView>
          <Collapse isOpen={!isPhone}>
            <p className={styles.hint}>{t("quizshow:dryRun.rotateHint")}</p>
          </Collapse>
        </div>
      </div>
    </div>,
    document.body,
  );
}
