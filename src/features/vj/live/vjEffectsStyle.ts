/**
 * Playback and layout rules for a clip layer: the composed playback rate,
 * the render scale and when a small GIF scales pixelated. The DOM fallback
 * for the effect catalog lives with the engine in screen/vjDomEffectsStyle.ts.
 */
import type {
  VjFitMode,
  VjMediaKind,
  VjSpeed,
} from "../../../shared/contracts/vj";
import { VJ_PIXELATED_MIN_SCALE } from "../vj.constants";

const VJ_MIN_PLAYBACK_RATE = 0.25;
const VJ_MAX_PLAYBACK_RATE = 4;

interface VjViewportSize {
  width: number;
  height: number;
}

/**
 * The rate a clip plays at: its own default speed times the stage speed,
 * clamped to 0.25..4 (C 6.1 "Playback defaults"). A default speed that is
 * missing or non-finite reads as 1.
 */
export function vjEffectivePlaybackRate(
  clipDefaultSpeed: number,
  stageSpeed: VjSpeed,
): number {
  const baseSpeed = Number.isFinite(clipDefaultSpeed) ? clipDefaultSpeed : 1;
  const composedRate = baseSpeed * stageSpeed;
  return Math.min(
    VJ_MAX_PLAYBACK_RATE,
    Math.max(VJ_MIN_PLAYBACK_RATE, composedRate),
  );
}

/** The video playback rate for the clip and stage speed; null for a GIF, which plays at its own pace. */
export function vjPlaybackRateFor(
  mediaKind: VjMediaKind,
  speed: VjSpeed,
  clipDefaultSpeed = 1,
): number | null {
  return mediaKind === "gif"
    ? null
    : vjEffectivePlaybackRate(clipDefaultSpeed, speed);
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
