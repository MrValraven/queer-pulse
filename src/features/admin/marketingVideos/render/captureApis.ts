/**
 * Typed access to the browser APIs the in-browser renderer needs. Element
 * Capture, Region Capture and MediaStreamTrackProcessor are Chromium-only and
 * not in TypeScript's DOM lib, so they are read off `globalThis` here, once,
 * with narrow types, instead of `any` leaking into the pipeline.
 */

/** A capture target made from a DOM element (Element or Region Capture). */
export type CaptureTarget = object;

interface CaptureTargetFactory {
  fromElement(element: Element): Promise<CaptureTarget>;
}

/** A tab-capture video track that can be limited to one element. */
export interface ElementCaptureTrack extends MediaStreamTrack {
  /** Element Capture (Chrome 132+): only the element, even when covered. */
  restrictTo?: (target: CaptureTarget | null) => Promise<void>;
  /** Region Capture (Chrome 104+): the element's on-screen rectangle. */
  cropTo?: (target: CaptureTarget | null) => Promise<void>;
}

type TrackProcessorConstructor = new (init: {
  track: MediaStreamTrack;
  maxBufferSize?: number;
}) => { readable: ReadableStream<VideoFrame> };

export interface CaptureApis {
  restrictionTarget?: CaptureTargetFactory;
  cropTarget?: CaptureTargetFactory;
  TrackProcessor?: TrackProcessorConstructor;
}

export function captureApis(scope: object = globalThis): CaptureApis {
  return {
    restrictionTarget: Reflect.get(scope, "RestrictionTarget") as
      CaptureTargetFactory | undefined,
    cropTarget: Reflect.get(scope, "CropTarget") as
      CaptureTargetFactory | undefined,
    TrackProcessor: Reflect.get(scope, "MediaStreamTrackProcessor") as
      TrackProcessorConstructor | undefined,
  };
}

export type RenderSupport =
  | { isSupported: true }
  | {
      isSupported: false;
      /** The first missing piece, for the message the admin sees. */
      missing:
        "screen-capture" | "element-capture" | "frame-reader" | "encoder";
    };

/**
 * Whether this browser can render a film to video. Chrome and Edge on a
 * computer can; Firefox, Safari and every phone browser lack at least one
 * piece. Codec support is checked separately, at render time, because it is
 * asynchronous and depends on the resolution.
 */
export function detectRenderSupport(scope: object = globalThis): RenderSupport {
  const mediaDevices = (
    Reflect.get(scope, "navigator") as Navigator | undefined
  )?.mediaDevices;
  if (typeof mediaDevices?.getDisplayMedia !== "function") {
    return { isSupported: false, missing: "screen-capture" };
  }
  const apis = captureApis(scope);
  if (!apis.restrictionTarget && !apis.cropTarget) {
    return { isSupported: false, missing: "element-capture" };
  }
  if (!apis.TrackProcessor) {
    return { isSupported: false, missing: "frame-reader" };
  }
  if (
    !Reflect.has(scope, "VideoEncoder") ||
    !Reflect.has(scope, "AudioEncoder")
  ) {
    return { isSupported: false, missing: "encoder" };
  }
  return { isSupported: true };
}
