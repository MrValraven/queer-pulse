import {
  useEffect,
  useEffectEvent,
  useImperativeHandle,
  useReducer,
  useRef,
  useState,
  type CSSProperties,
  type JSX,
  type Ref,
  type RefObject,
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
  releasedVjSourceUrls,
  vjLayerOpacity,
  vjLayerZ,
  type VjLayerMachineState,
  type VjLayerName,
  type VjRenderableClip,
  type VjRenderableSource,
} from "./vjLayerMachine";
import type { VjStageHandle } from "./vjStageHandle";
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
}

function readViewport(): { width: number; height: number } {
  return { width: window.innerWidth, height: window.innerHeight };
}

function useWindowViewport(): { width: number; height: number } {
  const [viewport, setViewport] = useState(readViewport);
  useEffect(() => {
    const handleResize = (): void => setViewport(readViewport());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return viewport;
}

/** A target is identified by its source key and its URL: a re-tap of the live source is the same key. */
function targetKeyOf(target: VjRenderableSource | null): string | null {
  return target ? `${target.clipId}|${target.sourceUrl}` : null;
}

/** Every object URL the layers and the pending target hold (generators hold none). */
function layerHeldSourceUrls(layers: VjLayerMachineState): string[] {
  // Nothing is held in the initial state, so the URLs released going back to
  // it are exactly the URLs held now.
  return releasedVjSourceUrls(layers, INITIAL_VJ_LAYERS);
}

function heldSourceUrls(
  layers: VjLayerMachineState,
  mixSourceUrl: string | null,
): string[] {
  const held = layerHeldSourceUrls(layers);
  if (mixSourceUrl && !held.includes(mixSourceUrl)) held.push(mixSourceUrl);
  return held;
}

/**
 * Reports each URL nothing holds any more and exposes the stage handle. The
 * mix layer reports its URL in a layout effect, so both see it before any
 * passive effect of the page runs.
 */
function useVjHeldSources(
  layers: VjLayerMachineState,
  mixSourceUrl: string | null,
  handleRef: Ref<VjStageHandle> | undefined,
  onSourceReleased: (sourceUrl: string) => void,
): RefObject<string | null> {
  const mixHeldRef = useRef<string | null>(null);
  const previousHeldRef = useRef<readonly string[]>([]);
  const releaseSource = useEffectEvent((sourceUrl: string) =>
    onSourceReleased(sourceUrl),
  );
  useEffect(() => {
    const held = heldSourceUrls(layers, mixHeldRef.current);
    const released = previousHeldRef.current.filter(
      (sourceUrl) => !held.includes(sourceUrl),
    );
    previousHeldRef.current = held;
    for (const sourceUrl of released) releaseSource(sourceUrl);
  }, [layers, mixSourceUrl]);

  useImperativeHandle(
    handleRef,
    () => ({
      holdsSource: (sourceUrl: string) =>
        sourceUrl !== "" &&
        heldSourceUrls(layers, mixHeldRef.current).includes(sourceUrl),
    }),
    [layers],
  );
  return mixHeldRef;
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

/** The black curtain's settle state and whether the front clip is paused under it. */
function useVjCurtain(layers: VjLayerMachineState) {
  const [curtain, setCurtain] = useState({
    isBlack: layers.isBlackRequested,
    isSettled: false,
  });
  if (curtain.isBlack !== layers.isBlackRequested) {
    setCurtain({ isBlack: layers.isBlackRequested, isSettled: false });
  }
  const isFrontPaused =
    layers.isBlackRequested && (layers.curtainFadeMs <= 0 || curtain.isSettled);
  const markSettled = (): void =>
    setCurtain({ isBlack: true, isSettled: true });
  return { isFrontPaused, markSettled };
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
}: VjStageRendererProps): JSX.Element {
  const [layers, dispatch] = useReducer(reduceVjLayers, INITIAL_VJ_LAYERS);
  const [appliedTargetKey, setAppliedTargetKey] = useState<
    string | null | undefined
  >(undefined);
  const targetKey = targetKeyOf(target);
  if (appliedTargetKey !== targetKey) {
    setAppliedTargetKey(targetKey);
    dispatch({ type: "target", clip: target, transition });
  }

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
