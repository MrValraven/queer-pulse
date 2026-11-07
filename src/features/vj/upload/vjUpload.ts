import { ApiError } from "../../../shared/api/client";
import { VJ_LIMITS, type VjClipDTO } from "../../../shared/contracts/vj";
import { sanitizeGif } from "../../members/api/uploadProcessing";
import {
  requestUpload,
  type PresignedUpload,
  type VjClipUploadContentType,
} from "../../members/api/uploads.api";
import { createVjClip } from "../api/vj.api";
import { VjDecodeError, decodeVjClip, type VjDecodedClip } from "./vjDecode";
import {
  VJ_SNIFFED_CONTENT_TYPE,
  hasHevcMarker,
  readVjBlobBytes,
  vjSniffClipFormat,
} from "./vjSniff";
import { drawVjThumbnail } from "./vjThumbnail";
import { VjUploadFailure } from "./vjUploadFailure";

/** A clip checked, measured and thumbnailed in the browser, ready to upload. */
export interface VjPreparedClip {
  contentType: VjClipUploadContentType;
  body: Blob;
  byteSize: number;
  width: number;
  height: number;
  durationMs: number | null;
  thumbnail: Blob;
  title: string;
}

/** Test seams for `prepareVjClipFile`; each defaults to the real browser step. */
export interface VjPrepareSeams {
  decode: typeof decodeVjClip;
  drawThumbnail: typeof drawVjThumbnail;
  sanitize: (bytes: Uint8Array) => Uint8Array;
  findHevc: typeof hasHevcMarker;
}

const DEFAULT_SEAMS: VjPrepareSeams = {
  decode: decodeVjClip,
  drawThumbnail: drawVjThumbnail,
  sanitize: sanitizeGif,
  findHevc: hasHevcMarker,
};

const SNIFF_BYTE_COUNT = 16;
const DEMO_PROGRESS_STEP = 20;
const DEMO_PROGRESS_STEP_MS = 120;

/**
 * The clip title from a file name: the last extension dropped, trimmed and cut
 * to `VJ_LIMITS.clipTitleMax` code points; `untitledTitle` when nothing is left.
 */
export function vjClipTitleOf(fileName: string, untitledTitle: string): string {
  const extensionStart = fileName.lastIndexOf(".");
  const baseName =
    extensionStart >= 0 ? fileName.slice(0, extensionStart) : fileName;
  const title = Array.from(baseName.trim())
    .slice(0, VJ_LIMITS.clipTitleMax)
    .join("")
    .trim();
  return title === "" ? untitledTitle : title;
}

async function decodeOrName(
  file: File,
  format: "mp4" | "webm" | "gif",
  seams: VjPrepareSeams,
): Promise<VjDecodedClip> {
  try {
    return await seams.decode(file, format);
  } catch (error) {
    if (!(error instanceof VjDecodeError)) throw error;
    if (format === "gif") {
      throw new VjUploadFailure("VJ_UPLOAD_GIF_DAMAGED", { cause: error });
    }
    const isHevc = await seams.findHevc(file).catch(() => false);
    throw new VjUploadFailure(
      isHevc ? "VJ_UPLOAD_HEVC" : "VJ_UPLOAD_UNPLAYABLE",
      { cause: error },
    );
  }
}

/** Integer milliseconds for a video, null for a GIF; throws on a duration the server refuses. */
function durationOf(
  decoded: VjDecodedClip,
  format: "mp4" | "webm" | "gif",
): number | null {
  if (format === "gif") return null;
  const rawDurationMs = decoded.durationMs;
  if (rawDurationMs === null || !Number.isFinite(rawDurationMs)) {
    throw new VjUploadFailure("VJ_CLIP_DURATION_INVALID");
  }
  const durationMs = Math.round(rawDurationMs);
  if (durationMs < 1 || durationMs > VJ_LIMITS.durationMsMax) {
    throw new VjUploadFailure("VJ_CLIP_DURATION_INVALID");
  }
  return durationMs;
}

async function thumbnailOf(
  decoded: VjDecodedClip,
  seams: VjPrepareSeams,
): Promise<Blob> {
  try {
    return await seams.drawThumbnail(
      decoded.frame,
      decoded.width,
      decoded.height,
    );
  } catch (error) {
    if (error instanceof VjUploadFailure) throw error;
    throw new VjUploadFailure("VJ_UPLOAD_THUMBNAIL_FAILED", { cause: error });
  }
}

async function cleanGifBody(
  file: File,
  seams: VjPrepareSeams,
): Promise<Uint8Array<ArrayBuffer>> {
  try {
    // A fresh copy, so the bytes always sit on a plain ArrayBuffer for the Blob.
    return new Uint8Array(seams.sanitize(await readVjBlobBytes(file)));
  } catch (error) {
    throw new VjUploadFailure("VJ_UPLOAD_GIF_DAMAGED", { cause: error });
  }
}

/**
 * Checks and measures one picked file in the order of contract 8.4: size,
 * sniffed format, decode, dimensions, duration, thumbnail, GIF clean.
 * `file.type` is never read. Every refusal is a `VjUploadFailure` naming its cause.
 */
export async function prepareVjClipFile(
  file: File,
  untitledTitle: string,
  seams?: Partial<VjPrepareSeams>,
): Promise<VjPreparedClip> {
  const steps: VjPrepareSeams = { ...DEFAULT_SEAMS, ...seams };
  if (file.size > VJ_LIMITS.clipMaxBytes) {
    throw new VjUploadFailure("VJ_UPLOAD_TOO_LARGE", { byteSize: file.size });
  }
  const format = vjSniffClipFormat(
    await readVjBlobBytes(file.slice(0, SNIFF_BYTE_COUNT)),
  );
  if (format === "mov") throw new VjUploadFailure("VJ_UPLOAD_FORMAT_MOV");
  if (format === "unknown") {
    throw new VjUploadFailure("VJ_UPLOAD_TYPE_UNSUPPORTED");
  }
  const decoded = await decodeOrName(file, format, steps);
  try {
    if (
      decoded.width > VJ_LIMITS.dimensionMax ||
      decoded.height > VJ_LIMITS.dimensionMax
    ) {
      throw new VjUploadFailure("VJ_CLIP_DIMENSIONS_INVALID");
    }
    const durationMs = durationOf(decoded, format);
    const thumbnail = await thumbnailOf(decoded, steps);
    const contentType = VJ_SNIFFED_CONTENT_TYPE[format];
    const title = vjClipTitleOf(file.name, untitledTitle);
    const base = {
      contentType,
      width: decoded.width,
      height: decoded.height,
      durationMs,
      thumbnail,
      title,
    };
    if (format !== "gif") return { ...base, body: file, byteSize: file.size };
    const cleanBytes = await cleanGifBody(file, steps);
    return {
      ...base,
      body: new Blob([cleanBytes], { type: contentType }),
      byteSize: cleanBytes.length,
    };
  } finally {
    decoded.release();
  }
}

export interface VjUploadClipOptions {
  packId: string | null;
  isDemoMode: boolean;
  signal: AbortSignal;
  onProgress: (stage: "uploading" | "saving", percent: number) => void;
}

const presignRateLimits = new WeakSet<object>();

/**
 * Whether an upload failed because the presign answered 429 (contract 3.3),
 * so the row waits and tries again. The error itself is the `ApiError`.
 */
export function isVjPresignRateLimited(error: unknown): boolean {
  return typeof error === "object" && error !== null
    ? presignRateLimits.has(error)
    : false;
}

/** Presigns one VJ object; a 429 answer is marked for `isVjPresignRateLimited`. */
export async function presignVj(
  kind: "vj_clip" | "vj_thumbnail" | "vj_preview",
  contentType: VjClipUploadContentType | "image/webp",
  byteSize: number,
): Promise<PresignedUpload> {
  try {
    return await requestUpload(kind, contentType, byteSize);
  } catch (error) {
    if (error instanceof ApiError && error.status === 429) {
      presignRateLimits.add(error);
    }
    throw error;
  }
}

function abortError(): DOMException {
  return new DOMException("vj-upload-aborted", "AbortError");
}

async function putThumbnail(
  uploadUrl: string,
  thumbnail: Blob,
  signal: AbortSignal,
): Promise<void> {
  let response: Response;
  try {
    response = await fetch(uploadUrl, {
      method: "PUT",
      body: thumbnail,
      headers: { "Content-Type": "image/webp" },
      credentials: "omit",
      signal,
    });
  } catch (error) {
    if (signal.aborted) throw error;
    throw new VjUploadFailure("VJ_UPLOAD_PUT_FAILED", { cause: error });
  }
  if (!response.ok) {
    throw new VjUploadFailure("VJ_UPLOAD_PUT_FAILED", {
      cause: new ApiError(response.status, "vj-thumbnail-put-failed"),
    });
  }
}

/** The clip PUT through XMLHttpRequest for upload progress (the studioAudioUpload shape). */
function putClip(
  uploadUrl: string,
  prepared: VjPreparedClip,
  options: VjUploadClipOptions,
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (options.signal.aborted) {
      reject(abortError());
      return;
    }
    const request = new XMLHttpRequest();
    const onAbort = () => request.abort();
    options.signal.addEventListener("abort", onAbort, { once: true });
    const settle = (error: Error | null) => {
      options.signal.removeEventListener("abort", onAbort);
      if (error === null) resolve();
      else reject(error);
    };
    request.open("PUT", uploadUrl);
    request.withCredentials = false;
    request.setRequestHeader("Content-Type", prepared.contentType);
    request.upload.onprogress = (event) => {
      if (event.lengthComputable && event.total > 0) {
        options.onProgress(
          "uploading",
          Math.round((event.loaded / event.total) * 100),
        );
      }
    };
    request.onload = () => {
      if (request.status >= 200 && request.status < 300) settle(null);
      else {
        settle(
          new VjUploadFailure("VJ_UPLOAD_PUT_FAILED", {
            cause: new ApiError(request.status, "vj-clip-put-failed"),
          }),
        );
      }
    };
    request.onerror = () =>
      settle(
        new VjUploadFailure("VJ_UPLOAD_PUT_FAILED", {
          cause: new TypeError("vj-clip-put-network"),
        }),
      );
    request.onabort = () => settle(abortError());
    request.send(prepared.body);
  });
}

async function uploadVjClipLive(
  prepared: VjPreparedClip,
  options: VjUploadClipOptions,
): Promise<VjClipDTO> {
  const thumbnailPresign = await presignVj(
    "vj_thumbnail",
    "image/webp",
    prepared.thumbnail.size,
  );
  options.signal.throwIfAborted();
  await putThumbnail(
    thumbnailPresign.uploadUrl,
    prepared.thumbnail,
    options.signal,
  );
  const clipPresign = await presignVj(
    "vj_clip",
    prepared.contentType,
    prepared.byteSize,
  );
  options.signal.throwIfAborted();
  await putClip(clipPresign.uploadUrl, prepared, options);
  options.onProgress("saving", 100);
  return await createVjClip({
    title: prepared.title,
    storageKey: clipPresign.key,
    thumbnailStorageKey: thumbnailPresign.key,
    width: prepared.width,
    height: prepared.height,
    durationMs: prepared.durationMs,
    fitMode: "fill",
    packId: options.packId,
  });
}

function demoStepProgress(options: VjUploadClipOptions): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    let percent = 0;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const onAbort = () => {
      if (timer !== null) clearTimeout(timer);
      reject(abortError());
    };
    if (options.signal.aborted) {
      reject(abortError());
      return;
    }
    options.signal.addEventListener("abort", onAbort, { once: true });
    const step = () => {
      percent = Math.min(100, percent + DEMO_PROGRESS_STEP);
      options.onProgress("uploading", percent);
      if (percent === 100) {
        options.signal.removeEventListener("abort", onAbort);
        resolve();
        return;
      }
      timer = setTimeout(step, DEMO_PROGRESS_STEP_MS);
    };
    timer = setTimeout(step, DEMO_PROGRESS_STEP_MS);
  });
}

async function uploadVjClipDemo(
  prepared: VjPreparedClip,
  options: VjUploadClipOptions,
): Promise<VjClipDTO> {
  await demoStepProgress(options);
  options.onProgress("saving", 100);
  const { demoCreateVjClip } = await import("../demo/vjDemoStore");
  options.signal.throwIfAborted();
  const mediaUrl = URL.createObjectURL(prepared.body);
  const thumbnailUrl = URL.createObjectURL(prepared.thumbnail);
  try {
    return demoCreateVjClip({
      title: prepared.title,
      mediaUrl,
      thumbnailUrl,
      mimeType: prepared.contentType,
      byteSize: prepared.byteSize,
      width: prepared.width,
      height: prepared.height,
      durationMs: prepared.durationMs,
      fitMode: "fill",
      packId: options.packId,
    });
  } catch (error) {
    URL.revokeObjectURL(mediaUrl);
    URL.revokeObjectURL(thumbnailUrl);
    throw error;
  }
}

/**
 * Uploads a prepared clip and creates it (contract 8.4 steps 6 and 7). Live:
 * presign and PUT the thumbnail, then the clip with progress, then
 * `createVjClip`. Demo: steps the progress, then saves to the demo store with
 * blob URLs. `signal` aborts the PUT.
 */
export async function uploadVjClip(
  prepared: VjPreparedClip,
  options: VjUploadClipOptions,
): Promise<VjClipDTO> {
  return options.isDemoMode
    ? await uploadVjClipDemo(prepared, options)
    : await uploadVjClipLive(prepared, options);
}
