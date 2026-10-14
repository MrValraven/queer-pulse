import { queryOptions } from "@tanstack/react-query";
import { getStudioTrack } from "./studio.api";
import { toTrackView, type StudioTrackView } from "./studio.adapters";
import { readStudio, studioKeys } from "./studioQueryKeys";

/** The track detail read, shared by the track page and the player (the
 *  track that plays, and Play next / Add to queue). Its own module, so a test
 *  that mocks useStudioTrack leaves the player's read in place. */
export function studioTrackQueryOptions(demoMode: boolean, trackId: string) {
  return queryOptions({
    queryKey: studioKeys.track(demoMode, trackId),
    staleTime: demoMode ? Number.POSITIVE_INFINITY : undefined,
    queryFn: ({ client }): Promise<StudioTrackView> =>
      readStudio(client, async () =>
        toTrackView(
          demoMode
            ? (await import("./studioDemoApi")).demoStudioTrack(trackId)
            : await getStudioTrack(trackId),
        ),
      ),
  });
}
