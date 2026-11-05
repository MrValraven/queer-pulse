import {
  VJ_FIT_MODES,
  VJ_MEDIA_KINDS,
  VJ_CLIP_MIME_TYPES,
  VJ_OVERLAY_STYLES,
  VJ_SHUFFLE_BEAT_COUNTS,
  VJ_SHUFFLE_INTERVAL_KINDS,
  VJ_SPEEDS,
  VJ_TRANSITION_MODES,
  type VjClipDTO,
  type VjCreatorDTO,
  type VjPackDTO,
  type VjStageRestore,
  type VjStageState,
} from "../../../shared/contracts/vj";
import {
  VJ_SCREEN_ID_STORAGE_KEY,
  VJ_SCREEN_SNAPSHOT_STORAGE_KEY,
} from "../vj.constants";

/** The last look a screen applied, kept so an offline reload restores it. */
export interface VjScreenRecord {
  savedAt: number;
  /** Saved with the strobe off (contract 6.4): a reload never restarts it. */
  state: VjStageState;
  pack: VjPackDTO | null;
  clips: VjClipDTO[];
  /**
   * The live clip, kept even when it sits outside the active pack (a pack
   * switch leaves the last clip playing), so a reload can still show it.
   * Missing from records saved before this field existed.
   */
  liveClip?: VjClipDTO | null;
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

function isOneOf<Member extends string | number>(
  list: readonly Member[],
  value: unknown,
): value is Member {
  return list.some((member) => member === value);
}

function isTransition(value: unknown): boolean {
  return (
    isPlainObject(value) &&
    isOneOf(VJ_TRANSITION_MODES, value.mode) &&
    isNonNegativeInteger(value.fadeMs)
  );
}

function isOverlay(value: unknown): boolean {
  return (
    isPlainObject(value) &&
    typeof value.text === "string" &&
    isOneOf(VJ_OVERLAY_STYLES, value.style) &&
    typeof value.isVisible === "boolean"
  );
}

function isEffects(value: unknown): boolean {
  return (
    isPlainObject(value) &&
    isOneOf(VJ_SPEEDS, value.speed) &&
    typeof value.isMonochrome === "boolean" &&
    typeof value.isMirrored === "boolean" &&
    typeof value.isHueCycling === "boolean" &&
    typeof value.isStrobing === "boolean" &&
    typeof value.isBlackout === "boolean" &&
    (value.strobeStartedAt === null || isFiniteNumber(value.strobeStartedAt))
  );
}

function isShuffle(value: unknown): boolean {
  if (
    !isPlainObject(value) ||
    typeof value.isOn !== "boolean" ||
    !isOneOf(VJ_SHUFFLE_INTERVAL_KINDS, value.intervalKind) ||
    !isFiniteNumber(value.intervalValue) ||
    !isFiniteNumber(value.bpm)
  ) {
    return false;
  }
  return value.intervalKind === "beats"
    ? isOneOf(VJ_SHUFFLE_BEAT_COUNTS, value.intervalValue)
    : Number.isInteger(value.intervalValue);
}

function isStageState(value: unknown): value is VjStageState {
  return (
    isPlainObject(value) &&
    typeof value.stageEpoch === "string" &&
    isNonNegativeInteger(value.revision) &&
    isNonNegativeInteger(value.clipSequence) &&
    isNullableString(value.activePackId) &&
    isNullableString(value.liveClipId) &&
    isTransition(value.transition) &&
    isOverlay(value.overlay) &&
    isEffects(value.effects) &&
    isShuffle(value.shuffle) &&
    isFiniteNumber(value.updatedAt)
  );
}

function isCreator(value: unknown): value is VjCreatorDTO | null {
  return (
    value === null ||
    (isPlainObject(value) &&
      typeof value.userId === "string" &&
      typeof value.displayName === "string")
  );
}

function isPack(value: unknown): value is VjPackDTO {
  return (
    isPlainObject(value) &&
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    isNonNegativeInteger(value.position) &&
    isNonNegativeInteger(value.clipCount) &&
    isFiniteNumber(value.totalByteSize) &&
    isNullableString(value.coverThumbnailUrl) &&
    isCreator(value.createdBy) &&
    typeof value.createdAt === "string" &&
    typeof value.updatedAt === "string"
  );
}

function isClip(value: unknown): value is VjClipDTO {
  return (
    isPlainObject(value) &&
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    isOneOf(VJ_MEDIA_KINDS, value.mediaKind) &&
    isOneOf(VJ_CLIP_MIME_TYPES, value.mimeType) &&
    isFiniteNumber(value.byteSize) &&
    isFiniteNumber(value.width) &&
    isFiniteNumber(value.height) &&
    (value.durationMs === null || isFiniteNumber(value.durationMs)) &&
    isOneOf(VJ_FIT_MODES, value.fitMode) &&
    typeof value.thumbnailUrl === "string" &&
    typeof value.mediaUrl === "string" &&
    Array.isArray(value.packIds) &&
    value.packIds.every((packId) => typeof packId === "string") &&
    isNonNegativeInteger(value.packCount) &&
    isCreator(value.createdBy) &&
    typeof value.createdAt === "string" &&
    typeof value.updatedAt === "string"
  );
}

function isScreenRecord(value: unknown): value is VjScreenRecord {
  return (
    isPlainObject(value) &&
    isFiniteNumber(value.savedAt) &&
    isStageState(value.state) &&
    (value.pack === null || isPack(value.pack)) &&
    Array.isArray(value.clips) &&
    value.clips.every(isClip) &&
    (value.liveClip === undefined ||
      value.liveClip === null ||
      isClip(value.liveClip))
  );
}

/**
 * The state as a record keeps it: the strobe off and its start cleared, the
 * same rule the server applies to a restore (contract 6.4). Answers the same
 * object when the strobe is already off.
 */
export function withVjStrobeOff(state: VjStageState): VjStageState {
  if (!state.effects.isStrobing && state.effects.strobeStartedAt === null) {
    return state;
  }
  return {
    ...state,
    effects: { ...state.effects, isStrobing: false, strobeStartedAt: null },
  };
}

export function clearVjScreenRecord(): void {
  try {
    localStorage.removeItem(VJ_SCREEN_SNAPSHOT_STORAGE_KEY);
  } catch {
    // Storage blocked: nothing to clear.
  }
}

export function readVjScreenRecord(): VjScreenRecord | null {
  let rawRecord: string | null;
  try {
    rawRecord = localStorage.getItem(VJ_SCREEN_SNAPSHOT_STORAGE_KEY);
  } catch {
    return null;
  }
  if (rawRecord === null) return null;
  try {
    const parsedRecord: unknown = JSON.parse(rawRecord);
    // A record saved mid-strobe by an older build restores with the strobe off.
    if (isScreenRecord(parsedRecord)) {
      return { ...parsedRecord, state: withVjStrobeOff(parsedRecord.state) };
    }
  } catch {
    // Unparseable text falls through to the removal below.
  }
  clearVjScreenRecord();
  return null;
}

export function writeVjScreenRecord(record: VjScreenRecord): void {
  try {
    localStorage.setItem(
      VJ_SCREEN_SNAPSHOT_STORAGE_KEY,
      JSON.stringify({ ...record, state: withVjStrobeOff(record.state) }),
    );
  } catch {
    // Quota or blocked storage: the show goes on without a saved look.
  }
}

/** The attach `restoreState` of contract 2.1, field by field. */
export function vjStageRestoreOf(state: VjStageState): VjStageRestore {
  return {
    stageEpoch: state.stageEpoch,
    revision: state.revision,
    activePackId: state.activePackId,
    liveClipId: state.liveClipId,
    transition: state.transition,
    overlay: state.overlay,
    effects: state.effects,
    shuffle: state.shuffle,
  };
}

let memoryScreenId: string | null = null;

export function readOrMintVjScreenId(): string {
  try {
    const storedScreenId = sessionStorage.getItem(VJ_SCREEN_ID_STORAGE_KEY);
    if (storedScreenId !== null && UUID_PATTERN.test(storedScreenId)) {
      return storedScreenId;
    }
  } catch {
    // Storage blocked: the module variable keeps one id per page load.
    if (memoryScreenId !== null) return memoryScreenId;
  }
  const mintedScreenId = crypto.randomUUID();
  try {
    sessionStorage.setItem(VJ_SCREEN_ID_STORAGE_KEY, mintedScreenId);
  } catch {
    memoryScreenId = mintedScreenId;
  }
  return mintedScreenId;
}

/** Test seam: forgets the in-memory fallback id. */
export function resetVjScreenIdMemory(): void {
  memoryScreenId = null;
}
