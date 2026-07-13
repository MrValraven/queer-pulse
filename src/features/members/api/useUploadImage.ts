import { useCallback } from "react";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { logError } from "../../../shared/observability/logger";
import {
  requestUpload,
  type UploadContentType,
  type UploadKind,
} from "./uploads.api";
import { processImage, validateTypeAndSize } from "./uploadProcessing";

export type { UploadKind } from "./uploads.api";

/** Options for a single upload call. */
export interface UploadOptions {
  /** Called with 0–100 as the storage PUT streams. No-ops in demo mode. */
  onProgress?: (percent: number) => void;
}

/** A PUT failure the hook knows how to react to. `transient` → one auto-retry. */
class UploadError extends Error {
  readonly transient: boolean;
  constructor(message: string, transient: boolean) {
    super(message);
    this.name = "UploadError";
    this.transient = transient;
  }
}

const RETRY_MESSAGE = "We couldn't upload that image. Please try again.";

/**
 * `PUT` the blob to the presigned URL via `XMLHttpRequest` (needed for upload
 * progress — `fetch` can't report it). `withCredentials = false` mirrors the old
 * `credentials: "omit"`: the presign signature authorizes the request and no
 * cookies/CSRF may be sent cross-origin. A retried PUT reuses the same URL —
 * fine within the presign TTL (single-use TTLs would need a fresh presign).
 */
function putOnce(
  url: string,
  blob: Blob,
  onProgress?: (percent: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.withCredentials = false;
    xhr.setRequestHeader("Content-Type", blob.type);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(100);
        resolve();
      } else {
        // 5xx is transient (worth a retry); 4xx is the request's fault.
        reject(new UploadError(RETRY_MESSAGE, xhr.status >= 500));
      }
    };
    xhr.onerror = () => reject(new UploadError(RETRY_MESSAGE, true));
    xhr.ontimeout = () => reject(new UploadError(RETRY_MESSAGE, true));
    xhr.send(blob);
  });
}

/** One automatic retry on a transient failure, then surface the error. */
async function putWithRetry(
  url: string,
  blob: Blob,
  onProgress?: (percent: number) => void,
): Promise<void> {
  try {
    await putOnce(url, blob, onProgress);
  } catch (err) {
    if (err instanceof UploadError && err.transient) {
      onProgress?.(0);
      await putOnce(url, blob, onProgress);
      return;
    }
    throw err;
  }
}

/**
 * Upload an image file and resolve to the URL it should be stored under.
 *
 * Validation (type, size, dimensions) and a client-side EXIF/GPS strip run in
 * BOTH modes — see `uploadProcessing.ts`. Then:
 *
 * - **Demo mode:** never touches the network — returns a local `object URL`
 *   preview of the (stripped) image. The caller must revoke it when
 *   replaced/unmounted (guard on `url.startsWith("blob:")`).
 * - **Live mode:** requests a presigned URL, `PUT`s the bytes to storage with
 *   progress + one automatic retry, and returns the stable `publicUrl`.
 *
 * The callback throws an `Error` with a human message on any failure so callers
 * can render it in a `role="alert"` and re-trigger to retry.
 */
export function useUploadImage(kind: UploadKind) {
  const { demoMode } = useDemoMode();

  return useCallback(
    async (file: File, options?: UploadOptions): Promise<string> => {
      // Guards run above the demo short-circuit so demo validates too.
      validateTypeAndSize(file, kind);
      const blob = await processImage(file, kind);

      if (demoMode) {
        options?.onProgress?.(100);
        return URL.createObjectURL(blob);
      }

      const contentType = blob.type as UploadContentType;
      try {
        const { uploadUrl, publicUrl } = await requestUpload(
          kind,
          contentType,
          blob.size,
        );
        await putWithRetry(uploadUrl, blob, options?.onProgress);
        return publicUrl;
      } catch (err) {
        logError(err, { scope: "useUploadImage", kind });
        throw new Error(
          err instanceof UploadError ? err.message : RETRY_MESSAGE,
          { cause: err },
        );
      }
    },
    [demoMode, kind],
  );
}
