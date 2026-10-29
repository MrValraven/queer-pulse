import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { toReleaseView } from "../features/studio/api/studio.adapters";
import type {
  StudioReleaseDTO,
  StudioTrackDTO,
} from "../features/studio/api/studio.types";
import { studioKeys } from "../features/studio/api/studioQueryKeys";
import { StudioPlayerProvider } from "../features/studio/player/StudioPlayerProvider";
import {
  useStudioPlayer,
  useStudioPlayerClock,
  type StudioPlayerValue,
} from "../features/studio/player/studioPlayerContext";
import { useStudioPlayerSurface } from "../features/studio/player/studioPlayerSurface";
import { createFakeAudioEngine } from "./studioFakeAudioEngine";

export const ME_KEY = studioKeys.me(false, "user-1");

const ARTIST = {
  id: "p1",
  handle: "nightform",
  name: "NIGHTFORM",
  kind: "musician" as const,
  avatarUrl: null,
};

/** A published release; every track lasts 200 seconds unless it is silent. */
export function releaseFixture(
  id: string,
  trackIds: string[],
  silentTrackIds: string[] = [],
  explicitTrackIds: string[] = [],
): StudioReleaseDTO {
  return {
    id,
    title: `Release ${id}`,
    type: "ep",
    coverUrl: null,
    releasedOn: "2026-04-12",
    trackCount: trackIds.length,
    totalDurationSeconds: 200 * trackIds.length,
    artist: ARTIST,
    description: null,
    genre: null,
    genres: [],
    mood: null,
    scene: null,
    status: "published",
    publishedAt: null,
    tracks: trackIds.map((trackId, index) => {
      const isSilent = silentTrackIds.includes(trackId);
      return {
        id: trackId,
        position: index + 1,
        title: trackId,
        durationSeconds: isSilent ? null : 200,
        isExplicit: explicitTrackIds.includes(trackId),
        hasAudio: !isSilent,
      };
    }),
    isOwner: false,
    rightsConfirmedAt: null,
    takedownReason: null,
    sceneId: null,
    personaCredits: [],
  };
}

export function trackDetailFixture(
  release: StudioReleaseDTO,
  trackId: string,
  extra: Partial<StudioTrackDTO> = {},
): StudioTrackDTO {
  const summary = release.tracks.find((track) => track.id === trackId);
  if (!summary) throw new Error(`No track ${trackId} in ${release.id}`);
  return {
    ...summary,
    releaseId: release.id,
    credits: [],
    lyrics: null,
    syncedLyrics: null,
    chapters: null,
    release: {
      id: release.id,
      title: release.title,
      type: release.type,
      coverUrl: release.coverUrl,
      releasedOn: release.releasedOn,
      trackCount: release.trackCount,
      totalDurationSeconds: release.totalDurationSeconds,
      artist: release.artist,
      publishedAt: release.publishedAt,
      genre: release.genre,
      genres: release.genres,
      mood: release.mood,
      scene: release.scene,
    },
    personaCredits: [],
    ...extra,
  };
}

export function renderPlayer(releases: StudioReleaseDTO[]) {
  const engine = createFakeAudioEngine();
  // One factory for the whole test, so a rerender never rebuilds the engine.
  const engineFactory = () => engine;
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  for (const release of releases)
    queryClient.setQueryData(
      studioKeys.release(false, release.id),
      toReleaseView(release),
    );
  queryClient.setQueryData(ME_KEY, { hasAccess: true, uploadablePersonas: [] });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <StudioPlayerProvider engineFactory={engineFactory}>
        {children}
      </StudioPlayerProvider>
    </QueryClientProvider>
  );
  // Every status the player rendered, so a test can prove one never showed.
  const statuses: string[] = [];
  const hook = renderHook(
    () => {
      const player = useStudioPlayer();
      statuses.push(player.status);
      return {
        player,
        clock: useStudioPlayerClock(),
        surface: useStudioPlayerSurface(),
      };
    },
    { wrapper },
  );
  return { engine, hook, statuses, queryClient };
}

/** The current track, then the rest of the source, in play order. */
export function playOrder(player: StudioPlayerValue): string[] {
  return [player.queue.current, ...player.queue.upcomingSourceItems].flatMap(
    (entry) => (entry ? [entry.trackId] : []),
  );
}
