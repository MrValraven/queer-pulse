import { describe, expect, it } from "vitest";
import type {
  VjScreenHealth,
  VjScreenStatus,
} from "../../../../../shared/contracts/vj";
import { vjScreenHealthLines } from "./vjScreenHealth";

const HEALTHY: VjScreenHealth = {
  renderer: "webgl2",
  fps: 59.6,
  droppedFrames: 3,
  cacheBytes: 52_428_800,
  isEffectLoadHigh: false,
};

function createScreen(overrides: Partial<VjScreenStatus> = {}): VjScreenStatus {
  return {
    screenId: "d0000000-0000-4000-8000-000000000001",
    number: 1,
    isConnected: true,
    isLead: true,
    isFullscreen: true,
    connectedAt: 1_000,
    lastSeenAt: 2_000,
    preload: { packId: null, clips: [] },
    health: HEALTHY,
    nextClipId: null,
    mic: null,
    ...overrides,
  };
}

const formatBytes = (bytes: number) => `${bytes} B`;

describe("vjScreenHealthLines", () => {
  it("names the effects engine and fps", () => {
    const lines = vjScreenHealthLines(createScreen(), formatBytes);
    expect(lines.map((line) => line.key)).toEqual([
      "vj:screensSheet.rendererWebgl",
      "vj:screensSheet.fps",
      "vj:screensSheet.dropped",
      "vj:screensSheet.cache",
    ]);
    expect(lines[1]).toMatchObject({
      values: { fps: 60 },
      rolling: { token: "fps", numericValue: 60 },
    });
    expect(lines[2]?.values).toEqual({ count: 3 });
    expect(lines[3]?.values).toEqual({ size: "52428800 B" });
    expect(lines.every((line) => line.tone === "plain")).toBe(true);
  });

  it("names the simple renderer", () => {
    const lines = vjScreenHealthLines(
      createScreen({ health: { ...HEALTHY, renderer: "dom" } }),
      formatBytes,
    );
    expect(lines[0]?.key).toBe("vj:screensSheet.rendererDom");
  });

  it("warns on a high effect load", () => {
    const lines = vjScreenHealthLines(
      createScreen({ health: { ...HEALTHY, isEffectLoadHigh: true } }),
      formatBytes,
    );
    const warning = lines.find(
      (line) => line.key === "vj:screensSheet.loadWarning",
    );
    expect(warning?.tone).toBe("warning");
  });

  it("reports unknown health", () => {
    const lines = vjScreenHealthLines(
      createScreen({
        health: null,
        mic: { level: 0.42, detectedBpm: null, confidence: 0 },
      }),
      formatBytes,
    );
    expect(lines.map((line) => line.key)).toEqual([
      "vj:screensSheet.healthUnknown",
      "vj:screensSheet.micOn",
    ]);
    expect(lines[1]?.values).toEqual({ percent: 42 });
  });
});
