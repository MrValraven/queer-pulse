import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getStudioReleases } from "./studio.api";
import { toReleaseCardView } from "./studio.adapters";
import type { StudioFormat } from "./studio.types";
import { studioKeys } from "./studioQueryKeys";
import { useStudioAccess } from "./useStudioAccess";
import { useStudioCursorPages } from "./useStudioCursorPages";
import type { StudioReleasesResult } from "./useStudioReleases";

/** Published releases of one format, newest first, one Show more press per
 *  page: the home grid under a format chip, and the Spoken word and On
 *  stage shelves. Nothing is read while `format` is null. */
export function useStudioFormatReleases(
  format: StudioFormat | null,
  options: { isSilent?: boolean } = {},
): StudioReleasesResult {
  const { demoMode } = useDemoMode();
  const { hasAccess } = useStudioAccess();
  const { items, ...pager } = useStudioCursorPages({
    queryKey: studioKeys.formatReleases(demoMode, format ?? "music"),
    enabled: format !== null && (demoMode || hasAccess),
    silentError: options.isSilent ?? false,
    read: async (cursor) =>
      demoMode
        ? (await import("./studioDemoApi")).demoStudioReleasesPage(
            cursor,
            null,
            null,
            format,
          )
        : await getStudioReleases(cursor, null, null, format),
    toView: toReleaseCardView,
  });
  return { releases: items, ...pager };
}
