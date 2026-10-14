import { isStudioNotFound, isStudioWithdrawn } from "./studio.api";

/** The subset of a React Query result the Studio pages branch on. */
export interface StudioQueryLike {
  errorUpdateCount: number;
  isFetching: boolean;
  error: unknown;
  refetch: () => Promise<unknown>;
}

export interface StudioLoadState {
  /** Nothing to show yet and no failure recorded. */
  isLoading: boolean;
  /** Nothing to show and at least one failed attempt. Stays true while a
   *  Retry runs, so the error panel (and the focus on its button) stays. */
  isError: boolean;
  isRetrying: boolean;
  /** The server answered 404: missing, a draft, or a persona that is gone,
   *  for someone who does not own it. */
  isNotFound: boolean;
  /** The server answered 410 `studio_release_withdrawn`: our team took the
   *  release down. The page shows the withdrawn view at the same URL. */
  isWithdrawn: boolean;
  retry: () => void;
}

/**
 * One rule for every Studio read. Data on screen always wins: a failed
 * "Show more" also sets `isError` on an infinite query, and that must never
 * wipe the pages already loaded. A never-loaded query that failed is gated on
 * `errorUpdateCount`, which survives React Query's reset to pending on Retry.
 * The global retry rule never repeats a 4xx, so a 404 or 410 lands at once.
 */
export function studioLoadStateOf(
  query: StudioQueryLike,
  hasData: boolean,
): StudioLoadState {
  const hasFailed = query.errorUpdateCount > 0;
  const hasNothing = !hasData && hasFailed;
  const isWithdrawn = hasNothing && isStudioWithdrawn(query.error);
  const isNotFound =
    hasNothing && !isWithdrawn && isStudioNotFound(query.error);
  return {
    isLoading: !hasData && !hasFailed,
    isError: hasNothing && !isNotFound && !isWithdrawn,
    isRetrying: hasNothing && query.isFetching,
    isNotFound,
    isWithdrawn,
    retry: () => {
      void query.refetch();
    },
  };
}

/** A query a page cannot even ask (a live link with no id). */
export const STUDIO_NOT_FOUND_STATE: StudioLoadState = {
  isLoading: false,
  isError: false,
  isRetrying: false,
  isNotFound: true,
  isWithdrawn: false,
  retry: () => {},
};
