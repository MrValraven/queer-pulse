import {
  useReducer,
  useState,
  type CSSProperties,
  type JSX,
  type Dispatch,
  type Ref,
} from "react";
import type { VjSpeed } from "../../../shared/contracts/vj";
import { cx } from "../../../shared/lib/cx";
import type { VjResolvedTransition } from "../engine/vjEngineLook";
import {
  useVjCurtain,
  useVjHeldSources,
  useVjLayersShown,
  useWindowViewport,
} from "./useVjStageLayers";
import { VjClipLayer } from "./VjClipLayer";
import { vjDomTransitionOf } from "./vjDomTransitionStyle";
import {
  INITIAL_VJ_LAYERS,
  VJ_LAYER_NAMES,
  isOwnOpacityTransition,
  reduceVjLayers,
  vjLayerOpacity,
  vjLayerZ,
  type VjLayerEvent,
  type VjLayerMachineState,
  type VjLayerName,
  type VjRenderableClip,
  type VjRenderableSource,
} from "./vjLayerMachine";
import type { VjStageHandle } from "./vjStageHandle";
import {
  VJ_FIRST_TARGET_CUT,
  isVjLayerTargetInFlight,
  isVjLayersShowing,
  vjSimpleSlotOf,
  vjSimpleTargetOf,
  vjSimpleTransitionOf,
  vjSimpleUpcomingOf,
  vjTargetKeyOf,
} from "./vjStageLayerRules";
import styles from "./VjStage.module.css";

export interface VjSimpleRendererProps {
  /** The live source; a generator keeps the last clip this renderer showed, or black. */
  target: VjRenderableSource | null;
  /**
   * The queue head's live source: a clip pre-rolls hidden in the free layer,
   * so a quantized change starts on the beat. Its URL stays held while named.
   */
  upcoming?: VjRenderableSource | null;
  /**
   * The last clip the screen showed before a generator went live, with a URL
   * of its own: a renderer that mounts during the generator shows it until a
   * clip comes back. Ignored once this renderer has shown a clip itself.
   */
  fallbackClip?: VjRenderableClip | null;
  /** look.transition: cut stays a cut, every other id fades over its resolved length. */
  transition: VjResolvedTransition;
  /** state.effects.speed */
  speed: VjSpeed;
  /** state.effects.isBlackout */
  isBlackout: boolean;
  /** look.blackoutFadeMs */
  blackoutFadeMs: number;
  /** True while another renderer still draws: the stage holds at 1% opacity until onShown. */
  isArriving: boolean;
  /** Answers which object URLs the renderer holds (layers and the pending target). */
  handleRef?: Ref<VjStageHandle>;
  onClipFailed: (clipId: string) => void;
  /** Same contract as VjStageRenderer's: one call per URL nothing holds any more, for the caller to revoke. */
  onSourceReleased: (sourceUrl: string) => void;
  /** Called once, the first time the stage draws its live clip (or black with none). */
  onShown: () => void;
}

/**
 * Remembers the last clip this renderer was handed, so a generator target
 * keeps it on screen, and answers what the stage should draw now. A renderer
 * that has shown no clip yet takes the page's fallback clip as its last one.
 */
function useVjSimpleTarget(
  target: VjRenderableSource | null,
  fallbackClip: VjRenderableClip | null,
): VjRenderableClip | null {
  const [lastClip, setLastClip] = useState<VjRenderableClip | null>(null);
  const shownClip = lastClip ?? fallbackClip;
  if (target !== null && target.mediaKind !== "generator") {
    if (vjTargetKeyOf(target) !== vjTargetKeyOf(lastClip)) setLastClip(target);
  } else if (lastClip === null && fallbackClip !== null) {
    setLastClip(fallbackClip);
  }
  return vjSimpleTargetOf(target, shownClip);
}

/**
 * Pre-rolls the queue head's clip (the layer machine's `prepare`): it loads
 * hidden in the free layer and the target that names it starts at once. A
 * target in flight keeps the free layer, so the prepare is sent again once it
 * lands. Null cancels a pre-roll no target armed.
 */
function useVjSimplePreRoll(
  layers: VjLayerMachineState,
  dispatch: Dispatch<VjLayerEvent>,
  upcomingClip: VjRenderableClip | null,
): void {
  const prepareKey = `${vjTargetKeyOf(upcomingClip) ?? ""}|${String(
    isVjLayerTargetInFlight(layers),
  )}`;
  const [preparedKey, setPreparedKey] = useState<string | null>(null);
  if (preparedKey !== prepareKey) {
    setPreparedKey(prepareKey);
    dispatch({ type: "prepare", source: upcomingClip });
  }
}

/**
 * The simple renderer the remote picks (spec 4.2): the two clip layers with an
 * opacity crossfade, the black curtain for "nothing live" and the blackout,
 * in that order from the bottom. It draws no effects, mix clip, generator or
 * strobe, so a screen on a weak machine only decodes video and moves opacity.
 * The queue head's clip pre-rolls in the free layer, so a quantized change
 * lands on the beat with no frame loop of its own.
 * The overlay, countdown, logo and event card are the page's, drawn above.
 */
export function VjSimpleRenderer({
  target,
  upcoming = null,
  fallbackClip = null,
  transition,
  speed,
  isBlackout,
  blackoutFadeMs,
  isArriving,
  handleRef,
  onClipFailed,
  onSourceReleased,
  onShown,
}: VjSimpleRendererProps): JSX.Element {
  const [layers, dispatch] = useReducer(reduceVjLayers, INITIAL_VJ_LAYERS);
  const [appliedTargetKey, setAppliedTargetKey] = useState<
    string | null | undefined
  >(undefined);
  const simpleTarget = useVjSimpleTarget(target, fallbackClip);
  const targetKey = vjTargetKeyOf(simpleTarget);
  if (appliedTargetKey !== targetKey) {
    const isFirstTarget = appliedTargetKey === undefined;
    setAppliedTargetKey(targetKey);
    dispatch({
      type: "target",
      clip: simpleTarget,
      transition: isFirstTarget
        ? VJ_FIRST_TARGET_CUT
        : vjSimpleTransitionOf(transition),
    });
  }
  const upcomingClip = vjSimpleUpcomingOf(upcoming);
  useVjSimplePreRoll(layers, dispatch, upcomingClip);
  useVjLayersShown(isVjLayersShowing(layers, simpleTarget !== null), onShown);

  const { isFrontPaused, markSettled } = useVjCurtain(layers);
  const viewport = useWindowViewport();
  useVjHeldSources(
    layers,
    null,
    handleRef,
    onSourceReleased,
    upcomingClip?.sourceUrl ?? null,
  );

  /** Only an armed target's failure is the clip's; a failed pre-roll loads again when its target arms it. */
  const handleLayerFailed = (layer: VjLayerName, clipId: string): void => {
    const slot = layers.slots[layer];
    const isLoadingThisClip =
      layers.incoming?.layer === layer &&
      layers.incoming.isArmed &&
      slot.phase === "loading" &&
      slot.clip?.clipId === clipId;
    dispatch({ type: "failed", layer, clipId });
    if (isLoadingThisClip) onClipFailed(clipId);
  };

  const renderLayer = (layer: VjLayerName): JSX.Element => {
    const slot = layers.slots[layer];
    const clipId = slot.clip?.clipId ?? "";
    const isIncoming = layers.incoming?.layer === layer;
    return (
      <VjClipLayer
        key={layer}
        slot={vjSimpleSlotOf(slot)}
        opacity={vjLayerOpacity(layers, layer)}
        zIndex={vjLayerZ(layers, layer)}
        fadeMs={isIncoming ? (layers.incoming?.durationMs ?? 0) : 0}
        transitionStyle={vjDomTransitionOf(layers.incoming?.mode ?? "fade")}
        speed={speed}
        viewport={viewport}
        isPaused={layers.front === layer && isFrontPaused}
        onFirstFrame={() => dispatch({ type: "firstFrame", layer, clipId })}
        onFailed={() => handleLayerFailed(layer, clipId)}
        onFadeEnded={() => dispatch({ type: "fadeEnded", layer, clipId })}
        onCatchUpEnded={() => dispatch({ type: "catchUpEnded", layer, clipId })}
      />
    );
  };

  const curtainStyle = {
    opacity: layers.isBlackRequested ? 1 : 0,
    "--vj-curtain-fade": `${layers.curtainFadeMs}ms`,
  } as CSSProperties;
  const blackoutStyle = {
    opacity: isBlackout ? 1 : 0,
    "--vj-blackout-fade": `${blackoutFadeMs}ms`,
  } as CSSProperties;

  return (
    <div
      className={cx(styles.stage, isArriving && styles.isArriving)}
      data-vj-simple-stage=""
      data-vj-arriving={isArriving ? "true" : undefined}
    >
      <div className={styles.liveGroup} data-vj-live-group="">
        {VJ_LAYER_NAMES.map(renderLayer)}
      </div>
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
    </div>
  );
}
