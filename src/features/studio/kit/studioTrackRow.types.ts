import type { ImageSlotTint } from "../../../shared/components/ui";
import type { StudioTrackMenuTrack } from "../player/ui/StudioTrackMenu";
import type {
  StudioArtistRefView,
  StudioReleaseCardView,
  StudioTrackRowView,
} from "../api/studio.adapters";

/** The release a row names and links: a full `StudioReleaseCardView`
 *  satisfies it, so search, playlist and liked tracks pass straight in. */
export interface StudioTrackRowRelease extends Pick<
  StudioReleaseCardView,
  "id" | "title" | "href" | "publishedAt"
> {
  coverUrl: string | null;
  tint: ImageSlotTint;
  artist: Pick<StudioArtistRefView, "id" | "name" | "href">;
}

/** One track as every Studio track row renders it. An album tracklist
 *  passes `{ ...track, release }`; a `StudioSearchTrackView` (search,
 *  playlist and liked entries) already has this shape. */
export interface StudioTrackSummary extends StudioTrackRowView {
  release: StudioTrackRowRelease;
}

/** A reorder or removal glides the rows around it: `--dur-base` on the
 *  `--ease` curve. */
export const ROW_LAYOUT_TRANSITION = {
  duration: 0.25,
  ease: [0.22, 0.68, 0.16, 1],
} as const;

/** The track menu's view of a row: the "..." trigger and the right-click
 *  menu share it, so the context menu never waits on a track read. */
export function studioTrackRowMenuTrack(
  track: StudioTrackSummary,
): StudioTrackMenuTrack {
  return {
    id: track.id,
    title: track.title,
    href: track.href,
    hasAudio: track.hasAudio,
    isExplicit: track.isExplicit,
    artistId: track.release.artist.id,
    artistHref: track.release.artist.href,
    artistName: track.release.artist.name,
    releaseHref: track.release.href,
    isPublished: track.release.publishedAt !== null,
    isWithheld: track.isWithheld,
  };
}
