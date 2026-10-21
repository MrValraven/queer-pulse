import {
  keepPreviousData,
  useQuery,
  type QueryClient,
} from "@tanstack/react-query";
import { useMemo } from "react";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { apiGet } from "../../shared/api/client";
import {
  toTrackView,
  type StudioLatestEpisodeView,
  type StudioTrackView,
} from "./api/studio.adapters";
import type { StudioTrackDTO } from "./api/studio.types";
import { readStudio, studioKeys } from "./api/studioQueryKeys";
import { studioTrackQueryOptions } from "./api/studioTrackQuery";
import { useStudioAccess } from "./api/useStudioAccess";
import { useStudioHideExplicit } from "./api/useStudioPlaybackPreferences";
import type { StudioEpisodeMemory } from "./player/studioEpisodeMemory";
import { useStudioEpisodeMemory } from "./player/useStudioEpisodeMemory";

/** Episodes the shelf holds at most, newest listen first. */
const CONTINUE_LISTENING_LIMIT = 10;
/** Places read, a few past the limit, so the ones that drop out (gone,
 *  withheld, hidden as explicit) still leave a full shelf. */
const CONTINUE_LISTENING_READ_LIMIT = 15;
/** A place this early reads as a sample; the shelf starts past it. */
const MIN_POSITION_SECONDS = 30;
/** A place this close to the end reads as finished. */
const END_MARGIN_SECONDS = 15;
const CONTINUE_LISTENING_STALE_MS = 60_000;

export interface StudioContinueListeningEntry {
  episode: StudioLatestEpisodeView;
  positionSeconds: number;
}

interface StudioSavedPlace {
  trackId: string;
  positionSeconds: number;
}

/** Unfinished episodes with a saved place, most recently heard first. */
function savedPlacesOf(memory: StudioEpisodeMemory): StudioSavedPlace[] {
  return Object.entries(memory)
    .filter(
      ([, entry]) =>
        entry.playedAt === undefined &&
        (entry.positionSeconds ?? 0) >= MIN_POSITION_SECONDS,
    )
    .sort(([, first], [, second]) =>
      second.touchedAt.localeCompare(first.touchedAt),
    )
    .slice(0, CONTINUE_LISTENING_READ_LIMIT)
    .map(([trackId, entry]) => ({
      trackId,
      positionSeconds: entry.positionSeconds ?? 0,
    }));
}

/** GET /studio/tracks?ids=: up to 20 tracks, each read as the single track
 *  read reads it; one the viewer cannot hear is left out. */
const getStudioTracks = (trackIds: readonly string[]) =>
  apiGet<{ items: StudioTrackDTO[] }>(
    `/studio/tracks?ids=${trackIds.map(encodeURIComponent).join(",")}`,
  );

/** Demo: the per-track read, one per episode. A gone episode just drops
 *  off the shelf: no error toast. */
async function readDemoTracks(
  client: QueryClient,
  trackIds: readonly string[],
): Promise<StudioTrackView[]> {
  const settled = await Promise.allSettled(
    trackIds.map((trackId) =>
      client.fetchQuery({
        ...studioTrackQueryOptions(true, trackId),
        meta: { silentError: true },
      }),
    ),
  );
  return settled.flatMap((result) =>
    result.status === "fulfilled" ? [result.value] : [],
  );
}

/** A per-track cache entry fresh enough to stand in for a read: not
 *  invalidated, and written within the shelf's own stale window. */
function freshCachedTrack(
  client: QueryClient,
  trackId: string,
): StudioTrackView | undefined {
  const state = client.getQueryState<StudioTrackView>(
    studioKeys.track(false, trackId),
  );
  if (!state?.data || state.isInvalidated) return undefined;
  const ageMs = Date.now() - state.dataUpdatedAt;
  return ageMs < CONTINUE_LISTENING_STALE_MS ? state.data : undefined;
}

/** Live: episodes fresh in the per-track cache cost nothing, and the rest
 *  arrive in one batch read that seeds each track's own cache entry. */
async function readLiveTracks(
  client: QueryClient,
  trackIds: readonly string[],
): Promise<StudioTrackView[]> {
  const cachedTracks: StudioTrackView[] = [];
  const missingIds: string[] = [];
  for (const trackId of trackIds) {
    const cached = freshCachedTrack(client, trackId);
    if (cached) cachedTracks.push(cached);
    else missingIds.push(trackId);
  }
  if (missingIds.length === 0) return cachedTracks;
  const batch = await readStudio(client, () => getStudioTracks(missingIds));
  const fetchedTracks = batch.items.map(toTrackView);
  for (const track of fetchedTracks) {
    client.setQueryData(studioKeys.track(false, track.id), track);
  }
  return [...cachedTracks, ...fetchedTracks];
}

function isResumable(
  track: StudioTrackView,
  positionSeconds: number,
  shouldHideExplicit: boolean,
) {
  if (!track.release.isShow || track.isWithheld || !track.hasAudio)
    return false;
  if (shouldHideExplicit && track.isExplicit) return false;
  const duration = track.durationSeconds;
  return duration === null || positionSeconds < duration - END_MARGIN_SECONDS;
}

/**
 * Continue listening on Studio home (PRD-03): podcast episodes the member
 * left part way, from the device-only episode memory, which nothing sends
 * anywhere. Their details arrive in one read: live, one GET /studio/tracks
 * batch for the episodes the per-track cache does not hold yet, which then
 * seeds that cache (an episode already opened costs nothing). The query
 * key holds the sorted ids, so the position saves during playback never
 * read again; the places shown come live from the memory. An episode that
 * is gone, withheld, no longer listenable or hidden by "Hide explicit
 * tracks" drops out quietly.
 */
export function useStudioContinueListening(): {
  entries: StudioContinueListeningEntry[];
} {
  const { demoMode } = useDemoMode();
  const { hasAccess } = useStudioAccess();
  const { memory } = useStudioEpisodeMemory();
  const shouldHideExplicit = useStudioHideExplicit();
  const places = useMemo(() => savedPlacesOf(memory), [memory]);
  const trackIds = useMemo(
    () => places.map((place) => place.trackId).sort(),
    [places],
  );
  const query = useQuery({
    queryKey: ["studio", "continueListening", demoMode, ...trackIds],
    enabled: trackIds.length > 0 && (demoMode || hasAccess),
    staleTime: demoMode
      ? Number.POSITIVE_INFINITY
      : CONTINUE_LISTENING_STALE_MS,
    placeholderData: keepPreviousData,
    meta: { silentError: true },
    queryFn: ({ client }) =>
      demoMode
        ? readDemoTracks(client, trackIds)
        : readLiveTracks(client, trackIds),
  });
  const entries = useMemo(() => {
    if (trackIds.length === 0) return [];
    const trackById = new Map(
      (query.data ?? []).map((track) => [track.id, track]),
    );
    return places
      .flatMap((place) => {
        const track = trackById.get(place.trackId);
        if (
          !track ||
          !isResumable(track, place.positionSeconds, shouldHideExplicit)
        )
          return [];
        return [
          {
            episode: { track, release: track.release },
            positionSeconds: place.positionSeconds,
          },
        ];
      })
      .slice(0, CONTINUE_LISTENING_LIMIT);
  }, [places, query.data, trackIds.length, shouldHideExplicit]);
  return { entries };
}
