import { ApiError } from "../../../shared/api/client";
import { foldForSearch } from "../../../shared/lib/foldForSearch";
import {
  DEMO_PERSONA_CO_OWNERS,
  DEMO_PLAYLIST_PEOPLE,
  DEMO_PLAYLIST_SEEDS,
  DEMO_VIEWER_MEMBER,
  DEMO_VIEWER_MEMBER_SLUG,
  type DemoEditorSeed,
  type DemoPlaylistSeed,
} from "../studioCollection.data";
import {
  STUDIO_PLAYLIST_LIMITS,
  type CreateStudioPlaylistBody,
  type StudioPageDTO,
  type StudioPlaylistCardDTO,
  type StudioPlaylistCreditDTO,
  type StudioPlaylistDTO,
  type StudioPlaylistEntryDTO,
  type StudioPlaylistPersonDTO,
  type StudioPlaylistRole,
  type StudioPlaylistTrackDTO,
  type StudioProfilePlaylistsDTO,
  type UpdateStudioPlaylistBody,
  type UpdateStudioProfilePlaylistsBody,
} from "./studio.types";
import { demoReleaseCard } from "./studioDemoCards";
import { demoTrackWithSafety } from "./studioDemoSafety";
import { DEMO_RELEASES, DEMO_WITHDRAWN_TRACK_IDS } from "./studioDemo.data";
import {
  DEMO_FORMAT_RELEASES,
  demoAllArtists,
  isDemoOwnedPersona,
} from "./studioDemoFormats.data";

/** The demo's playlists, held in memory for the session. A write here is
 *  what the next read returns, the way the live server answers. Demo only:
 *  every caller reaches this module through a dynamic import. */

export const DEMO_PLAYLIST_PAGE_SIZE = STUDIO_PLAYLIST_LIMITS.playlistsPerPage;

interface DemoEntry {
  entryId: string;
  trackId: string;
  addedAt: string;
  addedBySlug: string | null;
}

export interface DemoPlaylist extends Omit<
  DemoPlaylistSeed,
  "trackIds" | "editors" | "addedBySlugByTrackId"
> {
  entries: DemoEntry[];
  editors: DemoEditorSeed[];
}

const notFound = () => new ApiError(404, "Not found");
export const refused = (
  status: 403 | 404 | 409 | 422,
  code: string,
  extra: Record<string, unknown> = {},
) =>
  new ApiError(status, code, {
    statusCode: status,
    code,
    message: code,
    ...extra,
  });

const invalid = (field: string) =>
  new ApiError(400, "Bad request", {
    statusCode: 400,
    error: "Bad Request",
    message: [`${field} is invalid`],
  });

function checkName(name: string): string {
  const trimmed = name.trim();
  if (trimmed.length < 1 || trimmed.length > STUDIO_PLAYLIST_LIMITS.nameMax)
    throw invalid("name");
  return trimmed;
}

function checkDescription(description: string): string | null {
  const trimmed = description.trim();
  if (trimmed.length > STUDIO_PLAYLIST_LIMITS.descriptionMax)
    throw invalid("description");
  return trimmed || null;
}

let demoSequence = 0;
const nextDemoId = (prefix: string) =>
  `${prefix}-${Date.now()}-${(demoSequence += 1)}`;

function fromSeed(seed: DemoPlaylistSeed): DemoPlaylist {
  const { trackIds, editors, addedBySlugByTrackId, ...rest } = seed;
  return {
    ...rest,
    // Copies, so a write in one test never reaches the seeds.
    editors: (editors ?? []).map((editor) => ({ ...editor })),
    entries: trackIds.map((trackId, index) => ({
      entryId: `${seed.id}-entry-${index + 1}`,
      trackId,
      addedAt: seed.updatedAt,
      addedBySlug: addedBySlugByTrackId?.[trackId] ?? null,
    })),
  };
}

const store = new Map<string, DemoPlaylist>();

/** The demo viewer's profile-playlists choice, held for the session. */
let profilePlaylistsSetting: UpdateStudioProfilePlaylistsBody = {
  isShown: true,
  featuredIds: [],
};

/** Back to the seeds. Tests call it between cases. */
export function resetDemoPlaylists(): void {
  store.clear();
  profilePlaylistsSetting = { isShown: true, featuredIds: [] };
  for (const seed of DEMO_PLAYLIST_SEEDS) store.set(seed.id, fromSeed(seed));
}
resetDemoPlaylists();

/** Every published demo track with its release card: what a viewer can open.
 *  Read per call so a fixture edit shows up. Liked songs reads it too
 *  (`studioDemoLiked`), also only through a dynamic import. */
export const demoPublishedTracks = () =>
  new Map<string, StudioPlaylistTrackDTO>([
    ...DEMO_RELEASES.flatMap((release) =>
      release.tracks.map(
        (track) =>
          [
            track.id,
            {
              ...demoTrackWithSafety(track, false),
              release: demoReleaseCard(release),
            },
          ] as const,
      ),
    ),
    // Episodes, spoken word and performance tracks: a draft episode is left out.
    ...DEMO_FORMAT_RELEASES.filter(
      (release) => release.status === "published",
    ).flatMap((release) =>
      release.tracks
        .filter((track) => track.isDraft !== true)
        .map(
          (track) =>
            [
              track.id,
              {
                ...demoTrackWithSafety(track, false),
                release: demoReleaseCard(release),
              },
            ] as const,
        ),
    ),
  ]);

const byUpdatedDesc = (left: DemoPlaylist, right: DemoPlaylist) =>
  right.updatedAt.localeCompare(left.updatedAt);

/** The viewer's role on a demo playlist, the way the server answers it. */
export function demoViewerRole(
  playlist: DemoPlaylist,
): StudioPlaylistRole | null {
  if (playlist.isViewerOwner) return "owner";
  const ownRow = playlist.editors.find(
    (editor) => editor.slug === DEMO_VIEWER_MEMBER_SLUG,
  );
  if (ownRow?.status === "active") return "editor";
  if (ownRow?.status === "invited") return "invitee";
  return null;
}

export const demoPersonOf = (slug: string): StudioPlaylistPersonDTO =>
  DEMO_PLAYLIST_PEOPLE[slug] ?? { slug, displayName: slug, avatarUrl: null };

const ownerSlugOf = (playlist: DemoPlaylist): string =>
  playlist.isViewerOwner
    ? DEMO_VIEWER_MEMBER_SLUG
    : (playlist.ownerSlug ?? playlist.creditMemberSlug ?? "");

/** The demo viewer counts as a connection of every other demo member. The
 *  owner always opens it; an editor or an invitee opens it whatever its
 *  visibility while its credit stands (a persona credit that stopped
 *  standing leaves it to the owner, as the server answers). */
function isVisible(playlist: DemoPlaylist): boolean {
  const role = demoViewerRole(playlist);
  if (role === "owner") return true;
  if (hasBrokenCredit(playlist)) return false;
  return role !== null || playlist.visibility !== "private";
}

const creditPersonaOf = (playlist: DemoPlaylist) =>
  playlist.creditPersonaId
    ? (demoAllArtists().find(
        (artist) => artist.id === playlist.creditPersonaId,
      ) ?? null)
    : null;

/** A persona credit whose persona can no longer be resolved. The server
 *  keeps such a playlist private and shows the owner their own member
 *  credit; nobody else can open it. */
/** A persona credit that stopped standing (the persona went away). */
export const hasBrokenCredit = (playlist: DemoPlaylist) =>
  playlist.creditPersonaId !== null && creditPersonaOf(playlist) === null;

function creditOf(playlist: DemoPlaylist): StudioPlaylistCreditDTO {
  const persona = creditPersonaOf(playlist);
  if (persona) return { persona, member: null };
  if (hasBrokenCredit(playlist))
    return { persona: null, member: DEMO_VIEWER_MEMBER };
  return { persona: null, member: playlist.creditMember ?? DEMO_VIEWER_MEMBER };
}

function toDto(playlist: DemoPlaylist): StudioPlaylistDTO {
  const role = demoViewerRole(playlist);
  const isOwner = role === "owner";
  const hasEditRights = isOwner || role === "editor";
  const tracksById = demoPublishedTracks();
  const resolved = playlist.entries.map((entry) => ({
    entry,
    track: tracksById.get(entry.trackId) ?? null,
  }));
  const shown = hasEditRights ? resolved : resolved.filter((row) => row.track);
  const entries: StudioPlaylistEntryDTO[] = shown.map((row, index) => ({
    entryId: row.entry.entryId,
    position: index + 1,
    addedAt: row.entry.addedAt,
    isAvailable: row.track !== null,
    track: row.track,
    // As the server: the reason travels only for a release takedown.
    ...(row.track === null && DEMO_WITHDRAWN_TRACK_IDS.has(row.entry.trackId)
      ? { unavailableReason: "withdrawn" as const }
      : {}),
    addedBy:
      hasEditRights && row.entry.addedBySlug
        ? demoPersonOf(row.entry.addedBySlug)
        : null,
  }));
  const playable = entries.flatMap((entry) =>
    entry.track?.hasAudio ? [entry.track] : [],
  );
  const coverUrls = [
    ...new Set(
      playable.flatMap((track) =>
        track.release.coverUrl ? [track.release.coverUrl] : [],
      ),
    ),
  ].slice(0, 4);
  const ownInvite = playlist.editors.find(
    (editor) =>
      editor.slug === DEMO_VIEWER_MEMBER_SLUG && editor.status === "invited",
  );
  return {
    id: playlist.id,
    name: playlist.name,
    credit: creditOf(playlist),
    coverUrls,
    trackCount: playable.length,
    totalDurationSeconds: playable.reduce(
      (sum, track) => sum + (track.durationSeconds ?? 0),
      0,
    ),
    updatedAt: playlist.updatedAt,
    isOwner,
    role,
    editorCount: hasEditRights
      ? playlist.editors.filter((editor) => editor.status === "active").length
      : null,
    visibility: isOwner
      ? hasBrokenCredit(playlist)
        ? "private"
        : playlist.visibility
      : null,
    description: playlist.description,
    entries,
    creditSubprofileId: isOwner ? playlist.creditPersonaId : null,
    invite:
      role === "invitee" && ownInvite
        ? {
            invitedBy: demoPersonOf(ownerSlugOf(playlist)),
            invitedAt: ownInvite.invitedAt,
          }
        : null,
  };
}

function toCardDto(playlist: DemoPlaylist): StudioPlaylistCardDTO {
  const dto = toDto(playlist);
  return {
    id: dto.id,
    name: dto.name,
    credit: dto.credit,
    coverUrls: dto.coverUrls,
    trackCount: dto.trackCount,
    totalDurationSeconds: dto.totalDurationSeconds,
    updatedAt: dto.updatedAt,
    isOwner: dto.isOwner,
    visibility: dto.visibility,
    role: dto.role,
    editorCount: dto.editorCount,
  };
}

/** The record itself, for the editor routes in studioDemoPlaylistEditors. */
export const demoPlaylistRecord = (playlistId: string) => store.get(playlistId);

export const demoPlaylistDto = (playlist: DemoPlaylist) => toDto(playlist);

/** Ends a member's editing on one playlist: their row goes and the tracks
 *  they added stay, with their "added by" cleared. */
export function endDemoEditing(playlist: DemoPlaylist, slug: string): void {
  playlist.editors = playlist.editors.filter((editor) => editor.slug !== slug);
  for (const entry of playlist.entries)
    if (entry.addedBySlug === slug) entry.addedBySlug = null;
}

function pageOf(
  playlists: DemoPlaylist[],
  cursor: string | null,
): StudioPageDTO<StudioPlaylistCardDTO> {
  const offset = cursor ? Number(cursor) : 0;
  const nextOffset = offset + DEMO_PLAYLIST_PAGE_SIZE;
  const hasMore = nextOffset < playlists.length;
  return {
    items: playlists.slice(offset, nextOffset).map(toCardDto),
    pageInfo: { nextCursor: hasMore ? String(nextOffset) : null, hasMore },
  };
}

const allPlaylists = () => [...store.values()].sort(byUpdatedDesc);
const publicPlaylists = () =>
  allPlaylists().filter(
    (playlist) =>
      playlist.visibility === "public" && !hasBrokenCredit(playlist),
  );

/** A playlist the viewer may write to: 404 when they cannot open it, 403
 *  owner only when they can open it but lack the role. */
export function demoPlaylistForRole(
  playlistId: string,
  required: "owner" | "editor",
): DemoPlaylist {
  const playlist = store.get(playlistId);
  if (!playlist || !isVisible(playlist)) throw notFound();
  const role = demoViewerRole(playlist);
  const isAllowed =
    required === "owner"
      ? role === "owner"
      : role === "owner" || role === "editor";
  if (!isAllowed) throw refused(403, "studio_playlist_owner_only");
  return playlist;
}

/** Editors whose way in no longer fits a new credit: member invites leave a
 *  persona credit, and co-owners leave a member credit or a persona they do
 *  not co-own. */
function editorsEndedByCredit(
  playlist: DemoPlaylist,
  nextPersonaId: string | null,
): DemoEditorSeed[] {
  return playlist.editors.filter((editor) => {
    if (nextPersonaId === null) return editor.source === "persona_co_owner";
    if (editor.source === "member_invite") return true;
    return !(DEMO_PERSONA_CO_OWNERS[nextPersonaId] ?? []).includes(editor.slug);
  });
}

function touch(playlist: DemoPlaylist): StudioPlaylistDTO {
  playlist.updatedAt = new Date().toISOString();
  return toDto(playlist);
}

export function demoMyPlaylistsPage(cursor: string | null) {
  return pageOf(
    allPlaylists().filter((playlist) => {
      const role = demoViewerRole(playlist);
      if (role === "owner") return true;
      return (role === "editor" || role === "invitee") && isVisible(playlist);
    }),
    cursor,
  );
}

export function demoStudioPlaylist(playlistId: string): StudioPlaylistDTO {
  const playlist = store.get(playlistId);
  if (!playlist || !isVisible(playlist)) throw notFound();
  return toDto(playlist);
}

export function demoArtistPlaylistCards(
  subprofileId: string,
): StudioPlaylistCardDTO[] {
  return publicPlaylists()
    .filter((playlist) => playlist.creditPersonaId === subprofileId)
    .slice(0, DEMO_PLAYLIST_PAGE_SIZE)
    .map(toCardDto);
}

/** Member-credited playlists on a member's profile. Another member's page
 *  lists their public and connections-only playlists (the demo viewer is
 *  everyone's connection). The demo viewer's own page follows their profile
 *  setting, as the server does: nothing while it is hidden, their public
 *  playlists while none are featured, else the featured ones in the order
 *  they picked. */
export function demoMemberPlaylistsPage(
  memberSlug: string,
  cursor: string | null,
) {
  const isSelf = memberSlug === DEMO_VIEWER_MEMBER_SLUG;
  const credited = allPlaylists().filter(
    (playlist) =>
      playlist.creditPersonaId === null &&
      playlist.creditMemberSlug === memberSlug &&
      (isSelf || playlist.visibility !== "private"),
  );
  if (!isSelf) return pageOf(credited, cursor);
  // The owner's own setting filters their profile, the way the server does.
  if (!profilePlaylistsSetting.isShown) return pageOf([], cursor);
  if (profilePlaylistsSetting.featuredIds.length === 0)
    return pageOf(
      credited.filter((playlist) => playlist.visibility === "public"),
      cursor,
    );
  return pageOf(
    profilePlaylistsSetting.featuredIds.flatMap((id) =>
      credited.filter((playlist) => playlist.id === id),
    ),
    cursor,
  );
}

/** `GET studio/me/profile-playlists`: every playlist the viewer owns and
 *  credits to themselves, private ones included. */
export function demoProfilePlaylists(): StudioProfilePlaylistsDTO {
  return {
    ...profilePlaylistsSetting,
    items: allPlaylists()
      .filter(
        (playlist) =>
          playlist.creditPersonaId === null &&
          playlist.creditMemberSlug === DEMO_VIEWER_MEMBER_SLUG &&
          demoViewerRole(playlist) === "owner",
      )
      .map(toCardDto),
  };
}

/** `PUT studio/me/profile-playlists`, with the server's refusals. */
export function demoSetProfilePlaylists(
  body: UpdateStudioProfilePlaylistsBody,
): StudioProfilePlaylistsDTO {
  const ownedIds = new Set(
    demoProfilePlaylists().items.map((playlist) => playlist.id),
  );
  if (body.featuredIds.length > STUDIO_PLAYLIST_LIMITS.profileFeaturedMax)
    throw refused(422, "profile_playlists_too_many");
  if (new Set(body.featuredIds).size !== body.featuredIds.length)
    throw refused(422, "profile_playlists_duplicate");
  if (body.featuredIds.some((id) => !ownedIds.has(id)))
    throw refused(422, "studio_profile_playlist_not_yours");
  profilePlaylistsSetting = {
    isShown: body.isShown,
    featuredIds: [...body.featuredIds],
  };
  return demoProfilePlaylists();
}

export function demoTrackPlaylists(trackId: string): {
  items: StudioPlaylistCardDTO[];
} {
  return {
    items: publicPlaylists()
      .filter((playlist) =>
        playlist.entries.some((entry) => entry.trackId === trackId),
      )
      .slice(0, STUDIO_PLAYLIST_LIMITS.trackPlaylistsMax)
      .map(toCardDto),
  };
}

export function demoSearchPlaylistCards(
  query: string,
): StudioPlaylistCardDTO[] {
  const needle = foldForSearch(query.trim()).replace(/[^a-z0-9]+/g, " ");
  if (!needle.trim()) return [];
  return publicPlaylists()
    .filter((playlist) =>
      foldForSearch(playlist.name)
        .replace(/[^a-z0-9]+/g, " ")
        .includes(needle),
    )
    .slice(0, 20)
    .map(toCardDto);
}

/** Distinct public playlists holding any of these tracks (Your numbers). */
export function demoPublicInclusions(trackIds: string[]): number {
  const wanted = new Set(trackIds);
  return publicPlaylists().filter((playlist) =>
    playlist.entries.some((entry) => wanted.has(entry.trackId)),
  ).length;
}

export function demoCreatePlaylist(
  body: CreateStudioPlaylistBody,
): StudioPlaylistDTO {
  const ownedCount = [...store.values()].filter(
    (playlist) => playlist.isViewerOwner,
  ).length;
  if (ownedCount >= STUDIO_PLAYLIST_LIMITS.playlistsPerMember)
    throw refused(409, "studio_playlist_limit");
  const creditPersonaId = body.creditSubprofileId ?? null;
  // The demo viewer may credit any persona they can upload as.
  if (creditPersonaId && !isDemoOwnedPersona(creditPersonaId))
    throw refused(422, "studio_playlist_credit_not_allowed");
  const playlist: DemoPlaylist = {
    id: nextDemoId("demo-playlist"),
    name: checkName(body.name),
    description: body.description ? checkDescription(body.description) : null,
    visibility: body.visibility,
    isViewerOwner: true,
    creditPersonaId,
    creditMember: creditPersonaId ? null : DEMO_VIEWER_MEMBER,
    creditMemberSlug: creditPersonaId ? null : DEMO_VIEWER_MEMBER_SLUG,
    entries: [],
    editors: [],
    updatedAt: new Date().toISOString(),
  };
  store.set(playlist.id, playlist);
  return toDto(playlist);
}

export function demoUpdatePlaylist(
  playlistId: string,
  body: UpdateStudioPlaylistBody,
): StudioPlaylistDTO {
  const playlist = demoPlaylistForRole(playlistId, "editor");
  const isOwner = demoViewerRole(playlist) === "owner";
  if (
    !isOwner &&
    (body.visibility !== undefined || body.creditSubprofileId !== undefined)
  )
    throw refused(403, "studio_playlist_owner_only");
  const nextName =
    body.name !== undefined ? checkName(body.name) : playlist.name;
  const nextDescription =
    body.description !== undefined
      ? checkDescription(body.description)
      : playlist.description;
  const nextPersonaId = body.creditSubprofileId;
  const isCreditChange =
    nextPersonaId !== undefined && nextPersonaId !== playlist.creditPersonaId;
  if (isCreditChange) {
    if (nextPersonaId !== null && !isDemoOwnedPersona(nextPersonaId))
      throw refused(422, "studio_playlist_credit_not_allowed");
    const ended = editorsEndedByCredit(playlist, nextPersonaId);
    if (ended.length > 0 && body.confirmEditorRemoval !== true)
      throw refused(409, "studio_playlist_credit_change_removes_editors", {
        editors: ended.map((editor) => demoPersonOf(editor.slug)),
      });
    for (const editor of ended) endDemoEditing(playlist, editor.slug);
    playlist.creditPersonaId = nextPersonaId;
    playlist.creditMember = nextPersonaId ? null : DEMO_VIEWER_MEMBER;
    playlist.creditMemberSlug = nextPersonaId ? null : DEMO_VIEWER_MEMBER_SLUG;
  }
  playlist.name = nextName;
  playlist.description = nextDescription;
  if (body.visibility !== undefined) playlist.visibility = body.visibility;
  return touch(playlist);
}

export function demoDeletePlaylist(playlistId: string): void {
  demoPlaylistForRole(playlistId, "owner");
  store.delete(playlistId);
}

export function demoAddPlaylistTracks(
  playlistId: string,
  trackIds: string[],
): StudioPlaylistDTO {
  const playlist = demoPlaylistForRole(playlistId, "editor");
  if (
    trackIds.length < 1 ||
    trackIds.length > STUDIO_PLAYLIST_LIMITS.tracksPerAdd
  )
    throw invalid("trackIds");
  const present = new Set(playlist.entries.map((entry) => entry.trackId));
  const fresh = [...new Set(trackIds)].filter(
    (trackId) => !present.has(trackId),
  );
  const tracksById = demoPublishedTracks();
  // A withheld track reads unavailable to a listener, like the live add.
  if (
    fresh.some((trackId) => {
      const track = tracksById.get(trackId);
      return !track?.hasAudio || track.isWithheld === true;
    })
  )
    throw refused(422, "studio_playlist_track_unavailable");
  if (
    playlist.entries.length + fresh.length >
    STUDIO_PLAYLIST_LIMITS.tracksPerPlaylist
  )
    throw refused(409, "studio_playlist_track_limit");
  if (fresh.length === 0) return toDto(playlist);
  const addedAt = new Date().toISOString();
  for (const trackId of fresh)
    playlist.entries.push({
      entryId: nextDemoId("demo-entry"),
      trackId,
      addedAt,
      addedBySlug: DEMO_VIEWER_MEMBER_SLUG,
    });
  return touch(playlist);
}

export function demoRemovePlaylistEntry(
  playlistId: string,
  entryId: string,
): void {
  const playlist = demoPlaylistForRole(playlistId, "editor");
  const index = playlist.entries.findIndex(
    (entry) => entry.entryId === entryId,
  );
  if (index < 0) throw refused(404, "studio_playlist_entry_not_found");
  playlist.entries.splice(index, 1);
  touch(playlist);
}

export function demoReorderPlaylist(
  playlistId: string,
  entryIds: string[],
): StudioPlaylistDTO {
  const playlist = demoPlaylistForRole(playlistId, "editor");
  const byId = new Map(playlist.entries.map((entry) => [entry.entryId, entry]));
  const isExactSet =
    entryIds.length === playlist.entries.length &&
    new Set(entryIds).size === entryIds.length &&
    entryIds.every((entryId) => byId.has(entryId));
  if (!isExactSet) throw refused(409, "studio_playlist_order_mismatch");
  playlist.entries = entryIds.flatMap((entryId) => {
    const entry = byId.get(entryId);
    return entry ? [entry] : [];
  });
  return touch(playlist);
}
