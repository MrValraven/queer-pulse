import type { DocumentContentType } from "../members/api/uploads.api";

/**
 * Thrown by the document upload pipeline instead of a hardcoded English
 * `Error` — carries a `messages:` catalog key (+ interpolation values) so the
 * UI resolves it through `t()` rather than rendering source-code English into
 * a `role="alert"`. Mirrors `ImageProcessingError` (`uploadProcessing.ts`)
 * but lives here rather than being reused from there: that file's whole
 * pipeline (canvas decode, EXIF strip, resize) is IMAGE-only and a document
 * never enters it.
 */
export class DocumentProcessingError extends Error {
  readonly i18nKey: string;
  readonly values?: Record<string, string | number>;

  constructor(i18nKey: string, values?: Record<string, string | number>) {
    super(i18nKey);
    this.name = "DocumentProcessingError";
    this.i18nKey = i18nKey;
    this.values = values;
  }
}

/** Content types the backend's `message-document` upload kind accepts
 *  (PRD-226); anything else is rejected client-side. Mirrors the backend's
 *  `DOCUMENT_UPLOAD_TYPES` — PDFs, spreadsheets, plain text, never a
 *  video/audio/voice format. */
export const ALLOWED_DOCUMENT_TYPES = new Set<DocumentContentType>([
  "application/pdf",
  "text/plain",
  "text/csv",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);

/** Mirrors the backend's `message-document` cap (`upload-kinds.ts`) — see
 *  that file's own comment for why it sits above the 8 MB image cap: a
 *  multi-page scanned lease is never downscaled the way a photo is. */
export const MAX_DOCUMENT_BYTES = 20 * 1024 * 1024;
export const MAX_DOCUMENT_LABEL = "20 MB";

/**
 * A best-effort extension→content-type fallback for the handful of browsers/
 * OSes that report an empty `file.type` for a CSV/text pick (a known gap in
 * some Windows/Chrome combinations). Client-side only — the server never
 * trusts this either way; it revalidates the PUT object's real bytes.
 */
const EXTENSION_FALLBACK: Record<string, DocumentContentType> = {
  ".pdf": "application/pdf",
  ".txt": "text/plain",
  ".csv": "text/csv",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

/** Resolves the content type to declare for the presign request: the file's
 *  own `type` when it's one we accept, else an extension-based guess, else
 *  `null` (caller rejects). */
export function resolveDocumentContentType(
  file: File,
): DocumentContentType | null {
  if (ALLOWED_DOCUMENT_TYPES.has(file.type as DocumentContentType)) {
    return file.type as DocumentContentType;
  }
  const lastDotIndex = file.name.lastIndexOf(".");
  if (lastDotIndex === -1) return null;
  const extension = file.name.slice(lastDotIndex).toLowerCase();
  return EXTENSION_FALLBACK[extension] ?? null;
}

/** Type + size guards, mirroring `uploadProcessing.ts`'s `validateTypeAndSize`
 *  but for a document (no dimension checks — a document has no pixels).
 *  Returns the resolved content type on success; throws a human-readable
 *  `DocumentProcessingError` otherwise. */
export function validateDocumentTypeAndSize(file: File): DocumentContentType {
  const contentType = resolveDocumentContentType(file);
  if (!contentType) {
    throw new DocumentProcessingError(
      "messages:attachments.documentError.unsupportedType",
    );
  }
  if (file.size > MAX_DOCUMENT_BYTES) {
    throw new DocumentProcessingError(
      "messages:attachments.documentError.tooLarge",
      { maxLabel: MAX_DOCUMENT_LABEL },
    );
  }
  return contentType;
}
