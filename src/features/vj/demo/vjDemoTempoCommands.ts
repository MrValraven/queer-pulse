// Contract 7.5 and 7.6 tempo and shuffle command rules for the demo server,
// pure. Mirrors queerpulse-backend/src/vj/stage/vj-tempo-rules.ts
// (ruleSetTempo) and vj-shuffle-rules.ts (ruleSetShuffle) in the same check
// order: the field rules, isImmediate, then the library reads. The
// dispatcher (vjDemoStageCommands.ts) checks isImmediate again after the
// rule, which answers the same code for setTempo.

import {
  VJ_LIMITS,
  VJ_QUANTIZE_MODES,
  VJ_SHUFFLE_INTERVAL_KINDS,
  VJ_SHUFFLE_SOURCES,
  VJ_TEMPO_SOURCES,
  vjLastDownbeatAt,
  type VjShuffle,
  type VjShuffleIntervalKind,
  type VjSocketErrorCode,
  type VjStageState,
  type VjTempo,
} from "../../../shared/contracts/vj";
import {
  vjDemoChange,
  type VjDemoCommandContext,
  type VjDemoCommandOutcome,
} from "./vjDemoCommandKit";
import { isVjUuidList } from "./vjDemoRules";
import { readVjImmediateFlag } from "./vjDemoStageCommands";
import {
  BPM_RANGE,
  isNumberInRange,
  isOneOf,
  isValidIntervalValue,
  roundBpm,
} from "./vjDemoStageInput";

/** Whether any of the fields is present; an undefined value counts as absent. */
function hasAnyVjField(
  record: Record<string, unknown>,
  fields: readonly string[],
): boolean {
  return fields.some((field) => record[field] !== undefined);
}

// stage:setTempo (contract 7.6).

/** The fields a `stage:setTempo` patch may carry. */
const VJ_TEMPO_PATCH_FIELDS = [
  "bpm",
  "downbeatAt",
  "quantize",
  "source",
] as const;

/** Contract 7.6 `stage:setTempo` steps 1 to 5; the first failing step's code, or null. */
function checkVjTempoPatch(
  record: Record<string, unknown>,
  now: number,
  isLeadMicOn: boolean,
): VjSocketErrorCode | null {
  const { bpm, downbeatAt, quantize, source } = record;
  if (bpm !== undefined && !isNumberInRange(bpm, BPM_RANGE)) {
    return "vj_bpm_out_of_range";
  }
  const downbeatRange = {
    min: now - VJ_LIMITS.downbeatSkewMsMax,
    max: now + VJ_LIMITS.downbeatSkewMsMax,
    isInteger: true,
  };
  if (downbeatAt !== undefined && !isNumberInRange(downbeatAt, downbeatRange)) {
    return "vj_downbeat_out_of_range";
  }
  if (quantize !== undefined && !isOneOf(VJ_QUANTIZE_MODES, quantize)) {
    return "vj_quantize_invalid";
  }
  if (source !== undefined && !isOneOf(VJ_TEMPO_SOURCES, source)) {
    return "vj_tempo_source_invalid";
  }
  if (source === "mic" && (bpm !== undefined || downbeatAt !== undefined)) {
    return "vj_tempo_source_conflict";
  }
  if (source === "mic" && !isLeadMicOn) return "vj_mic_unavailable";
  return null;
}

/** The tempo a checked patch leaves: a bpm alone re-anchors the downbeat on
 *  the last "1" of the current grid, and a bpm or downbeat without a source
 *  sets the source to manual. */
function patchedVjTempo(
  current: VjTempo,
  record: Record<string, unknown>,
  now: number,
): VjTempo {
  const bpm = typeof record.bpm === "number" ? record.bpm : null;
  const downbeatAt =
    typeof record.downbeatAt === "number" ? record.downbeatAt : null;
  const quantize = isOneOf(VJ_QUANTIZE_MODES, record.quantize)
    ? record.quantize
    : current.quantize;
  const isGridMoved = bpm !== null || downbeatAt !== null;
  let source = current.source;
  if (isOneOf(VJ_TEMPO_SOURCES, record.source)) {
    source = record.source;
  } else if (isGridMoved) {
    source = "manual";
  }
  let nextDownbeatAt = current.downbeatAt;
  if (downbeatAt !== null) {
    nextDownbeatAt = downbeatAt;
  } else if (bpm !== null) {
    nextDownbeatAt = vjLastDownbeatAt(current, now);
  }
  return {
    bpm: bpm === null ? current.bpm : roundBpm(bpm),
    downbeatAt: nextDownbeatAt,
    quantize,
    source,
  };
}

/** `stage:setTempo`: the field rules in order (isImmediate follows in the
 *  dispatcher), then the patched tempo. A patch with none of the four fields
 *  answers vj_patch_empty. */
export function applySetTempo(
  state: VjStageState,
  record: Record<string, unknown>,
  context: VjDemoCommandContext,
): VjDemoCommandOutcome {
  if (!hasAnyVjField(record, VJ_TEMPO_PATCH_FIELDS)) {
    return { error: "vj_patch_empty" };
  }
  const fieldCode = checkVjTempoPatch(record, context.now, context.isLeadMicOn);
  if (fieldCode !== null) return { error: fieldCode };
  return vjDemoChange({
    ...state,
    tempo: patchedVjTempo(state.tempo, record, context.now),
  });
}

// stage:setShuffle (contract 7.5).

/** The `stage:setShuffle` patch fields (contract 7.5). */
const VJ_SET_SHUFFLE_FIELDS = [
  "isOn",
  "intervalKind",
  "intervalValue",
  "source",
  "excludedClipIds",
] as const;

/** The interval a kind falls back to (8 for either kind). */
function defaultVjShuffleIntervalValue(kind: VjShuffleIntervalKind): number {
  return kind === "beats"
    ? VJ_LIMITS.shuffleBeatsDefault
    : VJ_LIMITS.shuffleSecondsDefault;
}

/** The `excludedClipIds` field read: an array of uuid strings, at most 200,
 *  answered lowercased, each once, sorted ascending; null for anything else. */
function readVjExcludedClipIds(value: unknown): string[] | null {
  if (!isVjUuidList(value, VJ_LIMITS.excludedClipIdsMax)) return null;
  return Array.from(
    new Set(value.map((clipId) => clipId.toLowerCase())),
  ).sort();
}

/** The v1 `isOn`, `intervalKind` and `intervalValue` rules over the current
 *  shuffle: a kind change with no value keeps the value when it fits the new
 *  kind, else takes 8. */
function shuffleTimingPatch(
  shuffle: VjShuffle,
  record: Record<string, unknown>,
): VjShuffle | { error: VjSocketErrorCode } {
  const next: VjShuffle = { ...shuffle };
  if (record.isOn !== undefined) {
    if (typeof record.isOn !== "boolean") {
      return { error: "vj_effect_flag_invalid" };
    }
    next.isOn = record.isOn;
  }
  if (record.intervalKind !== undefined) {
    if (!isOneOf(VJ_SHUFFLE_INTERVAL_KINDS, record.intervalKind)) {
      return { error: "vj_shuffle_interval_invalid" };
    }
    next.intervalKind = record.intervalKind;
  }
  let intervalValue: unknown = record.intervalValue;
  if (intervalValue === undefined) {
    intervalValue = isValidIntervalValue(next.intervalKind, next.intervalValue)
      ? next.intervalValue
      : defaultVjShuffleIntervalValue(next.intervalKind);
  }
  if (!isValidIntervalValue(next.intervalKind, intervalValue)) {
    return { error: "vj_shuffle_interval_invalid" };
  }
  next.intervalValue = intervalValue;
  return next;
}

/** The `source` and `excludedClipIds` rules over the timed shuffle, in that
 *  order; a non-empty skip list needs an active pack. */
function shuffleSelectionPatch(
  state: VjStageState,
  shuffle: VjShuffle,
  record: Record<string, unknown>,
): VjShuffle | { error: VjSocketErrorCode } {
  const next: VjShuffle = { ...shuffle };
  if (record.source !== undefined) {
    if (!isOneOf(VJ_SHUFFLE_SOURCES, record.source)) {
      return { error: "vj_shuffle_source_invalid" };
    }
    next.source = record.source;
  }
  if (record.excludedClipIds !== undefined) {
    const excludedClipIds = readVjExcludedClipIds(record.excludedClipIds);
    if (excludedClipIds === null) return { error: "vj_excluded_clips_invalid" };
    if (excludedClipIds.length > 0 && state.activePackId === null) {
      return { error: "vj_no_active_pack" };
    }
    next.excludedClipIds = excludedClipIds;
  }
  return next;
}

/** `stage:setShuffle`: the v1 timing rules, `source`, `excludedClipIds`
 *  (canonical, at most 200, an active pack needed when non-empty; an empty
 *  array clears the list), isImmediate, then every skipped clip must be in
 *  the active pack. A `bpm` field is ignored (v1 `shuffle.bpm` is gone). */
export function applySetShuffle(
  state: VjStageState,
  record: Record<string, unknown>,
  context: VjDemoCommandContext,
): VjDemoCommandOutcome {
  if (!hasAnyVjField(record, VJ_SET_SHUFFLE_FIELDS)) {
    return { error: "vj_patch_empty" };
  }
  const timed = shuffleTimingPatch(state.shuffle, record);
  if ("error" in timed) return timed;
  const shuffle = shuffleSelectionPatch(state, timed, record);
  if ("error" in shuffle) return shuffle;
  // The backend checks isImmediate before its clipsInPack lookup answers.
  const immediate = readVjImmediateFlag("stage:setShuffle", record);
  if ("error" in immediate) return immediate;
  const activePackId = state.activePackId;
  if (
    record.excludedClipIds !== undefined &&
    shuffle.excludedClipIds.length > 0 &&
    activePackId !== null
  ) {
    const clipIdsInPack = context.library.clipIdsInPack(
      activePackId,
      shuffle.excludedClipIds,
    );
    const isEveryClipInPack = shuffle.excludedClipIds.every((clipId) =>
      clipIdsInPack.has(clipId),
    );
    if (!isEveryClipInPack) return { error: "vj_clip_not_in_pack" };
  }
  return vjDemoChange({ ...state, shuffle });
}
