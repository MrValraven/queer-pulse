import { ApiError } from "../../../shared/api/client";
import { foldForSearch } from "../../../shared/lib/foldForSearch";
import {
  DEMO_PLAYLIST_SEEDS,
  DEMO_VIEWER_MEMBER,
  DEMO_VIEWER_MEMBER_SLUG,
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
  type StudioPlaylistTrackDTO,
  type UpdateStudioPlaylistBody,
} from "./studio.types";
import { demoReleaseCard } from "./studioDemoCards";
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
}

interface DemoPlaylist extends Omit<DemoPlaylistSeed, "trackIds"> {
  entries: DemoEntry[];
}

const notFound = () => new ApiError(404, "Not found");
const refused = (status: 409 | 422, code: string) =>
  new ApiError(status, code, { statusCode: status, code, message: code });

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
  const { trackIds, ...rest } = seed;
  return {
    ...rest,
    entries: trackIds.map((trackId, index) => ({
      entryId: `${seed.id}-entry-${index + 1}`,
      trackId,
      addedAt: seed.updatedAt,
    })),
  };
}

const store = new Map<string, DemoPlaylist>();

/** Back to the seeds. Tests call it between cases. */
export function resetDemoPlaylists(): void {
  store.clear();
  for (const seed of DEMO_PLAYLIST_SEEDS) store.set(seed.id, fromSeed(seed));
}
resetDemoPlaylists();

/** Every published demo track with its release card: what a viewer can open.
 *  Read per call so a fixture edit shows up. */
const publishedTracks = () =>
  new Map<string, StudioPlaylistTrackDTO>([
    ...DEMO_RELEASES.flatMap((release) =>
      release.tracks.map(
        (track) =>
          [track.id, { ...track, release: demoReleaseCard(release) }] as const,
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
              { ...track, release: demoReleaseCard(release) },
            ] as const,
        ),
    ),
  ]);

const byUpdatedDesc = (left: DemoPlaylist, right: DemoPlaylist) =>
  right.updatedAt.localeCompare(left.updatedAt);

/** The demo viewer counts as a connection of every other demo member. */
const isVisible = (playlist: DemoPlaylist) =>
  playlist.isViewerOwner ||
  (playlist.visibility !== "private" && !hasBrokenCredit(playlist));

const creditPersonaOf = (playlist: DemoPlaylist) =>
  playlist.creditPersonaId
    ? (demoAllArtists().find(
        (artist) => artist.id === playlist.creditPersonaId,
      ) ?? null)
    : null;

/** A persona credit whose persona can no longer be resolved. The server
 *  keeps such a playlist private and shows the owner their own member
 *  credit; nobody else can open it. */
const hasBrokenCredit = (playlist: DemoPlaylist) =>
  playlist.creditPersonaId !== null && creditPersonaOf(playlist) === null;

function creditOf(playlist: DemoPlaylist): StudioPlaylistCreditDTO {
  const persona = creditPersonaOf(playlist);
  if (persona) return { persona, member: null };
  if (hasBrokenCredit(playlist))
    return { persona: null, member: DEMO_VIEWER_MEMBER };
  return { persona: null, member: playlist.creditMember ?? DEMO_VIEWER_MEMBER };
}

function toDto(playlist: DemoPlaylist): StudioPlaylistDTO {
  const isOwner = playlist.isViewerOwner;
  const tracksById = publishedTracks();
  const resolved = playlist.entries.map((entry) => ({
    entry,
    track: tracksById.get(entry.trackId) ?? null,
  }));
  const shown = isOwner ? resolved : resolved.filter((row) => row.track);
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
    visibility: isOwner
      ? hasBrokenCredit(playlist)
        ? "private"
        : playlist.visibility
      : null,
    description: playlist.description,
    entries,
    creditSubprofileId: isOwner ? playlist.creditPersonaId : null,
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
  };
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

function ownedOrThrow(playlistId: string): DemoPlaylist {
  const playlist = store.get(playlistId);
  if (!playlist || !playlist.isViewerOwner) throw notFound();
  return playlist;
}

function touch(playlist: DemoPlaylist): StudioPlaylistDTO {
  playlist.updatedAt = new Date().toISOString();
  return toDto(playlist);
}

export function demoMyPlaylistsPage(cursor: string | null) {
  return pageOf(
    allPlaylists().filter((playlist) => playlist.isViewerOwner),
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

/** Member-credited playlists: public ones, plus connections-only ones for a
 *  connection; the member's own page shows all of their own. */
export function demoMemberPlaylistsPage(
  memberSlug: string,
  cursor: string | null,
) {
  const isSelf = memberSlug === DEMO_VIEWER_MEMBER_SLUG;
  return pageOf(
    allPlaylists().filter(
      (playlist) =>
        playlist.creditPersonaId === null &&
        playlist.creditMemberSlug === memberSlug &&
        (isSelf || playlist.visibility !== "private"),
    ),
    cursor,
  );
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
    updatedAt: new Date().toISOString(),
  };
  store.set(playlist.id, playlist);
  return toDto(playlist);
}

export function demoUpdatePlaylist(
  playlistId: string,
  body: UpdateStudioPlaylistBody,
): StudioPlaylistDTO {
  const playlist = ownedOrThrow(playlistId);
  if (body.name !== undefined) playlist.name = checkName(body.name);
  if (body.description !== undefined)
    playlist.description = checkDescription(body.description);
  if (body.visibility !== undefined) playlist.visibility = body.visibility;
  if (body.creditSubprofileId !== undefined) {
    if (
      body.creditSubprofileId !== null &&
      !isDemoOwnedPersona(body.creditSubprofileId)
    )
      throw refused(422, "studio_playlist_credit_not_allowed");
    playlist.creditPersonaId = body.creditSubprofileId;
    playlist.creditMember = body.creditSubprofileId ? null : DEMO_VIEWER_MEMBER;
    playlist.creditMemberSlug = body.creditSubprofileId
      ? null
      : DEMO_VIEWER_MEMBER_SLUG;
  }
  return touch(playlist);
}

export function demoDeletePlaylist(playlistId: string): void {
  ownedOrThrow(playlistId);
  store.delete(playlistId);
}

export function demoAddPlaylistTracks(
  playlistId: string,
  trackIds: string[],
): StudioPlaylistDTO {
  const playlist = ownedOrThrow(playlistId);
  if (
    trackIds.length < 1 ||
    trackIds.length > STUDIO_PLAYLIST_LIMITS.tracksPerAdd
  )
    throw invalid("trackIds");
  const present = new Set(playlist.entries.map((entry) => entry.trackId));
  const fresh = [...new Set(trackIds)].filter(
    (trackId) => !present.has(trackId),
  );
  const tracksById = publishedTracks();
  if (fresh.some((trackId) => !tracksById.get(trackId)?.hasAudio))
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
    });
  return touch(playlist);
}

export function demoRemovePlaylistEntry(
  playlistId: string,
  entryId: string,
): void {
  const playlist = ownedOrThrow(playlistId);
  const index = playlist.entries.findIndex(
    (entry) => entry.entryId === entryId,
  );
  if (index < 0) throw notFound();
  playlist.entries.splice(index, 1);
  touch(playlist);
}

export function demoReorderPlaylist(
  playlistId: string,
  entryIds: string[],
): StudioPlaylistDTO {
  const playlist = ownedOrThrow(playlistId);
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
