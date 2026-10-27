import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getStudioReleaseTrackSources } from "./studio.api";
import {
  isSourcedReleaseType,
  toSources,
  type StudioReleaseView,
  type StudioTrackView,
} from "./studio.adapters";
import type { StudioSource } from "./studio.types";
import { readStudio, studioKeys } from "./studioQueryKeys";

type SourcesByTrackId = Record<string, StudioSource[] | undefined>;

/** Artist kinds (spec 6.3): the sources of each track with audio on an
 *  edit, lip-sync or mix release, for the publish checklist. Tracklist rows
 *  carry no sources, so one owner read answers for the whole release. A
 *  saved source patches this cache (useStudioTrackMutations), so it shows at
 *  once. `undefined` while not read. */
export function useStudioReleaseTrackSources(
  release: StudioReleaseView,
): SourcesByTrackId {
  const { demoMode } = useDemoMode();
  const isSourced = isSourcedReleaseType(release.type);
  const trackIds = isSourced
    ? release.tracks.filter((track) => track.hasAudio).map((track) => track.id)
    : [];
  const { data } = useQuery({
    queryKey: studioKeys.releaseTrackSources(demoMode, release.id, trackIds),
    enabled: trackIds.length > 0,
    meta: { silentError: true },
    queryFn: ({ client }): Promise<SourcesByTrackId> =>
      readStudio(client, async () => {
        if (!demoMode) {
          const response = await getStudioReleaseTrackSources(release.id);
          return Object.fromEntries(
            response.tracks.map((row) => [row.trackId, toSources(row.sources)]),
          );
        }
        // Demo reads the fixture, with a source saved this session (held on
        // the track detail cache) winning.
        const { demoStudioTrack } = await import("./studioDemoApi");
        return Object.fromEntries(
          trackIds.map((trackId) => [
            trackId,
            client.getQueryData<StudioTrackView>(
              studioKeys.track(true, trackId),
            )?.sources ?? toSources(demoStudioTrack(trackId).sources),
          ]),
        );
      }),
  });
  return Object.fromEntries(
    trackIds.map((trackId) => [trackId, data?.[trackId]]),
  );
}
