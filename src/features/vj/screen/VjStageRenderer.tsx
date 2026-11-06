import {
  useEffect,
  useEffectEvent,
  useReducer,
  useRef,
  useState,
  type CSSProperties,
  type JSX,
} from "react";
import type {
  VjEffects,
  VjOverlay,
  VjTransition,
} from "../../../shared/contracts/vj";
import { cx } from "../../../shared/lib/cx";
import { useVjStrobeFlash } from "./useVjStrobeFlash";
import { VjClipLayer } from "./VjClipLayer";
import { VjEffectsFrame } from "./VjEffectsFrame";
import {
  INITIAL_VJ_LAYERS,
  VJ_LAYER_NAMES,
  isOwnOpacityTransition,
  reduceVjLayers,
  releasedVjSourceUrls,
  vjLayerOpacity,
  vjLayerZ,
  type VjLayerName,
  type VjRenderableClip,
} from "./vjLayerMachine";
import { VjOverlayText } from "./VjOverlayText";
import styles from "./VjStage.module.css";

export interface VjStageRendererProps {
  /** What should be live now; the same clipId twice changes nothing. */
  target: VjRenderableClip | null;
  transition: VjTransition;
  effects: VjEffects;
  overlay: VjOverlay;
  bpm: number;
  /**
   * False on a follower screen: it renders no strobe flashes and runs no flash
   * timer, so only one screen in the room strobes. Defaults to true.
   */
  isStrobeEnabled?: boolean;
  onClipFailed: (clipId: string) => void;
  /**
   * Called once for each source URL no layer holds any more (replaced while
   * loading, failed, or left behind after a switch), for the caller to revoke.
   * Ownership of object URLs stays with the caller:
   * - the renderer never revokes or reports anything on unmount, so the page
   *   revokes every URL it still holds when it unmounts;
   * - a new URL for a clip the renderer already shows or is loading (same
   *   clipId) is never adopted and never reported here, so the caller revokes
   *   that new URL itself.
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

/** A target is identified by its clip and its source: a re-tap of the live clip is the same key. */
function targetKeyOf(target: VjRenderableClip | null): string | null {
  return target ? `${target.clipId}|${target.sourceUrl}` : null;
}

/**
 * The projector stage: two clip layers that switch with no black frame, the
 * effects, the black curtain for "no clip", the blackout, the strobe and the
 * overlay text, in that order from the bottom.
 */
export function VjStageRenderer({
  target,
  transition,
  effects,
  overlay,
  bpm,
  isStrobeEnabled = true,
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

  const [curtain, setCurtain] = useState({
    isBlack: layers.isBlackRequested,
    isSettled: false,
  });
  if (curtain.isBlack !== layers.isBlackRequested) {
    setCurtain({ isBlack: layers.isBlackRequested, isSettled: false });
  }
  const isFrontPaused =
    layers.isBlackRequested && (layers.curtainFadeMs <= 0 || curtain.isSettled);

  const viewport = useWindowViewport();
  const isFlashUp = useVjStrobeFlash(effects.isStrobing, bpm, isStrobeEnabled);

  const previousLayersRef = useRef(INITIAL_VJ_LAYERS);
  const releaseSource = useEffectEvent((sourceUrl: string) =>
    onSourceReleased(sourceUrl),
  );
  useEffect(() => {
    const released = releasedVjSourceUrls(previousLayersRef.current, layers);
    previousLayersRef.current = layers;
    for (const sourceUrl of released) releaseSource(sourceUrl);
  }, [layers]);

  const handleLayerFailed = (layer: VjLayerName, clipId: string): void => {
    const slot = layers.slots[layer];
    const isLoadingThisClip =
      layers.incoming?.layer === layer &&
      slot.phase === "loading" &&
      slot.clip?.clipId === clipId;
    dispatch({ type: "failed", layer, clipId });
    if (isLoadingThisClip) onClipFailed(clipId);
  };

  const renderLayer = (layer: VjLayerName): JSX.Element => {
    const slot = layers.slots[layer];
    const clipId = slot.clip?.clipId ?? "";
    return (
      <VjClipLayer
        key={layer}
        slot={slot}
        opacity={vjLayerOpacity(layers, layer)}
        zIndex={vjLayerZ(layers, layer)}
        fadeMs={layers.incoming?.layer === layer ? layers.incoming.fadeMs : 0}
        speed={effects.speed}
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
  // Cut means cut: the blackout snaps on and off. Only a fade transition fades it.
  const blackoutFadeMs = transition.mode === "cut" ? 0 : transition.fadeMs;
  const blackoutStyle = {
    opacity: effects.isBlackout ? 1 : 0,
    "--vj-blackout-fade": `${blackoutFadeMs}ms`,
  } as CSSProperties;

  return (
    <div className={styles.stage} data-vj-stage="">
      <VjEffectsFrame effects={effects}>
        {VJ_LAYER_NAMES.map(renderLayer)}
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
          setCurtain({ isBlack: true, isSettled: true });
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
      {/* A target that waits for a catch-up has no layer yet. This inert element
          carries its source URL so the page does not mistake it for unadopted and
          revoke it; preload none fetches and decodes nothing. */}
      {layers.pendingTarget ? (
        <video
          hidden
          muted
          preload="none"
          src={layers.pendingTarget.clip.sourceUrl}
          aria-hidden="true"
          data-vj-pending-source=""
        />
      ) : null}
      <VjOverlayText overlay={overlay} size="screen" />
    </div>
  );
}
