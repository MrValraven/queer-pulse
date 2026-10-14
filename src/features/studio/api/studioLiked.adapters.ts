import type { SavedItem } from "../../../app/providers/useSaved";
import { studioTrackPath } from "../studioPaths";
import {
  studioSavedId,
  toPlaylistEntryView,
  type StudioPlaylistEntryView,
} from "./studio.adapters";
import type {
  StudioLikedTrackEntryDTO,
  StudioLikedTracksPageDTO,
} from "./studio.types";

/** One Liked songs row. It keeps the track id and the saved title on every
 *  row, so an unavailable like still names what the member liked and can
 *  still be unliked. */
export interface StudioLikedEntryView extends StudioPlaylistEntryView {
  trackId: string;
  /** `studioSavedId.track(trackId)`: the id the Saved store holds. */
  savedId: string;
  /** The track's title while it is available, else the title the member
   *  saved. */
  title: string;
  /** The title the member saved, which the Saved store keeps. */
  savedTitle: string;
  href: string;
}

export interface StudioLikedTracksPageView {
  entries: StudioLikedEntryView[];
  nextCursor: string | null;
  trackCount: number;
  totalDurationSeconds: number;
}

export function toLikedEntryView(
  dto: StudioLikedTrackEntryDTO,
): StudioLikedEntryView {
  const entry = toPlaylistEntryView(dto);
  return {
    ...entry,
    trackId: dto.trackId,
    savedId: studioSavedId.track(dto.trackId),
    title: entry.track?.title ?? dto.savedTitle,
    savedTitle: dto.savedTitle,
    href: studioTrackPath(dto.trackId),
  };
}

export function toLikedTracksPageView(
  dto: StudioLikedTracksPageDTO,
): StudioLikedTracksPageView {
  return {
    entries: [...dto.items]
      .sort((left, right) => left.position - right.position)
      .map(toLikedEntryView),
    nextCursor: dto.pageInfo.hasMore ? dto.pageInfo.nextCursor : null,
    trackCount: dto.trackCount,
    totalDurationSeconds: dto.totalDurationSeconds,
  };
}

/** The Saved store's copy of a like, the way the server's saved list reads
 *  it: the title the member saved, a withdrawn track keeps its link (its
 *  page explains it), any other unavailable one carries none and names no
 *  reason. */
export function likedEntryToSavedItem(entry: StudioLikedEntryView): SavedItem {
  const isWithdrawn =
    !entry.isAvailable && entry.unavailableReason === "withdrawn";
  return {
    id: entry.savedId,
    kind: "studio_track",
    title: entry.savedTitle,
    href: entry.isAvailable || isWithdrawn ? entry.href : null,
    ...(entry.track ? { meta: entry.track.release.artist.name } : {}),
    availability: entry.isAvailable ? "available" : "unavailable",
    ...(isWithdrawn ? { unavailableReason: "withdrawn" as const } : {}),
  };
}
