import {
  VJ_LIMITS,
  type VjClientUploadCode,
} from "../../../shared/contracts/vj";
import { vjSniffClipFormat } from "./vjSniff";

/** Contract 9.4: the preview is drawn and recorded at this frame rate. */
export const VJ_PREVIEW_FPS = 24;
/** Contract 9.4: the first take's video bitrate. */
export const VJ_PREVIEW_BITS_PER_SECOND = 400_000;
/** Contract 9.4: the one retry's bitrate, when the first take is over the cap. */
export const VJ_PREVIEW_RETRY_BITS_PER_SECOND = 200_000;
/** Contract 9.4 order. */
export const VJ_PREVIEW_RECORDER_TYPES = [
  "video/webm;codecs=vp9",
  "video/webm;codecs=vp8",
  "video/mp4",
] as const;

export interface VjPreviewRecorderChoice {
  mimeType: (typeof VJ_PREVIEW_RECORDER_TYPES)[number];
  contentType: "video/webm" | "video/mp4";
}

/** What this browser offers for making previews. A seam, so tests pass their own. */
export interface VjPreviewEnvironment {
  /** `MediaRecorder.isTypeSupported`, null without `MediaRecorder`. */
  isTypeSupported: ((mimeType: string) => boolean) | null;
  /** `"captureStream" in HTMLCanvasElement.prototype`. */
  hasCanvasCapture: boolean;
  /** `typeof ImageDecoder !== "undefined"`. */
  hasImageDecoder: boolean;
}

export function readVjPreviewEnvironment(): VjPreviewEnvironment {
  const hasRecorder =
    typeof MediaRecorder !== "undefined" &&
    typeof MediaRecorder.isTypeSupported === "function";
  return {
    isTypeSupported: hasRecorder
      ? (mimeType: string) => MediaRecorder.isTypeSupported(mimeType)
      : null,
    hasCanvasCapture:
      typeof HTMLCanvasElement !== "undefined" &&
      "captureStream" in HTMLCanvasElement.prototype,
    hasImageDecoder: typeof ImageDecoder !== "undefined",
  };
}

/**
 * The first recorder type of `VJ_PREVIEW_RECORDER_TYPES` this browser records,
 * with the content type it uploads as. Null without `MediaRecorder`, without
 * canvas capture, or when no listed type is supported.
 */
export function pickVjPreviewRecorderType(
  environment: VjPreviewEnvironment = readVjPreviewEnvironment(),
): VjPreviewRecorderChoice | null {
  const isTypeSupported = environment.isTypeSupported;
  if (isTypeSupported === null || !environment.hasCanvasCapture) return null;
  const mimeType = VJ_PREVIEW_RECORDER_TYPES.find((recorderType) =>
    isTypeSupported(recorderType),
  );
  if (mimeType === undefined) return null;
  const contentType = mimeType.split(";")[0] as "video/webm" | "video/mp4";
  return { mimeType, contentType };
}

/** Whether this browser can make a preview for a clip of this kind. A GIF also needs `ImageDecoder`. */
export function isVjPreviewSupported(
  mediaKind: "video" | "gif",
  environment: VjPreviewEnvironment = readVjPreviewEnvironment(),
): boolean {
  if (pickVjPreviewRecorderType(environment) === null) return false;
  return mediaKind === "video" || environment.hasImageDecoder;
}

function evenSideOf(side: number): number {
  return Math.max(2, Math.round(side / 2) * 2);
}

/** Long edge at VJ_LIMITS.previewLongEdgePx, each side rounded to an even number, at least 2. */
export function vjPreviewSize(
  width: number,
  height: number,
): { width: number; height: number } {
  const longestEdge = Math.max(width, height, 1);
  const scale = VJ_LIMITS.previewLongEdgePx / longestEdge;
  return {
    width: evenSideOf(width * scale),
    height: evenSideOf(height * scale),
  };
}

/** Video: min(1000, durationMs / 2), 0 for a non-finite or missing duration. */
export function vjPreviewStartMs(durationMs: number | null): number {
  if (durationMs === null || !Number.isFinite(durationMs) || durationMs <= 0) {
    return 0;
  }
  return Math.min(1000, durationMs / 2);
}

/**
 * Whether the first bytes of a recorded preview pass the server's magic-byte
 * check for its content type (contract 4.3). An MP4 must carry an `ftyp` box
 * with a brand other than QuickTime `qt  `; this browser's recorder writes the
 * same header on every take, so a refused MP4 names `VJ_PREVIEW_UNSUPPORTED`.
 * A WebM without its EBML header is a broken take, `VJ_PREVIEW_FAILED`.
 * Null when the header is fine.
 */
export function vjPreviewHeaderCodeOf(
  firstBytes: Uint8Array,
  contentType: "video/webm" | "video/mp4",
): Extract<
  VjClientUploadCode,
  "VJ_PREVIEW_UNSUPPORTED" | "VJ_PREVIEW_FAILED"
> | null {
  const format = vjSniffClipFormat(firstBytes);
  if (contentType === "video/mp4") {
    return format === "mp4" ? null : "VJ_PREVIEW_UNSUPPORTED";
  }
  return format === "webm" ? null : "VJ_PREVIEW_FAILED";
}
