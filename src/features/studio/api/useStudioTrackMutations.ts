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
  updateStudioTrack,
} from "./studio.api";
import {
  toTrackView,
  type StudioReleaseView,
  type StudioTrackView,
} from "./studio.adapters";
import type { UpdateStudioTrackBody } from "./studio.types";
import {
  demoConfirmAudio,
  demoCreateTrack,
  demoUpdateTrack,
} from "./studioDemoMutations";
import { refreshReleaseLists } from "./useStudioReleaseMutations";
import { studioKeys } from "./studioQueryKeys";

const SILENT = { silentError: true } as const;

/** Keep the cached release's track list in step with a track write, so the
 *  publish checks and the file list read one source. */
function patchReleaseTracks(
  queryClient: QueryClient,
  demoMode: boolean,
  releaseId: string,
  update: (tracks: StudioReleaseView["tracks"]) => StudioReleaseView["tracks"],
) {
  queryClient.setQueryData<StudioReleaseView>(
    studioKeys.release(demoMode, releaseId),
    (release) => {
      if (!release) return release;
      const tracks = update(release.tracks);
      return {
        ...release,
        tracks,
        trackCount: tracks.length,
        playableTrackCount: tracks.filter((track) => track.hasAudio).length,
        totalDurationSeconds: tracks.reduce(
          (sum, track) =>
            sum + (track.hasAudio ? (track.durationSeconds ?? 0) : 0),
          0,
        ),
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
  return { ...demoCreateTrack(releaseId, row.title, row.position), ...row };
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
      );
    },
    onSuccess: (track) => {
      queryClient.setQueryData(studioKeys.track(demoMode, track.id), track);
      patchReleaseTracks(queryClient, demoMode, track.releaseId, upsert(track));
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
    onSuccess: (track) => {
      queryClient.setQueryData(studioKeys.track(demoMode, track.id), track);
      patchReleaseTracks(queryClient, demoMode, track.releaseId, upsert(track));
    },
  });
}

export function useDeleteStudioTrack() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, { trackId: string; releaseId: string }>({
    meta: SILENT,
    mutationFn: async ({ trackId }) => {
      if (!demoMode) await deleteStudioTrack(trackId);
    },
    onSuccess: (_result, { trackId, releaseId }) => {
      queryClient.removeQueries({
        queryKey: studioKeys.track(demoMode, trackId),
      });
      patchReleaseTracks(queryClient, demoMode, releaseId, (tracks) =>
        tracks
          .filter((track) => track.id !== trackId)
          .map((track, index) => ({ ...track, position: index + 1 })),
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
      patchReleaseTracks(queryClient, demoMode, track.releaseId, upsert(track));
    },
  });
}
