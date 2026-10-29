import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { isStudioGenre, STUDIO_GENRE_LABEL_KEY } from "./api/studio.adapters";
import type { StudioGenre } from "./api/studio.types";
import type { StudioLikedEntryView } from "./api/studioLiked.adapters";
import type { StudioLikedTracksResult } from "./api/useStudioLikedTracks";

/** One genre chip: its label and how many of the member's likes carry it. */
export interface StudioLikedGenreOption {
  genre: StudioGenre;
  label: string;
  count: number;
}

export interface StudioLikedGenres {
  /** Every genre the likes carry, the biggest first (ties by label). */
  options: StudioLikedGenreOption[];
  /** True once every page is read and two genres or more are on offer:
   *  a single chip would filter nothing. */
  isOpen: boolean;
  activeGenre: StudioGenre | null;
  /** Picks a genre, or clears it when it is the active one. */
  toggleGenre: (genre: StudioGenre) => void;
  /** Drops the picked genre, so every like shows again. */
  clearGenre: () => void;
  /** The likes in the active genre, or all of them with none picked. */
  entries: StudioLikedEntryView[];
}

/** The genres of a like while its track is available, each one Studio
 *  knows and each listed once; empty otherwise, and such a like counts in no
 *  chip. A like counts once for every genre its release carries. */
function genresOf(entry: StudioLikedEntryView): StudioGenre[] {
  const releaseGenres = entry.track?.release.genres ?? [];
  return [...new Set(releaseGenres)].filter(isStudioGenre);
}

/**
 * Liked songs' genre chips, like Spotify's. The counts read every like the
 * member holds, so a search typed in the list leaves them still, and each
 * page still waiting is read in the background once the page has loaded
 * (which also serves the search and the sort, and refills a list whose
 * loaded rows were all unliked). A failed read stops there and leaves the
 * footer's retry; a read already under way (the refetch an unlike starts)
 * finishes first. A picked genre that drops to no likes clears itself.
 */
export function useStudioLikedGenres(
  liked: StudioLikedTracksResult,
): StudioLikedGenres {
  const { t } = useTranslation();
  const [chosenGenre, setChosenGenre] = useState<StudioGenre | null>(null);

  const shouldReadNextPage =
    liked.hasMore && !liked.isFetchingNextPage && !liked.isFetchNextPageError;
  const { fetchNextPage } = liked;
  useEffect(() => {
    if (shouldReadNextPage) fetchNextPage({ cancelRefetch: false });
  }, [shouldReadNextPage, fetchNextPage]);

  const options = useMemo(() => {
    const countByGenre = new Map<StudioGenre, number>();
    for (const entry of liked.entries) {
      for (const genre of genresOf(entry)) {
        countByGenre.set(genre, (countByGenre.get(genre) ?? 0) + 1);
      }
    }
    return [...countByGenre]
      .map(([genre, count]) => ({
        genre,
        count,
        label: t(STUDIO_GENRE_LABEL_KEY[genre]),
      }))
      .sort(
        (left, right) =>
          right.count - left.count || left.label.localeCompare(right.label),
      );
  }, [liked.entries, t]);

  const hasChoice = options.length >= 2;
  const isChosenStillLiked =
    chosenGenre !== null &&
    hasChoice &&
    options.some((option) => option.genre === chosenGenre);
  // The member unliked the last track of the picked genre (or of the only
  // other one): the stored pick goes too, so a later like of that genre
  // never brings the filter back on its own.
  if (chosenGenre !== null && !isChosenStillLiked) setChosenGenre(null);
  const activeGenre = isChosenStillLiked ? chosenGenre : null;

  const entries = useMemo(
    () =>
      activeGenre === null
        ? liked.entries
        : liked.entries.filter((entry) =>
            genresOf(entry).includes(activeGenre),
          ),
    [liked.entries, activeGenre],
  );

  const toggleGenre = useCallback((genre: StudioGenre) => {
    setChosenGenre((current) => (current === genre ? null : genre));
  }, []);
  const clearGenre = useCallback(() => setChosenGenre(null), []);

  return {
    options,
    isOpen: hasChoice && (!liked.hasMore || activeGenre !== null),
    activeGenre,
    toggleGenre,
    clearGenre,
    entries,
  };
}
