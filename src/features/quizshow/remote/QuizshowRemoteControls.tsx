import { AnimatePresence, m } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { Button } from "../../../shared/components/ui/Button";
import { Collapse } from "../../../shared/components/ui/Collapse";
import { ConfirmDialog } from "../../../shared/components/ui/ConfirmDialog";
import { IconButton } from "../../../shared/components/ui/IconButton";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { QuizshowHostState } from "../../../shared/contracts/quizshow";
import { QuizshowStudioDarkStamp } from "../studio/QuizshowStudioDarkStamp";
import type { QuizshowSessionController } from "../realtime/useQuizshowSession";
import { useQuizshowWheelClock } from "../stage/useQuizshowWheelClock";
import { endConfirmBodyKeyOf } from "./quizshowRemoteEndCopy";
import { QuizshowRemoteFinishWheel } from "./QuizshowRemoteFinishWheel";
import { quizshowPrimaryControlOf } from "./quizshowPrimaryControl";
import {
  secondaryControlsOf,
  type SecondaryControl,
} from "./quizshowRemoteSecondaryControls";
import { useQuizshowHostCommand } from "./useQuizshowHostCommand";
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

/** From this many controls the labels shrink so a long one such as Finish the wheel stays on one line. */
const CROWDED_ROW_FROM = 4;

/** The secondary row: one icon button per control, folding in and out as the phase changes. */
function QuizshowRemoteSecondaryRow({
  controls,
  isPending,
}: {
  controls: SecondaryControl[];
  isPending: (name: SecondaryControl["name"]) => boolean;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const fade = { duration: reducedMotion ? 0 : 0.2 };
  return (
    <div
      className={styles.secondaryRow}
      data-is-crowded={controls.length >= CROWDED_ROW_FROM}
    >
      <AnimatePresence initial={false}>
        {controls.map((control) => {
          const isBlocked = control.isBlocked || isPending(control.name);
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
                tone="dark"
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
                    <span className={styles.secondaryLabel}>{label}</span>
                  </m.span>
                </AnimatePresence>
              </IconButton>
            </m.div>
          );
        })}
      </AnimatePresence>
    </div>
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
            <Collapse isOpen={status === "paused" && cursor.isRestartRecovery}>
              <p className={styles.note}>
                {t("quizshow:remote.restartRecovery")}
              </p>
            </Collapse>
            <Button
              variant="stage"
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
                  key={`${primary.labelKey}:${primary.labelValues?.title ?? ""}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={fade}
                >
                  {t(primary.labelKey, primary.labelValues)}
                </m.span>
              </AnimatePresence>
            </Button>
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
