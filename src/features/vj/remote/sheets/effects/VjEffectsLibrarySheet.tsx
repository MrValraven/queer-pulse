import { useCallback, useId, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { useMotionPrefs } from "../../../../../app/providers/motionPrefs";
import { Collapse } from "../../../../../shared/components/ui";
import {
  VJ_EFFECT_GROUPS,
  VJ_LIMITS,
  VJ_SPEEDS,
  type VjEffectId,
  type VjEffects,
  type VjEffectSetting,
  type VjMediaKind,
  type VjSpeed,
} from "../../../../../shared/contracts/vj";
import { useTranslation } from "../../../../../shared/i18n/useTranslation";
import type {
  VjCommandFailureOutcome,
  VjCommandOutcome,
} from "../../../live/vjStageCommands";
import type { useVjDockPads } from "../../hooks/useVjDockPads";
import type { VjActionDispatch } from "../../input/vjRemoteAction";
import { VjSheetFrame } from "../../kit/VjSheetFrame";
import { VJ_DOCK_PADS_MAX } from "../../rules/vjDockPads";
import { VjSheetAlert } from "../../VjSheetAlert";
import { VjEffectGroup } from "./VjEffectGroup";
import type { VjPadIsOn } from "./VjEffectRow";
import styles from "./VjEffectsLibrary.module.css";

/** Mirrors --ease and --dur-base. */
const DOCK_CHIP_TRANSITION = {
  duration: 0.25,
  ease: [0.22, 0.68, 0.16, 1],
} as const;

/** The six speeds as chips, with the GIF note while the live clip is a GIF. */
function VjEffectSpeedChips({
  speed,
  isBlocked,
  isLiveGif,
  onSpeed,
}: {
  speed: VjSpeed;
  isBlocked: boolean;
  isLiveGif: boolean;
  onSpeed: (speed: VjSpeed) => void;
}) {
  const { t } = useTranslation();
  const titleId = useId();
  return (
    <section className={styles.section} aria-labelledby={titleId}>
      <h4 id={titleId} className={styles.sectionTitle}>
        {t("vj:effects.speed")}
      </h4>
      <div className={styles.chips} role="group" aria-labelledby={titleId}>
        {VJ_SPEEDS.map((speedOption) => (
          <button
            key={speedOption}
            type="button"
            className={styles.chip}
            aria-pressed={speed === speedOption}
            aria-disabled={isBlocked}
            onClick={() => {
              if (!isBlocked && speed !== speedOption) onSpeed(speedOption);
            }}
          >
            {t("vj:effects.speedValue", { speed: speedOption })}
          </button>
        ))}
      </div>
      <Collapse isOpen={isLiveGif}>
        <p className={styles.hint}>{t("vj:effects.gifSpeedNote")}</p>
      </Collapse>
    </section>
  );
}

/** The pads row's effects in dock order; chips glide as pads move, come and go. */
function VjDockOrder({
  pads,
  dockFullId,
}: {
  pads: readonly VjEffectId[];
  dockFullId: string;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const titleId = useId();
  const transition = reducedMotion ? { duration: 0 } : DOCK_CHIP_TRANSITION;
  const isDockFull = pads.length >= VJ_DOCK_PADS_MAX;
  return (
    <section className={styles.section} aria-labelledby={titleId}>
      <h4 id={titleId} className={styles.sectionTitle}>
        {t("vj:pads.label")}
      </h4>
      <ol className={styles.dockOrder} data-vj-dock-order="">
        <AnimatePresence initial={false} mode="popLayout">
          {pads.map((effectId, padIndex) => (
            <m.li
              key={effectId}
              layout
              className={styles.dockChip}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={transition}
            >
              <span className={styles.dockNumber} aria-hidden>
                {padIndex + 1}
              </span>
              {t(`vj:effect.name.${effectId}`)}
            </m.li>
          ))}
        </AnimatePresence>
      </ol>
      <div id={dockFullId} role="status">
        <Collapse isOpen={isDockFull}>
          <p className={styles.dockFull}>
            {t("vj:effect.dockFull", { count: VJ_DOCK_PADS_MAX })}
          </p>
        </Collapse>
      </div>
    </section>
  );
}

export interface VjEffectsLibrarySheetProps {
  effects: VjEffects;
  stateRevision: number | null;
  dockPads: ReturnType<typeof useVjDockPads>;
  liveMediaKind: VjMediaKind | null;
  isBlocked: boolean;
  dispatch: VjActionDispatch;
  /** The dispatcher's optimistic pad state, so each switch matches its dock pad at once. */
  padIsOn?: VjPadIsOn;
  setEffectSetting: (
    effectId: VjEffectId,
    patch: Partial<VjEffectSetting>,
  ) => Promise<VjCommandOutcome>;
  setSpeed: (speed: VjSpeed) => Promise<VjCommandOutcome>;
  onClose: () => void;
}

/**
 * The All effects sheet: speed, the dock order, then the five catalog
 * groups with every effect. A switch goes through the dispatcher like a pad;
 * amount, variant and speed go out through their callbacks, and a refusal
 * names its reason in the sheet's footer, over the count of effects on and
 * beside the close button.
 */
export function VjEffectsLibrarySheet({
  effects,
  stateRevision,
  dockPads,
  liveMediaKind,
  isBlocked,
  dispatch,
  padIsOn,
  setEffectSetting,
  setSpeed,
  onClose,
}: VjEffectsLibrarySheetProps) {
  const { t } = useTranslation();
  const dockFullId = useId();
  const [failure, setFailure] = useState<VjCommandFailureOutcome | null>(null);
  const noteOutcome = useCallback((outcome: VjCommandOutcome) => {
    setFailure(outcome.ok ? null : outcome);
    return outcome;
  }, []);
  const sendSetting = useCallback(
    (effectId: VjEffectId, patch: Partial<VjEffectSetting>) =>
      setEffectSetting(effectId, patch).then(noteOutcome),
    [setEffectSetting, noteOutcome],
  );
  const onCount = Object.values(effects.settings).filter(
    (setting) => setting?.isOn === true,
  ).length;
  return (
    <VjSheetFrame
      title={t("vj:effect.libraryTitle")}
      intro={t("vj:effect.intro")}
      closeLabel={t("vj:effects.close")}
      onClose={onClose}
      footerStart={
        <>
          <VjSheetAlert
            errorKey={failure?.errorKey ?? null}
            values={{ ...failure?.errorValues }}
          />
          <p className={styles.count} role="status">
            {t("vj:effect.onCount", {
              count: onCount,
              max: VJ_LIMITS.effectsOnMax,
            })}
          </p>
        </>
      }
    >
      <div className={styles.library} data-vj-effects-library="">
        <VjEffectSpeedChips
          speed={effects.speed}
          isBlocked={isBlocked}
          isLiveGif={liveMediaKind === "gif"}
          onSpeed={(speed) => {
            void setSpeed(speed).then(noteOutcome);
          }}
        />
        <VjDockOrder pads={dockPads.pads} dockFullId={dockFullId} />
        {VJ_EFFECT_GROUPS.map((group) => (
          <VjEffectGroup
            key={group}
            group={group}
            effects={effects}
            dockPads={dockPads}
            dockFullId={dockFullId}
            isBlocked={isBlocked}
            stateRevision={stateRevision}
            dispatch={dispatch}
            padIsOn={padIsOn}
            sendSetting={sendSetting}
          />
        ))}
      </div>
    </VjSheetFrame>
  );
}
