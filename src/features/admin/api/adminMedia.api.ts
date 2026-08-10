import { apiGet } from "../../../shared/api/client";

/** Upload-kind prefixes the console can filter by — mirrors the backend
 *  `UPLOAD_KIND_SPECS` prefixes. `"all"` is the synthetic unfiltered tab. */
export type AdminMediaKind =
  | "all"
  | "avatars"
  | "work"
  | "story-covers"
  | "gathering-photos"
  | "group-avatars"
  | "listing-photos";

export const ADMIN_MEDIA_KINDS: AdminMediaKind[] = [
  "all",
  "avatars",
  "work",
  "story-covers",
  "gathering-photos",
  "group-avatars",
  "listing-photos",
];

export interface AdminMediaUploader {
  id: string;
  displayName: string;
  handle: string;
}

/** One stored object row. `contentType` is extension-derived + UNVERIFIED;
 *  the drawer's head check confirms the real stored type. */
export interface AdminMediaObject {
  key: string;
  size: number;
  lastModified: string | null;
  kind: string;
  uploaderId: string | null;
  contentType: string | null;
  fileUrl: string;
  presignedUrl: string;
  uploader: AdminMediaUploader | null;
}

/** One page as the hook consumes it (S3 continuation-token pagination). */
export interface AdminMediaPageVM {
  objects: AdminMediaObject[];
  nextContinuationToken: string | null;
}

export interface AdminMediaHead {
  key: string;
  contentType: string | null;
  contentLength: number | null;
}

/** `GET /admin/media` — one page. `kind === "all"` sends no `prefix`. */
export function getAdminMediaPage(params: {
  kind: AdminMediaKind;
  continuationToken?: string;
  limit?: number;
}): Promise<AdminMediaPageVM> {
  const search = new URLSearchParams();
  if (params.kind !== "all") search.set("prefix", params.kind);
  if (params.continuationToken)
    search.set("continuationToken", params.continuationToken);
  if (params.limit) search.set("limit", String(params.limit));
  const queryString = search.toString();
  return apiGet<AdminMediaPageVM>(
    `/admin/media${queryString ? `?${queryString}` : ""}`,
  );
}

/** `GET /admin/media/head` — real stored content type for one object. */
export function getAdminMediaHead(key: string): Promise<AdminMediaHead> {
  return apiGet<AdminMediaHead>(
    `/admin/media/head?key=${encodeURIComponent(key)}`,
  );
}
