import { apiGet, apiDelete } from "../../../shared/api/client";
import type { MediaReference } from "../../../shared/media/mediaReferences";

/** Upload-kind prefixes the console can filter by. Mirrors the backend's
 *  `KNOWN_PREFIXES` in `admin-media.service.ts`: every `UPLOAD_KIND_SPECS`
 *  prefix except the private message ones, plus `persona` (unlinked persona
 *  images). `"all"` is the synthetic unfiltered option. */
export type AdminMediaKind =
  | "all"
  | "avatars"
  | "group-avatars"
  | "community-avatars"
  | "community-covers"
  | "persona-covers"
  | "persona"
  | "gathering-photos"
  | "event-covers"
  | "listing-photos"
  | "listing-covers"
  | "listing-menus"
  | "story-covers"
  | "work"
  | "forum-photos"
  | "stickers";

/** The select lists the kinds by family: people and group marks, then
 *  community, persona, gathering, listing, editorial and platform files. */
export const ADMIN_MEDIA_KINDS: AdminMediaKind[] = [
  "all",
  "avatars",
  "group-avatars",
  "community-avatars",
  "community-covers",
  "persona-covers",
  "persona",
  "gathering-photos",
  "event-covers",
  "listing-photos",
  "listing-covers",
  "listing-menus",
  "story-covers",
  "work",
  "forum-photos",
  "stickers",
];

export interface AdminMediaUploader {
  id: string;
  displayName: string;
  handle: string;
}

/** One row in the "filter by uploader" search results — an uploader plus an
 *  avatar for the picker. `avatarUrl` is a resolved `/files/*` URL or null. */
export interface AdminMediaUploaderResult extends AdminMediaUploader {
  avatarUrl: string | null;
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
  /** Every place this object is still referenced in the database. Empty =
   *  orphan / safe to delete. */
  references: MediaReference[];
}

/** One page as the hook consumes it (S3 continuation-token pagination). */
export interface AdminMediaPageVM {
  objects: AdminMediaObject[];
  nextContinuationToken: string | null;
  /** True when some reference checks failed server-side for this page; an
   *  object's empty `references` is then unverified, not a confirmed orphan. */
  degraded: boolean;
}

export interface AdminMediaHead {
  key: string;
  contentType: string | null;
  contentLength: number | null;
}

/**
 * `GET /admin/media` — one page. `kind === "all"` sends no `prefix`. When
 * `uploaderId` is set it takes over: the backend lists that member's uploads
 * across ALL kinds in a single page, so `prefix`/`continuationToken` are not
 * sent (they'd be ignored anyway).
 */
export function getAdminMediaPage(params: {
  kind: AdminMediaKind;
  uploaderId?: string;
  continuationToken?: string;
  limit?: number;
}): Promise<AdminMediaPageVM> {
  const search = new URLSearchParams();
  if (params.uploaderId) {
    search.set("uploaderId", params.uploaderId);
  } else {
    if (params.kind !== "all") search.set("prefix", params.kind);
    if (params.continuationToken)
      search.set("continuationToken", params.continuationToken);
  }
  if (params.limit) search.set("limit", String(params.limit));
  const queryString = search.toString();
  return apiGet<AdminMediaPageVM>(
    `/admin/media${queryString ? `?${queryString}` : ""}`,
  );
}

/** `GET /admin/media/uploaders?q=` — member typeahead for the uploader filter.
 *  The backend returns `[]` for a term under 2 characters. */
export function searchAdminMediaUploaders(
  q: string,
): Promise<AdminMediaUploaderResult[]> {
  return apiGet<AdminMediaUploaderResult[]>(
    `/admin/media/uploaders?q=${encodeURIComponent(q)}`,
  );
}

/** `GET /admin/media/head` — real stored content type for one object. */
export function getAdminMediaHead(key: string): Promise<AdminMediaHead> {
  return apiGet<AdminMediaHead>(
    `/admin/media/head?key=${encodeURIComponent(key)}`,
  );
}

/** `DELETE /admin/media` — permanently remove one stored object from the
 *  bucket. Deletes the raw object only; any DB row still referencing the key is
 *  left as-is (that image simply stops loading), so the caller warns first.
 *
 *  The backend refuses by default: `409` (body carries `references`) while the
 *  object is still used anywhere, and `503` when the reference check could not
 *  be completed. `isForced` sends `force=true`, the deliberate override an
 *  abuse takedown needs; every forced delete is logged server-side with the
 *  references it overrode. Only pass it once the admin has SEEN what breaks. */
export function deleteAdminMediaObject(
  key: string,
  isForced = false,
): Promise<void> {
  const forceSuffix = isForced ? "&force=true" : "";
  return apiDelete<void>(
    `/admin/media?key=${encodeURIComponent(key)}${forceSuffix}`,
  );
}

/** The `409` body the delete route returns while the object is still used:
 *  every place that still points at the key, so the console can show the admin
 *  exactly what a forced delete would break. */
export interface AdminMediaDeleteConflict {
  message?: string;
  /** Reason code; `media_live_cover` means the image is a live cover. */
  code?: string;
  references?: MediaReference[];
  /** Present with `media_live_cover`: the scenes and Studio releases that name
   *  the image as their cover. */
  coverHolders?: AdminMediaCoverHolder[];
}

/** One scene, Studio release or Studio page photo slot (`entityId` `hero` or
 *  `manifesto`) whose live cover is the image being deleted. */
export interface AdminMediaCoverHolder {
  kind: "studio-scene" | "studio-release" | "studio-landing-photo";
  entityId: string;
  label: string;
}
