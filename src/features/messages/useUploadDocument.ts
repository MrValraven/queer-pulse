import { useCallback, useEffect, useRef } from "react";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { logError } from "../../shared/observability/logger";
import { requestUpload } from "../members/api/uploads.api";
import {
  DocumentProcessingError,
  validateDocumentTypeAndSize,
} from "./documentUploadProcessing";

/** The resolved value of a successful document upload. */
export interface DocumentUploadResult {
  /** Live mode: the private `message-document` storage key to send as the
   *  attachment's `url`. Demo mode: a local `blob:` object URL (never
   *  persisted). Never render this directly. */
  key: string;
  /** A local, instantly-fetchable preview URL (`URL.createObjectURL`), safe to
   *  use for the optimistic bubble's download link before the server
   *  round-trip resolves the real one. Revoked on unmount, same contract as
   *  `useUploadImage`'s `previewUrl`. */
  previewUrl: string;
}

/** Options for a single upload call, mirroring `useUploadImage`'s own
 *  `UploadOptions` shape (DES-199). */
export interface DocumentUploadOptions {
  /** Called with 0-100 as the storage PUT streams. No-ops in demo mode. */
  onProgress?: (percent: number) => void;
  /** Aborts the in-flight PUT (never retried once aborted), wired by
   *  `useAttachmentUploadQueue` so removing/cancelling a staged document
   *  actually stops its upload, unlike an abandoned image upload (see that
   *  hook's own doc for why the two differ). No-ops in demo mode, which
   *  never touches the network in the first place. */
  signal?: AbortSignal;
}

/** Thrown when `signal` aborts the PUT. `useAttachmentUploadQueue` already
 *  ignores an abandoned item's result before it would ever see this, so it
 *  exists only to keep an aborted PUT from being mistaken for a transient
 *  failure and retried. */
class DocumentUploadAbortedError extends Error {
  constructor() {
    super("document-upload-aborted");
    this.name = "DocumentUploadAbortedError";
  }
}

const RETRY_KEY = "messages:attachments.documentError.retry";

/** `PUT` the file to the presigned URL. No canvas/EXIF pipeline here (see
 *  `DocumentComposerButton`'s own doc for why a document's metadata is
 *  shipped as-is): the raw `File` is the body, unlike `useUploadImage`'s
 *  processed `Blob`. One automatic retry on a transient (5xx/network)
 *  failure, mirroring `useUploadImage`'s own retry contract; an abort never
 *  retries. */
function putOnce(
  url: string,
  file: File,
  contentType: string,
  onProgress?: (percent: number) => void,
  signal?: AbortSignal,
): Promise<void> {
  return new Promise((resolve, reject) => {
    // Checked at the START of every attempt (the first one AND the one
    // retry), not just once before the caller's first call: an abort that
    // lands between two attempts must stop the retry from ever opening a new
    // request rather than only catching an abort mid-flight.
    if (signal?.aborted) {
      reject(new DocumentUploadAbortedError());
      return;
    }
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.withCredentials = false;
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };
    // The abort listener stays attached until ONE of these fires (success,
    // failure, or the abort itself) rather than only on
    // `xhr.upload.onloadend`, so a settle path that skips the upload phase
    // entirely (an immediate network failure) can't leave it attached past
    // the point this promise has already settled.
    function settle() {
      signal?.removeEventListener("abort", onAbort);
    }
    function onAbort() {
      settle();
      xhr.abort();
      reject(new DocumentUploadAbortedError());
    }
    xhr.onload = () => {
      settle();
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(100);
        resolve();
      } else {
        reject(new DocumentProcessingError(RETRY_KEY));
      }
    };
    xhr.onerror = () => {
      settle();
      reject(new DocumentProcessingError(RETRY_KEY));
    };
    signal?.addEventListener("abort", onAbort);
    xhr.send(file);
  });
}

export async function putWithRetry(
  url: string,
  file: File,
  contentType: string,
  onProgress?: (percent: number) => void,
  signal?: AbortSignal,
): Promise<void> {
  try {
    await putOnce(url, file, contentType, onProgress, signal);
  } catch (err) {
    if (err instanceof DocumentUploadAbortedError) throw err;
    onProgress?.(0);
    await putOnce(url, file, contentType, onProgress, signal);
  }
}

/**
 * Upload a document file (PRD-226) and resolve to a `{ key, previewUrl }`
 * pair, the document twin of `useUploadImage`, deliberately WITHOUT its
 * canvas/EXIF pipeline: a PDF/spreadsheet/text file has no pixels to
 * re-encode, and re-encoding is exactly what silently strips an image's
 * metadata. See `DocumentComposerButton`'s own doc for the explicit,
 * un-silent decision this leaves for a document: its original file metadata
 * (a PDF's Author/Producer properties, an XLSX's core.xml properties) ships
 * UNSTRIPPED. Every current send path is capped at 20 MB and content-type
 * validated (client here, authoritatively server-side).
 *
 * - **Demo mode:** never touches the network; `key` and `previewUrl` are both
 *   the same local object URL.
 * - **Live mode:** presigns, `PUT`s the raw file with one automatic retry, and
 *   returns the storage `key` alongside a freshly created `previewUrl`.
 */
export function useUploadDocument() {
  const { demoMode } = useDemoMode();
  const outstandingPreviewUrls = useRef<Set<string>>(new Set());

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
    async (
      file: File,
      options?: DocumentUploadOptions,
    ): Promise<DocumentUploadResult> => {
      // Guards run above the demo short-circuit so demo validates too.
      const contentType = validateDocumentTypeAndSize(file);
      const previewUrl = URL.createObjectURL(file);
      outstandingPreviewUrls.current.add(previewUrl);

      if (demoMode) {
        options?.onProgress?.(100);
        outstandingPreviewUrls.current.delete(previewUrl);
        return { key: previewUrl, previewUrl };
      }

      // Checked BEFORE spending a request on a presign URL nobody will ever
      // PUT to: `abandon()` (`useAttachmentUploadQueue`) can fire the abort
      // before the presign round-trip even resolves.
      if (options?.signal?.aborted) {
        throw new DocumentUploadAbortedError();
      }

      try {
        const presigned = await requestUpload(
          "message-document",
          contentType,
          file.size,
        );
        await putWithRetry(
          presigned.uploadUrl,
          file,
          contentType,
          options?.onProgress,
          options?.signal,
        );
        outstandingPreviewUrls.current.delete(previewUrl);
        return { key: presigned.key, previewUrl };
      } catch (err) {
        if (err instanceof DocumentUploadAbortedError) throw err;
        logError(err, { scope: "useUploadDocument" });
        if (err instanceof DocumentProcessingError) throw err;
        throw new DocumentProcessingError(RETRY_KEY);
      }
    },
    [demoMode],
  );
}
