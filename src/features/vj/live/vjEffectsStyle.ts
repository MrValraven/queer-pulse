/**
 * Effect and layout rules for a clip layer: CSS filter and transform values,
 * playback rate, render scale and when a small GIF scales pixelated.
 */
import type {
  VjEffects,
  VjFitMode,
  VjMediaKind,
  VjSpeed,
} from "../../../shared/contracts/vj";
import { VJ_PIXELATED_MIN_SCALE } from "../vj.constants";

interface VjViewportSize {
  width: number;
  height: number;
}

export function vjLayerFilter(
  effects: Pick<VjEffects, "isMonochrome">,
): string {
  return effects.isMonochrome ? "grayscale(1)" : "none";
}

export function vjLayerTransform(
  effects: Pick<VjEffects, "isMirrored">,
): string {
  return effects.isMirrored ? "scaleX(-1)" : "none";
}

/** The video playback rate for the stage speed; null for a GIF, which plays at its own pace. */
export function vjPlaybackRateFor(
  mediaKind: VjMediaKind,
  speed: VjSpeed,
): number | null {
  return mediaKind === "gif" ? null : speed;
}

function isPositiveSize(size: VjViewportSize): boolean {
  return (
    Number.isFinite(size.width) &&
    Number.isFinite(size.height) &&
    size.width > 0 &&
    size.height > 0
  );
}

/**
 * How many times its native size the clip is drawn: "fill" covers the
 * viewport (the larger ratio), "fit" sits inside it (the smaller ratio).
 * Unknown or empty sizes read as 1.
 */
export function vjRenderScale(
  clip: { width: number; height: number; fitMode: VjFitMode },
  viewport: VjViewportSize,
): number {
  if (!isPositiveSize(clip) || !isPositiveSize(viewport)) return 1;
  const widthRatio = viewport.width / clip.width;
  const heightRatio = viewport.height / clip.height;
  return clip.fitMode === "fill"
    ? Math.max(widthRatio, heightRatio)
    : Math.min(widthRatio, heightRatio);
}

/** A GIF blown up VJ_PIXELATED_MIN_SCALE times or more keeps hard pixel edges. */
export function shouldPixelateVjClip(
  clip: {
    mediaKind: VjMediaKind;
    width: number;
    height: number;
    fitMode: VjFitMode;
  },
  viewport: VjViewportSize,
): boolean {
  if (clip.mediaKind !== "gif") return false;
  return vjRenderScale(clip, viewport) >= VJ_PIXELATED_MIN_SCALE;
}
