import { apiDelete, apiGet } from "../../../shared/api/client";
import { API_BASE_URL } from "../../../shared/api/config";
import type { CropRect } from "../../../shared/components/ui/cropGeometry";
import type { MediaReference } from "../../../shared/media/mediaReferences";

/** Mirrors the backend's `UploadKind`
 *  (`queerpulse-backend/src/storage/upload-kinds.ts`) exactly — `/me/media`
 *  lists an object for EVERY kind, so a kind missing here has no
 *  `settings:uploads.kind.*` label and renders as a raw translation key. */
export type MyMediaKind =
  | "avatar"
  | "work-image"
  | "story-cover"
  | "persona-cover"
  | "gathering-photo"
  | "group-avatar"
  | "listing-photo"
  | "listing-menu"
  | "community-cover"
  | "community-avatar"
  | "event-cover"
  | "message-image"
  | "message-document";

export interface MyMediaItem {
  key: string;
  kind: MyMediaKind;
  size: number;
  lastModified: string | null;
  fileUrl: string;
  /** Every place this upload is still referenced, from the backend's
   *  `MediaReferenceResolver`. Empty = not referenced = safe to delete. */
  references: MediaReference[];
  /** The saved reframe crop, shared by every place this upload is used. Null
   *  when it was never reframed; absent on demo items seeded without one. */
  crop?: CropRect | null;
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

const DOCUMENT_EXTENSIONS = ["pdf", "csv", "txt", "xlsx"];

/** The uppercase document extension for a storage key ("PDF", "CSV", "TXT",
 *  "XLSX"), or null when the key doesn't end in one of those. Keyed off the
 *  extension: a `listing-menu` upload can be a photo, so the `kind` alone
 *  can't tell a document from an image. */
export function documentExtensionOf(key: string): string | null {
  const lowerCaseKey = key.toLowerCase();
  const matchedExtension = DOCUMENT_EXTENSIONS.find((extension) =>
    lowerCaseKey.endsWith(`.${extension}`),
  );
  return matchedExtension ? matchedExtension.toUpperCase() : null;
}
