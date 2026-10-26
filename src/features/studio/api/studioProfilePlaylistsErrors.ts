import { ApiError } from "../../../shared/api/client";

/** Reason code the server sends on a refused profile-playlists write, read
 *  straight from the error body. */
function reasonCodeOf(error: unknown): string | null {
  if (!(error instanceof ApiError)) return null;
  const body = error.data;
  if (!body || typeof body !== "object" || !("code" in body)) return null;
  const code = (body as { code?: unknown }).code;
  return typeof code === "string" ? code : null;
}

const REASON_COPY_KEY: Record<string, string> = {
  studio_profile_playlist_not_yours:
    "settings:editProfile.playlists.error.playlistNotYours",
  playlist_not_found: "settings:editProfile.playlists.error.playlistNotFound",
  profile_playlists_too_many: "settings:editProfile.playlists.error.tooMany",
  profile_playlists_duplicate: "settings:editProfile.playlists.error.duplicate",
};

/** The catalog key naming the specific cause of a failed read or save. */
export function profilePlaylistsErrorKey(error: unknown): string {
  const code = reasonCodeOf(error);
  const copyKey = code ? REASON_COPY_KEY[code] : undefined;
  if (copyKey) return copyKey;
  if (error instanceof ApiError) {
    if (error.status === 401)
      return "settings:editProfile.playlists.error.signedOut";
    if (error.status === 403 || error.status === 404)
      return "settings:editProfile.playlists.error.noStudioAccess";
    if (error.status === 429)
      return "settings:editProfile.playlists.error.rateLimited";
    if (error.status >= 500)
      return "settings:editProfile.playlists.error.serverDown";
    return "settings:editProfile.playlists.error.rejected";
  }
  return "settings:editProfile.playlists.error.offline";
}
