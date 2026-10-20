import { AnimatePresence, m } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  FiEye,
  FiPause,
  FiPlay,
  FiPlusCircle,
  FiSkipForward,
  FiStopCircle,
} from "react-icons/fi";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { Button } from "../../../shared/components/ui/Button";
import { Collapse } from "../../../shared/components/ui/Collapse";
import { ConfirmDialog } from "../../../shared/components/ui/ConfirmDialog";
import { IconButton } from "../../../shared/components/ui/IconButton";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  QUIZSHOW_TIMED_PHASES,
  type QuizshowHostState,
  type QuizshowPhase,
} from "../../../shared/contracts/quizshow";
import { QUIZSHOW_REMOTE_ADD_TIME_SECONDS } from "../quizshow.constants";
import type { QuizshowHostFrameName } from "../engine/quizshowEngineTypes";
import type { QuizshowSessionController } from "../realtime/useQuizshowSession";
import { useQuizshowHostCommand } from "./useQuizshowHostCommand";
import styles from "./QuizshowRemote.module.css";

const TIMED_PHASES: readonly QuizshowPhase[] = QUIZSHOW_TIMED_PHASES;
const REVEAL_PHASES: readonly QuizshowPhase[] = ["open", "vote"];
const SKIP_PHASES: readonly QuizshowPhase[] = [
  "read",
  "open",
  "write",
  "review",
  "vote",
];
const UNPAUSABLE_PHASES: readonly QuizshowPhase[] = ["lobby", "ended"];
/** The phases of a question before its reveal, when that question has scored nothing yet. */
const BEFORE_REVEAL_PHASES: readonly QuizshowPhase[] = [
  "round_intro",
  "read",
  "open",
  "write",
  "review",
  "vote",
];
/** Pause and Resume share one slot, so the button keeps focus when it flips. */
const PAUSE_RESUME_KEY = "pauseResume";

interface SecondaryControl {
  key: string;
  name: QuizshowHostFrameName;
  labelKey: string;
  icon: ReactNode;
  isBlocked: boolean;
  onActivate: () => void;
}

/** The big button: Start game in the lobby, Show answers in review, Next elsewhere. */
function primaryCommandOf(phase: QuizshowPhase): {
  name: "host:start" | "host:showAnswers" | "host:next";
  labelKey: string;
} {
  if (phase === "lobby") {
    return { name: "host:start", labelKey: "quizshow:remote.start" };
  }
  if (phase === "review") {
    return {
      name: "host:showAnswers",
      labelKey: "quizshow:remote.showAnswers",
    };
  }
  return { name: "host:next", labelKey: "quizshow:remote.next" };
}

/** Which secondary controls the contract allows in this phase and status. */
function secondaryControlsOf(
  state: QuizshowHostState,
  run: ReturnType<typeof useQuizshowHostCommand>["run"],
  onEnd: () => void,
): SecondaryControl[] {
  const { cursor } = state;
  const { phase, status, phaseId, deadline } = cursor;
  const isRunning = status === "running";
  const controls: SecondaryControl[] = [];
  if (status === "paused") {
    controls.push({
      key: PAUSE_RESUME_KEY,
      name: "host:resume",
      labelKey: "quizshow:remote.resume",
      icon: <FiPlay aria-hidden="true" fill="none" />,
      isBlocked: false,
      onActivate: () => void run("host:resume", { phaseId }),
    });
  } else if (isRunning && !UNPAUSABLE_PHASES.includes(phase)) {
    controls.push({
      key: PAUSE_RESUME_KEY,
      name: "host:pause",
      labelKey: "quizshow:remote.pause",
      icon: <FiPause aria-hidden="true" fill="none" />,
      isBlocked: false,
      onActivate: () => void run("host:pause", { phaseId }),
    });
  }
  if (isRunning && TIMED_PHASES.includes(phase) && deadline !== null) {
    controls.push({
      key: "addTime",
      name: "host:addTime",
      labelKey: "quizshow:remote.addTime",
      icon: <FiPlusCircle aria-hidden="true" fill="none" />,
      isBlocked: false,
      onActivate: () =>
        void run("host:addTime", {
          phaseId,
          seconds: QUIZSHOW_REMOTE_ADD_TIME_SECONDS,
          expectedDeadline: deadline,
        }),
    });
  }
  if (REVEAL_PHASES.includes(phase)) {
    controls.push({
      key: "reveal",
      name: "host:reveal",
      labelKey: "quizshow:remote.reveal",
      icon: <FiEye aria-hidden="true" fill="none" />,
      isBlocked: !isRunning,
      onActivate: () => void run("host:reveal", { phaseId }),
    });
  }
  const isQuizReveal = phase === "reveal" && state.round?.kind === "quiz";
  if (SKIP_PHASES.includes(phase) || isQuizReveal) {
    controls.push({
      key: "skip",
      name: "host:skip",
      labelKey: "quizshow:remote.skip",
      icon: <FiSkipForward aria-hidden="true" fill="none" />,
      isBlocked: !isRunning,
      onActivate: () => void run("host:skip", { phaseId }),
    });
  }
  controls.push({
    key: "end",
    name: "host:end",
    labelKey: "quizshow:remote.end",
    icon: <FiStopCircle aria-hidden="true" fill="none" />,
    isBlocked: false,
    onActivate: onEnd,
  });
  return controls;
}

/** A failed command's copy, folding in and out under a live region that stays mounted. */
export function QuizshowRemoteErrorLine({
  errorKey,
}: {
  errorKey: string | null;
}) {
  const { t } = useTranslation();
  return (
    <div role="status">
      <Collapse isOpen={errorKey !== null}>
        <p className={styles.error}>{errorKey === null ? "" : t(errorKey)}</p>
      </Collapse>
    </div>
  );
}

/** Fades one inline piece in and out; a new key waits for the old piece to leave, and a null key hides it. */
export function QuizshowRemoteFade({
  fadeKey,
  children,
}: {
  fadeKey: string | null;
  children: ReactNode;
}) {
  const { reducedMotion } = useMotionPrefs();
  return (
    <AnimatePresence mode="wait" initial={false}>
      {fadeKey !== null && (
        <m.span
          key={fadeKey}
          className={styles.fade}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.2 }}
        >
          {children}
        </m.span>
      )}
    </AnimatePresence>
  );
}

/**
 * True while the cursor sits on the first question before its reveal, where
 * ending abandons the game with no results (the contract sends a running game
 * to the podium only once a question has scored). A first question that was
 * skipped also scores nothing; the state carries no flag for that case, so the
 * podium copy shows there.
 */
function isBeforeFirstScore(state: QuizshowHostState): boolean {
  const { phase, roundIndex, questionIndex } = state.cursor;
  return (
    roundIndex === 0 &&
    (questionIndex ?? 0) === 0 &&
    BEFORE_REVEAL_PHASES.includes(phase)
  );
}

/** What ending does from here: close the lobby, keep the podium, close with no score, or go to the podium. */
function endConfirmBodyKeyOf(state: QuizshowHostState): string {
  const { phase } = state.cursor;
  if (phase === "lobby") return "quizshow:remote.endLobbyBody";
  if (phase === "podium") return "quizshow:remote.endPodiumBody";
  if (isBeforeFirstScore(state)) return "quizshow:remote.endUnscoredBody";
  return "quizshow:remote.endConfirmBody";
}

function isOpenSession(state: QuizshowHostState): boolean {
  const { status, phase } = state.cursor;
  const isOpenStatus =
    status === "lobby" || status === "running" || status === "paused";
  return isOpenStatus && phase !== "ended";
}

/** Reports an element's border-box height whenever it changes, and 0 once it is gone. */
function useReportedHeight(
  onHeightChange: ((height: number) => void) | undefined,
): (element: HTMLDivElement | null) => void {
  const [element, setElement] = useState<HTMLDivElement | null>(null);
  useEffect(() => {
    if (onHeightChange === undefined) return undefined;
    if (element === null || typeof ResizeObserver === "undefined") {
      onHeightChange(0);
      return undefined;
    }
    const observer = new ResizeObserver(() => {
      onHeightChange(element.getBoundingClientRect().height);
    });
    observer.observe(element);
    onHeightChange(element.getBoundingClientRect().height);
    // Also runs when the controls unmount (a switch to a message view), so the page drops the reservation.
    return () => {
      observer.disconnect();
      onHeightChange(0);
    };
  }, [element, onHeightChange]);
  return setElement;
}

export function QuizshowRemoteControls({
  controller,
  state,
  onBarHeightChange,
}: {
  controller: QuizshowSessionController;
  state: QuizshowHostState;
  /** The fixed bar's measured height, so the page can keep its last section clear of it. */
  onBarHeightChange?: (height: number) => void;
}) {
  const { t } = useTranslation();
  const barRef = useReportedHeight(onBarHeightChange);
  const { reducedMotion } = useMotionPrefs();
  const { run, isPending, lastErrorKey } = useQuizshowHostCommand(controller);
  const [isEndConfirmOpen, setIsEndConfirmOpen] = useState(false);
  const { cursor } = state;
  const { phase, status, phaseId } = cursor;
  const fade = { duration: reducedMotion ? 0 : 0.2 };
  const primary = primaryCommandOf(phase);
  const isPrimaryBlocked =
    isPending(primary.name) ||
    (primary.name === "host:start" ? status !== "lobby" : status !== "running");
  const secondaryControls = secondaryControlsOf(state, run, () =>
    setIsEndConfirmOpen(true),
  );

  const confirmEnd = () => {
    void run("host:end", { phaseId }).then(() => setIsEndConfirmOpen(false));
  };

  const bar = (
    <AnimatePresence>
      {isOpenSession(state) && (
        <m.div
          key="quizshow-remote-bar"
          ref={barRef}
          className={styles.bar}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={fade}
        >
          <div className={styles.barInner}>
            <QuizshowRemoteErrorLine errorKey={lastErrorKey} />
            <Collapse isOpen={status === "paused" && cursor.isRestartRecovery}>
              <p className={styles.note}>
                {t("quizshow:remote.restartRecovery")}
              </p>
            </Collapse>
            <Button
              variant="primary"
              size="lg"
              className={styles.primary}
              aria-disabled={isPrimaryBlocked}
              onClick={() => {
                if (isPrimaryBlocked) return;
                void run(primary.name, { phaseId });
              }}
            >
              <AnimatePresence mode="wait" initial={false}>
                <m.span
                  key={primary.labelKey}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={fade}
                >
                  {t(primary.labelKey)}
                </m.span>
              </AnimatePresence>
            </Button>
            <div className={styles.secondaryRow}>
              <AnimatePresence initial={false}>
                {secondaryControls.map((control) => {
                  const isBlocked =
                    control.isBlocked || isPending(control.name);
                  const label = t(control.labelKey);
                  return (
                    <m.div
                      key={control.key}
                      layout="position"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={fade}
                    >
                      <IconButton
                        className={styles.secondaryButton}
                        aria-label={label}
                        aria-disabled={isBlocked}
                        onClick={() => {
                          if (!isBlocked) control.onActivate();
                        }}
                      >
                        {/* Pause and Resume keep one button, so only its face fades. */}
                        <AnimatePresence mode="wait" initial={false}>
                          <m.span
                            key={control.labelKey}
                            className={styles.secondaryFace}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={fade}
                          >
                            {control.icon}
                            <span className={styles.secondaryLabel}>
                              {label}
                            </span>
                          </m.span>
                        </AnimatePresence>
                      </IconButton>
                    </m.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {createPortal(bar, document.body)}
      <AnimatePresence>
        {isEndConfirmOpen && (
          <ConfirmDialog
            key="quizshow-remote-end"
            open
            onClose={() => setIsEndConfirmOpen(false)}
            onConfirm={confirmEnd}
            title={t("quizshow:remote.endConfirmTitle")}
            description={t(endConfirmBodyKeyOf(state))}
            confirmLabel={t("quizshow:remote.end")}
            cancelLabel={t("quizshow:common.cancel")}
            tone="destructive"
            loading={isPending("host:end")}
            initialFocus="cancel"
          />
        )}
      </AnimatePresence>
    </>
  );
}
