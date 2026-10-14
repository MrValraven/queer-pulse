import {
  STUDIO_GENRE_LABEL_KEY,
  tintForId,
  type StudioReleaseCardView,
  type StudioReleaseView,
  type StudioSearchTrackView,
  type StudioTrackRowView,
  type StudioTrackView,
} from "../api/studio.adapters";
import { latestEpisodeOf } from "../api/studioEpisodes";
import type {
  StudioRadioFilter,
  StudioRadioItemDTO,
} from "../api/studio.types";
import { STUDIO_MOOD_LABEL_KEY } from "../studioDiscoveryLabels";
import { studioArtistPath, studioTrackPath } from "../studioPaths";
import type {
  StudioQueueItem,
  StudioQueueSource,
  StudioQueueTrack,
  StudioRadioSession,
} from "./studioPlayerContext";

/** Artist kinds: the one episode a show's Play starts. The row
 *  `startTrackId` names when it has audio (an older episode, a chapter on
 *  the episode page), else the latest published episode. A preview link of
 *  an unreleased show has no published episode yet, so it plays the newest
 *  row with audio. */
function showEpisodeToPlay(
  release: StudioReleaseView,
  previewToken: string | undefined,
  startTrackId: string | undefined,
): StudioTrackRowView | null {
  const named = startTrackId
    ? release.tracks.find(
        (track) => track.id === startTrackId && track.hasAudio,
      )
    : undefined;
  if (named) return named;
  const latest = latestEpisodeOf(release);
  if (latest || !previewToken) return latest;
  const withAudio = release.tracks
    .filter((track) => track.hasAudio)
    .sort((left, right) => left.position - right.position);
  return withAudio[withAudio.length - 1] ?? null;
}

/** A release's tracks that have confirmed audio, in tracklist order. A
 *  `previewToken` (v3's private preview link) rides on every track, so each
 *  stream read goes through the preview route. A show queues one episode
 *  alone (spec 5.6): the one `startTrackId` names, or its latest. */
export function queueFromRelease(
  release: StudioReleaseView,
  previewToken?: string,
  startTrackId?: string,
): StudioQueueTrack[] {
  if (release.type === "podcast") {
    const chosen = showEpisodeToPlay(release, previewToken, startTrackId);
    if (!chosen) return [];
    const episode = queueItemFromEpisode(chosen, release);
    return [previewToken ? { ...episode, previewToken } : episode];
  }
  return release.tracks
    .filter((track) => track.hasAudio)
    .map((track) => ({
      trackId: track.id,
      title: track.title,
      durationSeconds: track.durationSeconds,
      trackHref: track.href,
      releaseId: release.id,
      releaseTitle: release.title,
      coverUrl: release.coverUrl,
      tint: release.tint,
      artistId: release.artist.id,
      artistName: release.artist.name,
      artistHref: release.artist.href,
      isExplicit: track.isExplicit,
      isEpisode: false,
      ...(previewToken ? { previewToken } : {}),
    }));
}

export function startIndexFor(
  queue: readonly { trackId: string }[],
  startTrackId?: string,
): number {
  if (!startTrackId) return 0;
  const index = queue.findIndex((item) => item.trackId === startTrackId);
  return index >= 0 ? index : 0;
}

/** One playlist track as a queue item; its release card carries the cover
 *  and the artist. */
export function queueItemFromTrack(
  track: StudioSearchTrackView,
): StudioQueueTrack {
  return {
    trackId: track.id,
    title: track.title,
    durationSeconds: track.durationSeconds,
    trackHref: track.href,
    releaseId: track.release.id,
    releaseTitle: track.release.title,
    coverUrl: track.release.coverUrl,
    tint: track.release.tint,
    artistId: track.release.artist.id,
    artistName: track.release.artist.name,
    artistHref: track.release.artist.href,
    isExplicit: track.isExplicit,
    isEpisode: track.release.type === "podcast",
  };
}

/** A track page's detail as a queue track (Play next, Add to queue). */
export function queueItemFromTrackView(
  track: StudioTrackView,
): StudioQueueTrack {
  return {
    trackId: track.id,
    title: track.title,
    durationSeconds: track.durationSeconds,
    trackHref: track.href,
    releaseId: track.release.id,
    releaseTitle: track.release.title,
    coverUrl: track.release.coverUrl,
    tint: track.release.tint,
    artistId: track.release.artist.id,
    artistName: track.release.artist.name,
    artistHref: track.release.artist.href,
    isExplicit: track.isExplicit,
    isEpisode: track.release.type === "podcast",
  };
}

/** Tracks with confirmed audio, in the order given. */
export function queueFromTracks(
  tracks: StudioSearchTrackView[],
): StudioQueueTrack[] {
  return tracks.filter((track) => track.hasAudio).map(queueItemFromTrack);
}

/** Any list shuffled (Fisher and Yates), in the browser and sent nowhere.
 *  Returns a new array; `random` is a seam for tests. */
export function shuffledItems<Item>(
  items: readonly Item[],
  random: () => number = Math.random,
): Item[] {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    const current = shuffled[index];
    const other = shuffled[swapIndex];
    if (current === undefined || other === undefined) continue;
    shuffled[index] = other;
    shuffled[swapIndex] = current;
  }
  return shuffled;
}

/** Shuffle (Fisher and Yates), computed in the browser and sent nowhere.
 *  Returns a new array; `random` is a seam for tests and seeded shuffles. */
export function shuffledQueue<Item>(
  items: readonly Item[],
  random: () => number = Math.random,
): Item[] {
  return shuffledItems(items, random);
}

/** One radio item as a queue item; the item carries its release and artist,
 *  so the player reads nothing more than the stream. */
export function queueItemFromRadioItem(
  item: StudioRadioItemDTO,
): StudioQueueTrack {
  return {
    trackId: item.trackId,
    title: item.title,
    durationSeconds: item.durationSeconds,
    trackHref: studioTrackPath(item.trackId),
    releaseId: item.releaseId,
    releaseTitle: item.releaseTitle,
    coverUrl: item.coverUrl,
    tint: tintForId(item.releaseId),
    artistId: item.artist.id,
    artistName: item.artist.name,
    artistHref: studioArtistPath(item.artist.id),
    isExplicit: item.isExplicit,
    // A radio never plays an episode (spec 4.6).
    isEpisode: false,
  };
}

/** One episode as a queue item, from a show page row, an episode card or
 *  the episode page. */
export function queueItemFromEpisode(
  track: StudioTrackRowView,
  release: StudioReleaseCardView,
): StudioQueueTrack {
  return {
    trackId: track.id,
    title: track.title,
    durationSeconds: track.durationSeconds,
    trackHref: track.href,
    releaseId: release.id,
    releaseTitle: release.title,
    coverUrl: release.coverUrl,
    tint: release.tint,
    artistId: release.artist.id,
    artistName: release.artist.name,
    artistHref: release.artist.href,
    isExplicit: track.isExplicit,
    isEpisode: true,
  };
}

/** The queue panel names the show an episode was started from. */
export function showQueueSource(
  release: StudioReleaseCardView,
): StudioQueueSource {
  return { kind: "release", label: release.title, href: release.href };
}

/**
 * The radio's refill: the queue so far plus a fresh shuffle of the whole
 * pool, whose first track is always a different one from the track that
 * just played. A pool of fewer than two distinct tracks cannot keep that
 * promise, so its radio ends with the queue it has. Every refilled track
 * gets a fresh entry id.
 */
export function extendRadioQueue(
  queue: StudioQueueItem[],
  pool: readonly StudioQueueTrack[],
  random: () => number = Math.random,
  createEntryId: () => string = createQueueEntryId,
): StudioQueueItem[] {
  const distinctTrackCount = new Set(pool.map((item) => item.trackId)).size;
  if (distinctTrackCount < 2) return queue;
  const refill = shuffledItems(pool, random);
  const lastTrackId = queue[queue.length - 1]?.trackId;
  const first = refill[0];
  if (first && first.trackId === lastTrackId) {
    const swapIndex = refill.findIndex((item) => item.trackId !== lastTrackId);
    const replacement = refill[swapIndex];
    if (replacement && swapIndex > 0) {
      refill[0] = replacement;
      refill[swapIndex] = first;
    }
  }
  return [...queue, ...toQueueItems(refill, createEntryId)];
}

/** A radio's pool from the queue: each track of the source once, in its own
 *  order (the rule the reducer refills by). */
export function radioPoolOf(
  originalSourceItems: readonly StudioQueueItem[],
): StudioQueueItem[] {
  const seenTrackIds = new Set<string>();
  return originalSourceItems.filter((item) => {
    if (seenTrackIds.has(item.trackId)) return false;
    seenTrackIds.add(item.trackId);
    return true;
  });
}

/** The radio that plays, or null: a "radio" source with its filter. A
 *  restored radio without one plays as a finite queue. */
export function radioSessionOf(
  source: StudioQueueSource | null,
  originalSourceItems: readonly StudioQueueItem[],
): StudioRadioSession | null {
  if (source?.kind !== "radio" || !source.radioFilter) return null;
  return {
    filter: source.radioFilter,
    pool: radioPoolOf(originalSourceItems),
  };
}

/** The catalog key the player bar names a radio with. */
export function radioFilterLabelKey(filter: StudioRadioFilter): string {
  return filter.kind === "genre"
    ? STUDIO_GENRE_LABEL_KEY[filter.value]
    : STUDIO_MOOD_LABEL_KEY[filter.value];
}

// A random prefix per page load, so ids from a restored queue (another load)
// and new ids can never collide.
const ENTRY_SESSION_PREFIX = Math.floor(Math.random() * 36 ** 6).toString(36);
let entrySequence = 0;

export function createQueueEntryId(): string {
  entrySequence += 1;
  return `entry-${ENTRY_SESSION_PREFIX}-${entrySequence}`;
}

/** Stamps a fresh entry id on every track, so the same track can sit in the
 *  queue twice. An id already present is replaced; every other field (a v3
 *  previewToken included) is kept. */
export function toQueueItems(
  tracks: readonly StudioQueueTrack[],
  createEntryId: () => string = createQueueEntryId,
): StudioQueueItem[] {
  return tracks.map((track) => ({ ...track, queueEntryId: createEntryId() }));
}
