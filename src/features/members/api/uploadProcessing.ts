import type { UploadContentType, UploadKind } from "./uploads.api";

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
};

/** Type + size guards. Throws a human-readable `Error` the UI shows in role="alert". */
export function validateTypeAndSize(file: File, kind: UploadKind): void {
  if (!ALLOWED.has(file.type as UploadContentType)) {
    throw new Error(
      "That image type isn't supported. Use a JPEG, PNG, WebP or GIF.",
    );
  }
  const limit = UPLOAD_LIMITS[kind];
  if (file.size > limit.maxBytes) {
    throw new Error(
      `That image is too large — keep it under ${limit.maxLabel}.`,
    );
  }
}

interface Decoded {
  width: number;
  height: number;
  source: CanvasImageSource;
  cleanup: () => void;
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
 * authoritative). Tradeoffs, so we only do it for still raster types:
 *   - JPEG/WebP re-encode is lossy → quality 0.92 to stay visually clean.
 *   - Animated GIFs would be flattened to one frame, so we SKIP them and let the
 *     server strip do the work.
 *   - On any failure we fall back to the original file (server strip covers us).
 */
async function stripMetadata(file: File, decoded: Decoded): Promise<Blob> {
  if (file.type === "image/gif") return file; // preserve animation
  try {
    const canvas = document.createElement("canvas");
    canvas.width = decoded.width;
    canvas.height = decoded.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(decoded.source, 0, 0, decoded.width, decoded.height);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, file.type, 0.92),
    );
    return blob ?? file;
  } catch {
    return file; // server strip remains the source of truth
  }
}

/**
 * Validate dimensions and return an EXIF-stripped `Blob` ready to upload.
 * Runs in BOTH demo and live mode. Throws a human message on a too-small image
 * or an undecodable file.
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
    throw new Error("We couldn't read that image. Try a different file.");
  }
  try {
    if (
      (limit.minWidth && decoded.width < limit.minWidth) ||
      (limit.minHeight && decoded.height < limit.minHeight)
    ) {
      throw new Error(
        `This image is too small — it needs to be at least ${limit.minWidth} × ${limit.minHeight}px.`,
      );
    }
    return await stripMetadata(file, decoded);
  } finally {
    decoded.cleanup();
  }
}
