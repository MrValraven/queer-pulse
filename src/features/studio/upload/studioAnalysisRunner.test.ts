import { afterEach, describe, expect, it, vi } from "vitest";
import type { StudioAnalysisOutcome } from "./analysis/analyseStudioAudio";
import {
  ABORTED_RUN_GRACE_MS,
  ANALYSIS_TIMEOUT_FLOOR_MS,
  ANALYSIS_TIMEOUT_MS_PER_AUDIO_SECOND,
  analysisTimeoutMs,
  createAnalysisRunner,
} from "./studioAnalysisRunner";

function deferredJob(localId: string, durationSeconds: number | null = 60) {
  let resolve: (outcome: StudioAnalysisOutcome) => void = () => undefined;
  let seenSignal: AbortSignal | null = null;
  const run = vi.fn((signal: AbortSignal) => {
    seenSignal = signal;
    return new Promise<StudioAnalysisOutcome>((settle) => {
      resolve = settle;
    });
  });
  return {
    job: { localId, durationSeconds, run },
    resolve: (outcome: StudioAnalysisOutcome) => resolve(outcome),
    signal: () => seenSignal,
  };
}

const MEASURED_ANALYSIS = {
  waveformPeaks: [128],
  loudnessLufs: -14,
  peakDb: -1,
};

const flush = () => new Promise((settle) => setTimeout(settle, 0));

afterEach(() => {
  vi.useRealTimers();
});

describe("createAnalysisRunner", () => {
  it("runs one analysis at a time, in order", async () => {
    const runner = createAnalysisRunner();
    const first = deferredJob("a");
    const second = deferredJob("b");
    const settled = vi.fn();
    runner.enqueue(first.job, settled);
    runner.enqueue(second.job, settled);
    expect(first.job.run).toHaveBeenCalled();
    expect(second.job.run).not.toHaveBeenCalled();
    first.resolve({ status: "skipped" });
    await flush();
    expect(settled).toHaveBeenCalledWith({ status: "skipped" });
    expect(second.job.run).toHaveBeenCalled();
  });

  it("aborts a removed row's analysis and never reports it", async () => {
    const runner = createAnalysisRunner();
    const first = deferredJob("a");
    const second = deferredJob("b");
    const settled = vi.fn();
    runner.enqueue(first.job, settled);
    runner.enqueue(second.job, settled);
    runner.cancel("a");
    expect(first.signal()?.aborted).toBe(true);
    first.resolve({ status: "skipped" });
    await flush();
    expect(settled).not.toHaveBeenCalled();
    expect(second.job.run).toHaveBeenCalled();
  });

  it("drops a queued job that is cancelled before it starts", async () => {
    const runner = createAnalysisRunner();
    const first = deferredJob("a");
    const second = deferredJob("b");
    runner.enqueue(first.job, vi.fn());
    runner.enqueue(second.job, vi.fn());
    runner.cancel("b");
    first.resolve({ status: "failed" });
    await flush();
    expect(second.job.run).not.toHaveBeenCalled();
  });

  it("fails a file that passes its deadline and moves on", async () => {
    vi.useFakeTimers();
    const runner = createAnalysisRunner();
    const stuck = deferredJob("a", 10);
    const second = deferredJob("b");
    const settled = vi.fn();
    runner.enqueue(stuck.job, settled);
    runner.enqueue(second.job, vi.fn());
    const deadline = analysisTimeoutMs(10);
    await vi.advanceTimersByTimeAsync(deadline - 1);
    expect(settled).not.toHaveBeenCalled();
    expect(stuck.signal()?.aborted).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    expect(stuck.signal()?.aborted).toBe(true);
    expect(settled).toHaveBeenCalledWith({ status: "failed" });
    // The stuck run ignores its abort, so the queue waits out the grace.
    expect(second.job.run).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(ABORTED_RUN_GRACE_MS);
    expect(second.job.run).toHaveBeenCalled();
  });

  it("starts the next file only once a cancelled run has stopped", async () => {
    const runner = createAnalysisRunner();
    const first = deferredJob("a");
    const second = deferredJob("b");
    const settled = vi.fn();
    runner.enqueue(first.job, settled);
    runner.enqueue(second.job, vi.fn());
    runner.cancel("a");
    await flush();
    // An M4A decode on the main thread cannot be aborted: no overlap.
    expect(second.job.run).not.toHaveBeenCalled();
    first.resolve({ status: "skipped" });
    await flush();
    expect(second.job.run).toHaveBeenCalled();
    expect(settled).not.toHaveBeenCalled();
  });

  it("marks a job started only when its run begins", async () => {
    const runner = createAnalysisRunner();
    const first = deferredJob("a");
    const second = deferredJob("b");
    const firstStarted = vi.fn();
    const secondStarted = vi.fn();
    runner.enqueue({ ...first.job, onStart: firstStarted }, vi.fn());
    runner.enqueue({ ...second.job, onStart: secondStarted }, vi.fn());
    expect(firstStarted).toHaveBeenCalledTimes(1);
    expect(secondStarted).not.toHaveBeenCalled();
    first.resolve({ status: "measured", analysis: MEASURED_ANALYSIS });
    await flush();
    expect(secondStarted).toHaveBeenCalledTimes(1);
  });
});

describe("analysisTimeoutMs", () => {
  it("scales with the duration above a floor", () => {
    expect(analysisTimeoutMs(0)).toBe(ANALYSIS_TIMEOUT_FLOOR_MS);
    expect(analysisTimeoutMs(100)).toBe(
      ANALYSIS_TIMEOUT_FLOOR_MS + 100 * ANALYSIS_TIMEOUT_MS_PER_AUDIO_SECOND,
    );
    expect(analysisTimeoutMs(null)).toBeGreaterThan(analysisTimeoutMs(600));
  });
});
