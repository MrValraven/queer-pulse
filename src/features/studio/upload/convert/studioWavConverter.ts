import { fileByteSource } from "../analysis/studioByteSource";
import { maxMinutesAt128, mp3BitrateFor } from "./studioMp3Bitrate";
import {
  readPcmHeader,
  type PcmHeader,
  type PcmHeaderResult,
} from "./studioPcmHeader";
import type {
  WavConversionRequest,
  WavConversionResponse,
} from "./studioWavConversionProtocol";

export type ConvertFailureReason = "tooLong" | "unsupported" | "failed";

export type ConvertResult =
  /** `bitrate` is in kbps. */
  | { ok: true; file: File; bitrate: number }
  | { ok: false; reason: ConvertFailureReason; maxMinutes?: number };

export interface ConvertOptions {
  /** 0 to 1. Called with 0 the moment the job leaves the queue. */
  onProgress: (progress: number) => void;
  /** Aborting drops a queued job or stops a running one; nothing settles. */
  signal: AbortSignal;
}

export interface WavConversionWorkerPort {
  postMessage: (message: WavConversionRequest) => void;
  addEventListener: {
    (
      type: "message",
      listener: (event: MessageEvent<WavConversionResponse>) => void,
    ): void;
    /** A worker that cannot load (CSP, a 404 after a deploy, a module error)
     *  or crashes reports through these events. */
    (type: "error" | "messageerror", listener: (event: Event) => void): void;
  };
  terminate: () => void;
}

export interface WavConverterDependencies {
  createWorker?: () => WavConversionWorkerPort;
  readHeader?: (file: File) => Promise<PcmHeaderResult>;
}

/** A worker that loads but never answers would hold the queue for ever, so
 *  each file gets a deadline: a floor for the worker and the encoder to load,
 *  plus time per minute of audio. */
export const CONVERSION_TIMEOUT_FLOOR_MS = 30_000;
export const CONVERSION_TIMEOUT_MS_PER_AUDIO_MINUTE = 30_000;

export function conversionTimeoutMs(durationSeconds: number): number {
  return (
    CONVERSION_TIMEOUT_FLOOR_MS +
    (Math.max(0, durationSeconds) / 60) * CONVERSION_TIMEOUT_MS_PER_AUDIO_MINUTE
  );
}

const CONVERTIBLE_EXTENSIONS: ReadonlySet<string> = new Set([
  "wav",
  "wave",
  "aif",
  "aiff",
  "aifc",
]);
const CONVERTIBLE_TYPES: ReadonlySet<string> = new Set([
  "audio/wav",
  "audio/x-wav",
  "audio/wave",
  "audio/vnd.wave",
  "audio/aiff",
  "audio/x-aiff",
]);

/** A synchronous first guess from the name and the type, so validation stays
 *  synchronous. The header read confirms it. */
export function isConvertibleAudio(file: File): boolean {
  const extension = /\.([^.]+)$/.exec(file.name)?.[1]?.toLowerCase() ?? "";
  return (
    CONVERTIBLE_EXTENSIONS.has(extension) || CONVERTIBLE_TYPES.has(file.type)
  );
}

export function createWavConversionWorker(): WavConversionWorkerPort {
  return new Worker(
    new URL("./studioWavConversion.worker.ts", import.meta.url),
    {
      type: "module",
    },
  );
}

const readHeaderOf = (file: File) => readPcmHeader(fileByteSource(file));
const neverSettles = () => new Promise<ConvertResult>(() => undefined);
const mp3NameOf = (fileName: string) =>
  `${fileName.replace(/\.[^.]+$/, "") || "audio"}.mp3`;

interface ConversionJob {
  file: File;
  header: PcmHeader;
  bitrateKbps: number;
  maxBytes: number;
  options: ConvertOptions;
  settle: (result: ConvertResult) => void;
}

function resultOf(job: ConversionJob, buffer: ArrayBuffer): ConvertResult {
  if (buffer.byteLength === 0) return { ok: false, reason: "failed" };
  if (buffer.byteLength > job.maxBytes)
    return {
      ok: false,
      reason: "tooLong",
      maxMinutes: maxMinutesAt128(job.maxBytes),
    };
  return {
    ok: true,
    file: new File([buffer], mp3NameOf(job.file.name), { type: "audio/mpeg" }),
    bitrate: job.bitrateKbps,
  };
}

/** Runs one job in its own worker. `onFinished` frees the queue exactly once,
 *  whether the job finished, failed, hit its deadline or was aborted. */
function runJob(
  job: ConversionJob,
  createWorker: () => WavConversionWorkerPort,
  onFinished: () => void,
) {
  const { signal, onProgress } = job.options;
  let worker: WavConversionWorkerPort | null = null;
  const timers: { deadline?: ReturnType<typeof setTimeout> } = {};
  let isFinished = false;
  const finish = (result: ConvertResult | null) => {
    if (isFinished) return;
    isFinished = true;
    clearTimeout(timers.deadline);
    signal.removeEventListener("abort", stopOnAbort);
    worker?.terminate();
    if (result) job.settle(result);
    onFinished();
  };
  const stopOnAbort = () => finish(null);
  const fail = () => finish({ ok: false, reason: "failed" });
  if (signal.aborted) {
    finish(null);
    return;
  }
  signal.addEventListener("abort", stopOnAbort, { once: true });
  try {
    worker = createWorker();
  } catch {
    fail();
    return;
  }
  timers.deadline = setTimeout(
    fail,
    conversionTimeoutMs(job.header.durationSeconds),
  );
  worker.addEventListener("message", (event) => {
    const response = event.data;
    if (response.type === "progress") onProgress(response.progress);
    else if (response.type === "error") fail();
    else finish(resultOf(job, response.buffer));
  });
  worker.addEventListener("error", fail);
  worker.addEventListener("messageerror", fail);
  try {
    onProgress(0);
    worker.postMessage({
      type: "convert",
      file: job.file,
      header: job.header,
      bitrateKbps: job.bitrateKbps,
    });
  } catch {
    fail();
  }
}

/** One conversion at a time across the tab. `tooLong` and `unsupported`
 *  come back from the header alone, before any worker starts. */
export function createWavConverter(
  dependencies: WavConverterDependencies = {},
) {
  const createWorker = dependencies.createWorker ?? createWavConversionWorker;
  const readHeader = dependencies.readHeader ?? readHeaderOf;
  const queue: ConversionJob[] = [];
  let isBusy = false;

  function pump() {
    if (isBusy) return;
    const next = queue.shift();
    if (!next) return;
    isBusy = true;
    runJob(next, createWorker, () => {
      isBusy = false;
      pump();
    });
  }

  async function convert(
    file: File,
    maxBytes: number,
    options: ConvertOptions,
  ): Promise<ConvertResult> {
    const parsed = await readHeader(file).catch(() => null);
    if (options.signal.aborted) return neverSettles();
    if (!parsed?.ok) return { ok: false, reason: "unsupported" };
    const bitrateKbps = mp3BitrateFor(parsed.header.durationSeconds, maxBytes);
    if (bitrateKbps === null)
      return {
        ok: false,
        reason: "tooLong",
        maxMinutes: maxMinutesAt128(maxBytes),
      };
    return new Promise<ConvertResult>((settle) => {
      const job: ConversionJob = {
        file,
        header: parsed.header,
        bitrateKbps,
        maxBytes,
        options,
        settle,
      };
      options.signal.addEventListener(
        "abort",
        () => {
          const index = queue.indexOf(job);
          if (index >= 0) queue.splice(index, 1);
        },
        { once: true },
      );
      queue.push(job);
      pump();
    });
  }

  return { convert };
}

const tabConverter = createWavConverter();

/** WAV or AIFF to MP3 under `maxBytes`, in a worker, one file at a time. */
export function convertToMp3(
  file: File,
  maxBytes: number,
  options: ConvertOptions,
): Promise<ConvertResult> {
  return tabConverter.convert(file, maxBytes, options);
}
