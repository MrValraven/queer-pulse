import { captureApis, type ElementCaptureTrack } from "./captureApis";
import { MARKER_HEIGHT, cellLumaFromRow, readMarker } from "./frameMarker";

/** Why a capture could not start or stopped; each has its own message. */
export type CaptureFailure =
  "denied" | "wrong-tab" | "stopped" | "stalled" | "unsupported";

export class CaptureError extends Error {
  override name = "CaptureError";
  readonly failure: CaptureFailure;
  constructor(failure: CaptureFailure, message: string) {
    super(message);
    this.failure = failure;
  }
}

/** The film is 1920x1080; the marker strip sits right below it. */
const FILM_HEIGHT = 1080;
const BOX_HEIGHT = FILM_HEIGHT + MARKER_HEIGHT;
/** How long to wait for a frame that shows the expected marker. */
const STALL_MS = 5000;
const SAMPLE_WIDTH = 256;

/**
 * Asks to share this tab. Call it straight from the click that starts the
 * render: browsers only show the picker in response to a user gesture.
 */
export async function requestTabShare(): Promise<MediaStream> {
  try {
    return await navigator.mediaDevices.getDisplayMedia({
      video: {
        displaySurface: "browser",
        frameRate: { ideal: 60 },
        width: { max: 3840 },
        height: { max: 2160 },
      },
      audio: false,
      // Chromium-only hints: offer "this tab" first, and don't let the admin
      // switch the shared tab mid-render. Unknown keys are ignored elsewhere.
      preferCurrentTab: true,
      selfBrowserSurface: "include",
      surfaceSwitching: "exclude",
    } as DisplayMediaStreamOptions);
  } catch (error) {
    throw new CaptureError(
      "denied",
      error instanceof Error ? error.message : "Sharing was cancelled.",
    );
  }
}

export interface FilmCapture {
  /** Size of the captured box in device pixels (film plus marker strip). */
  readonly width: number;
  readonly height: number;
  /**
   * Resolves with the next captured frame showing marker `index`. The caller
   * owns the frame and must close() it. Frames before it are discarded.
   */
  frameWithMarker(index: number, signal: AbortSignal): Promise<VideoFrame>;
  stop(): void;
}

/**
 * Limits a shared-tab stream to `box` (the film plus its marker strip) and
 * returns a reader for its frames. Fails with "wrong-tab" when the admin
 * shared a different tab or a window, which can't be limited to an element.
 */
export async function captureFilmBox(
  stream: MediaStream,
  box: HTMLElement,
): Promise<FilmCapture> {
  const [track] = stream.getVideoTracks() as ElementCaptureTrack[];
  const apis = captureApis();
  if (!track || !apis.TrackProcessor) {
    throw new CaptureError("unsupported", "No video track to read.");
  }
  try {
    if (apis.restrictionTarget && track.restrictTo) {
      await track.restrictTo(await apis.restrictionTarget.fromElement(box));
    } else if (apis.cropTarget && track.cropTo) {
      await track.cropTo(await apis.cropTarget.fromElement(box));
    } else {
      throw new CaptureError("unsupported", "Element capture is missing.");
    }
  } catch (error) {
    if (error instanceof CaptureError) throw error;
    throw new CaptureError(
      "wrong-tab",
      error instanceof Error ? error.message : "Could not limit the capture.",
    );
  }

  const reader = new apis.TrackProcessor({
    track,
    maxBufferSize: 4,
  }).readable.getReader();
  const sampler = new OffscreenCanvas(SAMPLE_WIDTH, 1);
  const sampleContext = sampler.getContext("2d", { willReadFrequently: true });
  if (!sampleContext) {
    throw new CaptureError("unsupported", "No 2D canvas for sampling.");
  }
  const size = { width: 0, height: 0 };

  const markerOf = (frame: VideoFrame): number | null => {
    const markerRow = Math.floor(
      frame.displayHeight * ((FILM_HEIGHT + MARKER_HEIGHT / 2) / BOX_HEIGHT),
    );
    sampleContext.drawImage(
      frame,
      0,
      markerRow,
      frame.displayWidth,
      1,
      0,
      0,
      SAMPLE_WIDTH,
      1,
    );
    const row = sampleContext.getImageData(0, 0, SAMPLE_WIDTH, 1).data;
    return readMarker(cellLumaFromRow(row, SAMPLE_WIDTH));
  };

  const frameWithMarker = async (index: number, signal: AbortSignal) => {
    const deadline = performance.now() + STALL_MS;
    for (;;) {
      if (signal.aborted) throw signal.reason;
      if (performance.now() > deadline) {
        throw new CaptureError(
          "stalled",
          `No captured frame showed step ${index}. Was the tab hidden?`,
        );
      }
      const { value: frame, done } = await reader.read();
      if (done || track.readyState === "ended") {
        throw new CaptureError("stopped", "Sharing stopped.");
      }
      size.width = frame.displayWidth;
      size.height = frame.displayHeight;
      if (markerOf(frame) === index) return frame;
      frame.close();
    }
  };

  return {
    get width() {
      return size.width;
    },
    get height() {
      return size.height;
    },
    frameWithMarker,
    stop() {
      void reader.cancel().catch(() => undefined);
      stream.getTracks().forEach((streamTrack) => streamTrack.stop());
    },
  };
}

/** The film's part of a captured frame, in the frame's own pixels. */
export function filmRect(frame: VideoFrame) {
  return {
    width: frame.displayWidth,
    height: frame.displayHeight * (FILM_HEIGHT / BOX_HEIGHT),
  };
}
