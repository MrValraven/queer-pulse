import type { QueryClient } from "@tanstack/react-query";
import { studioErrorCodeOf } from "./studio.api";
import type {
  StudioFormat,
  StudioGenre,
  StudioMood,
  StudioSearchType,
} from "./studio.types";

/** Every Studio query key starts with "studio" so one invalidation reaches
 *  them all, and carries `demoMode` so the two modes never share a cache. */
export const studioKeys = {
  all: ["studio"] as const,
  /** Every member's and both modes' access query. */
  meAll: ["studio", "me"] as const,
  me: (demoMode: boolean, userId: string | null) =>
    ["studio", "me", demoMode, userId] as const,
  releases: (demoMode: boolean) => ["studio", "releases", demoMode] as const,
  release: (demoMode: boolean, releaseId: string) =>
    ["studio", "release", demoMode, releaseId] as const,
  track: (demoMode: boolean, trackId: string) =>
    ["studio", "track", demoMode, trackId] as const,
  /** A track's stream analysis (peaks, loudness, peak) as the player last
   *  read it. Holds no URL. */
  streamAnalysis: (demoMode: boolean, trackId: string) =>
    ["studio", "streamAnalysis", demoMode, trackId] as const,
  artist: (demoMode: boolean, subprofileId: string) =>
    ["studio", "artist", demoMode, subprofileId] as const,
  search: (
    demoMode: boolean,
    query: string,
    type: StudioSearchType,
    genre: StudioGenre | null,
    mood: StudioMood | null = null,
    format: StudioFormat | null = null,
  ) =>
    [
      "studio",
      "search",
      demoMode,
      query,
      type,
      genre ?? "any",
      mood ?? "any",
      format ?? "any",
    ] as const,
  // Studio v2. `browse` sits outside "releases" on purpose: the demo patches
  // the home grid under that key, and a genre list must not receive a card
  // of another genre.
  genres: (demoMode: boolean) => ["studio", "genres", demoMode] as const,
  browse: (
    demoMode: boolean,
    genre: StudioGenre | null,
    mood: StudioMood | null = null,
    format: StudioFormat | null = null,
  ) =>
    [
      "studio",
      "browse",
      demoMode,
      genre ?? "none",
      mood ?? "none",
      format ?? "none",
    ] as const,
  myPlaylists: (demoMode: boolean) =>
    ["studio", "playlists", "mine", demoMode] as const,
  playlist: (demoMode: boolean, playlistId: string) =>
    ["studio", "playlist", demoMode, playlistId] as const,
  memberPlaylists: (demoMode: boolean, memberSlug: string) =>
    ["studio", "memberPlaylists", demoMode, memberSlug] as const,
  trackPlaylists: (demoMode: boolean, trackId: string) =>
    ["studio", "trackPlaylists", demoMode, trackId] as const,
  /** Collaborative playlists: who edits one playlist, and the persona
   *  co-owners its owner can pick, per search. */
  playlistEditors: (demoMode: boolean, playlistId: string) =>
    ["studio", "playlistEditors", demoMode, playlistId] as const,
  playlistEditorCandidatesAll: (demoMode: boolean, playlistId: string) =>
    ["studio", "playlistEditorCandidates", demoMode, playlistId] as const,
  playlistEditorCandidates: (
    demoMode: boolean,
    playlistId: string,
    searchQuery: string,
  ) =>
    [
      "studio",
      "playlistEditorCandidates",
      demoMode,
      playlistId,
      searchQuery,
    ] as const,
  /** Liked songs, the member's `studio_track` saves. The demo appends the
   *  saved ids, so a like or an unlike reads the list again. */
  likedTracks: (demoMode: boolean) =>
    ["studio", "likedTracks", demoMode] as const,
  stats: (demoMode: boolean, subprofileId: string) =>
    ["studio", "stats", demoMode, subprofileId] as const,
  followedArtists: (demoMode: boolean) =>
    ["studio", "followedArtists", demoMode] as const,
  // Studio open pages. Player settings are one row per member; the three
  // staff review queues are separate lists so a decision patches one of them
  // and re-reads the others.
  playback: (demoMode: boolean) => ["studio", "playback", demoMode] as const,
  reviewReports: (demoMode: boolean) =>
    ["studio", "review", "reports", demoMode] as const,
  reviewDisputes: (demoMode: boolean) =>
    ["studio", "review", "disputes", demoMode] as const,
  reviewWithdrawn: (demoMode: boolean) =>
    ["studio", "review", "withdrawn", demoMode] as const,
  // Studio discovery.
  moods: (demoMode: boolean) => ["studio", "moods", demoMode] as const,
  curation: (demoMode: boolean) => ["studio", "curation", demoMode] as const,
  scenes: (demoMode: boolean) => ["studio", "scenes", demoMode] as const,
  scene: (demoMode: boolean, slug: string) =>
    ["studio", "scene", demoMode, slug] as const,
  sceneReleases: (demoMode: boolean, slug: string) =>
    ["studio", "sceneReleases", demoMode, slug] as const,
  personaCredits: (demoMode: boolean, trackId: string) =>
    ["studio", "personaCredits", demoMode, trackId] as const,
  creditCandidate: (demoMode: boolean, handle: string) =>
    ["studio", "creditCandidate", demoMode, handle] as const,
  creditInbox: (demoMode: boolean) =>
    ["studio", "creditInbox", demoMode] as const,
  creditPendingCount: (demoMode: boolean) =>
    ["studio", "creditPendingCount", demoMode] as const,
  appearsOn: (demoMode: boolean, subprofileId: string) =>
    ["studio", "appearsOn", demoMode, subprofileId] as const,
  /** Every persona's Appears on in one mode: a credit write refreshes them
   *  all, since the remover does not know which persona page is cached. */
  appearsOnAll: (demoMode: boolean) =>
    ["studio", "appearsOn", demoMode] as const,
  relatedArtists: (demoMode: boolean, subprofileId: string) =>
    ["studio", "relatedArtists", demoMode, subprofileId] as const,
  // Studio artist kinds. `formatReleases` sits outside "releases" for the
  // reason `browse` does: the demo patches the home grid under that key.
  formats: (demoMode: boolean) => ["studio", "formats", demoMode] as const,
  formatReleases: (demoMode: boolean, format: StudioFormat) =>
    ["studio", "formatReleases", demoMode, format] as const,
  latestEpisodes: (demoMode: boolean) =>
    ["studio", "latestEpisodes", demoMode] as const,
  // Studio v3. A preview is keyed by its token alone: the page holds no
  // release id until the answer arrives.
  studioPreview: (demoMode: boolean, token: string) =>
    ["studio", "studioPreview", demoMode, token] as const,
  // "studioPressKit", apart from the org-level press kit (`usePressKit`,
  // `/about/press-kit`) that exists elsewhere in the app.
  studioPressKit: (demoMode: boolean, subprofileId: string) =>
    ["studio", "studioPressKit", demoMode, subprofileId] as const,
};

/** A Studio request refused with `studio_access_required` means the grant was
 *  withdrawn since GET /studio/me answered. Reading it again flips the gate to
 *  the teaser, and the player stops on the same signal. */
export function onStudioAccessLost(
  queryClient: QueryClient,
  error: unknown,
): void {
  if (studioErrorCodeOf(error) !== "studio_access_required") return;
  void queryClient.invalidateQueries({ queryKey: studioKeys.meAll });
}

/** Runs one Studio read, reporting a withdrawn grant before it rethrows. */
export async function readStudio<Result>(
  queryClient: QueryClient,
  read: () => Promise<Result>,
): Promise<Result> {
  try {
    return await read();
  } catch (error) {
    onStudioAccessLost(queryClient, error);
    throw error;
  }
}
