/**
 * One dock pad (design 7): a button with the effect's short name at the
 * bottom-left, its flash and beat marks in the top-right corner, and the
 * amount on a track along the bottom edge (sizes per variant and layout live
 * in VjPads.module.css). Press handling is
 * `useVjPadPress` (tap latches, a hold past 250 ms is momentary, a latched
 * pad held still for 500 ms or its context menu opens the tuner); every send
 * goes to `onPadSend` with the pad element, and the dispatcher (R26) applies
 * optimism, flash consent and haptics. While MIDI learn waits for a target, a
 * press picks this pad and sends nothing. While help captions are on, the
 * pad shows what its effect does under its label, at most two lines.
 */
import {
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from "react";
import { AnimatePresence, m } from "motion/react";
import { FiActivity, FiZap } from "react-icons/fi";
import { useMotionPrefs } from "../../../../app/providers/motionPrefs";
import {
  VJ_EFFECT_CATALOG,
  type VjEffectId,
  type VjEffectSetting,
} from "../../../../shared/contracts/vj";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { useVjHelpCaptions } from "../hooks/useVjHelpCaptions";
import { useVjPadPress, type VjPadPressHandlers } from "../hooks/useVjPadPress";
import type { VjMidiLearnTargetProps } from "../midi/useVjMidiLearnTarget";
import { useVjMidiLearnTarget } from "../midi/useVjMidiLearnTarget";
import type { VjPadId } from "../rules/vjDockPads";
import { VjPadTuner, type VjPadSettingSend } from "./VjPadTuner";
import { useVjShortLabel, vjPadLabelKey } from "./vjPadLabel";
import styles from "./VjPads.module.css";

/** The app's base duration (--dur-base) and ease (--ease), as the pads use. */
const VJ_PAD_DESCRIPTION_TRANSITION = {
  duration: 0.25,
  ease: [0.22, 0.68, 0.16, 1] as const,
};

/** What the effect does, under the pad's label while help captions are on. */
function VjPadDescription({ id, text }: { id: string; text: string }) {
  const { reducedMotion } = useMotionPrefs();
  return (
    <m.span
      className={styles.descriptionFold}
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={
        reducedMotion ? { duration: 0 } : VJ_PAD_DESCRIPTION_TRANSITION
      }
    >
      <span id={id} className={styles.description} data-vj-pad-description="">
        {text}
      </span>
    </m.span>
  );
}

export type VjPadSendHandler = (
  padId: VjPadId,
  send: "on" | "off",
  anchor: HTMLElement | null,
) => void;

export interface VjPadButtonProps {
  padId: VjPadId;
  /** The full effect name: the pad's accessible name. */
  label: string;
  /** What the pad face shows; the full name when left out. */
  shortLabel?: string;
  isOn: boolean;
  isPending: boolean;
  isBlocked: boolean;
  isPressed: boolean;
  isFlashCapable: boolean;
  isBeatSynced: boolean;
  handlers: VjPadPressHandlers;
  learnProps: VjMidiLearnTargetProps;
  /** What the effect does (vj:effect.desc.*), shown while help captions are on. */
  description?: string;
  /** Extra drawing inside the pad: the amount bar or the strobe countdown. */
  children?: ReactNode;
  describedBy?: string;
  style?: CSSProperties;
  ref?: Ref<HTMLButtonElement>;
}

/** The pad face both the effect pads and the strobe pad draw. */
export function VjPadButton({
  padId,
  label,
  shortLabel,
  isOn,
  isPending,
  isBlocked,
  isPressed,
  isFlashCapable,
  isBeatSynced,
  handlers,
  learnProps,
  description,
  children,
  describedBy,
  style,
  ref,
}: VjPadButtonProps) {
  const { t } = useTranslation();
  const { isOn: isHelpOn } = useVjHelpCaptions();
  const marksId = useId();
  const descriptionId = useId();
  const hasMarks = isFlashCapable || isBeatSynced;
  const isDescriptionShown = isHelpOn && description !== undefined;
  const describedByIds = [
    hasMarks ? marksId : null,
    isDescriptionShown ? descriptionId : null,
    describedBy,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <button
      ref={ref}
      type="button"
      className={styles.pad}
      data-vj-pad={padId}
      data-on={String(isOn)}
      data-pressed={String(isPressed)}
      aria-pressed={isOn}
      aria-busy={isPending || undefined}
      aria-disabled={isBlocked}
      aria-label={t("vj:pads.padAria", { effect: label })}
      aria-describedby={describedByIds === "" ? undefined : describedByIds}
      style={style}
      {...learnProps}
      {...handlers}
    >
      <span className={styles.marks} aria-hidden>
        {isFlashCapable && (
          <FiZap fill="none" className={styles.markIcon} data-kind="flash" />
        )}
        {isBeatSynced && (
          <FiActivity
            fill="none"
            className={styles.markIcon}
            data-kind="beat"
          />
        )}
      </span>
      <span className={styles.name} data-vj-pad-face="" aria-hidden>
        {shortLabel ?? label}
      </span>
      <AnimatePresence initial={false}>
        {isHelpOn && description !== undefined && (
          <VjPadDescription
            key="description"
            id={descriptionId}
            text={description}
          />
        )}
      </AnimatePresence>
      {hasMarks && (
        <span id={marksId} className="visuallyHidden">
          {isFlashCapable && <span>{t("vj:pads.flashMarker")}</span>}
          {isFlashCapable && isBeatSynced && <span>, </span>}
          {isBeatSynced && <span>{t("vj:pads.beatMarker")}</span>}
        </span>
      )}
      {children}
    </button>
  );
}

export interface VjEffectPadProps {
  effectId: VjEffectId;
  setting: VjEffectSetting;
  /** What the pad shows now (the optimistic value while a send waits). */
  isOn: boolean;
  isPending: boolean;
  isBlocked: boolean;
  stateRevision: number | null;
  onPadSend: VjPadSendHandler;
  setEffectSetting: VjPadSettingSend;
  /** The status line naming why the controls are blocked, for aria-describedby. */
  describedBy?: string;
}

export function VjEffectPad({
  effectId,
  setting,
  isOn,
  isPending,
  isBlocked,
  stateRevision,
  onPadSend,
  setEffectSetting,
  describedBy,
}: VjEffectPadProps) {
  const { t } = useTranslation();
  const padRef = useRef<HTMLButtonElement>(null);
  const [isTunerOpen, setIsTunerOpen] = useState(false);
  const entry = VJ_EFFECT_CATALOG[effectId];
  const label = t(`vj:effect.name.${effectId}`);
  const shortLabel = useVjShortLabel(vjPadLabelKey(effectId), label);
  const { handlers, isPressed } = useVjPadPress({
    isOn,
    isBlocked,
    onSend: (send) => onPadSend(effectId, send, padRef.current),
    onOpenTuner: () => setIsTunerOpen(true),
  });
  const { learnProps } = useVjMidiLearnTarget({ kind: "pad", padId: effectId });
  const amountStyle = {
    "--vj-pad-amount": String(setting.amount),
  } as CSSProperties;
  return (
    <>
      <VjPadButton
        ref={padRef}
        padId={effectId}
        label={label}
        shortLabel={shortLabel}
        isOn={isOn}
        isPending={isPending}
        isBlocked={isBlocked}
        isPressed={isPressed}
        isFlashCapable={entry.isFlashCapable}
        isBeatSynced={entry.isBeatSynced}
        handlers={handlers}
        learnProps={learnProps}
        description={t(`vj:effect.desc.${effectId}`)}
        describedBy={describedBy}
        style={amountStyle}
      >
        {entry.isAmountAdjustable && (
          <span className={styles.amount} data-vj-pad-amount="" aria-hidden>
            <span className={styles.amountFill} />
          </span>
        )}
      </VjPadButton>
      <VjPadTuner
        anchorRef={padRef}
        isOpen={isTunerOpen}
        isOn={isOn}
        onClose={() => setIsTunerOpen(false)}
        onToggle={(send) => onPadSend(effectId, send, padRef.current)}
        effectId={effectId}
        setting={setting}
        stateRevision={stateRevision}
        isBlocked={isBlocked}
        setEffectSetting={setEffectSetting}
      />
    </>
  );
}
