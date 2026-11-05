// Contract 6.4 and 6.6 stage command rules for the demo server, pure.
// The live VjStageService applies the same checks in the same order.

import {
  VJ_LIMITS,
  VJ_OVERLAY_STYLES,
  VJ_SHUFFLE_INTERVAL_KINDS,
  VJ_SPEEDS,
  VJ_TRANSITION_MODES,
  type VjEffects,
  type VjOverlay,
  type VjShuffle,
  type VjSocketErrorCode,
  type VjStageRestore,
  type VjStageState,
  type VjTransition,
} from "../../../shared/contracts/vj";
import type { VjCommandFrameName } from "../realtime/vjFrames";
import type { VjDemoLibraryLookup } from "./vjDemoStore";
import { isVjUuid } from "./vjDemoRules";
import {
  BPM_RANGE,
  FADE_MS_RANGE,
  isNumberInRange,
  isOneOf,
  isValidIntervalValue,
  readOverlayText,
  readVjRecord,
  roundBpm,
  VJ_EFFECT_FLAG_NAMES,
} from "./vjDemoStageInput";

export {
  isVjCommandFrameName,
  readVjRecord,
  readVjScreenStatusPayload,
  VJ_COMMAND_FRAME_NAMES,
  vjDemoAckFailure,
} from "./vjDemoStageInput";

export type VjStageCommandResult =
  { state: VjStageState; isNoop: boolean } | { error: VjSocketErrorCode };

interface VjStageCommandContext {
  now: number;
  library: VjDemoLibraryLookup;
}

type VjCommandOutcome =
  | { next: VjStageState; isAlwaysChange: boolean }
  | { error: VjSocketErrorCode };

function withClipSequence(
  state: VjStageState,
  patch: Partial<VjStageState>,
): VjStageState {
  return { ...state, ...patch, clipSequence: state.clipSequence + 1 };
}

function applySetPack(
  state: VjStageState,
  record: Record<string, unknown>,
  library: VjDemoLibraryLookup,
): VjCommandOutcome {
  const packId = record.packId;
  let nextPackId: string | null = null;
  if (packId !== null) {
    if (!isVjUuid(packId) || !library.hasPack(packId.toLowerCase())) {
      return { error: "vj_pack_not_found" };
    }
    nextPackId = packId.toLowerCase();
  }
  if (nextPackId === state.activePackId) {
    return { next: state, isAlwaysChange: false };
  }
  return {
    next: withClipSequence(state, { activePackId: nextPackId }),
    isAlwaysChange: true,
  };
}

function applyGoClip(
  state: VjStageState,
  record: Record<string, unknown>,
  library: VjDemoLibraryLookup,
): VjCommandOutcome {
  const clipId = record.clipId;
  let nextClipId: string | null = null;
  if (clipId !== null) {
    if (!isVjUuid(clipId) || !library.hasClip(clipId.toLowerCase())) {
      return { error: "vj_clip_not_found" };
    }
    nextClipId = clipId.toLowerCase();
  }
  // A re-tap of the live clip is never a noop: it restarts the shuffle interval.
  return {
    next: withClipSequence(state, { liveClipId: nextClipId }),
    isAlwaysChange: true,
  };
}

function applySetTransition(
  state: VjStageState,
  record: Record<string, unknown>,
): VjCommandOutcome {
  const { mode, fadeMs } = record;
  if (mode === undefined && fadeMs === undefined) {
    return { error: "vj_patch_empty" };
  }
  const transition: VjTransition = { ...state.transition };
  if (mode !== undefined) {
    if (!isOneOf(VJ_TRANSITION_MODES, mode)) {
      return { error: "vj_transition_mode_invalid" };
    }
    transition.mode = mode;
  }
  if (fadeMs !== undefined) {
    if (!isNumberInRange(fadeMs, FADE_MS_RANGE))
      return { error: "vj_fade_out_of_range" };
    transition.fadeMs = fadeMs;
  }
  return { next: { ...state, transition }, isAlwaysChange: false };
}

function applySetOverlay(
  state: VjStageState,
  record: Record<string, unknown>,
): VjCommandOutcome {
  const { text, style, isVisible } = record;
  if (text === undefined && style === undefined && isVisible === undefined) {
    return { error: "vj_patch_empty" };
  }
  const overlay: VjOverlay = { ...state.overlay };
  if (text !== undefined) {
    const read = readOverlayText(text);
    if (typeof read !== "string") return read;
    overlay.text = read;
  }
  if (style !== undefined) {
    if (!isOneOf(VJ_OVERLAY_STYLES, style)) {
      return { error: "vj_overlay_style_invalid" };
    }
    overlay.style = style;
  }
  if (isVisible !== undefined) {
    if (typeof isVisible !== "boolean") {
      return { error: "vj_effect_flag_invalid" };
    }
    overlay.isVisible = isVisible;
  }
  if (overlay.isVisible && overlay.text.length === 0) {
    return { error: "vj_overlay_text_blank" };
  }
  return { next: { ...state, overlay }, isAlwaysChange: false };
}

function applySetEffects(
  state: VjStageState,
  record: Record<string, unknown>,
): VjCommandOutcome {
  const { speed } = record;
  const hasFlag = VJ_EFFECT_FLAG_NAMES.some(
    (flagName) => record[flagName] !== undefined,
  );
  if (speed === undefined && !hasFlag) return { error: "vj_patch_empty" };
  const effects: VjEffects = { ...state.effects };
  if (speed !== undefined) {
    if (!isOneOf(VJ_SPEEDS, speed)) return { error: "vj_speed_invalid" };
    effects.speed = speed;
  }
  for (const flagName of VJ_EFFECT_FLAG_NAMES) {
    const flag = record[flagName];
    if (flag === undefined) continue;
    if (typeof flag !== "boolean") return { error: "vj_effect_flag_invalid" };
    effects[flagName] = flag;
  }
  return { next: { ...state, effects }, isAlwaysChange: false };
}

function applySetStrobe(
  state: VjStageState,
  record: Record<string, unknown>,
  now: number,
): VjCommandOutcome {
  const { isStrobing } = record;
  if (typeof isStrobing !== "boolean") {
    return { error: "vj_effect_flag_invalid" };
  }
  // On while on keeps the first start, so the 10 s are never extended.
  if (isStrobing === state.effects.isStrobing) {
    return { next: state, isAlwaysChange: false };
  }
  const effects: VjEffects = {
    ...state.effects,
    isStrobing,
    strobeStartedAt: isStrobing ? now : null,
  };
  return { next: { ...state, effects }, isAlwaysChange: true };
}

function applySetShuffle(
  state: VjStageState,
  record: Record<string, unknown>,
): VjCommandOutcome {
  const { isOn, intervalKind, intervalValue, bpm } = record;
  const isEmpty = [isOn, intervalKind, intervalValue, bpm].every(
    (field) => field === undefined,
  );
  if (isEmpty) return { error: "vj_patch_empty" };
  const shuffle: VjShuffle = { ...state.shuffle };
  if (isOn !== undefined) {
    if (typeof isOn !== "boolean") return { error: "vj_effect_flag_invalid" };
    shuffle.isOn = isOn;
  }
  if (intervalKind !== undefined) {
    if (!isOneOf(VJ_SHUFFLE_INTERVAL_KINDS, intervalKind)) {
      return { error: "vj_shuffle_interval_invalid" };
    }
    shuffle.intervalKind = intervalKind;
  }
  let nextValue: unknown = intervalValue ?? state.shuffle.intervalValue;
  if (
    intervalValue === undefined &&
    shuffle.intervalKind !== state.shuffle.intervalKind &&
    !isValidIntervalValue(shuffle.intervalKind, nextValue)
  ) {
    nextValue = VJ_LIMITS.shuffleSecondsDefault;
  }
  if (!isValidIntervalValue(shuffle.intervalKind, nextValue)) {
    return { error: "vj_shuffle_interval_invalid" };
  }
  shuffle.intervalValue = nextValue;
  if (bpm !== undefined) {
    if (!isNumberInRange(bpm, BPM_RANGE))
      return { error: "vj_bpm_out_of_range" };
    shuffle.bpm = roundBpm(bpm);
  }
  return { next: { ...state, shuffle }, isAlwaysChange: false };
}

function isSameStageContent(left: VjStageState, right: VjStageState): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function outcomeOf(
  state: VjStageState,
  name: VjCommandFrameName,
  record: Record<string, unknown>,
  context: VjStageCommandContext,
): VjCommandOutcome {
  switch (name) {
    case "stage:setPack":
      return applySetPack(state, record, context.library);
    case "stage:goClip":
      return applyGoClip(state, record, context.library);
    case "stage:setTransition":
      return applySetTransition(state, record);
    case "stage:setOverlay":
      return applySetOverlay(state, record);
    case "stage:setEffects":
      return applySetEffects(state, record);
    case "stage:setStrobe":
      return applySetStrobe(state, record, context.now);
    case "stage:setShuffle":
      return applySetShuffle(state, record);
  }
}

/** Contract 6.6. On a change: revision + 1, updatedAt now. */
export function applyVjStageCommand(
  state: VjStageState,
  name: VjCommandFrameName,
  payload: unknown,
  context: VjStageCommandContext,
): VjStageCommandResult {
  const outcome = outcomeOf(state, name, readVjRecord(payload), context);
  if ("error" in outcome) return outcome;
  if (!outcome.isAlwaysChange && isSameStageContent(outcome.next, state)) {
    return { state, isNoop: true };
  }
  return {
    state: {
      ...outcome.next,
      revision: state.revision + 1,
      updatedAt: context.now,
    },
    isNoop: false,
  };
}

/** One field per patch, so a field that fails keeps the fresh default. */
function restorePatchesOf(
  record: Record<string, unknown>,
): Array<[VjCommandFrameName, Record<string, unknown>]> {
  const transition = readVjRecord(record.transition);
  const overlay = readVjRecord(record.overlay);
  const effects = readVjRecord(record.effects);
  const shuffle = readVjRecord(record.shuffle);
  return [
    ["stage:setPack", { packId: record.activePackId }],
    ["stage:goClip", { clipId: record.liveClipId }],
    ["stage:setTransition", { mode: transition.mode }],
    ["stage:setTransition", { fadeMs: transition.fadeMs }],
    ["stage:setOverlay", { text: overlay.text }],
    ["stage:setOverlay", { style: overlay.style }],
    ["stage:setOverlay", { isVisible: overlay.isVisible }],
    ["stage:setEffects", { speed: effects.speed }],
    ...VJ_EFFECT_FLAG_NAMES.map(
      (flagName): [VjCommandFrameName, Record<string, unknown>] => [
        "stage:setEffects",
        { [flagName]: effects[flagName] },
      ],
    ),
    ["stage:setShuffle", { isOn: shuffle.isOn }],
    ["stage:setShuffle", { intervalKind: shuffle.intervalKind }],
    ["stage:setShuffle", { intervalValue: shuffle.intervalValue }],
    ["stage:setShuffle", { bpm: shuffle.bpm }],
  ];
}

/**
 * Contract 6.4 restore rule: every field validated by the command rules (a
 * field that fails takes its default), the strobe off, an unknown pack or
 * clip dropped, the fresh stageEpoch kept, revision 1 and clipSequence 1.
 */
export function restoreVjStage(
  fresh: VjStageState,
  restore: VjStageRestore,
  library: VjDemoLibraryLookup,
): VjStageState {
  const context: VjStageCommandContext = { now: fresh.updatedAt, library };
  let state = fresh;
  for (const [name, patch] of restorePatchesOf(readVjRecord(restore))) {
    const outcome = outcomeOf(state, name, patch, context);
    if (!("error" in outcome)) state = outcome.next;
  }
  return {
    ...state,
    stageEpoch: fresh.stageEpoch,
    revision: 1,
    clipSequence: 1,
    effects: { ...state.effects, isStrobing: false, strobeStartedAt: null },
    updatedAt: fresh.updatedAt,
  };
}
