import { describe, expect, it, vi } from "vitest";
import {
  analyseStudioAudio,
  type AnalysisWorkerPort,
  type DecodeAudio,
} from "./analyseStudioAudio";
import type {
  AnalysisRequest,
  AnalysisResponse,
} from "./studioAnalysisProtocol";
import { createAnalysisWorkerHandler } from "./studioAnalysisWorkerHandler";
import { sineChannel } from "./studioAnalysisTestSignals";
import { memorySource, mp3Bytes } from "./studioMp3TestFrames";

type WorkerEventType = "message" | "error" | "messageerror";

/** Runs the real handler in-process and records every post. `answers`
 *  false gives a worker that takes every post and never replies. */
function inProcessWorker(options: { answers?: boolean } = {}) {
  const listeners: {
    type: WorkerEventType;
    listener: (event: Event) => void;
  }[] = [];
  const emit = (type: WorkerEventType, event: Event) =>
    listeners
      .filter((entry) => entry.type === type)
      .forEach((entry) => entry.listener(event));
  const posts: {
    message: AnalysisRequest;
    transfer: Transferable[] | undefined;
  }[] = [];
  const handle = createAnalysisWorkerHandler((response) =>
    queueMicrotask(() =>
      emit("message", { data: response } as MessageEvent<AnalysisResponse>),
    ),
  );
  const terminate = vi.fn();
  const worker = {
    postMessage: (message: AnalysisRequest, transfer?: Transferable[]) => {
      posts.push({ message, transfer });
      if (options.answers !== false) handle(message);
    },
    addEventListener: (
      type: WorkerEventType,
      listener: (event: Event) => void,
    ) => listeners.push({ type, listener }),
    terminate,
  } as unknown as AnalysisWorkerPort;
  const emitError = () => emit("error", new Event("error"));
  return { worker, posts, terminate, emitError };
}

const halfSecondTone = () =>
  sineChannel({
    frequency: 997,
    amplitudeDbfs: -23,
    seconds: 0.5,
    sampleRate: 44100,
  });

describe("analyseStudioAudio", () => {
  it("decodes one slice at a time and transfers each chunk", async () => {
    const { source } = memorySource(mp3Bytes(60));
    const { worker, posts } = inProcessWorker();
    let active = 0;
    let mostActive = 0;
    const decode: DecodeAudio = vi.fn(
      async (bytes: ArrayBuffer, sampleRate: number) => {
        active += 1;
        mostActive = Math.max(mostActive, active);
        expect(bytes.byteLength).toBeLessThanOrEqual(4000 + 1000);
        expect(sampleRate).toBe(44100);
        await Promise.resolve();
        active -= 1;
        return { sampleRate, channels: [halfSecondTone(), halfSecondTone()] };
      },
    );
    const outcome = await analyseStudioAudio({
      source,
      kind: "mp3",
      durationSeconds: null,
      signal: new AbortController().signal,
      decode,
      createWorker: () => worker,
      sliceBytes: 4000,
      lookaheadBytes: 1000,
    });
    expect(mostActive).toBe(1);
    expect(vi.mocked(decode).mock.calls.length).toBeGreaterThan(3);
    const chunkPosts = posts.filter((post) => post.message.type === "chunk");
    expect(chunkPosts.every((post) => post.transfer?.length === 2)).toBe(true);
    // Each fake chunk restarts the sine at phase 0, so allow a few tenths.
    expect(outcome.status).toBe("measured");
    if (outcome.status === "measured")
      expect(Math.abs(outcome.analysis.loudnessLufs + 23)).toBeLessThan(0.4);
  });

  it("skips an M4A longer than the whole-decode limit without reading it", async () => {
    const { source, reads } = memorySource(new Uint8Array(100));
    const createWorker = vi.fn();
    const outcome = await analyseStudioAudio({
      source,
      kind: "m4a",
      durationSeconds: 1500,
      signal: new AbortController().signal,
      createWorker,
    });
    expect(outcome).toEqual({ status: "skipped" });
    expect(reads).toEqual([]);
    expect(createWorker).not.toHaveBeenCalled();
  });

  it("stops and terminates the worker when aborted", async () => {
    const controller = new AbortController();
    const { source } = memorySource(mp3Bytes(60));
    const { worker, terminate } = inProcessWorker();
    const decode: DecodeAudio = vi.fn(
      (_bytes: ArrayBuffer, sampleRate: number) => {
        controller.abort();
        return Promise.resolve({ sampleRate, channels: [halfSecondTone()] });
      },
    );
    const outcome = await analyseStudioAudio({
      source,
      kind: "mp3",
      durationSeconds: null,
      signal: controller.signal,
      decode,
      createWorker: () => worker,
      sliceBytes: 4000,
      lookaheadBytes: 1000,
    });
    expect(outcome).toEqual({ status: "skipped" });
    expect(vi.mocked(decode)).toHaveBeenCalledTimes(1);
    expect(terminate).toHaveBeenCalled();
  });

  it("reports a decode failure as failed", async () => {
    const { source } = memorySource(mp3Bytes(10));
    const { worker, terminate } = inProcessWorker();
    const outcome = await analyseStudioAudio({
      source,
      kind: "mp3",
      durationSeconds: null,
      signal: new AbortController().signal,
      decode: () => Promise.reject(new Error("EncodingError")),
      createWorker: () => worker,
    });
    expect(outcome).toEqual({ status: "failed" });
    expect(terminate).toHaveBeenCalled();
  });

  it("fails at once when the worker fails to load", async () => {
    const { source } = memorySource(mp3Bytes(60));
    const { worker, posts, terminate, emitError } = inProcessWorker();
    const decode: DecodeAudio = vi.fn(
      (_bytes: ArrayBuffer, sampleRate: number) => {
        emitError();
        return Promise.resolve({
          sampleRate,
          channels: [halfSecondTone(), halfSecondTone()],
        });
      },
    );
    const outcome = await analyseStudioAudio({
      source,
      kind: "mp3",
      durationSeconds: null,
      signal: new AbortController().signal,
      decode,
      createWorker: () => worker,
      sliceBytes: 4000,
      lookaheadBytes: 1000,
    });
    expect(outcome).toEqual({ status: "failed" });
    expect(vi.mocked(decode)).toHaveBeenCalledTimes(1);
    expect(posts.filter((post) => post.message.type === "chunk")).toEqual([]);
    expect(terminate).toHaveBeenCalled();
  });

  it("answers skipped when aborted while the worker never replies", async () => {
    const controller = new AbortController();
    const { source } = memorySource(mp3Bytes(10));
    const { worker, posts, terminate } = inProcessWorker({ answers: false });
    const abortAfterFinish: AnalysisWorkerPort = {
      ...worker,
      postMessage: (message, transfer) => {
        worker.postMessage(message, transfer);
        if (message.type === "finish") setTimeout(() => controller.abort(), 0);
      },
    };
    const outcome = await analyseStudioAudio({
      source,
      kind: "mp3",
      durationSeconds: null,
      signal: controller.signal,
      decode: (_bytes, sampleRate) =>
        Promise.resolve({ sampleRate, channels: [halfSecondTone()] }),
      createWorker: () => abortAfterFinish,
    });
    expect(posts.at(-1)?.message).toEqual({ type: "finish" });
    expect(outcome).toEqual({ status: "skipped" });
    expect(terminate).toHaveBeenCalled();
  });
});
