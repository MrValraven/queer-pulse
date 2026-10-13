import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { isStudioGenre } from "./api/studio.adapters";
import {
  STUDIO_SEARCH_TYPES,
  type StudioGenre,
  type StudioSearchType,
} from "./api/studio.types";

const KNOWN_TYPES: ReadonlySet<string> = new Set(STUDIO_SEARCH_TYPES);

/** The query, the filter and the genre live in the URL (`?q=`, `?type=`,
 *  `?genre=`), so a search can be shared and reloaded. A filter change, a
 *  genre change, Clear and a submitted search add a history entry, so Back
 *  walks them; typing writes the query with `isReplace`, so a half-typed word
 *  never fills the history. */
export function useStudioSearchParams() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const typeParam = searchParams.get("type") ?? "all";
  const type: StudioSearchType = KNOWN_TYPES.has(typeParam)
    ? (typeParam as StudioSearchType)
    : "all";
  const genreParam = searchParams.get("genre");
  const genre: StudioGenre | null = isStudioGenre(genreParam)
    ? genreParam
    : null;

  const update = useCallback(
    (mutate: (params: URLSearchParams) => void, isReplace: boolean) => {
      setSearchParams(
        (previous) => {
          const next = new URLSearchParams(previous);
          mutate(next);
          return next;
        },
        { replace: isReplace },
      );
    },
    [setSearchParams],
  );

  const setQuery = useCallback(
    (nextQuery: string, options?: { isReplace?: boolean }) =>
      update(
        (params) =>
          nextQuery.trim() ? params.set("q", nextQuery) : params.delete("q"),
        options?.isReplace ?? false,
      ),
    [update],
  );

  return {
    query,
    type,
    genre,
    setQuery,
    setType: (nextType: StudioSearchType) =>
      update(
        (params) =>
          nextType === "all"
            ? params.delete("type")
            : params.set("type", nextType),
        false,
      ),
    /** A history entry, like a filter change. */
    setGenre: (nextGenre: StudioGenre | null) =>
      update(
        (params) =>
          nextGenre ? params.set("genre", nextGenre) : params.delete("genre"),
        false,
      ),
    clear: () =>
      update((params) => {
        params.delete("q");
        params.delete("type");
        params.delete("genre");
      }, false),
  };
}
