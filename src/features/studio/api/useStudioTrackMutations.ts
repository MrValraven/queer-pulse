import {
  useMutation,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  confirmStudioTrackAudio,
  createStudioTrack,
  deleteStudioTrack,
  publishStudioTrack,
  updateStudioTrack,
} from "./studio.api";
import {
  toTrackView,
  type StudioOwnerTrackRowView,
  type StudioReleaseView,
  type StudioTrackView,
} from "./studio.adapters";
import type {
  StudioStreamAnalysis,
  UpdateStudioTrackBody,
} from "./studio.types";
import {
  demoConfirmAudio,
  demoCreateTrack,
  demoPublishEpisode,
  demoUpdateTrack,
  studioRefusal,
} from "./studioDemoMutations";
import { notesExcerpt } from "./studioEpisodes";
import { refreshReleaseLists } from "./useStudioReleaseMutations";
import { studioKeys } from "./studioQueryKeys";
import { forgetStreamAnalysis, rememberStreamAnalysis } from "./studioStream";

const SILENT = { silentError: true } as const;

/** What a track write changes on the owner row besides the row itself. */
type OwnerRowPatch = Partial<
  Pick<
    StudioOwnerTrackRowView,
    "hasAnalysis" | "loudnessLufs" | "peakDb" | "syncedLyrics" | "chapters"
  >
>;

/** Owner rows follow the rows: same order, same row fields, listening fields
 *  kept unless a patch for that track says otherwise. */
function syncOwnerTracks(
  release: StudioReleaseView,
  tracks: StudioReleaseView["tracks"],
  ownerPatch: { trackId: string; patch: OwnerRowPatch } | null,
): StudioOwnerTrackRowView[] | null {
  if (!release.ownerTracks) return null;
  const ownerById = new Map(
    release.ownerTracks.map((row) => [row.id, row] as const),
  );
  return tracks.map((row) => {
    const previous = ownerById.get(row.id);
    const base: StudioOwnerTrackRowView = {
      ...row,
      // Plan 3's X5: a rewrite of the cached rows keeps the owner fields.
      hasAnalysis: previous?.hasAnalysis ?? false,
      loudnessLufs: previous?.loudnessLufs ?? null,
      peakDb: previous?.peakDb ?? null,
      syncedLyrics: previous?.syncedLyrics ?? null,
      chapters: previous?.chapters ?? null,
    };
    return ownerPatch?.trackId === row.id
      ? { ...base, ...ownerPatch.patch }
      : base;
  });
}

/** Keep the cached release's track list in step with a track write, so the
 *  publish checks, the file list and the owner rows read one source. */
function patchReleaseTracks(
  queryClient: QueryClient,
  demoMode: boolean,
  releaseId: string,
  update: (tracks: StudioReleaseView["tracks"]) => StudioReleaseView["tracks"],
  /** A create, delete or audio confirm. On a published release it waits
   *  for a version note (Studio v3); a title or credit edit does not. */
  isTrackChange: boolean,
  ownerPatch: { trackId: string; patch: OwnerRowPatch } | null = null,
) {
  queryClient.setQueryData<StudioReleaseView>(
    studioKeys.release(demoMode, releaseId),
    (release) => {
      if (!release) return release;
      const tracks = update(release.tracks);
      // On a show the server counts published episodes only and stamps no
      // track change, so drafts stay out of the numbers and the flag.
      const countedTracks = release.isShow
        ? tracks.filter((track) => track.isDraft !== true)
        : tracks;
      return {
        ...release,
        tracks,
        ownerTracks: syncOwnerTracks(release, tracks, ownerPatch),
        trackCount: countedTracks.length,
        playableTrackCount: countedTracks.filter((track) => track.hasAudio)
          .length,
        totalDurationSeconds: countedTracks.reduce(
          (sum, track) =>
            sum + (track.hasAudio ? (track.durationSeconds ?? 0) : 0),
          0,
        ),
        hasUnnotedChanges:
          release.hasUnnotedChanges ||
          (isTrackChange && !release.isShow && release.status === "published"),
      };
    },
  );
  refreshReleaseLists(
    queryClient,
    demoMode,
    queryClient.getQueryData<StudioReleaseView>(
      studioKeys.release(demoMode, releaseId),
    ),
  );
}

const MEASUREMENT_FIELDS = ["waveformPeaks", "loudnessLufs", "peakDb"] as const;

/** A PATCH that sends only measurements (analysis or backfill). Its response
 *  may have been read before a details save committed, so only the
 *  measurements reach the cache and the rest of the cached track stays. */
function isMeasurementOnly(body: UpdateStudioTrackBody): boolean {
  const sentFields = Object.entries(body)
    .filter(([, value]) => value !== undefined)
    .map(([field]) => field);
  return (
    sentFields.length > 0 &&
    sentFields.every((field) =>
      (MEASUREMENT_FIELDS as readonly string[]).includes(field),
    )
  );
}

const keepRows = (tracks: StudioReleaseView["tracks"]) => tracks;

/** The analysis after a PATCH: the body's values over what the cache knew.
 *  Null when the PATCH sent no measurement. */
function analysisAfter(
  queryClient: QueryClient,
  demoMode: boolean,
  trackId: string,
  body: UpdateStudioTrackBody,
): StudioStreamAnalysis | null {
  if (MEASUREMENT_FIELDS.every((field) => body[field] === undefined))
    return null;
  const known = queryClient.getQueryData<StudioStreamAnalysis>(
    studioKeys.streamAnalysis(demoMode, trackId),
  );
  return {
    waveformPeaks:
      body.waveformPeaks === undefined
        ? (known?.waveformPeaks ?? null)
        : body.waveformPeaks,
    loudnessLufs:
      body.loudnessLufs === undefined
        ? (known?.loudnessLufs ?? null)
        : body.loudnessLufs,
    peakDb: body.peakDb === undefined ? (known?.peakDb ?? null) : body.peakDb,
  };
}

/** The track detail to cache after a PATCH: lyrics and chapters the body
 *  left out keep the cached detail's values. */
function detailAfter(
  queryClient: QueryClient,
  demoMode: boolean,
  track: StudioTrackView,
  body: UpdateStudioTrackBody,
): StudioTrackView {
  const previous = queryClient.getQueryData<StudioTrackView>(
    studioKeys.track(demoMode, track.id),
  );
  if (!previous) return track;
  return {
    ...track,
    syncedLyrics:
      body.syncedLyrics === undefined
        ? previous.syncedLyrics
        : track.syncedLyrics,
    chapters: body.chapters === undefined ? previous.chapters : track.chapters,
  };
}

const upsert =
  (track: StudioTrackView) => (tracks: StudioReleaseView["tracks"]) => {
    const row = {
      id: track.id,
      position: track.position,
      title: track.title,
      durationSeconds: track.durationSeconds,
      durationLabel: track.durationLabel,
      isExplicit: track.isExplicit,
      hasAudio: track.hasAudio,
      href: track.href,
      savedId: track.savedId,
      publishedAt: track.publishedAt,
      isDraft: track.isDraft,
      notesExcerpt: notesExcerpt(track.notes),
    };
    const exists = tracks.some((candidate) => candidate.id === track.id);
    return exists
      ? tracks.map((candidate) => (candidate.id === track.id ? row : candidate))
      : [...tracks, row];
  };

function cachedTrack(
  queryClient: QueryClient,
  demoMode: boolean,
  trackId: string,
  releaseId: string,
): StudioTrackView {
  const cached = queryClient.getQueryData<StudioTrackView>(
    studioKeys.track(demoMode, trackId),
  );
  if (cached) return cached;
  const release = queryClient.getQueryData<StudioReleaseView>(
    studioKeys.release(demoMode, releaseId),
  );
  const row = release?.tracks.find((candidate) => candidate.id === trackId);
  if (!row) throw new Error(`Studio track ${trackId} is not loaded`);
  // The owner row holds the stored lyrics and chapters; the fallback carries
  // them so a write that leaves them out keeps them.
  const ownerRow = release?.ownerTracks?.find(
    (candidate) => candidate.id === trackId,
  );
  return {
    ...demoCreateTrack(releaseId, row.title, row.position),
    ...row,
    syncedLyrics: ownerRow?.syncedLyrics ?? null,
    chapters: ownerRow?.chapters ?? null,
  };
}

export function useCreateStudioTrack() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<
    StudioTrackView,
    Error,
    { releaseId: string; title: string }
  >({
    meta: SILENT,
    mutationFn: async ({ releaseId, title }) => {
      if (!demoMode)
        return toTrackView(await createStudioTrack(releaseId, { title }));
      const release = queryClient.getQueryData<StudioReleaseView>(
        studioKeys.release(demoMode, releaseId),
      );
      return demoCreateTrack(
        releaseId,
        title,
        (release?.tracks.length ?? 0) + 1,
        release,
      );
    },
    onSuccess: (track) => {
      queryClient.setQueryData(studioKeys.track(demoMode, track.id), track);
      patchReleaseTracks(
        queryClient,
        demoMode,
        track.releaseId,
        upsert(track),
        true,
      );
    },
  });
}

export function useUpdateStudioTrack() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<
    StudioTrackView,
    Error,
    { trackId: string; releaseId: string; body: UpdateStudioTrackBody }
  >({
    meta: SILENT,
    mutationFn: async ({ trackId, releaseId, body }) =>
      demoMode
        ? demoUpdateTrack(
            cachedTrack(queryClient, demoMode, trackId, releaseId),
            body,
          )
        : toTrackView(await updateStudioTrack(trackId, body)),
    onSuccess: (track, { body }) => {
      // The detail holds no measurements (they live in the stream analysis),
      // so a measurement-only PATCH leaves it as cached.
      const isMeasurementPatch = isMeasurementOnly(body);
      if (!isMeasurementPatch)
        queryClient.setQueryData(
          studioKeys.track(demoMode, track.id),
          detailAfter(queryClient, demoMode, track, body),
        );
      const analysis = analysisAfter(queryClient, demoMode, track.id, body);
      if (analysis)
        rememberStreamAnalysis(queryClient, demoMode, track.id, analysis);
      // Lyrics and chapters change on the owner row only when the PATCH
      // sent them.
      const patch: OwnerRowPatch = {};
      if (body.syncedLyrics !== undefined)
        patch.syncedLyrics = track.syncedLyrics;
      if (body.chapters !== undefined) patch.chapters = track.chapters;
      if (analysis) {
        patch.hasAnalysis =
          analysis.waveformPeaks !== null &&
          analysis.loudnessLufs !== null &&
          analysis.peakDb !== null;
        patch.loudnessLufs = analysis.loudnessLufs;
        patch.peakDb = analysis.peakDb;
      }
      patchReleaseTracks(
        queryClient,
        demoMode,
        track.releaseId,
        isMeasurementPatch ? keepRows : upsert(track),
        false,
        { trackId: track.id, patch },
      );
    },
  });
}

export function useDeleteStudioTrack() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, { trackId: string; releaseId: string }>({
    meta: SILENT,
    mutationFn: async ({ trackId, releaseId }) => {
      if (!demoMode) {
        await deleteStudioTrack(trackId);
        return;
      }
      // The server refuses to remove the last playable track of a live or
      // scheduled release.
      const release = queryClient.getQueryData<StudioReleaseView>(
        studioKeys.release(true, releaseId),
      );
      const isLive =
        release?.status === "published" || release?.status === "scheduled";
      const target = release?.tracks.find((track) => track.id === trackId);
      const hasOtherPlayable = release?.tracks.some(
        (track) => track.id !== trackId && track.hasAudio,
      );
      if (isLive && target?.hasAudio && !hasOtherPlayable)
        throw studioRefusal(409, "studio_release_needs_playable_track");
    },
    onSuccess: (_result, { trackId, releaseId }) => {
      queryClient.removeQueries({
        queryKey: studioKeys.track(demoMode, trackId),
      });
      patchReleaseTracks(
        queryClient,
        demoMode,
        releaseId,
        (tracks) =>
          tracks
            .filter((track) => track.id !== trackId)
            .map((track, index) => ({ ...track, position: index + 1 })),
        true,
      );
    },
  });
}

export function useConfirmStudioTrackAudio() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<
    StudioTrackView,
    Error,
    { trackId: string; releaseId: string; key: string }
  >({
    meta: SILENT,
    mutationFn: async ({ trackId, releaseId, key }) =>
      demoMode
        ? demoConfirmAudio(
            cachedTrack(queryClient, demoMode, trackId, releaseId),
            key,
          )
        : toTrackView(await confirmStudioTrackAudio(trackId, key)),
    onSuccess: (track) => {
      queryClient.setQueryData(studioKeys.track(demoMode, track.id), track);
      // New audio clears the measurements server-side; the old peaks and
      // loudness must not reach the scrubber or the editor.
      forgetStreamAnalysis(queryClient, demoMode, track.id);
      patchReleaseTracks(
        queryClient,
        demoMode,
        track.releaseId,
        upsert(track),
        true,
        {
          trackId: track.id,
          patch: {
            hasAnalysis: false,
            loudnessLufs: null,
            peakDb: null,
            syncedLyrics: track.syncedLyrics,
            chapters: track.chapters,
          },
        },
      );
    },
  });
}

/** Artist kinds: publishes one draft episode of a live show (spec 4.1).
 *  The show's cached rows, its lists and the New episodes shelf follow. */
export function usePublishStudioEpisode() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<
    StudioTrackView,
    Error,
    { trackId: string; releaseId: string }
  >({
    meta: SILENT,
    mutationFn: async ({ trackId, releaseId }) =>
      demoMode
        ? demoPublishEpisode(
            cachedTrack(queryClient, demoMode, trackId, releaseId),
          )
        : toTrackView(await publishStudioTrack(trackId)),
    onSuccess: (track) => {
      queryClient.setQueryData(studioKeys.track(demoMode, track.id), track);
      patchReleaseTracks(
        queryClient,
        demoMode,
        track.releaseId,
        upsert(track),
        false,
      );
      void queryClient.invalidateQueries({
        queryKey: studioKeys.latestEpisodes(demoMode),
      });
    },
  });
}
