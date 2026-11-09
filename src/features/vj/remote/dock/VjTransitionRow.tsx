import { useId, useRef, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { FiZap } from "react-icons/fi";
import {
  VJ_LIMITS,
  VJ_TRANSITION_BEAT_COUNTS,
  VJ_TRANSITION_CATALOG,
  vjTransitionLengthMs,
  type VjMediaKind,
  type VjSpeed,
  type VjTempo,
  type VjTransition,
  type VjTransitionId,
  type VjTransitionLength,
  type VjTransitionLengthUnit,
} from "../../../../shared/contracts/vj";
import { useMotionPrefs } from "../../../../app/providers/motionPrefs";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { VjCommandOutcome } from "../../live/vjStageCommands";
import { useVjHelpCaptions } from "../hooks/useVjHelpCaptions";
import {
  useVjOptimisticValue,
  type VjSendRefusal,
} from "../hooks/useVjOptimisticValue";
import { VjDockHelpLegend } from "./VjDockHelpLegend";
import { VjLengthControl } from "./VjLengthControl";
import { VjSpeedChip } from "./VjSpeedChip";
import { VjTransitionPicker } from "./VjTransitionPicker";
import styles from "./VjDockRows.module.css";

/** The contract default for a stage that has not loaded yet. */
const VJ_DEFAULT_TRANSITION: VjTransition = {
  mode: "fade",
  length: { unit: "ms", value: 800 },
};
const VJ_LENGTH_MS_STEP = 100;
const VJ_MODE_KEY = "mode";
const VJ_LENGTH_KEY = "length";
/** The app's ease-out token (--ease-out) at the fast duration (--dur-fast). */
const VJ_SLOT_TRANSITION = { duration: 0.15, ease: [0.16, 1, 0.3, 1] as const };
const VJ_INSTANT = { duration: 0 };

/**
 * The same length counted in the other unit at the stage tempo: beats to ms
 * through `vjTransitionLengthMs` (on the 100 ms step, capped at 4 s), ms to
 * the nearest allowed beat count.
 */
function vjLengthInUnit(
  length: VjTransitionLength,
  unit: VjTransitionLengthUnit,
  tempo: VjTempo,
): VjTransitionLength {
  if (length.unit === unit) return length;
  const lengthMs = vjTransitionLengthMs({ mode: "fade", length }, tempo);
  if (unit === "ms") {
    const steppedMs =
      Math.round(lengthMs / VJ_LENGTH_MS_STEP) * VJ_LENGTH_MS_STEP;
    return { unit, value: Math.min(VJ_LIMITS.fadeMsMax, steppedMs) };
  }
  const beats = (lengthMs * tempo.bpm) / 60000;
  const nearestCount = VJ_TRANSITION_BEAT_COUNTS.reduce<number>(
    (best, count) =>
      Math.abs(count - beats) < Math.abs(best - beats) ? count : best,
    VJ_TRANSITION_BEAT_COUNTS[0],
  );
  return { unit, value: nearestCount };
}

export interface VjTransitionRowProps {
  transition: VjTransition | null;
  tempo: VjTempo | null;
  speed: VjSpeed;
  liveMediaKind: VjMediaKind | null;
  isBlocked: boolean;
  stateRevision: number | null;
  hasFlashConsent: boolean;
  /** A flash-capable mode asks first; the mode names it on the confirm. */
  onNeedFlashConsent: (
    anchor: HTMLElement | null,
    onConsented: () => void,
    transitionMode: VjTransitionId,
  ) => void;
  setTransition: (patch: {
    mode?: VjTransitionId;
    length?: VjTransitionLength;
  }) => Promise<VjCommandOutcome>;
  setSpeed: (speed: VjSpeed) => Promise<VjCommandOutcome>;
  /** A refused send's named reason, for the dock's status line. */
  onRefused?: (refusal: VjSendRefusal) => void;
  /** The status line naming why the controls are blocked, for aria-describedby. */
  blockedReasonId?: string;
}

/**
 * The dock's transition row, one row (44px, 40 in the pads strip): the mode
 * chip (opens the picker; a "Transition" caption over the mode name, "Mode"
 * under the split column's Transition heading, a flash mark in its corner),
 * the length (beat chips or the ms slider; folded away
 * for Cut), and the clip speed chip. Picks show at once and roll back with their named reason
 * on a refusal. A flash-capable transition asks for flash consent first.
 * While help captions are on, a line for the mode, the length and the speed
 * folds in under the row; the length's line folds away with it under Cut.
 */
export function VjTransitionRow({
  transition,
  tempo,
  speed,
  liveMediaKind,
  isBlocked,
  stateRevision,
  hasFlashConsent,
  onNeedFlashConsent,
  setTransition,
  setSpeed,
  onRefused,
  blockedReasonId,
}: VjTransitionRowProps) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const modeChipRef = useRef<HTMLButtonElement>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const modeOptimistic = useVjOptimisticValue<VjTransitionId>({
    stateRevision,
    onRefused,
  });
  const lengthOptimistic = useVjOptimisticValue<VjTransitionLength>({
    stateRevision,
    onRefused,
  });
  const shownTransition = transition ?? VJ_DEFAULT_TRANSITION;
  const mode = modeOptimistic.valueOf(VJ_MODE_KEY, shownTransition.mode);
  const length = lengthOptimistic.valueOf(
    VJ_LENGTH_KEY,
    shownTransition.length,
  );
  const isSendBlocked = isBlocked || transition === null;
  const blockedDescription = isBlocked ? blockedReasonId : undefined;
  const modeLabel = t(`vj:transition.mode.${mode}`);
  const help = useVjTransitionHelp(mode !== "cut");
  const helpIdOf = (helpId: string) => (help.isOn ? helpId : undefined);

  const sendLength = (nextLength: VjTransitionLength) => {
    void lengthOptimistic.apply(VJ_LENGTH_KEY, nextLength, () =>
      setTransition({ length: nextLength }),
    );
  };
  const pickMode = (nextMode: VjTransitionId) => {
    if (isSendBlocked) return;
    setIsPickerOpen(false);
    if (nextMode === mode) return;
    const sendMode = () => {
      void modeOptimistic.apply(VJ_MODE_KEY, nextMode, () =>
        setTransition({ mode: nextMode }),
      );
    };
    if (VJ_TRANSITION_CATALOG[nextMode].isFlashCapable && !hasFlashConsent) {
      onNeedFlashConsent(modeChipRef.current, sendMode, nextMode);
      return;
    }
    sendMode();
  };
  const pickUnit = (unit: VjTransitionLengthUnit) => {
    if (isSendBlocked || tempo === null || unit === length.unit) return;
    sendLength(vjLengthInUnit(length, unit, tempo));
  };

  return (
    <>
      <div className={styles.row} data-vj-transition-row="">
        <button
          ref={modeChipRef}
          type="button"
          className={`${styles.chip} ${styles.captionChip} ${styles.modeChip}`}
          data-vj-transition-chip={mode}
          aria-label={t("vj:transition.pickAria", { mode: modeLabel })}
          aria-haspopup="dialog"
          aria-expanded={isPickerOpen}
          aria-describedby={helpIdOf(help.ids.mode)}
          onClick={() => setIsPickerOpen((isOpen) => !isOpen)}
        >
          {VJ_TRANSITION_CATALOG[mode].isFlashCapable && (
            <FiZap aria-hidden fill="none" />
          )}
          <span
            className={`${styles.chipCaption} ${styles.foldingCaption} ${styles.modeCaptionTitle}`}
            aria-hidden="true"
          >
            {t("vj:transition.title")}
          </span>
          <span
            className={`${styles.chipCaption} ${styles.foldingCaption} ${styles.modeCaptionSplit}`}
            aria-hidden="true"
          >
            {t("vj:transition.modeCaption")}
          </span>
          <span className={`${styles.chipValue} ${styles.modeLabel}`}>
            {modeLabel}
          </span>
        </button>
        <AnimatePresence initial={false}>
          {mode !== "cut" && (
            <m.div
              key="vj-transition-length"
              className={styles.lengthSlot}
              style={{ originX: 0 }}
              initial={{ opacity: 0, scaleX: 0.92 }}
              animate={{ opacity: 1, scaleX: 1 }}
              exit={{ opacity: 0, scaleX: 0.92 }}
              transition={reducedMotion ? VJ_INSTANT : VJ_SLOT_TRANSITION}
            >
              <VjLengthControl
                length={length}
                isBlocked={isSendBlocked}
                stateRevision={stateRevision}
                onPickBeats={(count) =>
                  sendLength({ unit: "beats", value: count })
                }
                sendMs={(value) =>
                  setTransition({ length: { unit: "ms", value } })
                }
                onRefused={onRefused}
                describedBy={
                  [blockedDescription, helpIdOf(help.ids.length)]
                    .filter(Boolean)
                    .join(" ") || undefined
                }
              />
            </m.div>
          )}
        </AnimatePresence>
        <VjSpeedChip
          speed={speed}
          liveMediaKind={liveMediaKind}
          isBlocked={isBlocked}
          stateRevision={stateRevision}
          setSpeed={setSpeed}
          onRefused={onRefused}
          describedBy={blockedDescription}
          helpCaptionId={helpIdOf(help.ids.speed)}
        />
        <VjTransitionPicker
          anchorRef={modeChipRef}
          isOpen={isPickerOpen}
          onClose={() => setIsPickerOpen(false)}
          mode={mode}
          unit={length.unit}
          isBlocked={isSendBlocked}
          canSwitchUnit={tempo !== null}
          onPickMode={pickMode}
          onPickUnit={pickUnit}
          describedBy={blockedDescription}
        />
      </div>
      <VjDockHelpLegend entries={help.entries} />
    </>
  );
}

/** The transition row's help lines, one per control in the row's order, and
 *  the ids its controls point aria-describedby at while help is on. */
function useVjTransitionHelp(hasLength: boolean) {
  const { t } = useTranslation();
  const { isOn } = useVjHelpCaptions();
  const ids = { mode: useId(), length: useId(), speed: useId() };
  const entries = [
    {
      id: ids.mode,
      term: t("vj:transition.title"),
      text: t("vj:help.transitionMode"),
    },
    {
      id: ids.length,
      term: t("vj:help.term.length"),
      text: t("vj:help.transitionLength"),
      isShown: hasLength,
    },
    { id: ids.speed, term: t("vj:effects.speed"), text: t("vj:help.speed") },
  ];
  return { isOn, ids, entries };
}
