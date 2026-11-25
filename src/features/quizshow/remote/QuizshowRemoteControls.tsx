import { AnimatePresence, m } from "motion/react";
import {
  useEffect,
  useId,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { Button } from "../../../shared/components/ui/Button";
import { Collapse } from "../../../shared/components/ui/Collapse";
import { ConfirmDialog } from "../../../shared/components/ui/ConfirmDialog";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  QUIZSHOW_LIMITS,
  type QuizshowCursor,
  type QuizshowHostState,
  type QuizshowPhase,
} from "../../../shared/contracts/quizshow";
import { QuizshowStudioDarkStamp } from "../studio/QuizshowStudioDarkStamp";
import { serverNow } from "../realtime/quizshowClock";
import type { QuizshowSessionController } from "../realtime/useQuizshowSession";
import { useQuizshowWheelClock } from "../stage/useQuizshowWheelClock";
import { endConfirmBodyKeyOf } from "./quizshowRemoteEndCopy";
import { QuizshowRemoteFinishWheel } from "./QuizshowRemoteFinishWheel";
import {
  quizshowPrimaryControlOf,
  type QuizshowPrimaryControl,
} from "./quizshowPrimaryControl";
import { QuizshowRemoteSecondaryRow } from "./QuizshowRemoteSecondaryRow";
import { secondaryControlsOf } from "./quizshowRemoteSecondaryControls";
import { useQuizshowHostCommand } from "./useQuizshowHostCommand";
import { useSkipHold, type QuizshowSkipTarget } from "./useSkipHold";
import styles from "./QuizshowRemote.module.css";

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

/** What a screen reader hears while a Skip waits for its Undo. */
const SKIP_ANNOUNCE_KEYS: Record<QuizshowSkipTarget, string> = {
  question: "quizshow:remote.skipToast",
  scores: "quizshow:remote.skipScoresToast",
};

/** How long each phase that moves on by itself waits (contract 6.16); the ring's full turn. */
const AUTO_ADVANCE_MS_BY_PHASE: Partial<Record<QuizshowPhase, number>> = {
  round_intro: QUIZSHOW_LIMITS.autoAdvanceRoundIntroMs,
  reveal: QUIZSHOW_LIMITS.autoAdvanceRevealMs,
  scores: QUIZSHOW_LIMITS.autoAdvanceScoresMs,
};

/**
 * The auto-advance ring: it empties toward `autoAdvanceAt` on the server
 * clock. The time already gone is read once (the caller keys the ring by the
 * deadline) and handed to a CSS animation as a negative delay, so only
 * stroke-dashoffset moves and nothing re-renders while it runs.
 */
function QuizshowAutoAdvanceRing({
  autoAdvanceAt,
  totalMs,
  clockOffsetMs,
}: {
  autoAdvanceAt: number;
  totalMs: number;
  clockOffsetMs: number;
}) {
  const [elapsedMs] = useState(() => {
    const remainingMs = autoAdvanceAt - serverNow(Date.now(), clockOffsetMs);
    return Math.min(totalMs, Math.max(0, totalMs - remainingMs));
  });
  const arcStyle = {
    "--qs-auto-advance-ms": `${totalMs}ms`,
    "--qs-auto-advance-delay": `${-elapsedMs}ms`,
  } as CSSProperties;
  return (
    <svg
      className={styles.autoAdvanceRing}
      viewBox="0 0 36 36"
      aria-hidden="true"
      focusable="false"
      data-auto-advance-ring=""
    >
      <circle
        className={styles.autoAdvanceTrack}
        cx="18"
        cy="18"
        r="15"
        pathLength={100}
      />
      <circle
        className={styles.autoAdvanceArc}
        cx="18"
        cy="18"
        r="15"
        pathLength={100}
        style={arcStyle}
      />
    </svg>
  );
}

/**
 * The big button: its label fades between steps, and while the game moves on
 * by itself it draws the auto-advance ring. With reduced motion the ring
 * gives way to a still "Moves on by itself" line under the button.
 */
function QuizshowRemotePrimaryButton({
  primary,
  isBlocked,
  cursor,
  clockOffsetMs,
  onActivate,
}: {
  primary: QuizshowPrimaryControl;
  isBlocked: boolean;
  cursor: QuizshowCursor;
  clockOffsetMs: number;
  onActivate: () => void;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const captionId = useId();
  const fade = { duration: reducedMotion ? 0 : 0.2 };
  const label = t(primary.labelKey, primary.labelValues);
  const { autoAdvanceAt } = cursor;
  const hasAutoAdvance = autoAdvanceAt !== null;
  const autoAdvanceMs =
    AUTO_ADVANCE_MS_BY_PHASE[cursor.phase] ??
    QUIZSHOW_LIMITS.autoAdvanceRevealMs;
  return (
    <>
      <Button
        variant="stage"
        size="lg"
        className={styles.primary}
        aria-disabled={isBlocked}
        aria-describedby={hasAutoAdvance ? captionId : undefined}
        onClick={() => {
          if (!isBlocked) onActivate();
        }}
      >
        {/* "wait": a new deadline's ring enters only after the old one left, so two rings never sit side by side. */}
        <AnimatePresence mode="wait" initial={false}>
          {hasAutoAdvance && !reducedMotion && (
            <m.span
              key={`ring:${autoAdvanceAt}`}
              className={styles.autoAdvanceSlot}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={fade}
            >
              {/* A new clock offset re-reads the time gone, with no fade. */}
              <QuizshowAutoAdvanceRing
                key={clockOffsetMs}
                autoAdvanceAt={autoAdvanceAt}
                totalMs={autoAdvanceMs}
                clockOffsetMs={clockOffsetMs}
              />
            </m.span>
          )}
        </AnimatePresence>
        <AnimatePresence mode="wait" initial={false}>
          <m.span
            key={`${primary.labelKey}:${label}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={fade}
          >
            {label}
          </m.span>
        </AnimatePresence>
      </Button>
      {/* Always mounted, so the button's description never moves the bar. */}
      <span id={captionId} className={styles.visuallyHidden}>
        {hasAutoAdvance ? t("quizshow:remote.autoAdvanceCaption") : ""}
      </span>
      <Collapse isOpen={hasAutoAdvance && reducedMotion}>
        <p className={styles.autoAdvanceCaption} aria-hidden="true">
          {t("quizshow:remote.autoAdvanceCaption")}
        </p>
      </Collapse>
    </>
  );
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
  const { startSkip, cancelSkip, heldTarget } = useSkipHold(controller, run);
  const [isEndConfirmOpen, setIsEndConfirmOpen] = useState(false);
  const [isFinishWheelOpen, setIsFinishWheelOpen] = useState(false);
  // Re-renders the bar at the stop, so the buttons enable the moment the wheel lands.
  const { serverNowMs } = useQuizshowWheelClock(
    state.wheel?.spin ?? null,
    controller.clockOffsetMs,
  );
  const { cursor } = state;
  const { status, phaseId } = cursor;
  const fade = { duration: reducedMotion ? 0 : 0.2 };
  const primary = quizshowPrimaryControlOf(state, serverNowMs, t);
  const isPrimaryBlocked =
    primary.isBlocked ||
    isPending(primary.name) ||
    (primary.name === "host:start" ? status !== "lobby" : status !== "running");
  const secondaryControls = secondaryControlsOf(state, serverNowMs, run, {
    onEnd: () => setIsEndConfirmOpen(true),
    onFinishWheel: () => setIsFinishWheelOpen(true),
    onSkip: startSkip,
    heldSkipTarget: heldTarget,
    onUndoSkip: cancelSkip,
  });

  // The wheel can end under the host (the timer, another host tab); the confirm closes with it.
  const isOnWheel = cursor.phase === "wheel";
  if (!isOnWheel && isFinishWheelOpen) setIsFinishWheelOpen(false);

  const confirmEnd = () => {
    void run("host:end", { phaseId }).then(() => setIsEndConfirmOpen(false));
  };
  const confirmFinishWheel = () => {
    void run("host:finishWheel", { phaseId }).then(() =>
      setIsFinishWheelOpen(false),
    );
  };

  const bar = (
    <AnimatePresence>
      {isOpenSession(state) && (
        <m.div
          key="quizshow-remote-bar"
          ref={barRef}
          className={styles.bar}
          data-theme="dark"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={fade}
        >
          <div className={styles.barInner}>
            <QuizshowRemoteErrorLine errorKey={lastErrorKey} />
            {/* The pending skip is spoken here; the Skip button shows its Undo under the thumb. */}
            <span role="status" className={styles.visuallyHidden}>
              {heldTarget === null ? "" : t(SKIP_ANNOUNCE_KEYS[heldTarget])}
            </span>
            <Collapse isOpen={status === "paused" && cursor.isRestartRecovery}>
              <p className={styles.note}>
                {t("quizshow:remote.restartRecovery")}
              </p>
            </Collapse>
            <QuizshowRemotePrimaryButton
              primary={primary}
              isBlocked={isPrimaryBlocked}
              cursor={cursor}
              clockOffsetMs={controller.clockOffsetMs}
              onActivate={() => void run(primary.name, { phaseId })}
            />
            <QuizshowRemoteSecondaryRow
              controls={secondaryControls}
              isPending={isPending}
            />
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
          >
            {/* The dialog portals to the body; the stamp keeps it in the remote's dark. */}
            <QuizshowStudioDarkStamp />
          </ConfirmDialog>
        )}
      </AnimatePresence>
      <QuizshowRemoteFinishWheel
        isOpen={isFinishWheelOpen && isOnWheel}
        pick={state.wheel?.pick ?? "round"}
        isPending={isPending("host:finishWheel")}
        onConfirm={confirmFinishWheel}
        onClose={() => setIsFinishWheelOpen(false)}
      />
    </>
  );
}
