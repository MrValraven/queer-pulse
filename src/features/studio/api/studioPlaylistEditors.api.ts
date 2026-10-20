import { apiDelete, apiGet, apiPost } from "../../../shared/api/client";
import { studioErrorCodeOf } from "./studio.api";
import type {
  InviteStudioPlaylistEditorsBody,
  RespondStudioPlaylistInviteBody,
  StudioPlaylistDTO,
  StudioPlaylistEditorCandidatesDTO,
  StudioPlaylistEditorListDTO,
  StudioPlaylistInviteResponse,
  StudioPlaylistPersonDTO,
} from "./studio.types";

// Collaborative playlists: one raw call per route of the 2026-10-14 contract.
// Owners invite, pick and remove; editors leave; invitees answer.

const segment = (value: string) => encodeURIComponent(value);
const playlistPath = (playlistId: string) =>
  `/studio/playlists/${segment(playlistId)}`;
const editorsPath = (playlistId: string) =>
  `${playlistPath(playlistId)}/editors`;

export const getStudioPlaylistEditors = (playlistId: string) =>
  apiGet<StudioPlaylistEditorListDTO>(editorsPath(playlistId));

/** All or nothing; the answer is the whole list after the change. */
export const inviteStudioPlaylistEditors = (
  playlistId: string,
  memberSlugs: string[],
) => {
  const body: InviteStudioPlaylistEditorsBody = { memberSlugs };
  return apiPost<StudioPlaylistEditorListDTO>(editorsPath(playlistId), body);
};

/** Revokes an active editor or cancels an invite by its row id: 204; an
 *  unknown id answers 404 `studio_playlist_editor_not_found`. */
export const removeStudioPlaylistEditor = (
  playlistId: string,
  editorId: string,
) => apiDelete<void>(`${editorsPath(playlistId)}/${segment(editorId)}`);

/** The caller stops editing: 204. */
export const leaveStudioPlaylist = (playlistId: string) =>
  apiDelete<void>(`${editorsPath(playlistId)}/me`);

/** Accept answers the playlist as its new editor sees it; decline answers
 *  204, read here as undefined. */
export const respondStudioPlaylistInvite = (
  playlistId: string,
  response: StudioPlaylistInviteResponse,
) => {
  const body: RespondStudioPlaylistInviteBody = { response };
  return apiPost<StudioPlaylistDTO | undefined>(
    `${playlistPath(playlistId)}/editor-invite`,
    body,
  );
};

/** The longest candidate search the server accepts. */
const EDITOR_CANDIDATE_QUERY_MAX_LENGTH = 80;

/** The credit persona's co-owners, searched on the server. */
export const getStudioPlaylistEditorCandidates = (
  playlistId: string,
  searchQuery: string,
) => {
  const trimmed = searchQuery
    .trim()
    .slice(0, EDITOR_CANDIDATE_QUERY_MAX_LENGTH);
  const query = trimmed ? `?q=${encodeURIComponent(trimmed)}` : "";
  return apiGet<StudioPlaylistEditorCandidatesDTO>(
    `${playlistPath(playlistId)}/editor-candidates${query}`,
  );
};

function errorBodyOf(error: unknown): Record<string, unknown> {
  const data = (error as { data?: unknown }).data;
  return data && typeof data === "object"
    ? (data as Record<string, unknown>)
    : {};
}

/** The slugs a 422 `studio_playlist_editor_ineligible` names; [] otherwise. */
export function ineligibleEditorSlugsOf(error: unknown): string[] {
  if (studioErrorCodeOf(error) !== "studio_playlist_editor_ineligible")
    return [];
  const slugs = errorBodyOf(error).memberSlugs;
  return Array.isArray(slugs)
    ? slugs.filter((slug): slug is string => typeof slug === "string")
    : [];
}

function isPersonDto(value: unknown): value is StudioPlaylistPersonDTO {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.slug === "string" &&
    typeof candidate.displayName === "string" &&
    (candidate.avatarUrl === null || typeof candidate.avatarUrl === "string")
  );
}

/** Who a 409 `studio_playlist_credit_change_removes_editors` names; null for
 *  any other error. */
export function editorsRemovedByCreditChangeOf(
  error: unknown,
): StudioPlaylistPersonDTO[] | null {
  if (
    studioErrorCodeOf(error) !== "studio_playlist_credit_change_removes_editors"
  )
    return null;
  const editors = errorBodyOf(error).editors;
  return Array.isArray(editors) ? editors.filter(isPersonDto) : [];
}
