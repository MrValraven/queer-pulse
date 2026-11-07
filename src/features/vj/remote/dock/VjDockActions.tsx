import { useId, type ReactNode } from "react";
import { AnimatePresence, m } from "motion/react";
import {
  FiCheck,
  FiCrosshair,
  FiMoon,
  FiMoreHorizontal,
  FiPlay,
  FiRotateCcw,
} from "react-icons/fi";
import { useMotionPrefs } from "../../../../app/providers/motionPrefs";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { VjActionDispatch } from "../input/vjRemoteAction";
import {
  useVjMidiLearnTarget,
  type VjMidiLearnTargetProps,
} from "../midi/useVjMidiLearnTarget";
import type { VjMidiTarget } from "../midi/vjMidiMappings";
import styles from "./VjDockActions.module.css";

/** The app's ease-out token (--ease-out) at the fast duration (--dur-fast). */
const VJ_FADE_TRANSITION = { duration: 0.15, ease: [0.16, 1, 0.3, 1] as const };
const VJ_INSTANT = { duration: 0 };
const VJ_PRESS_SQUEEZE = { scale: 0.94 };
const VJ_BLACKOUT_TARGET: VjMidiTarget = { kind: "blackout" };
const VJ_GO_TARGET: VjMidiTarget = { kind: "go" };

export interface VjDockActionsProps {
  /** The blackout the operator sees, optimism included. */
  isBlackout: boolean;
  /** A blackout change waits for the stage to confirm it. */
  isBlackoutPending: boolean;
  isCueMode: boolean;
  /** The title of the clip Go would send; null while nothing is cued. */
  armedClipTitle: string | null;
  /** Offline or detached: the stage actions send nothing. */
  isBlocked: boolean;
  /** The id of the element naming why the controls are blocked. */
  blockedReasonId?: string;
  /** True while the reset confirmation shows (the dispatcher's `infoKey` is
   *  `vj:dock.resetDone`); the status line announces it, the button marks it. */
  isResetDone?: boolean;
  dispatch: VjActionDispatch;
  onTurnOnCueMode: () => void;
  onOpenMore: () => void;
}

/**
 * The dock's action row, one 48px band of four equal columns: Blackout,
 * Reset look, Cue (Go once cue mode is on) and More. Blackout, Reset look and
 * Go hand their action to the shared dispatcher, which sends Blackout and
 * Reset look immediately and Go as the cued clip. Cue and More stay usable
 * while blocked: one sets a preference on this device, the other opens a sheet.
 */
export function VjDockActions({
  isBlackout,
  isBlackoutPending,
  isCueMode,
  armedClipTitle,
  isBlocked,
  blockedReasonId,
  isResetDone = false,
  dispatch,
  onTurnOnCueMode,
  onOpenMore,
}: VjDockActionsProps) {
  const { t } = useTranslation();
  const blackoutLearn = useVjMidiLearnTarget(VJ_BLACKOUT_TARGET);
  const blockedDescription = isBlocked ? blockedReasonId : undefined;

  return (
    <div
      className={styles.row}
      data-vj-dock-actions=""
      role="group"
      aria-label={t("vj:dock.label")}
    >
      <VjDockActionButton
        actionId="blackout"
        icon={<FiMoon aria-hidden fill="none" />}
        label={t("vj:remote.blackout")}
        isDisabled={isBlocked}
        describedBy={blockedDescription}
        isPressed={isBlackout}
        isBusy={isBlackoutPending}
        learnProps={blackoutLearn.learnProps}
        onPress={() => dispatch({ kind: "blackout" }, "press")}
      />
      <VjDockActionButton
        actionId="resetLook"
        icon={
          <VjSwapIcon
            swapKey={isResetDone ? "done" : "idle"}
            icon={
              isResetDone ? (
                <FiCheck aria-hidden fill="none" />
              ) : (
                <FiRotateCcw aria-hidden fill="none" />
              )
            }
          />
        }
        label={t("vj:dock.resetLook")}
        isDisabled={isBlocked}
        describedBy={blockedDescription}
        isDone={isResetDone}
        onPress={() => dispatch({ kind: "resetLook" }, "press")}
      />
      <VjCueGoButton
        isCueMode={isCueMode}
        armedClipTitle={armedClipTitle}
        isBlocked={isBlocked}
        blockedReasonId={blockedDescription}
        dispatch={dispatch}
        onTurnOnCueMode={onTurnOnCueMode}
      />
      <VjDockActionButton
        actionId="more"
        icon={<FiMoreHorizontal aria-hidden fill="none" />}
        label={t("vj:dock.more")}
        ariaLabel={t("vj:dock.moreAria")}
        hasDialogPopup
        onPress={onOpenMore}
      />
    </div>
  );
}

interface VjDockActionButtonProps {
  actionId: string;
  icon: ReactNode;
  label: ReactNode;
  ariaLabel?: string;
  isDisabled?: boolean;
  describedBy?: string;
  isPressed?: boolean;
  isBusy?: boolean;
  isDone?: boolean;
  isArmed?: boolean;
  hasDialogPopup?: boolean;
  learnProps?: VjMidiLearnTargetProps;
  onPress: () => void;
}

/** One column: an icon over a short label, squeezing a little on press. A
 *  disabled column keeps its focus and says why through `describedBy`. */
function VjDockActionButton({
  actionId,
  icon,
  label,
  ariaLabel,
  isDisabled = false,
  describedBy,
  isPressed,
  isBusy = false,
  isDone = false,
  isArmed = false,
  hasDialogPopup = false,
  learnProps,
  onPress,
}: VjDockActionButtonProps) {
  const { reducedMotion } = useMotionPrefs();
  return (
    <m.button
      type="button"
      className={styles.action}
      data-vj-dock-action={actionId}
      data-done={isDone || undefined}
      data-armed={isArmed || undefined}
      aria-label={ariaLabel}
      aria-pressed={isPressed}
      aria-busy={isBusy || undefined}
      aria-disabled={isDisabled || undefined}
      aria-describedby={describedBy}
      aria-haspopup={hasDialogPopup ? "dialog" : undefined}
      whileTap={reducedMotion || isDisabled ? undefined : VJ_PRESS_SQUEEZE}
      transition={reducedMotion ? VJ_INSTANT : VJ_FADE_TRANSITION}
      onClick={() => {
        if (!isDisabled) onPress();
      }}
      {...learnProps}
    >
      <span className={styles.icon}>{icon}</span>
      <span className={styles.label}>{label}</span>
    </m.button>
  );
}

/**
 * The third column. Cue mode off, it shows Cue and turns cue mode on; on, it
 * shows Go and sends the cued clip. One button holds both faces, so focus
 * stays put through the swap and only the face fades. With nothing cued, Go
 * stays focusable, aria-disabled, and says "Tap a clip to cue it".
 */
function VjCueGoButton({
  isCueMode,
  armedClipTitle,
  isBlocked,
  blockedReasonId,
  dispatch,
  onTurnOnCueMode,
}: {
  isCueMode: boolean;
  armedClipTitle: string | null;
  isBlocked: boolean;
  blockedReasonId: string | undefined;
  dispatch: VjActionDispatch;
  onTurnOnCueMode: () => void;
}) {
  const { t } = useTranslation();
  const goLearn = useVjMidiLearnTarget(VJ_GO_TARGET);
  const goEmptyId = useId();
  const isArmed = armedClipTitle !== null;
  const face = isCueMode ? "go" : "cue";
  const isGoEmpty = isCueMode && !isArmed;
  const describedBy = isCueMode
    ? [blockedReasonId, isGoEmpty ? goEmptyId : undefined]
        .filter((id): id is string => id !== undefined)
        .join(" ") || undefined
    : undefined;
  const goAriaLabel = isArmed
    ? t("vj:remote.clipAria", { title: armedClipTitle })
    : t("vj:dock.go");

  // Both faces render the same button in the same place, so React keeps the
  // element (and its focus) and only the face inside fades.
  return (
    <>
      <VjDockActionButton
        actionId={face}
        icon={
          <VjSwapIcon
            swapKey={face}
            icon={
              isCueMode ? (
                <FiPlay aria-hidden fill="none" />
              ) : (
                <FiCrosshair aria-hidden fill="none" />
              )
            }
          />
        }
        label={
          <VjSwapLabel
            swapKey={face}
            text={isCueMode ? t("vj:dock.go") : t("vj:dock.cue")}
          />
        }
        ariaLabel={isCueMode ? goAriaLabel : t("vj:dock.cueAria")}
        isDisabled={isCueMode && (isBlocked || !isArmed)}
        describedBy={describedBy}
        isArmed={isCueMode && isArmed}
        learnProps={goLearn.learnProps}
        onPress={() => {
          if (isCueMode) dispatch({ kind: "go" }, "press");
          else onTurnOnCueMode();
        }}
      />
      <span id={goEmptyId} hidden>
        {t("vj:dock.goEmpty")}
      </span>
    </>
  );
}

/** Fades one icon out and the next in, keyed by `swapKey`. */
function VjSwapIcon({ swapKey, icon }: { swapKey: string; icon: ReactNode }) {
  const { reducedMotion } = useMotionPrefs();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <m.span
        key={swapKey}
        className={styles.swap}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={reducedMotion ? VJ_INSTANT : VJ_FADE_TRANSITION}
      >
        {icon}
      </m.span>
    </AnimatePresence>
  );
}

/** Fades one label out and the next in, keyed by `swapKey`. */
function VjSwapLabel({ swapKey, text }: { swapKey: string; text: string }) {
  const { reducedMotion } = useMotionPrefs();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <m.span
        key={swapKey}
        className={styles.swap}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={reducedMotion ? VJ_INSTANT : VJ_FADE_TRANSITION}
      >
        {text}
      </m.span>
    </AnimatePresence>
  );
}
