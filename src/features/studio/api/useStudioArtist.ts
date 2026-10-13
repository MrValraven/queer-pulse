import { useQuery, type QueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getStudioArtist } from "./studio.api";
import { toArtistView, type StudioArtistView } from "./studio.adapters";
import { DEMO_DEFAULT_ARTIST_ID } from "./studioDemoMe.data";
import {
  STUDIO_NOT_FOUND_STATE,
  studioLoadStateOf,
  type StudioLoadState,
} from "./studioLoadState";
import { readStudio, studioKeys } from "./studioQueryKeys";
import { useStudioAccess } from "./useStudioAccess";

/**
 * A persona's Studio page data. `isEnabled: false` lets a caller outside
 * Studio (the persona sections) skip the read for a persona that is not a
 * musician or DJ. Only a granted viewer ever reaches the network.
 */
export function useStudioArtist(
  subprofileId: string | null,
  options: { isEnabled?: boolean; isSilent?: boolean } = {},
): { artist: StudioArtistView | null; loadState: StudioLoadState } {
  const { demoMode } = useDemoMode();
  const { hasAccess } = useStudioAccess();
  const resolvedId = subprofileId ?? (demoMode ? DEMO_DEFAULT_ARTIST_ID : null);
  const isEnabled = options.isEnabled ?? true;
  const query = useQuery({
    queryKey: studioKeys.artist(demoMode, resolvedId ?? ""),
    enabled: isEnabled && resolvedId !== null && (demoMode || hasAccess),
    meta: options.isSilent ? { silentError: true } : undefined,
    staleTime: demoMode ? Number.POSITIVE_INFINITY : undefined,
    queryFn: ({ client }) =>
      readStudio(client, async () =>
        toArtistView(
          demoMode
            ? (await import("./studioDemoApi")).demoStudioArtist(
                resolvedId ?? "",
              )
            : await getStudioArtist(resolvedId ?? ""),
        ),
      ),
  });
  if (resolvedId === null)
    return { artist: null, loadState: STUDIO_NOT_FOUND_STATE };
  return {
    artist: query.data ?? null,
    loadState: studioLoadStateOf(query, query.data !== undefined),
  };
}

/** After a Follow or Unfollow from the Studio hero: the server's answer
 *  goes straight into the cached artist view, so the count never flickers
 *  through a refetch. */
export function patchStudioArtistFollow(
  queryClient: QueryClient,
  demoMode: boolean,
  subprofileId: string,
  result: { followerCount: number; viewerFollowing: boolean },
): void {
  queryClient.setQueryData<StudioArtistView>(
    studioKeys.artist(demoMode, subprofileId),
    (view) =>
      view
        ? {
            ...view,
            followerCount: result.followerCount,
            isFollowing: result.viewerFollowing,
          }
        : view,
  );
}
