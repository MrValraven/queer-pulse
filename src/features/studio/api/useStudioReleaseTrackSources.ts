import { useQueries } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  isSourcedReleaseType,
  type StudioReleaseView,
} from "./studio.adapters";
import type { StudioSource } from "./studio.types";
import { studioTrackQueryOptions } from "./studioTrackQuery";

/** Artist kinds (spec 6.3): the sources of each track with audio on an
 *  edit, lip-sync or mix release, for the publish checklist. Tracklist rows
 *  carry no sources, so each track is read through the single-track query,
 *  under the key useStudioTrack uses, so the details panel's cache answers
 *  it and a saved source shows at once. `undefined` while not read. */
export function useStudioReleaseTrackSources(
  release: StudioReleaseView,
): Record<string, StudioSource[] | undefined> {
  const { demoMode } = useDemoMode();
  const isSourced = isSourcedReleaseType(release.type);
  const tracks = isSourced
    ? release.tracks.filter((track) => track.hasAudio)
    : [];
  const results = useQueries({
    queries: tracks.map((track) => ({
      ...studioTrackQueryOptions(demoMode, track.id),
      meta: { silentError: true },
    })),
  });
  return Object.fromEntries(
    tracks.map((track, index) => [track.id, results[index]?.data?.sources]),
  );
}
