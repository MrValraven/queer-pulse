import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { toReleaseCardView } from "./studio.adapters";
import { getStudioSceneReleases } from "./studioDiscovery.api";
import { studioKeys } from "./studioQueryKeys";
import { useStudioAccess } from "./useStudioAccess";
import { useStudioCursorPages } from "./useStudioCursorPages";
import type { StudioReleasesResult } from "./useStudioReleases";

/** A scene's releases, newest first, one Show more press per page. */
export function useStudioSceneReleases(
  slug: string | null,
): StudioReleasesResult {
  const { demoMode } = useDemoMode();
  const { hasAccess } = useStudioAccess();
  const { items, ...pager } = useStudioCursorPages({
    queryKey: studioKeys.sceneReleases(demoMode, slug ?? ""),
    enabled: slug !== null && (demoMode || hasAccess),
    read: async (cursor) =>
      demoMode
        ? (await import("./studioDemoDiscovery")).demoStudioSceneReleases(
            slug ?? "",
            cursor,
          )
        : await getStudioSceneReleases(slug ?? "", cursor),
    toView: toReleaseCardView,
  });
  return { releases: items, ...pager };
}
