import {
  STUDIO_FORMATS,
  type StudioFormat,
  type StudioGenre,
} from "./api/studio.types";
import { useStudioFormats } from "./api/useStudioFormats";

/** At least two formats with content before the row means anything. */
const MIN_FORMATS_SHOWN = 2;

/** The format chips the row shows and whether the row is open: every
 *  format with content plus the chosen one. */
export function useStudioShownFormats(activeFormat: StudioFormat | null): {
  shownFormats: StudioFormat[];
  isOpen: boolean;
} {
  const { formats } = useStudioFormats();
  return {
    shownFormats: STUDIO_FORMATS.filter(
      (format) => format === activeFormat || formats.includes(format),
    ),
    isOpen: formats.length >= MIN_FORMATS_SHOWN || activeFormat !== null,
  };
}

/** A genre that names the same thing as a format chip. */
const GENRE_SHOWN_AS_FORMAT: Partial<Record<StudioFormat, StudioGenre>> = {
  spoken_word: "spoken-word",
};

/** The genres Browse leaves out because the format row already shows them
 *  as a chip. A chosen genre always stays, so its current chip shows. */
export function useBrowseOmittedGenres(
  activeFormat: StudioFormat | null,
  activeGenre: StudioGenre | null,
): StudioGenre[] {
  const { shownFormats, isOpen } = useStudioShownFormats(activeFormat);
  if (!isOpen) return [];
  return shownFormats.flatMap((format) => {
    const genre = GENRE_SHOWN_AS_FORMAT[format];
    return genre !== undefined && genre !== activeGenre ? [genre] : [];
  });
}
