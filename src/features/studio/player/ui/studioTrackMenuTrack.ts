import type { StudioTrackView } from "../../api/studio.adapters";
import { studioReleasePath, studioTrackPath } from "../../studioPaths";
import type { StudioQueueItem } from "../studioPlayerContext";

export interface StudioTrackMenuTrack {
  id: string;
  title: string;
  /** The router path, `/studio/track?id=<id>`. */
  href: string;
  hasAudio: boolean;
  /** With the member's "Hide explicit tracks" on, the queue items close. */
  isExplicit: boolean;
  /** Studio safety: the persona behind the track. With it the menu offers
   *  "Report track" to anyone who does not own that persona (spec 8). */
  artistId?: string;
  /** "Report track" shows for a published release only; a row that leaves
   *  this out offers no report. */
  isPublished?: boolean;
  /** A withheld track takes no report: its row reads "Unavailable". */
  isWithheld?: boolean;
  /** The artist's Studio page: with it the menu offers "Go to artist". */
  artistHref?: string;
  /** The artist's name, the snapshot a like keeps in Liked songs. */
  artistName?: string;
  /** The release's Studio page: with it the menu offers "Go to release". */
  releaseHref?: string;
}

/** The menu's view of a full track read. */
export function studioTrackMenuTrackOf(
  track: StudioTrackView,
): StudioTrackMenuTrack {
  return {
    id: track.id,
    title: track.title,
    href: track.href,
    hasAudio: track.hasAudio,
    isExplicit: track.isExplicit,
    artistId: track.release.artist.id,
    isPublished: track.release.publishedAt !== null,
    isWithheld: track.isWithheld,
    artistHref: track.release.artist.href,
    artistName: track.release.artist.name,
    releaseHref: track.release.href,
  };
}

/** The menu's track from a queue item, until the track's detail answers.
 *  Report waits for the detail, which knows whether the release is out. */
export function studioTrackMenuTrackOfQueueItem(
  item: StudioQueueItem,
): StudioTrackMenuTrack {
  return {
    id: item.trackId,
    title: item.title,
    href: item.trackHref,
    hasAudio: true,
    isExplicit: item.isExplicit,
    artistId: item.artistId,
    artistHref: item.artistHref,
    artistName: item.artistName,
    releaseHref: studioReleasePath(item.releaseId),
  };
}

/** What a context menu shows when the track read failed: the queue and the
 *  link, which need only the id. */
export function fallbackStudioTrackMenuTrack(
  trackId: string,
): StudioTrackMenuTrack {
  return {
    id: trackId,
    title: "",
    href: studioTrackPath(trackId),
    hasAudio: true,
    isExplicit: false,
  };
}
