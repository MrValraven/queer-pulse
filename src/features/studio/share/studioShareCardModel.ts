import type {
  StudioPlaylistView,
  StudioReleaseView,
  StudioTrackView,
} from "../api/studio.adapters";
import type { StudioLoadState } from "../api/studioLoadState";
import type { StudioQueueTrack } from "../player/studioPlayerContext";
import { queueFromRelease, queueFromTracks } from "../player/studioQueue";

/** What one card shows. Teaser: the reader has no Studio grant (signed out
 *  included) and no read is made. Withdrawn: the server answered 410
 *  `studio_release_withdrawn`. Unavailable: the item is gone (404, or a
 *  withheld track), a calm view that needs no retry. Error: a transient read
 *  failure (5xx, network, timeout), which names its reason and offers Retry. */
export type StudioShareCardStatus =
  "teaser" | "loading" | "withdrawn" | "unavailable" | "error" | "ready";

export const GRANTED_ACCESS = { hasAccess: true, isPending: false } as const;

export function studioShareCardStatus(
  access: { hasAccess: boolean; isPending: boolean },
  loadState: StudioLoadState | null,
  hasData: boolean,
): StudioShareCardStatus {
  if (access.isPending) return "loading";
  if (!access.hasAccess) return "teaser";
  if (hasData) return "ready";
  if (!loadState) return "loading";
  if (loadState.isWithdrawn) return "withdrawn";
  // A withheld track (410 `studio_track_withheld`) reads as every other
  // refusal: the card names nothing about why.
  if (loadState.isNotFound || loadState.isTrackWithheld === true) {
    return "unavailable";
  }
  if (loadState.isError) return "error";
  return "loading";
}

/** Playable: play starts. Hidden: everything audible is explicit while the
 *  member hides explicit tracks (the card says why). Scheduled: a listener's
 *  view of an upcoming release (the card shows its date). Blocked: nothing
 *  can play (no audio yet, or taken down); the card shows no play control. */
export type StudioSharePlayMode =
  "playable" | "hidden" | "scheduled" | "blocked";

export interface StudioSharePlayModel {
  playMode: StudioSharePlayMode;
  /** What play queues for a release or playlist; [] for a track, which
   *  plays inside its release. */
  queue: StudioQueueTrack[];
  hasHiddenTrack: boolean;
}

const BLOCKED: StudioSharePlayModel = {
  playMode: "blocked",
  queue: [],
  hasHiddenTrack: false,
};

function playModelOf(
  queue: StudioQueueTrack[],
  hideExplicit: boolean,
): StudioSharePlayModel {
  const audible = hideExplicit
    ? queue.filter((item) => !item.isExplicit)
    : queue;
  if (audible.length === 0) {
    return queue.length > 0
      ? { playMode: "hidden", queue: [], hasHiddenTrack: true }
      : BLOCKED;
  }
  return {
    playMode: "playable",
    queue: audible,
    hasHiddenTrack: audible.length < queue.length,
  };
}

/** Mirrors `StudioAlbumHeroActions`: a listener sees an upcoming release
 *  without play; its owner and a preview keep play. */
export function releasePlayModel(
  release: StudioReleaseView,
  hideExplicit: boolean,
): StudioSharePlayModel {
  const isUpcomingForViewer =
    release.isUpcoming && !release.isOwner && !release.isPreview;
  if (isUpcomingForViewer) {
    return { playMode: "scheduled", queue: [], hasHiddenTrack: false };
  }
  if (release.status === "taken_down") return BLOCKED;
  return playModelOf(queueFromRelease(release), hideExplicit);
}

export function trackPlayModel(
  track: StudioTrackView,
  hideExplicit: boolean,
): StudioSharePlayModel {
  if (hideExplicit && track.isExplicit) {
    return { playMode: "hidden", queue: [], hasHiddenTrack: true };
  }
  if (!track.hasAudio || track.isDraft === true) return BLOCKED;
  return { playMode: "playable", queue: [], hasHiddenTrack: false };
}

export function playlistPlayModel(
  playlist: StudioPlaylistView,
  hideExplicit: boolean,
): StudioSharePlayModel {
  return playModelOf(queueFromTracks(playlist.playableTracks), hideExplicit);
}
