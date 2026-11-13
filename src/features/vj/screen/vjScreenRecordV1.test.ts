import { beforeEach, describe, expect, it } from "vitest";
import {
  createVjSetlistPlayback,
  upgradeVjStageFieldsV1,
  upgradeVjStageFieldsV2,
} from "../../../shared/contracts/vj";
import {
  VJ_SCREEN_SNAPSHOT_STORAGE_KEY,
  VJ_SCREEN_SNAPSHOT_V1_STORAGE_KEY,
} from "../vj.constants";
import { readVjScreenRecord, type VjScreenRecord } from "./vjScreenRecord";
import { upgradeVjScreenRecordV1 } from "./vjScreenRecordV1";

const SAVED_AT = 9_000;

const clipV1 = {
  id: "clip-1",
  title: "Pink loop",
  mediaKind: "video",
  mimeType: "video/mp4",
  byteSize: 2048,
  width: 1920,
  height: 1080,
  durationMs: 4000,
  fitMode: "fit",
  thumbnailUrl: "https://files.example/thumb-1.jpg",
  mediaUrl: "https://files.example/clip-1.mp4",
  packIds: ["pack-1"],
  packCount: 1,
  createdBy: null,
  createdAt: "2026-11-05T10:00:00.000Z",
  updatedAt: "2026-11-05T10:00:00.000Z",
};

const packV1 = {
  id: "pack-1",
  name: "Opening",
  position: 0,
  clipCount: 1,
  totalByteSize: 2048,
  coverThumbnailUrl: null,
  createdBy: { userId: "user-1", displayName: "Alex" },
  createdAt: "2026-11-05T10:00:00.000Z",
  updatedAt: "2026-11-05T10:00:00.000Z",
};

const stateV1 = {
  stageEpoch: "epoch-1",
  revision: 4,
  clipSequence: 2,
  activePackId: "pack-1",
  liveClipId: "clip-1",
  transition: { mode: "fade", fadeMs: 1200 },
  overlay: { text: "Welcome in", style: "ticker", isVisible: true },
  effects: {
    speed: 0.5,
    isMonochrome: false,
    isMirrored: true,
    isHueCycling: true,
    isStrobing: true,
    isBlackout: false,
    strobeStartedAt: 8_500,
  },
  shuffle: { isOn: true, intervalKind: "beats", intervalValue: 16, bpm: 128 },
  updatedAt: 8_800,
};

function buildRecordV1(): Record<string, unknown> {
  return {
    savedAt: SAVED_AT,
    state: stateV1,
    pack: packV1,
    clips: [clipV1],
    liveClip: clipV1,
  };
}

describe("vjScreenRecordV1", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("upgrades a v1 record through both upgrade passes with savedAt as now", () => {
    const upgraded = upgradeVjScreenRecordV1(buildRecordV1());

    expect(upgraded?.version).toBe(2);
    expect(upgraded?.savedAt).toBe(SAVED_AT);
    expect(upgraded?.state).toEqual(
      upgradeVjStageFieldsV2(upgradeVjStageFieldsV1(stateV1, SAVED_AT)),
    );
    expect(upgraded?.state.activeSetlistId).toBeNull();
    expect(upgraded?.state.setlistIndex).toBeNull();
    expect(upgraded?.state.setlistPlayback).toEqual(
      createVjSetlistPlayback(false),
    );
    expect(upgraded?.state.tempo).toEqual({
      bpm: 128,
      downbeatAt: SAVED_AT,
      quantize: "off",
      source: "manual",
    });
    expect(upgraded?.state.liveSince).toBe(SAVED_AT);
    expect(upgraded?.state.transition).toEqual({
      mode: "fade",
      length: { unit: "ms", value: 1200 },
    });
    expect(upgraded?.state.overlay.position).toBe("bottom");
    expect(upgraded?.state.effects.settings).toEqual({
      mirror: { isOn: true, amount: 1, variant: "horizontal" },
      hueCycle: { isOn: true, amount: 0.5, variant: null },
    });
    expect(upgraded?.state.shuffle).toEqual({
      isOn: true,
      intervalKind: "beats",
      intervalValue: 16,
      source: "pack",
      excludedClipIds: [],
    });
  });

  it("fills every new clip field with its default and the pack event with null", () => {
    const upgraded = upgradeVjScreenRecordV1(buildRecordV1());
    const expectedClip = {
      ...clipV1,
      isFavorite: false,
      defaultSpeed: 1,
      loopInMs: null,
      loopOutMs: null,
      loopMode: "loop",
      previewUrl: null,
    };

    expect(upgraded?.clips).toEqual([expectedClip]);
    expect(upgraded?.liveClip).toEqual(expectedClip);
    expect(upgraded?.pack).toEqual({ ...packV1, event: null });
    expect(upgraded?.extraClips).toEqual([]);
    expect(upgraded?.eventCard).toBeNull();
    expect(upgraded?.clockOffsetMs).toBeNull();

    // Records saved before v1 added `liveClip` read it as none.
    const { liveClip: _omitted, ...olderRecord } = buildRecordV1();
    expect(upgradeVjScreenRecordV1(olderRecord)?.liveClip).toBeNull();
  });

  it("writes the upgrade to the v2 key and removes the v1 key", () => {
    localStorage.setItem(
      VJ_SCREEN_SNAPSHOT_V1_STORAGE_KEY,
      JSON.stringify(buildRecordV1()),
    );

    const restored = readVjScreenRecord();
    expect(restored?.version).toBe(2);
    // The reader keeps the strobe off whatever the v1 record held.
    expect(restored?.state.effects.isStrobing).toBe(false);
    expect(restored?.state.effects.strobeStartedAt).toBeNull();
    expect(localStorage.getItem(VJ_SCREEN_SNAPSHOT_V1_STORAGE_KEY)).toBeNull();

    const storedRecord = JSON.parse(
      localStorage.getItem(VJ_SCREEN_SNAPSHOT_STORAGE_KEY) ?? "null",
    ) as VjScreenRecord | null;
    expect(storedRecord).toEqual(restored);
    expect(readVjScreenRecord()).toEqual(restored);
  });

  it("answers null for an unreadable v1 record and removes it", () => {
    const record = buildRecordV1();
    const unreadableRecords: unknown[] = [
      { ...record, savedAt: "yesterday" },
      { ...record, state: "none" },
      {
        ...record,
        state: { ...stateV1, transition: { mode: "spin", fadeMs: 0 } },
      },
      { ...record, pack: { ...packV1, position: -1 } },
      { ...record, clips: [{ ...clipV1, mediaKind: "audio" }] },
      { ...record, liveClip: { id: "broken" } },
      null,
    ];
    for (const unreadableRecord of unreadableRecords) {
      expect(upgradeVjScreenRecordV1(unreadableRecord)).toBeNull();

      localStorage.setItem(
        VJ_SCREEN_SNAPSHOT_V1_STORAGE_KEY,
        JSON.stringify(unreadableRecord),
      );
      expect(readVjScreenRecord()).toBeNull();
      expect(
        localStorage.getItem(VJ_SCREEN_SNAPSHOT_V1_STORAGE_KEY),
      ).toBeNull();
      expect(localStorage.getItem(VJ_SCREEN_SNAPSHOT_STORAGE_KEY)).toBeNull();
    }
  });
});
