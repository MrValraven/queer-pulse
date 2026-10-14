import { describe, expect, it, vi } from "vitest";
import { createAnalysisWorkerHandler } from "./studioAnalysisWorkerHandler";
import { sineChannel } from "./studioAnalysisTestSignals";

describe("createAnalysisWorkerHandler", () => {
  it("answers one result after start, chunks and finish", () => {
    const reply = vi.fn();
    const handle = createAnalysisWorkerHandler(reply);
    const tone = sineChannel({
      frequency: 997,
      amplitudeDbfs: -23,
      seconds: 5,
      sampleRate: 48000,
    });
    handle({ type: "start", sampleRate: 48000, channelCount: 2 });
    handle({
      type: "chunk",
      channels: [tone.slice(0, 100000), tone.slice(0, 100000)],
    });
    handle({
      type: "chunk",
      channels: [tone.slice(100000), tone.slice(100000)],
    });
    expect(reply).not.toHaveBeenCalled();
    handle({ type: "finish" });
    expect(reply).toHaveBeenCalledWith({
      type: "result",
      analysis: expect.objectContaining({ loudnessLufs: -23, peakDb: -22.5 }),
    });
  });

  it("answers an error for a chunk before start", () => {
    const reply = vi.fn();
    createAnalysisWorkerHandler(reply)({
      type: "chunk",
      channels: [new Float32Array(4)],
    });
    expect(reply).toHaveBeenCalledWith({
      type: "error",
      message: expect.any(String),
    });
  });
});
