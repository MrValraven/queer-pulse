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
 * is routinely 3000-4000px on its long edge. Without a cap, full-resolution
 * originals are what gets stored AND re-served forever after — the cost
 * compounds with every photo a member ever uploads. Skipped entirely when the
 * source is already at or under the cap (no upscaling, no wasted re-encode for
 * an already-small file).
 *
 * The cap is per-kind. Most slots (avatar, work image, gathering photo) never
 * render wider than ~1600px, so 1600 keeps them crisp without paying for
 * pixels no slot ever shows. The persona/story COVER and the listing photo are
 * the exception: they paint a FULL-BLEED hero banner that on a 2× desktop
 * display spans ~2560px across, so a 1600px cap forces the browser to upscale
 * the stored image — which reads as the soft, blurry banner we're avoiding.
 * Give those wide heroes a larger cap so they stay sharp edge-to-edge.
 */
const MAX_DIMENSION_PX: Record<UploadKind, number> = {
  avatar: 1600,
  "group-avatar": 1600,
  "gathering-photo": 1600,
  "work-image": 1600,
  "story-cover": 2560,
  "listing-photo": 2560,
};

/** Re-encode quality used once an image is actually being downscaled — a
 *  smaller canvas can afford more compression than the pass-through case
 *  below, since the byte-size win is the whole point of resizing. */
const DOWNSCALE_QUALITY = 0.8;

/** Re-encode quality when the source is already within `MAX_DIMENSION_PX` —
 *  the canvas round-trip still happens (it's what strips EXIF), so this
 *  stays high to avoid visibly softening an image that didn't need shrinking. */
const PASSTHROUGH_QUALITY = 0.92;

/**
 * Scale `width`×`height` down so its longest edge is at most `maxDimension`,
 * preserving aspect ratio. Returns the original dimensions unchanged (and
 * `scaled: false`) when already within the cap — this function only ever
 * shrinks, never enlarges.
 */
function capDimensions(
  width: number,
  height: number,
  maxDimension: number,
): { width: number; height: number; scaled: boolean } {
  const longestEdge = Math.max(width, height);
  if (longestEdge <= maxDimension) {
    return { width, height, scaled: false };
  }
  const scaleFactor = maxDimension / longestEdge;
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
 * Walk a set of GIF sub-blocks (`[size][…size bytes]` repeated, terminated by a
 * zero-length block) starting at `pos`, returning the index just past the
 * terminator. Throws on a truncated stream so the caller can fail closed.
 */
function skipSubBlocks(bytes: Uint8Array, pos: number): number {
  while (pos < bytes.length) {
    const size = bytes[pos] ?? 0; // bounded by the while guard; `?? 0` appeases noUncheckedIndexedAccess
    pos += 1;
    if (size === 0) return pos;
    pos += size;
  }
  throw new Error("gif-truncated");
}

/**
 * Strip metadata from an (animated) GIF *without* re-encoding its frames, so
 * the animation survives. A canvas round-trip would flatten a GIF to one
 * frame, so instead we parse the block structure and copy everything through
 * EXCEPT the blocks that can carry personal data:
 *   - Comment Extensions (`0x21 0xFE`) — dropped unconditionally.
 *   - Application Extensions (`0x21 0xFF`) — dropped UNLESS they're the
 *     NETSCAPE/ANIMEXTS loop-count block (needed for animation). This is where
 *     an "XMP Data" packet (which can embed GPS) lives, so it gets removed.
 * Graphic-control, plain-text, image-descriptor and colour-table blocks are
 * preserved byte-for-byte. Throws on any structural surprise — the caller
 * turns that into a blocked upload rather than shipping the original.
 */
function sanitizeGif(bytes: Uint8Array): Uint8Array<ArrayBuffer> {
  // `read` returns the byte at `index`, or 0 past the end; every read below is
  // either length-checked or followed by a `skipSubBlocks` that throws on a
  // truncated stream, so a bogus 0 can never smuggle raw metadata through.
  const read = (index: number): number => bytes[index] ?? 0;
  // Header (6) + Logical Screen Descriptor (7) = 13 bytes minimum.
  if (bytes.length < 13 || String.fromCharCode(read(0), read(1), read(2)) !== "GIF") {
    throw new Error("gif-bad-header");
  }
  const chunks: Uint8Array[] = [];
  const packed = read(10);
  let pos = 13;
  if ((packed & 0x80) !== 0) {
    // Global Colour Table: 3 × 2^(size+1) bytes.
    pos += 3 * (1 << ((packed & 0x07) + 1));
  }
  // Header + Logical Screen Descriptor + Global Colour Table pass through.
  chunks.push(bytes.subarray(0, pos));

  while (pos < bytes.length) {
    const marker = read(pos);
    if (marker === 0x3b) {
      // Trailer — end of stream.
      chunks.push(bytes.subarray(pos, pos + 1));
      break;
    }
    if (marker === 0x2c) {
      // Image Descriptor: 10-byte header, optional Local Colour Table,
      // LZW min-code-size byte, then image-data sub-blocks.
      const start = pos;
      const imagePacked = read(pos + 9);
      pos += 10;
      if ((imagePacked & 0x80) !== 0) {
        pos += 3 * (1 << ((imagePacked & 0x07) + 1));
      }
      pos += 1; // LZW minimum code size
      pos = skipSubBlocks(bytes, pos);
      chunks.push(bytes.subarray(start, pos));
      continue;
    }
    if (marker === 0x21) {
      const label = read(pos + 1);
      const blockStart = pos;
      const dataStart = pos + 2;
      const end = skipSubBlocks(bytes, dataStart);
      if (label === 0xfe) {
        // Comment Extension — drop.
        pos = end;
        continue;
      }
      if (label === 0xff) {
        // Application Extension — keep only the animation loop-count block.
        const identifier = String.fromCharCode(...bytes.subarray(dataStart + 1, dataStart + 9));
        if (identifier === "NETSCAPE" || identifier === "ANIMEXTS") {
          chunks.push(bytes.subarray(blockStart, end));
        }
        pos = end;
        continue;
      }
      // Graphic Control (0xF9), Plain Text (0x01), etc. — preserve.
      chunks.push(bytes.subarray(blockStart, end));
      pos = end;
      continue;
    }
    throw new Error("gif-unknown-block");
  }

  const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }
  return out;
}

/**
 * Produce an EXIF/GPS-free upload blob — the CLIENT is the authoritative strip
 * (the presigned-upload backend never sees the bytes), so this MUST fail closed:
 * every path either returns metadata-free bytes or throws
 * `members:upload.error.stripFailed`. It NEVER returns the original file — an
 * image whose metadata we can't remove is blocked, not uploaded raw.
 *   - GIFs are sanitized in place (`sanitizeGif`) so animation survives.
 *   - JPEG/PNG/WebP are re-encoded through a `<canvas>`, which drops metadata
 *     AND downscales to the per-kind `MAX_DIMENSION_PX` cap on the longest edge
 *     (full-res originals only cost storage/bandwidth forever after). Lossy
 *     re-encode uses quality 0.92 when passed through unscaled, 0.8 when
 *     actually downscaled.
 */
async function stripMetadata(
  file: File,
  decoded: Decoded,
  kind: UploadKind,
): Promise<Blob> {
  try {
    if (file.type === "image/gif") {
      const cleaned = sanitizeGif(new Uint8Array(await file.arrayBuffer()));
      return new Blob([cleaned], { type: "image/gif" });
    }
    const target = capDimensions(decoded.width, decoded.height, MAX_DIMENSION_PX[kind]);
    const canvas = document.createElement("canvas");
    canvas.width = target.width;
    canvas.height = target.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("no-2d-context");
    ctx.drawImage(decoded.source, 0, 0, target.width, target.height);
    const quality = target.scaled ? DOWNSCALE_QUALITY : PASSTHROUGH_QUALITY;
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, file.type, quality),
    );
    if (!blob) throw new Error("encode-failed");
    return blob;
  } catch (err) {
    if (err instanceof ImageProcessingError) throw err;
    // Fail CLOSED: never ship the un-stripped original.
    throw new ImageProcessingError("members:upload.error.stripFailed");
  }
}

/**
 * Validate dimensions and return an EXIF-stripped, longest-edge-capped
 * (`MAX_DIMENSION_PX`) `Blob` ready to upload. Runs in BOTH demo and live
 * mode, for every `UploadKind` (avatar, listing photo, gathering photo,
 * story cover, work image, group avatar) since they all funnel through here.
 * Throws a human message on a too-small image, an undecodable file, or an
 * image whose metadata can't be stripped (fail closed — see `stripMetadata`).
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
    return await stripMetadata(file, decoded, kind);
  } finally {
    decoded.cleanup();
  }
}
