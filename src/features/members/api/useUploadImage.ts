import { useCallback, useEffect, useRef } from "react";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { logError } from "../../../shared/observability/logger";
import {
  requestUpload,
  type UploadContentType,
  type UploadKind,
} from "./uploads.api";
import {
  ImageProcessingError,
  processImage,
  validateTypeAndSize,
} from "./uploadProcessing";

export type { UploadKind } from "./uploads.api";

/** Options for a single upload call. */
export interface UploadOptions {
  /** Called with 0–100 as the storage PUT streams. No-ops in demo mode. */
  onProgress?: (percent: number) => void;
}

/** The resolved value of a successful upload. */
export interface UploadResult {
  /**
   * The value to persist under the domain field (`avatarUrl`, `imageUrl`,
   * `coverImageUrl`, ...). In live mode this is the private storage key —
   * NOT a fetchable URL. Never render this as an `<img src>`.
   */
  key: string;
  /**
   * A local, instantly-fetchable preview of the uploaded image
   * (`URL.createObjectURL` of the already-processed blob), safe to render
   * immediately as an `<img src>` at zero network cost. Never persist this —
   * it's a `blob:` URL that's only valid for this tab's lifetime.
   *
   * This hook revokes every `previewUrl` it has created once its owning
   * component unmounts, so it never outlives the component. Callers that
   * keep only a single active preview at a time (an editor slot that gets
   * replaced on re-pick) should additionally revoke the stale `previewUrl`
   * themselves as soon as it stops being displayed — the hook has no way to
   * know a given preview is no longer needed before then. Callers that keep
   * *several* previews alive at once (e.g. a growing gallery) should NOT
   * revoke on the caller's own supersession logic; the hook's unmount sweep
   * covers them.
   */
  previewUrl: string;
}

/** A PUT failure the hook knows how to react to. `transient` → one auto-retry. */
class UploadError extends ImageProcessingError {
  readonly transient: boolean;
  constructor(i18nKey: string, transient: boolean) {
    super(i18nKey);
    this.name = "UploadError";
    this.transient = transient;
  }
}

const RETRY_KEY = "members:upload.error.retry";

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
        reject(new UploadError(RETRY_KEY, xhr.status >= 500));
      }
    };
    xhr.onerror = () => reject(new UploadError(RETRY_KEY, true));
    xhr.ontimeout = () => reject(new UploadError(RETRY_KEY, true));
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
 * Upload an image file and resolve to an `{ key, previewUrl }` pair: `key` is
 * the value that should be stored under the domain field (`avatarUrl`,
 * `imageUrl`, `coverImageUrl`, ...); `previewUrl` is a local object URL safe
 * to render immediately as an `<img src>`, built from the blob this hook
 * already has in hand — zero extra network cost.
 *
 * Validation (type, size, dimensions) and a client-side EXIF/GPS strip run in
 * BOTH modes — see `uploadProcessing.ts`. Then:
 *
 * - **Demo mode:** never touches the network. There is no real storage `key`
 *   in this mode, so both `key` and `previewUrl` are the same local object
 *   URL of the (stripped) image — that URL already was, and remains, the
 *   value this mode has always stored under the domain field.
 * - **Live mode:** requests a presigned URL, `PUT`s the bytes to storage with
 *   progress + one automatic retry, and returns the storage `key` alongside
 *   a freshly created `previewUrl`. The bucket is private — a `key` is NOT a
 *   fetchable URL, only the backend can resolve it (to `GET /files/<key>`)
 *   once the domain payload carrying it round-trips through the server;
 *   `previewUrl` exists precisely so callers don't have to wait for that
 *   round-trip to show the picked image.
 *
 * Every `previewUrl` this hook creates is revoked when the owning component
 * unmounts (see the `outstandingPreviewUrls` ref below) — that's the only
 * cleanup this hook can safely do on the caller's behalf, since only the
 * caller knows whether an older preview it already received is still being
 * displayed (e.g. a multi-photo gallery) or has been superseded (e.g. a
 * single-image editor slot). Callers with a single active preview slot
 * should revoke the stale one themselves as soon as it's replaced.
 *
 * The callback throws an `ImageProcessingError` (a catalog key + optional
 * interpolation values) on any failure, so callers resolve it through `t()`
 * and render it in a `role="alert"`, then re-trigger to retry.
 */
export function useUploadImage(kind: UploadKind) {
  const { demoMode } = useDemoMode();
  const outstandingPreviewUrls = useRef<Set<string>>(new Set());

  // Belt-and-suspenders cleanup: revoke every object URL this hook instance
  // ever created, however it was left (superseded-but-caller-forgot,
  // abandoned mid-upload, or simply still on screen when the component goes
  // away). This is what actually prevents a blob from being held forever.
  useEffect(() => {
    const trackedUrls = outstandingPreviewUrls.current;
    return () => {
      for (const trackedUrl of trackedUrls) {
        URL.revokeObjectURL(trackedUrl);
      }
      trackedUrls.clear();
    };
  }, []);

  return useCallback(
    async (file: File, options?: UploadOptions): Promise<UploadResult> => {
      // Guards run above the demo short-circuit so demo validates too.
      validateTypeAndSize(file, kind);
      const blob = await processImage(file, kind);
      const previewUrl = URL.createObjectURL(blob);
      outstandingPreviewUrls.current.add(previewUrl);

      if (demoMode) {
        options?.onProgress?.(100);
        return { key: previewUrl, previewUrl };
      }

      const contentType = blob.type as UploadContentType;
      try {
        const { uploadUrl, key } = await requestUpload(
          kind,
          contentType,
          blob.size,
        );
        await putWithRetry(uploadUrl, blob, options?.onProgress);
        return { key, previewUrl };
      } catch (err) {
        logError(err, { scope: "useUploadImage", kind });
        if (err instanceof ImageProcessingError) throw err;
        throw new ImageProcessingError(RETRY_KEY);
      }
    },
    [demoMode, kind],
  );
}
