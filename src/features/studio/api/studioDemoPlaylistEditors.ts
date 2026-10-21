import { foldForSearch } from "../../../shared/lib/foldForSearch";
import { SEED_CONNECTED } from "../../connect/connectionSeeds.data";
import {
  DEMO_PERSONA_CO_OWNERS,
  DEMO_VIEWER_MEMBER_SLUG,
  demoEditorIdOf,
} from "../studioCollection.data";
import {
  STUDIO_PLAYLIST_LIMITS,
  type StudioPlaylistDTO,
  type StudioPlaylistEditorCandidatesDTO,
  type StudioPlaylistEditorIneligibleReason,
  type StudioPlaylistEditorListDTO,
  type StudioPlaylistInviteResponse,
} from "./studio.types";
import {
  demoPersonOf,
  demoPlaylistDto,
  demoPlaylistForRole,
  demoPlaylistRecord,
  demoViewerRole,
  endDemoEditing,
  hasBrokenCredit,
  refused,
  type DemoPlaylist,
} from "./studioDemoPlaylists";

/** The demo's editor routes over the same in-memory playlists. Demo only:
 *  every caller reaches this module through a dynamic import. */

const CONNECTED_SLUGS: readonly string[] = SEED_CONNECTED;

function listOf(
  playlist: DemoPlaylist,
  isOwnerView: boolean,
): StudioPlaylistEditorListDTO {
  return {
    items: [...playlist.editors]
      .filter((editor) => isOwnerView || editor.status === "active")
      .sort((left, right) => left.invitedAt.localeCompare(right.invitedAt))
      .map((editor) => ({
        editorId: editor.editorId,
        member: demoPersonOf(editor.slug),
        status: editor.status,
        source: editor.source,
        invitedAt: editor.invitedAt,
      })),
  };
}

export function demoPlaylistEditors(
  playlistId: string,
): StudioPlaylistEditorListDTO {
  const playlist = demoPlaylistForRole(playlistId, "editor");
  return listOf(playlist, demoViewerRole(playlist) === "owner");
}

/** Invites connections to a member-credited playlist, or picks co-owners on
 *  a persona-credited one (active at once). All or nothing. */
export function demoInvitePlaylistEditors(
  playlistId: string,
  memberSlugs: string[],
): StudioPlaylistEditorListDTO {
  const playlist = demoPlaylistForRole(playlistId, "owner");
  const personaId = playlist.creditPersonaId;
  const allowedSlugs =
    personaId === null
      ? CONNECTED_SLUGS
      : (DEMO_PERSONA_CO_OWNERS[personaId] ?? []);
  const currentSlugs = new Set(playlist.editors.map((editor) => editor.slug));
  const freshSlugs = [...new Set(memberSlugs)].filter(
    (slug) => !currentSlugs.has(slug),
  );
  // One reason per member, as the server answers: a persona credit that
  // stopped standing refuses the whole request.
  const reasonOf = (
    slug: string,
  ): StudioPlaylistEditorIneligibleReason | null => {
    if (slug === DEMO_VIEWER_MEMBER_SLUG) return "is_owner";
    if (personaId !== null && hasBrokenCredit(playlist))
      return "persona_credit_lapsed";
    if (allowedSlugs.includes(slug)) return null;
    return personaId === null ? "not_connected" : "not_co_owner";
  };
  const ineligibleMembers = freshSlugs.flatMap((memberSlug) => {
    const reason = reasonOf(memberSlug);
    return reason === null ? [] : [{ memberSlug, reason }];
  });
  if (ineligibleMembers.length > 0)
    throw refused(422, "studio_playlist_editor_ineligible", {
      memberSlugs: ineligibleMembers.map((member) => member.memberSlug),
      ineligibleMembers,
    });
  if (
    playlist.editors.length + freshSlugs.length >
    STUDIO_PLAYLIST_LIMITS.editorsMax
  )
    throw refused(409, "studio_playlist_editor_cap");
  const invitedAt = new Date().toISOString();
  for (const slug of freshSlugs)
    playlist.editors.push({
      editorId: demoEditorIdOf(playlist.id, slug),
      slug,
      status: personaId === null ? "invited" : "active",
      source: personaId === null ? "member_invite" : "persona_co_owner",
      invitedAt,
    });
  return listOf(playlist, true);
}

/** By row id. The demo drops an ended row, so a second remove of the same
 *  id answers 404 `studio_playlist_editor_not_found`. */
export function demoRemovePlaylistEditor(
  playlistId: string,
  editorId: string,
): void {
  const playlist = demoPlaylistForRole(playlistId, "owner");
  const editor = playlist.editors.find((row) => row.editorId === editorId);
  if (!editor) throw refused(404, "studio_playlist_editor_not_found");
  endDemoEditing(playlist, editor.slug);
}

export function demoLeavePlaylist(playlistId: string): void {
  const playlist = demoPlaylistForRole(playlistId, "editor");
  // As the server: the owner has nothing to leave, a 204 that changes nothing.
  if (demoViewerRole(playlist) !== "editor") return;
  endDemoEditing(playlist, DEMO_VIEWER_MEMBER_SLUG);
}

export function demoRespondPlaylistInvite(
  playlistId: string,
  response: StudioPlaylistInviteResponse,
): StudioPlaylistDTO | undefined {
  const playlist = demoPlaylistRecord(playlistId);
  const ownInvite = playlist?.editors.find(
    (editor) =>
      editor.slug === DEMO_VIEWER_MEMBER_SLUG && editor.status === "invited",
  );
  if (!playlist || !ownInvite)
    throw refused(404, "studio_playlist_invite_not_found");
  if (response === "decline") {
    endDemoEditing(playlist, DEMO_VIEWER_MEMBER_SLUG);
    return undefined;
  }
  ownInvite.status = "active";
  return demoPlaylistDto(playlist);
}

export function demoPlaylistEditorCandidates(
  playlistId: string,
  searchQuery: string,
): StudioPlaylistEditorCandidatesDTO {
  const playlist = demoPlaylistForRole(playlistId, "owner");
  const personaId = playlist.creditPersonaId;
  if (personaId === null)
    throw refused(409, "studio_playlist_editor_source_mismatch");
  const needle = foldForSearch(searchQuery.trim().replace(/^@+/, ""));
  const editingSlugs = new Set(playlist.editors.map((editor) => editor.slug));
  return {
    items: (DEMO_PERSONA_CO_OWNERS[personaId] ?? [])
      .map(demoPersonOf)
      .filter(
        (person) =>
          !needle ||
          foldForSearch(person.displayName).includes(needle) ||
          person.slug.includes(needle),
      )
      .slice(0, STUDIO_PLAYLIST_LIMITS.editorCandidatesMax)
      .map((person) => ({
        member: person,
        isEditor: editingSlugs.has(person.slug),
      })),
  };
}
