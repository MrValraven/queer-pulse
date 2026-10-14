import type {
  StudioPlayerValue,
  StudioQueueSource,
  StudioQueueTrack,
} from "./studioPlayerContext";

/** Crossfade and gapless preload stay out of any transition with an episode
 *  on either side (spec 5.6). */
export function isEpisodeTransition(
  current: { isEpisode?: boolean } | null,
  next: { isEpisode?: boolean } | null,
): boolean {
  return current?.isEpisode === true || next?.isEpisode === true;
}

/** The queue entry a play asked to start at a named second: a timestamp in
 *  the notes, a chapter, a `&t=` link, 0:00 included. The episode tracker
 *  starts that entry there and leaves its saved place alone; a plain Play
 *  still resumes. Held in this tab's memory only, and sent nowhere. */
let explicitStartEntryId: string | null = null;

/** Names the entry that starts at a named second, or null to clear it.
 *  Every new queue sets or clears it before its first load. */
export function markExplicitStart(queueEntryId: string | null): void {
  explicitStartEntryId = queueEntryId;
}

/** The entry started at a named second, so its saved place stays put. */
export function hasExplicitStart(queueEntryId: string | null): boolean {
  return queueEntryId !== null && explicitStartEntryId === queueEntryId;
}

/** Plays one episode as a queue of its own, with its show as the source
 *  (spec 5.6). On the episode already loaded it seeks to `startAtSeconds`
 *  (a timestamp in the notes, a `&t=` link) and makes sure it plays; that
 *  start also wins over a saved place still waiting to resume. */
export function playEpisode(
  player: Pick<
    StudioPlayerValue,
    | "isCurrentTrack"
    | "currentItem"
    | "seek"
    | "status"
    | "togglePlay"
    | "playTracks"
  >,
  item: StudioQueueTrack,
  source: StudioQueueSource,
  startAtSeconds?: number,
): Promise<void> {
  if (player.isCurrentTrack(item.trackId)) {
    if (startAtSeconds !== undefined) {
      markExplicitStart(player.currentItem?.queueEntryId ?? null);
      player.seek(startAtSeconds);
    }
    if (player.status === "paused" || player.status === "error")
      player.togglePlay();
    return Promise.resolve();
  }
  return player.playTracks([item], item.trackId, source, startAtSeconds);
}
