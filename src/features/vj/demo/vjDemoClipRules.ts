/**
 * Clip default rules of the demo VJ library (contract 6.3), mirroring the
 * backend's `normalizeClipUpdate` and `checkVjLoopPoints` in `vj-input.ts`.
 * Each check answers the contract's reason code in its check order, and no
 * message carries the value it refused.
 */
import {
  VJ_LIMITS,
  VJ_LOOP_MODES,
  VJ_SPEEDS,
  type VjLoopMode,
  type VjMediaKind,
  type VjSpeed,
} from "../../../shared/contracts/vj";
import { vjRefusal } from "./vjDemoRefusals";

/** The clip default fields of a clip update after contract 6.3 steps 4 to 7.
 *  An absent property is left out; a null loop point clears it. */
export interface VjClipDefaultsPatch {
  isFavorite?: boolean;
  defaultSpeed?: VjSpeed;
  loopMode?: VjLoopMode;
  loopInMs?: number | null;
  loopOutMs?: number | null;
}

/** A loop point as the body sends it: null, or a safe integer of at least 0
 *  milliseconds. Answers VJ_CLIP_LOOP_INVALID. */
function readVjLoopPoint(value: unknown): number | null {
  if (value === null) {
    return null;
  }
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0) {
    throw vjRefusal("VJ_CLIP_LOOP_INVALID");
  }
  return value;
}

/** Contract 6.3 steps 4 to 7 in order (favorite, default speed, loop mode,
 *  then the two loop points); throws the first refusal. Title and fit mode
 *  (steps 2 and 3) run before this through `vjDemoRules.ts`. */
export function readVjClipDefaultsPatch(
  body: Record<string, unknown>,
): VjClipDefaultsPatch {
  const patch: VjClipDefaultsPatch = {};
  if (body.isFavorite !== undefined) {
    if (typeof body.isFavorite !== "boolean") {
      throw vjRefusal("VJ_CLIP_FAVORITE_INVALID");
    }
    patch.isFavorite = body.isFavorite;
  }
  if (body.defaultSpeed !== undefined) {
    const defaultSpeed = VJ_SPEEDS.find(
      (candidate) => candidate === body.defaultSpeed,
    );
    if (defaultSpeed === undefined) {
      throw vjRefusal("VJ_CLIP_SPEED_INVALID");
    }
    patch.defaultSpeed = defaultSpeed;
  }
  if (body.loopMode !== undefined) {
    const loopMode = VJ_LOOP_MODES.find(
      (candidate) => candidate === body.loopMode,
    );
    if (loopMode === undefined) {
      throw vjRefusal("VJ_CLIP_LOOP_MODE_INVALID");
    }
    patch.loopMode = loopMode;
  }
  if (body.loopInMs !== undefined) {
    patch.loopInMs = readVjLoopPoint(body.loopInMs);
  }
  if (body.loopOutMs !== undefined) {
    patch.loopOutMs = readVjLoopPoint(body.loopOutMs);
  }
  return patch;
}

/** Contract 6.3 step 9 on the merged points (the `CHK_vj_clips_loop_points`
 *  rule): both null always passes; otherwise the clip is a video with a
 *  duration, each point lies within `0..durationMs`, and the span from
 *  `loopInMs` (or 0) to `loopOutMs` (or the duration) is at least
 *  `VJ_LIMITS.loopMinLengthMs`. Throws VJ_CLIP_LOOP_INVALID. */
export function checkVjClipLoopPoints(
  clip: { mediaKind: VjMediaKind; durationMs: number | null },
  loopInMs: number | null,
  loopOutMs: number | null,
): void {
  if (loopInMs === null && loopOutMs === null) {
    return;
  }
  const durationMs = clip.durationMs;
  if (clip.mediaKind !== "video" || durationMs === null) {
    throw vjRefusal("VJ_CLIP_LOOP_INVALID");
  }
  const isPointInside = (point: number | null): boolean =>
    point === null || (point >= 0 && point <= durationMs);
  if (!isPointInside(loopInMs) || !isPointInside(loopOutMs)) {
    throw vjRefusal("VJ_CLIP_LOOP_INVALID");
  }
  const spanMs = (loopOutMs ?? durationMs) - (loopInMs ?? 0);
  if (spanMs < VJ_LIMITS.loopMinLengthMs) {
    throw vjRefusal("VJ_CLIP_LOOP_INVALID");
  }
}
