import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type { StudioMood } from "./studio.types";
import { toMoodList } from "./studioDiscovery.adapters";
import { getStudioMoods } from "./studioDiscovery.api";
import { studioLoadStateOf, type StudioLoadState } from "./studioLoadState";
import { readStudio, studioKeys } from "./studioQueryKeys";
import { useStudioAccess } from "./useStudioAccess";

const MOODS_STALE_MS = 5 * 60_000;

/** Moods with at least one published release, in STUDIO_MOODS order. The
 *  chip rows stay quiet on a failure, so no toast. */
export function useStudioMoods(): {
  moods: StudioMood[];
  loadState: StudioLoadState;
} {
  const { demoMode } = useDemoMode();
  const { hasAccess } = useStudioAccess();
  const query = useQuery({
    queryKey: studioKeys.moods(demoMode),
    enabled: demoMode || hasAccess,
    staleTime: demoMode ? Number.POSITIVE_INFINITY : MOODS_STALE_MS,
    meta: { silentError: true },
    queryFn: ({ client }) =>
      readStudio(client, async () =>
        toMoodList(
          demoMode
            ? (await import("./studioDemoApi")).demoStudioMoods()
            : await getStudioMoods(),
        ),
      ),
  });
  return {
    moods: query.data ?? [],
    loadState: studioLoadStateOf(query, query.data !== undefined),
  };
}
