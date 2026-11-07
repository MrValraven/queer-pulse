import { VJ_LIMITS } from "../../../shared/contracts/vj";
import {
  VJ_PREVIEW_BITS_PER_SECOND,
  VJ_PREVIEW_FPS,
  VJ_PREVIEW_RETRY_BITS_PER_SECOND,
  pickVjPreviewRecorderType,
  readVjPreviewEnvironment,
  vjPreviewHeaderCodeOf,
  vjPreviewSize,
  type VjPreviewEnvironment,
  type VjPreviewRecorderChoice,
} from "./vjPreviewFormat";
import {
  VjPreviewHiddenError,
  recordVjPreviewCanvas,
  waitVjPageVisible,
} from "./vjPreviewRecorder";
import {
  openVjGifPreviewSource,
  openVjVideoPreviewSource,
  type VjPreviewSource,
} from "./vjPreviewSources";
import { readVjBlobBytes } from "./vjSniff";
import { VjUploadFailure } from "./vjUploadFailure";

/** What a preview is made from: a picked file, a presigned media URL, or GIF bytes. */
export type VjPreviewInput =
  | { kind: "videoFile"; file: Blob; durationMs: number | null }
  | { kind: "videoUrl"; url: string; durationMs: number | null }
  | { kind: "gif"; bytes: Blob };

export interface VjMadePreview {
  blob: Blob;
  contentType: "video/webm" | "video/mp4";
}

/** Test seams for `makeVjPreview`; each defaults to the real browser step. */
export interface VjPreviewSeams {
  environment: () => VjPreviewEnvironment;
  openVideo: typeof openVjVideoPreviewSource;
  openGif: typeof openVjGifPreviewSource;
  record: typeof recordVjPreviewCanvas;
  waitVisible: typeof waitVjPageVisible;
}

const DEFAULT_SEAMS: VjPreviewSeams = {
  environment: readVjPreviewEnvironment,
  openVideo: openVjVideoPreviewSource,
  openGif: openVjGifPreviewSource,
  record: recordVjPreviewCanvas,
  waitVisible: waitVjPageVisible,
};

/** Hidden-tab takes allowed in one run (call 12); the last one gives up. */
const VJ_PREVIEW_HIDDEN_TAKES_MAX = 3;
const HEADER_BYTE_COUNT = 16;

function isAbort(error: unknown, signal: AbortSignal): boolean {
  return (
    signal.aborted ||
    (error instanceof DOMException && error.name === "AbortError")
  );
}

/** Passes aborts and named failures through; anything else names VJ_PREVIEW_FAILED. */
function namedFailureOf(error: unknown, signal: AbortSignal): unknown {
  if (isAbort(error, signal) || error instanceof VjUploadFailure) return error;
  return new VjUploadFailure("VJ_PREVIEW_FAILED", { cause: error });
}

async function openSource(
  input: VjPreviewInput,
  objectUrl: string | null,
  signal: AbortSignal,
  steps: VjPreviewSeams,
): Promise<VjPreviewSource> {
  try {
    if (input.kind === "gif") return await steps.openGif(input.bytes, signal);
    if (input.kind === "videoUrl") {
      return await steps.openVideo(input.url, {
        isCrossOrigin: true,
        durationMs: input.durationMs,
        signal,
      });
    }
    if (objectUrl === null) throw new Error("vj-preview-no-object-url");
    return await steps.openVideo(objectUrl, {
      isCrossOrigin: false,
      durationMs: input.durationMs,
      signal,
    });
  } catch (error) {
    throw namedFailureOf(error, signal);
  }
}

interface VjPreviewTakeJob {
  source: VjPreviewSource;
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  size: { width: number; height: number };
  recorderChoice: VjPreviewRecorderChoice;
  signal: AbortSignal;
  steps: VjPreviewSeams;
  hiddenTakeCount: number;
}

async function recordOnce(
  job: VjPreviewTakeJob,
  bitsPerSecond: number,
): Promise<Blob> {
  await job.source.start();
  return await job.steps.record({
    canvas: job.canvas,
    draw: (elapsedMs) => job.source.draw(job.context, elapsedMs, job.size),
    mimeType: job.recorderChoice.mimeType,
    bitsPerSecond,
    durationMs: VJ_LIMITS.previewDurationMs,
    fps: VJ_PREVIEW_FPS,
    signal: job.signal,
  });
}

/** One usable take: a hidden-tab take is thrown away and taken again once visible. */
async function takeWhileVisible(
  job: VjPreviewTakeJob,
  bitsPerSecond: number,
): Promise<Blob> {
  for (;;) {
    try {
      return await recordOnce(job, bitsPerSecond);
    } catch (error) {
      if (!(error instanceof VjPreviewHiddenError)) {
        throw namedFailureOf(error, job.signal);
      }
      job.hiddenTakeCount += 1;
      if (job.hiddenTakeCount >= VJ_PREVIEW_HIDDEN_TAKES_MAX) {
        throw new VjUploadFailure("VJ_PREVIEW_FAILED", { cause: error });
      }
      await job.steps.waitVisible(job.signal);
    }
  }
}

/** A take that is not empty and whose header the server accepts. */
async function checkedTake(
  job: VjPreviewTakeJob,
  bitsPerSecond: number,
): Promise<Blob> {
  const blob = await takeWhileVisible(job, bitsPerSecond);
  if (blob.size === 0) throw new VjUploadFailure("VJ_PREVIEW_FAILED");
  const headerCode = vjPreviewHeaderCodeOf(
    await readVjBlobBytes(blob.slice(0, HEADER_BYTE_COUNT)),
    job.recorderChoice.contentType,
  );
  if (headerCode !== null) throw new VjUploadFailure(headerCode);
  return blob;
}

async function recordWithinCap(job: VjPreviewTakeJob): Promise<VjMadePreview> {
  const contentType = job.recorderChoice.contentType;
  const firstBlob = await checkedTake(job, VJ_PREVIEW_BITS_PER_SECOND);
  if (firstBlob.size <= VJ_LIMITS.previewMaxBytes) {
    return { blob: firstBlob, contentType };
  }
  const retryBlob = await checkedTake(job, VJ_PREVIEW_RETRY_BITS_PER_SECOND);
  if (retryBlob.size <= VJ_LIMITS.previewMaxBytes) {
    return { blob: retryBlob, contentType };
  }
  throw new VjUploadFailure("VJ_PREVIEW_FAILED", { byteSize: retryBlob.size });
}

/**
 * Makes a clip's animated preview in the browser (contract 9.4): 2000 ms drawn
 * onto a canvas 240 px on the long edge at 24 fps and recorded at 400 kbps,
 * once more at 200 kbps when over 512 KB. A browser with no recorder type (or a
 * GIF without `ImageDecoder`) names `VJ_PREVIEW_UNSUPPORTED` before opening
 * anything; every other failure names `VJ_PREVIEW_FAILED`; an abort passes
 * through. Always releases the source, the canvas and a local file's object URL.
 */
export async function makeVjPreview(
  input: VjPreviewInput,
  signal: AbortSignal,
  seams?: Partial<VjPreviewSeams>,
): Promise<VjMadePreview> {
  const steps: VjPreviewSeams = { ...DEFAULT_SEAMS, ...seams };
  const environment = steps.environment();
  const recorderChoice = pickVjPreviewRecorderType(environment);
  if (recorderChoice === null) {
    throw new VjUploadFailure("VJ_PREVIEW_UNSUPPORTED");
  }
  if (input.kind === "gif" && !environment.hasImageDecoder) {
    throw new VjUploadFailure("VJ_PREVIEW_UNSUPPORTED");
  }
  signal.throwIfAborted();
  const objectUrl =
    input.kind === "videoFile" ? URL.createObjectURL(input.file) : null;
  const canvas = document.createElement("canvas");
  let source: VjPreviewSource | null = null;
  try {
    source = await openSource(input, objectUrl, signal, steps);
    const size = vjPreviewSize(source.width, source.height);
    canvas.width = size.width;
    canvas.height = size.height;
    const context = canvas.getContext("2d");
    if (!context) throw new VjUploadFailure("VJ_PREVIEW_FAILED");
    return await recordWithinCap({
      source,
      canvas,
      context,
      size,
      recorderChoice,
      signal,
      steps,
      hiddenTakeCount: 0,
    });
  } finally {
    source?.release();
    canvas.width = 0;
    canvas.height = 0;
    if (objectUrl !== null) URL.revokeObjectURL(objectUrl);
  }
}
