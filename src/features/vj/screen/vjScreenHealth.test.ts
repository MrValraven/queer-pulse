import { describe, expect, it } from "vitest";
import type {
  VjClipDTO,
  VjScreenClipStatus,
} from "../../../shared/contracts/vj";
import {
  vjCacheBytesOf,
  vjScreenHealthOf,
  vjWireMicReportOf,
  type VjScreenHealthInput,
} from "./vjScreenHealth";

const CLIP_GRID = "11111111-1111-4111-8111-111111111111";
const CLIP_HAZE = "22222222-2222-4222-8222-222222222222";
const CLIP_EXTRA = "33333333-3333-4333-8333-333333333333";
const SERVER_NOW = Date.parse("2026-11-06T22:00:00.000Z");

function clipOf(clipId: string, byteSize: number): VjClipDTO {
  return {
    id: clipId,
    title: "Loop",
    mediaKind: "video",
    mimeType: "video/mp4",
    byteSize,
    width: 1920,
    height: 1080,
    durationMs: 8000,
    fitMode: "fill",
    thumbnailUrl: `/files/thumb/${clipId}`,
    mediaUrl: `/files/media/${clipId}`,
    packIds: [],
    packCount: 0,
    createdBy: null,
    createdAt: "2026-11-05T10:00:00.000Z",
    updatedAt: "2026-11-05T10:00:00.000Z",
    isFavorite: false,
    defaultSpeed: 1,
    loopInMs: null,
    loopOutMs: null,
    loopMode: "loop",
    previewUrl: null,
  };
}

function statusOf(
  clipId: string,
  state: VjScreenClipStatus["state"],
): VjScreenClipStatus {
  return {
    clipId,
    state,
    progress: state === "ready" ? 1 : 0.4,
    failure: state === "failed" ? "network" : null,
  };
}

function inputWith(patch: Partial<VjScreenHealthInput>): VjScreenHealthInput {
  return {
    renderer: "webgl2",
    frames: { fps: 59.94, droppedFrames: 2 },
    isEffectLoadHigh: false,
    clips: [],
    statuses: [],
    ...patch,
  };
}

describe("vjCacheBytesOf", () => {
  it("sums the bytes of ready clips only", () => {
    const clips = [
      clipOf(CLIP_GRID, 1_000),
      clipOf(CLIP_HAZE, 20_000),
      clipOf(CLIP_EXTRA, 300),
    ];
    const statuses = [
      statusOf(CLIP_GRID, "ready"),
      statusOf(CLIP_HAZE, "loading"),
      statusOf(CLIP_EXTRA, "ready"),
    ];

    expect(vjCacheBytesOf(clips, statuses)).toBe(1_300);
  });

  it("counts a clip listed twice once", () => {
    const clips = [clipOf(CLIP_GRID, 1_000), clipOf(CLIP_GRID, 1_000)];

    expect(vjCacheBytesOf(clips, [statusOf(CLIP_GRID, "ready")])).toBe(1_000);
  });
});

describe("vjScreenHealthOf", () => {
  it("rounds fps to one decimal and clamps it", () => {
    expect(vjScreenHealthOf(inputWith({})).fps).toBe(59.9);
    expect(
      vjScreenHealthOf(inputWith({ frames: { fps: 512.4, droppedFrames: 0 } }))
        .fps,
    ).toBe(240);
    expect(
      vjScreenHealthOf(inputWith({ frames: { fps: -3, droppedFrames: 0 } }))
        .fps,
    ).toBe(0);
    expect(
      vjScreenHealthOf(
        inputWith({ frames: { fps: Number.NaN, droppedFrames: 0 } }),
      ).fps,
    ).toBe(0);
  });

  it("keeps dropped frames a whole number inside the server's range", () => {
    expect(
      vjScreenHealthOf(inputWith({ frames: { fps: 30, droppedFrames: 2.6 } }))
        .droppedFrames,
    ).toBe(3);
    expect(
      vjScreenHealthOf(
        inputWith({ frames: { fps: 30, droppedFrames: 5_000_000 } }),
      ).droppedFrames,
    ).toBe(1_000_000);
  });

  it("reads zero fps and zero drops before the first frame", () => {
    const health = vjScreenHealthOf(inputWith({ frames: null }));

    expect(health.fps).toBe(0);
    expect(health.droppedFrames).toBe(0);
  });

  it("carries the renderer kind", () => {
    const health = vjScreenHealthOf(
      inputWith({
        renderer: "dom",
        isEffectLoadHigh: true,
        clips: [clipOf(CLIP_GRID, 4_096)],
        statuses: [statusOf(CLIP_GRID, "ready")],
      }),
    );

    expect(health).toEqual({
      renderer: "dom",
      fps: 59.9,
      droppedFrames: 2,
      cacheBytes: 4_096,
      isEffectLoadHigh: true,
    });
  });
});

describe("vjWireMicReportOf", () => {
  it("rounds the level to two decimals and the beat to a whole ms", () => {
    const report = vjWireMicReportOf(
      { level: 0.4567, bpm: 124, confidence: 0.8, beatAt: SERVER_NOW - 120.6 },
      SERVER_NOW,
    );

    expect(report).toEqual({
      level: 0.46,
      bpm: 124,
      confidence: 0.8,
      beatAt: SERVER_NOW - 121,
    });
  });

  it("sends a beat far from the server clock as null", () => {
    const report = vjWireMicReportOf(
      { level: 0.5, bpm: 124, confidence: 0.8, beatAt: SERVER_NOW - 6_000 },
      SERVER_NOW,
    );

    expect(report.beatAt).toBeNull();
    expect(report.bpm).toBe(124);
  });

  it("sends a tempo outside the limits as null and clamps the level", () => {
    const report = vjWireMicReportOf(
      { level: 1.7, bpm: 260, confidence: 1.2, beatAt: null },
      SERVER_NOW,
    );

    expect(report).toEqual({
      level: 1,
      bpm: null,
      confidence: 1,
      beatAt: null,
    });
  });
});
