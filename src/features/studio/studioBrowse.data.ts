import type { StudioGenre, StudioMood } from "./api/studio.types";

export interface StudioBrowseCopyKeys {
  titleKey: string;
  gridLabelKey: string;
  emptyTitleKey: string;
}

/** The browse page's heading, grid label and empty title for the chosen
 *  filters; every one interpolates `{genre}` and `{mood}`. */
export function browseCopyKeysOf(
  genre: StudioGenre | null,
  mood: StudioMood | null,
): StudioBrowseCopyKeys {
  if (genre && mood)
    return {
      titleKey: "studio:browse.titleBoth",
      gridLabelKey: "studio:browse.gridLabelBoth",
      emptyTitleKey: "studio:browse.empty.titleBoth",
    };
  if (mood)
    return {
      titleKey: "studio:browse.titleMood",
      gridLabelKey: "studio:browse.gridLabelMood",
      emptyTitleKey: "studio:browse.empty.titleMood",
    };
  return {
    titleKey: genre ? "studio:browse.title" : "studio:browse.titleNone",
    gridLabelKey: "studio:browse.gridLabel",
    emptyTitleKey: "studio:browse.empty.title",
  };
}

/** Artist kinds: browse narrowed by a format alone. */
export const FORMAT_BROWSE_COPY_KEYS: StudioBrowseCopyKeys = {
  titleKey: "studio:browse.titleFormat",
  gridLabelKey: "studio:browse.gridLabelFormat",
  emptyTitleKey: "studio:browse.emptyTitleFormat",
};
