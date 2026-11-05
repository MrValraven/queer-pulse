// Input checks shared by the demo stage reducer and its command rules
// (contract 6.6): value guards, the overlay text rule and screen:status;
// plus the outgoing frame shape the stage hands to the server runner.

import {
  VJ_CLIP_READY_STATES,
  VJ_LIMITS,
  VJ_PRELOAD_FAILURES,
  VJ_SHUFFLE_BEAT_COUNTS,
  type VjAckFailure,
  type VjAttachRole,
  type VjPreloadFailure,
  type VjScreenClipStatus,
  type VjServerFrameName,
  type VjShuffleIntervalKind,
  type VjSocketErrorCode,
  type VjStageCause,
  type VjStageFrame,
  type VjStageState,
} from "../../../shared/contracts/vj";
import type {
  VjCommandFrameName,
  VjScreenStatusPayload,
} from "../realtime/vjFrames";
import { isVjUuid } from "./vjDemoRules";

export const VJ_COMMAND_FRAME_NAMES: readonly VjCommandFrameName[] = [
  "stage:setPack",
  "stage:goClip",
  "stage:setTransition",
  "stage:setOverlay",
  "stage:setEffects",
  "stage:setStrobe",
  "stage:setShuffle",
];

export const VJ_EFFECT_FLAG_NAMES = [
  "isMonochrome",
  "isMirrored",
  "isHueCycling",
  "isBlackout",
] as const;

/** Most preload entries one screen:status keeps (contract 6.6). */
const VJ_SCREEN_STATUS_CLIPS_MAX = 200;

export function isVjCommandFrameName(name: string): name is VjCommandFrameName {
  return (VJ_COMMAND_FRAME_NAMES as readonly string[]).includes(name);
}

export function isVjRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function readVjRecord(value: unknown): Record<string, unknown> {
  return isVjRecord(value) ? value : {};
}

/** A fixed English sentence for logs; the frontend maps the code to copy. */
export function vjDemoAckFailure(
  code: VjSocketErrorCode,
  state?: VjStageState,
): VjAckFailure {
  const failure: VjAckFailure = {
    ok: false,
    code,
    message: `The VJ stage refused this frame with ${code}.`,
  };
  return state === undefined ? failure : { ...failure, state };
}

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
  if (range.isInteger && !Number.isInteger(value)) return false;
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

/** Overlay text trimmed first, then checked, or the code that refuses it. */
export function readOverlayText(
  value: unknown,
): string | { error: VjSocketErrorCode } {
  if (typeof value !== "string") return { error: "vj_overlay_text_invalid" };
  const trimmed = value.trim();
  if (hasVjControlCharacter(trimmed)) {
    return { error: "vj_overlay_text_invalid" };
  }
  if ([...trimmed].length > VJ_LIMITS.overlayTextMax) {
    return { error: "vj_overlay_text_too_long" };
  }
  return trimmed;
}

function readClipStatus(value: unknown): VjScreenClipStatus | null {
  if (!isVjRecord(value)) return null;
  const { clipId, state, progress } = value;
  if (!isVjUuid(clipId) || !isOneOf(VJ_CLIP_READY_STATES, state)) {
    return null;
  }
  const progressRange = { min: 0, max: 1, isInteger: false };
  if (!isNumberInRange(progress, progressRange)) return null;
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

/** A screen:status payload, or null when malformed (dropped silently). */
export function readVjScreenStatusPayload(
  payload: unknown,
): VjScreenStatusPayload | null {
  const record = readVjRecord(payload);
  if (typeof record.isFullscreen !== "boolean") return null;
  if (!isVjRecord(record.preload)) return null;
  const { packId, clips } = record.preload;
  if (!Array.isArray(clips)) return null;
  const readPackId = isVjUuid(packId) ? packId.toLowerCase() : null;
  if (readPackId === null && packId !== null) return null;
  const readClips: VjScreenClipStatus[] = [];
  for (const clip of clips.slice(0, VJ_SCREEN_STATUS_CLIPS_MAX)) {
    const readClip = readClipStatus(clip);
    if (readClip === null) return null;
    readClips.push(readClip);
  }
  return {
    isFullscreen: record.isFullscreen,
    preload: { packId: readPackId, clips: readClips },
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

export function stageFrame(
  state: VjStageState,
  cause: VjStageCause,
  sourceClientId: string | null = null,
): VjStageFrame {
  return { state, cause, sourceClientId };
}
