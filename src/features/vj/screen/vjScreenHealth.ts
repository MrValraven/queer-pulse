/**
 * The health and mic parts of `screen:status` (contract 3.8, 7.9), shaped to
 * the ranges the server's parser keeps. The server stores an out-of-range
 * health or mic field as null, so every value is rounded and clamped here
 * and a report always lands.
 */
import {
  VJ_LIMITS,
  type VjClipDTO,
  type VjRenderer,
  type VjScreenClipStatus,
  type VjScreenHealth,
  type VjScreenMicReport,
} from "../../../shared/contracts/vj";

/** Highest `health.fps` the server keeps (contract 3.8). */
const HEALTH_FPS_MAX = 240;
/** Highest `health.droppedFrames` the server keeps (contract 3.8). */
const HEALTH_DROPPED_FRAMES_MAX = 1_000_000;
/**
 * The server keeps `mic.beatAt` within 5000 ms of its own clock (contract
 * 7.9). A beat older than this margin is sent as null, which leaves room for
 * the frame's trip and the clock's error.
 */
const MIC_BEAT_MAX_AGE_MS = 4000;

export interface VjScreenHealthInput {
  renderer: VjRenderer;
  frames: { fps: number; droppedFrames: number } | null;
  isEffectLoadHigh: boolean;
  /** Every clip this screen holds media for: the active pack and the extra clips. */
  clips: readonly VjClipDTO[];
  statuses: readonly VjScreenClipStatus[];
}

/** Bytes of the clips whose status reads ready, each clip counted once. */
export function vjCacheBytesOf(
  clips: readonly VjClipDTO[],
  statuses: readonly VjScreenClipStatus[],
): number {
  const readyClipIds = new Set<string>();
  for (const status of statuses) {
    if (status.state === "ready") readyClipIds.add(status.clipId);
  }
  const countedClipIds = new Set<string>();
  let totalBytes = 0;
  for (const clip of clips) {
    if (!readyClipIds.has(clip.id) || countedClipIds.has(clip.id)) continue;
    countedClipIds.add(clip.id);
    if (Number.isFinite(clip.byteSize) && clip.byteSize > 0) {
      totalBytes += clip.byteSize;
    }
  }
  return Math.min(Number.MAX_SAFE_INTEGER, Math.round(totalBytes));
}

export function vjScreenHealthOf(input: VjScreenHealthInput): VjScreenHealth {
  return vjWireHealthOf({
    renderer: input.renderer,
    fps: input.frames?.fps ?? 0,
    droppedFrames: input.frames?.droppedFrames ?? 0,
    cacheBytes: vjCacheBytesOf(input.clips, input.statuses),
    isEffectLoadHigh: input.isEffectLoadHigh,
  });
}

/** A health report inside the server's ranges: fps to one decimal in 0..240, whole counts. */
export function vjWireHealthOf(health: VjScreenHealth): VjScreenHealth {
  return {
    renderer: health.renderer,
    fps: Math.round(clampFinite(health.fps, 0, HEALTH_FPS_MAX) * 10) / 10,
    droppedFrames: Math.round(
      clampFinite(health.droppedFrames, 0, HEALTH_DROPPED_FRAMES_MAX),
    ),
    cacheBytes: Math.round(
      clampFinite(health.cacheBytes, 0, Number.MAX_SAFE_INTEGER),
    ),
    isEffectLoadHigh: health.isEffectLoadHigh,
  };
}

/**
 * A mic report inside the server's ranges: level to two decimals, bpm in the
 * tempo limits or null, beatAt a whole server ms close to `serverNowMs` or
 * null. With no clock reading (`serverNowMs` null) the beat is sent as is,
 * rounded.
 */
export function vjWireMicReportOf(
  report: VjScreenMicReport,
  serverNowMs: number | null,
): VjScreenMicReport {
  return {
    level: Math.round(clampFinite(report.level, 0, 1) * 100) / 100,
    bpm: wireBpmOf(report.bpm),
    confidence: clampFinite(report.confidence, 0, 1),
    beatAt: wireBeatAtOf(report.beatAt, serverNowMs),
  };
}

function wireBpmOf(bpm: number | null): number | null {
  if (bpm === null || !Number.isFinite(bpm)) return null;
  if (bpm < VJ_LIMITS.bpmMin || bpm > VJ_LIMITS.bpmMax) return null;
  return bpm;
}

function wireBeatAtOf(
  beatAt: number | null,
  serverNowMs: number | null,
): number | null {
  if (beatAt === null || !Number.isFinite(beatAt)) return null;
  const roundedBeatAt = Math.round(beatAt);
  if (!Number.isSafeInteger(roundedBeatAt)) return null;
  if (serverNowMs === null || !Number.isFinite(serverNowMs)) {
    return roundedBeatAt;
  }
  return Math.abs(roundedBeatAt - serverNowMs) <= MIC_BEAT_MAX_AGE_MS
    ? roundedBeatAt
    : null;
}

/** Clamps into the range; a non-finite value reads as the minimum. */
function clampFinite(value: number, minimum: number, maximum: number): number {
  if (!Number.isFinite(value)) return minimum;
  return Math.min(maximum, Math.max(minimum, value));
}
