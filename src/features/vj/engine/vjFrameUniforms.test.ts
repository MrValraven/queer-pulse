import { describe, expect, it } from "vitest";
import type { VjTempo } from "../../../shared/contracts/vj";
import {
  createVjFrameUniformValues,
  writeVjFrameUniforms,
} from "./vjFrameUniforms";

const TEMPO_120: VjTempo = {
  bpm: 120,
  downbeatAt: 0,
  quantize: "off",
  source: "manual",
};

describe("writeVjFrameUniforms", () => {
  it("fills one reused beat position on every write", () => {
    const values = createVjFrameUniformValues();
    const beatPosition = values.beatPosition;
    const frame = {
      engineTimeMs: 0,
      speed: 1 as const,
      tempo: TEMPO_120,
      micLevel: null,
      width: 1,
      height: 1,
    };
    writeVjFrameUniforms(values, { ...frame, serverNowMs: 1250 });
    expect(values.beatPosition).toBe(beatPosition);
    expect(beatPosition.beatIndex).toBe(2);
    expect(beatPosition.phase).toBeCloseTo(0.5);

    writeVjFrameUniforms(values, { ...frame, serverNowMs: 2100 });
    expect(values.beatPosition).toBe(beatPosition);
    expect(values.beatIndex).toBe(4);
    expect(beatPosition.beatInBar).toBe(0);
    expect(values.uBarPhase).toBeCloseTo(0.2 / 4);
  });
});
