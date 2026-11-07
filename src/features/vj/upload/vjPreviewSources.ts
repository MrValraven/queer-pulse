import { VJ_LIMITS } from "../../../shared/contracts/vj";
import { VJ_DECODE_TIMEOUT_MS } from "../vj.constants";
import { vjPreviewStartMs } from "./vjPreviewFormat";

/** Something the preview recorder can draw onto its canvas, frame by frame. */
export interface VjPreviewSource {
  width: number;
  height: number;
  /** Puts the source at its start point and starts its clock. Called before each take. */
  start: () => Promise<void>;
  /** Draws the frame for this many ms since start. */
  draw: (
    context: CanvasRenderingContext2D,
    elapsedMs: number,
    size: { width: number; height: number },
  ) => void;
  release: () => void;
}

/** A GIF frame that has no delay of its own shows this long. */
const VJ_PREVIEW_GIF_FRAME_FALLBACK_MS = 100;

function abortError(): DOMException {
  return new DOMException("vj-preview-aborted", "AbortError");
}

/** Waits for one media event; an `error` event, `VJ_DECODE_TIMEOUT_MS` or the abort rejects. */
function waitForVideoEvent(
  video: HTMLVideoElement,
  eventName: "loadedmetadata" | "seeked",
  signal: AbortSignal,
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) {
      reject(abortError());
      return;
    }
    const settle = (error: Error | null) => {
      clearTimeout(timer);
      video.removeEventListener(eventName, onDone);
      video.removeEventListener("error", onError);
      signal.removeEventListener("abort", onAbort);
      if (error === null) resolve();
      else reject(error);
    };
    const onDone = () => settle(null);
    const onError = () => settle(new Error("vj-preview-video-error"));
    const onAbort = () => settle(abortError());
    const timer = setTimeout(
      () => settle(new Error("vj-preview-video-timeout")),
      VJ_DECODE_TIMEOUT_MS,
    );
    video.addEventListener(eventName, onDone);
    video.addEventListener("error", onError);
    signal.addEventListener("abort", onAbort, { once: true });
  });
}

/**
 * A video preview source (contract 9.4): a detached muted `<video>` that loops,
 * so a clip under 2 s repeats. `isCrossOrigin` sets `crossOrigin="anonymous"`
 * for a presigned storage URL, so the canvas stays readable. Each `start`
 * seeks to `vjPreviewStartMs` and plays.
 */
export async function openVjVideoPreviewSource(
  url: string,
  options: {
    isCrossOrigin: boolean;
    durationMs: number | null;
    signal: AbortSignal;
  },
): Promise<VjPreviewSource> {
  options.signal.throwIfAborted();
  const video = document.createElement("video");
  const release = () => {
    video.pause();
    video.removeAttribute("src");
    video.load();
  };
  video.muted = true;
  video.playsInline = true;
  video.loop = true;
  video.preload = "auto";
  if (options.isCrossOrigin) video.crossOrigin = "anonymous";
  try {
    const metadataLoaded = waitForVideoEvent(
      video,
      "loadedmetadata",
      options.signal,
    );
    video.src = url;
    await metadataLoaded;
    if (video.videoWidth <= 0 || video.videoHeight <= 0) {
      throw new Error("vj-preview-no-picture");
    }
  } catch (error) {
    release();
    throw error;
  }
  const startMs = vjPreviewStartMs(options.durationMs ?? video.duration * 1000);
  return {
    width: video.videoWidth,
    height: video.videoHeight,
    start: async () => {
      video.pause();
      const seeked = waitForVideoEvent(video, "seeked", options.signal);
      video.currentTime = startMs / 1000;
      await seeked;
      await video.play();
    },
    draw: (context, _elapsedMs, size) => {
      context.drawImage(video, 0, 0, size.width, size.height);
    },
    release,
  };
}

interface VjPreviewGifFrame {
  frame: VideoFrame;
  /** Summed duration up to the end of this frame. */
  endMs: number;
}

async function decodeGifFrames(
  decoder: ImageDecoder,
  frames: VjPreviewGifFrame[],
  signal: AbortSignal,
): Promise<number> {
  await decoder.tracks.ready;
  const frameCount = Math.max(1, decoder.tracks.selectedTrack?.frameCount ?? 1);
  let totalMs = 0;
  for (
    let frameIndex = 0;
    frameIndex < frameCount && totalMs < VJ_LIMITS.previewDurationMs;
    frameIndex += 1
  ) {
    signal.throwIfAborted();
    const decoded = await decoder.decode({ frameIndex });
    const durationMicroseconds = decoded.image.duration;
    totalMs +=
      durationMicroseconds !== null && durationMicroseconds > 0
        ? durationMicroseconds / 1000
        : VJ_PREVIEW_GIF_FRAME_FALLBACK_MS;
    frames.push({ frame: decoded.image, endMs: totalMs });
  }
  return totalMs;
}

/**
 * A GIF preview source (contract 9.4): decodes frames from frame 0 through
 * `ImageDecoder` until they cover `VJ_LIMITS.previewDurationMs` or run out,
 * then plays them on the recorder's clock, looping a short GIF.
 */
export async function openVjGifPreviewSource(
  bytes: Blob,
  signal: AbortSignal,
): Promise<VjPreviewSource> {
  signal.throwIfAborted();
  const decoder = new ImageDecoder({
    data: await bytes.arrayBuffer(),
    type: "image/gif",
  });
  const frames: VjPreviewGifFrame[] = [];
  const release = () => {
    for (const gifFrame of frames) gifFrame.frame.close();
    frames.length = 0;
    decoder.close();
  };
  let totalMs: number;
  let firstGifFrame: VjPreviewGifFrame;
  try {
    totalMs = await decodeGifFrames(decoder, frames, signal);
    const decodedFirstFrame = frames[0];
    if (decodedFirstFrame === undefined) {
      throw new Error("vj-preview-gif-empty");
    }
    firstGifFrame = decodedFirstFrame;
  } catch (error) {
    release();
    throw error;
  }
  const firstFrame = firstGifFrame.frame;
  return {
    width: firstFrame.displayWidth,
    height: firstFrame.displayHeight,
    start: () => Promise.resolve(),
    draw: (context, elapsedMs, size) => {
      const positionMs = elapsedMs % totalMs;
      const gifFrame =
        frames.find((candidate) => candidate.endMs > positionMs) ??
        frames[frames.length - 1];
      // Only empty after release, when there is nothing left to draw.
      if (gifFrame === undefined) return;
      context.drawImage(gifFrame.frame, 0, 0, size.width, size.height);
    },
    release,
  };
}
