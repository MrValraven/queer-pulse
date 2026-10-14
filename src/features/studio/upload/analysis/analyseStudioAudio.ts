import type { StudioAudioAnalysis } from "./studioAnalysisAccumulator";
import type {
  AnalysisRequest,
  AnalysisResponse,
} from "./studioAnalysisProtocol";
import {
  decodeAudioBytes,
  type DecodeAudio,
  type DecodedAudio,
} from "./studioAudioDecode";
import type { StudioByteSource } from "./studioByteSource";
import { mp3Slices } from "./studioMp3Slices";

export type { DecodeAudio } from "./studioAudioDecode";
export type StudioAudioKind = "mp3" | "m4a";
export type StudioAnalysisOutcome =
  | { status: "measured"; analysis: StudioAudioAnalysis }
  | { status: "skipped" }
  | { status: "failed" };

export interface AnalysisWorkerPort {
  postMessage: (message: AnalysisRequest, transfer?: Transferable[]) => void;
  addEventListener: {
    (
      type: "message",
      listener: (event: MessageEvent<AnalysisResponse>) => void,
    ): void;
    /** A script that fails to load (CSP, a 404 after a deploy, a module
     *  error) or a worker that crashes reports through these events. */
    (type: "error" | "messageerror", listener: (event: Event) => void): void;
  };
  terminate: () => void;
}

/** Spec 8.1: an M4A is decoded whole, so only up to 20 minutes. */
export const M4A_WHOLE_DECODE_LIMIT_SECONDS = 20 * 60;
const M4A_DECODE_SAMPLE_RATE = 48000;

export function createAnalysisWorker(): AnalysisWorkerPort {
  return new Worker(
    new URL("./studioAudioAnalysis.worker.ts", import.meta.url),
    {
      type: "module",
    },
  ) as unknown as AnalysisWorkerPort;
}

export interface AnalyseStudioAudioOptions {
  source: StudioByteSource;
  kind: StudioAudioKind;
  /** Needed for M4A (whole-decode limit); MP3 ignores it. */
  durationSeconds: number | null;
  signal: AbortSignal;
  wholeDecodeLimitSeconds?: number;
  decode?: DecodeAudio;
  createWorker?: () => AnalysisWorkerPort;
  sliceBytes?: number;
  lookaheadBytes?: number;
}

async function* decodedChunks(
  options: AnalyseStudioAudioOptions,
  decode: DecodeAudio,
): AsyncGenerator<DecodedAudio> {
  if (options.kind === "m4a") {
    const bytes = await options.source.read(0, options.source.size);
    yield await decode(bytes, M4A_DECODE_SAMPLE_RATE);
    return;
  }
  for await (const slice of mp3Slices(options.source, {
    sliceBytes: options.sliceBytes,
    lookaheadBytes: options.lookaheadBytes,
    signal: options.signal,
  }))
    yield await decode(slice.bytes, slice.header.sampleRate);
}

/** One measurement through one worker. `finish` rejects on a worker error
 *  or on abort, so an aborted run never waits on a terminated worker. After
 *  a worker failure `push` throws, so the slice loop stops at once. */
function createWorkerSession(worker: AnalysisWorkerPort, signal: AbortSignal) {
  let format: { sampleRate: number; channelCount: number } | null = null;
  let failure: Error | null = null;
  let resolveResult: (analysis: StudioAudioAnalysis | null) => void = () =>
    undefined;
  let rejectResult: (error: Error) => void = () => undefined;
  const result = new Promise<StudioAudioAnalysis | null>((resolve, reject) => {
    resolveResult = resolve;
    rejectResult = reject;
  });
  // Marked handled now; `finish` awaits the same promise later.
  result.catch(() => undefined);
  const fail = (error: Error) => {
    failure ??= error;
    rejectResult(failure);
  };
  const failWorker = () => fail(new Error("Analysis worker failed"));
  const failOnAbort = () => fail(new Error("Analysis aborted"));
  worker.addEventListener("message", (event) => {
    if (event.data.type === "error") fail(new Error(event.data.message));
    else resolveResult(event.data.analysis);
  });
  worker.addEventListener("error", failWorker);
  worker.addEventListener("messageerror", failWorker);
  signal.addEventListener("abort", failOnAbort, { once: true });
  return {
    push(decoded: DecodedAudio) {
      if (failure) throw failure;
      if (!format) {
        format = {
          sampleRate: decoded.sampleRate,
          channelCount: decoded.channels.length,
        };
        worker.postMessage({ type: "start", ...format });
      }
      if (
        decoded.sampleRate !== format.sampleRate ||
        decoded.channels.length !== format.channelCount
      )
        throw new Error("Decoded chunks disagree on their format");
      worker.postMessage(
        { type: "chunk", channels: decoded.channels },
        decoded.channels.map((channel) => channel.buffer as ArrayBuffer),
      );
    },
    finish() {
      if (failure) return Promise.reject(failure);
      if (!format) return Promise.resolve(null);
      worker.postMessage({ type: "finish" });
      return result;
    },
    dispose() {
      signal.removeEventListener("abort", failOnAbort);
    },
  };
}

/** Measures one file: loudness, peak and 200 waveform peaks (spec 8.1).
 *  Never throws; a skip and an abort both answer "skipped". */
export async function analyseStudioAudio(
  options: AnalyseStudioAudioOptions,
): Promise<StudioAnalysisOutcome> {
  const limit =
    options.wholeDecodeLimitSeconds ?? M4A_WHOLE_DECODE_LIMIT_SECONDS;
  if (
    options.kind === "m4a" &&
    (options.durationSeconds === null || options.durationSeconds > limit)
  )
    return { status: "skipped" };
  if (options.signal.aborted) return { status: "skipped" };
  const worker = (options.createWorker ?? createAnalysisWorker)();
  const terminate = () => worker.terminate();
  options.signal.addEventListener("abort", terminate, { once: true });
  const session = createWorkerSession(worker, options.signal);
  try {
    for await (const decoded of decodedChunks(
      options,
      options.decode ?? decodeAudioBytes,
    )) {
      options.signal.throwIfAborted();
      session.push(decoded);
    }
    options.signal.throwIfAborted();
    const analysis = await session.finish();
    return analysis ? { status: "measured", analysis } : { status: "failed" };
  } catch {
    return options.signal.aborted
      ? { status: "skipped" }
      : { status: "failed" };
  } finally {
    options.signal.removeEventListener("abort", terminate);
    session.dispose();
    worker.terminate();
  }
}
