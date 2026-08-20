import { apiPost } from "../../../shared/api/client";
import type { CropRect } from "../../../shared/components/ui/cropGeometry";

/** Image content types the upload endpoints accept. */
export type UploadContentType =
  "image/jpeg" | "image/png" | "image/webp" | "image/gif";

/** Which surface an upload belongs to — drives per-kind size/dimension limits. */
export type UploadKind =
  | "avatar"
  | "work-image"
  | "story-cover"
  | "gathering-photo"
  | "group-avatar"
  | "listing-photo"
  | "community-cover"
  | "message-image";

/**
 * ============================================================================
 * BACKEND PRESIGN CONTRACT — implemented by the NestJS team, documented here.
 * ============================================================================
 *
 * `POST /uploads/presign` (generalizes the old per-kind `/uploads/avatar` and
 * `/uploads/work-image` into one endpoint with a `kind` field).
 *
 * Request body — `PresignRequest`:
 *   { kind, contentType, byteSize }
 *   - `byteSize` lets the server reject an over-cap upload BEFORE handing out a
 *     signature (the client mirrors the same caps in `uploadProcessing.ts`).
 *
 * Response — `PresignedUpload` (Variant A, signed PUT — what this client does):
 *   { uploadUrl, key, expiresIn? }
 *   - `uploadUrl`: short-lived (≤5 min) presigned URL to `PUT` the bytes to,
 *     direct-to-storage. No cookies/CSRF — the signature authorizes it.
 *   - `key`: the storage key the object was written under (e.g.
 *     `avatars/<id>.webp`). The bucket is private with no public URL, so this
 *     key — not a fetchable URL — is what we persist, sending it back verbatim
 *     as the value of the domain field (`avatarUrl`, `imageUrl`,
 *     `coverImageUrl`, ...). The backend resolves it to `GET /files/<key>` when
 *     it builds responses that include the image.
 *
 *   (Variant B — S3/GCS POST-policy form-post — would add a `fields` map and
 *   require `useUploadImage` to switch the PUT to a multipart POST that appends
 *   `fields` then `file` last. Not implemented here; add `fields?` below and
 *   branch in the hook if the backend chooses it.)
 *
 * SERVER RESPONSIBILITIES (authoritative — the client only mirrors what it can):
 *   1. Reject `byteSize` over the per-kind cap; verify MAGIC BYTES, not just the
 *      declared `contentType` (a client can lie); short single-use TTL.
 *   2. Virus / malware scan the received object; `GET /files/<key>` must not
 *      serve it until the scan passes (pending state or scan-then-promote).
 *   3. EXIF / metadata strip — SAFETY-CRITICAL. Strip ALL metadata (GPS,
 *      capture time, device IDs, embedded thumbnails) by re-encoding pixels, for
 *      EVERY kind including avatars. This is the authoritative defence against
 *      the geolocation-outing risk; the client-side strip in `uploadProcessing`
 *      is only best-effort defence-in-depth.
 *   4. Resize / re-encode per kind to WebP/AVIF with a JPEG fallback. Targets:
 *      avatar ≥1024², but the full-bleed COVER + LISTING heroes need ~2560px on
 *      the long edge — they paint edge-to-edge and a lower cap renders a visibly
 *      soft banner. NOTE: avatars are displayed in a ~430px-tall profile hero,
 *      so on a 2×/3× retina screen they need ~860-1290px — do NOT cap the server
 *      avatar resize below ~1024² or the hero renders soft. (The client already
 *      downscales each kind to its longest-edge cap — 1600px for most, 2560px
 *      for cover/listing — so this server step only re-crops/formats; keep each
 *      kind's server target at or above the matching client cap.)
 *   5. Private-by-default bucket; presign grants write to a single key only.
 *
 *   NOTE: `listing-photo` is a new kind (added 2026-07-30) — same presign flow,
 *   EXIF strip, virus scan, and private bucket as the others; cap 5 MB, min
 *   1200×600. Resize target: ~2560px wide WebP/AVIF (full-bleed hero — match
 *   the client cover/listing cap so the banner stays crisp).
 */
export interface PresignRequest {
  kind: UploadKind;
  contentType: UploadContentType;
  /** Byte size of the file being uploaded, so the server can reject over-cap early. */
  byteSize: number;
}

/** Response from `POST /uploads/presign`. */
export interface PresignedUpload {
  /** Short-lived presigned URL to `PUT` the raw bytes to (direct-to-storage). */
  uploadUrl: string;
  /**
   * Storage key the object was (will be) written under. Not a fetchable URL —
   * the bucket is private. We persist this verbatim once the PUT succeeds; the
   * backend resolves it to `GET /files/<key>` when it builds responses.
   */
  key: string;
  /** Seconds until `uploadUrl` expires, if the backend reports it. */
  expiresIn?: number;
}

/**
 * Request a presigned upload for `kind`. `POST /uploads/presign`.
 * The request is sent through `apiPost`, which attaches CSRF + `credentials:
 * "include"` — correct for this first-party authorized call.
 */
export const requestUpload = (
  kind: UploadKind,
  contentType: UploadContentType,
  byteSize: number,
) =>
  apiPost<PresignedUpload>("/uploads/presign", {
    kind,
    contentType,
    byteSize,
  } satisfies PresignRequest);

/**
 * Persist the reframe crop chosen for an already-uploaded image, keyed by its
 * storage `key`. `POST /uploads/crop`, `204` on success. Best-effort from the
 * caller's point of view: `useUploadImage` calls this after the upload PUT
 * already resolved and never lets a failure here block or reject the upload
 * result — see the retry-once-then-swallow handling there.
 */
export async function saveCrop(key: string, crop: CropRect): Promise<void> {
  await apiPost<void>("/uploads/crop", { key, crop });
}
