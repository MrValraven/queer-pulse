import { useEffect, useId, useReducer, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "../../../shared/components/ui";
import { useDismiss } from "../../../shared/components/ui/useDismiss";
import { useInertWhileCovered } from "../../../shared/components/ui/modalStack";
import {
  useFocusHandBack,
  useModalExit,
} from "../../../shared/components/ui/useModalExit";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useQuizshowDemoEngine } from "../engine/useQuizshowDemoEngine";
import {
  applyQuizshowFrame,
  createQuizshowClientState,
  isScreenState,
} from "../realtime/quizshowClientStore";
import { quizshowPrimaryControlOf } from "../remote/quizshowPrimaryControl";
import { QuizshowScreenStage } from "../screen/QuizshowScreenStage";
import { QuizshowBackdrop } from "../stage/QuizshowBackdrop";
import { type QuizshowDraft } from "./quizshowDraft";
import { QuizshowBlockedTip } from "./QuizshowBlockedTip";
import { useQuizshowBlockedTip } from "./useQuizshowBlockedTip";
import { DRY_RUN_ID, dryRunQuizOf } from "./quizshowDryRunQuiz";
import { useCanvasScale } from "./useQuizshowDryRunScale";
import lobbyStyles from "./QuizshowLobby.module.css";
import styles from "./QuizshowDryRun.module.css";

interface QuizshowDryRunProps {
  draft: QuizshowDraft;
  /** The draft's own previews of pictures picked in this edit, by picture key. */
  pickedPreviewUrls?: ReadonlyMap<string, string>;
  onClose: () => void;
}

const NO_PICKED_PREVIEWS: ReadonlyMap<string, string> = new Map();

/**
 * The builder's try-out: the draft as it stood when opened, played on the big
 * screen stage by the twelve simulated players, in a full-screen dark overlay
 * with a slim control bar (Next, Close the try-out; at the end, Play it again and Close the try-out). It runs the demo engine
 * in every mode (the try-out is always local), so it sends no request and
 * opens no socket, and nothing it plays is saved. Nobody can join it, so the
 * lobby shows no join code or QR. The stage is drawn on a viewport-tall
 * canvas (so its vh based type reads as it does on the TV) and scaled down
 * into the frame, over the velvet backdrop this frame renders itself.
 */
export function QuizshowDryRun({
  draft,
  pickedPreviewUrls = NO_PICKED_PREVIEWS,
  onClose,
}: QuizshowDryRunProps) {
  const { t } = useTranslation();
  const titleId = useId();
  const noPlayersTipId = useId();
  const [quiz] = useState(() => dryRunQuizOf(draft, pickedPreviewUrls));
  const demoEngine = useQuizshowDemoEngine(
    {
      role: "screen",
      eventSlug: DRY_RUN_ID,
      eventTitle: draft.title,
      isAutoHost: true,
      hasSelfPlayer: false,
      playMode: "solo",
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
  const { frameRef, canvasRef, scale } = useCanvasScale();
  const exit = useModalExit(onClose);
  const dialogRef = useDismiss(exit.close);
  useFocusHandBack(exit, dialogRef);
  // The layer is a different element from the dialog that carries `inert`
  // while closing, the same split `Modal` makes between its scrim and dialog.
  const layerRef = useRef<HTMLDivElement>(null);
  useInertWhileCovered(layerRef, exit.isClosing);
  const noPlayersTip = useQuizshowBlockedTip();

  useEffect(() => {
    if (demoEngine === null) return undefined;
    dispatch({
      event: "session:state",
      payload: demoEngine.sessionStateFor("screen"),
    });
    return demoEngine.subscribe(dispatch);
  }, [demoEngine]);

  const cursor = isScreenState(state.session) ? state.session.cursor : null;
  const phase = cursor?.phase ?? null;
  const isEnded = phase === "ended";
  const nextControl =
    phase === null || isEnded ? null : quizshowPrimaryControlOf(phase);
  const hasNoPlayers =
    phase === "lobby" &&
    isScreenState(state.session) &&
    state.session.lobby.playerCount === 0;
  const isNextBlocked = nextControl === null || hasNoPlayers;

  function handleNext() {
    if (demoEngine === null) return;
    // At the end the same button plays the try-out again from the lobby.
    if (isEnded) {
      demoEngine.restart();
      return;
    }
    if (cursor === null || nextControl === null) return;
    if (hasNoPlayers) {
      noPlayersTip.pin();
      return;
    }
    void demoEngine.send(nextControl.name, { phaseId: cursor.phaseId });
  }

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
              {t("quizshow:dryRun.title")}
            </h2>
            <p className={styles.barSub}>{t("quizshow:dryRun.sub")}</p>
          </div>
          <div className={styles.barActions}>
            <span className={lobbyStyles.studioWrap}>
              <Button
                variant={isEnded ? "stage-ghost" : "stage"}
                size="sm"
                type="button"
                aria-disabled={isEnded ? undefined : isNextBlocked}
                aria-describedby={hasNoPlayers ? noPlayersTipId : undefined}
                onClick={handleNext}
              >
                {isEnded
                  ? t("quizshow:dryRun.playAgain")
                  : t(nextControl?.labelKey ?? "quizshow:remote.next")}
              </Button>
              {hasNoPlayers && (
                <QuizshowBlockedTip
                  id={noPlayersTipId}
                  isPinned={noPlayersTip.isPinned}
                  isDismissed={noPlayersTip.isDismissed}
                  onDismiss={noPlayersTip.dismiss}
                  onReset={noPlayersTip.reset}
                  isShownOnFocus={false}
                >
                  {t("quizshow:errors.no_players")}
                </QuizshowBlockedTip>
              )}
            </span>
            <Button
              variant={isEnded ? "stage" : "stage-ghost"}
              size="sm"
              type="button"
              onClick={exit.close}
            >
              {t("quizshow:dryRun.close")}
            </Button>
          </div>
        </header>
        <div className={styles.stageArea}>
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
          <p className={styles.hint}>{t("quizshow:dryRun.rotateHint")}</p>
        </div>
      </div>
    </div>,
    document.body,
  );
}
