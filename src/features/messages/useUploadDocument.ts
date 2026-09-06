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

const RETRY_KEY = "messages:attachments.documentError.retry";

/** `PUT` the file to the presigned URL. No canvas/EXIF pipeline here (see
 *  `DocumentComposerButton`'s own doc for why a document's metadata is
 *  shipped as-is): the raw `File` is the body, unlike `useUploadImage`'s
 *  processed `Blob`. One automatic retry on a transient (5xx/network)
 *  failure, mirroring `useUploadImage`'s own retry contract. */
function putOnce(url: string, file: File, contentType: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.withCredentials = false;
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new DocumentProcessingError(RETRY_KEY));
      }
    };
    xhr.onerror = () => reject(new DocumentProcessingError(RETRY_KEY));
    xhr.send(file);
  });
}

async function putWithRetry(
  url: string,
  file: File,
  contentType: string,
): Promise<void> {
  try {
    await putOnce(url, file, contentType);
  } catch {
    await putOnce(url, file, contentType);
  }
}

/**
 * Upload a document file (PRD-226) and resolve to a `{ key, previewUrl }`
 * pair — the document twin of `useUploadImage`, deliberately WITHOUT its
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
    async (file: File): Promise<DocumentUploadResult> => {
      // Guards run above the demo short-circuit so demo validates too.
      const contentType = validateDocumentTypeAndSize(file);
      const previewUrl = URL.createObjectURL(file);
      outstandingPreviewUrls.current.add(previewUrl);

      if (demoMode) {
        outstandingPreviewUrls.current.delete(previewUrl);
        return { key: previewUrl, previewUrl };
      }

      try {
        const presigned = await requestUpload(
          "message-document",
          contentType,
          file.size,
        );
        await putWithRetry(presigned.uploadUrl, file, contentType);
        outstandingPreviewUrls.current.delete(previewUrl);
        return { key: presigned.key, previewUrl };
      } catch (err) {
        logError(err, { scope: "useUploadDocument" });
        if (err instanceof DocumentProcessingError) throw err;
        throw new DocumentProcessingError(RETRY_KEY);
      }
    },
    [demoMode],
  );
}
