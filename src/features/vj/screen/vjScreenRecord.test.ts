import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createVjSetlistPlayback,
  createVjStageState,
  stampVjSetlistClock,
  vjSetlistTakeoverState,
  vjSetlistTimerTransition,
  type VjClipDTO,
  type VjEventCardDTO,
  type VjPackDTO,
  type VjSetlistPlayback,
  type VjSetlistRead,
  type VjStageRestore,
} from "../../../shared/contracts/vj";
import {
  VJ_SCREEN_ID_STORAGE_KEY,
  VJ_SCREEN_SNAPSHOT_STORAGE_KEY,
  VJ_SCREEN_SNAPSHOT_V1_STORAGE_KEY,
} from "../vj.constants";
import {
  readOrMintVjScreenId,
  readVjScreenRecord,
  resetVjScreenIdMemory,
  vjStageRestoreOf,
  withVjStrobeOff,
  writeVjScreenRecord,
  type VjScreenRecord,
} from "./vjScreenRecord";
import { isVjSetlistPlayback } from "./vjScreenRecordGuards";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const pack: VjPackDTO = {
  id: "pack-1",
  name: "Opening",
  position: 0,
  clipCount: 1,
  totalByteSize: 2048,
  coverThumbnailUrl: "https://files.example/thumb-1.jpg",
  createdBy: { userId: "user-1", displayName: "Alex" },
  createdAt: "2026-11-05T10:00:00.000Z",
  updatedAt: "2026-11-05T10:00:00.000Z",
  event: {
    id: "event-1",
    title: "Friday social",
    startAt: "2026-11-07T21:00:00.000Z",
    isAvailable: true,
  },
};

const clip: VjClipDTO = {
  id: "clip-1",
  title: "Pink loop",
  mediaKind: "video",
  mimeType: "video/mp4",
  byteSize: 2048,
  width: 1920,
  height: 1080,
  durationMs: 4000,
  fitMode: "fill",
  thumbnailUrl: "https://files.example/thumb-1.jpg",
  mediaUrl: "https://files.example/clip-1.mp4",
  packIds: ["pack-1"],
  packCount: 1,
  createdBy: null,
  createdAt: "2026-11-05T10:00:00.000Z",
  updatedAt: "2026-11-05T10:00:00.000Z",
  isFavorite: true,
  defaultSpeed: 1.5,
  loopInMs: 500,
  loopOutMs: 3500,
  loopMode: "pingPong",
  previewUrl: "https://files.example/preview-1.webm",
  setlistItemCount: 0,
};

const eventCard: VjEventCardDTO = {
  eventId: "event-1",
  title: "Friday social",
  startAt: "2026-11-07T21:00:00.000Z",
  endAt: null,
  timezone: "Europe/Lisbon",
  area: "Intendente",
  isOnline: false,
  publicUrl: "https://queerpulse.example/events/friday-social",
};

function buildRecord(): VjScreenRecord {
  const state = createVjStageState("epoch-1", 1_000);
  return {
    version: 2,
    savedAt: 5_000,
    state: {
      ...state,
      revision: 7,
      clipSequence: 3,
      activePackId: "pack-1",
      liveClipId: "clip-1",
      liveSince: 4_000,
      effects: {
        ...state.effects,
        settings: { mirror: { isOn: true, amount: 1, variant: "quad" } },
      },
      mix: { clipId: "clip-2", amount: 0.4, blendMode: "screen" },
      screenOverrides: {
        "screen-2": {
          clipId: null,
          generatorId: "prideFlagWave",
          generatorVariant: "trans",
        },
      },
    },
    pack,
    clips: [clip],
    liveClip: clip,
    extraClips: [],
    eventCard: null,
    clockOffsetMs: null,
  };
}

/** A v1 record as a v1 build saved it, for the reader order cases. */
function buildRecordV1(): Record<string, unknown> {
  const {
    isFavorite: _isFavorite,
    defaultSpeed: _defaultSpeed,
    loopInMs: _loopInMs,
    loopOutMs: _loopOutMs,
    loopMode: _loopMode,
    previewUrl: _previewUrl,
    ...clipV1
  } = clip;
  const { event: _event, ...packV1 } = pack;
  return {
    savedAt: 2_000,
    state: {
      stageEpoch: "epoch-old",
      revision: 2,
      clipSequence: 1,
      activePackId: "pack-1",
      liveClipId: "clip-1",
      transition: { mode: "cut", fadeMs: 0 },
      overlay: { text: "", style: "big", isVisible: false },
      effects: {
        speed: 1,
        isMonochrome: false,
        isMirrored: false,
        isHueCycling: false,
        isStrobing: false,
        isBlackout: false,
        strobeStartedAt: null,
      },
      shuffle: {
        isOn: false,
        intervalKind: "seconds",
        intervalValue: 8,
        bpm: 120,
      },
      updatedAt: 1_500,
    },
    pack: packV1,
    clips: [clipV1],
  };
}

const SETLIST_ID = "setlist-1";

/** A sequence playing its second step, eight seconds long. */
const playingPlayback: VjSetlistPlayback = {
  status: "playing",
  itemId: "item-2",
  isFlashConfirmed: true,
  stepStartedAt: 4_000,
  stepEndsAt: 12_000,
  stepDurationMs: 8_000,
  pausedRemainingMs: null,
  isLooping: true,
};

/** buildRecord with an active set list at index 1 and the given playback. */
function buildSequenceRecord(
  setlistPlayback: VjSetlistPlayback,
): VjScreenRecord {
  const record = buildRecord();
  return {
    ...record,
    state: {
      ...record.state,
      activeSetlistId: SETLIST_ID,
      setlistIndex: 1,
      setlistPlayback,
    },
  };
}

/** A v2 record as a build from before sequences saved it: no setlistPlayback. */
function buildRecordBeforeSequences(): Record<string, unknown> {
  const record = buildRecord();
  const { setlistPlayback: _setlistPlayback, ...stateBeforeSequences } =
    record.state;
  return {
    ...record,
    state: {
      ...stateBeforeSequences,
      activeSetlistId: SETLIST_ID,
      setlistIndex: 2,
    },
  };
}

function storeRaw(storageKey: string, value: unknown): void {
  localStorage.setItem(storageKey, JSON.stringify(value));
}

describe("vjScreenRecord", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("reads a valid v2 record", () => {
    const record = buildRecord();
    storeRaw(VJ_SCREEN_SNAPSHOT_STORAGE_KEY, record);
    expect(readVjScreenRecord()).toEqual(record);
    expect(localStorage.getItem(VJ_SCREEN_SNAPSHOT_STORAGE_KEY)).not.toBeNull();
  });

  it("prefers the v2 key when both exist", () => {
    const record = buildRecord();
    storeRaw(VJ_SCREEN_SNAPSHOT_STORAGE_KEY, record);
    storeRaw(VJ_SCREEN_SNAPSHOT_V1_STORAGE_KEY, buildRecordV1());

    const restored = readVjScreenRecord();
    expect(restored).toEqual(record);
    expect(restored?.state.stageEpoch).toBe("epoch-1");
    // The leftover v1 record goes, so it can never resurface later.
    expect(localStorage.getItem(VJ_SCREEN_SNAPSHOT_V1_STORAGE_KEY)).toBeNull();
  });

  it("saves and reads with the strobe off", () => {
    const record = buildRecord();
    const strobingRecord: VjScreenRecord = {
      ...record,
      state: {
        ...record.state,
        effects: {
          ...record.state.effects,
          isStrobing: true,
          strobeStartedAt: 4_000,
        },
      },
    };
    writeVjScreenRecord(strobingRecord);
    const storedRecord = JSON.parse(
      localStorage.getItem(VJ_SCREEN_SNAPSHOT_STORAGE_KEY) ?? "null",
    ) as VjScreenRecord;
    expect(storedRecord.version).toBe(2);
    expect(storedRecord.state.effects.isStrobing).toBe(false);
    expect(storedRecord.state.effects.strobeStartedAt).toBeNull();
    expect(readVjScreenRecord()).toEqual(record);

    // A record stored mid-strobe some other way still reads with it off.
    storeRaw(VJ_SCREEN_SNAPSHOT_STORAGE_KEY, strobingRecord);
    expect(readVjScreenRecord()?.state.effects.isStrobing).toBe(false);
    expect(withVjStrobeOff(record.state)).toBe(record.state);
  });

  it("keeps extra clips, the event card and the clock offset", () => {
    const mixClip: VjClipDTO = {
      ...clip,
      id: "clip-2",
      packIds: ["pack-9"],
      mediaKind: "gif",
      mimeType: "image/gif",
      durationMs: null,
    };
    const record: VjScreenRecord = {
      ...buildRecord(),
      extraClips: [mixClip],
      eventCard,
      clockOffsetMs: -42.5,
    };
    writeVjScreenRecord(record);

    const restored = readVjScreenRecord();
    expect(restored?.extraClips).toEqual([mixClip]);
    expect(restored?.eventCard).toEqual(eventCard);
    expect(restored?.clockOffsetMs).toBe(-42.5);
  });

  it("removes an invalid v2 record", () => {
    const record = buildRecord();
    const brokenRecords: unknown[] = [
      { ...record, version: 1 },
      { ...record, state: { ...record.state, revision: "7" } },
      { ...record, state: { ...record.state, tempo: undefined } },
      {
        ...record,
        state: { ...record.state, mix: { ...record.state.mix, amount: 1.5 } },
      },
      {
        ...record,
        state: {
          ...record.state,
          screenOverrides: {
            "screen-2": {
              clipId: "clip-1",
              generatorId: "plasma",
              generatorVariant: null,
            },
          },
        },
      },
      { ...record, clips: [{ ...clip, loopMode: "bounce" }] },
      { ...record, extraClips: "none" },
      { ...record, eventCard: { ...eventCard, isOnline: "no" } },
      { ...record, clockOffsetMs: "12" },
      "not a record",
    ];
    for (const brokenRecord of brokenRecords) {
      storeRaw(VJ_SCREEN_SNAPSHOT_STORAGE_KEY, brokenRecord);
      expect(readVjScreenRecord()).toBeNull();
      expect(localStorage.getItem(VJ_SCREEN_SNAPSHOT_STORAGE_KEY)).toBeNull();
    }
    localStorage.setItem(VJ_SCREEN_SNAPSHOT_STORAGE_KEY, "{not json");
    expect(readVjScreenRecord()).toBeNull();
    expect(localStorage.getItem(VJ_SCREEN_SNAPSHOT_STORAGE_KEY)).toBeNull();
  });

  it("rejects a variant outside the catalog", () => {
    const record = buildRecord();
    const withSettings = (settings: Record<string, unknown>): unknown => ({
      ...record,
      state: {
        ...record.state,
        effects: { ...record.state.effects, settings },
      },
    });
    const brokenRecords: unknown[] = [
      withSettings({ mirror: { isOn: true, amount: 1, variant: "diagonal" } }),
      withSettings({ monochrome: { isOn: true, amount: 1, variant: "plum" } }),
      withSettings({ mirror: { isOn: true, amount: 1, variant: null } }),
      withSettings({ sparkle: { isOn: true, amount: 1, variant: null } }),
      withSettings({ invert: { isOn: true, amount: -0.1, variant: "beat" } }),
      {
        ...record,
        state: {
          ...record.state,
          liveClipId: null,
          liveGeneratorId: "prideFlagWave",
          liveGeneratorVariant: "plaid",
        },
      },
    ];
    for (const brokenRecord of brokenRecords) {
      storeRaw(VJ_SCREEN_SNAPSHOT_STORAGE_KEY, brokenRecord);
      expect(readVjScreenRecord()).toBeNull();
    }
  });

  it("builds the restore state from the 3.4 field list", () => {
    const record = buildRecord();
    const restoreState = vjStageRestoreOf(record.state);
    const expectedFields: (keyof VjStageRestore)[] = [
      "stageEpoch",
      "revision",
      "activePackId",
      "liveClipId",
      "liveGeneratorId",
      "liveGeneratorVariant",
      "transition",
      "overlay",
      "countdown",
      "logo",
      "eventCard",
      "effects",
      "mix",
      "tempo",
      "shuffle",
      "activeSetlistId",
      "setlistIndex",
      "setlistPlayback",
    ];
    expect(Object.keys(restoreState).sort()).toEqual(
      [...expectedFields].sort(),
    );
    for (const field of expectedFields) {
      expect(restoreState[field]).toEqual(record.state[field]);
    }
    expect(restoreState).not.toHaveProperty("liveSince");
    expect(restoreState).not.toHaveProperty("recentClipIds");
    expect(restoreState).not.toHaveProperty("screenOverrides");
    expect(restoreState).not.toHaveProperty("clipSequence");
  });
});

describe("vjScreenRecord sequence clock", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("round-trips a playing and a paused sequence clock", () => {
    const playingRecord = buildSequenceRecord(playingPlayback);
    writeVjScreenRecord(playingRecord);
    expect(readVjScreenRecord()).toEqual(playingRecord);

    const pausedRecord = buildSequenceRecord({
      ...playingPlayback,
      status: "paused",
      stepStartedAt: null,
      stepEndsAt: null,
      pausedRemainingMs: 3_000,
    });
    writeVjScreenRecord(pausedRecord);
    expect(readVjScreenRecord()?.state.setlistPlayback).toEqual(
      pausedRecord.state.setlistPlayback,
    );
  });

  it("reads a record saved before sequences with the default playback", () => {
    storeRaw(VJ_SCREEN_SNAPSHOT_STORAGE_KEY, buildRecordBeforeSequences());

    const restored = readVjScreenRecord();
    expect(restored).not.toBeNull();
    expect(restored?.state.setlistPlayback).toEqual(
      createVjSetlistPlayback(false),
    );
    expect(restored?.state.activeSetlistId).toBe(SETLIST_ID);
    expect(restored?.state.setlistIndex).toBe(2);
    expect(localStorage.getItem(VJ_SCREEN_SNAPSHOT_STORAGE_KEY)).not.toBeNull();
  });

  it("reads a broken sequence clock as the manual default and keeps the look", () => {
    const brokenPlaybacks: unknown[] = [
      null,
      { ...playingPlayback, status: "running" },
      { ...playingPlayback, isFlashConfirmed: "yes" },
      { ...playingPlayback, itemId: 2 },
      { ...playingPlayback, isLooping: undefined },
      // Playing: the ends must sit stepDurationMs apart and hold no remainder.
      { ...playingPlayback, stepEndsAt: 13_000 },
      { ...playingPlayback, stepStartedAt: null },
      { ...playingPlayback, pausedRemainingMs: 1_000 },
      // Paused: no ends, a remainder inside the duration.
      { ...playingPlayback, status: "paused", pausedRemainingMs: 1_000 },
      {
        ...playingPlayback,
        status: "paused",
        stepStartedAt: null,
        stepEndsAt: null,
        pausedRemainingMs: 9_000,
      },
      {
        ...playingPlayback,
        status: "paused",
        stepStartedAt: null,
        stepEndsAt: null,
        pausedRemainingMs: null,
      },
      // Any other status: no ends and no remainder.
      {
        ...createVjSetlistPlayback(true),
        status: "finished",
        pausedRemainingMs: 2_000,
      },
      { ...createVjSetlistPlayback(true), stepEndsAt: 12_000 },
    ];
    for (const brokenPlayback of brokenPlaybacks) {
      expect(isVjSetlistPlayback(brokenPlayback)).toBe(false);
      const record = buildSequenceRecord(brokenPlayback as VjSetlistPlayback);
      storeRaw(VJ_SCREEN_SNAPSHOT_STORAGE_KEY, record);
      const storedIsLooping =
        (brokenPlayback as { isLooping?: unknown } | null)?.isLooping === true;

      expect(readVjScreenRecord()).toEqual({
        ...record,
        state: {
          ...record.state,
          setlistPlayback: createVjSetlistPlayback(storedIsLooping),
        },
      });
      expect(
        localStorage.getItem(VJ_SCREEN_SNAPSHOT_STORAGE_KEY),
      ).not.toBeNull();
    }
  });

  it("reads a running clock with no set list as the default playback", () => {
    const record = buildRecord();
    storeRaw(VJ_SCREEN_SNAPSHOT_STORAGE_KEY, {
      ...record,
      state: { ...record.state, setlistPlayback: playingPlayback },
    });

    const restored = readVjScreenRecord();
    expect(restored?.state.activeSetlistId).toBeNull();
    expect(restored?.state.setlistPlayback).toEqual(
      createVjSetlistPlayback(false),
    );
    expect(restored?.state.liveClipId).toBe("clip-1");
  });

  it("still removes a record whose set list fields are broken", () => {
    const record = buildSequenceRecord(playingPlayback);
    storeRaw(VJ_SCREEN_SNAPSHOT_STORAGE_KEY, {
      ...record,
      state: { ...record.state, setlistIndex: -1 },
    });
    expect(readVjScreenRecord()).toBeNull();
    expect(localStorage.getItem(VJ_SCREEN_SNAPSHOT_STORAGE_KEY)).toBeNull();
  });

  it("keeps a taken over sequence", () => {
    const record = buildSequenceRecord({
      ...createVjSetlistPlayback(true),
      status: "takenOver",
      itemId: "item-2",
    });
    writeVjScreenRecord(record);
    expect(readVjScreenRecord()).toEqual(record);
  });

  it("accepts every clock the contract writers produce", () => {
    const playingState = buildSequenceRecord(playingPlayback).state;
    const readAt = (step: VjSetlistRead["step"]): VjSetlistRead => ({
      setlistId: SETLIST_ID,
      isLooping: false,
      stepDuration: { kind: "seconds", value: 8 },
      itemIds: ["item-1", "item-2", "item-3"],
      step,
    });

    // The timer lands the next step and the landing stamps its clock.
    const advance = vjSetlistTimerTransition(
      playingState,
      readAt({
        kind: "clip",
        itemId: "item-3",
        index: 2,
        clipId: "clip-3",
        duration: { kind: "seconds", value: 6 },
      }),
    );
    expect(advance).not.toBeNull();
    const advancedPlayback = stampVjSetlistClock(
      advance?.nextState.setlistPlayback ?? playingPlayback,
      advance?.clock ?? { kind: "keep" },
      20_000,
    );
    expect(advancedPlayback.status).toBe("playing");
    expect(isVjSetlistPlayback(advancedPlayback)).toBe(true);

    // Past the last step with Loop off the timer lands finished.
    const finish = vjSetlistTimerTransition(playingState, readAt(null));
    expect(finish?.nextState.setlistPlayback.status).toBe("finished");
    const finishedPlayback = stampVjSetlistClock(
      finish?.nextState.setlistPlayback ?? playingPlayback,
      finish?.clock ?? { kind: "keep" },
      20_000,
    );
    expect(isVjSetlistPlayback(finishedPlayback)).toBe(true);

    // A takeover clears every clock field.
    const takenOverState = vjSetlistTakeoverState(playingState, {
      ...playingState,
      liveClipId: "clip-9",
    });
    expect(takenOverState.setlistPlayback.status).toBe("takenOver");
    expect(isVjSetlistPlayback(takenOverState.setlistPlayback)).toBe(true);

    for (const setlistPlayback of [advancedPlayback, finishedPlayback]) {
      const record = buildSequenceRecord(setlistPlayback);
      writeVjScreenRecord(record);
      expect(readVjScreenRecord()).toEqual(record);
    }
  });

  it("carries a sequence clock into the restore state", () => {
    const record = buildSequenceRecord(playingPlayback);
    expect(vjStageRestoreOf(record.state).setlistPlayback).toEqual(
      playingPlayback,
    );
  });
});

describe("vjScreenRecord storage and screen id", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    resetVjScreenIdMemory();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("survives blocked storage", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(readVjScreenRecord()).toBeNull();
    expect(() => writeVjScreenRecord(buildRecord())).not.toThrow();
    const screenId = readOrMintVjScreenId();
    expect(screenId).toMatch(UUID_PATTERN);
    expect(readOrMintVjScreenId()).toBe(screenId);
  });

  it("keeps one screen id per tab across reloads", () => {
    const firstScreenId = readOrMintVjScreenId();
    expect(firstScreenId).toMatch(UUID_PATTERN);
    expect(sessionStorage.getItem(VJ_SCREEN_ID_STORAGE_KEY)).toBe(
      firstScreenId,
    );
    expect(readOrMintVjScreenId()).toBe(firstScreenId);
  });

  it("mints a new screen id when the stored one is no uuid", () => {
    sessionStorage.setItem(VJ_SCREEN_ID_STORAGE_KEY, "not-a-uuid");
    const mintedScreenId = readOrMintVjScreenId();
    expect(mintedScreenId).toMatch(UUID_PATTERN);
    expect(sessionStorage.getItem(VJ_SCREEN_ID_STORAGE_KEY)).toBe(
      mintedScreenId,
    );
  });

  it("mints a screen id over plain http where randomUUID is missing", () => {
    const realCrypto = globalThis.crypto;
    vi.stubGlobal("crypto", {
      getRandomValues: (array: Uint8Array<ArrayBuffer>) =>
        realCrypto.getRandomValues(array),
    });
    try {
      expect(readOrMintVjScreenId()).toMatch(UUID_PATTERN);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
