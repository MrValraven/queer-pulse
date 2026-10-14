import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { searchStudio } from "./studio.api";
import { toSearchView, type StudioSearchView } from "./studio.adapters";
import {
  STUDIO_LIMITS,
  type StudioFormat,
  type StudioGenre,
  type StudioMood,
  type StudioSearchType,
} from "./studio.types";
import { studioLoadStateOf, type StudioLoadState } from "./studioLoadState";
import { readStudio, studioKeys } from "./studioQueryKeys";
import { useStudioAccess } from "./useStudioAccess";

/**
 * Server search (title and artist name, accents folded server-side). The
 * result is rendered as the server returns it: no client filter runs over a
 * live result. Demo filters the fixture through the same view model.
 * `genre` and `mood` narrow releases and tracks (Studio v2, Studio
 * discovery); artists and playlists ignore both, as the server does.
 * `format` narrows releases, tracks and artists (Studio artist kinds).
 */
export function useStudioSearch(
  query: string,
  type: StudioSearchType,
  genre: StudioGenre | null = null,
  mood: StudioMood | null = null,
  format: StudioFormat | null = null,
): {
  result: StudioSearchView | null;
  loadState: StudioLoadState;
  isIdle: boolean;
} {
  const { demoMode } = useDemoMode();
  const { hasAccess } = useStudioAccess();
  const trimmed = query.trim().slice(0, STUDIO_LIMITS.searchQueryMax);
  const isIdle = trimmed.length === 0;
  const search = useQuery({
    queryKey: studioKeys.search(demoMode, trimmed, type, genre, mood, format),
    enabled: !isIdle && (demoMode || hasAccess),
    placeholderData: keepPreviousData,
    queryFn: ({ signal, client }) =>
      readStudio(client, async () =>
        toSearchView(
          demoMode
            ? (await import("./studioDemoApi")).demoStudioSearch(
                trimmed,
                type,
                genre,
                mood,
                format,
              )
            : await searchStudio(trimmed, type, genre, signal, mood, format),
        ),
      ),
  });
  return {
    result: isIdle ? null : (search.data ?? null),
    loadState: studioLoadStateOf(search, search.data !== undefined),
    isIdle,
  };
}
