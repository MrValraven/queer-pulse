import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getStudioGenres } from "./studio.api";
import { toGenreList } from "./studio.adapters";
import type { StudioGenre } from "./studio.types";
import { studioLoadStateOf, type StudioLoadState } from "./studioLoadState";
import { readStudio, studioKeys } from "./studioQueryKeys";
import { useStudioAccess } from "./useStudioAccess";

const GENRES_STALE_MS = 5 * 60_000;

const NO_COVERS: Partial<Record<StudioGenre, string>> = {};

/** Genres with at least one published release, in STUDIO_GENRES order, and
 *  the newest cover in each genre that has one. The home tiles stay quiet
 *  on a failure, so no toast. */
export function useStudioGenres(): {
  genres: StudioGenre[];
  coverByGenre: Partial<Record<StudioGenre, string>>;
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
    genres: query.data?.genres ?? [],
    coverByGenre: query.data?.coverByGenre ?? NO_COVERS,
    loadState: studioLoadStateOf(query, query.data !== undefined),
  };
}
