import {
  createVjSetlistPlayback,
  upgradeVjStageFieldsV2,
  type VjClipDTO,
  type VjEventCardDTO,
  type VjPackDTO,
  type VjStageRestore,
  type VjStageState,
} from "../../../shared/contracts/vj";
import {
  VJ_SCREEN_ID_STORAGE_KEY,
  VJ_SCREEN_SNAPSHOT_STORAGE_KEY,
  VJ_SCREEN_SNAPSHOT_V1_STORAGE_KEY,
} from "../vj.constants";
import {
  isVjClipV2,
  isVjEventCard,
  isVjFiniteNumber,
  isVjPackV2,
  isVjPlainObject,
  isVjSetlistPlaybackFor,
  isVjStageStateV2,
} from "./vjScreenRecordGuards";
import { createVjUuid } from "../live/vjUuid";
import { upgradeVjScreenRecordV1 } from "./vjScreenRecordV1";

/** The last look a screen applied, kept so an offline reload restores it (contract 9.1). */
export interface VjScreenRecord {
  version: 2;
  savedAt: number;
  /** Saved with the strobe off (v1 rule). */
  state: VjStageState;
  pack: VjPackDTO | null;
  clips: VjClipDTO[];
  /**
   * The live clip, kept even when it sits outside the active pack (a pack
   * switch leaves the last clip playing), so a reload can still show it.
   */
  liveClip: VjClipDTO | null;
  /** Clips the state names outside the pack: mix, this screen's override, every clip the active set list names. */
  extraClips: VjClipDTO[];
  /** The active pack's card, so an offline reload can still show it. */
  eventCard: VjEventCardDTO | null;
  /** The last synced clock offset, so an offline reload keeps beat phase. */
  clockOffsetMs: number | null;
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isVjClipList(value: unknown): value is VjClipDTO[] {
  return Array.isArray(value) && value.every(isVjClipV2);
}

function isVjScreenRecordV2(value: unknown): value is VjScreenRecord {
  return (
    isVjPlainObject(value) &&
    value.version === 2 &&
    isVjFiniteNumber(value.savedAt) &&
    isVjStageStateV2(value.state) &&
    (value.pack === null || isVjPackV2(value.pack)) &&
    isVjClipList(value.clips) &&
    (value.liveClip === null || isVjClipV2(value.liveClip)) &&
    isVjClipList(value.extraClips) &&
    (value.eventCard === null || isVjEventCard(value.eventCard)) &&
    (value.clockOffsetMs === null || isVjFiniteNumber(value.clockOffsetMs))
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

function removeStoredItem(storageKey: string): void {
  try {
    localStorage.removeItem(storageKey);
  } catch {
    // Storage blocked: nothing to remove.
  }
}

type VjStoredValue = { isPresent: false } | { isPresent: true; value: unknown };

/** The parsed value under a key. Text that does not parse reads as present
 *  with an undefined value, so the caller's validator removes it. */
function readStoredValue(storageKey: string): VjStoredValue {
  let rawValue: string | null;
  try {
    rawValue = localStorage.getItem(storageKey);
  } catch {
    return { isPresent: false };
  }
  if (rawValue === null) return { isPresent: false };
  try {
    return { isPresent: true, value: JSON.parse(rawValue) as unknown };
  } catch {
    return { isPresent: true, value: undefined };
  }
}

/** Saves the record with the strobe off; answers whether storage took it. */
function storeVjScreenRecord(record: VjScreenRecord): boolean {
  try {
    localStorage.setItem(
      VJ_SCREEN_SNAPSHOT_STORAGE_KEY,
      JSON.stringify({
        ...record,
        version: 2,
        state: withVjStrobeOff(record.state),
      }),
    );
    return true;
  } catch {
    // Quota or blocked storage: the show goes on without a saved look.
    return false;
  }
}

/**
 * The v1 record upgraded to v2 and saved under the v2 key. The v1 key goes
 * once the upgrade is saved, or at once when the record is unreadable; a
 * failed save keeps it so the next load tries again.
 */
function readUpgradedVjScreenRecordV1(): VjScreenRecord | null {
  const storedRecordV1 = readStoredValue(VJ_SCREEN_SNAPSHOT_V1_STORAGE_KEY);
  if (!storedRecordV1.isPresent) return null;
  const upgradedRecord = upgradeVjScreenRecordV1(storedRecordV1.value);
  if (upgradedRecord === null) {
    removeStoredItem(VJ_SCREEN_SNAPSHOT_V1_STORAGE_KEY);
    return null;
  }
  const record: VjScreenRecord = {
    ...upgradedRecord,
    state: withVjStrobeOff(upgradedRecord.state),
  };
  if (storeVjScreenRecord(record)) {
    removeStoredItem(VJ_SCREEN_SNAPSHOT_V1_STORAGE_KEY);
  }
  return record;
}

/** Forgets the saved look under both keys. */
export function clearVjScreenRecord(): void {
  removeStoredItem(VJ_SCREEN_SNAPSHOT_STORAGE_KEY);
  removeStoredItem(VJ_SCREEN_SNAPSHOT_V1_STORAGE_KEY);
}

/**
 * A stored v2 record with its state run through the sequences upgrade
 * (sequences contract 6.3): a record saved before sequences gains the default
 * setlistPlayback. A stored clock that breaks the 3.2 invariants reads as
 * the manual default for that set list (its stored Loop kept when it is a
 * boolean), so an offline reload keeps the look, the active set list and its
 * index; the server's restore reads the set list's Loop again. Anything that
 * is no plain object with a plain object state comes back as it is, so the
 * validator rejects it.
 */
function withVjStageFieldsV2Upgraded(value: unknown): unknown {
  if (!isVjPlainObject(value) || !isVjPlainObject(value.state)) return value;
  const state = upgradeVjStageFieldsV2(value.state);
  const { activeSetlistId, setlistPlayback } = state;
  if (isVjSetlistPlaybackFor(activeSetlistId, setlistPlayback)) {
    return { ...value, state };
  }
  const isLooping =
    activeSetlistId !== null &&
    isVjPlainObject(setlistPlayback) &&
    setlistPlayback.isLooping === true;
  return {
    ...value,
    state: { ...state, setlistPlayback: createVjSetlistPlayback(isLooping) },
  };
}

/**
 * Contract 9.1 reader order: the v2 key, validated field by field; when it
 * is absent or invalid, the v1 key, upgraded. An invalid record under either
 * key is removed. A readable v2 record also removes a leftover v1 record, so
 * an old look can never come back later.
 */
export function readVjScreenRecord(): VjScreenRecord | null {
  const storedRecord = readStoredValue(VJ_SCREEN_SNAPSHOT_STORAGE_KEY);
  if (storedRecord.isPresent) {
    const upgradedRecord = withVjStageFieldsV2Upgraded(storedRecord.value);
    if (isVjScreenRecordV2(upgradedRecord)) {
      removeStoredItem(VJ_SCREEN_SNAPSHOT_V1_STORAGE_KEY);
      return {
        ...upgradedRecord,
        state: withVjStrobeOff(upgradedRecord.state),
      };
    }
    removeStoredItem(VJ_SCREEN_SNAPSHOT_STORAGE_KEY);
  }
  return readUpgradedVjScreenRecordV1();
}

export function writeVjScreenRecord(record: VjScreenRecord): void {
  storeVjScreenRecord(record);
}

/** The attach `restoreState` of contract 7.13: the 3.4 Pick list, field by field. */
export function vjStageRestoreOf(state: VjStageState): VjStageRestore {
  return {
    stageEpoch: state.stageEpoch,
    revision: state.revision,
    activePackId: state.activePackId,
    liveClipId: state.liveClipId,
    liveGeneratorId: state.liveGeneratorId,
    liveGeneratorVariant: state.liveGeneratorVariant,
    transition: state.transition,
    overlay: state.overlay,
    countdown: state.countdown,
    logo: state.logo,
    eventCard: state.eventCard,
    effects: state.effects,
    mix: state.mix,
    tempo: state.tempo,
    shuffle: state.shuffle,
    activeSetlistId: state.activeSetlistId,
    setlistIndex: state.setlistIndex,
    setlistPlayback: state.setlistPlayback,
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
  const mintedScreenId = createVjUuid();
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
