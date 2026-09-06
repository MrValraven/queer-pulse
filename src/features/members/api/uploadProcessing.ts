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
  // A persona's banner. Its own kind rather than a second use of `story-cover`
  // because it renders at a far wider shape (see CROP_CONFIG below): the
  // minimum is stated at the banner's own 3:1 aspect so the reframe editor's
  // minimum-crop clamp stays aspect-consistent instead of squaring off the
  // frame at one edge.
  "persona-cover": {
    maxBytes: 10 * MB,
    maxLabel: "10 MB",
    minWidth: 1500,
    minHeight: 500,
  },
  // Listing gallery photo — landscape, matches the "≥1200px wide · under 5MB" hint.
  "listing-photo": {
    maxBytes: 5 * MB,
    maxLabel: "5 MB",
    minWidth: 1200,
    minHeight: 600,
  },
  // A community's cover banner — full-bleed hero on the homepage featured card,
  // same constraints as a story cover (min 1200 × 600px, under 10 MB).
  "community-cover": {
    maxBytes: 10 * MB,
    maxLabel: "10 MB",
    minWidth: 1200,
    minHeight: 600,
  },
  // A community's square identity mark, shown beside its name next to the wide
  // `community-cover` banner. Same constraints as a member/group avatar (min
  // 200 × 200px, under 5 MB), which is also the backend's own cap for the
  // `community-avatar` upload kind.
  "community-avatar": {
    maxBytes: 5 * MB,
    maxLabel: "5 MB",
    minWidth: 200,
    minHeight: 200,
  },
  // A message-composer image attachment (MSG-8) — no minimum, a member should
  // be able to share a small screenshot or a square photo just as easily as a
  // landscape one. Mirrors the backend's 8 MB cap (`upload-kinds.ts`).
  "message-image": { maxBytes: 8 * MB, maxLabel: "8 MB" },
  // A message-composer DOCUMENT attachment (PRD-226). Never actually read by
  // this file's image pipeline (`validateTypeAndSize`/`processImage` are
  // never called for a document — see `DocumentComposerButton`'s own
  // `validateDocumentTypeAndSize`), but `UPLOAD_LIMITS` is a `Record<UploadKind,
  // …>` so every kind needs an entry. 20 MB mirrors the backend's cap
  // (`message-document` in `upload-kinds.ts`) — deliberately above the image
  // cap, since a multi-page scanned lease is never downscaled the way a photo
  // is.
  "message-document": { maxBytes: 20 * MB, maxLabel: "20 MB" },
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
  "community-cover": 2560,
  // A square identity mark, never a hero: the same 1600px cap the other
  // avatars get rather than the wide-banner one above it.
  "community-avatar": 1600,
  // Higher than the other wide heroes, and deliberately so: a persona banner
  // is the ONE image on the page that spans the full viewport at full
  // browser width with nothing inset around it, so on a 2× display at a
  // ~1900px-wide window it has to fill ~3800 device px. At the 2560 cap it
  // shared with `story-cover` the browser was upscaling it ~1.5×, which is
  // exactly the soft, blurry banner members were reporting. 3200 costs a few
  // hundred KB more per cover and takes the upscale down to ~1.2×, which is
  // no longer visible on line art or type.
  "persona-cover": 3200,
  // A chat bubble never renders wider than the message column — a photo
  // slot, not a full-bleed hero, so it gets the same 1600px cap as an avatar/
  // work image rather than the wide-hero kinds above.
  "message-image": 1600,
  // Unused: a document is never decoded/resampled through this canvas
  // pipeline (see the `"message-image"` entry above's sibling note on
  // `UPLOAD_LIMITS`). Present only so the `Record<UploadKind, …>` stays total.
  "message-document": 0,
};

/** Re-encode quality used once an image is actually being downscaled — a
 *  smaller canvas can afford more compression than the pass-through case
 *  below, since the byte-size win is the whole point of resizing. Applies to
 *  the JPEG/WebP fallback path; WebP has its own pair below. */
const DOWNSCALE_QUALITY = 0.8;

/** Re-encode quality when the source is already within `MAX_DIMENSION_PX` —
 *  the canvas round-trip still happens (it's what strips EXIF), so this
 *  stays high to avoid visibly softening an image that didn't need shrinking. */
const PASSTHROUGH_QUALITY = 0.92;

/**
 * WebP quality pair, used whenever the browser can encode it (`canEncodeWebp`).
 *
 * WebP is roughly 25-35% smaller than JPEG at matched visual quality, and it
 * carries alpha — so it is the better output for EVERY source format we accept
 * here, including a PNG (whose `quality` argument `canvas.toBlob` ignores
 * entirely, leaving a photo-shaped PNG stored losslessly at several MB). The
 * numbers sit slightly above the JPEG pair because WebP's quality scale is not
 * the same curve: q0.82 lands around JPEG q0.90 to the eye while still coming
 * out meaningfully smaller.
 *
 * The point of the saving is CRISPNESS, not just bytes: the same byte budget
 * now buys more stored pixels, which is what keeps a full-bleed banner sharp
 * on a 2× display.
 */
const WEBP_DOWNSCALE_QUALITY = 0.82;
const WEBP_PASSTHROUGH_QUALITY = 0.9;

/**
 * Quality used for a PNG source that is NOT being downscaled.
 *
 * `canvas.toBlob` ignores the quality argument for `image/png`, so a PNG has
 * always been stored LOSSLESSLY up to now. Screenshots and line art reach us as
 * PNG (a chat `message-image` especially), and those are exactly the images
 * where lossy ringing on hard edges is visible, so re-encoding them at 0.9
 * would be a real quality regression to pay for a byte saving. Quality 1 asks
 * for lossless WebP (Chrome honours it as lossless outright; other engines give
 * their maximum lossy setting), which still comes out smaller than the PNG it
 * replaces. A PNG that IS being downscaled takes the normal lossy path — the
 * resample already gave up pixel-exactness, so there is nothing left to
 * preserve.
 */
const WEBP_LOSSLESS_QUALITY = 1;

/**
 * Steepest reduction we allow a single `drawImage` to perform. Canvas
 * downscaling samples a fixed, small neighbourhood of source pixels, so a
 * one-shot 4032px → 1600px draw (2.5×) simply throws most of the source away:
 * the result aliases on fine detail and reads as SOFT, which is a large part of
 * the "my photo looks blurry" report. Halving repeatedly until the remaining
 * step is within this ratio keeps every pass inside the range the sampler
 * handles well, at the cost of a couple of extra intermediate canvases.
 */
const MAX_RESAMPLE_STEP_RATIO = 2;

/**
 * Whether `canvas.toBlob` on this browser can actually produce WebP. Every
 * current browser can (Safari since 14), but the check is cheap and the failure
 * mode without it is bad: `toBlob` silently answers PNG for a type it cannot
 * encode, which for a 3200px photo is a multi-MB lossless file that may blow the
 * per-kind byte cap. Memoized — the probe canvas is built at most once.
 */
let webpEncodeSupport: boolean | null = null;
function canEncodeWebp(): boolean {
  if (webpEncodeSupport !== null) return webpEncodeSupport;
  try {
    const probe = document.createElement("canvas");
    probe.width = 1;
    probe.height = 1;
    webpEncodeSupport = probe
      .toDataURL("image/webp")
      .startsWith("data:image/webp");
  } catch {
    webpEncodeSupport = false;
  }
  return webpEncodeSupport;
}

/** A 2D canvas of the given size with high-quality resampling switched on.
 *  `imageSmoothingQuality` defaults to `"low"`, which is the cheapest and
 *  softest filter the browser has — for a downscale we want its best. */
function makeSmoothCanvas(
  width: number,
  height: number,
): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no-2d-context");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  return { canvas, ctx };
}

/**
 * Draw `source` down to exactly `targetWidth`×`targetHeight`, halving through
 * intermediate canvases while the remaining reduction is steeper than
 * `MAX_RESAMPLE_STEP_RATIO` (see that constant for why one big step is worse).
 * An upscale or a mild reduction takes the single-draw path, so nothing extra
 * is allocated for the images that never needed it.
 */
function drawResampled(
  source: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
  targetHeight: number,
): HTMLCanvasElement {
  let currentSource = source;
  let currentWidth = sourceWidth;
  let currentHeight = sourceHeight;
  // Each pass at most halves, and never undershoots the target, so this
  // strictly decreases towards `targetWidth` and terminates.
  while (currentWidth > targetWidth * MAX_RESAMPLE_STEP_RATIO) {
    const stepWidth = Math.max(targetWidth, Math.round(currentWidth / 2));
    const stepHeight = Math.max(targetHeight, Math.round(currentHeight / 2));
    const step = makeSmoothCanvas(stepWidth, stepHeight);
    step.ctx.drawImage(currentSource, 0, 0, stepWidth, stepHeight);
    currentSource = step.canvas;
    currentWidth = stepWidth;
    currentHeight = stepHeight;
  }
  const output = makeSmoothCanvas(targetWidth, targetHeight);
  output.ctx.drawImage(currentSource, 0, 0, targetWidth, targetHeight);
  return output.canvas;
}

/** `canvas.toBlob` as a promise, throwing rather than resolving `null` so the
 *  fail-closed contract in `stripMetadata` holds. */
async function encodeCanvas(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob> {
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, type, quality),
  );
  if (!blob) throw new Error("encode-failed");
  return blob;
}

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
  // `Math.max(1, ...)` guards the extreme-aspect case (a 4000×1 strip rounds its
  // short edge to 0), where a zero-sized canvas would fail the encode outright.
  return {
    width: Math.max(1, Math.round(width * scaleFactor)),
    height: Math.max(1, Math.round(height * scaleFactor)),
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
  if (
    bytes.length < 13 ||
    String.fromCharCode(read(0), read(1), read(2)) !== "GIF"
  ) {
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
        const identifier = String.fromCharCode(
          ...bytes.subarray(dataStart + 1, dataStart + 9),
        );
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
 *     (full-res originals only cost storage/bandwidth forever after). The
 *     downscale runs through `drawResampled` (stepped halving at
 *     `imageSmoothingQuality: "high"`) rather than one coarse draw, and the
 *     output is WebP wherever the browser can encode it — see
 *     `WEBP_DOWNSCALE_QUALITY` and `MAX_RESAMPLE_STEP_RATIO`. A browser that
 *     cannot encode WebP falls back to the source format at the original
 *     quality 0.92 unscaled / 0.8 downscaled.
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
    const target = capDimensions(
      decoded.width,
      decoded.height,
      MAX_DIMENSION_PX[kind],
    );
    const canvas = drawResampled(
      decoded.source,
      decoded.width,
      decoded.height,
      target.width,
      target.height,
    );
    if (!canEncodeWebp()) {
      // Legacy path: re-encode in the source's own format, exactly as before.
      return await encodeCanvas(
        canvas,
        file.type,
        target.scaled ? DOWNSCALE_QUALITY : PASSTHROUGH_QUALITY,
      );
    }
    const webpQuality = target.scaled
      ? WEBP_DOWNSCALE_QUALITY
      : file.type === "image/png"
        ? WEBP_LOSSLESS_QUALITY
        : WEBP_PASSTHROUGH_QUALITY;
    const blob = await encodeCanvas(canvas, "image/webp", webpQuality);
    // `toBlob` answers PNG for a type it cannot encode rather than failing, and
    // `canEncodeWebp` is a probe, not a promise — so confirm what we actually
    // got and fall back to the source format rather than uploading a multi-MB
    // lossless PNG that could exceed the kind's byte cap.
    if (blob.type !== "image/webp") {
      return await encodeCanvas(
        canvas,
        file.type,
        target.scaled ? DOWNSCALE_QUALITY : PASSTHROUGH_QUALITY,
      );
    }
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

export interface AspectConfig {
  aspect: number | "free";
  aspectLabel: string;
  allowFreeform: boolean;
}

/**
 * Per-kind crop aspect config for the reframe UI. Locked aspects match each
 * kind's rendered shape (avatars/group avatars are always circular/square
 * crops; story/community covers and listing photos are full-bleed 2:1
 * banners). Work images and gathering photos render at whatever aspect the
 * member frames, so they stay freeform.
 */
export const CROP_CONFIG: Record<UploadKind, AspectConfig> = {
  avatar: { aspect: 1, aspectLabel: "1:1", allowFreeform: false },
  "group-avatar": { aspect: 1, aspectLabel: "1:1", allowFreeform: false },
  "story-cover": { aspect: 2, aspectLabel: "2:1", allowFreeform: false },
  // A persona banner is NOT a 2:1 plate like a magazine cover. It paints as a
  // full-bleed strip whose real aspect runs ~4:1 to ~7:1 across the skins at
  // desktop width and narrows to ~2:1 on a phone, so no single number is
  // truthful everywhere. 3:1 sits in the middle of that range — close enough
  // that the frame the member sees is close to the frame they get — and
  // `cropFocalPosition` covers the remaining difference by panning towards
  // the centre of the crop rather than the centre of the file.
  "persona-cover": { aspect: 3, aspectLabel: "3:1", allowFreeform: false },
  "community-cover": { aspect: 2, aspectLabel: "2:1", allowFreeform: false },
  // The community's square mark renders in a circle/rounded square slot, so it
  // locks to 1:1 exactly like a member or group avatar.
  "community-avatar": { aspect: 1, aspectLabel: "1:1", allowFreeform: false },
  "listing-photo": { aspect: 2, aspectLabel: "2:1", allowFreeform: false },
  "work-image": { aspect: "free", aspectLabel: "free", allowFreeform: true },
  "gathering-photo": {
    aspect: "free",
    aspectLabel: "free",
    allowFreeform: true,
  },
  // Unused in practice — the message composer never opens the reframe editor
  // (a chat photo sends as-is), but every `UploadKind` needs an entry here.
  "message-image": { aspect: "free", aspectLabel: "free", allowFreeform: true },
  // Unused: a document has no crop/reframe UI at all (there is nothing to
  // frame). Present only so the `Record<UploadKind, …>` stays total.
  "message-document": {
    aspect: "free",
    aspectLabel: "free",
    allowFreeform: true,
  },
};

/** Minimum output pixel dimensions for the crop, derived from `UPLOAD_LIMITS`. */
export function getMinOutput(kind: UploadKind): {
  width: number;
  height: number;
} {
  const limit = UPLOAD_LIMITS[kind];
  return { width: limit.minWidth ?? 1, height: limit.minHeight ?? 1 };
}
