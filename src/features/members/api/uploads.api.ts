import { apiPost } from "../../../shared/api/client";

/** Image content types the upload endpoints accept. */
export type UploadContentType =
  "image/jpeg" | "image/png" | "image/webp" | "image/gif";

/**
 * Response from the presigned-upload endpoints.
 *
 * ASSUMED SHAPE — the backend spec wasn't pinned down here. We assume each
 * endpoint returns:
 *   - `uploadUrl`: a short-lived presigned URL to `PUT` the raw file bytes to
 *     (direct-to-storage; no cookies/CSRF — the signature authorizes it).
 *   - `publicUrl`: the stable, publicly readable URL the object will live at,
 *     which we persist as the avatar / work-image URL once the PUT succeeds.
 * If the real API differs (e.g. `{ url, key }` or a fields form-post), adjust
 * this DTO and `useUploadImage` accordingly.
 */
export interface PresignedUpload {
  uploadUrl: string;
  publicUrl: string;
}

/** Request a presigned URL to upload a new avatar image. POST /uploads/avatar. */
export const requestAvatarUpload = (contentType: UploadContentType) =>
  apiPost<PresignedUpload>("/uploads/avatar", { contentType });

/** Request a presigned URL to upload a selected-work image. POST /uploads/work-image. */
export const requestWorkImageUpload = (contentType: UploadContentType) =>
  apiPost<PresignedUpload>("/uploads/work-image", { contentType });
