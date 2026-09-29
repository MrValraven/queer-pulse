import { useCallback, useEffect, useRef } from "react";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { logError } from "../../../shared/observability/logger";
import {
  isIdentityCrop,
  type CropRect,
} from "../../../shared/components/ui/cropGeometry";
import {
  requestUpload,
  saveCrop,
  type UploadContentType,
  type UploadKind,
} from "./uploads.api";
import {
  bakesCropIntoPixels,
  ImageProcessingError,
  processImage,
  validateTypeAndSize,
} from "./uploadProcessing";

export type { UploadKind } from "./uploads.api";

/** Options for a single upload call. */
export interface UploadOptions {
  /** Called with 0–100 as the storage PUT streams. No-ops in demo mode. */
  onProgress?: (percent: number) => void;
  /**
   * The reframe crop chosen for this image, as fractions of the source. What
   * happens to it depends on the kind:
   *
   * - A `bakesCropIntoPixels` kind (the avatars) cuts it into the uploaded
   *   image itself (`processImage`), so the stored file is already framed and
   *   nothing is saved server-side.
   * - Every other kind uploads the whole image and, when the crop is a real
   *   reframe (anything `isIdentityCrop` rejects), persists it server-side
   *   keyed by the uploaded `key` (`saveCrop` in `uploads.api.ts`). Persisting
   *   it is best-effort: it never blocks or fails the upload itself (see the
   *   live-mode branch below).
   */
  crop?: CropRect;
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
  /**
   * Echoes `options.crop`, when one was passed in, for a kind that keeps its
   * crop as metadata. Always `undefined` for a `bakesCropIntoPixels` kind: its
   * `previewUrl` and stored image are already framed, so a caller that
   * re-applied the crop would frame them a second time.
   */
  crop?: CropRect;
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
 * Validation (type, size, dimensions), a client-side EXIF/GPS strip, and a
 * longest-edge downscale (per-kind cap: ~1600px for most slots, ~2560px for
 * the full-bleed cover/listing heroes, re-encoded at quality 0.8 when actually
 * shrunk) all run in BOTH modes — see `uploadProcessing.ts`. This is the one
 * shared path every `UploadKind` funnels through, so a full-resolution phone
 * photo picked for an avatar, a listing photo, or a gathering photo is never
 * what gets stored or re-served — only images already smaller than the cap
 * skip the resize (still re-encoded once, for the metadata strip). Then:
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
 * `options.crop` takes one of two paths, chosen by `bakesCropIntoPixels`:
 *
 * - **Baked (avatar, group avatar, community avatar):** the crop goes into
 *   `processImage`, which cuts it out before encoding, so the uploaded blob
 *   and its `previewUrl` are already framed. Nothing is persisted with
 *   `saveCrop` (the profile hero would otherwise crop the already-cropped
 *   image again), and the resolved `crop` is `undefined` in both modes.
 * - **Metadata (every other kind):** the whole image is uploaded. When the
 *   crop is a non-identity reframe (see `isIdentityCrop`), live mode persists
 *   it server-side after the upload PUT succeeds, keyed by the storage `key`
 *   (`saveCrop` in `uploads.api.ts`). That persistence is best-effort: one
 *   retry on failure, then it's logged and swallowed, and it never blocks or
 *   fails the resolved `{ key, previewUrl }`. The resolved value echoes
 *   `crop` back (in both modes) so callers can render the reframed preview
 *   immediately without waiting on a round-trip.
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

  // Revokes any object URL this hook instance created but never got to hand
  // back — the upload threw after `processImage` produced a blob (e.g. the
  // presign or PUT failed). A URL that *was* successfully returned is removed
  // from this set at the point it's returned (see below): ownership has
  // passed to the caller by then, so this sweep must not touch it — this
  // hook's own owning component (typically a picker modal) often unmounts in
  // the very same commit that hands the result off via a callback, which
  // would otherwise revoke the URL before the caller's `<img>` ever loads it.
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
      // A baked kind carries its framing in the pixels, so the crop is spent
      // here. It skips `saveCrop` and resolves with no crop (see
      // `UploadResult.crop`).
      const isCropBaked = bakesCropIntoPixels(kind);
      const blob = await processImage(
        file,
        kind,
        isCropBaked ? options?.crop : undefined,
      );
      const resultCrop = isCropBaked ? undefined : options?.crop;
      const previewUrl = URL.createObjectURL(blob);
      outstandingPreviewUrls.current.add(previewUrl);

      if (demoMode) {
        // Demo mode never touches the network, so there's nowhere real to
        // persist the crop. A metadata kind just echoes it back for the
        // caller to store alongside the preview, same as the key/previewUrl
        // above.
        options?.onProgress?.(100);
        // Ownership of this URL passes to the caller as soon as it's
        // returned — stop tracking it so the unmount sweep below doesn't
        // revoke it out from under whatever just rendered it (e.g. the
        // picker modal that owns this hook instance closing itself the
        // moment it hands the result to `onPick`, in the same commit that
        // mounts the caller's `<img src={previewUrl}>`).
        outstandingPreviewUrls.current.delete(previewUrl);
        return { key: previewUrl, previewUrl, crop: resultCrop };
      }

      const contentType = blob.type as UploadContentType;
      let key: string;
      try {
        const presigned = await requestUpload(kind, contentType, blob.size);
        key = presigned.key;
        await putWithRetry(presigned.uploadUrl, blob, options?.onProgress);
      } catch (err) {
        logError(err, { scope: "useUploadImage", kind });
        if (err instanceof ImageProcessingError) throw err;
        throw new ImageProcessingError(RETRY_KEY, undefined, { cause: err });
      }

      // Persist the crop, best-effort, AFTER the upload itself has already
      // succeeded. This must never turn a successful image upload into a
      // failed one: one retry on failure, then swallow (logged) — the caller
      // still gets back a resolved { key, previewUrl }. A baked kind has
      // nothing to persist: its uploaded pixels are already framed.
      if (!isCropBaked && options?.crop && !isIdentityCrop(options.crop)) {
        try {
          await saveCrop(key, options.crop);
        } catch {
          try {
            await saveCrop(key, options.crop);
          } catch (err) {
            logError(err, { scope: "useUploadImage.saveCrop", kind });
          }
        }
      }

      // Ownership passes to the caller now — see the demo-mode branch above
      // for why this must happen before returning.
      outstandingPreviewUrls.current.delete(previewUrl);
      return { key, previewUrl, crop: resultCrop };
    },
    [demoMode, kind],
  );
}
