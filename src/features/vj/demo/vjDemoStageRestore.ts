// Restore v2 of the demo stage (contract 7.13): the stage a screen's saved
// state seeds when the demo server holds a fresh stage. Mirrors
// queerpulse-backend/src/vj/stage/vj-restore.ts (restoredVjStageState) and the
// restore readers it composes (restoredVjEffects, restoredVjTempo,
// restoredVjTransition, restoredVjOverlay, restoredVjCountdown,
// restoredVjLogo, restoredVjEventCard, restoredVjMix, restoredVjShuffle).
// The payload goes through upgradeVjStageFieldsV1 first, so a v1-shaped
// snapshot seeds a v2 stage. Each field is read on its own with the command
// field rules: a bad one takes its default, and an id the library does not
// find is dropped. The library answers synchronously, so the backend's
// separate lookup step folds into the reads below.

import {
  VJ_BLEND_MODES,
  VJ_COLOR_TOKENS,
  VJ_EVENT_CARD_KINDS,
  VJ_LIMITS,
  VJ_LOGO_CORNERS,
  VJ_OVERLAY_POSITIONS,
  VJ_OVERLAY_SIZES,
  VJ_OVERLAY_STYLES,
  VJ_QUANTIZE_MODES,
  VJ_SHUFFLE_INTERVAL_KINDS,
  VJ_SHUFFLE_SOURCES,
  VJ_SPEEDS,
  VJ_TEMPO_SOURCES,
  VJ_TRANSITION_IDS,
  canonicalVjStageState,
  createVjStageState,
  roundVjAmount,
  upgradeVjStageFieldsV1,
  type VjCountdown,
  type VjEffects,
  type VjEventCard,
  type VjGeneratorId,
  type VjLogo,
  type VjMix,
  type VjOverlay,
  type VjShuffle,
  type VjStageState,
  type VjTempo,
  type VjTransition,
} from "../../../shared/contracts/vj";
import type { VjDemoLibraryLookup } from "./vjDemoCommandKit";
import { readStoredVjEffectSettings } from "./vjDemoEffectRules";
import { isVjUuid } from "./vjDemoRules";
import {
  BPM_RANGE,
  UNIT_AMOUNT_RANGE,
  isNumberInRange,
  isOneOf,
  isValidIntervalValue,
  isVjRecord,
  readOverlayText,
  readVjCountdownLabel,
  readVjGeneratorChoice,
  readVjRecord,
  readVjTransitionLength,
} from "./vjDemoStageInput";

/** Any safe integer (a restored `tempo.downbeatAt` has no skew rule). */
const SAFE_INTEGER_RANGE = {
  min: Number.MIN_SAFE_INTEGER,
  max: Number.MAX_SAFE_INTEGER,
  isInteger: true,
};

/** A non-negative safe integer (a restored `overlay.hideAt`). */
const EPOCH_MS_RANGE = {
  min: 0,
  max: Number.MAX_SAFE_INTEGER,
  isInteger: true,
};

/** The ids a restore names, each uuid-shaped and lowercased (null otherwise). */
interface VjRestoreIds {
  packId: string | null;
  liveClipId: string | null;
  mixClipId: string | null;
  /** Lowercased, each once, sorted, at most VJ_LIMITS.excludedClipIdsMax. */
  excludedClipIds: string[];
  setlistId: string | null;
}

/** The live source a restore keeps: a found clip, else a valid generator, else black. */
interface VjRestoredSource {
  liveClipId: string | null;
  liveGeneratorId: VjGeneratorId | null;
  liveGeneratorVariant: string | null;
}

/** A uuid lowercased, or null for anything else. */
function uuidOrNull(value: unknown): string | null {
  return isVjUuid(value) ? value.toLowerCase() : null;
}

/** The ids the restore's library reads need. */
function restoreIdsOf(restore: Record<string, unknown>): VjRestoreIds {
  const mix = readVjRecord(restore.mix);
  const shuffle = readVjRecord(restore.shuffle);
  const sentExcludedClipIds: unknown[] = Array.isArray(shuffle.excludedClipIds)
    ? (shuffle.excludedClipIds as unknown[])
    : [];
  const excludedClipIds = [
    ...new Set(
      sentExcludedClipIds
        .filter((clipId): clipId is string => isVjUuid(clipId))
        .map((clipId) => clipId.toLowerCase()),
    ),
  ]
    .sort()
    .slice(0, VJ_LIMITS.excludedClipIdsMax);
  return {
    packId: uuidOrNull(restore.activePackId),
    liveClipId: uuidOrNull(restore.liveClipId),
    mixClipId: uuidOrNull(mix.clipId),
    excludedClipIds,
    setlistId: uuidOrNull(restore.activeSetlistId),
  };
}

/** A restored listed field: the value when the list has it, else the default. */
function restoredListValue<Value>(
  list: readonly Value[],
  value: unknown,
  fallback: Value,
): Value {
  return isOneOf(list, value) ? value : fallback;
}

/** A restored flag: the value when it is a boolean, else the default. */
function restoredFlag(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

/** The restored pack: kept when the library has it, with whether it links an event. */
function restoredPackOf(
  packId: string | null,
  library: VjDemoLibraryLookup,
): { packId: string | null; hasLinkedEvent: boolean } {
  if (packId === null) return { packId: null, hasLinkedEvent: false };
  const pack = library.readPackForStage(packId);
  if (pack === null) return { packId: null, hasLinkedEvent: false };
  return { packId, hasLinkedEvent: pack.eventId !== null };
}

/** A restored generator: an unknown id restores black; a bad variant takes
 *  the generator's default. */
function restoredGeneratorOf(
  restore: Record<string, unknown>,
): VjRestoredSource {
  const sentVariant = restore.liveGeneratorVariant;
  const sentChoice = readVjGeneratorChoice(
    restore.liveGeneratorId,
    sentVariant,
    sentVariant !== undefined,
  );
  const choice =
    "error" in sentChoice
      ? readVjGeneratorChoice(restore.liveGeneratorId, undefined, false)
      : sentChoice;
  if ("error" in choice) {
    return {
      liveClipId: null,
      liveGeneratorId: null,
      liveGeneratorVariant: null,
    };
  }
  return {
    liveClipId: null,
    liveGeneratorId: choice.generatorId,
    liveGeneratorVariant: choice.generatorVariant,
  };
}

/** The restored live source: a clip the library has wins; otherwise the generator. */
function restoredSourceOf(
  restore: Record<string, unknown>,
  liveClipId: string | null,
  existingClipIds: ReadonlySet<string>,
): VjRestoredSource {
  if (liveClipId !== null && existingClipIds.has(liveClipId)) {
    return { liveClipId, liveGeneratorId: null, liveGeneratorVariant: null };
  }
  return restoredGeneratorOf(restore);
}

/** The restored set list: kept when the library has it; an index that is no
 *  integer, or at or past the item count, becomes null. */
function restoredSetlistOf(
  restore: Record<string, unknown>,
  setlistId: string | null,
  library: VjDemoLibraryLookup,
): { activeSetlistId: string | null; setlistIndex: number | null } {
  if (setlistId === null) return { activeSetlistId: null, setlistIndex: null };
  const itemCount = library.setlistItemCount(setlistId);
  if (itemCount === null) return { activeSetlistId: null, setlistIndex: null };
  const sentIndex = restore.setlistIndex;
  const isIndexKept = isNumberInRange(sentIndex, {
    min: 0,
    max: itemCount - 1,
    isInteger: true,
  });
  return {
    activeSetlistId: setlistId,
    setlistIndex: isIndexKept ? sentIndex : null,
  };
}

/** A restored transition: the mode and the length each checked alone. */
function restoredTransitionOf(
  value: unknown,
  defaults: VjTransition,
): VjTransition {
  const source = readVjRecord(value);
  const length = readVjTransitionLength(source.length);
  return {
    mode: restoredListValue(VJ_TRANSITION_IDS, source.mode, defaults.mode),
    length: "error" in length ? defaults.length : length,
  };
}

/** A restored overlay: each field checked alone. A visible overlay with blank
 *  text, or a `hideAt` at or before `now`, comes back hidden with `hideAt`
 *  null; a later `hideAt` is capped at the longest auto-hide from now. */
function restoredOverlayOf(
  value: unknown,
  defaults: VjOverlay,
  now: number,
): VjOverlay {
  const source = readVjRecord(value);
  const sentText = readOverlayText(source.text);
  const text = typeof sentText === "string" ? sentText : defaults.text;
  const hideAt = isNumberInRange(source.hideAt, EPOCH_MS_RANGE)
    ? Math.min(source.hideAt, now + VJ_LIMITS.overlayHideAfterMsMax)
    : null;
  const isVisible =
    restoredFlag(source.isVisible, defaults.isVisible) &&
    text !== "" &&
    (hideAt === null || hideAt > now);
  return {
    text,
    style: restoredListValue(VJ_OVERLAY_STYLES, source.style, defaults.style),
    isVisible,
    position: restoredListValue(
      VJ_OVERLAY_POSITIONS,
      source.position,
      defaults.position,
    ),
    size: restoredListValue(VJ_OVERLAY_SIZES, source.size, defaults.size),
    colorToken: restoredListValue(
      VJ_COLOR_TOKENS,
      source.colorToken,
      defaults.colorToken,
    ),
    hideAt: isVisible ? hideAt : null,
  };
}

/** A restored countdown: a target past 24 h from now or not an integer takes
 *  the default; it shows only while `targetAt + countdownHoldMs` is after `now`. */
function restoredCountdownOf(
  value: unknown,
  defaults: VjCountdown,
  now: number,
): VjCountdown {
  const source = readVjRecord(value);
  const targetAt = isNumberInRange(source.targetAt, {
    min: 0,
    max: now + VJ_LIMITS.countdownLeadMsMax,
    isInteger: true,
  })
    ? source.targetAt
    : defaults.targetAt;
  const label = readVjCountdownLabel(source.label);
  return {
    isVisible:
      restoredFlag(source.isVisible, defaults.isVisible) &&
      targetAt !== null &&
      targetAt + VJ_LIMITS.countdownHoldMs > now,
    targetAt,
    label: typeof label === "string" ? label : defaults.label,
  };
}

function restoredLogoOf(value: unknown, defaults: VjLogo): VjLogo {
  const source = readVjRecord(value);
  return {
    isVisible: restoredFlag(source.isVisible, defaults.isVisible),
    corner: restoredListValue(VJ_LOGO_CORNERS, source.corner, defaults.corner),
  };
}

/** A restored event card: it shows only when the restored pack links an event. */
function restoredEventCardOf(
  value: unknown,
  defaults: VjEventCard,
  hasLinkedEvent: boolean,
): VjEventCard {
  const source = readVjRecord(value);
  return {
    isVisible:
      restoredFlag(source.isVisible, defaults.isVisible) && hasLinkedEvent,
    kind: restoredListValue(VJ_EVENT_CARD_KINDS, source.kind, defaults.kind),
  };
}

/** Restored effects: speed and blackout checked alone, the settings read
 *  entry by entry (at most 8 on, one playhead effect on), the strobe off. */
function restoredEffectsOf(value: unknown, defaults: VjEffects): VjEffects {
  const source = readVjRecord(value);
  return {
    speed: restoredListValue(VJ_SPEEDS, source.speed, defaults.speed),
    settings: readStoredVjEffectSettings(source.settings),
    isStrobing: false,
    isBlackout: restoredFlag(source.isBlackout, defaults.isBlackout),
    strobeStartedAt: null,
  };
}

/** A restored mix: a clip the library does not have is dropped, and a mix
 *  without a clip comes back with amount 0 and its blend mode. */
function restoredMixOf(
  value: unknown,
  defaults: VjMix,
  existingClipIds: ReadonlySet<string>,
): VjMix {
  if (!isVjRecord(value)) return { ...defaults };
  const sentClipId = uuidOrNull(value.clipId);
  const clipId =
    sentClipId !== null && existingClipIds.has(sentClipId) ? sentClipId : null;
  const amount = isNumberInRange(value.amount, UNIT_AMOUNT_RANGE)
    ? roundVjAmount(value.amount)
    : defaults.amount;
  return {
    clipId,
    amount: clipId === null ? 0 : amount,
    blendMode: restoredListValue(
      VJ_BLEND_MODES,
      value.blendMode,
      defaults.blendMode,
    ),
  };
}

/** A restored tempo: `downbeatAt` kept when it is a safe integer, with no
 *  skew rule, so its phase carries over; bpm (rounded to one decimal),
 *  quantize and source each take the default when invalid. */
function restoredTempoOf(value: unknown, defaults: VjTempo): VjTempo {
  if (!isVjRecord(value)) return { ...defaults };
  return {
    bpm: isNumberInRange(value.bpm, BPM_RANGE)
      ? Math.round(value.bpm * 10) / 10
      : defaults.bpm,
    downbeatAt: isNumberInRange(value.downbeatAt, SAFE_INTEGER_RANGE)
      ? value.downbeatAt
      : defaults.downbeatAt,
    quantize: restoredListValue(
      VJ_QUANTIZE_MODES,
      value.quantize,
      defaults.quantize,
    ),
    source: restoredListValue(VJ_TEMPO_SOURCES, value.source, defaults.source),
  };
}

/** A restored shuffle: each field checked alone, excluded ids kept only for
 *  clips still in the restored pack. */
function restoredShuffleOf(
  value: unknown,
  defaults: VjShuffle,
  excludedClipIds: readonly string[],
  clipIdsInPack: ReadonlySet<string>,
): VjShuffle {
  const source = readVjRecord(value);
  const intervalKind = restoredListValue(
    VJ_SHUFFLE_INTERVAL_KINDS,
    source.intervalKind,
    defaults.intervalKind,
  );
  return {
    isOn: restoredFlag(source.isOn, defaults.isOn),
    intervalKind,
    intervalValue: isValidIntervalValue(intervalKind, source.intervalValue)
      ? source.intervalValue
      : intervalKind === "beats"
        ? VJ_LIMITS.shuffleBeatsDefault
        : VJ_LIMITS.shuffleSecondsDefault,
    source: restoredListValue(
      VJ_SHUFFLE_SOURCES,
      source.source,
      defaults.source,
    ),
    excludedClipIds: excludedClipIds.filter((clipId) =>
      clipIdsInPack.has(clipId),
    ),
  };
}

/** Contract 7.13 adoption: revision 1, clipSequence 1, the fresh stageEpoch,
 *  overrides {}, history [liveClipId] or [], liveSince now when a source is
 *  live, updatedAt now, canonical. A payload that is not an object restores
 *  nothing and answers `fresh` as it is. */
export function restoreVjDemoStage(
  fresh: VjStageState,
  restore: unknown,
  library: VjDemoLibraryLookup,
  now: number,
): VjStageState {
  if (!isVjRecord(restore)) return fresh;
  const upgraded = upgradeVjStageFieldsV1(restore, now);
  const defaults = createVjStageState(fresh.stageEpoch, now);
  const ids = restoreIdsOf(upgraded);
  const existingClipIds = library.existingClipIds(
    [ids.liveClipId, ids.mixClipId].filter(
      (clipId): clipId is string => clipId !== null,
    ),
  );
  const pack = restoredPackOf(ids.packId, library);
  const clipIdsInPack: ReadonlySet<string> =
    pack.packId === null || ids.excludedClipIds.length === 0
      ? new Set<string>()
      : library.clipIdsInPack(pack.packId, ids.excludedClipIds);
  const source = restoredSourceOf(upgraded, ids.liveClipId, existingClipIds);
  const isSourceLive =
    source.liveClipId !== null || source.liveGeneratorId !== null;
  return canonicalVjStageState({
    ...defaults,
    revision: 1,
    clipSequence: 1,
    activePackId: pack.packId,
    ...source,
    liveSince: isSourceLive ? now : null,
    transition: restoredTransitionOf(upgraded.transition, defaults.transition),
    overlay: restoredOverlayOf(upgraded.overlay, defaults.overlay, now),
    countdown: restoredCountdownOf(upgraded.countdown, defaults.countdown, now),
    logo: restoredLogoOf(upgraded.logo, defaults.logo),
    eventCard: restoredEventCardOf(
      upgraded.eventCard,
      defaults.eventCard,
      pack.hasLinkedEvent,
    ),
    effects: restoredEffectsOf(upgraded.effects, defaults.effects),
    mix: restoredMixOf(upgraded.mix, defaults.mix, existingClipIds),
    tempo: restoredTempoOf(upgraded.tempo, defaults.tempo),
    shuffle: restoredShuffleOf(
      upgraded.shuffle,
      defaults.shuffle,
      ids.excludedClipIds,
      clipIdsInPack,
    ),
    recentClipIds: source.liveClipId === null ? [] : [source.liveClipId],
    screenOverrides: {},
    ...restoredSetlistOf(upgraded, ids.setlistId, library),
    updatedAt: now,
  });
}
