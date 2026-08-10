import { apiDelete, apiGet } from "../../../shared/api/client";
import { API_BASE_URL } from "../../../shared/api/config";

export type MyMediaKind =
  | "avatar"
  | "work-image"
  | "story-cover"
  | "gathering-photo"
  | "group-avatar"
  | "listing-photo";

/** Language-neutral slug for WHERE a still-referenced upload is used. Mirrors
 *  the backend `MyMediaUsage`; the UI renders it via `settings:uploads.usedAs.<slug>`. */
export type MyMediaUsage =
  | "profile-photo"
  | "showcase"
  | "story-cover"
  | "event"
  | "group"
  | "listing";

export interface MyMediaItem {
  key: string;
  kind: MyMediaKind;
  size: number;
  lastModified: string | null;
  fileUrl: string;
  inUse: boolean;
  usedAs: MyMediaUsage | null;
}

interface MyMediaListResponse {
  items: MyMediaItem[];
}

export async function getMyMedia(): Promise<MyMediaItem[]> {
  const response = await apiGet<MyMediaListResponse>("/me/media");
  return response.items;
}

export async function deleteMyMedia(key: string): Promise<void> {
  await apiDelete<{ deleted: boolean }>("/me/media", { key });
}

/** Absolute, renderable URL for a my-media item. Live items are relative
 *  ("/files/<key>") and get the API origin; demo items are already absolute. */
export function resolveMyMediaUrl(fileUrl: string): string {
  return /^https?:\/\//.test(fileUrl) ? fileUrl : `${API_BASE_URL}${fileUrl}`;
}
