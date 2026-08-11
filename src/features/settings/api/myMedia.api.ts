import { apiDelete, apiGet } from "../../../shared/api/client";
import { API_BASE_URL } from "../../../shared/api/config";
import type { MediaReference } from "../../../shared/media/mediaReferences";

export type MyMediaKind =
  | "avatar"
  | "work-image"
  | "story-cover"
  | "gathering-photo"
  | "group-avatar"
  | "listing-photo";

export interface MyMediaItem {
  key: string;
  kind: MyMediaKind;
  size: number;
  lastModified: string | null;
  fileUrl: string;
  /** Every place this upload is still referenced, from the backend's
   *  `MediaReferenceResolver`. Empty = not referenced = safe to delete. */
  references: MediaReference[];
}

interface MyMediaListResponse {
  items: MyMediaItem[];
  /** True when some reference checks failed server-side; an item's empty
   *  `references` is then unverified, not a confirmed "safe to delete". */
  degraded: boolean;
}

/** The my-media list plus the resolver's degraded flag, so the UI can tell
 *  "no references" (authoritative) apart from "some checks couldn't run". */
export interface MyMediaListResult {
  items: MyMediaItem[];
  degraded: boolean;
}

export async function getMyMedia(): Promise<MyMediaListResult> {
  const response = await apiGet<MyMediaListResponse>("/me/media");
  return { items: response.items, degraded: response.degraded };
}

export async function deleteMyMedia(key: string): Promise<void> {
  await apiDelete<{ deleted: boolean }>("/me/media", { key });
}

/** Absolute, renderable URL for a my-media item. Live items are relative
 *  ("/files/<key>") and get the API origin; demo items are already absolute. */
export function resolveMyMediaUrl(fileUrl: string): string {
  return /^https?:\/\//.test(fileUrl) ? fileUrl : `${API_BASE_URL}${fileUrl}`;
}
