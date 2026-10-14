import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getStudioReleases } from "./studio.api";
import { toReleaseCardView } from "./studio.adapters";
import type { StudioFormat, StudioGenre, StudioMood } from "./studio.types";
import { studioKeys } from "./studioQueryKeys";
import { useStudioAccess } from "./useStudioAccess";
import { useStudioCursorPages } from "./useStudioCursorPages";
import type { StudioReleasesResult } from "./useStudioReleases";

/** Releases in a genre, a mood, a format, or any mix (AND), newest first,
 *  one Show more press per page. Nothing is read until one is chosen. */
export function useStudioBrowseReleases(
  genre: StudioGenre | null,
  mood: StudioMood | null = null,
  format: StudioFormat | null = null,
): StudioReleasesResult {
  const { demoMode } = useDemoMode();
  const { hasAccess } = useStudioAccess();
  const isFiltered = genre !== null || mood !== null || format !== null;
  const { items, ...pager } = useStudioCursorPages({
    queryKey: studioKeys.browse(demoMode, genre, mood, format),
    enabled: isFiltered && (demoMode || hasAccess),
    read: async (cursor) =>
      demoMode
        ? (await import("./studioDemoApi")).demoStudioReleasesPage(
            cursor,
            genre,
            mood,
            format,
          )
        : await getStudioReleases(cursor, genre, mood, format),
    toView: toReleaseCardView,
  });
  return { releases: items, ...pager };
}
