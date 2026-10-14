import type { QueryClient } from "@tanstack/react-query";
import type { RefObject } from "react";
import type { StudioReleaseView } from "../api/studio.adapters";
import { studioReleaseQueryOptions } from "../api/useStudioRelease";
import { markExplicitStart } from "./studioEpisodePlay";
import { STREAM_EXPIRY_MARGIN_MS } from "./studioHandover";
import type { PlaybackCommands, PlaybackRefs } from "./studioPlaybackCommands";
import type {
  StudioPlaybackSettings,
  StudioPlayerActions,
  StudioQueueSource,
  StudioQueueTrack,
} from "./studioPlayerContext";
import { queueFromRelease, startIndexFor, toQueueItems } from "./studioQueue";
import {
  hasPreviousItem,
  type StudioQueueAction,
  type StudioQueueState,
} from "./studioQueueReducer";

export interface PlayerActionDependencies {
  refs: PlaybackRefs;
  playRequestRef: RefObject<number>;
  shouldStopRef: RefObject<boolean>;
  dispatch: (action: StudioQueueAction) => StudioQueueState;
  commands: () => PlaybackCommands;
  readPlaybackSettings: () => StudioPlaybackSettings;
  demoMode: boolean;
  queryClient: QueryClient;
  /** Removes this member's saved queue (stop, an emptied queue). */
  clearSavedQueue: () => void;
}

/** Previous restarts the track when more than this much has played. */
const RESTART_THRESHOLD_SECONDS = 3;
const RELEASE_STALE_MS = 60_000;
const TRACKS_SOURCE: StudioQueueSource = {
  kind: "tracks",
  label: "",
  href: null,
};

/** A fresh seed per shuffle, made in the browser and sent nowhere. */
export const randomShuffleSeed = () => Math.floor(Math.random() * 2 ** 32);

function sourceForReleases(
  releases: StudioReleaseView[],
  requestedCount: number,
): StudioQueueSource {
  const [first] = releases;
  if (requestedCount === 1 && first)
    return { kind: "release", label: first.title, href: first.href };
  return {
    kind: "artist",
    label: first?.artist.name ?? "",
    href: first?.artist.href ?? null,
  };
}

export type StudioTransportActions = Pick<
  StudioPlayerActions,
  | "playRelease"
  | "playReleases"
  | "playTracks"
  | "togglePlay"
  | "next"
  | "previous"
  | "seek"
  | "retry"
  | "stop"
>;

/** Starting a queue: the explicit filter, the reducer's playSource and the
 *  first load. */
function createSourceStarter(deps: PlayerActionDependencies) {
  const { refs, dispatch, commands } = deps;

  function startSource(
    source: StudioQueueSource,
    tracks: StudioQueueTrack[],
    startTrackId: string | undefined,
    /** Left out for a plain Play: it starts at 0 and an episode resumes. */
    startAtSeconds: number | undefined,
  ): Promise<void> {
    // Hide explicit (contract F.2): a new queue leaves explicit tracks out,
    // so a radio's pool holds none either.
    const visible = deps.readPlaybackSettings().hideExplicit
      ? tracks.filter((track) => !track.isExplicit)
      : tracks;
    const items = toQueueItems(visible);
    if (items.length === 0) return Promise.resolve();
    refs.intentTokenRef.current += 1;
    const startIndex = startIndexFor(items, startTrackId);
    // A named start (0:00 included) wins over an episode's saved place. Set
    // before the dispatch, so the tracker sees it on the entry's first render.
    markExplicitStart(
      startAtSeconds === undefined
        ? null
        : (items[startIndex]?.queueEntryId ?? null),
    );
    const state = dispatch({
      type: "playSource",
      source,
      items,
      startIndex,
      shuffleSeed: randomShuffleSeed(),
    });
    if (!state.current) return Promise.resolve();
    refs.refreshCountRef.current = 0;
    return commands().loadEntry(state.current, startAtSeconds ?? 0);
  }

  async function playQueue(
    releaseIds: string[],
    startTrackId?: string,
    startAtSeconds?: number,
  ) {
    // A stop, a sign-out, a skip or a newer Play while the releases load
    // wins. The current track keeps its events meanwhile.
    deps.playRequestRef.current += 1;
    const request = deps.playRequestRef.current;
    const intentAtStart = refs.intentTokenRef.current;
    // A release that cannot be read (taken down since the page loaded) is
    // skipped. When none can, the page that offered Play shows its own error.
    const results = await Promise.allSettled(
      releaseIds.map((releaseId) => {
        const options = studioReleaseQueryOptions(deps.demoMode, releaseId);
        return deps.queryClient.fetchQuery({
          ...options,
          staleTime: options.staleTime ?? RELEASE_STALE_MS,
        });
      }),
    );
    const releases = results.flatMap((result) =>
      result.status === "fulfilled" ? [result.value] : [],
    );
    // Artist kinds: a show queues the episode Play named, so an older
    // episode or a chapter on its page starts that episode.
    const tracks = releases.flatMap((release) =>
      queueFromRelease(release, undefined, startTrackId),
    );
    const isSuperseded =
      request !== deps.playRequestRef.current ||
      intentAtStart !== refs.intentTokenRef.current ||
      deps.shouldStopRef.current;
    if (isSuperseded || tracks.length === 0) return;
    await startSource(
      sourceForReleases(releases, releaseIds.length),
      tracks,
      startTrackId,
      startAtSeconds,
    );
  }

  async function playTracks(
    tracks: StudioQueueTrack[],
    startTrackId: string | undefined,
    source: StudioQueueSource | undefined,
    startAtSeconds: number | undefined,
  ) {
    // A newer Play wins over a release queue still loading.
    deps.playRequestRef.current += 1;
    if (deps.shouldStopRef.current || tracks.length === 0) return;
    await startSource(
      source ?? TRACKS_SOURCE,
      tracks,
      startTrackId,
      startAtSeconds,
    );
  }

  return { playQueue, playTracks };
}

export function createTransportActions(
  deps: PlayerActionDependencies,
): StudioTransportActions {
  const { refs, dispatch, commands } = deps;
  // Called synchronously inside the member's click, before any await
  // (autoplay rules): the later play() then starts on an unlocked context.
  const unlock = () => refs.engineRef.current?.unlock();
  const starter = createSourceStarter(deps);

  return {
    playRelease: (releaseId, startTrackId, startAtSeconds) => {
      unlock();
      return starter.playQueue([releaseId], startTrackId, startAtSeconds);
    },
    playReleases: (releaseIds) => {
      unlock();
      return starter.playQueue(releaseIds);
    },
    playTracks: (tracks, startTrackId, source, startAtSeconds) => {
      unlock();
      return starter.playTracks(tracks, startTrackId, source, startAtSeconds);
    },
    togglePlay: () => {
      const engine = refs.engineRef.current;
      if (!engine || refs.queueRef.current.current === null) return;
      unlock();
      const status = refs.statusRef.current;
      // The track is already on its way; a second press waits for it.
      if (status === "loading") return;
      if (status === "playing") engine.pause();
      else if (status === "error") commands().retry();
      else if (Date.now() > refs.expiresAtRef.current - STREAM_EXPIRY_MARGIN_MS)
        commands().reloadCurrent();
      else void engine.play();
    },
    next: () => {
      if (refs.queueRef.current.current === null) return;
      unlock();
      refs.intentTokenRef.current += 1;
      refs.refreshCountRef.current = 0;
      commands().advance(true);
    },
    previous: () => {
      const queue = refs.queueRef.current;
      if (queue.current === null) return;
      unlock();
      refs.intentTokenRef.current += 1;
      const { hideExplicit } = deps.readPlaybackSettings();
      if (
        refs.playheadRef.current.currentTime > RESTART_THRESHOLD_SECONDS ||
        !hasPreviousItem(queue, hideExplicit)
      ) {
        commands().seek(0);
        return;
      }
      const state = dispatch({ type: "previous", hideExplicit });
      if (!state.current) return;
      refs.refreshCountRef.current = 0;
      void commands().loadEntry(state.current, 0);
    },
    seek: (seconds) => commands().seek(seconds),
    // Retry can be the gesture that resumes a context an interruption
    // suspended, so it unlocks too.
    retry: () => {
      unlock();
      commands().retry();
    },
    stop: () => {
      commands().resetPlayback();
      deps.clearSavedQueue();
    },
  };
}
