import type { StudioAudioContentType } from "../api/studio.types";
import {
  M4A_WHOLE_DECODE_LIMIT_SECONDS,
  analyseStudioAudio,
  type StudioAnalysisOutcome,
} from "./analysis/analyseStudioAudio";
import { fileByteSource } from "./analysis/studioByteSource";
import { m4aDurationSeconds } from "./analysis/studioM4aDuration";

export type AnalysisRun = (
  signal: AbortSignal,
) => Promise<StudioAnalysisOutcome>;

export interface AnalysisJob {
  localId: string;
  /** Seconds of audio, known or estimated; scales the job's deadline. */
  durationSeconds: number | null;
  run: AnalysisRun;
  /** Called when the job leaves the queue and its run begins. */
  onStart?: () => void;
}

export interface AnalysisRunner {
  enqueue: (
    job: AnalysisJob,
    onSettled: (outcome: StudioAnalysisOutcome) => void,
  ) => void;
  /** Drops a queued job, or aborts the running one; neither reports. The
   *  next job still waits for an aborted run to stop (see below). */
  cancel: (localId: string) => void;
  dispose: () => void;
}

/** A worker that loads but never replies would hold the queue for ever, so
 *  each file gets a deadline: a floor for the worker to start and the first
 *  bytes to arrive, plus half a second per second of audio. Real runs take a
 *  small fraction of that, even on a slow phone. */
export const ANALYSIS_TIMEOUT_FLOOR_MS = 30_000;
export const ANALYSIS_TIMEOUT_MS_PER_AUDIO_SECOND = 500;

/** With no duration at all, a file is taken to be as long as the longest
 *  file Studio decodes whole. */
const UNKNOWN_DURATION_SECONDS = M4A_WHOLE_DECODE_LIMIT_SECONDS;

/** A picked file's length before it is read: its size at 32 kbps, the
 *  low end of spoken word. A file at a higher bitrate is shorter than this,
 *  which only lengthens its deadline; the deadline guards a hang, so too
 *  long is safe and too short would fail a real file. */
const ESTIMATE_BYTES_PER_SECOND = 32_000 / 8;

/** An M4A is decoded on the main thread by `decodeAudioData`, which cannot be
 *  aborted. After an abort the next file waits for that run to end, so a
 *  phone never decodes two files at once; a run that ignores its abort for
 *  longer than this stops holding the queue. */
export const ABORTED_RUN_GRACE_MS = 15_000;

export function analysisTimeoutMs(durationSeconds: number | null): number {
  const seconds =
    durationSeconds !== null && Number.isFinite(durationSeconds)
      ? Math.max(0, durationSeconds)
      : UNKNOWN_DURATION_SECONDS;
  return (
    ANALYSIS_TIMEOUT_FLOOR_MS + seconds * ANALYSIS_TIMEOUT_MS_PER_AUDIO_SECOND
  );
}

export function estimatedDurationSeconds(sizeBytes: number): number {
  return sizeBytes / ESTIMATE_BYTES_PER_SECOND;
}

/** Resolves once `run` settles, or after the grace period, whichever is
 *  first. */
function settledWithin(run: Promise<unknown>, graceMs: number): Promise<void> {
  return new Promise<void>((done) => {
    const graceTimer = setTimeout(done, graceMs);
    const finish = () => {
      clearTimeout(graceTimer);
      done();
    };
    run.then(finish, finish);
  });
}

export interface TimedAnalysis {
  /** The answer: the run's own, "failed" at the deadline or on a throw, and
   *  "skipped" at once on an abort from the caller. */
  outcome: Promise<StudioAnalysisOutcome>;
  /** Settles when the run itself has stopped (or its grace ran out). */
  finished: Promise<void>;
}

/** Runs one analysis under its deadline. A run that passes it is aborted. */
export function startTimedAnalysis(
  run: AnalysisRun,
  durationSeconds: number | null,
  signal: AbortSignal,
): TimedAnalysis {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  let stopOnAbort: (() => void) | undefined;
  let runPromise: Promise<unknown> = Promise.resolve();
  const outcome = new Promise<StudioAnalysisOutcome>((settle) => {
    const stop = (stopOutcome: StudioAnalysisOutcome) => {
      controller.abort();
      settle(stopOutcome);
    };
    if (signal.aborted) {
      stop({ status: "skipped" });
      return;
    }
    stopOnAbort = () => stop({ status: "skipped" });
    signal.addEventListener("abort", stopOnAbort, { once: true });
    timer = setTimeout(
      () => stop({ status: "failed" }),
      analysisTimeoutMs(durationSeconds),
    );
    try {
      const started = run(controller.signal);
      runPromise = started;
      void started.then(settle, () => settle({ status: "failed" }));
    } catch {
      settle({ status: "failed" });
    }
  }).finally(() => {
    clearTimeout(timer);
    if (stopOnAbort) signal.removeEventListener("abort", stopOnAbort);
  });
  const finished = outcome.then(() =>
    settledWithin(runPromise, ABORTED_RUN_GRACE_MS),
  );
  return { outcome, finished };
}

/** The answer alone, for a caller that runs one file at a time itself. */
export function runWithAnalysisTimeout(
  run: AnalysisRun,
  durationSeconds: number | null,
  signal: AbortSignal,
): Promise<StudioAnalysisOutcome> {
  return startTimedAnalysis(run, durationSeconds, signal).outcome;
}

/** One analysis at a time across the upload list (Review Focus 4). */
export function createAnalysisRunner(): AnalysisRunner {
  const queue: {
    job: AnalysisJob;
    onSettled: (outcome: StudioAnalysisOutcome) => void;
  }[] = [];
  let activeJob: { localId: string; controller: AbortController } | null = null;
  let isDisposed = false;

  function pump() {
    if (activeJob || isDisposed) return;
    const nextEntry = queue.shift();
    if (!nextEntry) return;
    const controller = new AbortController();
    activeJob = { localId: nextEntry.job.localId, controller };
    nextEntry.job.onStart?.();
    const timed = startTimedAnalysis(
      nextEntry.job.run,
      nextEntry.job.durationSeconds,
      controller.signal,
    );
    void timed.outcome.then((outcome) => {
      if (!controller.signal.aborted && !isDisposed)
        nextEntry.onSettled(outcome);
    });
    // The next file starts only once this run has really stopped.
    void timed.finished.then(() => {
      activeJob = null;
      pump();
    });
  }

  return {
    enqueue(job, onSettled) {
      queue.push({ job, onSettled });
      pump();
    },
    cancel(localId) {
      const index = queue.findIndex((entry) => entry.job.localId === localId);
      if (index >= 0) queue.splice(index, 1);
      if (activeJob?.localId === localId) activeJob.controller.abort();
    },
    dispose() {
      isDisposed = true;
      queue.length = 0;
      activeJob?.controller.abort();
    },
  };
}

/** A phone decodes an M4A whole only up to 8 minutes (about 180 MB of PCM). */
const COARSE_POINTER_DECODE_LIMIT_SECONDS = 8 * 60;

export function wholeDecodeLimitSeconds(): number {
  return window.matchMedia("(pointer: coarse)").matches
    ? COARSE_POINTER_DECODE_LIMIT_SECONDS
    : M4A_WHOLE_DECODE_LIMIT_SECONDS;
}

/** Measures a file the person just picked. */
export async function analyseUploadFile(
  file: File,
  contentType: StudioAudioContentType,
  signal: AbortSignal,
): Promise<StudioAnalysisOutcome> {
  const source = fileByteSource(file);
  if (contentType === "audio/mpeg")
    return analyseStudioAudio({
      source,
      kind: "mp3",
      durationSeconds: null,
      signal,
    });
  const durationSeconds = await m4aDurationSeconds(source).catch(() => null);
  return analyseStudioAudio({
    source,
    kind: "m4a",
    durationSeconds,
    signal,
    wholeDecodeLimitSeconds: wholeDecodeLimitSeconds(),
  });
}
