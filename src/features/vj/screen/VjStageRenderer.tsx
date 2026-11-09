import {
  useReducer,
  useRef,
  useState,
  type CSSProperties,
  type JSX,
  type Ref,
} from "react";
import {
  VJ_LIMITS,
  VJ_TRANSITION_CATALOG,
  type VjBlendMode,
  type VjEffects,
  type VjTempo,
} from "../../../shared/contracts/vj";
import { cx } from "../../../shared/lib/cx";
import {
  EMPTY_VJ_FLASH_BUDGET,
  requestVjFlash,
  setVjStrobeRunning,
  vjTransitionFlashKind,
  type VjFlashBudget,
} from "../engine/safety/vjFlashGovernor";
import type {
  VjClockReader,
  VjResolvedTransition,
} from "../engine/vjEngineLook";
import { useVjStrobeFlash } from "./useVjStrobeFlash";
import { VjClipLayer } from "./VjClipLayer";
import { VjDomMixLayer } from "./VjDomMixLayer";
import { vjDomSettingOf } from "./vjDomEffectsStyle";
import {
  vjDomMixOpacities,
  vjDomTransitionOf,
  type VjDomTransition,
} from "./vjDomTransitionStyle";
import { VjEffectsFrame } from "./VjEffectsFrame";
import {
  INITIAL_VJ_LAYERS,
  VJ_LAYER_NAMES,
  isOwnOpacityTransition,
  reduceVjLayers,
  vjLayerOpacity,
  vjLayerZ,
  type VjLayerMachineState,
  type VjLayerName,
  type VjRenderableClip,
  type VjRenderableSource,
} from "./vjLayerMachine";
import type { VjStageHandle } from "./vjStageHandle";
import {
  useVjCurtain,
  useVjHeldSources,
  useVjLayersShown,
  useWindowViewport,
} from "./useVjStageLayers";
import {
  VJ_FIRST_TARGET_CUT,
  isVjLayersShowing,
  vjTargetKeyOf,
} from "./vjStageLayerRules";
import styles from "./VjStage.module.css";

export interface VjStageRendererProps {
  /** What should be live now: a clip or a generator; the same clipId twice changes nothing. */
  target: VjRenderableSource | null;
  mix: {
    clip: VjRenderableClip | null;
    amount: number;
    blendMode: VjBlendMode;
  };
  transition: VjResolvedTransition;
  effects: VjEffects;
  tempo: VjTempo;
  clock: VjClockReader;
  /**
   * False on a follower screen: it renders no strobe flashes and runs no flash
   * timer, so only one screen in the room strobes. Defaults to true.
   */
  isStrobeEnabled?: boolean;
  /** Answers which object URLs the renderer holds (layers, the pending target, the mix clip). */
  handleRef?: Ref<VjStageHandle>;
  onClipFailed: (clipId: string) => void;
  /**
   * Called once for each source URL nothing holds any more (a layer replaced
   * while loading, failed, or left behind after a switch, or a mix clip
   * replaced), for the caller to revoke. Ownership of object URLs stays with
   * the caller:
   * - the renderer never revokes or reports anything on unmount, so the page
   *   revokes every URL it still holds when it unmounts;
   * - a new URL for a clip a layer already shows or is loading (same clipId)
   *   is never adopted and never reported here, so the caller revokes that
   *   new URL itself (`holdsSource` answers false for it).
   */
  onSourceReleased: (sourceUrl: string) => void;
  /**
   * Read on mount only: the first target cuts in, for a renderer that
   * arrives while another one still draws the picture.
   */
  shouldCutFirstTarget?: boolean;
  /** Called once, the first time the stage draws its target (or black with none). */
  onShown?: () => void;
}

interface VjFlashDecision {
  /** `${layer}|${clipId}` of the incoming source the decision is for. */
  key: string;
  isGranted: boolean;
}

/**
 * The flash-capable transitions the DOM draws (dipWhite) ask the governor
 * once, when the incoming source's first frame starts its transition. The
 * renderer's budget is the one VjEffectsFrame spends beat flashes from, so a
 * dip and the beat flashes share 3 flashes per rolling second; while the
 * strobe runs the budget is the strobe's and the dip draws as a fade.
 */
function useVjTransitionFlashGrant(isStrobing: boolean) {
  const flashBudgetRef = useRef<VjFlashBudget>(EMPTY_VJ_FLASH_BUDGET);
  const [decision, setDecision] = useState<VjFlashDecision | null>(null);

  const decideOnFirstFrame = (
    layers: VjLayerMachineState,
    layer: VjLayerName,
    clipId: string,
  ): void => {
    const incoming = layers.incoming;
    const slot = layers.slots[layer];
    // Only an armed source whose first frame starts a visible transition over a shown front.
    if (incoming?.layer !== layer || !incoming.isArmed) return;
    const isStartingTransition =
      slot.phase === "loading" &&
      slot.clip?.clipId === clipId &&
      layers.front !== null &&
      !layers.isBlackRequested &&
      incoming.durationMs > 0;
    if (!isStartingTransition) return;
    const flashKind = vjTransitionFlashKind(incoming.mode);
    if (flashKind === null || vjDomTransitionOf(incoming.mode).kind === "fade")
      return;
    flashBudgetRef.current = setVjStrobeRunning(
      flashBudgetRef.current,
      isStrobing,
    );
    const answer = requestVjFlash(
      flashBudgetRef.current,
      flashKind,
      performance.now(),
    );
    flashBudgetRef.current = answer.budget;
    setDecision({ key: `${layer}|${clipId}`, isGranted: answer.isGranted });
  };

  /** The DOM look of the incoming layer's transition: a denied flash draws as the fade. */
  const domTransitionOf = (
    layers: VjLayerMachineState,
    layer: VjLayerName,
  ): VjDomTransition => {
    const incoming = layers.incoming;
    if (incoming?.layer !== layer) return vjDomTransitionOf("fade");
    if (!VJ_TRANSITION_CATALOG[incoming.mode].isFlashCapable) {
      return vjDomTransitionOf(incoming.mode);
    }
    const key = `${layer}|${layers.slots[layer].clip?.clipId ?? ""}`;
    const isGranted = decision?.key === key && decision.isGranted;
    return vjDomTransitionOf(isGranted ? incoming.mode : "fade");
  };

  return { flashBudgetRef, decideOnFirstFrame, domTransitionOf };
}

/**
 * The projector's DOM renderer (the WebGL compositor's fallback): two source
 * layers that switch with no black frame, the mix clip over them, the effects
 * frame around both, then the black curtain for "nothing live", the blackout
 * and the strobe, in that order from the bottom. The overlay, countdown,
 * logo and event card are the page's, drawn above this stage.
 */
export function VjStageRenderer({
  target,
  mix,
  transition,
  effects,
  tempo,
  clock,
  isStrobeEnabled = true,
  handleRef,
  onClipFailed,
  onSourceReleased,
  shouldCutFirstTarget = false,
  onShown,
}: VjStageRendererProps): JSX.Element {
  const [layers, dispatch] = useReducer(reduceVjLayers, INITIAL_VJ_LAYERS);
  const [appliedTargetKey, setAppliedTargetKey] = useState<
    string | null | undefined
  >(undefined);
  const targetKey = vjTargetKeyOf(target);
  if (appliedTargetKey !== targetKey) {
    const isFirstTarget = appliedTargetKey === undefined;
    setAppliedTargetKey(targetKey);
    dispatch({
      type: "target",
      clip: target,
      transition:
        isFirstTarget && shouldCutFirstTarget
          ? VJ_FIRST_TARGET_CUT
          : transition,
    });
  }
  useVjLayersShown(isVjLayersShowing(layers, target !== null), onShown);

  const { isFrontPaused, markSettled } = useVjCurtain(layers);
  const viewport = useWindowViewport();
  const isFlashUp = useVjStrobeFlash(
    effects.isStrobing,
    tempo.bpm,
    isStrobeEnabled,
    { strobeStartedAt: effects.strobeStartedAt, clock },
  );
  const flashGrant = useVjTransitionFlashGrant(effects.isStrobing);
  const mixSourceUrl = mix.clip?.sourceUrl ?? null;
  const mixHeldRef = useVjHeldSources(
    layers,
    mixSourceUrl,
    handleRef,
    onSourceReleased,
  );
  const isFrozen = vjDomSettingOf(effects.settings, "freeze") !== null;

  const handleLayerFailed = (layer: VjLayerName, clipId: string): void => {
    const slot = layers.slots[layer];
    const isLoadingThisClip =
      layers.incoming?.layer === layer &&
      slot.phase === "loading" &&
      slot.clip?.clipId === clipId;
    dispatch({ type: "failed", layer, clipId });
    if (isLoadingThisClip) onClipFailed(clipId);
  };

  const handleFirstFrame = (layer: VjLayerName, clipId: string): void => {
    flashGrant.decideOnFirstFrame(layers, layer, clipId);
    dispatch({ type: "firstFrame", layer, clipId });
  };

  const renderLayer = (layer: VjLayerName): JSX.Element => {
    const slot = layers.slots[layer];
    const clipId = slot.clip?.clipId ?? "";
    const isIncoming = layers.incoming?.layer === layer;
    return (
      <VjClipLayer
        key={layer}
        slot={slot}
        opacity={vjLayerOpacity(layers, layer)}
        zIndex={vjLayerZ(layers, layer)}
        fadeMs={isIncoming ? (layers.incoming?.durationMs ?? 0) : 0}
        transitionStyle={flashGrant.domTransitionOf(layers, layer)}
        speed={effects.speed}
        viewport={viewport}
        isPaused={isFrozen || (layers.front === layer && isFrontPaused)}
        onFirstFrame={() => handleFirstFrame(layer, clipId)}
        onFailed={() => handleLayerFailed(layer, clipId)}
        onFadeEnded={() => dispatch({ type: "fadeEnded", layer, clipId })}
        onCatchUpEnded={() => dispatch({ type: "catchUpEnded", layer, clipId })}
      />
    );
  };

  const baseOpacity = mix.clip
    ? vjDomMixOpacities(mix.amount, mix.blendMode).baseOpacity
    : 1;
  const curtainStyle = {
    opacity: layers.isBlackRequested ? 1 : 0,
    "--vj-curtain-fade": `${layers.curtainFadeMs}ms`,
  } as CSSProperties;
  // Cut means cut: the blackout snaps on and off. Every other transition fades
  // it over its length, at most VJ_LIMITS.fadeMsMax (vjBlackoutFadeMs).
  const blackoutFadeMs =
    transition.mode === "cut"
      ? 0
      : Math.min(VJ_LIMITS.fadeMsMax, Math.max(0, transition.durationMs));
  const blackoutStyle = {
    opacity: effects.isBlackout ? 1 : 0,
    "--vj-blackout-fade": `${blackoutFadeMs}ms`,
  } as CSSProperties;

  return (
    <div className={styles.stage} data-vj-stage="">
      <VjEffectsFrame
        effects={effects}
        tempo={tempo}
        clock={clock}
        flashBudgetRef={flashGrant.flashBudgetRef}
      >
        <div
          className={styles.liveGroup}
          style={{ opacity: baseOpacity }}
          data-vj-live-group=""
        >
          {VJ_LAYER_NAMES.map(renderLayer)}
        </div>
        <VjDomMixLayer
          clip={mix.clip}
          amount={mix.amount}
          blendMode={mix.blendMode}
          speed={effects.speed}
          isPaused={isFrozen}
          viewport={viewport}
          onSourceHeld={(sourceUrl) => {
            mixHeldRef.current = sourceUrl;
          }}
        />
      </VjEffectsFrame>
      <div
        className={cx(styles.layerFill, styles.curtain)}
        style={curtainStyle}
        data-vj-curtain=""
        data-vj-fade-ms={layers.curtainFadeMs}
        onTransitionEnd={(event) => {
          if (!isOwnOpacityTransition(event) || !layers.isBlackRequested) {
            return;
          }
          markSettled();
        }}
      />
      <div
        className={cx(styles.layerFill, styles.blackout)}
        style={blackoutStyle}
        data-vj-blackout=""
        data-vj-fade-ms={blackoutFadeMs}
      />
      <div
        className={cx(styles.layerFill, styles.strobe)}
        style={{ opacity: isFlashUp ? 1 : 0 }}
        data-vj-strobe=""
        data-vj-flash={isFlashUp ? "true" : undefined}
        data-vj-strobe-enabled={isStrobeEnabled ? "true" : "false"}
      />
    </div>
  );
}
