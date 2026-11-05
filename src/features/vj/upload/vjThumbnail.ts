import { VJ_LIMITS } from "../../../shared/contracts/vj";
import {
  VJ_PIXELATED_MIN_SCALE,
  VJ_THUMBNAIL_QUALITY,
  VJ_THUMBNAIL_RETRY_QUALITY,
} from "../vj.constants";
import { VjUploadFailure } from "./vjUploadFailure";

const THUMBNAIL_CONTENT_TYPE = "image/webp";

/**
 * The thumbnail size for a clip: the longest edge at
 * `VJ_LIMITS.thumbnailLongEdgePx`, each side rounded and at least 1.
 * `isPixelated` when that scales the clip up by `VJ_PIXELATED_MIN_SCALE` or
 * more, so a tiny GIF stays crisp.
 */
export function vjThumbnailSize(
  width: number,
  height: number,
): { width: number; height: number; isPixelated: boolean } {
  const longestEdge = Math.max(width, height, 1);
  const scale = VJ_LIMITS.thumbnailLongEdgePx / longestEdge;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
    isPixelated: scale >= VJ_PIXELATED_MIN_SCALE,
  };
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  quality: number,
): Promise<Blob | null> {
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, THUMBNAIL_CONTENT_TYPE, quality);
  });
}

function isUsableThumbnail(blob: Blob | null): blob is Blob {
  return blob !== null && blob.type === THUMBNAIL_CONTENT_TYPE;
}

async function encodeThumbnail(canvas: HTMLCanvasElement): Promise<Blob> {
  const firstBlob = await canvasToBlob(canvas, VJ_THUMBNAIL_QUALITY);
  if (!isUsableThumbnail(firstBlob)) {
    throw new VjUploadFailure("VJ_UPLOAD_THUMBNAIL_FAILED");
  }
  if (firstBlob.size <= VJ_LIMITS.thumbnailMaxBytes) return firstBlob;
  const smallerBlob = await canvasToBlob(canvas, VJ_THUMBNAIL_RETRY_QUALITY);
  if (
    !isUsableThumbnail(smallerBlob) ||
    smallerBlob.size > VJ_LIMITS.thumbnailMaxBytes
  ) {
    throw new VjUploadFailure("VJ_UPLOAD_THUMBNAIL_FAILED");
  }
  return smallerBlob;
}

/**
 * Draws a clip frame as a WebP thumbnail (contract 8.4 step 4): quality 0.7,
 * again at 0.5 when over 256 KB. A browser that cannot encode WebP, a null
 * blob or one still over the cap throws `VJ_UPLOAD_THUMBNAIL_FAILED`.
 */
export async function drawVjThumbnail(
  frame: CanvasImageSource,
  width: number,
  height: number,
): Promise<Blob> {
  const size = vjThumbnailSize(width, height);
  const canvas = document.createElement("canvas");
  try {
    canvas.width = size.width;
    canvas.height = size.height;
    const context = canvas.getContext("2d");
    if (!context) throw new VjUploadFailure("VJ_UPLOAD_THUMBNAIL_FAILED");
    context.imageSmoothingEnabled = !size.isPixelated;
    context.drawImage(frame, 0, 0, size.width, size.height);
    return await encodeThumbnail(canvas);
  } catch (error) {
    if (error instanceof VjUploadFailure) throw error;
    throw new VjUploadFailure("VJ_UPLOAD_THUMBNAIL_FAILED", { cause: error });
  } finally {
    canvas.width = 0;
    canvas.height = 0;
  }
}
