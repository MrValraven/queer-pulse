import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { routes } from "../../app/routeMap";
import {
  isStudioFormat,
  isStudioGenre,
  isStudioMood,
} from "./api/studio.adapters";
import {
  STUDIO_SEARCH_TYPES,
  type StudioFormat,
  type StudioGenre,
  type StudioMood,
  type StudioSearchType,
} from "./api/studio.types";

const KNOWN_TYPES: ReadonlySet<string> = new Set(STUDIO_SEARCH_TYPES);

export type StudioSearchHrefPatch = Partial<
  Record<"q" | "type" | "genre" | "mood" | "format", string | null>
>;

/** The query, the filter, the genre and the mood live in the URL (`?q=`,
 *  `?type=`, `?genre=`, `?mood=`, `?format=`), so a search can be shared and reloaded.
 *  A filter change, a genre or mood change, Clear and a submitted search add
 *  a history entry, so Back walks them; typing writes the query with
 *  `isReplace`, so a half-typed word never fills the history. */
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
  const moodParam = searchParams.get("mood");
  const mood: StudioMood | null = isStudioMood(moodParam) ? moodParam : null;
  const formatParam = searchParams.get("format");
  const format: StudioFormat | null = isStudioFormat(formatParam)
    ? formatParam
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

  /** A link to this search with some params changed (null removes one), so
   *  a type tab, a "See all", a dropped filter and a recent term are real
   *  links that Back walks and a new tab opens. */
  const hrefWith = useCallback(
    (patch: StudioSearchHrefPatch) => {
      const next = new URLSearchParams(searchParams);
      for (const [name, value] of Object.entries(patch)) {
        if (value === undefined) continue;
        if (
          value === null ||
          value === "" ||
          (name === "type" && value === "all")
        )
          next.delete(name);
        else next.set(name, value);
      }
      const queryString = next.toString();
      return queryString
        ? `${routes.studioSearch}?${queryString}`
        : routes.studioSearch;
    },
    [searchParams],
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
    mood,
    format,
    hrefWith,
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
    /** A history entry, like a filter change. */
    setMood: (nextMood: StudioMood | null) =>
      update(
        (params) =>
          nextMood ? params.set("mood", nextMood) : params.delete("mood"),
        false,
      ),
    /** A history entry, like a filter change (Studio artist kinds). */
    setFormat: (nextFormat: StudioFormat | null) =>
      update(
        (params) =>
          nextFormat
            ? params.set("format", nextFormat)
            : params.delete("format"),
        false,
      ),
    clear: () =>
      update((params) => {
        params.delete("q");
        params.delete("type");
        params.delete("genre");
        params.delete("mood");
        params.delete("format");
      }, false),
  };
}
