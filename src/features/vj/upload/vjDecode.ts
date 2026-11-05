import { VJ_DECODE_TIMEOUT_MS } from "../vj.constants";

/** What the browser read from a picked clip, plus a frame to cut the thumbnail from. */
export interface VjDecodedClip {
  width: number;
  height: number;
  /** `duration * 1000` as the video reports it (may be NaN or Infinity); null for a GIF. */
  durationMs: number | null;
  frame: CanvasImageSource;
  /** Revokes the object URL and lets go of the element. Always call it. */
  release: () => void;
}

/** The browser could not play or decode the file. The message is a code only. */
export class VjDecodeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "VjDecodeError";
  }
}

/** The latest a video seeks to for its thumbnail frame, in seconds. */
const VJ_THUMBNAIL_SEEK_MAX_SECONDS = 1;
/** `HTMLMediaElement.HAVE_CURRENT_DATA`. */
const HAVE_CURRENT_DATA = 2;

function withDecodeTimeout<Result>(
  work: (settle: {
    resolve: (value: Result) => void;
    reject: (error: VjDecodeError) => void;
  }) => void,
): Promise<Result> {
  return new Promise<Result>((resolve, reject) => {
    let isSettled = false;
    const timer = setTimeout(() => {
      if (isSettled) return;
      isSettled = true;
      reject(new VjDecodeError("vj-decode-timeout"));
    }, VJ_DECODE_TIMEOUT_MS);
    work({
      resolve: (value) => {
        if (isSettled) return;
        isSettled = true;
        clearTimeout(timer);
        resolve(value);
      },
      reject: (error) => {
        if (isSettled) return;
        isSettled = true;
        clearTimeout(timer);
        reject(error);
      },
    });
  });
}

function waitForVideoEvent(
  video: HTMLVideoElement,
  eventName: "loadedmetadata" | "seeked" | "loadeddata",
): Promise<void> {
  return withDecodeTimeout<void>(({ resolve, reject }) => {
    const onDone = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      reject(new VjDecodeError("vj-decode-video-error"));
    };
    const cleanup = () => {
      video.removeEventListener(eventName, onDone);
      video.removeEventListener("error", onError);
    };
    video.addEventListener(eventName, onDone);
    video.addEventListener("error", onError);
  });
}

async function decodeVideo(file: Blob): Promise<VjDecodedClip> {
  const objectUrl = URL.createObjectURL(file);
  const video = document.createElement("video");
  const release = () => {
    video.removeAttribute("src");
    video.load();
    URL.revokeObjectURL(objectUrl);
  };
  try {
    video.muted = true;
    video.playsInline = true;
    video.preload = "metadata";
    const metadataLoaded = waitForVideoEvent(video, "loadedmetadata");
    video.src = objectUrl;
    await metadataLoaded;
    if (video.videoWidth <= 0 || video.videoHeight <= 0) {
      throw new VjDecodeError("vj-decode-no-picture");
    }
    const durationSeconds = video.duration;
    const seekSeconds = Number.isFinite(durationSeconds)
      ? Math.min(VJ_THUMBNAIL_SEEK_MAX_SECONDS, durationSeconds / 2)
      : 0;
    if (seekSeconds > 0) {
      const seeked = waitForVideoEvent(video, "seeked");
      video.currentTime = seekSeconds;
      await seeked;
    } else if (video.readyState < HAVE_CURRENT_DATA) {
      await waitForVideoEvent(video, "loadeddata");
    }
    return {
      width: video.videoWidth,
      height: video.videoHeight,
      durationMs: durationSeconds * 1000,
      frame: video,
      release,
    };
  } catch (error) {
    release();
    throw error instanceof VjDecodeError
      ? error
      : new VjDecodeError("vj-decode-video-error");
  }
}

async function decodeGif(file: Blob): Promise<VjDecodedClip> {
  const objectUrl = URL.createObjectURL(file);
  const image = new Image();
  const release = () => {
    image.removeAttribute("src");
    URL.revokeObjectURL(objectUrl);
  };
  try {
    await withDecodeTimeout<void>(({ resolve, reject }) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new VjDecodeError("vj-decode-gif-error"));
      image.src = objectUrl;
    });
    if (image.naturalWidth <= 0 || image.naturalHeight <= 0) {
      throw new VjDecodeError("vj-decode-no-picture");
    }
    return {
      width: image.naturalWidth,
      height: image.naturalHeight,
      durationMs: null,
      frame: image,
      release,
    };
  } catch (error) {
    release();
    throw error instanceof VjDecodeError
      ? error
      : new VjDecodeError("vj-decode-gif-error");
  }
}

/**
 * Decodes a clip in the browser (contract 8.4 step 3). A video loads muted
 * with `preload="metadata"` and seeks to `min(1 s, duration / 2)`; a GIF
 * decodes as an image (first frame, natural size). An error, a zero size or
 * `VJ_DECODE_TIMEOUT_MS` without an answer rejects with `VjDecodeError`.
 */
export async function decodeVjClip(
  file: Blob,
  format: "mp4" | "webm" | "gif",
): Promise<VjDecodedClip> {
  return format === "gif" ? await decodeGif(file) : await decodeVideo(file);
}
