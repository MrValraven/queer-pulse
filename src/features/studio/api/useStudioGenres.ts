import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getStudioGenres } from "./studio.api";
import { toGenreList } from "./studio.adapters";
import type { StudioGenre } from "./studio.types";
import { studioLoadStateOf, type StudioLoadState } from "./studioLoadState";
import { readStudio, studioKeys } from "./studioQueryKeys";
import { useStudioAccess } from "./useStudioAccess";

const GENRES_STALE_MS = 5 * 60_000;

/** Genres with at least one published release, in STUDIO_GENRES order. The
 *  home chip row stays quiet on a failure, so no toast. */
export function useStudioGenres(): {
  genres: StudioGenre[];
  loadState: StudioLoadState;
} {
  const { demoMode } = useDemoMode();
  const { hasAccess } = useStudioAccess();
  const query = useQuery({
    queryKey: studioKeys.genres(demoMode),
    enabled: demoMode || hasAccess,
    staleTime: demoMode ? Number.POSITIVE_INFINITY : GENRES_STALE_MS,
    meta: { silentError: true },
    queryFn: ({ client }) =>
      readStudio(client, async () =>
        toGenreList(
          demoMode
            ? (await import("./studioDemoApi")).demoStudioGenres()
            : await getStudioGenres(),
        ),
      ),
  });
  return {
    genres: query.data ?? [],
    loadState: studioLoadStateOf(query, query.data !== undefined),
  };
}
