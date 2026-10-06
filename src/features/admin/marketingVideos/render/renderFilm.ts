import {
  AudioBufferSource,
  BufferTarget,
  CanvasSource,
  Mp4OutputFormat,
  Output,
  QUALITY_HIGH,
  QUALITY_VERY_HIGH,
  WebMOutputFormat,
  canEncodeAudio,
  canEncodeVideo,
} from "mediabunny";
import { filmScore } from "./filmScore";
import { filmIn } from "./filmWindow";
import type { Rgb } from "./colorCalibration";
import { MARKER_HEIGHT, MAX_MARKER_INDEX } from "./frameMarker";
import { captureFilmBox, filmRect } from "./tabCapture";

const WIDTH = 1920;
const HEIGHT = 1080;
const FPS = 30;

export interface RenderStage {
  /** The element captured: the film plus its marker strip below. */
  box: HTMLElement;
  iframe: HTMLIFrameElement;
  showMarker(index: number): void;
  /** Shows or hides the colour patches over the film. */
  showCalibration(isShown: boolean): void;
  /** The patches' true colours, in CALIBRATION_PATCHES order. */
  calibrationColours(): Rgb[];
}

/** Marker for the calibration frame: above every step, below the resting code. */
const CALIBRATION_STEP = MAX_MARKER_INDEX - 1;

export type RenderProgress =
  | { step: "score" }
  | { step: "frames"; done: number; total: number }
  | { step: "finishing" };

export interface RenderedFilm {
  blob: Blob;
  fileName: string;
  /** Size the film was captured at, before scaling to 1920x1080. */
  capturedWidth: number;
  capturedHeight: number;
}

export class EncoderUnavailableError extends Error {
  override name = "EncoderUnavailableError";
}

interface FilmFormat {
  container: "mp4" | "webm";
  video: "avc" | "vp9";
  audio: "aac" | "opus";
}

/**
 * MP4 with H.264 and AAC plays everywhere. Chrome on Linux has no AAC
 * encoder, so Opus in MP4 comes next (fine for browsers, VLC and social
 * uploads), then WebM as the last resort.
 */
async function pickFormat(): Promise<FilmFormat> {
  const video = { width: WIDTH, height: HEIGHT, frameRate: FPS };
  const audio = { numberOfChannels: 2, sampleRate: 48000 };
  const [avc, vp9, aac, opus] = await Promise.all([
    canEncodeVideo("avc", video),
    canEncodeVideo("vp9", video),
    canEncodeAudio("aac", audio),
    canEncodeAudio("opus", audio),
  ]);
  if (avc && aac) return { container: "mp4", video: "avc", audio: "aac" };
  if (avc && opus) return { container: "mp4", video: "avc", audio: "opus" };
  if (vp9 && opus) return { container: "webm", video: "vp9", audio: "opus" };
  throw new EncoderUnavailableError("This browser cannot encode video.");
}

/**
 * Renders one film to a video file in this browser.
 *
 * `stream` is a shared-tab capture (see requestTabShare), `stage` the film's
 * iframe mounted at full resolution with a marker strip under it. Every
 * frame is drawn by seeking the film, waiting for the captured frame that
 * shows the step's marker, and copying the film's part onto a 1920x1080
 * canvas. Films that ask for motion blur (window.SHUTTER) get several
 * sub-frames across half a frame, averaged, like the CLI renderer.
 */
export async function renderFilm({
  id,
  filmUrl,
  scoreUrl,
  stream,
  stage,
  signal,
  onProgress,
}: {
  id: string;
  /** The film's page, loaded again in a hidden frame to compose the score. */
  filmUrl: string;
  scoreUrl: string;
  stream: MediaStream;
  stage: RenderStage;
  signal: AbortSignal;
  onProgress: (progress: RenderProgress) => void;
}): Promise<RenderedFilm> {
  const film = await filmIn(stage.iframe);
  const capture = await captureFilmBox(stream, stage.box);
  let output: Output<Mp4OutputFormat | WebMOutputFormat, BufferTarget> | null =
    null;
  try {
    onProgress({ step: "score" });
    // Measure how this browser's capture handles colour before recording.
    stage.showCalibration(true);
    stage.showMarker(CALIBRATION_STEP);
    const calibrationFrame = await capture.frameWithMarker(
      CALIBRATION_STEP,
      signal,
    );
    try {
      await capture.calibrate(calibrationFrame, stage.calibrationColours());
    } finally {
      calibrationFrame.close();
      stage.showCalibration(false);
    }
    const score = await filmScore(filmUrl, scoreUrl);
    signal.throwIfAborted();
    const format = await pickFormat();

    const canvas = new OffscreenCanvas(WIDTH, HEIGHT);
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) throw new EncoderUnavailableError("No 2D canvas.");
    output = new Output({
      format:
        format.container === "mp4"
          ? new Mp4OutputFormat({ fastStart: "in-memory" })
          : new WebMOutputFormat(),
      target: new BufferTarget(),
    });
    const videoSource = new CanvasSource(canvas, {
      codec: format.video,
      quality: QUALITY_VERY_HIGH,
    });
    output.addVideoTrack(videoSource, { frameRate: FPS });
    const audioSource = new AudioBufferSource({
      codec: format.audio,
      quality: QUALITY_HIGH,
    });
    output.addAudioTrack(audioSource);
    await output.start();
    await audioSource.add(score);
    audioSource.close();

    const shutter = Math.max(1, Math.round(film.SHUTTER ?? 1));
    const total = Math.round(film.DURATION * FPS);
    for (let frameIndex = 0; frameIndex < total; frameIndex++) {
      for (let subFrame = 0; subFrame < shutter; subFrame++) {
        // Sub-frames spread over half a frame (a 180-degree shutter).
        const offset =
          shutter > 1 ? ((subFrame + 0.5) / shutter - 0.5) * 0.5 : 0;
        const step = frameIndex * shutter + subFrame;
        film.seek(Math.max(0, (frameIndex + offset) / FPS));
        stage.showMarker(step);
        const captured = await capture.frameWithMarker(step, signal);
        const frame = await capture.correct(captured);
        try {
          const source = filmRect(frame);
          // A running average: sub-frame k weighs 1/(k+1) over the blend so far.
          context.globalAlpha = 1 / (subFrame + 1);
          context.drawImage(
            frame,
            0,
            0,
            source.width,
            source.height,
            0,
            0,
            WIDTH,
            HEIGHT,
          );
        } finally {
          if (frame !== captured) frame.close();
          captured.close();
        }
      }
      await videoSource.add(frameIndex / FPS, 1 / FPS);
      if (frameIndex % 5 === 0 || frameIndex === total - 1) {
        onProgress({ step: "frames", done: frameIndex + 1, total });
      }
    }
    videoSource.close();

    onProgress({ step: "finishing" });
    await output.finalize();
    const buffer = output.target.buffer;
    if (!buffer) throw new EncoderUnavailableError("The muxer wrote nothing.");
    return {
      blob: new Blob([buffer], {
        type: format.container === "mp4" ? "video/mp4" : "video/webm",
      }),
      fileName: `queerpulse-${id}.${format.container}`,
      capturedWidth: capture.width,
      capturedHeight: Math.round(
        capture.height * (HEIGHT / (HEIGHT + MARKER_HEIGHT)),
      ),
    };
  } catch (error) {
    if (output && output.state !== "finalized" && output.state !== "canceled") {
      await output.cancel().catch(() => undefined);
    }
    throw error;
  } finally {
    capture.stop();
    film.seek(0);
  }
}
