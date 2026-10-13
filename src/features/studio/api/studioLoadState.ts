import { isStudioNotFound } from "./studio.api";

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
  /** The server answered 404: missing, or a draft or taken-down release
   *  for someone who does not own it. */
  isNotFound: boolean;
  retry: () => void;
}

/**
 * One rule for every Studio read. Data on screen always wins: a failed
 * "Show more" also sets `isError` on an infinite query, and that must never
 * wipe the pages already loaded. A never-loaded query that failed is gated on
 * `errorUpdateCount`, which survives React Query's reset to pending on Retry.
 */
export function studioLoadStateOf(
  query: StudioQueryLike,
  hasData: boolean,
): StudioLoadState {
  const hasFailed = query.errorUpdateCount > 0;
  const isNotFound = !hasData && hasFailed && isStudioNotFound(query.error);
  return {
    isLoading: !hasData && !hasFailed,
    isError: !hasData && hasFailed && !isNotFound,
    isRetrying: !hasData && hasFailed && query.isFetching,
    isNotFound,
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
  retry: () => {},
};
