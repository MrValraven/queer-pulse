// Input checks shared by the demo stage reducer and its command rules
// (contract 7.5, 7.6, 7.9): value guards, the text, transition length,
// generator and countdown label rules, screen:status; plus the ack and frame
// shapes the stage hands to the server runner. Each reader mirrors the
// backend's (queerpulse-backend/src/vj/vj-field-checks.ts and
// stage/vj-screen-status.ts) so the demo answers the same codes.

import {
  VJ_CLIP_READY_STATES,
  VJ_GENERATOR_CATALOG,
  VJ_GENERATOR_IDS,
  VJ_LIMITS,
  VJ_PRELOAD_FAILURES,
  VJ_REMOTE_COMMAND_NAMES,
  VJ_RENDERERS,
  VJ_SHUFFLE_BEAT_COUNTS,
  VJ_TRANSITION_BEAT_COUNTS,
  VJ_TRANSITION_LENGTH_UNITS,
  type VjAckFailure,
  type VjAttachRole,
  type VjGeneratorId,
  type VjPreloadFailure,
  type VjScreenClipStatus,
  type VjScreenHealth,
  type VjScreenMicReport,
  type VjScreenPreload,
  type VjServerFrameName,
  type VjShuffleIntervalKind,
  type VjSocketErrorCode,
  type VjStageCause,
  type VjStageFrame,
  type VjStageState,
  type VjTransitionLength,
} from "../../../shared/contracts/vj";
import type { VjCommandFrameName } from "../realtime/vjFrames";
import { isVjUuid } from "./vjDemoRules";

/** Every stamped remote command (contract 9.3), the demo's dispatch list. */
export { VJ_REMOTE_COMMAND_NAMES };

/** Most preload entries one screen:status keeps (contract 6.6). */
const VJ_SCREEN_STATUS_CLIPS_MAX = 200;

/** How far a mic report's beatAt may sit from the server's clock (contract 7.9). */
const VJ_MIC_BEAT_SKEW_MS_MAX = 5000;

export function isVjCommandFrameName(name: string): name is VjCommandFrameName {
  return (VJ_REMOTE_COMMAND_NAMES as readonly string[]).includes(name);
}

export function isVjRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function readVjRecord(value: unknown): Record<string, unknown> {
  return isVjRecord(value) ? value : {};
}

/** Whether the record's present keys are exactly the listed ones; a key whose
 *  value is undefined counts as absent (the demo channel's structured clone
 *  keeps them, the live socket's JSON drops them). */
export function hasExactlyVjKeys(
  value: Record<string, unknown>,
  keys: readonly string[],
): boolean {
  const presentKeys = Object.keys(value).filter(
    (key) => value[key] !== undefined,
  );
  const expectedKeys = new Set(keys);
  return (
    presentKeys.length === expectedKeys.size &&
    presentKeys.every((key) => expectedKeys.has(key))
  );
}

// Acks (contract 7.2): every ack carries the server's clock.

/** A fixed English sentence for logs; the frontend maps the code to copy. */
export function vjDemoAckFailure(
  code: VjSocketErrorCode,
  serverNow: number,
  state?: VjStageState,
): VjAckFailure {
  const failure: VjAckFailure = {
    ok: false,
    code,
    message: `The VJ stage refused this frame with ${code}.`,
    serverNow,
  };
  return state === undefined ? failure : { ...failure, state };
}

/** A success ack: the success fields plus `ok` and the server's clock. */
export function vjDemoAckSuccess<Success extends object>(
  serverNow: number,
  success: Success,
): { ok: true; serverNow: number } & Success {
  return { ...success, ok: true as const, serverNow };
}

// Value guards.

function isVjControlCodePoint(codePoint: number): boolean {
  return (
    codePoint <= 0x1f ||
    (codePoint >= 0x7f && codePoint <= 0x9f) ||
    codePoint === 0x2028 ||
    codePoint === 0x2029
  );
}

function hasVjControlCharacter(text: string): boolean {
  for (const character of text) {
    if (isVjControlCodePoint(character.codePointAt(0) ?? 0)) return true;
  }
  return false;
}

export function isOneOf<Value>(
  list: readonly Value[],
  value: unknown,
): value is Value {
  return (list as readonly unknown[]).includes(value);
}

export function isNumberInRange(
  value: unknown,
  range: { min: number; max: number; isInteger: boolean },
): value is number {
  if (typeof value !== "number" || !Number.isFinite(value)) return false;
  if (range.isInteger && !Number.isSafeInteger(value)) return false;
  return value >= range.min && value <= range.max;
}

export const FADE_MS_RANGE = {
  min: VJ_LIMITS.fadeMsMin,
  max: VJ_LIMITS.fadeMsMax,
  isInteger: true,
};
const SHUFFLE_SECONDS_RANGE = {
  min: VJ_LIMITS.shuffleSecondsMin,
  max: VJ_LIMITS.shuffleSecondsMax,
  isInteger: true,
};
export const BPM_RANGE = {
  min: VJ_LIMITS.bpmMin,
  max: VJ_LIMITS.bpmMax,
  isInteger: false,
};
/** Effect amounts, the mix amount, mic level and confidence. */
export const UNIT_AMOUNT_RANGE = { min: 0, max: 1, isInteger: false };
/** stage:setOverlay hideAfterMs (contract 7.5). */
export const OVERLAY_HIDE_AFTER_MS_RANGE = {
  min: VJ_LIMITS.overlayHideAfterMsMin,
  max: VJ_LIMITS.overlayHideAfterMsMax,
  isInteger: true,
};
/** stage:setCountdown durationMs, and targetAt less now (contract 7.5). */
export const COUNTDOWN_LEAD_MS_RANGE = {
  min: VJ_LIMITS.countdownLeadMsMin,
  max: VJ_LIMITS.countdownLeadMsMax,
  isInteger: true,
};
/** health.fps (contract 7.9). */
const HEALTH_FPS_RANGE = { min: 0, max: 240, isInteger: false };
/** health.droppedFrames (contract 7.9). */
const HEALTH_DROPPED_FRAMES_RANGE = { min: 0, max: 1_000_000, isInteger: true };
/** health.cacheBytes (contract 7.9). */
const HEALTH_CACHE_BYTES_RANGE = {
  min: 0,
  max: Number.MAX_SAFE_INTEGER,
  isInteger: true,
};

export function isValidIntervalValue(
  kind: VjShuffleIntervalKind,
  value: unknown,
): value is number {
  return kind === "beats"
    ? isOneOf(VJ_SHUFFLE_BEAT_COUNTS, value)
    : isNumberInRange(value, SHUFFLE_SECONDS_RANGE);
}

export function roundBpm(bpm: number): number {
  return Math.round(bpm * 10) / 10;
}

/** Rounds to two decimal places (a mic level). */
function roundToHundredth(value: number): number {
  return Math.round(value * 100) / 100;
}

// Field readers: each answers the value or the code that refuses it.

/** Text trimmed first, then checked for control characters and length. */
function readTrimmedVjText(
  value: unknown,
  maxCodePoints: number,
  codes: { invalid: VjSocketErrorCode; tooLong: VjSocketErrorCode },
): string | { error: VjSocketErrorCode } {
  if (typeof value !== "string") return { error: codes.invalid };
  const trimmed = value.trim();
  if (hasVjControlCharacter(trimmed)) return { error: codes.invalid };
  if ([...trimmed].length > maxCodePoints) return { error: codes.tooLong };
  return trimmed;
}

/** Overlay text trimmed first, then checked, or the code that refuses it. */
export function readOverlayText(
  value: unknown,
): string | { error: VjSocketErrorCode } {
  return readTrimmedVjText(value, VJ_LIMITS.overlayTextMax, {
    invalid: "vj_overlay_text_invalid",
    tooLong: "vj_overlay_text_too_long",
  });
}

/** A countdown label (contract 7.5): the control character check reads the
 *  label as sent, so a leading or trailing line break is refused before the
 *  trim could drop it; the length check reads the trimmed label. */
export function readVjCountdownLabel(
  value: unknown,
): string | { error: VjSocketErrorCode } {
  if (typeof value === "string" && hasVjControlCharacter(value)) {
    return { error: "vj_countdown_label_invalid" };
  }
  return readTrimmedVjText(value, VJ_LIMITS.countdownLabelMax, {
    invalid: "vj_countdown_label_invalid",
    tooLong: "vj_countdown_label_too_long",
  });
}

const VJ_TRANSITION_LENGTH_KEYS = ["unit", "value"] as const;

/** A transition length (contract 7.5 setTransition): exactly `unit` and
 *  `value`; "ms" an integer 0..4000 (else vj_fade_out_of_range), "beats" one
 *  of the beat counts; anything else vj_transition_length_invalid. */
export function readVjTransitionLength(
  value: unknown,
): VjTransitionLength | { error: VjSocketErrorCode } {
  if (
    !isVjRecord(value) ||
    !hasExactlyVjKeys(value, VJ_TRANSITION_LENGTH_KEYS) ||
    !isOneOf(VJ_TRANSITION_LENGTH_UNITS, value.unit)
  ) {
    return { error: "vj_transition_length_invalid" };
  }
  if (value.unit === "ms") {
    if (!isNumberInRange(value.value, FADE_MS_RANGE)) {
      return { error: "vj_fade_out_of_range" };
    }
    return { unit: "ms", value: value.value };
  }
  if (!isOneOf(VJ_TRANSITION_BEAT_COUNTS, value.value)) {
    return { error: "vj_transition_length_invalid" };
  }
  return { unit: "beats", value: value.value };
}

/** A generator and its variant (contract 7.5 goGenerator). Without a variant
 *  (`hasVariant` false) the catalog default applies; a sent variant must be
 *  one of the generator's variants, or null for a generator that has none. */
export function readVjGeneratorChoice(
  generatorId: unknown,
  variant: unknown,
  hasVariant: boolean,
):
  | { generatorId: VjGeneratorId; generatorVariant: string | null }
  | { error: VjSocketErrorCode } {
  if (!isOneOf(VJ_GENERATOR_IDS, generatorId)) {
    return { error: "vj_generator_invalid" };
  }
  const entry = VJ_GENERATOR_CATALOG[generatorId];
  if (!hasVariant) {
    return { generatorId, generatorVariant: entry.defaultVariant };
  }
  if (entry.variants.length === 0) {
    return variant === null
      ? { generatorId, generatorVariant: null }
      : { error: "vj_generator_variant_invalid" };
  }
  return isOneOf(entry.variants, variant)
    ? { generatorId, generatorVariant: variant }
    : { error: "vj_generator_variant_invalid" };
}

// screen:status (contract 7.9).

/** A screen:status report read into what the demo stores for one screen. */
export interface VjDemoScreenReport {
  isFullscreen: boolean;
  preload: VjScreenPreload;
  health: VjScreenHealth | null;
  /** Read from every screen; the stage keeps it only from the lead. */
  nextClipId: string | null;
  mic: VjScreenMicReport | null;
}

function readClipStatus(value: unknown): VjScreenClipStatus | null {
  if (!isVjRecord(value)) return null;
  const { clipId, state, progress } = value;
  if (!isVjUuid(clipId) || !isOneOf(VJ_CLIP_READY_STATES, state)) {
    return null;
  }
  if (!isNumberInRange(progress, UNIT_AMOUNT_RANGE)) return null;
  // A missing failure reads as null; only a failed clip keeps its failure.
  const rawFailure = value.failure ?? null;
  let failure: VjPreloadFailure | null = null;
  if (rawFailure !== null) {
    if (!isOneOf(VJ_PRELOAD_FAILURES, rawFailure)) return null;
    failure = rawFailure;
  }
  return {
    clipId: clipId.toLowerCase(),
    state,
    progress,
    failure: state === "failed" ? failure : null,
  };
}

/** The preload report with at most 200 clips, or null when any part is malformed (v1). */
function readVjScreenPreload(value: unknown): VjScreenPreload | null {
  if (!isVjRecord(value)) return null;
  const { packId, clips } = value;
  if (!Array.isArray(clips)) return null;
  const readPackId = isVjUuid(packId) ? packId.toLowerCase() : null;
  if (readPackId === null && packId !== null) return null;
  const readClips: VjScreenClipStatus[] = [];
  for (const clip of clips.slice(0, VJ_SCREEN_STATUS_CLIPS_MAX)) {
    const readClip = readClipStatus(clip);
    if (readClip === null) return null;
    readClips.push(readClip);
  }
  return { packId: readPackId, clips: readClips };
}

/** The health report with fps rounded to one decimal; null when absent or any field is invalid. */
function readVjScreenHealth(value: unknown): VjScreenHealth | null {
  if (!isVjRecord(value)) return null;
  const { renderer, fps, droppedFrames, cacheBytes, isEffectLoadHigh } = value;
  if (
    !isOneOf(VJ_RENDERERS, renderer) ||
    !isNumberInRange(fps, HEALTH_FPS_RANGE) ||
    !isNumberInRange(droppedFrames, HEALTH_DROPPED_FRAMES_RANGE) ||
    !isNumberInRange(cacheBytes, HEALTH_CACHE_BYTES_RANGE) ||
    typeof isEffectLoadHigh !== "boolean"
  ) {
    return null;
  }
  return {
    renderer,
    fps: Math.round(fps * 10) / 10,
    droppedFrames,
    cacheBytes,
    isEffectLoadHigh,
  };
}

/** The mic report with level rounded to 0.01; null when absent or any field is invalid. */
function readVjScreenMic(
  value: unknown,
  now: number,
): VjScreenMicReport | null {
  if (!isVjRecord(value)) return null;
  const { level, bpm, confidence, beatAt } = value;
  const isBpmValid = bpm === null || isNumberInRange(bpm, BPM_RANGE);
  const beatAtRange = {
    min: now - VJ_MIC_BEAT_SKEW_MS_MAX,
    max: now + VJ_MIC_BEAT_SKEW_MS_MAX,
    isInteger: true,
  };
  const isBeatAtValid = beatAt === null || isNumberInRange(beatAt, beatAtRange);
  if (
    !isNumberInRange(level, UNIT_AMOUNT_RANGE) ||
    !isBpmValid ||
    !isNumberInRange(confidence, UNIT_AMOUNT_RANGE) ||
    !isBeatAtValid
  ) {
    return null;
  }
  return {
    level: roundToHundredth(level),
    bpm,
    confidence,
    beatAt,
  };
}

/** A screen:status payload, or null when the v1 pair (isFullscreen, preload)
 *  is malformed (the frame is dropped silently). Each new field is read on
 *  its own; an absent or invalid one is stored as null. */
export function readVjScreenStatusPayload(
  payload: unknown,
  now: number,
): VjDemoScreenReport | null {
  const record = readVjRecord(payload);
  if (typeof record.isFullscreen !== "boolean") return null;
  const preload = readVjScreenPreload(record.preload);
  if (preload === null) return null;
  return {
    isFullscreen: record.isFullscreen,
    preload,
    health: readVjScreenHealth(record.health),
    nextClipId: isVjUuid(record.nextClipId)
      ? record.nextClipId.toLowerCase()
      : null,
    mic: readVjScreenMic(record.mic, now),
  };
}

// Frames the demo stage sends.

export interface VjDemoOutgoing {
  name: VjServerFrameName | "ack";
  payload: unknown;
  targetTabId: string | null;
  targetRole: VjAttachRole | null;
}

export function frameTo(
  name: VjServerFrameName,
  payload: unknown,
  target: { tabId?: string | null; role?: VjAttachRole | null } = {},
): VjDemoOutgoing {
  return {
    name,
    payload,
    targetTabId: target.tabId ?? null,
    targetRole: target.role ?? null,
  };
}

/** A stage:state frame; applyAt null applies at once (contract 7.4). */
export function stageFrame(
  state: VjStageState,
  cause: VjStageCause,
  sourceClientId: string | null = null,
  applyAt: number | null = null,
): VjStageFrame {
  return { state, cause, sourceClientId, applyAt };
}
