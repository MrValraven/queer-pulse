import type { Ref } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioLikedEntryView } from "./api/studioLiked.adapters";
import {
  StudioTrackRow,
  StudioTrackRowUnavailable,
  type StudioTrackRowLikeOptions,
} from "./kit/StudioTrackRow";
import type { StudioRowSelection } from "./kit/useStudioRowSelection";
import { StudioLikeButton } from "./StudioLikeButton";

interface StudioLikedEntryRowProps {
  entry: StudioLikedEntryView;
  /** The row's place in the list as shown (search and sort included). */
  index: number;
  isCurrent: boolean;
  isPlaying: boolean;
  /** Stable per row (the list keeps one per entry), so the memoised row
   *  stays still while the player ticks. */
  onPlay: () => void;
  likeOptions: StudioTrackRowLikeOptions;
  rowRef?: Ref<HTMLLIElement>;
  selection?: StudioRowSelection;
  /** The list reads "Hide explicit tracks" once; left out, the row does. */
  shouldHideExplicit?: boolean;
}

/** One like: the shared track row (play inside Liked songs, the explicit
 *  badge, artist and release links, the heart, Add to playlist and the
 *  track menu, a checkbox in selection mode). The heart is quiet here: the
 *  row fading out and the Undo toast confirm it. A like whose track left
 *  Studio keeps the title the member saved, reads Withdrawn when our team
 *  took its release down (that one links to the page that explains it),
 *  else No longer available, and keeps its heart. */
export function StudioLikedEntryRow({
  entry,
  index,
  isCurrent,
  isPlaying,
  onPlay,
  likeOptions,
  rowRef,
  selection,
  shouldHideExplicit,
}: StudioLikedEntryRowProps) {
  const { t } = useTranslation();
  if (!entry.track) {
    const isWithdrawn = entry.unavailableReason === "withdrawn";
    return (
      <StudioTrackRowUnavailable
        number={index + 1}
        label={entry.title}
        href={isWithdrawn ? entry.href : undefined}
        details={t(
          isWithdrawn
            ? "studio:withdrawnLive.rowLabel"
            : "studio:playlist.row.unavailable",
        )}
        actions={
          <StudioLikeButton
            subject={{
              trackId: entry.trackId,
              title: entry.title,
              href: entry.href,
              artistName: "",
            }}
            isQuiet={likeOptions.isQuiet}
            onToggled={likeOptions.onToggled}
          />
        }
      />
    );
  }
  // The shared row carries a heart only on a track that can play; a like
  // that cannot (audio still processing, an unreleased track) keeps one
  // here, so every like can still be taken out of Liked songs.
  const hasRowHeart =
    entry.track.hasAudio && entry.track.release.publishedAt !== null;
  return (
    <StudioTrackRow
      track={entry.track}
      extraActions={
        hasRowHeart ? undefined : (
          <StudioLikeButton
            subject={{
              trackId: entry.trackId,
              title: entry.title,
              href: entry.href,
              artistName: entry.track.release.artist.name,
            }}
            isQuiet={likeOptions.isQuiet}
            onToggled={likeOptions.onToggled}
          />
        )
      }
      index={index}
      isCurrent={isCurrent}
      isPlaying={isPlaying}
      onPlay={onPlay}
      selection={selection}
      selectionId={entry.savedId}
      likeOptions={likeOptions}
      rowRef={rowRef}
      shouldHideExplicit={shouldHideExplicit}
      isLayoutAnimated
      isDraggable
    />
  );
}
