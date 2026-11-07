import {
  VJ_BLEND_MODES,
  VJ_CLIP_MIME_TYPES,
  VJ_COLOR_TOKENS,
  VJ_EFFECT_CATALOG,
  VJ_EFFECT_IDS,
  VJ_EVENT_CARD_KINDS,
  VJ_FIT_MODES,
  VJ_GENERATOR_CATALOG,
  VJ_GENERATOR_IDS,
  VJ_LIMITS,
  VJ_LOGO_CORNERS,
  VJ_LOOP_MODES,
  VJ_MEDIA_KINDS,
  VJ_OVERLAY_POSITIONS,
  VJ_OVERLAY_SIZES,
  VJ_OVERLAY_STYLES,
  VJ_QUANTIZE_MODES,
  VJ_SHUFFLE_BEAT_COUNTS,
  VJ_SHUFFLE_INTERVAL_KINDS,
  VJ_SHUFFLE_SOURCES,
  VJ_SPEEDS,
  VJ_TEMPO_SOURCES,
  VJ_TRANSITION_BEAT_COUNTS,
  VJ_TRANSITION_IDS,
  type VjClipDTO,
  type VjEffectId,
  type VjEventCardDTO,
  type VjPackDTO,
  type VjStageState,
} from "../../../shared/contracts/vj";

/**
 * Field by field validators for the v2 screen snapshot (contract 9.1). Each
 * one answers false for anything a v2 build could not have written: unknown
 * list members, effect ids or variants outside the catalog, amounts outside
 * 0..1, and screen overrides that name both or neither of a clip and a
 * generator.
 */

export function isVjPlainObject(
  value: unknown,
): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isVjFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

function isNullableFiniteNumber(value: unknown): value is number | null {
  return value === null || isVjFiniteNumber(value);
}

function isStringList(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((entry) => typeof entry === "string")
  );
}

function isOneOf<Member extends string | number>(
  list: readonly Member[],
  value: unknown,
): value is Member {
  return list.some((member) => member === value);
}

function isUnitAmount(value: unknown): value is number {
  return isVjFiniteNumber(value) && value >= 0 && value <= 1;
}

/** A variant is null exactly when the generator has none; a generator with
 *  variants also reads null as its default. */
function isGeneratorVariantFor(
  generatorId: unknown,
  variant: unknown,
): boolean {
  if (generatorId === null) return variant === null;
  if (!isOneOf(VJ_GENERATOR_IDS, generatorId)) return false;
  const { variants } = VJ_GENERATOR_CATALOG[generatorId];
  return (
    variant === null || (variants.length > 0 && isOneOf(variants, variant))
  );
}

function isEffectSettingFor(effectId: VjEffectId, value: unknown): boolean {
  if (
    !isVjPlainObject(value) ||
    typeof value.isOn !== "boolean" ||
    !isUnitAmount(value.amount)
  ) {
    return false;
  }
  const { variants } = VJ_EFFECT_CATALOG[effectId];
  return variants.length === 0
    ? value.variant === null
    : isOneOf(variants, value.variant);
}

function isEffectSettings(value: unknown): boolean {
  return (
    isVjPlainObject(value) &&
    Object.entries(value).every(
      ([effectId, setting]) =>
        isOneOf(VJ_EFFECT_IDS, effectId) &&
        isEffectSettingFor(effectId, setting),
    )
  );
}

function isTransitionLength(value: unknown): boolean {
  if (!isVjPlainObject(value)) return false;
  if (value.unit === "ms") {
    return (
      isNonNegativeInteger(value.value) &&
      value.value >= VJ_LIMITS.fadeMsMin &&
      value.value <= VJ_LIMITS.fadeMsMax
    );
  }
  return (
    value.unit === "beats" && isOneOf(VJ_TRANSITION_BEAT_COUNTS, value.value)
  );
}

function isTransition(value: unknown): boolean {
  return (
    isVjPlainObject(value) &&
    isOneOf(VJ_TRANSITION_IDS, value.mode) &&
    isTransitionLength(value.length)
  );
}

function isOverlay(value: unknown): boolean {
  return (
    isVjPlainObject(value) &&
    typeof value.text === "string" &&
    isOneOf(VJ_OVERLAY_STYLES, value.style) &&
    typeof value.isVisible === "boolean" &&
    isOneOf(VJ_OVERLAY_POSITIONS, value.position) &&
    isOneOf(VJ_OVERLAY_SIZES, value.size) &&
    isOneOf(VJ_COLOR_TOKENS, value.colorToken) &&
    isNullableFiniteNumber(value.hideAt)
  );
}

/** The countdown, logo and event card toggles. */
function isScreenFurniture(state: Record<string, unknown>): boolean {
  const { countdown, logo, eventCard } = state;
  return (
    isVjPlainObject(countdown) &&
    typeof countdown.isVisible === "boolean" &&
    isNullableFiniteNumber(countdown.targetAt) &&
    typeof countdown.label === "string" &&
    isVjPlainObject(logo) &&
    typeof logo.isVisible === "boolean" &&
    isOneOf(VJ_LOGO_CORNERS, logo.corner) &&
    isVjPlainObject(eventCard) &&
    typeof eventCard.isVisible === "boolean" &&
    isOneOf(VJ_EVENT_CARD_KINDS, eventCard.kind)
  );
}

function isEffects(value: unknown): boolean {
  return (
    isVjPlainObject(value) &&
    isOneOf(VJ_SPEEDS, value.speed) &&
    isEffectSettings(value.settings) &&
    typeof value.isStrobing === "boolean" &&
    typeof value.isBlackout === "boolean" &&
    isNullableFiniteNumber(value.strobeStartedAt)
  );
}

function isMix(value: unknown): boolean {
  return (
    isVjPlainObject(value) &&
    isNullableString(value.clipId) &&
    isUnitAmount(value.amount) &&
    isOneOf(VJ_BLEND_MODES, value.blendMode)
  );
}

function isTempo(value: unknown): boolean {
  return (
    isVjPlainObject(value) &&
    isVjFiniteNumber(value.bpm) &&
    value.bpm >= VJ_LIMITS.bpmMin &&
    value.bpm <= VJ_LIMITS.bpmMax &&
    isVjFiniteNumber(value.downbeatAt) &&
    isOneOf(VJ_QUANTIZE_MODES, value.quantize) &&
    isOneOf(VJ_TEMPO_SOURCES, value.source)
  );
}

function isShuffleInterval(intervalKind: unknown, intervalValue: unknown) {
  if (intervalKind === "beats") {
    return isOneOf(VJ_SHUFFLE_BEAT_COUNTS, intervalValue);
  }
  return (
    isOneOf(VJ_SHUFFLE_INTERVAL_KINDS, intervalKind) &&
    isNonNegativeInteger(intervalValue) &&
    intervalValue >= VJ_LIMITS.shuffleSecondsMin &&
    intervalValue <= VJ_LIMITS.shuffleSecondsMax
  );
}

function isShuffle(value: unknown): boolean {
  return (
    isVjPlainObject(value) &&
    typeof value.isOn === "boolean" &&
    isShuffleInterval(value.intervalKind, value.intervalValue) &&
    isOneOf(VJ_SHUFFLE_SOURCES, value.source) &&
    isStringList(value.excludedClipIds)
  );
}

/** Exactly one of clipId and generatorId is non-null (contract 3.4). */
function isScreenOverride(value: unknown): boolean {
  if (!isVjPlainObject(value) || !isNullableString(value.clipId)) {
    return false;
  }
  const hasClip = value.clipId !== null;
  const hasGenerator = value.generatorId !== null;
  return (
    hasClip !== hasGenerator &&
    isGeneratorVariantFor(value.generatorId, value.generatorVariant)
  );
}

function isScreenOverrides(value: unknown): boolean {
  return isVjPlainObject(value) && Object.values(value).every(isScreenOverride);
}

/** Identity, counters and the live source: at most one of a clip and a generator. */
function isStageSource(state: Record<string, unknown>): boolean {
  return (
    typeof state.stageEpoch === "string" &&
    isNonNegativeInteger(state.revision) &&
    isNonNegativeInteger(state.clipSequence) &&
    isNullableString(state.activePackId) &&
    isNullableString(state.liveClipId) &&
    isGeneratorVariantFor(state.liveGeneratorId, state.liveGeneratorVariant) &&
    (state.liveClipId === null || state.liveGeneratorId === null) &&
    isNullableFiniteNumber(state.liveSince)
  );
}

export function isVjStageStateV2(value: unknown): value is VjStageState {
  return (
    isVjPlainObject(value) &&
    isStageSource(value) &&
    isTransition(value.transition) &&
    isOverlay(value.overlay) &&
    isScreenFurniture(value) &&
    isEffects(value.effects) &&
    isMix(value.mix) &&
    isTempo(value.tempo) &&
    isShuffle(value.shuffle) &&
    isStringList(value.recentClipIds) &&
    isScreenOverrides(value.screenOverrides) &&
    isNullableString(value.activeSetlistId) &&
    (value.setlistIndex === null || isNonNegativeInteger(value.setlistIndex)) &&
    isVjFiniteNumber(value.updatedAt)
  );
}

function isCreator(value: unknown): boolean {
  return (
    value === null ||
    (isVjPlainObject(value) &&
      typeof value.userId === "string" &&
      typeof value.displayName === "string")
  );
}

function isNullableLoopPoint(value: unknown): boolean {
  return value === null || (isVjFiniteNumber(value) && value >= 0);
}

/** The v2 playback fields: favourite, default speed, loop points and preview. */
function isClipPlayback(clip: Record<string, unknown>): boolean {
  return (
    typeof clip.isFavorite === "boolean" &&
    isOneOf(VJ_SPEEDS, clip.defaultSpeed) &&
    isNullableLoopPoint(clip.loopInMs) &&
    isNullableLoopPoint(clip.loopOutMs) &&
    isOneOf(VJ_LOOP_MODES, clip.loopMode) &&
    isNullableString(clip.previewUrl)
  );
}

export function isVjClipV2(value: unknown): value is VjClipDTO {
  return (
    isVjPlainObject(value) &&
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    isOneOf(VJ_MEDIA_KINDS, value.mediaKind) &&
    isOneOf(VJ_CLIP_MIME_TYPES, value.mimeType) &&
    isVjFiniteNumber(value.byteSize) &&
    isVjFiniteNumber(value.width) &&
    isVjFiniteNumber(value.height) &&
    isNullableFiniteNumber(value.durationMs) &&
    isOneOf(VJ_FIT_MODES, value.fitMode) &&
    typeof value.thumbnailUrl === "string" &&
    typeof value.mediaUrl === "string" &&
    isStringList(value.packIds) &&
    isNonNegativeInteger(value.packCount) &&
    isCreator(value.createdBy) &&
    typeof value.createdAt === "string" &&
    typeof value.updatedAt === "string" &&
    isClipPlayback(value)
  );
}

/** A linked event summary: the full one, or the withheld one a VJ operator
 *  gets (`VjPackEventWithheldSummaryDTO`: the id and `isAvailable`, with the
 *  title and the start both absent). */
function isPackEventSummary(value: unknown): boolean {
  if (value === null) return true;
  if (
    !isVjPlainObject(value) ||
    typeof value.id !== "string" ||
    typeof value.isAvailable !== "boolean"
  ) {
    return false;
  }
  const isWithheld = !("title" in value) && !("startAt" in value);
  return (
    isWithheld ||
    (typeof value.title === "string" && typeof value.startAt === "string")
  );
}

export function isVjPackV2(value: unknown): value is VjPackDTO {
  return (
    isVjPlainObject(value) &&
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    isNonNegativeInteger(value.position) &&
    isNonNegativeInteger(value.clipCount) &&
    isVjFiniteNumber(value.totalByteSize) &&
    isNullableString(value.coverThumbnailUrl) &&
    isCreator(value.createdBy) &&
    typeof value.createdAt === "string" &&
    typeof value.updatedAt === "string" &&
    isPackEventSummary(value.event)
  );
}

export function isVjEventCard(value: unknown): value is VjEventCardDTO {
  return (
    isVjPlainObject(value) &&
    typeof value.eventId === "string" &&
    typeof value.title === "string" &&
    typeof value.startAt === "string" &&
    isNullableString(value.endAt) &&
    typeof value.timezone === "string" &&
    isNullableString(value.area) &&
    typeof value.isOnline === "boolean" &&
    isNullableString(value.publicUrl)
  );
}
