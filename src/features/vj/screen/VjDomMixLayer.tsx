import {
  useEffectEvent,
  useLayoutEffect,
  type CSSProperties,
  type JSX,
} from "react";
import type { VjBlendMode, VjSpeed } from "../../../shared/contracts/vj";
import { shouldPixelateVjClip } from "../live/vjEffectsStyle";
import { VjClipMedia } from "./VjClipLayer";
import type { VjRenderableClip } from "./vjLayerMachine";
import { vjDomBlendOf, vjDomMixOpacities } from "./vjDomTransitionStyle";
import styles from "./VjStage.module.css";

export interface VjDomMixLayerProps {
  clip: VjRenderableClip | null;
  amount: number;
  blendMode: VjBlendMode;
  speed: VjSpeed;
  /** Freeze holds the mix clip too. */
  isPaused?: boolean;
  /** For pixelating a small GIF shown large; no pixelation without it. */
  viewport?: { width: number; height: number };
  /** The object URL this layer holds now, or null; reported before the page's effects run. */
  onSourceHeld: (sourceUrl: string | null) => void;
}

/**
 * The mix clip on the DOM fallback (contract 3.4, decision 11): above the
 * live layers, at the crossfader's opacity, blended with its CSS
 * mix-blend-mode (`add` is `plus-lighter`). The renderer fades the live
 * layers out over the top half of the crossfader for every blend mode but
 * `normal` (vjDomMixOpacities). The clip keeps playing at amount 0, so the
 * crossfader brings it in already moving.
 */
export function VjDomMixLayer({
  clip,
  amount,
  blendMode,
  speed,
  isPaused = false,
  viewport,
  onSourceHeld,
}: VjDomMixLayerProps): JSX.Element {
  const sourceUrl = clip?.sourceUrl ?? null;
  const reportHeld = useEffectEvent((heldUrl: string | null) =>
    onSourceHeld(heldUrl),
  );
  useLayoutEffect(() => {
    reportHeld(sourceUrl);
    return () => reportHeld(null);
  }, [sourceUrl]);

  const { layerOpacity } = vjDomMixOpacities(amount, blendMode);
  const cssBlendMode = vjDomBlendOf(blendMode);
  const style: CSSProperties = {
    opacity: clip ? layerOpacity : 0,
    mixBlendMode: cssBlendMode as CSSProperties["mixBlendMode"],
  };

  return (
    <div
      className={styles.mixLayer}
      style={style}
      data-vj-mix-layer=""
      data-vj-mix-clip-id={clip?.clipId}
      data-vj-blend={blendMode}
      data-vj-css-blend={cssBlendMode}
      aria-hidden="true"
    >
      {clip ? (
        <VjClipMedia
          key={`${clip.clipId}|${clip.sourceUrl}`}
          clip={clip}
          isPaused={isPaused}
          isVisible={layerOpacity > 0}
          speed={speed}
          isPixelated={
            viewport !== undefined && shouldPixelateVjClip(clip, viewport)
          }
        />
      ) : null}
    </div>
  );
}
