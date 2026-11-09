/**
 * The pad tuner (design 7): a latched pad held still for 500 ms, or its
 * context menu, opens this popover over the dock. Under its title one line
 * says what the effect does (always shown). It holds the amount slider
 * (throttled while it moves, the final value sent on release), the variant
 * chips from the catalog, the playhead note for Freeze, Reverse and
 * Ping-pong, and the button that turns the effect off or on.
 */
import { useId, type RefObject } from "react";
import { FiX } from "react-icons/fi";
import { Button } from "../../../../shared/components/ui";
import {
  roundVjAmount,
  VJ_EFFECT_CATALOG,
  type VjEffectId,
  type VjEffectSetting,
} from "../../../../shared/contracts/vj";
import type { TFunction } from "../../../../shared/i18n/types";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { VjCommandOutcome } from "../../live/vjStageCommands";
import { VJ_DRAG_THROTTLE_MS } from "../../vj.constants";
import { useVjOptimisticValue } from "../hooks/useVjOptimisticValue";
import { useVjThrottledDraft } from "../hooks/useVjThrottledDraft";
import { VjDockPopover } from "../kit/VjDockPopover";
import { VjOptionDescription } from "../kit/VjHelpCaption";
import styles from "./VjPads.module.css";

export type VjPadSettingSend = (
  effectId: VjEffectId,
  patch: Partial<VjEffectSetting>,
) => Promise<VjCommandOutcome>;

/** One variant's chip label, by the catalog key rules (tint and duotone read colour names). */
function vjPadVariantLabel(
  effectId: VjEffectId,
  variant: string,
  t: TFunction,
): string {
  if (effectId === "tint") return t(`vj:color.${variant}`);
  if (effectId === "duotone") {
    const [shadow, highlight] = variant.split("-");
    return t("vj:effect.variant.duotonePair", {
      shadow: t(`vj:color.${shadow}`),
      highlight: t(`vj:color.${highlight}`),
    });
  }
  if (effectId === "kaleidoscope") {
    return t("vj:effect.variant.segments", { count: Number(variant) });
  }
  if (effectId === "tile") {
    return t("vj:effect.variant.grid", {
      count: Number(variant.split("x")[0]),
    });
  }
  return t(`vj:effect.variant.${variant}`);
}

interface VjPadControlProps {
  effectId: VjEffectId;
  setting: VjEffectSetting;
  stateRevision: number | null;
  isBlocked: boolean;
  setEffectSetting: VjPadSettingSend;
}

/** The amount slider: at most one value per VJ_DRAG_THROTTLE_MS, the final value on release. */
function VjPadAmount({
  effectId,
  setting,
  stateRevision,
  isBlocked,
  setEffectSetting,
}: VjPadControlProps) {
  const { t } = useTranslation();
  const labelId = useId();
  const draft = useVjThrottledDraft<number>({
    serverValue: setting.amount,
    stateRevision,
    throttleMs: VJ_DRAG_THROTTLE_MS,
    send: (value) =>
      setEffectSetting(effectId, { amount: roundVjAmount(value) }),
    isBlocked,
  });
  const percent = Math.round(draft.value * 100);
  const percentLabel = t("vj:pads.amountValue", { percent });
  return (
    <div className={styles.section}>
      <p id={labelId} className={styles.fieldLabel}>
        {t("vj:pads.amount")}
      </p>
      <div className={styles.sliderRow}>
        <input
          type="range"
          className={styles.slider}
          min={0}
          max={100}
          step={1}
          value={percent}
          aria-labelledby={labelId}
          aria-valuetext={percentLabel}
          aria-disabled={isBlocked}
          onChange={(event) => {
            if (isBlocked) return;
            draft.change(Number(event.currentTarget.value) / 100);
          }}
          onPointerUp={draft.release}
          onPointerCancel={draft.release}
          onKeyUp={draft.release}
          onBlur={draft.release}
        />
        <span className={styles.sliderValue} aria-hidden>
          {percentLabel}
        </span>
      </div>
    </div>
  );
}

/** The variant chips; the picked chip lights at once and holds until the stage confirms it. */
function VjPadVariants({
  effectId,
  setting,
  stateRevision,
  isBlocked,
  setEffectSetting,
}: VjPadControlProps) {
  const { t } = useTranslation();
  const labelId = useId();
  const optimistic = useVjOptimisticValue<string | null>({ stateRevision });
  const variantKey = `variant:${effectId}`;
  const shownVariant = optimistic.valueOf(variantKey, setting.variant);
  return (
    <div className={styles.section}>
      <p id={labelId} className={styles.fieldLabel}>
        {t("vj:pads.variant")}
      </p>
      <div className={styles.chips} role="group" aria-labelledby={labelId}>
        {VJ_EFFECT_CATALOG[effectId].variants.map((variant) => (
          <button
            key={variant}
            type="button"
            className={styles.chip}
            aria-pressed={shownVariant === variant}
            aria-disabled={isBlocked}
            onClick={() => {
              if (isBlocked || shownVariant === variant) return;
              void optimistic.apply(variantKey, variant, () =>
                setEffectSetting(effectId, { variant }),
              );
            }}
          >
            {vjPadVariantLabel(effectId, variant, t)}
          </button>
        ))}
      </div>
    </div>
  );
}

export interface VjPadTunerProps extends VjPadControlProps {
  anchorRef: RefObject<HTMLElement | null>;
  isOpen: boolean;
  /** What the pad shows now (the optimistic value while a send waits). */
  isOn: boolean;
  onClose: () => void;
  /** Turns the effect on or off through the pad's own send path. */
  onToggle: (send: "on" | "off") => void;
}

export function VjPadTuner({
  anchorRef,
  isOpen,
  isOn,
  onClose,
  onToggle,
  ...controlProps
}: VjPadTunerProps) {
  const { t } = useTranslation();
  const titleId = useId();
  const { effectId, isBlocked } = controlProps;
  const entry = VJ_EFFECT_CATALOG[effectId];
  const effectName = t(`vj:effect.name.${effectId}`);
  return (
    <VjDockPopover
      anchorRef={anchorRef}
      isOpen={isOpen}
      onClose={onClose}
      labelledBy={titleId}
      className={styles.popover}
    >
      <div className={styles.popoverHead} data-vj-pad-tuner={effectId}>
        <div className={styles.popoverTitleBlock}>
          <h2 id={titleId} className={styles.popoverTitle}>
            {t("vj:pads.tuneTitle", { effect: effectName })}
          </h2>
          <VjOptionDescription text={t(`vj:effect.desc.${effectId}`)} />
        </div>
        <button
          type="button"
          className={styles.closeButton}
          aria-label={t("vj:pads.closeTune", { effect: effectName })}
          onClick={onClose}
        >
          <FiX aria-hidden fill="none" />
        </button>
      </div>
      {entry.isAmountAdjustable && <VjPadAmount {...controlProps} />}
      {entry.variants.length > 0 && <VjPadVariants {...controlProps} />}
      {entry.exclusiveGroup === "playhead" && (
        <p className={styles.hint}>{t("vj:pads.playheadNote")}</p>
      )}
      <Button
        type="button"
        variant="stage-ghost"
        size="md"
        aria-disabled={isBlocked}
        onClick={() => {
          if (isBlocked) return;
          onToggle(isOn ? "off" : "on");
          if (isOn) onClose();
        }}
      >
        {t(isOn ? "vj:pads.turnOff" : "vj:pads.turnOn", {
          effect: effectName,
        })}
      </Button>
    </VjDockPopover>
  );
}
