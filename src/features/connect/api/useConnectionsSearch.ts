import { useState } from "react";
import {
  isDebounceSettling,
  useDebouncedValue,
} from "../../../shared/hooks/useDebouncedValue";
import type { ConnectionView } from "../connections.data";
import { foldForSearch, matchesSearchTerm } from "../connectionsFilter";
import { useConnectionsList } from "./useConnectionsList";

/** How long typing must pause before the term goes to the server. Matches
 *  the connections page's own search box. */
export const CONNECTIONS_SEARCH_DEBOUNCE_MS = 250;

/** The last list the server finished answering, kept so a picker has rows to
 *  narrow while the next answer is on its way. */
interface AnsweredList {
  /** The answered term plus the slugs it returned, so the render-time update
   *  below runs once per new answer (a new term, or a page appended). */
  signature: string;
  views: ConnectionView[];
}

const NO_ANSWER_YET: AnsweredList = { signature: "", views: [] };

export interface ConnectionsSearchResult {
  /**
   * The connections to offer for the typed term. Once the server has answered
   * the current term these are its rows exactly as sent, every loaded page
   * included. While a search is pending they are the rows on hand (the last
   * answer) narrowed locally to what matches the input.
   */
  views: ConnectionView[];
  /** True while the typed term is still settling or its first page loads.
   *  Any "no results" or "no connections" verdict must wait for false. */
  isSearchPending: boolean;
  /** Another page of the current answer exists. False while pending, since
   *  the next page would belong to the previous term. */
  hasNextPage: boolean;
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
  isFetchNextPageError: boolean;
  /** The current term's first page failed. The rows already on screen for a
   *  failed next page stay put; that failure is `isFetchNextPageError`. */
  isError: boolean;
  refetch: () => void;
}

/**
 * Every accepted connection, searched on the server (`q`) once typing pauses
 * and paged through `fetchNextPage`, for a picker that must reach past the
 * first page.
 *
 * A picker that filters only the rows it was handed can offer the first page
 * alone, so a search for connection 25 reports nobody. Here the server answers
 * each term. In the gap before it does (the debounce, then the new term's
 * first page) the last answer stands in, narrowed with the same matcher the
 * demo path uses, so the list responds on every keystroke and never blanks.
 * Once the answer lands it is shown untouched: the server may match on fields
 * this client never sees.
 */
export function useConnectionsSearch(
  searchQuery: string,
): ConnectionsSearchResult {
  // A leading "@" is how members write a handle; the server haystack holds
  // the bare slug, so "@sofia" searches for "sofia".
  const trimmedSearchTerm = searchQuery.trim().replace(/^@+/, "");
  const debouncedSearchTerm = useDebouncedValue(
    trimmedSearchTerm,
    CONNECTIONS_SEARCH_DEBOUNCE_MS,
  );
  const list = useConnectionsList("all", { searchTerm: debouncedSearchTerm });
  const isLoading = list.loading;

  const [lastAnswer, setLastAnswer] = useState<AnsweredList>(NO_ANSWER_YET);
  const answerSignature = `${debouncedSearchTerm}\n${list.views
    .map((view) => view.slug)
    .join(",")}`;
  const isAnswered = !isLoading && !list.isError;
  // Adjusting state while rendering: the signature check lets this run once
  // per new answer, and React re-renders straight away with the stored list.
  if (isAnswered && lastAnswer.signature !== answerSignature) {
    setLastAnswer({ signature: answerSignature, views: list.views });
  }

  const isSearchPending =
    isLoading || isDebounceSettling(trimmedSearchTerm, debouncedSearchTerm);
  const rowsOnHand = isLoading ? lastAnswer.views : list.views;
  const foldedSearchTerm = foldForSearch(trimmedSearchTerm);
  const views = isSearchPending
    ? rowsOnHand.filter((view) => matchesSearchTerm(view, foldedSearchTerm))
    : list.views;

  return {
    views,
    isSearchPending,
    hasNextPage: !isSearchPending && list.hasNextPage,
    fetchNextPage: list.fetchNextPage,
    isFetchingNextPage: list.isFetchingNextPage,
    isFetchNextPageError: list.isFetchNextPageError,
    isError: !isSearchPending && list.isError,
    refetch: list.refetch,
  };
}
