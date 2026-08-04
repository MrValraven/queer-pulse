import type { TranslateOptions } from "../../../shared/i18n/types";
import type { UploadContentType, UploadKind } from "./uploads.api";

/**
 * Thrown by the upload pipeline instead of a hardcoded English `Error` —
 * carries a `members:` catalog key (+ interpolation values) so the UI can
 * resolve it through `t()` rather than rendering source-code English
 * straight into a `role="alert"`. Runs in both demo and live mode, so the
 * message itself is chrome, not fetched content.
 */
export class ImageProcessingError extends Error {
  readonly i18nKey: string;
  readonly values?: TranslateOptions;

  constructor(i18nKey: string, values?: TranslateOptions) {
    super(i18nKey);
    this.name = "ImageProcessingError";
    this.i18nKey = i18nKey;
    this.values = values;
  }
}

/** Content types the backend accepts; anything else is rejected client-side. */
export const ALLOWED = new Set<UploadContentType>([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const MB = 1024 * 1024;

export interface UploadLimit {
  /** Hard byte cap — mirrors the server's per-kind cap. */
  maxBytes: number;
  /** Human label for the cap, used in the error message ("5 MB"). */
  maxLabel: string;
  /** Minimum pixel dimensions, when the surface needs them. */
  minWidth?: number;
  minHeight?: number;
}

/**
 * Per-kind limits — the single place validation copy + caps live. Mirrors the
 * server caps in the presign contract (`uploads.api.ts`); the server stays
 * authoritative, this just gives the member instant, friendly feedback.
 */
export const UPLOAD_LIMITS: Record<UploadKind, UploadLimit> = {
  avatar: { maxBytes: 5 * MB, maxLabel: "5 MB", minWidth: 200, minHeight: 200 },
  // A group chat's photo — same constraints as a member avatar.
  "group-avatar": {
    maxBytes: 5 * MB,
    maxLabel: "5 MB",
    minWidth: 200,
    minHeight: 200,
  },
  "gathering-photo": {
    maxBytes: 5 * MB,
    maxLabel: "5 MB",
    minWidth: 200,
    minHeight: 200,
  },
  "work-image": {
    maxBytes: 10 * MB,
    maxLabel: "10 MB",
    minWidth: 400,
    minHeight: 300,
  },
  // Cover copy promises min 1200 × 600px — enforce it.
  "story-cover": {
    maxBytes: 10 * MB,
    maxLabel: "10 MB",
    minWidth: 1200,
    minHeight: 600,
  },
  // Listing gallery photo — landscape, matches the "≥1200px wide · under 5MB" hint.
  "listing-photo": {
    maxBytes: 5 * MB,
    maxLabel: "5 MB",
    minWidth: 1200,
    minHeight: 600,
  },
};

/** Type + size guards. Throws a human-readable `Error` the UI shows in role="alert". */
export function validateTypeAndSize(file: File, kind: UploadKind): void {
  if (!ALLOWED.has(file.type as UploadContentType)) {
    throw new ImageProcessingError("members:upload.error.unsupportedType");
  }
  const limit = UPLOAD_LIMITS[kind];
  if (file.size > limit.maxBytes) {
    throw new ImageProcessingError("members:upload.error.tooLarge", {
      maxLabel: limit.maxLabel,
    });
  }
}

interface Decoded {
  width: number;
  height: number;
  source: CanvasImageSource;
  cleanup: () => void;
}

/**
 * Longest-edge cap applied to every upload kind before it ever reaches the
 * network — a listing/story photo picked straight off a modern phone camera
 * is routinely 3000-4000px on its long edge, but no upload slot in the app
 * (gallery hero, avatar, work image) ever displays wider than ~1600px. Without
 * this, full-resolution originals are what gets stored AND re-served into
 * those tiny slots forever after — the cost compounds with every photo a
 * member ever uploads. Skipped entirely when the source is already at or
 * under the cap (no upscaling, no wasted re-encode for an already-small file).
 */
const MAX_DIMENSION_PX = 1600;

/** Re-encode quality used once an image is actually being downscaled — a
 *  smaller canvas can afford more compression than the pass-through case
 *  below, since the byte-size win is the whole point of resizing. */
const DOWNSCALE_QUALITY = 0.8;

/** Re-encode quality when the source is already within `MAX_DIMENSION_PX` —
 *  the canvas round-trip still happens (it's what strips EXIF), so this
 *  stays high to avoid visibly softening an image that didn't need shrinking. */
const PASSTHROUGH_QUALITY = 0.92;

/**
 * Scale `width`×`height` down so its longest edge is at most
 * `MAX_DIMENSION_PX`, preserving aspect ratio. Returns the original
 * dimensions unchanged (and `scaled: false`) when already within the cap —
 * this function only ever shrinks, never enlarges.
 */
function capDimensions(
  width: number,
  height: number,
): { width: number; height: number; scaled: boolean } {
  const longestEdge = Math.max(width, height);
  if (longestEdge <= MAX_DIMENSION_PX) {
    return { width, height, scaled: false };
  }
  const scaleFactor = MAX_DIMENSION_PX / longestEdge;
  return {
    width: Math.round(width * scaleFactor),
    height: Math.round(height * scaleFactor),
    scaled: true,
  };
}

/** Decode a file to something we can measure and draw. Prefers `createImageBitmap`. */
async function decode(file: File): Promise<Decoded> {
  if (typeof createImageBitmap === "function") {
    const bmp = await createImageBitmap(file);
    return {
      width: bmp.width,
      height: bmp.height,
      source: bmp,
      cleanup: () => bmp.close(),
    };
  }
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("decode-failed"));
      el.src = url;
    });
    return {
      width: img.naturalWidth,
      height: img.naturalHeight,
      source: img,
      cleanup: () => URL.revokeObjectURL(url),
    };
  } catch (err) {
    URL.revokeObjectURL(url);
    throw err;
  }
}

/**
 * Re-encode the decoded pixels through a `<canvas>`, which DROPS all EXIF/GPS
 * metadata (defence-in-depth for the outing risk — the server strip stays
 * authoritative) AND downscales to `MAX_DIMENSION_PX` on the longest edge —
 * the client-side half of "never store/re-serve a full-res original that no
 * upload slot ever displays at that size." Tradeoffs, so we only do it for
 * still raster types:
 *   - JPEG/WebP re-encode is lossy → quality 0.92 when passed through
 *     unscaled, 0.8 when actually downscaled (see `DOWNSCALE_QUALITY`/
 *     `PASSTHROUGH_QUALITY` above).
 *   - Animated GIFs would be flattened to one frame, so we SKIP them entirely
 *     (no resize, no re-encode) and let the server strip do the work.
 *   - On any failure we fall back to the original file (server strip covers us).
 */
async function stripMetadata(file: File, decoded: Decoded): Promise<Blob> {
  if (file.type === "image/gif") return file; // preserve animation
  try {
    const target = capDimensions(decoded.width, decoded.height);
    const canvas = document.createElement("canvas");
    canvas.width = target.width;
    canvas.height = target.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(decoded.source, 0, 0, target.width, target.height);
    const quality = target.scaled ? DOWNSCALE_QUALITY : PASSTHROUGH_QUALITY;
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, file.type, quality),
    );
    return blob ?? file;
  } catch {
    return file; // server strip remains the source of truth
  }
}

/**
 * Validate dimensions and return an EXIF-stripped, longest-edge-capped
 * (`MAX_DIMENSION_PX`) `Blob` ready to upload. Runs in BOTH demo and live
 * mode, for every `UploadKind` (avatar, listing photo, gathering photo,
 * story cover, work image, group avatar) since they all funnel through here.
 * Throws a human message on a too-small image or an undecodable file.
 */
export async function processImage(
  file: File,
  kind: UploadKind,
): Promise<Blob> {
  const limit = UPLOAD_LIMITS[kind];
  let decoded: Decoded;
  try {
    decoded = await decode(file);
  } catch {
    throw new ImageProcessingError("members:upload.error.decodeFailed");
  }
  try {
    if (
      (limit.minWidth && decoded.width < limit.minWidth) ||
      (limit.minHeight && decoded.height < limit.minHeight)
    ) {
      throw new ImageProcessingError("members:upload.error.tooSmall", {
        minWidth: limit.minWidth,
        minHeight: limit.minHeight,
      });
    }
    return await stripMetadata(file, decoded);
  } finally {
    decoded.cleanup();
  }
}
