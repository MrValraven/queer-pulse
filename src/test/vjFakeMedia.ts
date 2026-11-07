import { vi } from "vitest";
import { createVjGlContext } from "../features/vj/engine/gl/vjGlContext";
import { VjTargetPool } from "../features/vj/engine/gl/vjGlTargets";
import { VjRingBudget } from "../features/vj/engine/sources/vjReverseRing";
import type { VjEngineSourceDeps } from "../features/vj/engine/sources/vjSourceTypes";
import { createVjFakeWebGl2Canvas, type VjFakeWebGl2 } from "./vjFakeWebGl2";

/**
 * Stand-ins for the media the engine sources read in jsdom: a `<video>` with
 * a controllable requestVideoFrameCallback, readyState, play() and
 * currentTime; an `<img>` with a controllable decode(); and a WebCodecs
 * ImageDecoder with frames and durations (plus createImageBitmap and fetch).
 *
 * `installVjFakeImageDecoder` stubs globals with `vi.stubGlobal`. A test file
 * that installs it calls `vi.unstubAllGlobals()` in its own afterEach, so the
 * stubbed fetch is gone before the setup file puts its own fetch back.
 */

/** HTMLMediaElement.HAVE_ENOUGH_DATA */
const HAVE_ENOUGH_DATA = 4;

export interface VjFakeVideoOptions {
  /** Defaults to true: the video offers requestVideoFrameCallback. */
  hasFrameCallback?: boolean;
  /** Defaults to "resolve". */
  playOutcome?: "resolve" | "reject";
}

export interface VjFakeVideo {
  video: HTMLVideoElement;
  /** Every currentTime the code under test wrote, in seconds. */
  seeks: number[];
  readonly playCount: number;
  readonly pauseCount: number;
  readonly loadCount: number;
  /** The video now holds a decoded frame of this size (readyState HAVE_ENOUGH_DATA). */
  setDecodedFrame(width?: number, height?: number): void;
  /** Moves the playback position without counting a seek. */
  setPlaybackTime(mediaTimeSec: number): void;
  fireCanPlayThrough(): void;
  firePlaying(): void;
  fireLoadedMetadata(): void;
  fireError(): void;
  /** Presents one frame: runs every pending frame callback once with this media time. */
  presentFrame(mediaTimeSec: number): void;
  pendingFrameCallbackCount(): number;
}

interface VjFakeVideoState {
  readyState: number;
  videoWidth: number;
  videoHeight: number;
  currentTime: number;
  isPaused: boolean;
  playCount: number;
  pauseCount: number;
  loadCount: number;
  nextCallbackId: number;
  callbacks: Map<number, VideoFrameRequestCallback>;
}

function defineVjFakeVideoProperties(
  video: HTMLVideoElement,
  state: VjFakeVideoState,
  seeks: number[],
  options: VjFakeVideoOptions,
): void {
  const define = (name: string, descriptor: PropertyDescriptor) =>
    Object.defineProperty(video, name, { configurable: true, ...descriptor });
  define("readyState", { get: () => state.readyState });
  define("videoWidth", { get: () => state.videoWidth });
  define("videoHeight", { get: () => state.videoHeight });
  define("paused", { get: () => state.isPaused });
  define("seeking", { get: () => false });
  define("currentTime", {
    get: () => state.currentTime,
    set: (value: number) => {
      seeks.push(value);
      state.currentTime = value;
    },
  });
  define("play", {
    value: () => {
      state.playCount += 1;
      if (options.playOutcome === "reject") {
        return Promise.reject(new DOMException("blocked", "NotAllowedError"));
      }
      state.isPaused = false;
      return Promise.resolve();
    },
  });
  define("pause", {
    value: () => {
      state.pauseCount += 1;
      state.isPaused = true;
    },
  });
  define("load", {
    value: () => {
      state.loadCount += 1;
    },
  });
  const hasFrameCallback = options.hasFrameCallback ?? true;
  define("requestVideoFrameCallback", {
    value: hasFrameCallback
      ? (callback: VideoFrameRequestCallback) => {
          state.nextCallbackId += 1;
          state.callbacks.set(state.nextCallbackId, callback);
          return state.nextCallbackId;
        }
      : undefined,
  });
  define("cancelVideoFrameCallback", {
    value: hasFrameCallback
      ? (callbackId: number) => state.callbacks.delete(callbackId)
      : undefined,
  });
}

export function createVjFakeVideo(
  options: VjFakeVideoOptions = {},
): VjFakeVideo {
  const video = document.createElement("video");
  const seeks: number[] = [];
  const state: VjFakeVideoState = {
    readyState: 0,
    videoWidth: 0,
    videoHeight: 0,
    currentTime: 0,
    isPaused: true,
    playCount: 0,
    pauseCount: 0,
    loadCount: 0,
    nextCallbackId: 0,
    callbacks: new Map(),
  };
  defineVjFakeVideoProperties(video, state, seeks, options);
  const fire = (type: string) => video.dispatchEvent(new Event(type));
  return {
    video,
    seeks,
    get playCount() {
      return state.playCount;
    },
    get pauseCount() {
      return state.pauseCount;
    },
    get loadCount() {
      return state.loadCount;
    },
    setDecodedFrame: (width = 1920, height = 1080) => {
      state.readyState = HAVE_ENOUGH_DATA;
      state.videoWidth = width;
      state.videoHeight = height;
    },
    setPlaybackTime: (mediaTimeSec) => {
      state.currentTime = mediaTimeSec;
    },
    fireCanPlayThrough: () => fire("canplaythrough"),
    firePlaying: () => fire("playing"),
    fireLoadedMetadata: () => fire("loadedmetadata"),
    fireError: () => fire("error"),
    presentFrame: (mediaTimeSec) => {
      state.currentTime = mediaTimeSec;
      const pending = [...state.callbacks.values()];
      state.callbacks.clear();
      const metadata = {
        mediaTime: mediaTimeSec,
        presentationTime: 0,
        expectedDisplayTime: 0,
        presentedFrames: 1,
        width: state.videoWidth,
        height: state.videoHeight,
      };
      for (const callback of pending) callback(0, metadata);
    },
    pendingFrameCallbackCount: () => state.callbacks.size,
  };
}

export interface VjFakeImage {
  image: HTMLImageElement;
  setDecoded(width: number, height: number): void;
  resolveDecode(): void;
  rejectDecode(): void;
  fireLoad(): void;
  fireError(): void;
}

/** An `<img>` whose decode() (when present) settles when the test says so. */
export function createVjFakeImage(
  options: { hasDecode?: boolean } = {},
): VjFakeImage {
  const image = document.createElement("img");
  const size = { width: 0, height: 0 };
  let settleDecode: { resolve(): void; reject(): void } | null = null;
  Object.defineProperty(image, "naturalWidth", { get: () => size.width });
  Object.defineProperty(image, "naturalHeight", { get: () => size.height });
  Object.defineProperty(image, "decode", {
    configurable: true,
    value:
      options.hasDecode === false
        ? undefined
        : () =>
            new Promise<void>((resolve, reject) => {
              settleDecode = {
                resolve,
                reject: () => reject(new Error("decode")),
              };
            }),
  });
  return {
    image,
    setDecoded: (width, height) => {
      size.width = width;
      size.height = height;
    },
    resolveDecode: () => settleDecode?.resolve(),
    rejectDecode: () => settleDecode?.reject(),
    fireLoad: () => image.dispatchEvent(new Event("load")),
    fireError: () => image.dispatchEvent(new Event("error")),
  };
}

export interface VjFakeGifFrame {
  width: number;
  height: number;
  durationMs: number;
}

export interface VjFakeBitmap {
  width: number;
  height: number;
  isClosed: boolean;
  close(): void;
}

export interface VjFakeImageDecoder {
  /** Frame indexes in the order decode() was asked for them. */
  decodedFrameIndexes: number[];
  /** Every bitmap createImageBitmap made, in order. */
  bitmaps: VjFakeBitmap[];
  fetchedUrls: string[];
  closedVideoFrameCount(): number;
  closedDecoderCount(): number;
}

function createVjFakeBitmap(width: number, height: number): VjFakeBitmap {
  const bitmap: VjFakeBitmap = {
    width,
    height,
    isClosed: false,
    close: () => {
      bitmap.isClosed = true;
    },
  };
  return bitmap;
}

/** Stubs ImageDecoder, createImageBitmap and fetch with a GIF of these frames. */
export function installVjFakeImageDecoder(
  frames: readonly VjFakeGifFrame[],
  options: { isGifSupported?: boolean; failingFrameIndex?: number } = {},
): VjFakeImageDecoder {
  const controls = {
    decodedFrameIndexes: [] as number[],
    bitmaps: [] as VjFakeBitmap[],
    fetchedUrls: [] as string[],
    closedVideoFrames: 0,
    closedDecoders: 0,
  };
  class FakeImageDecoder {
    static isTypeSupported(type: string): Promise<boolean> {
      return Promise.resolve(
        (options.isGifSupported ?? true) && type === "image/gif",
      );
    }
    readonly type = "image/gif";
    readonly complete = true;
    readonly completed = Promise.resolve();
    readonly tracks = {
      ready: Promise.resolve(),
      selectedTrack: { frameCount: frames.length, animated: true },
    };
    decode({ frameIndex = 0 }: { frameIndex?: number } = {}) {
      controls.decodedFrameIndexes.push(frameIndex);
      const spec = frames[frameIndex];
      if (spec === undefined || frameIndex === options.failingFrameIndex) {
        return Promise.reject(new DOMException("broken", "EncodingError"));
      }
      const image = {
        displayWidth: spec.width,
        displayHeight: spec.height,
        duration: spec.durationMs * 1000,
        close: () => {
          controls.closedVideoFrames += 1;
        },
      };
      return Promise.resolve({ image, complete: true });
    }
    close() {
      controls.closedDecoders += 1;
    }
    reset() {}
  }
  vi.stubGlobal("ImageDecoder", FakeImageDecoder);
  vi.stubGlobal(
    "createImageBitmap",
    (source: { displayWidth: number; displayHeight: number }) => {
      const bitmap = createVjFakeBitmap(
        source.displayWidth,
        source.displayHeight,
      );
      controls.bitmaps.push(bitmap);
      return Promise.resolve(bitmap);
    },
  );
  vi.stubGlobal("fetch", (url: string) => {
    controls.fetchedUrls.push(url);
    return Promise.resolve({
      ok: true,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(16)),
    });
  });
  return {
    decodedFrameIndexes: controls.decodedFrameIndexes,
    bitmaps: controls.bitmaps,
    fetchedUrls: controls.fetchedUrls,
    closedVideoFrameCount: () => controls.closedVideoFrames,
    closedDecoderCount: () => controls.closedDecoders,
  };
}

export interface VjFakeSourceDeps {
  deps: VjEngineSourceDeps;
  fake: VjFakeWebGl2;
  onFirstFrame: ReturnType<typeof vi.fn>;
  onFailed: ReturnType<typeof vi.fn>;
}

/** Engine source deps over a fake WebGL2 context (1920x1080 canvas) with spied events. */
export function createVjFakeSourceDeps(
  options: { ringBudget?: VjRingBudget; gifBudget?: VjRingBudget } = {},
): VjFakeSourceDeps {
  const fake = createVjFakeWebGl2Canvas();
  const result = createVjGlContext(fake.canvas, {
    onLost: () => undefined,
    onRestored: () => undefined,
  });
  if (!result.ok) throw new Error(`vjFakeMedia: no context (${result.reason})`);
  const mediaHost = document.createElement("div");
  document.body.append(mediaHost);
  const onFirstFrame = vi.fn();
  const onFailed = vi.fn();
  const deps: VjEngineSourceDeps = {
    context: result.context,
    targets: new VjTargetPool(result.context.gl, () => 0),
    mediaHost,
    events: { onFirstFrame, onFailed },
    ringBudget: options.ringBudget ?? new VjRingBudget(),
    gifBudget: options.gifBudget,
  };
  return { deps, fake, onFirstFrame, onFailed };
}
