import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { type ForumSort } from "./api/forum.api";
import { isForumSort } from "./forumPageState.helpers";

/**
 * Owns the URL-backed forum filter/sort state (`tag`, `q`, `category`, `sort`)
 * so a refresh or shared link preserves them instead of silently resetting.
 * "all"/"top" are each param's default, so they're omitted from the URL
 * entirely (never `?category=all`) — `setCat`/`setTag` still `null` the param
 * out below their default. Lifted out of `useForumPageState`.
 */
export function useForumUrlParams() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tag = searchParams.get("tag") ?? undefined;
  const q = searchParams.get("q") ?? "";
  const setParam = useCallback(
    (key: string, value: string | null) =>
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (value) next.set(key, value);
          else next.delete(key);
          return next;
        },
        { replace: true },
      ),
    [setSearchParams],
  );
  const setQ = useCallback(
    (next: string) => setParam("q", next.trim() || null),
    [setParam],
  );
  const setTag = useCallback(
    (next: string | null) => setParam("tag", next),
    [setParam],
  );

  const catParam = searchParams.get("category");
  const cat = catParam ?? "all";
  const setCat = useCallback(
    (next: string) => setParam("category", next === "all" ? null : next),
    [setParam],
  );
  const sortParam = searchParams.get("sort");
  const sort: ForumSort = isForumSort(sortParam) ? sortParam : "top";
  const setSort = useCallback(
    (next: ForumSort) => setParam("sort", next === "top" ? null : next),
    [setParam],
  );

  return {
    searchParams,
    setSearchParams,
    tag,
    setTag,
    q,
    setQ,
    cat,
    setCat,
    sort,
    setSort,
  };
}
