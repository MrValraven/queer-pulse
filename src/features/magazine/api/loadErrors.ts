import { ApiError } from "../../../shared/api/client";

/**
 * `.catch(nullOnNotFound)` for a **primary** magazine lookup (the article, the
 * deck, the author whose page this is).
 *
 * Only a real 404 becomes `null`, which the pages render as their honest
 * "we couldn't find that piece" wall with `noIndex`. Every other failure (500,
 * timeout, offline, CSRF) is rethrown so react-query retries it, the global
 * error toast fires, and the page can show a retry state instead of telling
 * the reader that a real article does not exist. Crawlers must never see a
 * `noindex` not-found page for a live URL because of an API blip.
 */
export function nullOnNotFound(error: unknown): null {
  if (error instanceof ApiError && error.status === 404) return null;
  throw error;
}

/**
 * `.catch(ignoreEnrichmentError)` for a **secondary** lookup that only enriches
 * a page which already has its primary entity: the author bio behind a byline,
 * the "keep reading" rail, a related-decks rail.
 *
 * These degrade gracefully on purpose. A failing related-tag query must not
 * take down an article that loaded fine, so the failure resolves to `null` and
 * the page simply renders without that rail. Use `nullOnNotFound` instead for
 * anything the page cannot render without.
 */
export function ignoreEnrichmentError(): null {
  return null;
}
