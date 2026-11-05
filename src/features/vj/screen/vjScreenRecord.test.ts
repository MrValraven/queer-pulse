import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createVjStageState,
  type VjClipDTO,
  type VjPackDTO,
} from "../../../shared/contracts/vj";
import {
  VJ_SCREEN_ID_STORAGE_KEY,
  VJ_SCREEN_SNAPSHOT_STORAGE_KEY,
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
};

function buildRecord(): VjScreenRecord {
  const state = createVjStageState("epoch-1", 1_000);
  return {
    savedAt: 5_000,
    state: {
      ...state,
      revision: 7,
      clipSequence: 3,
      activePackId: "pack-1",
      liveClipId: "clip-1",
    },
    pack,
    clips: [clip],
  };
}

describe("vjScreenRecord", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    resetVjScreenIdMemory();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("writes and reads back the last look", () => {
    const record = buildRecord();
    writeVjScreenRecord(record);
    expect(readVjScreenRecord()).toEqual(record);
  });

  it("saves the look with the strobe off so a reload never restarts it", () => {
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

    const rawRecord = localStorage.getItem(VJ_SCREEN_SNAPSHOT_STORAGE_KEY);
    const storedRecord = JSON.parse(rawRecord ?? "null") as VjScreenRecord;
    expect(storedRecord.state.effects.isStrobing).toBe(false);
    expect(storedRecord.state.effects.strobeStartedAt).toBeNull();
    expect(readVjScreenRecord()?.state.effects).toEqual(record.state.effects);
  });

  it("restores a record saved mid-strobe by an older build with the strobe off", () => {
    const record = buildRecord();
    localStorage.setItem(
      VJ_SCREEN_SNAPSHOT_STORAGE_KEY,
      JSON.stringify({
        ...record,
        state: {
          ...record.state,
          effects: {
            ...record.state.effects,
            isStrobing: true,
            strobeStartedAt: 4_000,
          },
        },
      }),
    );

    const restored = readVjScreenRecord();
    expect(restored?.state.effects.isStrobing).toBe(false);
    expect(restored?.state.effects.strobeStartedAt).toBeNull();
    expect(
      restored === null ? null : vjStageRestoreOf(restored.state).effects,
    ).toEqual(record.state.effects);
  });

  it("answers the same state when the strobe is already off", () => {
    const state = buildRecord().state;
    expect(withVjStrobeOff(state)).toBe(state);
  });

  it("keeps the live clip's entry, even outside the active pack", () => {
    const outsideClip: VjClipDTO = {
      ...clip,
      id: "clip-9",
      packIds: ["pack-2"],
    };
    const record: VjScreenRecord = {
      ...buildRecord(),
      liveClip: outsideClip,
    };
    writeVjScreenRecord(record);
    expect(readVjScreenRecord()?.liveClip).toEqual(outsideClip);

    // Records saved before the field existed still read.
    const { liveClip: _omitted, ...olderRecord } = record;
    localStorage.setItem(
      VJ_SCREEN_SNAPSHOT_STORAGE_KEY,
      JSON.stringify(olderRecord),
    );
    expect(readVjScreenRecord()?.liveClip).toBeUndefined();

    localStorage.setItem(
      VJ_SCREEN_SNAPSHOT_STORAGE_KEY,
      JSON.stringify({ ...record, liveClip: { id: "broken" } }),
    );
    expect(readVjScreenRecord()).toBeNull();
  });

  it("reads a malformed record as nothing and removes it", () => {
    const wrongRevision = buildRecord();
    const brokenRecords: unknown[] = [
      { ...wrongRevision, state: { ...wrongRevision.state, revision: "7" } },
      {
        ...wrongRevision,
        state: {
          ...wrongRevision.state,
          overlay: { text: "", style: "banner", isVisible: false },
        },
      },
      { ...wrongRevision, clips: "none" },
    ];
    for (const brokenRecord of brokenRecords) {
      localStorage.setItem(
        VJ_SCREEN_SNAPSHOT_STORAGE_KEY,
        JSON.stringify(brokenRecord),
      );
      expect(readVjScreenRecord()).toBeNull();
      expect(localStorage.getItem(VJ_SCREEN_SNAPSHOT_STORAGE_KEY)).toBeNull();
    }
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

  it("builds the attach restore state from the record", () => {
    const record = buildRecord();
    const restoreState = vjStageRestoreOf(record.state);
    expect(Object.keys(restoreState).sort()).toEqual(
      [
        "activePackId",
        "effects",
        "liveClipId",
        "overlay",
        "revision",
        "shuffle",
        "stageEpoch",
        "transition",
      ].sort(),
    );
    expect(restoreState.stageEpoch).toBe("epoch-1");
    expect(restoreState.revision).toBe(7);
    expect(restoreState.liveClipId).toBe("clip-1");
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
});
