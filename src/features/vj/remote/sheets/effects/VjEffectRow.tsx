import { useId, useState } from "react";
import {
  FiActivity,
  FiAlertTriangle,
  FiArrowLeft,
  FiArrowRight,
  FiChevronDown,
  FiMinus,
  FiPlus,
  FiZap,
} from "react-icons/fi";
import { Collapse } from "../../../../../shared/components/ui";
import {
  roundVjAmount,
  VJ_EFFECT_CATALOG,
  type VjEffectId,
  type VjEffectSetting,
} from "../../../../../shared/contracts/vj";
import type { TFunction } from "../../../../../shared/i18n/types";
import { useTranslation } from "../../../../../shared/i18n/useTranslation";
import type { VjCommandOutcome } from "../../../live/vjStageCommands";
import { VJ_DRAG_THROTTLE_MS } from "../../../vj.constants";
import { useVjThrottledDraft } from "../../hooks/useVjThrottledDraft";
import type { VjActionDispatch } from "../../input/vjRemoteAction";
import styles from "./VjEffectsLibrary.module.css";

/** Reads a pad's on state with any press still on its way to the server. */
export type VjPadIsOn = (padId: VjEffectId, serverIsOn: boolean) => boolean;

export type VjEffectSettingSend = (
  effectId: VjEffectId,
  patch: Partial<VjEffectSetting>,
) => Promise<VjCommandOutcome>;

/** One variant's chip label, by the catalog key rules (tint and duotone read colour names). */
function vjEffectVariantLabel(
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

/** The amount slider: throttled while it moves, the final value sent on release. */
function VjEffectAmount({
  effectId,
  amount,
  stateRevision,
  isBlocked,
  sendSetting,
}: {
  effectId: VjEffectId;
  amount: number;
  stateRevision: number | null;
  isBlocked: boolean;
  sendSetting: VjEffectSettingSend;
}) {
  const { t } = useTranslation();
  const labelId = useId();
  const draft = useVjThrottledDraft<number>({
    serverValue: amount,
    stateRevision,
    throttleMs: VJ_DRAG_THROTTLE_MS,
    send: (value) => sendSetting(effectId, { amount: roundVjAmount(value) }),
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

/** The settings that fold open under a row: warning, amount, variants, playhead note. */
function VjEffectSettings({
  effectId,
  setting,
  stateRevision,
  isBlocked,
  sendSetting,
}: {
  effectId: VjEffectId;
  setting: VjEffectSetting;
  stateRevision: number | null;
  isBlocked: boolean;
  sendSetting: VjEffectSettingSend;
}) {
  const { t } = useTranslation();
  const variantsLabelId = useId();
  const entry = VJ_EFFECT_CATALOG[effectId];
  return (
    <div className={styles.panel}>
      {entry.isFlashCapable && (
        <p className={styles.warning}>
          <FiAlertTriangle
            aria-hidden
            fill="none"
            className={styles.warningIcon}
          />
          <span>{t("vj:effects.strobeWarning")}</span>
        </p>
      )}
      {entry.isAmountAdjustable && (
        <VjEffectAmount
          effectId={effectId}
          amount={setting.amount}
          stateRevision={stateRevision}
          isBlocked={isBlocked}
          sendSetting={sendSetting}
        />
      )}
      {entry.variants.length > 0 && (
        <div className={styles.section}>
          <p id={variantsLabelId} className={styles.fieldLabel}>
            {t("vj:pads.variant")}
          </p>
          <div
            className={styles.chips}
            role="group"
            aria-labelledby={variantsLabelId}
          >
            {entry.variants.map((variant) => (
              <button
                key={variant}
                type="button"
                className={styles.chip}
                aria-pressed={setting.variant === variant}
                aria-disabled={isBlocked}
                onClick={() => {
                  if (isBlocked || setting.variant === variant) return;
                  void sendSetting(effectId, { variant });
                }}
              >
                {vjEffectVariantLabel(effectId, variant, t)}
              </button>
            ))}
          </div>
        </div>
      )}
      {entry.exclusiveGroup === "playhead" && (
        <p className={styles.hint}>{t("vj:pads.playheadNote")}</p>
      )}
    </div>
  );
}

/** A docked effect's place in the dock, with Move left and Move right. */
function VjEffectDockLine({
  effectName,
  dockIndex,
  dockCount,
  onMove,
}: {
  effectName: string;
  dockIndex: number;
  dockCount: number;
  onMove: (direction: -1 | 1) => void;
}) {
  const { t } = useTranslation();
  // Keeps the last place while the line folds away after a removal.
  const [shownIndex, setShownIndex] = useState(dockIndex);
  if (dockIndex !== -1 && dockIndex !== shownIndex) setShownIndex(dockIndex);
  const isFirst = shownIndex <= 0;
  const isLast = shownIndex >= dockCount - 1;
  return (
    <div className={styles.dockLine}>
      <span className={styles.dockBadge} aria-hidden>
        {shownIndex + 1}
      </span>
      <button
        type="button"
        className={styles.iconButton}
        aria-label={t("vj:effect.moveLeft", { effect: effectName })}
        aria-disabled={isFirst}
        onClick={() => {
          if (!isFirst) onMove(-1);
        }}
      >
        <FiArrowLeft aria-hidden fill="none" />
      </button>
      <button
        type="button"
        className={styles.iconButton}
        aria-label={t("vj:effect.moveRight", { effect: effectName })}
        aria-disabled={isLast}
        onClick={() => {
          if (!isLast) onMove(1);
        }}
      >
        <FiArrowRight aria-hidden fill="none" />
      </button>
    </div>
  );
}

/** The flash and beat markers under an effect's name, words beside their icons. */
function VjEffectMarkers({
  id,
  isFlashCapable,
  isBeat,
}: {
  id: string;
  isFlashCapable: boolean;
  isBeat: boolean;
}) {
  const { t } = useTranslation();
  if (!isFlashCapable && !isBeat) return null;
  return (
    <span id={id} className={styles.markers}>
      {isFlashCapable && (
        <span className={styles.marker} data-kind="flash">
          <FiZap aria-hidden fill="none" className={styles.markerIcon} />
          {t("vj:pads.flashMarker")}
        </span>
      )}
      {isBeat && (
        <span className={styles.marker} data-kind="beat">
          <FiActivity aria-hidden fill="none" className={styles.markerIcon} />
          {t("vj:pads.beatMarker")}
        </span>
      )}
    </span>
  );
}

export interface VjEffectRowProps {
  effectId: VjEffectId;
  setting: VjEffectSetting;
  /** The effect's place in the dock list; -1 when it is not docked. */
  dockIndex: number;
  dockCount: number;
  isDockFull: boolean;
  /** The line saying the dock is full, which a blocked Add points at. */
  dockFullId: string;
  isBlocked: boolean;
  stateRevision: number | null;
  dispatch: VjActionDispatch;
  /** The dispatcher's optimistic on state (`actions.padIsOn`), so the switch
   *  flips with the dock pad before the server echoes. Left out, the server
   *  value shows. */
  padIsOn?: VjPadIsOn;
  sendSetting: VjEffectSettingSend;
  onAddToDock: (effectId: VjEffectId) => void;
  onRemoveFromDock: (effectId: VjEffectId) => void;
  onMoveInDock: (effectId: VjEffectId, direction: -1 | 1) => void;
}

/**
 * One effect in the library: the on switch (a pad press and release inside
 * the latch window, so the dispatcher's flash consent and optimism apply),
 * the dock button, and the settings that fold open under it.
 */
export function VjEffectRow({
  effectId,
  setting,
  dockIndex,
  dockCount,
  isDockFull,
  dockFullId,
  isBlocked,
  stateRevision,
  dispatch,
  padIsOn,
  sendSetting,
  onAddToDock,
  onRemoveFromDock,
  onMoveInDock,
}: VjEffectRowProps) {
  const { t } = useTranslation();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const panelId = useId();
  const markersId = useId();
  const entry = VJ_EFFECT_CATALOG[effectId];
  const effectName = t(`vj:effect.name.${effectId}`);
  const hasMarkers = entry.isFlashCapable || entry.isBeatSynced;
  const isDocked = dockIndex !== -1;
  const isAddHeld = !isDocked && isDockFull;
  const isOn = padIsOn ? padIsOn(effectId, setting.isOn) : setting.isOn;
  return (
    <div
      className={styles.row}
      data-vj-effect-row={effectId}
      data-on={String(isOn)}
    >
      <div className={styles.rowHead}>
        <button
          type="button"
          role="switch"
          className={styles.switch}
          aria-checked={isOn}
          aria-disabled={isBlocked}
          aria-label={effectName}
          aria-describedby={hasMarkers ? markersId : undefined}
          onClick={() => {
            if (isBlocked) return;
            dispatch({ kind: "pad", padId: effectId }, "press");
            dispatch({ kind: "pad", padId: effectId }, "release");
          }}
        >
          <span className={styles.switchText}>
            <span className={styles.name}>{effectName}</span>
            <VjEffectMarkers
              id={markersId}
              isFlashCapable={entry.isFlashCapable}
              isBeat={entry.isBeatSynced}
            />
          </span>
          <span className={styles.track} aria-hidden>
            <span className={styles.knob} />
          </span>
        </button>
        <button
          type="button"
          className={styles.iconButton}
          data-docked={String(isDocked)}
          aria-label={t(
            isDocked ? "vj:effect.removeFromDock" : "vj:effect.addToDock",
            { effect: effectName },
          )}
          aria-disabled={isAddHeld}
          aria-describedby={isAddHeld ? dockFullId : undefined}
          onClick={() => {
            if (isDocked) onRemoveFromDock(effectId);
            else if (!isAddHeld) onAddToDock(effectId);
          }}
        >
          {isDocked ? (
            <FiMinus aria-hidden fill="none" />
          ) : (
            <FiPlus aria-hidden fill="none" />
          )}
        </button>
        <button
          type="button"
          className={styles.iconButton}
          aria-label={t("vj:pads.tuneTitle", { effect: effectName })}
          aria-expanded={isSettingsOpen}
          aria-controls={panelId}
          onClick={() => setIsSettingsOpen((isOpen) => !isOpen)}
        >
          <FiChevronDown aria-hidden fill="none" className={styles.chevron} />
        </button>
      </div>
      <Collapse isOpen={isDocked}>
        <VjEffectDockLine
          effectName={effectName}
          dockIndex={dockIndex}
          dockCount={dockCount}
          onMove={(direction) => onMoveInDock(effectId, direction)}
        />
      </Collapse>
      <div id={panelId}>
        <Collapse isOpen={isSettingsOpen}>
          <VjEffectSettings
            effectId={effectId}
            setting={setting}
            stateRevision={stateRevision}
            isBlocked={isBlocked}
            sendSetting={sendSetting}
          />
        </Collapse>
      </div>
    </div>
  );
}
