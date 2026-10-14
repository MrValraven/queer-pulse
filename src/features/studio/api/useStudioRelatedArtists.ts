import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { toArtistRefView, type StudioArtistRefView } from "./studio.adapters";
import { getStudioRelatedArtists } from "./studioDiscovery.api";
import { studioLoadStateOf, type StudioLoadState } from "./studioLoadState";
import { readStudio, studioKeys } from "./studioQueryKeys";
import { useStudioAccess } from "./useStudioAccess";

/** Matches the server's `Cache-Control: private, max-age=300`. */
const RELATED_STALE_MS = 5 * 60_000;

/** Up to eight artists scored from accepted credits, public playlists with
 *  two or more curators, shared scenes and shared genres. */
export function useStudioRelatedArtists(subprofileId: string | null): {
  artists: StudioArtistRefView[];
  loadState: StudioLoadState;
} {
  const { demoMode } = useDemoMode();
  const { hasAccess } = useStudioAccess();
  const query = useQuery({
    queryKey: studioKeys.relatedArtists(demoMode, subprofileId ?? ""),
    enabled: subprofileId !== null && (demoMode || hasAccess),
    staleTime: demoMode ? Number.POSITIVE_INFINITY : RELATED_STALE_MS,
    meta: { silentError: true },
    queryFn: ({ client }) =>
      readStudio(client, async () => {
        const dto = demoMode
          ? (await import("./studioDemoDiscovery")).demoStudioRelatedArtists(
              subprofileId ?? "",
            )
          : await getStudioRelatedArtists(subprofileId ?? "");
        return dto.items.map(toArtistRefView);
      }),
  });
  return {
    artists: query.data ?? [],
    loadState: studioLoadStateOf(query, query.data !== undefined),
  };
}
