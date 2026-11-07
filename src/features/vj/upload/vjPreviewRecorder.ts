import { VjUploadFailure } from "./vjUploadFailure";

/** The tab went hidden mid-take; timers were throttled, so the take is thrown away. */
export class VjPreviewHiddenError extends Error {
  constructor() {
    super("vj-preview-hidden");
    this.name = "VjPreviewHiddenError";
  }
}

function abortError(): DOMException {
  return new DOMException("vj-preview-aborted", "AbortError");
}

function isPageHidden(): boolean {
  return document.visibilityState === "hidden";
}

/** Resolves once the tab is visible (at once when it already is); the abort rejects. */
export function waitVjPageVisible(signal: AbortSignal): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) {
      reject(abortError());
      return;
    }
    if (!isPageHidden()) {
      resolve();
      return;
    }
    const cleanup = () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      signal.removeEventListener("abort", onAbort);
    };
    const onVisibilityChange = () => {
      if (isPageHidden()) return;
      cleanup();
      resolve();
    };
    const onAbort = () => {
      cleanup();
      reject(abortError());
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    signal.addEventListener("abort", onAbort, { once: true });
  });
}

export interface VjPreviewRecordOptions {
  canvas: HTMLCanvasElement;
  /** Paints the canvas for this many ms since the take started. */
  draw: (elapsedMs: number) => void;
  mimeType: string;
  bitsPerSecond: number;
  durationMs: number;
  fps: number;
  signal: AbortSignal;
}

function openRecorder(options: VjPreviewRecordOptions): {
  stream: MediaStream;
  recorder: MediaRecorder;
} {
  const stream = options.canvas.captureStream(options.fps);
  try {
    const recorder = new MediaRecorder(stream, {
      mimeType: options.mimeType,
      videoBitsPerSecond: options.bitsPerSecond,
    });
    return { stream, recorder };
  } catch (error) {
    for (const track of stream.getTracks()) track.stop();
    throw error;
  }
}

/**
 * Records `durationMs` of the canvas (contract 9.4): `captureStream(fps)` into
 * a `MediaRecorder`, drawing once and then every `1000 / fps` ms. Resolves with
 * the recording typed as its content type. The tab going hidden rejects
 * `VjPreviewHiddenError`, a recorder error `VJ_PREVIEW_FAILED`, the abort an
 * `AbortError`. Every path clears both timers, removes its listeners and stops
 * the stream's tracks.
 */
export function recordVjPreviewCanvas(
  options: VjPreviewRecordOptions,
): Promise<Blob> {
  return new Promise<Blob>((resolve, reject) => {
    const { signal } = options;
    if (signal.aborted) {
      reject(abortError());
      return;
    }
    if (isPageHidden()) {
      reject(new VjPreviewHiddenError());
      return;
    }
    let opened: { stream: MediaStream; recorder: MediaRecorder };
    try {
      opened = openRecorder(options);
    } catch (error) {
      reject(new VjUploadFailure("VJ_PREVIEW_FAILED", { cause: error }));
      return;
    }
    const { stream, recorder } = opened;
    const contentType = options.mimeType.split(";")[0];
    const chunks: Blob[] = [];
    const timers: {
      draw?: ReturnType<typeof setInterval>;
      stop?: ReturnType<typeof setTimeout>;
    } = {};
    let isSettled = false;

    const cleanup = () => {
      clearInterval(timers.draw);
      clearTimeout(timers.stop);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      signal.removeEventListener("abort", onAbort);
      recorder.removeEventListener("dataavailable", onData);
      recorder.removeEventListener("error", onRecorderError);
      recorder.removeEventListener("stop", onStop);
      for (const track of stream.getTracks()) track.stop();
    };
    const fail = (error: Error) => {
      if (isSettled) return;
      isSettled = true;
      if (recorder.state !== "inactive") recorder.stop();
      cleanup();
      reject(error);
    };
    const onData = (event: BlobEvent) => {
      if (event.data.size > 0) chunks.push(event.data);
    };
    const onStop = () => {
      if (isSettled) return;
      isSettled = true;
      cleanup();
      resolve(new Blob(chunks, { type: contentType }));
    };
    const onRecorderError = (event: Event) => {
      fail(new VjUploadFailure("VJ_PREVIEW_FAILED", { cause: event }));
    };
    const onVisibilityChange = () => {
      if (isPageHidden()) fail(new VjPreviewHiddenError());
    };
    const onAbort = () => fail(abortError());

    recorder.addEventListener("dataavailable", onData);
    recorder.addEventListener("error", onRecorderError);
    recorder.addEventListener("stop", onStop);
    document.addEventListener("visibilitychange", onVisibilityChange);
    signal.addEventListener("abort", onAbort, { once: true });

    const startedAt = performance.now();
    const drawFrame = () => {
      try {
        options.draw(performance.now() - startedAt);
      } catch (error) {
        fail(new VjUploadFailure("VJ_PREVIEW_FAILED", { cause: error }));
      }
    };
    drawFrame();
    if (isSettled) return;
    try {
      recorder.start();
    } catch (error) {
      fail(new VjUploadFailure("VJ_PREVIEW_FAILED", { cause: error }));
      return;
    }
    timers.draw = setInterval(drawFrame, 1000 / options.fps);
    timers.stop = setTimeout(() => {
      clearInterval(timers.draw);
      if (!isSettled) recorder.stop();
    }, options.durationMs);
  });
}
