import { API_BASE_URL } from "../../shared/api/config";

/**
 * Absolute URL for a `/files/*` proxy path so `<img>`/new-tab both resolve.
 *
 * The backend returns `fileUrl` RELATIVE (`/files/<key>`). The `/files/*` route
 * is version-neutral (`FilesController`), so it answers at the bare path WITHOUT
 * the `/v1` prefix the api client prepends to `request()` calls — matching every
 * other image URL in the app (avatars via `toImageUrl`, My Uploads). We prepend
 * only the origin; never `/v1`.
 */
export function absoluteFileUrl(fileUrl: string): string {
  return fileUrl.startsWith("http") ? fileUrl : `${API_BASE_URL}${fileUrl}`;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
